"""Flask configuration."""
from os import environ, path
from dotenv import load_dotenv

basedir = path.abspath(path.dirname(__file__))
load_dotenv(path.join(basedir, '.env'))


class Config:
    """Base config."""
    # FLASK_APP = 'wsgi.py'
    SECRET_KEY = environ.get('SECRET_KEY')
    # REDIS_URL = "redis://:localhost:6379"
    # REDIS_URL = "redis://:0.0.0.0:6379"
    # REDIS_URL = "redis://:redisx:6379"
    # SESSION_COOKIE_NAME = environ.get('SESSION_COOKIE_NAME')
    # STATIC_FOLDER = 'static'
    # TEMPLATES_FOLDER = 'templates'

    # Database
    SQLALCHEMY_DATABASE_URI = environ.get("SQLALCHEMY_DATABASE_URI")
    SQLALCHEMY_ECHO = False
    SQLALCHEMY_TRACK_MODIFICATIONS = False


class ProdConfig(Config):
    FLASK_ENV = 'production'
    DEBUG = False
    TESTING = False
    # REDIS_HOST = 'redis'
    # REDIS_PORT = '6379'
    # DATABASE_URI = environ.get('PROD_DATABASE_URI')

    # REDIS_URL = "redis://:redis:6379"

class DevConfig(Config):
    FLASK_ENV = 'development'
    DEBUG = True
    TESTING = True
    # REDIS_HOST = 'localhost'
    # REDIS_PORT = '6379'
    # DATABASE_URI = environ.get('DEV_DATABASE_URI')

    # REDIS_URL = "redis://:localhost:6379"

config = {
    'dev': DevConfig,
    'prod': ProdConfig,
    'default': DevConfig,
}
