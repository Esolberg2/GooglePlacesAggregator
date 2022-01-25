from flask import Flask
from flask_restful import Api, Resource
import time

# app = Flask(__name__)
#
# @app.route('/time')
# def get_current_time():
#     return {"time": time.time()}


app = Flask(__name__)
api = Api(app)

class HelloWorld(Resource):
    def get(self, test, name):
        return {"data": name, "test": test}

api.add_resource(HelloWorld, "/helloworld/<string:name>/<int:test>")

# class HelloWorld(Resource):
#     def get():
#         return {"time": time.time()}
#
# api.add_resource(HelloWorld, "/time")
# if __name__ == ("__main__"):
#     app.run(debug=False)
