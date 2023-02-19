"""Routes for API."""
from flask import Blueprint, request, make_response
from flask import current_app as app
from .models import db, SearchID
from .utils import makeGrid, knn, cleanPolygons, redis_save, redis_get, checksum, custom_error
from shapely.geometry import MultiPoint, mapping, shape, asShape
from shapely.geometry.polygon import Polygon
import json

# Blueprint Configuration
api_bp = Blueprint(
    'api_bp', __name__
)

# load new search
@api_bp.route('/api/searchSession', methods=['POST'])
def set_user_search():
    args = request.json
    searchRegions = args["searchRegions"]

    # returns shapely geometries
    output = makeGrid(searchRegions, float(args["coordinateResolution"]))

    s = output["searchedCoords"].__geo_interface__["coordinates"]
    us = output["unsearchedCoords"].__geo_interface__["coordinates"]

    # sklearn KNN
    furthestNearest = knn(s, us)

    assert not args["searchID"]
    new_search = SearchID()
    db.session.add(new_search)  # Adds new User record to database
    db.session.commit()  # Commits all changes
    searchID = new_search.id

    assert redis_save(searchID, s, us)

    return {
        "searchedCoords": s,
        "unsearchedCoords": us,
        "furthestNearest": [*furthestNearest],
        "searchID": searchID,
        "border": output["shape"]
        }

# incremental search
@api_bp.route('/api/searchSession', methods=['PUT'])
def get_next_search():
    args = request.json
    searchID = args["searchID"]

    try:
        searchID = args["searchID"]
        clientChecksum = args["checksum"]
        data = redis_get(searchID)
        serverChecksum = checksum(data)

        if serverChecksum != clientChecksum:
            return custom_error(409, "Server data out of sync with client, please refresh data.")
    except:
        return custom_error(500, "Internal data error.")

    unsearchedPoints = MultiPoint(data["unsearched"])
    circle_border = Polygon(args["circleCoordinates"])
    newlySearchedCoordinates = []

    unsearched_new = []
    for p in unsearchedPoints:
        if not circle_border.contains(p):
            unsearched_new.append(p.__geo_interface__["coordinates"])
        else:
            newlySearchedCoordinates.append(p.__geo_interface__["coordinates"])

    circleCoordinates = args["circleCoordinates"] if args["circleCoordinates"] else []
    searched_new = list(data["searched"]) + circleCoordinates
    furthestNearest = knn(searched_new, unsearched_new)

    redis_save(searchID, searched_new, unsearched_new)
    return {
        "center": furthestNearest,
        "unsearched": unsearched_new,
        "searched": searched_new,
        "newlySearchedCoordinates": newlySearchedCoordinates
    }

@api_bp.route('/api/loadSearch', methods=['PUT'])
def load_search():
    args = request.json
    try:
        assert all(key in args for key in ["searchID", "searched", "unsearched"])
        redis_save(args["searchID"], args["searched"], args["unsearched"])
        return json.dumps({'success':True}), 200, {'ContentType':'application/json'}
    except:
        return json.dumps({'success':False}), 400, {'ContentType':'application/json'}
