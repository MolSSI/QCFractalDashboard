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
from datetime import datetime

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
    print('Managers got clicked!!!!!!')
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
    print("lets see")
    return list_managers()


@cache.cached()
def list_managers(status=None, modified_after=None):

    client = ptl.FractalClient("api.qcarchive.molssi.org", username=os.environ.get('QCFRACTAL_USER', None),
                               password=os.environ.get('QCFRACTAL_PASSWORD', None))
    # [Need to discuss this] #Type: List of dictionaries
    ret_modified = client.query_managers(status=None, full_return=True)
    # ret_modified = client.query_managers(status=None) # [Need to discuss this]

    ret_modified_data = ret_modified.data  # returns dictionaries
    print("type(ret_modified_data[0])")
    print(ret_modified_data[0]['hostname'])

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

    # Each element in the list looks like the following:
        # {'id': '1', 'name': 'unknown-molssi10-91e21876-f603-4762-ad29-f84430569597', '
        # cluster': 'unknown', 'hostname': 'molssi10', 'username': None,
        # 'uuid': '91e21876-f603-4762-ad29-f84430569597', 'tag': None,
        # 'completed': 138, 'submitted': 700, 'failures': 0, 'returned': 562,
        # 'total_worker_walltime': None, 'total_task_walltime': None, 'active_tasks': None,
        # 'active_cores': None, 'active_memory': None, 'configuration': None, 'status': 'INACTIVE',
        # 'created_on': '2019-03-07T13:49:41.754000', 'modified_on': '2019-03-07T14:10:38.453000', '
        # qcengine_version': None, 'manager_version': None, 'programs': None, 'procedures': None}

    clusternameHostnameModifiedOnMonthYearDict = {}
    hostnamesArray = []
    hostnamesCompletedDict = {}
    hostnamesFailedDict = {}
    clusternameDict = {}

    for i in ret_modified_data:
        # values = {'Hostname': i['hostname'],'Cluster': i['cluster'], 'Name': i['name'],
        #                             'Completed': i['completed'], 'Submitted': i['submitted'], 'Failures': i['failures'],
        #                              'Returned': i['returned'], 'modified_on': i['modified_on']}
        print(i)
        clustername = i['cluster']
        hostname = i['hostname']

        # example of the modified_on field: 2019-07-04T22:36:28.618504
        dateString = i['modified_on']
        dateString = dateString.split('T',1)
        dateObj =  datetime.strptime(dateString[0], "%Y-%m-%d") 
        modifiedOnMonth = dateObj.month 
        modifiedOnYear = dateObj.year
        hostname_modifiedOn = {'Hostname': i['hostname'], 'Modified On Month':  modifiedOnMonth, 
                                'Modified On Year': modifiedOnYear}
       
        print("clustername:")
        print(clustername)

        print("hostname:")
        print(hostname)


        if clustername in clusternameHostnameModifiedOnMonthYearDict:
            print("cluster key exists in the dictionary")
            # Check if the corresponding array contains the current hostname
            # if not append to the array
            print("**********************************")
            print("clusternameHostnameModifiedOnMonthYearDict[clustername]= ")
            print(clusternameHostnameModifiedOnMonthYearDict[clustername])
            print("**********************************")

            hostnamesArray = clusternameHostnameModifiedOnMonthYearDict[clustername]
            print("**********************************")
            print("hostnamesArray")
            print(hostnamesArray)
            print("**********************************")

            if not hostname_modifiedOn in hostnamesArray:
                print("hostname doesn't exists in the array of hostnames, so add it")
                hostnamesArray.append(hostname_modifiedOn)
        else:
            print("cluster key doesn't exists in the dictionary")
            clusternameHostnameModifiedOnMonthYearDict[clustername] = [hostname_modifiedOn]
        print("**********************************")
        print("clusternameHostnameModifiedOnMonthYearDict")
        print(clusternameHostnameModifiedOnMonthYearDict)
        print("**********************************")
#########################################################################################################################
        # Save the number of Compeleted per hostnames
        completed = i['completed']
        failures = i['failures']
        if hostname in hostnamesCompletedDict:
            hostnamesCompletedDict[hostname] = hostnamesCompletedDict[hostname] + completed
        else:
            hostnamesCompletedDict[hostname] = completed

            # Save the number of Failures per hostnames
        if hostname in hostnamesFailedDict:
            hostnamesFailedDict[hostname] = hostnamesFailedDict[hostname] + failures
        else:
            hostnamesFailedDict[i['hostname']] = failures
        print("**********************************")
        print("hostnamesCompletedDict")
        print(hostnamesCompletedDict)
        print("**********************************")


        print("hostnamesFailedDict")
        print(hostnamesFailedDict)
########################################################################################################################
#
        print("=========================================================================================================")

    # Type: 'flask.wrappers.Response'
    # jsonified_data = jsonify(ret_modified_data)
    # print(jsonified_data.data)
    

    returned_data_dict = {}

    # for i in ret_modified_data:

    #     hostnames_clusternames_tuple_py = tuple((i["hostname"], i["cluster"]))
    #     hostnames_clusternames_tuple_set_py.add(hostnames_clusternames_tuple_py)
    #     returned_data_dict={"hostnames_clusternames_tuple_set":hostnames_clusternames_tuple_set_py}
    #     #{}

    #     print (type(returned_data_dict))
    #     print(len(returned_data_dict))

    # var1 --> dictionary
    # return jsonify(ret_modified)
    # return jsonify({'variabl1': var1, 'variable2': var2})
    return jsonify(ret_modified_data)

##############################################################################


def set_default(obj):
    if isinstance(obj, set):
        return list(obj)
    raise TypeError
