from flask import Flask, request, jsonify
from flask_restful import Api, Resource
import json
from db import query
import time

# app = Flask(__name__)
#
# @app.route('/time')
# def get_current_time():
#     return {"time": time.time()}


app = Flask(__name__)
api = Api(app)

class Test(Resource):
    def put(self):
        json_data = request.get_json(force=True)
        print(json_data)
        return json_data

    def get(self):
        results = query("Select * from sessions", [])
        return results

    def post(self):
        json_data = request.get_json(force=True)
        print(json_data)
        data = json_data['data']
        return jsonify(dataOut=data)

class Session(Resource):
    def get(self, key):
        print(key.split("|"))
        results = query("Select * from sessions where sessionID=? and salt=? and user=?", key.split("-"))
        print("results:", results)
        return {"data": results["returned"][0]}

    # used to issue a new sessionID.  This happens only when a user clears their results from the
    # browser and restarts a new search.  The key returned by this endpoint
    # is unique to the user, and can be used to fetch past results or continue from an
    # old search.
    def post(self):
        json_data = request.get_json(force=True)
        name = json_data["name"]
        regions = json.dumps(json_data["regions"])
        newSessionID = query("INSERT INTO sessions (user, regions) VALUES(?, ?)", [name, regions])['lastRowID']
        results = query("Select * from sessions where sessionID=?", [newSessionID])['returned'][0]
        return jsonify(userKey=results)

    # def post(self):
    #     json_data = request.get_json(force=True)
    #     data = json_data['data']

class Searches(Resource):
    def get(self):
        return {"data": [7, 8, 9]}

    def post(self):
        json_data = request.get_json(force=True)
        data = json_data['data']

        return jsonify(dataOut=data)

class Archive(Resource):
    def get(self):
        return {"data": [7, 8, 9]}

    def post(self):
        json_data = request.get_json(force=True)
        data = json_data['data']

        return jsonify(dataOut=data)


class sessionProgress(Resource):
    def get(self):
        return {"data": [7, 8, 9]}

    def post(self):
        json_data = request.get_json(force=True)
        data = json_data['data']

        return jsonify(dataOut=data)
# sessions
# searches
# archive
# sessionProgress

api.add_resource(Test, "/test")
api.add_resource(Session, "/session", "/session/<string:key>")
api.add_resource(Searches, "/searches")
api.add_resource(Archive, "/archive")
api.add_resource(sessionProgress, "/sessionprogress")

# class HelloWorld(Resource):
#     def get():
#         return {"time": time.time()}
#
# api.add_resource(HelloWorld, "/time")
# if __name__ == ("__main__"):
#     app.run(debug=False)
