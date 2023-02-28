"""Routes for API."""
from flask import Blueprint, request, make_response
from flask import current_app as app
from .models import db, SearchID
from .utils import makeGrid, knn, cleanPolygons, redis_save, redis_get, checksum, custom_error
from shapely.geometry import MultiPoint, mapping, shape, asShape
from shapely.geometry.polygon import Polygon
import json
from datetime import datetime

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
        print("arg parse")
        print(datetime.now())
        searchID = args["searchID"]
        clientChecksum = args["checksum"]
        print(datetime.now())
        print("")
        print("redis get")
        print(datetime.now())
        data = redis_get(searchID)
        print(datetime.now())
        print("")
        print("checksum gen")
        print(datetime.now())
        serverChecksum = checksum(data)
        print(datetime.now())

        if serverChecksum != clientChecksum:
            return custom_error(409, "Server data out of sync with client, please refresh data.")
    except:
        return custom_error(500, "Internal data error.")

    print("")
    print("multipoint")
    print(datetime.now())
    unsearchedPoints = MultiPoint(data["unsearched"])
    circle_border = Polygon(args["circleCoordinates"])
    newlySearchedCoordinates = []
    print(datetime.now())

    print("")
    print("point in circle")
    print(datetime.now())
    unsearched_new = [p.__geo_interface__["coordinates"] for p in unsearchedPoints if not circle_border.contains(p)]

    # # testing above lambda implementation.  removes creation of newlySearchedCoordinates, but I believe this isn't needed anyway.
    # unsearched_new = []
    # for p in unsearchedPoints:
    #     if not circle_border.contains(p):
    #         unsearched_new.append(p.__geo_interface__["coordinates"])
    #     else:
    #         newlySearchedCoordinates.append(p.__geo_interface__["coordinates"])

    print(datetime.now())

    circleCoordinates = args["circleCoordinates"] if args["circleCoordinates"] else []
    print("")
    print("list conversion")
    print(datetime.now())
    searched_new = list(data["searched"]) + circleCoordinates
    print(datetime.now())
    print("")
    print("knn")
    print(datetime.now())
    furthestNearest = knn(searched_new, unsearched_new)
    print(datetime.now())

    print("")
    print("redis save")
    print(datetime.now())
    redis_save(searchID, searched_new, unsearched_new)
    print(datetime.now())
    return {
        "center": furthestNearest,
        "unsearched": unsearched_new,
        "searched": searched_new,
        "newlySearchedCoordinates": []
        # "newlySearchedCoordinates": newlySearchedCoordinates
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

# # test endpoint
# @api_bp.route('/test', methods=['GET'])
# def test():
#     return {test: 'test 1'}

# # endpoint in development for validating changes to how data is transmitted between client and api.
# @api_bp.route('/checksum', methods=['GET'])
# def getChecksum():
#     print(request)
#     hash = request.args.get('hash')
#     searchID = request.args.get('searchID')
#     print(hash)
#     print(searchID)
#     data = redis_get(searchID)
#     serverChecksum = checksum(data)
#     return {'checksum': serverChecksum}