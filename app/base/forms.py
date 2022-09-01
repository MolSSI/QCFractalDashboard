# -*- encoding: utf-8 -*-
"""
Copyright (c) 2019 - present AppSeed.us
"""

from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField
from wtforms.validators import InputRequired, Email, DataRequired, URL
from wtforms.fields import URLField
from config import Config

## login and registration

class LoginForm(FlaskForm):
    server_url = URLField('Server URL', id='server_url', validators=[DataRequired(), URL()],
                          default=Config.DEFAULT_SERVER)
    username = StringField('Username', id='username_login', validators=[DataRequired()])
    password = PasswordField('Password', id='pwd_login', validators=[DataRequired()])

class CreateAccountForm(FlaskForm):
    username = StringField('Username', id='username_create', validators=[DataRequired()])
    email    = StringField('Email', id='email_create', validators=[DataRequired(), Email()])
    password = PasswordField('Password' , id='pwd_create', validators=[DataRequired()])