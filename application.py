# -*- encoding: utf-8 -*-
"""
Copyright (c) 2019 - present AppSeed.us
"""

from flask_migrate import Migrate
from os import environ
from sys import exit
import decouple
import logging

from config import config_dict
from app import create_app, db

# WARNING: Don't run with debug turned on in production!
DEBUG = decouple.config('DEBUG', default=True, cast=bool)

# The configuration
get_config_mode = 'Debug' if DEBUG else 'Production'

try:
    
    # Load the configuration using the default values 
    app_config = config_dict[get_config_mode.capitalize()]

except KeyError:
    exit('Error: Invalid <config_mode>. Expected values [Debug, Production] ')

application = create_app( app_config ) 
Migrate(application, db)

if DEBUG:
    application.logger.info('DEBUG       = ' + str(DEBUG)      )
    application.logger.info('Environment = ' + get_config_mode )
    application.logger.info('DBMS        = ' + app_config.SQLALCHEMY_DATABASE_URI )

if __name__ == "__main__":
    application.run()
