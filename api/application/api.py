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

@api_bp.route('/api/searchSession', methods=['POST'])
def set_user_search():
    '''
    Creates a new searchID, a coordinate plane that covers the geometries provieded
    by the searchRegions argument, and a set of searched coordinates formed by the border 
    of the provided geometries.  Together, these variables form the data needed to automate the 
    placement of Google Places API NearbySearch requests.

    url parameters
    --------------
    searchRegions: a list of lists, with each sublist containing the ordered vertices of 
    a polygon to be searched.  The first and last vertices in each sublist should match 
    to indicate this as the starting / ending vertex.

    coordinateResolution: this is the distance in miles between each point within the produced coordinate plane.

    searchID: Optional. This parameter will be used to check if an ID already exists within the database.
    If a matching ID is found, then the function will abort.

    Returns
    -------
    searchedCoords: list of coordinates that fall on the border of the search regions supplied.
    unsearchedCoords: list of unsearched coordinates.
    furthestNearest: list of length 2, containing longitude and latitude of a single point,
    searchID: new ID assigned to the search session.
    '''

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
        }

# incremental search
@api_bp.route('/api/searchSession', methods=['PUT'])
def get_next_search():
    '''
    Uses the perimeter coordinates from a google nearbySearch conducted by the client 
    to mark coordinates as searched within the coordinate plane associated with a search session 
    ID.  It returns the next best coordinate to be searched using the google places api.
    If there is a hash mismatch or cache miss, a 409 error is returned so the client can 
    refresh the server redis cache with client search data.

    url parameters
    --------------
    circleCoordinates: a list of coordinates that constitute the perimeter of the last search radius produced 
    by a call to google places api nearbySearch.

    checksum: md5 hash of the searched and unsearched coordinates stored on the client.

    searchID: ID of the search session being conducted by the client.  The ID is originally issued 
    by the server and used to organize the server redis cache.

    Returns
    -------
    center: the next coordinate the will be used to call google places api nearbySearch.
    unsearched: updated list of unsearched coordinates.
    circleCoordinates: the perimeter coordinates of the last google places api nearbySearch.
    '''

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

    # future change:
    # can easily check if coordinates are in bounding box before comparing to circle.
    unsearched_new = [p.__geo_interface__["coordinates"] for p in unsearchedPoints if not circle_border.contains(p)]

    circleCoordinates = args["circleCoordinates"] if args["circleCoordinates"] else []
    searched_new = list(data["searched"]) + circleCoordinates
    furthestNearest = knn(searched_new, unsearched_new)
    redis_save(searchID, searched_new, unsearched_new)
    return {
        "center": furthestNearest,
        "unsearched": unsearched_new,
        "circleCoordinates": circleCoordinates,
    }

@api_bp.route('/api/loadSearch', methods=['PUT'])
def load_search():
    '''
    Takes the local state of a search session from the client for a given searchID and overwrites 
    the redis cache data for this searchID with the provided data.

    url parameters
    --------------
    searchID: ID of the search session associated with the data provided to the endpoint.
    searched: list of searched coordinates.
    unsearched: list of unsearched coordinates.

    returns
    -------
    200: successfully updated redis cache.
    400: failed to update redis cache.
    '''
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