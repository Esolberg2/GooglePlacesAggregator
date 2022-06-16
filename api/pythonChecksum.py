import base64
import time
import hashlib
import js2py
import json
# import simplejson as json
import numpy as np

import hashlib
import js2py

def checksum(obj):
    JSON = js2py.eval_js('JSON')
    msg = JSON.stringify(obj);
    msg = msg.encode(encoding='utf-8')
    hash = hashlib.md5(msg)
    print(hash.hexdigest())


# 9.57909089726039e-05

with open("test.json") as test:
    dictionary = json.load(test)


checksum(dictionary)
# 0a618344e7520c5d330d5153abed9993
# CryptoJS = js2py.require('crypto-js')

# JSON = js2py.eval_js('JSON')
# msg = JSON.stringify(dictionary["1"]["searched"]);
# msg = msg.encode(encoding='utf-8')
# hash = hashlib.md5(msg)
# print(hash.hexdigest())
#
# print(msg)
#
# np.set_printoptions(suppress=True)
# np.set_printoptions(precision=19)
# t = np.array(dictionary["1"]["searched"])
# t = t.reshape(t.size)
# t = np.array2string(t)


# print(t.find("957909"))
#
# print(t)

# searchedString = json.dumps(dictionary["1"]["searched"], separators=(',', ':'))
# print(searchedString)
# print(searchedString.find("957"))
#
# np.set_printoptions(suppress=True)
# np.set_printoptions(precision=19)
#
# x = np.array(dictionary["1"]["searched"])
# x = x.flatten()
#
# c = np.savetxt('geekfile.txt', x, delimiter =', ', fmt='%1.19f')
# a = open("geekfile.txt", 'r')# open file in read mode
#
# print("the file contains:")
# print(a.read())

# print(type(searchedString[0]))
# print(searchedString.index("[9.57909089726039e-05,0.9256393574859646]"))
# for c in searchedString:
#     print(c)
# print(searchedString.find("9.57909089726039e-05,0.9256393574859646]"))


# print(searchedString[0])
# print(searchedString[-1])
# print(len(searchedString))
# searchedString = "".join(searchedString.split())
# print(searchedString[0])
# print(searchedString[-1])
# print(len(searchedString))

# with open("pyString.txt", 'w') as test:
#     test.write(searchedString)

# print(len("".join(searchedString.split())))

import base64
import time
import hmac
import hashlib
import binascii
# db870a832153264c83bbf858a9f1feca

# key = "bookbookbook".encode(encoding='utf-8')
# msg = msg.encode(encoding='utf-8')
# hash = hashlib.md5(msg)
# print(hash.hexdigest())

# db870a832153264c83bbf858a9f1feca

# print(dir(hash))
# print(dir(hash.digest))
# print(hash.digest.__text__)
