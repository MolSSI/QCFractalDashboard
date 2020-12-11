#!/usr/bin/env python
from app import create_app
from app import cache
from flask import Flask, render_template,request #this has changed
from flask_caching import Cache

# Debug mode is true, then no need to restart the server everytime we make any change
def run():
    app = create_app()
    # cache = Cache(app)
    # cache.init_app(app)

    app.run(debug=True, use_reloader=True)

if __name__ == "__main__":
    run()

