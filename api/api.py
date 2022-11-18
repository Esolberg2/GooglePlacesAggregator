from flask import Flask, request, jsonify, session, make_response, abort
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api, Resource, reqparse, abort
from flask_session import Session
import json
from db import query
import time
import math
from shapely.geometry import Point
from shapely.geometry.polygon import Polygon
from shapely.geometry.multipolygon import MultiPolygon
from shapely.ops import unary_union
from shapely.ops import polygonize
from shapely.geometry import MultiPoint, mapping, shape, asShape
from coordinateFunctions import makeGrid, knn, cleanPolygons
import time
import redis
import pickle
import bz2
import js2py
import hashlib
import shapely.speedups
import os
import sentry_sdk
from sentry_sdk.integrations.flask import FlaskIntegration
shapely.speedups.enable()

sentry_sdk.init(
    dsn="https://483ee48988984933820429864e92324f@o1317699.ingest.sentry.io/6570904",
    integrations=[
        FlaskIntegration(),
    ],

    # Set traces_sample_rate to 1.0 to capture 100%
    # of transactions for performance monitoring.
    # We recommend adjusting this value in production.
    traces_sample_rate=0
)


# r = redis.Redis(host= 'redis',port= '6379')
r = redis.Redis(host= 'localhost',port= '6379')

print("redis connection", r)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'mysecret'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///searches.sqlite3'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

def custom_error(status_code, message):
    return make_response(jsonify({"message": message}), status_code)

def checksum(obj):
    JSON = js2py.eval_js('JSON')
    msg = JSON.stringify(obj);
    msg = msg.encode(encoding='utf-8')
    hash = hashlib.md5(msg)
    return hash.hexdigest()


# loads an existing search from a user file.
# might be useable to add regions to existing search by modifying the
# user data file to include a new set of points.
@app.route('/api/loadSearch', methods=['PUT'])
def load_search():
    print("running loadSearch")
    args = request.json
    try:
        assert all(key in args for key in ["searchID", "searched", "unsearched"])
        redis_save(args["searchID"], args["searched"], args["unsearched"])
        return json.dumps({'success':True}), 200, {'ContentType':'application/json'}
    except:
        return json.dumps({'success':False}), 400, {'ContentType':'application/json'}

def redisEncode(obj):
    pickled_object = pickle.dumps(obj)
    bz2Obj = bz2.compress(pickled_object)
    return bz2Obj

def redisDecode(obj):
    bz2ObjDecom = bz2.decompress(obj)
    pickled_object_decom = pickle.loads(bz2ObjDecom)
    return pickled_object_decom

def redis_save(searchID, searched, unsearched):
    r.set(str(searchID), redisEncode({"searched": searched, "unsearched": unsearched}))
    return True

def redis_get(searchID):
    return redisDecode(r.get(str(searchID)))


# only used for brand new searches
@app.route('/api/searchSession', methods=['POST'])
def set_user_search():
    args = request.json
    searchRegions = args["searchRegions"]

    # returns shapely geometries
    output = makeGrid(searchRegions, float(args["coordinateResolution"]))

    s = output["searchedCoords"].__geo_interface__["coordinates"]
    us = output["unsearchedCoords"].__geo_interface__["coordinates"]

    # sklearn KNN
    furthestNearest = knn(s, us)

    # add error if searchID is found.  Seting a search should always be net new.
    assert not args["searchID"]
    searchID = query('''insert into searchIDs values(Null)''', [])
    print("------------    got this far --------------")
    assert redis_save(searchID["lastRowID"], s, us)
    print("------------    redis worked ---------------")
    print("searchID", searchID)
    return {
        "searchedCoords": s,
        "unsearchedCoords": us,
        "furthestNearest": [*furthestNearest],
        "searchID": searchID,
        "border": output["shape"]
        }


# used for each google api call.
@app.route('/api/searchSession', methods=['PUT'])
def get_next_search():
    args = request.json
    searchID = args["searchID"]


    try:
        searchID = args["searchID"]
        print("searchID", searchID)
        clientChecksum = args["checksum"]

        data = redis_get(searchID)
        serverChecksum = checksum(data)

        if serverChecksum != clientChecksum:
            print("----- checksum error")
            return custom_error(409, "Server data out of sync with client, please refresh data.")
    except:
        print("----- internal data error")
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


@app.route('/api/mergePolygons', methods=['PUT'])
def merge_polygons():
    args = request.json
    searchRegions = args["searchRegions"]
    searchedAreas = args["searchedAreas"]
    budgetUsed = args["budgetUsed"]

    searchedAreasPoly = [Polygon(poly) for poly in searchedAreas]
    searchRegionsPoly = [Polygon(poly) for poly in searchRegions]
    areasPlusRegions = searchedAreasPoly + searchRegionsPoly

    minSearchArea = min(searchedAreasPoly, key=lambda p: p.area)

    searchedAreasMultiPoly = MultiPolygon(searchedAreasPoly)
    searchRegionsMultiPoly = MultiPolygon(searchRegionsPoly)
    areasPlusRegionsMultiPoly = MultiPolygon(areasPlusRegions)

    searchRegionsFootprint = cleanPolygons(searchRegionsMultiPoly)
    projectedNaiveSearchCost = (searchRegionsFootprint.area / minSearchArea.area) * 2.6 * 0.032

    #1
    totalSearchedAreas = searchedAreasMultiPoly

    #2
    totalSearchedAreasFootprint = cleanPolygons(searchedAreasMultiPoly)

    #3
    duplicateSearchArea = totalSearchedAreas.area - totalSearchedAreasFootprint.area

    #4
    areasPlusRegionsMultiPolyFootprint = cleanPolygons(areasPlusRegionsMultiPoly)

    #5
    totalSearchRegionFootprint = cleanPolygons(searchRegionsMultiPoly)

    #6
    footprintOfSearchAreaOverage = areasPlusRegionsMultiPolyFootprint.area - totalSearchRegionFootprint.area
    #

    totalMiss = duplicateSearchArea + footprintOfSearchAreaOverage
    totalHit = totalSearchedAreas.area - totalMiss
    efficiency = totalHit / totalSearchedAreas.area

    # projectedSearchCost = (totalSearchRegionFootprint.area / (totalHit / len(searchedAreas))) * 0.032
    projectedSearchCost = float(budgetUsed) + (((totalSearchRegionFootprint.area - totalHit) / (totalHit / len(searchedAreas))) * 0.032)


    return {
        "efficiency": efficiency,
        "projectedNaiveSearchCost": projectedNaiveSearchCost,
        "projectedSearchCost": projectedSearchCost,
        "areaPerHit": totalHit / len(searchedAreas),
        "totalSearchedAreasFootprint": totalSearchRegionFootprint.area,
        "projectedSavings": projectedNaiveSearchCost - projectedSearchCost
        }

@app.route('/api/test', methods=['GET'])
def test_api():
    return {
    "test": 1/0,
    }
# @app.route('/api/test', methods=['GET'])
# def test_api():
#     # return {"time": time.time()}
#     root = os.listdir()
#
#     paths = ['../', './app', './dbVol', './app/dbVol']
#     out = []
#     for path in paths:
#         try:
#             out.append(os.listdir(path))
#         except:
#             out.append("failed")
#
#     return {
#     "root": root,
#     "parent": out[0],
#     "app": out[1],
#     "dbVol": out[2],
#     "app/dbVol": out[3]
#     }
