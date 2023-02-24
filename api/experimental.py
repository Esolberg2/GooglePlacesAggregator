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