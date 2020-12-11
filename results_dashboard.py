#!/usr/bin/env python
import os
from app import create_app


# Debug mode is true, then no need to restart the server everytime we make any change
if __name__ == "__main__":
    app = create_app(os.getenv('FLASK_CONFIG') or 'default')
    app.run(debug=True, use_reloader=True)

