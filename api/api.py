from flask import Flask, request, jsonify, session, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api, Resource, reqparse, abort
from flask_session import Session
import json
from db import query
import time
import numpy as np
from shapely.geometry import Point
from shapely.geometry.polygon import Polygon
from shapely.geometry.multipolygon import MultiPolygon
from shapely.ops import unary_union


app = Flask(__name__)

app.config['SECRET_KEY'] = 'mysecret'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite3'
app.config['SESSION_TYPE'] = "sqlalchemy"

db = SQLAlchemy(app)
app.config['SESSION_SQLALCHEMY'] = db
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True

sess = Session(app)

# db.create_all()

def custom_error(status_code, message):
    return make_response(jsonify({"message": message}), status_code)

# @app.route('/set/test/<string:value>')
# def set_test(value):
#     session['test'] = {value: {}}
#     return value
#
# @app.route('/get/test/<string:value>')
# def get_test(value):
#     return session.get("test")[value]



set_user_search_parser = reqparse.RequestParser()
set_user_search_parser.add_argument('searchRegions')
set_user_search_parser.add_argument('searchKey')

get_user_search_parser = reqparse.RequestParser()

def abort_if_key_NOT_exists(searchKey):
    if session.get(searchKey) is None:
        return custom_error(400, "the specified search name does not yet exist")
    return False

def abort_if_key_exists(searchKey):
    if session.get(searchKey) is not None:
        return custom_error(400, "a search with this name already exists")
    return False

# gets called by any endpoint that needs to return a coordinate to be used in the next search.
def chooseNextSearch(unsearchedCoords, searchedCoords, searchRegions):
    # uses the search region as a boundry, and selects from the unsearched points.
    pass


def polygonizeSelfIntersects(polygon):
    be = polygon.exterior
    mls = be.intersection(be)
    polygons = polygonize(mls)
    return polygons

def cleanPolygons(searchRegions):
    searchPolygons = []
    for region in searchRegions:
        regionPoly = Polygon(region)
        if not regionPoly.is_valid:
            print("self intersect found")
            split_polys = polygonizeSelfIntersects(regionPoly)
            searchPolygons.extend(split_polys)
        else:
            searchPolygons.append(regionPoly)

    searchPolygons = unary_union(searchPolygons)
    return searchPolygons

def makeGrid(searchRegions):
    polys = MultiPolygon(searchRegions)
    resolution = 1
    LAT_CONVERSION = 69
    LON_CONVERSION = 54.6
    latStep = 1/(LAT_CONVERSION/resolution)
    lonStep = 1/(LON_CONVERSION/resolution)
    output = {"multipolygon": polys, "unsearched": [], "searched": []}
    xmin, ymin, xmax, ymax = polys.bounds
    x = np.arange(xmin, xmax, lonStep)
    y = np.arange(ymin, ymax, latStep)

    # add border to searched points -- probably not needed
    # top = [(xCoord, ymax) for xCoord in x]
    # bottom = [(xCoord, ymin) for xCoord in x]
    # left = [(xmin, yCoord) for yCoord in y]
    # right = [(xmax, yCoord) for yCoord in y]
    # border = MultiPoint(top + bottom + left + right)

    points = MultiPoint(np.transpose([np.tile(x, len(y)), np.repeat(y, len(x))]))

    output["searched"] = points.difference(polys)
    for p in polys:
        xmin, ymin, xmax, ymax = p.bounds  # -4.85674599573635, 37.174925051829, -4.85258684662671, 37.1842384372115

        # x = np.arange(xmin, xmax, lonStep)  # array([-4.857, -4.856, -4.855, -4.854, -4.853])
        # y = np.arange(ymin, ymax, latStep)  # array([37.174, 37.175, 37.176, 37.177, 37.178, 37.179, 37.18 , 37.181, 37.182, 37.183, 37.184, 37.185])
        # points = MultiPoint(np.transpose([np.tile(x, len(y)), np.repeat(y, len(x))]))
        # print(points)
        gridPoly = {"polygon": p, "points": points.intersection(p)}
        output["unsearched"].append(gridPoly)
    return output

@app.route('/setUserSearch', methods=['POST'])
def set_user_search():

    args = request.json
    if "searchKey" not in args or "searchRegions" not in args:
        return custom_error(400, "searchKey and searchRegions are required inputs")

    searchKey = args["searchKey"]
    searchRegions = args["searchRegions"]
    print("")
    print("")
    print(searchRegions)
    print("")
    print("")

    # error = abort_if_key_exists(searchKey)
    # if error:
    #     return error

    # for region in searchRegions:


    maxX = float("-inf")
    minX = float("inf")
    maxY = float("-inf")
    minY = float("inf")
    polys = []

    for region in searchRegions:
        polys.append(Polygon(region))
        for point in region:
            maxX = point[0] if point[0] > maxX else maxX
            maxY = point[1] if point[1] > maxY else maxY

            minX = point[0] if point[0] < minX else minX
            minY = point[1] if point[1] < minY else minY
    #
    resolution = .1
    # topRight = (maxX, maxY)
    # bottomLeft = (minX, minY)
    # unionedPolys = unary_union(polys)
    # unionedPolys = unionedPolys if isinstance(unionedPolys, list) else [unionedPolys]
    # print(list(unionedPolys[0].exterior.coords))
    polygon = MultiPolygon(unionedPolys)


    # print("unionedPolys:", polygon.contains(Point(-71.31497353789433, 42.3770134669321)))

    LAT_CONVERSION = 69
    LON_CONVERSION = 54.6

    xBase = [minX]
    yBase = [minY]

    latDelta = 1/(LAT_CONVERSION/resolution)
    lonDelta = 1/(LON_CONVERSION/resolution)

    while xBase[-1] < maxX:
        xBase.append(xBase[-1]+lonDelta)

    while yBase[-1] < maxY:
        yBase.append(yBase[-1] +latDelta)

    xBase = np.array(xBase)
    yBase = np.array(yBase)

    xx, yy = np.meshgrid(xBase, yBase)

    unsearchedCoords = []
    for i, row in enumerate(xx):
        for j, element in enumerate(row):
            if polygon.contains(Point(element, yy[i][j])):
                unsearchedCoords.append((element, yy[i][j]))

    print("run")

    session[searchKey] = {"searchRegions": searchRegions, "unsearchedCoords": unsearchedCoords, "searchedCoords": []}
    return jsonify(session.get(searchKey))


@app.route('/getUserSearch/<string:searchKey>', methods=['GET'])
def get_user_search(searchKey):
    args = get_user_search_parser.parse_args()
    if "searchKey" not in args:
        return custom_error(400, "searchKey is a required input")

    error = abort_if_key_NOT_exists(searchKey)
    if error:
        return error

    return session.get(searchKey)




@app.route('/set/search_region')
def set_search_region(value):
    session['search_region'] = value
    return value

@app.route('/set/searched_coords')
def set_searched_coords(value):
    session['searched_coords'] = value
    return value

@app.route('/set/unsearched_coords')
def set_unsearched_coords(value):
    session['unsearched_coords'] = value
    return value



@app.route('/get/search_region')
def get_search_region():
    return session.get("search_region")

@app.route('/get/searched_coords')
def get_searched_coords():
    return session.get("searched_coords")

@app.route('/get/unsearched_coords')
def get_unsearched_coords():
    return session.get("unsearched_coords")



# app = Flask(__name__)
# api = Api(app)




# class Test(Resource):
#     def put(self):
#         json_data = request.get_json(force=True)
#         print(json_data)
#         return json_data
#
#     def get(self):
#         results = query("Select * from sessions", [])
#         return results
#
#     def post(self):
#         json_data = request.get_json(force=True)
#         print(json_data)
#         data = json_data['data']
#         return jsonify(dataOut=data)
#
# class Session(Resource):
#     def get(self, key):
#         print(key.split("|"))
#         results = query("Select * from sessions where sessionID=? and salt=? and user=?", key.split("-"))
#         print("results:", results)
#         return {"data": results["returned"][0]}
#
#     # used to issue a new sessionID.  This happens only when a user clears their results from the
#     # browser and restarts a new search.  The key returned by this endpoint
#     # is unique to the user, and can be used to fetch past results or continue from an
#     # old search.
#     def post(self):
#         json_data = request.get_json(force=True)
#         name = json_data["name"]
#         regions = json.dumps(json_data["regions"])
#         newSessionID = query("INSERT INTO sessions (user, regions) VALUES(?, ?)", [name, regions])['lastRowID']
#         results = query("Select * from sessions where sessionID=?", [newSessionID])['returned'][0]
#         return jsonify(userKey=results)
#
#
# class Searches(Resource):
#     def get(self):
#         return {"data": [7, 8, 9]}
#
#     def post(self):
#         json_data = request.get_json(force=True)
#         data = json_data['data']
#
#         return jsonify(dataOut=data)
#
# class Archive(Resource):
#     def get(self):
#         return {"data": [7, 8, 9]}
#
#     def post(self):
#         json_data = request.get_json(force=True)
#         data = json_data['data']
#
#         return jsonify(dataOut=data)
#
#
# class sessionProgress(Resource):
#     def get(self):
#         return {"data": [7, 8, 9]}
#
#     def post(self):
#         json_data = request.get_json(force=True)
#         data = json_data['data']
#
#         return jsonify(dataOut=data)
#
# api.add_resource(Test, "/test")
# api.add_resource(Session, "/session", "/session/<string:key>")
# api.add_resource(Searches, "/searches")
# api.add_resource(Archive, "/archive")
# api.add_resource(sessionProgress, "/sessionprogress")
