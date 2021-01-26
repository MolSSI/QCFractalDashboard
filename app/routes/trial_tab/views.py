from flask import render_template
import json
from . import trial_tab

import qcportal as ptl
import pandas as pd
from flask import jsonify
import math
from ... import cache
import time
import os


@trial_tab.route("/views/trial_tab_page")
def trial_tab_page():
    return render_template("trial_tab/trial_tab_page.html")


@trial_tab.route("/views/template")
def my_link():
    print('I got clicked!')
    return render_template("trial_tab/template.html")


@trial_tab.route("/views/data")
def getdata():
    traceA = {
        "x": {1, 2, 3, 4, 16, 17, 26},
        "y": {1, 40, 9, 60, 4, 20, 10},
        "type": 'scatter'
    }
    return json.dumps(traceA, default=set_default)


@trial_tab.route("/views/QCPortal_data")
def getdata_QCPortal():

    client = ptl.FractalClient("api.qcarchive.molssi.org")
    result = client.list_collections().head().to_json(orient="split")
    print(type(result))
    return json.dumps(result, default=set_default)


########################### Managers status related #########################
@trial_tab.route("/views/managers_status_tab_render")
def my_link2():
    print('Managers got clicked!')
    return render_template("trial_tab/managers_status_tab.html")


@trial_tab.route("/views/managers_status")
def getdata2():
    traceA = {
        "x": {1, 2, 3, 4, 16, 17, 26},
        "y": {1, 40, 9, 60, 4, 20, 10},
        "type": 'scatter'
    }
    return json.dumps(traceA, default=set_default)


@trial_tab.route("/views/managers_status_tab")
def call_data():
    return list_managers()

@cache.cached()
def list_managers(status=None, modified_after=None):
    # call the function X here
    # move this part to another function X

    client = ptl.FractalClient("api.qcarchive.molssi.org", username=os.environ.get('QCFRACTAL_USER', None),
                               password=os.environ.get('QCFRACTAL_PASSWORD', None))
    # ret_modified = client.query_managers(status=None, full_return=True) # [Need to discuss this]
    ret_modified = client.query_managers(status=None) # [Need to discuss this]

    # ret_modified_data = ret_modified.data
    # print(type(ret_modified_data))
    # print(len(ret_modified_data))
    # n_found = ret_modified.meta.n_found
    # trips = math.ceil(n_found/1000)
    # print(ret_modified.meta.n_found)
    start = time.time()
    # for i in range (4):
    #     # ret_chunk = client.query_managers(status=None, skip= (i+1)*1000,full_return= True) # [Need to discuss this]
    #     ret_chunk = client.query_managers(status=None) # [Need to discuss this]

    #     ret_modified_data.extend(ret_chunk.data)
    #     # print(len(ret_modified_data))
    end = time.time()
    print("Time Taken")
    print(end - start)


# ###############
    return jsonify(ret_modified)
    # return jsonify(ret_modified_data)

##############################################################################


def set_default(obj):
    if isinstance(obj, set):
        return list(obj)
    raise TypeError
