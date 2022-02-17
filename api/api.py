from flask import Flask, request, jsonify, session, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api, Resource, reqparse, abort
from flask_session import Session
import json
from db import query
import time
import math
import numpy as np
from shapely.geometry import Point
from shapely.geometry.polygon import Polygon
from shapely.geometry.multipolygon import MultiPolygon
from shapely.ops import unary_union
from shapely.ops import polygonize
from shapely.geometry import MultiPoint
from coordinateFunctions import makeGrid, knn, flatToMatrixIndex
from sessionDataManager import initData, getSearchedCoords, getUnsearchedCoords, saveDataToFile
import matplotlib.pyplot as plt


app = Flask(__name__)
app.config['SECRET_KEY'] = 'mysecret'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite3'
app.config['SESSION_TYPE'] = "sqlalchemy"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
app.config['SESSION_SQLALCHEMY'] = db

sess = Session(app)

# db.create_all()
# RESOLUTION = 1
# LAT_CONVERSION = 69
# LON_CONVERSION = 54.6
# LATSTEP = 1/(LAT_CONVERSION/RESOLUTION)
# LONSTEP = 1/(LON_CONVERSION/RESOLUTION)


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


# @app.route('/get/test', methods=['POST'])

def getAdjacent(r, c, rows, columns):
    #           right  left    down
    options = [(0,1), (0,-1), (-1,0), (1,0)]
    adjacent = []
    for opt in options:
        rowOffset = opt[0]
        colOffset = opt[1]

        if 0 <= r + rowOffset < rows and 0 <= c + colOffset < columns:
            adjacent.append((r + rowOffset, c + colOffset))
    # adjacent = [(r+o[0], c+o[1]) for o in options if r+o[0] < rows and c+o[1] < columns]
    return adjacent


def bfsFlipNodes(center, maxDist, searchKey):
    searchCoordsList = getSearchedCoords(searchKey)
    unsearchedData = getUnsearchedCoords(searchKey)

    # used to lookup the index within the coord matrix
    unsearchedCoordsMap = unsearchedData["matrixMap"]
    coordsMatrix = unsearchedData["unsearchedCoordsMatrix"]


    # print("unsearchedCoordsMap", unsearchedCoordsMap.keys())
    # print("center", center)
    # print(unsearchedCoordsMap[tuple(center)])
    # print(coordsMatrix[0])
    matrixIndex = flatToMatrixIndex(17, coordsMatrix)
    # print("matrix index", matrixIndex)
    # print("matrix value", coordsMatrix[matrixIndex[0]][matrixIndex[1]])
    q = [matrixIndex]
    d = 0
    nodesInCircle = []
    while q:
        curNodeKey = q.pop(0)
        curNode = coordsMatrix[curNodeKey[0]][curNodeKey[1]]
        # curNodeMatrixIndex = unsearchedCoordsMap[curNodeKey]

        adjacent = getAdjacent(curNodeKey[0], curNodeKey[1], len(coordsMatrix), len(coordsMatrix[0]))

        # adjacent = [node for node in curNode["adjacent"].values() if node is not None]

        print("adjacent", adjacent)
        # for n in adjacent:
        #     print("dist input", center, n)
        #     if math.dist(center, n) < maxDist and coordsMatrix[n[0]][n[1]]:
        #         q.append(n)

    #     # curNode["status"] = 1
    #     nodesInCircle.append(curNodeKey)
    # print("nodesInCircle", nodesInCircle)

# def bfsFlipNodes(center, maxDist, searchSession):
#     q = [tuple(center)]
#     d = 0
#     nodesInCircle = []
#     while q:
#         curNodeKey = q.pop(0)
#         curNode = unsearchedCoordsMap[curNodeKey]
#         adjacent = [node for node in curNode["adjacent"].values() if node is not None]
#         print("adjacent", adjacent)
#         for n in adjacent:
#             print("dist input", center, n)
#             if math.dist(center, n) < maxDist and curNode["status"] == 0:
#                 q.append(n)
#
#         curNode["status"] = 1
#         nodesInCircle.append(curNodeKey)
#     print(nodesInCircle)

@app.route('/get/test')
def get_test():
    # s = session.get("1234512")
    searchKey = "1234512"
    searchedPoints = np.array(getSearchedCoords(searchKey))
    unsearchedData = getUnsearchedCoords(searchKey)
    nextPoint = knn(searchedPoints, unsearchedData)
    print(nextPoint)
    print(unsearchedData["unsearchedCoordsMatrix"][nextPoint[0]][nextPoint[1]])
    # bfsFlipNodes(nextPoint, .1, "1234512")
    return {"test": "True"}

    # args = request.json
    # if "searchKey" not in args or "searchRegions" not in args:
    #     return custom_error(400, "searchKey and searchRegions are required inputs")
    #
    # searchKey = args["searchKey"]
    # searchRegions = args["searchRegions"]
    #
    # output = makeGrid(searchRegions)
    # fig, ax = plt.subplots()
    #
    # xus, yus = zip(*output["unsearchedCoordinates"])
    #
    # ax.scatter(xus, yus)
    # xs, ys = zip(*output["searchedCoordinates"])
    #
    # ax.scatter(xs, ys)
    #
    # plt.show()
    # return {"test": "True"}

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
# def chooseNextSearch(unsearchedCoords, searchedCoords, searchRegions):
#     # uses the search region as a boundry, and selects from the unsearched points.
#     pass

def chooseNextSearch(searchKey):
    # uses the search region as a boundry, and selects from the unsearched points.
    searchState = session.get(searchKey)
    unsearchedCoordinates = searchState["unsearchedCoordinates"]
    searchedCoordinates = searchState["searchedCoordinates"]
    pass

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

    output = makeGrid(searchRegions)
    initData(searchKey, output)
    saveDataToFile()
    return {"test": "True"}
    # return jsonify(session.get(searchKey))


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
