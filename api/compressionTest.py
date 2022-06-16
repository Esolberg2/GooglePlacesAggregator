import random
import pickle
import redis
from sys import getsizeof

import bz2
import json

import gzip


import sys
import inspect
import logging

logger = logging.getLogger(__name__)

def get_size(obj, seen=None):
    """Recursively finds size of objects in bytes"""
    size = sys.getsizeof(obj)
    if seen is None:
        seen = set()
    obj_id = id(obj)
    if obj_id in seen:
        return 0
    # Important mark as seen *before* entering recursion to gracefully handle
    # self-referential objects
    seen.add(obj_id)
    if hasattr(obj, '__dict__'):
        for cls in obj.__class__.__mro__:
            if '__dict__' in cls.__dict__:
                d = cls.__dict__['__dict__']
                if inspect.isgetsetdescriptor(d) or inspect.ismemberdescriptor(d):
                    size += get_size(obj.__dict__, seen)
                break
    if isinstance(obj, dict):
        size += sum((get_size(v, seen) for v in obj.values()))
        size += sum((get_size(k, seen) for k in obj.keys()))
    elif hasattr(obj, '__iter__') and not isinstance(obj, (str, bytes, bytearray)):
        try:
            size += sum((get_size(i, seen) for i in obj))
        except TypeError:
            logging.exception("Unable to get size of %r. This may lead to incorrect sizes. Please report this error.", obj)
    if hasattr(obj, '__slots__'): # can have __slots__ with __dict__
        size += sum(get_size(getattr(obj, s), seen) for s in obj.__slots__ if hasattr(obj, s))

    return size



print(dir(gzip))

floatlist = [[str(random.random()), str(random.random())] for _ in range(1000)]

# print([[random.random(), random.random()] for _ in range(1000)])
# print([[random.random(), random.random()] for _ in range(1000)])
# print("")


import json
import random
searches = {1: {"searched": [[random.random(), random.random()] for _ in range(1000)],
                "unsearched": [[random.random(), random.random()] for _ in range(1000)]
                }}

print()
print(json.dumps(searches))


searches2 = {2: {"searched": [[random.random(), random.random()] for _ in range(1000)],
                "unsearched": [[random.random(), random.random()] for _ in range(1000)]
                }}
# floatlist = [str(tup) for tup in floatlist1]
# print(floatlistStr)
# print(floatlist[:10])
r = redis.StrictRedis(host='localhost', port=6379, db=0)
# floatlist = [0.45334689832996333, 0.27126766418347603, 0.8665759595528838, 0.7516285454436182, 0.27283429367543766, 0.6621259311336027, 0.06674791172732164, 0.5460509357990115, 0.18171704672870748, 0.7387647836311209]
pickled_object = pickle.dumps(searches)
print(type(pickled_object))
bz2Obj = bz2.compress(pickled_object)

pickled_object2 = pickle.dumps(searches2)
bz2Obj2 = bz2.compress(pickled_object2)

print(bz2Obj == bz2Obj2)

# print(pickled_object_decom[1]["searched"] == searches[1]["searched"])
# print(pickled_object_decom[1]["unsearched"] == searches[1]["unsearched"])


# print(get_size(bz2Obj)) # this is the best option for compression




# bz_pickle = bz2.compress(pickle.dumps(searches))
# # bz_only = bz2.compress(floatlist)
# print(type(floatlist))
# print(getsizeof(searches))
# print(getsizeof(pickled_object))
# print(getsizeof(bz_pickle))
# print(searches)
# print(pickle.loads(bz2.decompress(bz_pickle)))
# # print(getsizeof(bz_only))

# r.set('some_key', bz2Obj)
# unpacked_object = pickle.loads(r.get('some_key'))
# print(floatlist == unpacked_object)
