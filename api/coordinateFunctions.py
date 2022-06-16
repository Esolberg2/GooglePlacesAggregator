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
# import pygeos

RESOLUTION = .5
LAT_CONVERSION = 69
# LON_CONVERSION = 69
LON_CONVERSION = 54.6
LATSTEP = round((RESOLUTION/LAT_CONVERSION), 15)
# LONSTEP = round((RESOLUTION/LON_CONVERSION), 15)
# LONSTEP = round((RESOLUTION/LON_CONVERSION)*(LON_CONVERSION/LAT_CONVERSION), 15)
LONSTEP = round((RESOLUTION/LON_CONVERSION), 15)

print("LATSTEP", LATSTEP)
print("LONSTEP", LONSTEP)


# def flatToMatrixIndex(flatIndex, matrix):
#     rows = len(matrix)
#     columns = len(matrix[0])
#
#     matrixRowIndex = flatIndex // columns
#     matrixColIndex = flatIndex % columns
#
#     return (matrixRowIndex, matrixColIndex)


def knn(searchedPoints, unsearchedData):

    unsearchedPoints = np.array(unsearchedData)
    searchedPoints = np.array(searchedPoints)

    if unsearchedPoints.size == 0:
        return None

    K = 1

    nbrs = NearestNeighbors(n_neighbors=K, algorithm='ball_tree').fit(searchedPoints)
    distances, indices = nbrs.kneighbors(unsearchedPoints, 1)

    indexes = np.where(distances == np.amax(distances))
    unsearchedCoordIndex = indexes[0][0]
    furthestNearest = unsearchedPoints[unsearchedCoordIndex]

    return furthestNearest.tolist()

# def getAdjacent(flatIndex, matrixX, matrixY):
#     rows = len(matrixX)
#     columns = len(matrixX[0])
#     rowIndex = flatIndex // rows
#     columnIndex = flatIndex % columns
#
#     out = {
#     "above": (matrixX[rowIndex - 1][columnIndex], matrixY[rowIndex - 1][columnIndex]) if rowIndex > 0 else None,
#     "below": (matrixX[rowIndex + 1][columnIndex], matrixY[rowIndex + 1][columnIndex]) if rowIndex < rows - 1 else None,
#     "left": (matrixX[rowIndex][columnIndex - 1], matrixY[rowIndex][columnIndex - 1]) if columnIndex > 0 else None,
#     "right": (matrixX[rowIndex][columnIndex + 1], matrixY[rowIndex][columnIndex + 1]) if columnIndex < columns - 1 else None,
#     }
#     return out

def cleanPolygons(searchRegions):
    polys = [Polygon(p) for p in searchRegions]
    joinedPolys = unary_union(polys)
    return joinedPolys

def lineToPoints(lines, resolution):
    interval = resolution / 10
    mp = shapely.geometry.MultiPoint()
    for line in lines.boundary.explode():
        for i in np.arange(0, line.length, interval):
            s = substring(line, i, i+interval)
            mp = mp.union(s.boundary)

    return mp

def makeGrid(searchRegions):
    '''
    Takes an array of geojson, containing one or more polygons.  These polygons
    are merged if they overlap.  The resulting polygons are used as a mask to
    select only x,y coordinate pairs that fall within one of the polygons.
    All points inside the polygons are considered "unsearched".  The polygon
    borders are then used to plot additional points that fall on the borders.
    These points initialize the "searched" points.
    '''
    unionedPolys = cleanPolygons(searchRegions)

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
        "rawSearchPolygons": searchRegions
        }
