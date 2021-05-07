# -*- encoding: utf-8 -*-
"""
Copyright (c) 2019 - present AppSeed.us
"""

from flask import Flask, url_for
from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy
from importlib import import_module
from logging import basicConfig, DEBUG, getLogger, StreamHandler
from os import path
from flask_caching import Cache
from pathlib import Path
import logging
from logging.handlers import RotatingFileHandler


db = SQLAlchemy()
login_manager = LoginManager()
login_manager.login_view = 'base_blueprint.login'
cache = Cache(config={'CACHE_TYPE': 'SimpleCache'})


def register_extensions(app):
    db.init_app(app)
    login_manager.init_app(app)
    cache.init_app(app)

def register_blueprints(app):
    for module_name in ('base', 'home'):
        module = import_module('app.{}.routes'.format(module_name))
        app.register_blueprint(module.blueprint)

def configure_database(app):

    @app.before_first_request
    def initialize_database():
        db.create_all()

    @app.teardown_request
    def shutdown_session(exception=None):
        db.session.remove()

def set_up_logging(app):
    Path("logs").mkdir(parents=True, exist_ok=True)
    # logging.basicConfig(filename='logs/flask.log')

    handler = RotatingFileHandler('logs/flask.log', maxBytes=5 * 1024 * 1024)
    formatter = logging.Formatter('[%(asctime)s] - %(name)s:%(filename)s:%(funcName)s:%(lineno)d - %(levelname)s - %(message)s', "%Y-%m-%d %H:%M:%S")
    handler.setFormatter(formatter)

    logging.getLogger('werkzeug').addHandler(handler)
    logging.getLogger('werkzeug').setLevel(logging.WARNING)

    app.logger.addHandler(handler)
    app.logger.setLevel(logging.DEBUG)

def create_app(config):
    app = Flask(__name__, static_folder='base/static')
    app.config.from_object(config)

    register_extensions(app)
    register_blueprints(app)
    configure_database(app)
    set_up_logging(app)

    app.logger.info('-- App started ---')

    return app
