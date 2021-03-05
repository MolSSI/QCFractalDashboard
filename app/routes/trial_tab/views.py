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


@trial_tab.route("/views/managers_status_tab_render")
def my_link2():
    print('Managers got clicked!')
    return render_template("trial_tab/managers_status_tab.html")


@trial_tab.route("/views/database_statistics_tab_render")
def databaseStats():
    print('Database Stats got clicked!')
    return render_template("trial_tab/database_statistics.html")


@trial_tab.route("/views/results_statistics_tab_render")
def resultsStats():
    print('Results Stats got clicked!')
    return render_template("trial_tab/results_statistics.html")


@trial_tab.route("/views/tasks_queue_tab_render")
def tasksQueue():
    print('Tasks Queue got clicked!')
    return render_template("trial_tab/tasks_queue.html")

@trial_tab.route("/views/users_access_tab_render")
def usersAcess():
    print('Users Access Tab got clicked!')
    return render_template("trial_tab/users_access.html")


@trial_tab.route("/views/managers_status_tab")
def call_data():
    return list_managers()
@cache.cached()
def list_managers(status=None, modified_after=None):
    printVar = False
    client = ptl.FractalClient("api.qcarchive.molssi.org", username=os.environ.get('QCFRACTAL_USER', None),
                               password=os.environ.get('QCFRACTAL_PASSWORD', None))
    # [Need to discuss this] #Type: List of dictionaries
    ret_modified = client.query_managers(status=None, full_return=True)
    # ret_modified = client.query_managers(status=None) # [Need to discuss this]

    ret_modified_data = ret_modified.data  # returns dictionaries
    # print("type(ret_modified_data[0])")
    # print(ret_modified_data[0]['hostname'])

    n_found = ret_modified.meta.n_found
    trips = math.ceil(n_found/2000)
    print("ret_modified.meta.n_found")
    print(ret_modified.meta.n_found)
    start = time.time()
    for i in range(2):
        ret_chunk = client.query_managers(status=None, skip=(
            i+1)*2000, full_return=True)  # [Need to discuss this]
        # ret_chunk = client.query_managers(status=None) # [Need to discuss this]

        ret_modified_data.extend(ret_chunk.data)
        # print("trip")
        # print(type(ret_chunk))
    end = time.time()
    print("Time Taken to get the data")
    print(end - start)
    #################################### Using pandas dataframe ############################################
    startPrepare = time.time()

    df = pd.DataFrame(ret_modified_data)
    df['modified_on'] = pd.to_datetime( df['modified_on'])
    df['year'] = pd.DatetimeIndex(df['modified_on']).year
    df['month'] = pd.DatetimeIndex(df['modified_on']).month
    df.to_csv('/Users/emanhussein/Desktop/experimental_CSV.csv')
    sortedDF = df.sort_values(by = 'modified_on')

    hostClusterModifiedOnDF = sortedDF.groupby(['hostname','cluster']).tail(1)[['hostname','cluster','modified_on','month', 'year']]
    # print("sortedDF.groupby(['hostname','cluster'])")
    # ttt=sortedDF.groupby(['hostname','cluster'])
    # print(ttt.tail(1)['completed'])
    hostClusterCompletedFailureDF = sortedDF.groupby(['hostname','cluster'])['completed','failures'].sum().reset_index()
    print(hostClusterCompletedFailureDF)
    # tempObj_2 = pd.merge( tempObj['completed'] , tempObj['failures'], on = 'id')
    # hostClusterCompletedFailureDF = sortedDF.groupby(['hostname','cluster']).sum()['completed']#[['hostname','cluster','completed', 'failures']]
    # print(tempObj_2)
    # activeDF = sortedDF.loc[sortedDF['status'] == 'ACTIVE']
    activeOnlyDF= sortedDF.loc[sortedDF['status'] == 'ACTIVE']
    # print(activeOnlyDF.shape    )
    hostClusterActiveDF= activeOnlyDF.groupby(['hostname','cluster'])
    # print('hostClusterActiveDF')
    # print(hostClusterActiveDF)
    # hostClusterActiveTasksDF = sortedDF.groupby(['hostname','cluster']).sum()[['active_tasks']]
    # hostClusterActiveTasksDF = sortedDF.groupby(['hostname','cluster']).sum()[['active_tasks']]

    # # latest modified on
    # df.groupby(['hostname','cluster']).apply(lambda rows: rows[-1])['modified_on'] #
    # df.groupby(['hostname','cluster']).apply(lambda rows: getActiveStatus(rows))['status'] #
    # def getActiveStatus(rows): #row is a dataframe
    #     for i in rows.index:
    #         if rows.iloc[i]['status'] == 'ACTIVE': #rows.loc in case iloc gave an error
    #             return rows.iloc[i]
    #     return rows.iloc[0]

# The format of the JSON string:

# ‘split’ : dict like {‘index’ -> [index], ‘columns’ -> [columns], ‘data’ -> [values]}
# ‘records’ : list like [{column -> value}, … , {column -> value}]
# ‘index’ : dict like {index -> {column -> value}}
# ‘columns’ : dict like {column -> {index -> value}}
# ‘values’ : just the values array
# ‘table’ : dict like {‘schema’: {schema}, ‘data’: {data}}
# Describing the data, where data component is like orient='records'.

# Using orient='index' yeilds the following output sample
# jsonDF = hostClusterCompletedFailureModifiedOnDF.to_json(orient='index')
# {
#   "('Daniels-MBP.dhcp.lbnl.us', 'unlabeled')":{"completed":1,"failures":0},
#   "('Daniels-MacBook-Pro.local', 'DGAS_Laptop')":{"completed":1453,"failures":0}
# }
    jsonhostClusterModifiedOnDF = hostClusterModifiedOnDF.to_json(orient='records') 
    jsonhostClusterCompletedFailureDF = hostClusterCompletedFailureDF.to_json(orient='records') 
    # jsonDF_3 = hostClusterActiveDF.to_json(orient='index') 

    # print('jsonhostClusterModifiedOnDF')
    # print(jsonhostClusterModifiedOnDF)
    # print("===========================")

    # print('jsonhostClusterCompletedFailureDF')
    # print(jsonhostClusterCompletedFailureDF)
    # print("===========================")

    # # print('jsonDF_3')
    # # print(jsonDF_3)
    # print("===========================")

    endPrepare = time.time()
    print("Time Taken to prepare the data")
    print(endPrepare - startPrepare)
############################################## End of using Dataframe to prepare data #######################
    jsonAll = {'jsonhostClusterModifiedOnDF': jsonhostClusterModifiedOnDF, 'jsonhostClusterCompletedFailureDF': jsonhostClusterCompletedFailureDF}
    # print(jsonAll)
    # var1 --> dictionary
    # return jsonify(ret_modified)
    # return jsonify({'variabl1': var1, 'variable2': var2})

    # Each element in the list looks like the following:
    # {
    # 'id': '1',
    # 'name': 'unknown-molssi10-91e21876-f603-4762-ad29-f84430569597',
    # 'cluster': 'unknown',
    # 'hostname': 'molssi10',
    # 'username': None,
    # 'uuid': '91e21876-f603-4762-ad29-f84430569597',
    # 'tag': None,
    # 'completed': 138,
    # 'submitted': 700,
    # 'failures': 0,
    # 'returned': 562,
    # 'total_worker_walltime': None,
    # 'total_task_walltime': None,
    # 'active_tasks': None,
    # 'active_cores': None,
    # 'active_memory': None,
    # 'configuration': None,
    # 'status': 'INACTIVE',
    # 'created_on': '2019-03-07T13:49:41.754000',
    # 'modified_on': '2019-03-07T14:10:38.453000',
    # 'qcengine_version': None,
    # 'manager_version': None,
    # 'programs': None,
    # 'procedures': None
    # }

    # clusternameHostnameModifiedOnMonthYearDict = {}
    # hostnamesArray = []
    # hostnamesCompletedDict = {}
    # hostnamesFailedDict = {}

    # clusterCompletedDict = {}
    # clusterFailedDict = {}

    # clusterActiceTasksDict = {}
    # # hostnameDetails = {}
    # # clusternameDict = {}
    # startPrepare = time.time()
    # for i in ret_modified_data:
    #     clustername = i['cluster']
    #     hostname = i['hostname']

    #     # example of the modified_on field: 2019-07-04T22:36:28.618504
    #     dateString = i['modified_on']
    #     dateString = dateString.split('T', 1)
    #     dateObj = datetime.strptime(dateString[0], "%Y-%m-%d")
    #     modifiedOnMonth = dateObj.month
    #     modifiedOnYear = dateObj.year
    #     hostname_modifiedOn = {'Hostname': i['hostname'], 'Modified On Month':  modifiedOnMonth,
    #                            'Modified On Year': modifiedOnYear}

    #     if printVar==True:
    #         print("clustername:")
    #         print(clustername)

    #         print("hostname:")
    #         print(hostname)

    #     if clustername in clusternameHostnameModifiedOnMonthYearDict:
    #         if printVar ==True:
    #             print("cluster key exists in the dictionary")
    #             # Check if the corresponding array contains the current hostname
    #             # if not append to the array
    #             print("**********************************")
    #             print("clusternameHostnameModifiedOnMonthYearDict[clustername]= ")
    #             print(clusternameHostnameModifiedOnMonthYearDict[clustername])
    #             print("**********************************")

    #         hostnamesArray = clusternameHostnameModifiedOnMonthYearDict[clustername]
    #         if printVar==True:
    #             print("**********************************")
    #             print("hostnamesArray")
    #             print(hostnamesArray)
    #             print("**********************************")

    #         if not hostname_modifiedOn in hostnamesArray:
    #             if printVar==True:
    #                 print("hostname doesn't exists in the array of hostnames, so add it")
    #             # we don't want to use append
    #             hostnamesArray.append(hostname_modifiedOn)
    #     else:
    #         if printVar==True:
    #             print("cluster key doesn't exists in the dictionary")
    #         clusternameHostnameModifiedOnMonthYearDict[clustername] = [
    #             hostname_modifiedOn]
    #     if printVar==True:
    #         print("**********************************")
    #         print("clusternameHostnameModifiedOnMonthYearDict")
    #         print(clusternameHostnameModifiedOnMonthYearDict)
    #         print("**********************************")

    #     # Save the number of Compeleted per hostnames
    #     completed = i['completed']
    #     failures = i['failures']
    #     if hostname in hostnamesCompletedDict:
    #         hostnamesCompletedDict[hostname] = hostnamesCompletedDict[hostname] + completed
    #     else:
    #         hostnamesCompletedDict[hostname] = completed

    #         # Save the number of Failures per hostnames
    #     if hostname in hostnamesFailedDict:
    #         hostnamesFailedDict[hostname] = hostnamesFailedDict[hostname] + failures
    #     else:
    #         hostnamesFailedDict[i['hostname']] = failures
    #     if printVar==True:
    #         print("**********************************")
    #         print("hostnamesCompletedDict")
    #         print(hostnamesCompletedDict)
    #         print("**********************************")

    #         print("hostnamesFailedDict")
    #         print(hostnamesFailedDict)

    #     if i['status'] == "ACTIVE":
    #         if i['active_tasks'] != None:
    #             if i['cluster'] in clusterActiceTasksDict:
    #                 clusterActiceTasksDict[i['cluster']] = clusterActiceTasksDict[i['cluster']] + i['active_tasks']
                
    #             else :
    #                 clusterActiceTasksDict[i['cluster']] = i['active_tasks']
    #     if printVar==True:
    #         print("**********************************")
    #         print("clusterActiceTasksDict")
    #         print(clusterActiceTasksDict)
    #         print("**********************************")


    #         print("=========================================================================================================")

    # Type: 'flask.wrappers.Response'
    # jsonified_data = jsonify(ret_modified_data)
    # print(jsonified_data.data)
   
    # returned_data_dict = {}

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
    # return jsonify(ret_modified_data)
    return jsonAll

##############################################################################


def set_default(obj):
    if isinstance(obj, set):
        return list(obj)
    raise TypeError
