import numpy as np
import faiss


class FaissKNeighbors:
    def __init__(self, k=1):
        self.index = None
        self.unsearched = None
        self.k = k

    def fit(self, searched, unsearched):
        # print("")
        # print("searched size")
        # print(searched.shape)
        # print("")
        # print("")
        # print("unsearched size")
        # print(unsearched.shape)
        # print("")
        self.index = faiss.IndexFlatL2(2)
        # self.index.add(searched.astype(np.float32))
        self.index.add(np.asarray(searched, dtype=np.float32))
        self.unsearched = unsearched

    def predict(self, unsearched):

        # for each i, coordinate in unsearched, the index in indicies[i] is the most
        # similar coordinate in searched.  distance[i] is the square of the distance to
        # the most similar coordinate.
        # print(unsearched)
        us = np.asarray(unsearched, dtype=np.float32)
        print(us)
        print("")
        print(us.shape)
        print("")
        distances, indices = self.index.search(us, k=self.k)
        # print(indices)
        # print(distances)
        maxDistIndex = np.argmax(distances)
        unsearchedCoordFurthest = unsearched[maxDistIndex]
        distOfFurthest = distances[maxDistIndex]
        # print("")
        # print("maxDistIndex")
        # print(maxDistIndex)
        # print("")
        # print("unsearchedCoordFurthest")
        # print(unsearchedCoordFurthest)
        # print("")
        # print("distOfFurthest")
        # print(distOfFurthest)
        return unsearchedCoordFurthest

    def close():
        self.index = None
        self.unsearched = None

        # for d, i in zip(distances, indices):
        #     print(d[0], i[0])


        # print("distances size")
        # print(distances.shape)
        # votes = self.unsearched[indices]
        #
        # x, y, z = votes.shape
        # votes = np.reshape(votes, (x, z))
        # maxIndex = np.argmax(distances)
        # print(indices[maxIndex])
        # print()
        #
        # return 1
        # predictions = np.array([np.argmax(np.bincount(x)) for x in indices])
        # return unsearchedCoordFurthest
