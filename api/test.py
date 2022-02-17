from flask import Flask, request, jsonify, session, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api, Resource, reqparse, abort
from flask_session import Session
import json
import time
import numpy as np
from shapely.geometry import Point
from shapely.geometry.polygon import Polygon
from shapely.geometry.multipolygon import MultiPolygon
from shapely.ops import unary_union
from shapely.ops import polygonize
from shapely.geometry import MultiPoint
from coordinateFunctions import makeGrid, flatToMatrixIndex, knn
from matplotlib.patches import *
import matplotlib.pyplot as plt
import math
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neighbors import NearestNeighbors
from sklearn.neighbors import BallTree



with open("/Users/eric/documents/_ReactJS/GooglePlacesAggregator/api/json_data.json", "r") as f:
    data = json.load(f)

searched = data["searchedCoords"]
unsearched = data["unsearchedCoords"]
matrix = data["unsearchedCoordsMatrix"]


RESOLUTION = .1
LAT_CONVERSION = 69
LON_CONVERSION = 54.6
LATSTEP = RESOLUTION/LAT_CONVERSION # north south
LONSTEP = RESOLUTION/LON_CONVERSION # east west
step = (LATSTEP, LATSTEP)
distStep = math.sqrt(LATSTEP**2 + LONSTEP**2)


def getAdjacent(r, c, rows, columns):
    #           right  left    down
    options = [(0,1), (0,-1), (-1,0), (1,0)]
    adjacent = set([])
    for opt in options:
        rowOffset = opt[0]
        colOffset = opt[1]

        if 0 <= (r + rowOffset) < rows and 0 <= (c + colOffset) < columns:
            adjacent.add((r + rowOffset, c + colOffset))
    return adjacent

def euclideanDist(c1, c2):

    xdelta = (c1[0] - c2[0]) * LAT_CONVERSION

    # uses LAT_CONVERSION rather than LON_CONVERSION because spacing along
    # x axis of coordinate plane is closer in units of degrees than y spacing.
    # This is to make the x and y differences between points equal in terms of miles,
    # since one degree of LAT = 69 miles and one degree LON = 54.6 miles.
    # because of this, the step between LON points in degrees is reduced by a factor of
    # 54.6/69 when building the coordinate plane.  To convert the points back to miles,
    # this adustment needs to be countered by multiplying by 69 vs 54.6.
    ydelta = (c1[1] - c2[1]) * LAT_CONVERSION

    try:
        distInDegrees = math.sqrt((c1[0]-c2[0])**2 + (c1[1]-c2[1])**2)
        distInMiles = math.sqrt(xdelta**2 + ydelta**2)

    except:
        print("*** failed ***")
        print("c1: ", c1)
        print("c2", c2)
    return distInMiles

def bfsFlipNodes(center, maxDist, data):
    searched = data["searchedCoords"]
    unsearched = data["unsearchedCoords"]
    indexMap = data["indexMap"]
    coordsMatrix = data["unsearchedCoordsMatrix"]

    centerNode = coordsMatrix[center[0]][center[1]]
    q = [center]
    v = set([center])
    nodesInCircle = []
    while q:
        curNodeKey = q.pop(0)
        curNode = coordsMatrix[curNodeKey[0]][curNodeKey[1]]
        nodesInCircle.append(curNode)
        adjacent = getAdjacent(curNodeKey[0], curNodeKey[1], len(coordsMatrix), len(coordsMatrix[0]))

        for adj in adjacent:
            candidateNode = coordsMatrix[adj[0]][adj[1]]
            if candidateNode is None:
                print("     *************")
                print("     ", adj)
                v.add(adj)

            elif adj not in v and euclideanDist(candidateNode,centerNode) < maxDist:
                q.append(adj)
                v.add(adj)



    out = [coordsMatrix[index[0]][index[1]] for index in v if coordsMatrix[index[0]][index[1]]]
    return out


def getBboxCorners(r, coord):
    bottomLeft = coord
    bottomRight = coord
    topLeft = coord
    topRight = coord

    curDist = 0
    while curDist <= ((2*r) * math.sqrt(2))/2:
        curDist += distStep

        bottomLeft = tuple((a-b) for a,b in zip(bottomLeft, step))
        topRight = tuple((a+b) for a,b in zip(topRight, step))

    bottomRight = (topRight[0], bottomLeft[1])
    topLeft = (bottomLeft[0], topRight[1])
    return (bottomLeft, bottomRight, topLeft, topRight)


searched = data["searchedCoords"]
unsearched = data["unsearchedCoords"]
matrix = data["unsearchedCoordsMatrix"]
indexMap = data["indexMap"]
print(indexMap)

matrixIndex = knn(searched, data)
print("matrixIndex", matrixIndex)
print("matrix", matrix)
print(len(matrix))
print(len(matrix[0]))
matrixValue = matrix[matrixIndex[0]][matrixIndex[1]]
print("center", matrixValue)
print("right adjacent", matrix[44][36])
print("lower adjacent", matrix[45][35])
print("dist right", euclideanDist(matrixValue, matrix[44][36]))
print("dist lower", euclideanDist(matrixValue, matrix[45][35]))
circle_points = bfsFlipNodes(matrixIndex, 6, data)
newSearched = searched + circle_points
# for p in searched:
#     print(p)
matrixIndex2 = knn(newSearched, data)
matrixValue2 = matrix[matrixIndex2[0]][matrixIndex2[1]]
print("matrixIndex2", matrixIndex2)

# plt.figure(figsize=(10, 10))
fig, ax = plt.subplots()
# fig.set_size_inches(8, 8)
xus, yus = zip(*unsearched)
ax.scatter(xus, yus, s=4)

xs, ys = zip(*searched)
ax.scatter(xs, ys, s=2)

bl, br, tl, tr = getBboxCorners(.1, matrixValue)
path = [bl, br, tr, tl, bl]
xs, ys = zip(*path) #create lists of x and y values
plt.plot(xs,ys)


xs, ys = zip(*circle_points)
ax.scatter(xs, ys, s=2, color='red')

ax.scatter(*matrixValue)
ax.scatter(*matrixValue2)
plt.show()
