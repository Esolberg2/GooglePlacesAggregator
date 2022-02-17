from flask import Flask, request, jsonify, session, make_response
from coordinateFunctions import flatToMatrixIndex
import json

def saveDataToFile():
    # print("session*", session.get("1234512"))
    with open('json_data.json', 'w') as outfile:
        json.dump(session.get("1234512"), outfile)

def initData(searchKey, data):
    session[searchKey] = {
        "unsearchedCoords": [],
        "unsearchedCoordsMatrix": [],
        "matrixMap": {},
        "searchedCoords": [],
        "rawSearchPolygons": [],
        "indexMap": []
    }

    unsearchedCoords = data["unsearchedCoords"]
    unsearchedCoordsMatrix = data["unsearchedCoordsMatrix"]
    matrixMap = data["matrixMap"]
    searchedCoords = data["searchedCoords"]
    rawSearchPolygons = data["rawSearchPolygons"]
    indexMap = data["indexMap"]

    _initUnsearchedCoords(searchKey, unsearchedCoords, unsearchedCoordsMatrix, matrixMap, indexMap)
    _setSearchedCoords(searchKey, searchedCoords)
    _setRawSearchPolygons(searchKey, rawSearchPolygons)

def _initUnsearchedCoords(searchKey, unsearchedCoords, unsearchedCoordsMatrix, matrixMap, indexMap):

    for r, row in enumerate(unsearchedCoordsMatrix):
        for c, element in enumerate(row):
            if element not in unsearchedCoords:
                unsearchedCoordsMatrix[r][c] = None


    session[searchKey]["unsearchedCoords"] = [j for sub in unsearchedCoordsMatrix for j in sub if j]
    session[searchKey]["unsearchedCoordsMatrix"] = unsearchedCoordsMatrix
    session[searchKey]["matrixMap"] = matrixMap
    session[searchKey]["indexMap"] = indexMap

    # with open('json_data.json', 'w') as outfile:
    #     # json.dump(session.get("1234512"), outfile)
    #     json.dump({"test": "test"}, outfile)


def removeUnsearchedCoords(searchKey, unsearchedIndexestoRemove):
    # always contains all coordinates as keys with row and column index for unsearchedCoordsMatrix as values.
    # map = session[searchKey].get("matrixMap")

    unsearchedCoords = session[searchKey].get("unsearchedCoords")

    indexMap = session[searchKey].get("indexMap")

    # keeps track of unsearched candidate coordinates, and their adjacency to other coordinates.
    matrix = session[searchKey].get("unsearchedCoordsMatrix")

    coords = []
    for i in unsearchedIndexestoRemove:
        maxtrixCoordIndex = flatToMatrixIndex(indexMap[i])
        maxtrixCoord[maxtrixCoordIndex[0]][maxtrixCoordIndex[1]] = None
        coords.append(unsearchedCoords[i])
        unsearchedCoords[i] == None
        indexMap[i] == None

    # # sets all coordinates outside the search areas to None
    # for coord in map.keys() & set(coords):
    #     row = coord["row"]
    #     col = coord["col"]
    #     matrix[row][col] = None

    # flattens all coordinates in matrix that are not none (still valid candidates)
    # unsearchedCoords = [j for sub in matrix for j in sub if j]
    unsearchedCoords = [coord for coord in unsearchedCoords if coord]
    indexMap = [index for index in indexMap if index]

    _setUnsearchedCoords(searchKey, unsearchedCoords, matrix, indexMap)
    _setSearchedCoords(searchKey, coords)



def getSearchedCoords(searchKey):
    # print("searchedCoords", session[searchKey].get("searchedCoords"))
    return session[searchKey].get("searchedCoords")

def getUnsearchedCoords(searchKey):
    out = {
        "unsearchedCoords": session[searchKey].get("unsearchedCoords"),
        "unsearchedCoordsMatrix": session[searchKey].get("unsearchedCoordsMatrix"),
        "matrixMap": session[searchKey].get("matrixMap"),
        "indexMap": session[searchKey].get("indexMap")
    }
    return out


def _setRawSearchPolygons(searchKey, rawSearchPolygons):
    session[searchKey]["rawSearchPolygons"] = rawSearchPolygons

def _setSearchedCoords(searchKey, coords):
    currCoords = session[searchKey]["searchedCoords"]
    # print("new coords", coords)
    # print("old coords", currCoords)
    # print("combined Coords", coords + currCoords)
    session[searchKey]["searchedCoords"] = coords + currCoords

def _setUnsearchedCoords(searchKey, unsearchedCoords, matrix, map):
    session[searchKey]["unsearchedCoords"] = unsearchedCoords
    session[searchKey]["unsearchedCoordsMatrix"] = matrix
    session[searchKey]["matrixMap"] = map
