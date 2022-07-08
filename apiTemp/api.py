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
@app.route('/loadSearch', methods=['PUT'])
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
@app.route('/searchSession', methods=['POST'])
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
    assert redis_save(searchID["lastRowID"], s, us)


    return {
        "searchedCoords": s,
        "unsearchedCoords": us,
        "furthestNearest": [*furthestNearest],
        "searchID": searchID,
        "border": output["shape"]
        }


# used for each google api call.
@app.route('/searchSession', methods=['PUT'])
def get_next_search():
    args = request.json
    searchID = args["searchID"]


    try:
        searchID = args["searchID"]
        print("searchID")
        print(searchID)
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

@app.route('/test', methods=['GET'])
def test_api():
    return {"time": time.time()}
