from flask import Flask, request, jsonify, session, make_response, abort
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
from shapely.geometry import MultiPoint, mapping, shape, asShape
from coordinateFunctions import makeGrid, knn
from fiassKnn import FaissKNeighbors
# from sessionDataManager import initData, getSearchedCoords, getUnsearchedCoords, saveDataToFile
import matplotlib.pyplot as plt
import geopandas as gpd
import time
import redis
import pickle
import bz2
import js2py
import hashlib
import shapely.speedups
shapely.speedups.enable()

r = redis.Redis(host= 'localhost',port= '6379')
#
# redis.set('mykey', 'Hello from Python!')
# value = redis.get('mykey')
# print(value)
#
# redis.zadd('vehicles', {'car' : 0})
# redis.zadd('vehicles', {'bike' : 0})
# vehicles = redis.zrange('vehicles', 0, -1)
# print(vehicles)
# 'AIzaSyBhJRgpD2FTMa8_q68645LQRb2qNVD6wlE'



app = Flask(__name__)
app.config['SECRET_KEY'] = 'mysecret'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///searches.sqlite3'
# app.config['SESSION_TYPE'] = "sqlalchemy"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
# app.config['SESSION_SQLALCHEMY'] = db

# sess = Session(app)

# db.create_all()
# RESOLUTION = 1
# LAT_CONVERSION = 69
# LON_CONVERSION = 54.6
# LATSTEP = 1/(LAT_CONVERSION/RESOLUTION)
# LONSTEP = 1/(LON_CONVERSION/RESOLUTION)


def custom_error(status_code, message):
    return make_response(jsonify({"message": message}), status_code)

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


def checksum(obj):
    JSON = js2py.eval_js('JSON')
    # msg = JSON.stringify(dictionary["1"]["searched"]);
    msg = JSON.stringify(obj);
    msg = msg.encode(encoding='utf-8')
    hash = hashlib.md5(msg)
    return hash.hexdigest()


# loads an existing search from a user file.
# might be useable to add regions to existing search by modifying the
# user data file to include a new set of points.
@app.route('/loadSearch', methods=['POST'])
def load_search():
    print("running loadSearch")
    args = request.json
    try:
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
@app.route('/setUserSearch', methods=['POST'])
def set_user_search():
    print("running setUserSearch")
    args = request.json
    print(args)
    searchRegions = args["searchRegions"]
    print("")
    print("")
    print(args["searchRegions"])
    print("")
    print("")
    print(args["searchID"])
    print("")
    print("")

    # returns shapely geometries
    output = makeGrid(searchRegions, float(args["coordinateResolution"]))

    s = output["searchedCoords"].__geo_interface__["coordinates"]
    us = output["unsearchedCoords"].__geo_interface__["coordinates"]

    # Fiass KNN
    # knn = FaissKNeighbors()
    # knn.fit(s, us)
    # furthestNearest = knn.predict(us)

    # sklearn KNN
    furthestNearest = knn(s, us)

    # add error if searchID is found.  Seting a search should always be net new.
    assert not args["searchID"]
    searchID = query('''insert into searchIDs values(Null)''', [])
    assert redis_save(searchID["lastRowID"], s, us)

    print("-- searchID", searchID)

    return {
        "searchedCoords": s,
        "unsearchedCoords": us,
        "furthestNearest": [*furthestNearest],
        "searchID": searchID,
        "border": output["shape"]
        }


# used for each google api call.
@app.route('/getNextSearch', methods=['POST'])
def get_next_search():
    args = request.json
    searchID = args["searchID"]
    print(args["circleCoordinates"])


    try:
        searchID = args["searchID"]
        clientChecksum = args["checksum"]
        print("")
        print("clientChecksum")
        print(clientChecksum)
        data = redis_get(searchID)
        serverChecksum = checksum(data)
        print("")
        print("serverChecksum")
        print(serverChecksum)
        if serverChecksum != clientChecksum:
            # return {"checksumStatus": -1}
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

    print(" ")
    print(" ")
    print("unsearched_new")
    print(unsearched_new)


    # start = time.process_time()
    # knn = FaissKNeighbors()
    # knn.fit(searched_new, unsearched_new)
    # furthestNearest = knn.predict(unsearched_new)

    furthestNearest = knn(searched_new, unsearched_new)

    redis_save(searchID, searched_new, unsearched_new)
    return {
        "center": furthestNearest,
        "unsearched": unsearched_new,
        "searched": searched_new,
        "newlySearchedCoordinates": newlySearchedCoordinates
    }




@app.route('/getUserSearch/<string:searchKey>', methods=['GET'])
def get_user_search(searchKey):
    args = get_user_search_parser.parse_args()
    if "searchKey" not in args:
        return custom_error(400, "searchKey is a required input")

    error = abort_if_key_NOT_exists(searchKey)
    if error:
        return error

    return {"true": True}
