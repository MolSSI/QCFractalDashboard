from flask import Blueprint

trial_tab = Blueprint('trial_tab', __name__)
managers_status_tab = Blueprint('managers_status_tab', __name__)
from . import views
