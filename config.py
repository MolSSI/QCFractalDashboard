# -*- encoding: utf-8 -*-
"""
Copyright (c) 2019 - present AppSeed.us
"""

import os
import  decouple
from pathlib import Path


class Config(object):

    basedir    = os.path.abspath(os.path.dirname(__file__))

    # Set up the App SECRET_KEY
    SECRET_KEY = decouple.config('SECRET_KEY', default='S#perS3crEt_007')

    # This will create a file in <app> FOLDER
    _db_path = Path(basedir, 'db-data')
    _db_path.mkdir(parents=True, exist_ok=True)
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + str(_db_path / 'db.sqlite3')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    DEFAULT_SERVER = decouple.config('DEFAULT_SERVER', 'https://staging.qcarchive.molssi.org')

class ProductionConfig(Config):
    DEBUG = False

    # Security
    SESSION_COOKIE_HTTPONLY  = True
    REMEMBER_COOKIE_HTTPONLY = True
    REMEMBER_COOKIE_DURATION = 3600

    # PostgreSQL database
    SQLALCHEMY_DATABASE_URI = '{}://{}:{}@{}:{}/{}'.format(
        decouple.config( 'DB_ENGINE'   , default='postgresql'    ),
        decouple.config( 'DB_USERNAME' , default='appseed'       ),
        decouple.config( 'DB_PASS'     , default='pass'          ),
        decouple.config( 'DB_HOST'     , default='localhost'     ),
        decouple.config( 'DB_PORT'     , default=5432            ),
        decouple.config( 'DB_NAME'     , default='appseed-flask' )
    )

class DebugConfig(Config):
    DEBUG = True

# Load all possible configurations
config_dict = {
    'Production': ProductionConfig,
    'Debug'     : DebugConfig
}
