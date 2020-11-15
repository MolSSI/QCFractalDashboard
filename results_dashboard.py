#!/usr/bin/env python
from app import create_app
from flask import Flask, render_template,request #this has changed

# Debug mode is true, then no need to restart the server everytime we make any change
def run():
    app = create_app()
    app.run(debug=True, use_reloader=True)

if __name__ == "__main__":
    run()

