# from .application import init_app
# import application

from application import init_app
#
# print()
app = init_app()

if __name__ == "__main__":
    app.run(host='0.0.0.0')
