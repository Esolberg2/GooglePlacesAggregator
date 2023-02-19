from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_redis import FlaskRedis
from config import config


# Globally accessible libraries
db = SQLAlchemy()
r = FlaskRedis()


def init_app():
    """Initialize the core application."""
    app = Flask(__name__)
    app.config.from_object(config.get('prod'))

    # Initialize Plugins
    db.init_app(app)
    r.init_app(app)

    with app.app_context():
        # Include our Routes
        from . import api

        # Register Blueprints
        app.register_blueprint(api.api_bp)

        db.create_all()  # Create sql tables for our data models

        return app
