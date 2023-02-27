from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
from config import config
import redis
import os

flaskEnv = os.getenv('FLASK_ENV')
if flaskEnv == 'production':
    redisHost = 'redis'
else:
    redisHost = 'localhost'

db = SQLAlchemy()
r = redis.Redis(
    host=redisHost,
    port=6379
    )

def init_app():
    """Initialize the core application."""
    app = Flask(__name__)
    app.config.from_object(config.get('prod'))

    # Initialize Plugins
    db.init_app(app)

    with app.app_context():
        # Include our Routes
        from . import api

        # Register Blueprints
        app.register_blueprint(api.api_bp)

        db.create_all()  # Create sql tables for our data models

        return app
