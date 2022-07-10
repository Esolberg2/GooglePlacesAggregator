import geopy.distance
import math
# def getDist(origin, coordinate):
#     return abs(geopy.distance.geodesic(origin, coordinate).miles)
#
# def binary_search(l, r, origin, coords):
#     m = l + ((r-l) // 2)
#     lDist = getDist(origin, coords[l])
#     rDist = getDist(origin, coords[r])
#
#     if r-l < 2:
#         if lDist < rDist:
#             return l
#         else:
#             return r
#     if lDist == rDist or r <= l:
#         return m
#     if lDist < rDist:
#         return binary_search(l, m, origin, coords)
#     if lDist > rDist:
#         return binary_search(m, r, origin, coords)

# def getDist(origin, coordinate):
#     return abs(geopy.distance.geodesic(origin, coordinate).miles)


# point = [
#   -71.76,
#   42.455
# ]

point = [
-71.79451478734099,
42.44
]


coords = [
  [
    -71.79451478734099,
    42.49182527498491
  ],
  [
    -71.80261411598156,
    42.49087906695716
  ],
  [
    -71.809919949746,
    42.488133145352954
  ],
  [
    -71.81571672511608,
    42.48385651224581
  ],
  [
    -71.81943701383486,
    42.478468056385275
  ],
  [
    -71.82071706632173,
    42.47249544926626
  ],
  [
    -71.81943225796554,
    42.46652341204601
  ],
  [
    -71.81570902995729,
    42.46113644819991
  ],
  [
    -71.80991225458651,
    42.45686165932424
  ],
  [
    -71.80260936011108,
    42.45411722973481
  ],
  [
    -71.79451478734099,
    42.453171591606036
  ],
  [
    -71.78642021457091,
    42.45411722973481
  ],
  [
    -71.77911732009548,
    42.45686165932424
  ],
  [
    -71.7733205447247,
    42.46113644819991
  ],
  [
    -71.76959731671644,
    42.46652341204601
  ],
  [
    -71.76831250836024,
    42.47249544926626
  ],
  [
    -71.76959256084712,
    42.478468056385275
  ],
  [
    -71.77331284956591,
    42.48385651224581
  ],
  [
    -71.77910962493598,
    42.488133145352954
  ],
  [
    -71.78641545870043,
    42.49087906695716
  ],
  [
    -71.79451478734099,
    42.49182527498491
  ]
]

t = [(1,2), (3,4), (0,4), (4,0)]
print(max(t))



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
    # northMostStart = perimeter[0] # 0
    # northMostEnd = perimeter[-1] # 0
    # southMost = perimeter[quad * 2] # 10
    # westMost = perimeter[quad] # 5
    # eastMost = perimeter[quad * 3] # 15


    if getDist(origin, perimeter[westMost]) < getDist(origin, perimeter[eastMost]):
        print("westMost is closest")
        return binary_search(southMost, northMostStart, origin, coords)
        # 	L = 10, R = 0
    	# 	check 10 and 0
    	# 		if 10 == 0,
    	# 			5 is the answer
    	# 		if 10 is closer
    	# 			set R to 5
    	# 		if 0 is closer:
    	# 			set L to 5

    if getDist(origin, perimeter[westMost]) > getDist(origin, perimeter[eastMost]):
        print("eastMost is closest")
        print('westMost index', westMost)
        print("eastMost index", eastMost)
        print("southMost", southMost)
        print("northMostEnd", northMostEnd)
        return binary_search(southMost, northMostEnd, origin, coords)
        # 	check 10 and 20
    	# 		if 20 == 10,
    	# 			15 is the answer
    	# 		if 20 is closer
    	# 			set R to 15
    	# 		if 10 is closer:
    	# 			set L to 15

    else:
        print("eastMost and westMost are equal")
        return southMost if getDist(origin, perimeter[northMostStart]) > getDist(origin, perimeter[southMost]) else northMost
        return min(getDist(origin, perimeter[northMostStart]), getDist(origin, perimeter[southMost]))
    # Check 5 and 15 nodes.
	# If 5 is closer, solution is in western hemisphere.
	# 	L = 10, R = 0
	# 	check 10 and 0
	# 		if 10 == 0,
	# 			5 is the answer
	# 		if 10 is closer
	# 			set R to 5
	# 		if 0 is closer:
	# 			set L to 5
    #
	# if 15 is closer, solution is in eastern hemisphere.
	# 	L = 20, R = 10
	# 	check 10 and 20
	# 		if 20 == 10,
	# 			15 is the answer
	# 		if 20 is closer
	# 			set R to 15
	# 		if 10 is closer:
	# 			set L to 15
    #
	# if 5 == 15, solution is on the x axis with the center of the circle.
	# 	the answer is the closer of 0 and 10

for i, p in enumerate(coords):
    print(i, getDist(point, p))
print("")

print(circleBinarySearch(point, coords))
