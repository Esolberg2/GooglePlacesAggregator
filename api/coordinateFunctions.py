import numpy as np
from shapely.geometry import Point, mapping
from shapely.geometry.polygon import Polygon
from shapely.geometry.multipolygon import MultiPolygon
from shapely.ops import unary_union
from shapely.ops import polygonize
from shapely.geometry import MultiPoint
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neighbors import NearestNeighbors

RESOLUTION = .5
LAT_CONVERSION = 69
# LON_CONVERSION = 69
LON_CONVERSION = 54.6
LATSTEP = round((RESOLUTION/LAT_CONVERSION), 15)
# LONSTEP = round((RESOLUTION/LON_CONVERSION), 15)
LONSTEP = round((RESOLUTION/LON_CONVERSION)*(54.6/69), 15)


def flatToMatrixIndex(flatIndex, matrix):
    rows = len(matrix)
    columns = len(matrix[0])

    matrixRowIndex = flatIndex // columns
    matrixColIndex = flatIndex % columns

    return (matrixRowIndex, matrixColIndex)


def knn(searchedPoints, unsearchedData):

    matrix = unsearchedData["unsearchedCoordsMatrix"]
    indexMap = unsearchedData["indexMap"]

    unsearchedPoints = np.array(unsearchedData["unsearchedCoords"])
    searchedPoints = np.array(searchedPoints)

    if unsearchedPoints.size == 0:
        return None

    K = 1
    nbrs = NearestNeighbors(n_neighbors=K, algorithm='ball_tree').fit(searchedPoints)
    distances, indices = nbrs.kneighbors(unsearchedPoints, 1)
    print("distances")
    print(distances)

    # get index of max value
    indexes = np.where(distances == np.amax(distances))

    # get index of coordinate in unsearch coordinates
    unsearchedCoordIndex = indexes[0][0]

    # get coordinate of chosen point
    furthestNearest = unsearchedPoints[unsearchedCoordIndex]
    print("furthestNearest", furthestNearest)

    # convert unsearched coordinate index to flat matrix index
    matrixMapIndex = indexMap[unsearchedCoordIndex]

    # convert flat matrix index to 2d index
    matrixIndex = flatToMatrixIndex(matrixMapIndex, matrix)

    return matrixIndex

def getAdjacent(flatIndex, matrixX, matrixY):
    rows = len(matrixX)
    columns = len(matrixX[0])
    rowIndex = flatIndex // rows
    columnIndex = flatIndex % columns

    # out = {
    # "matrixIndex": [columnIndex, rowIndex],
    # "above": (rowIndex - 1, columnIndex) if rowIndex > 0 else None,
    # "below": (rowIndex + 1, columnIndex) if rowIndex < rows - 1 else None,
    # "left": (rowIndex, columnIndex - 1) if columnIndex > 0 else None,
    # "right": (rowIndex, columnIndex + 1) if columnIndex < columns - 1 else None,
    # }
    out = {
    "above": (matrixX[rowIndex - 1][columnIndex], matrixY[rowIndex - 1][columnIndex]) if rowIndex > 0 else None,
    "below": (matrixX[rowIndex + 1][columnIndex], matrixY[rowIndex + 1][columnIndex]) if rowIndex < rows - 1 else None,
    "left": (matrixX[rowIndex][columnIndex - 1], matrixY[rowIndex][columnIndex - 1]) if columnIndex > 0 else None,
    "right": (matrixX[rowIndex][columnIndex + 1], matrixY[rowIndex][columnIndex + 1]) if columnIndex < columns - 1 else None,
    }
    return out

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
            split_polys = polygonizeSelfIntersects(regionPoly)
            searchPolygons.extend(split_polys)
        else:
            searchPolygons.append(regionPoly)

    searchPolygons = unary_union(searchPolygons)
    return searchPolygons

def makeGrid(searchRegions):
    # Combine overlapping search regions and normalize self intersecting polygons.
    searchRegions_clean = cleanPolygons(searchRegions)
    polys = MultiPolygon(searchRegions_clean) if isinstance(searchRegions_clean, list) else MultiPolygon([searchRegions_clean])

    # Initialize object for session search data
    output = {}

    # Calculate initial searched an unsearched points
    xmin, ymin, xmax, ymax = polys.bounds
    unsearchedPoints = []
    x = np.arange(xmin, xmax, LONSTEP).round(15)
    y = np.arange(ymin, ymax, LATSTEP).round(15)
    xx, yy = np.meshgrid(x, y)
    unsearchedMatrix = [[(x, yy[j][i]) for i, x in enumerate(xrow)] for j, xrow in enumerate(xx)]
    flattenedMatrix = [j for sub in unsearchedMatrix for j in sub]
    indexMap = [flatToMatrixIndex(i, unsearchedMatrix) for i, e in enumerate(flattenedMatrix)]
    matrixMap = {}
    for j, xrow in enumerate(xx):
        for i, x in enumerate(xrow):
            matrixMap[(x, yy[j][i])] = {"row": j, "col": i}

    points = MultiPoint(flattenedMatrix)

    for p in polys.geoms:
        xmin, ymin, xmax, ymax = p.bounds
        border = []
        line = p.exterior
        dist = 0
        borderPoints = []
        while dist < line.length:
            newPoint = line.interpolate(dist)
            borderPoints.append(newPoint)
            dist += LATSTEP

        border.extend(borderPoints)
        unsearchedPoints.extend(mapping(points.intersection(p))["coordinates"])

    unsearchedPointsSet = set(unsearchedPoints)
    j = 0
    index2 = []
    for i, coordinate in enumerate(flattenedMatrix):
        if coordinate in unsearchedPointsSet:
            index2.append(i)


    print("num matched", len(index2))
    print("total to find", len(unsearchedPoints))

    print("")

    out = {
        "unsearchedCoords": unsearchedPoints,
        "unsearchedCoordsMatrix": unsearchedMatrix,
        # "matrixMap": matrixMap,
        "indexMap": index2,
        "matrixMap": {},
        "searchedCoords": list(mapping(MultiPoint(border))["coordinates"]),
        "rawSearchPolygons": searchRegions
        }
    return out
