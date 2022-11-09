import numpy as np
from shapely.geometry import Point, mapping
from shapely.geometry.polygon import Polygon
from shapely.geometry.multipolygon import MultiPolygon
from shapely.ops import unary_union
from shapely.ops import polygonize
from shapely.geometry import MultiPoint
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neighbors import NearestNeighbors
from shapely.ops import substring
import geopandas as gpd
import shapely
import shapely.speedups
import geopy.distance
from bisect import bisect_left
shapely.speedups.enable()



def latStep(resolution):
    return round((resolution/69), 15)

def lonStep(resolution):
    return round((resolution/54.6), 15)



def knnMapper(searchedPoints, unsearchedData):
    unsearchedPoints = np.array(unsearchedData)
    searchedPoints = np.array(searchedPoints)
    if unsearchedPoints.size == 0:
        return None
    K = 1
    nbrs = NearestNeighbors(n_neighbors=1, algorithm='ball_tree', n_jobs=-1).fit(searchedPoints)
    distances, indices = nbrs.kneighbors(unsearchedPoints, 1)
    distances = distances.tolist()
    indices = indices.tolist()
    knnMap = {str(unsearchedData[index[0]]): (distance, unsearchedData[index[0]]) for distance, index in zip(distances, indices)}
    return knnMap

def updateKnnMap(knnMap, circleCoords):
    for coord in knnMap:
        minCircleCoordDistance = circleBinarySearch(coord, circleCoords)
        knnMap[coord] = (min(minCircleCoordDistance, knnMap[coord]), coord)
    return knnMap

def processKnnMap(knnMap):
    furthestNearest = max(knnMap.values())
    return furthestNearest


def getDist(origin, coordinate):
    xDist = abs(origin[0] - coordinate[0])
    yDist = abs(origin[1] - coordinate[1])
    return math.sqrt(xDist + yDist)


def binary_search(l, r, origin, coords):
    m = l + ((r-l) // 2)
    lDist = getDist(origin, coords[l])
    rDist = getDist(origin, coords[r])

    if r-l < 2:
        if lDist < rDist:
            return l
        else:
            return r
    if lDist == rDist or r <= l:
        return m
    if lDist < rDist:
        return binary_search(l, m, origin, coords)
    if lDist > rDist:
        return binary_search(m, r, origin, coords)


def circleBinarySearch(origin, perimeter):
    l = len(perimeter)
    quad = int(l / 4)
    northMostStart = 0 # 0
    northMostEnd = l-1 # 0
    southMost = quad * 2 # 10
    westMost = quad # 5
    eastMost = quad * 3 # 15

    if getDist(origin, perimeter[westMost]) < getDist(origin, perimeter[eastMost]):
        return binary_search(southMost, northMostStart, origin, coords)
    if getDist(origin, perimeter[westMost]) > getDist(origin, perimeter[eastMost]):
        return binary_search(southMost, northMostEnd, origin, coords)
    else:
        return southMost if getDist(origin, perimeter[northMostStart]) > getDist(origin, perimeter[southMost]) else northMost



def knn(searchedPoints, unsearchedData):
    unsearchedPoints = np.array(unsearchedData)
    searchedPoints = np.array(searchedPoints)
    if unsearchedPoints.size == 0:
        return None
    K = 1
    nbrs = NearestNeighbors(n_neighbors=1, algorithm='ball_tree', n_jobs=-1).fit(searchedPoints)
    distances, indices = nbrs.kneighbors(unsearchedPoints, 1)

    print("---- nbrs ----")
    for dist, ind in zip(distances, indices):
        print(dist, ind)

    #unsearched to searched
    distMap = {i: [ind[0], distances[i][0]] for i, ind in enumerate(indices)}

    print("--- ind map ----")
    for k, v in distMap.items():
        print(k, v)
    # coordMap = {unsearchedPoints[i][0]: searchedPoints[ind][0] for i, ind in enumerate(indices)}
    #
    # j = 0
    # for k, v in coordMap.items():
    #     print(k, v, "   :   ", j, distMap[j])
    #     j+= 1

    # print(coordMap)
    indexes = np.where(distances == np.amax(distances))
    print("")
    print("dir NearestNeighbors", dir(NearestNeighbors))
    print("---- indexes ----")
    print("indexes[0]", indexes[0])
    print("max distance", np.amax(distances))
    print("distance at max index", distances[indexes[0]])
    print("distMap value at key", indexes[0], ":", distMap[indexes[0][0]])
    print("training index at max index", indices[indexes[0]])

    print("len unsearchedPoints", len(unsearchedPoints))
    print("len distances", len(distances))
    print("len searched points", len(searchedPoints))
    print("")
    nearestToFurthest = indices[indexes[0]]
    coordOfNearestToFurthest = searchedPoints[nearestToFurthest]
    print("coordOfNearestToFurthest", coordOfNearestToFurthest)

    # what i need is a dictionary of unsearched points and their nearest coordinate from searched points
    # the dictionary should store searched coordinates as keys.

    unsearchedCoordIndex = indexes[0][0]
    furthestNearest = unsearchedPoints[unsearchedCoordIndex]

    print("furthestNearest", furthestNearest)
    print("")
    return furthestNearest.tolist()


def cleanPolygons(searchRegions):
    polys = [Polygon(p) for p in searchRegions]
    joinedPolys = unary_union(polys)
    return joinedPolys

def lineToPoints(lines, resolution):
    mp = shapely.geometry.MultiPoint()
    for line in lines.boundary.explode():
        for i in np.arange(0, line.length, resolution):
            s = substring(line, i, i+resolution)
            mp = mp.union(s.boundary)

    return mp

def makeGrid(searchRegions, resolution):
    '''
    Takes an array of geojson, containing one or more polygons.  These polygons
    are merged if they overlap.  The resulting polygons are used as a mask to
    select only x,y coordinate pairs that fall within one of the polygons.
    All points inside the polygons are considered "unsearched".  The polygon
    borders are then used to plot additional points that fall on the borders.
    These points initialize the "searched" points.
    '''
    unionedPolys = cleanPolygons(searchRegions)
    LATSTEP = latStep(resolution)
    LONSTEP = lonStep(resolution)

    xmin, ymin, xmax, ymax = unionedPolys.bounds
    x = np.arange(xmin, xmax, LONSTEP).round(15)
    y = np.arange(ymin, ymax, LATSTEP).round(15)
    xx, yy = np.meshgrid(x, y)

    flattenedMatrix = np.transpose(np.vstack([xx.ravel(), yy.ravel()]))

    boundingBoxCoordinatePlane = MultiPoint(flattenedMatrix)
    unsearched = [p for p in boundingBoxCoordinatePlane if unionedPolys.contains(p)]

    borderPoints = lineToPoints(gpd.GeoSeries(unionedPolys), LATSTEP)

    return {
        "unsearchedCoords": MultiPoint(unsearched),
        "searchedCoords": borderPoints,
        "rawSearchPolygons": searchRegions,
        "shape": unionedPolys.__geo_interface__["coordinates"]
        }
