# -*- encoding: utf-8 -*-
"""
Copyright (c) 2019 - present AppSeed.us
"""

import qcfractal.interface as ptl

from flask import jsonify, render_template, redirect, request, url_for, current_app as app
from flask_login import (
    current_user,
    login_required,
    login_user,
    logout_user
)

from app import db, login_manager
from app.base import blueprint
from app.base.forms import LoginForm, CreateAccountForm
from app.base.models import User, ClientUser
from app.base.util import verify_pass


store = {}


def get_client(url=None, username=None, password=None, redirect_to_login=True, force_login=False):
    print("============================================")
    print("came to getClient")
    print("'client' in store")
    print('client' in store)
    if not force_login and 'client' in store:
        print("store['client'] if not force_login and 'client' in store")
        print(store['client'])
        return store['client']

    try:
        print("url=")
        print(url)
        print("username")
        print(username)
        print("password")
        print(password)

        if not url==None and not username==None and not password ==None:
            store['client'] = ptl.FractalClient(address=url, username=username, password=password)
            print("store['client'] in try store['client'] = ptl.FractalClient(...)")
            print(store['client'])
            return store['client']
        elif url==None or username==None or password ==None:
            print("elif")
            app.logger.error(f'Error logging in since either url or username or password = none') # ERROR in routes: Error logging in: argument of type 'NoneType' is not iterable
            if redirect_to_login:
                    print("redirect_to_login in getClient()")
                    print("url for base_blueprint in elif")
                    print(url_for('base_blueprint.login'))
                    # return render_template('accounts/login.html',form = LoginForm(request.form))
                    # login()
                    # return redirect(url_for('base_blueprint.LoginPage'))
                    return redirect(url_for('base_blueprint.login'))
                    # return redirect(url_for('base_blueprint.route_default'))
    
    
    except Exception as e:
        print("exception")
        print(e)
        app.logger.error(f'Error logging  in: {e}') # ERROR in routes: Error logging in: argument of type 'NoneType' is not iterable
        if redirect_to_login:
            print("redirect_to_login in exceptttttttt in getClient")
            print("url for base_blueprint")
            print(url_for('base_blueprint.login'))
            return redirect(url_for('base_blueprint.login'))
        return False

@blueprint.route("/LoginPage")
def LoginPage():
    return "You are redirected to Login Page"

@blueprint.route('/')
def route_default():
    print("redirecting to default: login")
    return redirect(url_for('base_blueprint.login'))
    # return redirect(url_for('home_blueprint.index'))

## Login & Registration

@blueprint.route('/login', methods=['GET', 'POST'])
def login():
    print("============================================")
    print("came to login()")
    login_form = LoginForm(request.form)
    print("request")
    print (request)

    print("request.form")
    print (request.form)

    print("current_user")
    print(current_user.is_authenticated)

    print("login_form")
    print(login_form)
    if 'login' in request.form:
        print("if 'login' in request.form is true")

        # read form data
        url = request.form['server_url']
        username = request.form['username']
        password = request.form['password']
        # Locate user
        # user = User.query.filter_by(username=username).first()

        # Check the password
        # if user and verify_pass(password, user.password):
        #     login_user(user)
        #     return redirect(url_for('base_blueprint.route_default'))

        if get_client(url, username, password, redirect_to_login=False, force_login=True):
            app.logger.info(f'User {username} loggged in to QCPortal successfully')
            login_user(ClientUser(username=username))
            # return redirect(url_for('base_blueprint.route_default')) #Undid this: Eman changed default to be index instead of login here
            return redirect(url_for('home_blueprint.index')) 


        elif url==None or username==None or not password ==None:
            app.logger.error(f'Error logging in since either url or username or password = none') # ERROR in routes: Error logging in: argument of type 'NoneType' is not iterable
            print("current_user.username in line 114" )
            # print(current_user.username)
            # print(current_user.password)
            # print(current_user.url)
            print("ClientUser")
            print(ClientUser)
            print("redirect_to_login in login(), force_login is set to True")
            print("redirect_to_login")
            print("url for base_blueprint in elif")
            print(url_for('base_blueprint.login'))
            # current_user.is_authenticated = False
            return redirect(url_for('base_blueprint.login'))

        # Something (user or pass) is not right
        return render_template('accounts/login.html',
                               msg='Wrong user or password, or don\'t have access to server',
                               msg_class='text-danger',
                               form=login_form)


    if not current_user.is_authenticated:
        print("not current_user.is_authenticated")
        return render_template('accounts/login.html',
                               form=login_form)



    print("returning render_template(accounts/login.html'")
    return render_template('accounts/login.html',
                               form=login_form)
    # elif current_user.is_authenticated:
    #     print("current_user.username in line 139")
    #     print("ClientUser")
    #     print(ClientUser)
    #     print(current_user.username)
    #     print(current_user.password)
    #     print(current_user.url)

    # print("returnung redirect(url_for('home_blueprint.index'))")
   
    # return redirect(url_for('home_blueprint.index'))


@blueprint.route('/register', methods=['GET', 'POST'])
def register():
    login_form = LoginForm(request.form)
    create_account_form = CreateAccountForm(request.form)
    if 'register' in request.form:

        username = request.form['username']
        email = request.form['email']

        # Check usename exists
        user = User.query.filter_by(username=username).first()
        if user:
            return render_template('accounts/register.html',
                                   msg='Username already registered',
                                   success=False,
                                   msg_class='text-danger',
                                   form=create_account_form)

        # Check email exists
        user = User.query.filter_by(email=email).first()
        if user:
            return render_template('accounts/register.html',
                                   msg='Email already registered',
                                   success=False,
                                   msg_class='text-danger',
                                   form=create_account_form)

        # else we can create the user
        user = User(**request.form)
        db.session.add(user)
        db.session.commit()

        return render_template('accounts/register.html',
                               msg='User created please <a href="/login">login</a>',
                               success=True,
                               msg_class='text-success',
                               form=create_account_form)

    else:
        return render_template('accounts/register.html', form=create_account_form)


@blueprint.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('base_blueprint.login'))


## Errors

# instead of showing 403 page, redirect to login page
# @login_manager.unauthorized_handler
# def unauthorized_handler():
#     return render_template('page-403.html'), 403

@blueprint.errorhandler(403)
def access_forbidden(error):
    return render_template('page-403.html'), 403


@blueprint.errorhandler(404)
def not_found_error(error):
    return render_template('page-404.html'), 404


@blueprint.errorhandler(500)
def internal_error(error):
    return render_template('page-500.html'), 500
