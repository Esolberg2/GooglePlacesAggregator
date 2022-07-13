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
shapely.speedups.enable()



def latStep(resolution):
    return round((resolution/69), 15)

def lonStep(resolution):
    return round((resolution/54.6), 15)


def knn(searchedPoints, unsearchedData):

    unsearchedPoints = np.array(unsearchedData)
    searchedPoints = np.array(searchedPoints)

    if unsearchedPoints.size == 0:
        return None

    K = 1

    nbrs = NearestNeighbors(n_neighbors=1, algorithm='ball_tree', n_jobs=-1).fit(searchedPoints)
    distances, indices = nbrs.kneighbors(unsearchedPoints, 1)

    indexes = np.where(distances == np.amax(distances))
    unsearchedCoordIndex = indexes[0][0]
    furthestNearest = unsearchedPoints[unsearchedCoordIndex]

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