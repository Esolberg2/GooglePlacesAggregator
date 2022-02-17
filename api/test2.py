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
from shapely.ops import polygonize
from shapely.geometry import MultiPoint
from coordinateFunctions import makeGrid, knn
from matplotlib.patches import *
import matplotlib.pyplot as plt
import math


# searchRegions = [[[-71.32275099340099, 42.40277232904243], [-71.23219902747127, 42.187128386378326], [-71.05772084921713, 42.386461519621655], [-71.32275099340099, 42.40277232904243]], [[-71.38238277584189, 42.453308896895514], [-71.34483683874925, 42.28197196881113], [-71.1350213079377, 42.47611850767685], [-71.38238277584189, 42.453308896895514]]]

# output = makeGrid(searchRegions)
# searched = output["searchedCoordinates"]
# unsearched = output["unsearchedCoordinates"]
# coordMap = output["coordMap"]

with open("json_data.json", "r") as f:
    data = json.load(f)

print(data.keys())

searched = data["searchedCoords"]
unsearched = data["unsearchedCoords"]
matrix = data["unsearchedCoordsMatrix"]


RESOLUTION = 1
LAT_CONVERSION = 69
LON_CONVERSION = 54.6
LATSTEP = RESOLUTION/LAT_CONVERSION # north south
LONSTEP = RESOLUTION/LON_CONVERSION # east west
# step = (LONSTEP, LATSTEP)
step = (LATSTEP, LATSTEP)
distStep = math.sqrt(LATSTEP**2 + LONSTEP**2)


# pointSet = {(x, y): {"index": i, "status": 0, "adjacent": getAdjacent(i, xx, yy)} for i, (x, y) in enumerate(zip(xx.flatten(), yy.flatten()))}
# out = {
# "above": (matrixX[rowIndex - 1], matrixY[columnIndex]) if rowIndex > 0 else None,
# "below": (matrixX[rowIndex + 1], matrixY[columnIndex]) if rowIndex < rows - 1 else None,
# "left": (matrixX[rowIndex], matrixY[columnIndex - 1]) if columnIndex > 0 else None,
# "right": (matrixX[rowIndex], matrixY[columnIndex + 1]) if columnIndex < columns - 1 else None,
# }

# def bfsFlipNodes(center, maxDist, matrix):
#     # searchCoordsList = searchSession["searched"]
#     # unsearchedCoordsMap = searchSession["unsearched"]
#
#     q = [center]
#     d = 0
#
#     while q:
#         curNode = matrix[q.pop(0)]
#         adjacent = [node for node in curNode["adjacent"].values() if node is not None]
#         for node in adjacent:
#             if math.dist(center, node) <= maxDist and curNode["status"] == 0:
#                 q.append(node)
#
#         curNode["status"] = 1

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

def bfsFlipNodes(center, maxDist, data):
    searched = data["searchedCoords"]
    unsearched = data["unsearchedCoords"]
    coordsMatrix = data["unsearchedCoordsMatrix"]


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



def getQuadrant(center, coord):

    xdif = center[0] - coord[1]
    ydif = center[1] - coord[1]

    if xdif < center[0] and ydif < center[1]:
        # return 3
        return (1, 1)
    elif xdif < center[0] and ydif > center[1]:
        # return 2
        return (1, -1)
    elif xdif > center[0] and ydif < center[1]:
        # return 4
        return (-1, 1)
    elif xdif > center[0] and ydif > center[1]:
        # return 1
        return (-1, -1)

def removeCoordsInRadius(r, coord):
    # bottomLeft = (coor[0] - r, coord[1] - r)
    # bottomRight = (coor[0] - r, coord[1] + r)
    # topLeft = (coor[0] + r, coord[1] - r)
    # ropRight = (coor[0] + r, coord[1] + r)
    bottomLeft = coord
    bottomRight = coord
    topLeft = coord
    topRight = coord

    curDist = 0
    while curDist <= ((2*r) * math.sqrt(2))/2:
        curDist += distStep
        bottomLeft = tuple((a-b) for a,b in zip(bottomLeft, step))
        # bottomRight = ((a-b) for a,b in zip(bottomRight, step))
        # topLeft = ((a-b) for a,b in zip(topLeft, step))
        topRight = tuple((a+b) for a,b in zip(topRight, step))

    bottomRight = (topRight[0], bottomLeft[1])
    topLeft = (bottomLeft[0], topRight[1])
    return (bottomLeft, bottomRight, topLeft, topRight)





fig, ax = plt.subplots()

xus, yus = zip(*unsearched)
#
ax.scatter(xus, yus)
xs, ys = zip(*searched)


ax.scatter(xs, ys)


# s = {
# "searchedCoordinates": np.array(output["coordMap"]["searched"]),
# "unsearchedCoordinates": np.array(output["coordMap"]["unsearched"])
# }

# nextPoint = knn(s)
# bfsFlipNodes(nextPoint, .1, )

nextPoint = (-71.07102746448652, 42.187128386378326)

bl, br, tl, tr = removeCoordsInRadius(.1, nextPoint)
print(bl)
print(br)
print(tl)
print(tr)
path = [bl, br, tr, tl, bl]
xs, ys = zip(*path) #create lists of x and y values
plt.plot(xs,ys)
# ax.add_patch( matplotlib.patches.Polygon(bl,
#                         .2, .2,
#                         fc='none',
#                         color ='red',
#                         linewidth = 5,
#                         linestyle="dotted") )

print(tuple(bl))
print(tuple(tr))
ax.scatter(*nextPoint)
# nextPoint = nextPoint.reshape(1,2)




# s["searchedCoordinates"] = np.concatenate((s["searchedCoordinates"], nextPoint))
# s["unsearchedCoordinates"] = np.setxor1d(s["unsearchedCoordinates"], nextPoint)
plt.show()
