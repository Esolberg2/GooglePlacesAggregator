import numpy as np
from shapely.geometry import Point
from shapely.geometry.polygon import Polygon
from shapely.geometry.multipolygon import MultiPolygon
from shapely.geometry import MultiPoint
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle
from shapely.ops import unary_union
from shapely.ops import polygonize
from shapely.geometry import LineString
from shapely.ops import substring
from coordinateFunctions import makeGrid
# searchRegions = [
# [[-72.71530577920957, 42.54129792331209], [-71.3183020370349, 42.603503565624635], [-72.32544426976574, 41.37687949983432], [-71.4157674143961, 43.174778261573856], [-72.71530577920957, 42.54129792331209]]
# # [[-71.9375074746647, 42.474237853288], [-71.98446280001215, 42.4946071004365], [-72.01208357962797, 42.451824021752465], [-71.9375074746647, 42.474237853288]]
# ]

# searchRegions = [
# [[-72.46734834634685, 42.643368520090995], [-71.71435016169065, 42.566510301083966], [-72.17410842356334, 42.314216306664676], [-71.94047772704369, 42.97564961509042], [-72.46734834634685, 42.643368520090995]],
# [[-71.4151922244116, 42.77591222144187], [-71.52600564655732, 42.42621194167556], [-71.05157446634445, 42.43498464080225], [-71.1468184299415, 42.69725438199245], [-71.4151922244116, 42.77591222144187]]
# # [[-71.69420577353088, 42.86714114009361], [-71.69230238427961, 42.821159230438624], [-71.63425240174418, 42.87325982874295], [-71.69420577353088, 42.86714114009361]]
# ]

# searchRegions = [[[-71.66135910204599, 42.56846286682333], [-71.14735567558671, 42.58338590772203], [-71.7055744505586, 42.306050495632824], [-71.17130565603118, 42.29923764702734], [-71.66135910204599, 42.56846286682333]], [[-71.08103265281808, 42.504660559518456], [-71.01286732386103, 42.39182921895668], [-70.90417125876772, 42.53317602951378], [-71.08103265281808, 42.504660559518456]], [[-71.45317850279899, 42.16965347694654], [-71.19525563647566, 42.186036684489075], [-71.37580164290232, 42.3550812423158], [-71.45317850279899, 42.16965347694654]]]

# bowtie, small right, bottom, intersect test
# searchRegions = [
# [[-71.66135910204599, 42.56846286682333], [-71.14735567558671, 42.58338590772203], [-71.7055744505586, 42.306050495632824], [-71.17130565603118, 42.29923764702734], [-71.66135910204599, 42.56846286682333]],
# [[-71.08103265281808, 42.504660559518456], [-71.01286732386103, 42.39182921895668], [-70.90417125876772, 42.53317602951378], [-71.08103265281808, 42.504660559518456]],
# [[-71.45317850279899, 42.16965347694654], [-71.19525563647566, 42.186036684489075], [-71.37580164290232, 42.3550812423158], [-71.45317850279899, 42.16965347694654]],
# [[-70.90417125876772, 42.53317602951378], [-70.7234046529616, 42.403739240183945], [-70.76032953284026, 42.610044529794195], [-70.90417125876772, 42.53317602951378]]
# ]

searchRegions = [
[[-71.66135910204599, 42.56846286682333], [-71.14735567558671, 42.58338590772203], [-71.7055744505586, 42.306050495632824], [-71.17130565603118, 42.29923764702734], [-71.66135910204599, 42.56846286682333]],
[[-71.08103265281808, 42.504660559518456], [-71.01286732386103, 42.39182921895668], [-70.90417125876772, 42.53317602951378], [-71.08103265281808, 42.504660559518456]],
[[-71.45317850279899, 42.16965347694654], [-71.19525563647566, 42.186036684489075], [-71.37580164290232, 42.3550812423158], [-71.45317850279899, 42.16965347694654]],
[[-70.90417125876772, 42.53317602951378], [-70.7234046529616, 42.403739240183945], [-70.76032953284026, 42.610044529794195], [-70.90417125876772, 42.53317602951378]],
[[-71.15435366339125, 42.5100005766435], [-71.0708860072338, 42.302215908013196], [-70.63208461486391, 42.332193417174715], [-70.69408915943784, 42.65749563868442], [-71.15435366339125, 42.5100005766435]]
]

# def polygonizeSelfIntersects(polygon):
#     be = polygon.exterior
#     mls = be.intersection(be)
#     polygons = polygonize(mls)
#     return polygons
#
# def cleanPolygons(searchRegions):
#     searchPolygons = []
#     for region in searchRegions:
#         regionPoly = Polygon(region)
#         if not regionPoly.is_valid:
#             print("self intersect found")
#             split_polys = polygonizeSelfIntersects(regionPoly)
#             searchPolygons.extend(split_polys)
#         else:
#             searchPolygons.append(regionPoly)
#
#     searchPolygons = unary_union(searchPolygons)
#     return searchPolygons
#
# def makeGrid(searchRegions):
#     polys = MultiPolygon(searchRegions)
#     resolution = 1
#     LAT_CONVERSION = 69
#     LON_CONVERSION = 54.6
#     latStep = 1/(LAT_CONVERSION/resolution)
#     lonStep = 1/(LON_CONVERSION/resolution)
#     output = {"multipolygon": polys, "unsearched": [], "searched": []}
#     xmin, ymin, xmax, ymax = polys.bounds
#     x = np.arange(xmin, xmax, lonStep)
#     y = np.arange(ymin, ymax, latStep)
#
#     # add border to searched points -- probably not needed
#     # top = [(xCoord, ymax) for xCoord in x]
#     # bottom = [(xCoord, ymin) for xCoord in x]
#     # left = [(xmin, yCoord) for yCoord in y]
#     # right = [(xmax, yCoord) for yCoord in y]
#     # border = MultiPoint(top + bottom + left + right)
#
#     points = MultiPoint(np.transpose([np.tile(x, len(y)), np.repeat(y, len(x))]))
#
#     # output["searched"] = points.difference(polys)
#     # border = MultiPoint()
#     border = []
#     for p in polys:
#         xmin, ymin, xmax, ymax = p.bounds  # -4.85674599573635, 37.174925051829, -4.85258684662671, 37.1842384372115
#         line = p.exterior
#         dist = 0
#         borderPoints = []
#         while dist < line.length:
#             newPoint = line.interpolate(dist)
#             borderPoints.append(newPoint)
#             dist += latStep
#
#         border.extend(borderPoints)
#         # border = unary_union([MultiPoint(borderPoints), border])
#         # print("borderPoints", borderPoints)
#         # print("newline", border)
#
#
#         # x = np.arange(xmin, xmax, lonStep)  # array([-4.857, -4.856, -4.855, -4.854, -4.853])
#         # y = np.arange(ymin, ymax, latStep)  # array([37.174, 37.175, 37.176, 37.177, 37.178, 37.179, 37.18 , 37.181, 37.182, 37.183, 37.184, 37.185])
#         # points = MultiPoint(np.transpose([np.tile(x, len(y)), np.repeat(y, len(x))]))
#         # print(points)
#         print("---")
#         gridPoly = {"polygon": p, "points": points.intersection(p)}
#         output["unsearched"].append(gridPoly)
#     output["searched"] = MultiPoint(border)
#     return output

# def makeGrid():
#     p = Polygon([(-73.27729481721627, 42.73420736409423), (-71.63240648949409, 42.023352129138104), (-71.07292066373826, 41.765141748583765), (-70.5246245544977, 42.68487403458647), (-73.27729481721627, 42.73420736409423)])
#     print(p.bounds)
#     xmin, ymin, xmax, ymax = p.bounds  # -4.85674599573635, 37.174925051829, -4.85258684662671, 37.1842384372115
#     n = 1000
#     x = np.arange(np.floor(xmin * n) / n, np.ceil(xmax * n) / n, 1 / n)  # array([-4.857, -4.856, -4.855, -4.854, -4.853])
#     y = np.arange(np.floor(ymin * n) / n, np.ceil(ymax * n) / n, 1 / n)  # array([37.174, 37.175, 37.176, 37.177, 37.178, 37.179, 37.18 , 37.181, 37.182, 37.183, 37.184, 37.185])
#     points = MultiPoint(np.transpose([np.tile(x, len(y)), np.repeat(y, len(x))]))
#     print(points)
#     result = points.intersection(p)
#     return result

output = makeGrid(cleanPolygons(searchRegions))
fig, ax = plt.subplots()
# for out in output["unsearched"]:
#     xs = [point.x for point in out["points"]]
#     ys = [point.y for point in out["points"]]
#     ax.scatter(xs, ys)

xs = [point.x for point in output["searched"]]
ys = [point.y for point in output["searched"]]
ax.scatter(xs, ys)

# bbox = output["multipolygon"].bounds
# ax.add_patch( Rectangle((bbox[0], bbox[1]),
#                         bbox[2] - bbox[0], bbox[3]- bbox[1],
#                         fc='none',
#                         color ='yellow',
#                         linewidth = 5,
#                         linestyle="dotted") )
plt.show()

# the scatter points are unsearched coordinates initialized for the search.
# Knn needs to be run on each separate set of unsearched coordinates.
# Since only one polygo is searched at a time, only the polygon that is selected
# needs to be recalculated by KNN in the to reset for the next search.
print(len(out))

print(" ")
for c in out:
    print(c)

polys = []
for r in searchRegions:
    polys.append(Polygon(r))

polygon = MultiPolygon(polys)
# polygon = Polygon(searchRegions[0])
# print(polygon.contains(Point(-71.69420577353088, 42.86714114009361)))

#
# searchRegions = [
#     [
#     [43.76953124999997, 64.69910544204735],
#     [62.753906249999986, 53.0147832458586],
#     [76.81640624999963, 63.31268278043451],
#     [43.76953124999997, 64.69910544204735]
#     ],
#     [
#     [23.027343749999673, 48.34164617237394],
#     [31.464843749999645, 34.1618181612296],
#     [44.82421874999996, 48.34164617237394],
#     [23.027343749999673, 48.34164617237394]
#     ]
# ]

# searchRegions = [[[-71.53162443691306, 42.46344338659457], [-71.5828011105532, 42.11731777858389], [-71.11672783275942, 42.11731777858389], [-70.87729410965747, 42.44321505541669], [-71.53162443691306, 42.46344338659457]]]


maxX = float("-inf")
minX = float("inf")
maxY = float("-inf")
minY = float("inf")

for region in searchRegions:
    for point in region:
        maxX = point[0] if point[0] > maxX else maxX
        maxY = point[1] if point[1] > maxY else maxY

        minX = point[0] if point[0] < minX else minX
        minY = point[1] if point[1] < minY else minY

resolution = 1
topRight = (maxX, maxY)
bottomLeft = (minX, minY)

# xBase = [bottomLeft]
# yBase = [bottomLeft]
#
# while xBase[-1][0] < maxX:
#     xBase.append((xBase[-1][0]+resolution, minY))
#
# while yBase[-1][1] < maxY:
#     yBase.append((minX, yBase[-1][1]+resolution))

resolution = .2
LAT_CONVERSION = 69
LON_CONVERSION = 54.6
1/(LAT_CONVERSION/resolution
1/(LON_CONVERSION/resolution

# xBase = np.array([minX])
# yBase = np.array([minY])
xBase = [minX]
yBase = [minY]

latDelta = 1/(LAT_CONVERSION/resolution)
lonDelta = 1/(LON_CONVERSION/resolution)

while xBase[-1] < maxX:
    xBase.append(xBase[-1]+lonDelta)

while yBase[-1] < maxY:
    yBase.append(yBase[-1] +latDelta)

xBase = np.array(xBase)
yBase = np.array(yBase)

xx, yy = np.meshgrid(xBase, yBase)

# plane = [(x, y) for x in xx for y in yy]

# print(xx[0][0])
# print(yy[0][0])
# print("---")
# print(xx[0][1])
# print(yy[0][1])
# print("---")
# print(xx[0][2])
# print(yy[0][2])
# print("****")
# print(xx[1][0])
# print(yy[1][0])
# print("---")
# print(xx[1][1])
# print(yy[1][1])
# print("---")
# print(xx[1][2])
# print(yy[1][2])
# print(bottomLeft)
# print(xx[0])
# print(xx[1])
# print(xx[0] == xx[1])
# print(plane[0])
# print(bottomLeft)
# print(xBase)
# print(yBase)
unsearchedCoords = []
for i, row in enumerate(xx):
    for j, element in enumerate(row):
        if polygon.contains(Point(element, yy[i][j])):
            unsearchedCoords.append((element, yy[i][j]))
print(len(unsearchedCoords))

print("run")
