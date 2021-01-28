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
    print('template got clicked!')
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

# @cache.cached()
def list_managers(status=None, modified_after=None):

    client = ptl.FractalClient("api.qcarchive.molssi.org", username=os.environ.get('QCFRACTAL_USER', None),
                               password=os.environ.get('QCFRACTAL_PASSWORD', None))
    ret_modified = client.query_managers(status=None, full_return=True) # [Need to discuss this] #Type: List of dictionaries
    # ret_modified = client.query_managers(status=None) # [Need to discuss this]

    ret_modified_data = ret_modified.data
    print("type(ret_modified_data)")
    print(type(ret_modified_data))

    # print("ret_modified_data")
    # print(ret_modified_data)

    n_found = ret_modified.meta.n_found
    trips = math.ceil(n_found/1000)
    print("ret_modified.meta.n_found")
    print(ret_modified.meta.n_found)
    start = time.time()
    # for i in range (4):
    #     # ret_chunk = client.query_managers(status=None, skip= (i+1)*1000,full_return= True) # [Need to discuss this]
    #     ret_chunk = client.query_managers(status=None) # [Need to discuss this]

    #     ret_modified_data.extend(ret_chunk.data)
    #     # print(len(ret_modified_data))
    end = time.time()
    print("Time Taken")
    print(end - start)

    jsonified_data = jsonify(ret_modified_data) #Type: 'flask.wrappers.Response'
    print(type(jsonified_data))
    # Each dictionary in the list looks like the following:
    # {'id': '1', 'name': 'unknown-molssi10-91e21876-f603-4762-ad29-f84430569597', '
    # cluster': 'unknown', 'hostname': 'molssi10', 'username': None, 
    # 'uuid': '91e21876-f603-4762-ad29-f84430569597', 'tag': None, 
    # 'completed': 138, 'submitted': 700, 'failures': 0, 'returned': 562, 
    # 'total_worker_walltime': None, 'total_task_walltime': None, 'active_tasks': None, 
    # 'active_cores': None, 'active_memory': None, 'configuration': None, 'status': 'INACTIVE', 
    # 'created_on': '2019-03-07T13:49:41.754000', 'modified_on': '2019-03-07T14:10:38.453000', '
    # qcengine_version': None, 'manager_version': None, 'programs': None, 'procedures': None}

    hostnames_clusternames_tuple_set_py = set()
    returned_data_dict = {}
    for i in ret_modified_data:
        hostnames_clusternames_tuple_py = tuple((i["hostname"], i["cluster"]))
        hostnames_clusternames_tuple_set_py.add(hostnames_clusternames_tuple_py)
        returned_data_dict={"hostnames_clusternames_tuple_set":hostnames_clusternames_tuple_set_py}

        print (type(returned_data_dict))
        print(len(returned_data_dict))



    # return jsonify(ret_modified)
    return jsonify(ret_modified_data)

##############################################################################


def set_default(obj):
    if isinstance(obj, set):
        return list(obj)
    raise TypeError
