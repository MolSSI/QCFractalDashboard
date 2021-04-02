import qcportal as ptl
from flask import render_template, url_for, jsonify, current_app, request

import json
import pandas as pd
import numpy
import math
from ... import cache
import time
from datetime import datetime
import os
from . import trial_tab

# Start of Managers Tab-related functions
@trial_tab.route("/views/managers_status_tab_render")
def my_link2():
    return render_template("trial_tab/managers_status_tab.html")


@trial_tab.route("/views/managers_status_tab")
def call_data():
    return list_managers()


@cache.cached()
def list_managers(status=None, modified_after=None):
    client = ptl.FractalClient("api.qcarchive.molssi.org", username=os.environ.get(
        'QCFRACTAL_USER', None), password=os.environ.get('QCFRACTAL_PASSWORD', None))
    ret_modified = client.query_managers(status=None, full_return=True)
    ret_modified_data = ret_modified.data  # returns dictionaries
    n_found = ret_modified.meta.n_found
    trips = math.ceil(n_found/2000)
    for i in range(trips):
        ret_chunk = client.query_managers(status=None, skip=(
            i+1)*2000, full_return=True)
        ret_modified_data.extend(ret_chunk.data)
    df = pd.DataFrame(ret_modified_data)
    df['modified_on'] = pd.to_datetime(df['modified_on'])
    df['year'] = pd.DatetimeIndex(df['modified_on']).year
    df['month'] = pd.DatetimeIndex(df['modified_on']).month
    df.to_csv('/Users/emanhussein/Desktop/experimental_CSV.csv')
    sortedDF = df.sort_values(by='modified_on')

    hostClusterModifiedOnDF = sortedDF.groupby(['hostname', 'cluster']).tail(
        1)[['hostname', 'cluster', 'modified_on', 'month', 'year']]

    hostClusterCompletedFailureDF = sortedDF.groupby(['hostname', 'cluster'])[
        'completed', 'failures'].sum().reset_index()
    activeOnlyDF = sortedDF.loc[sortedDF['status'] == 'ACTIVE']
    hostClusterActiveDF = activeOnlyDF.groupby(['hostname', 'cluster'])

    jsonhostClusterModifiedOnDF = hostClusterModifiedOnDF.to_json(
        orient='records')
    jsonhostClusterCompletedFailureDF = hostClusterCompletedFailureDF.to_json(
        orient='records')
    jsonAll = {'jsonhostClusterModifiedOnDF': jsonhostClusterModifiedOnDF,
               'jsonhostClusterCompletedFailureDF': jsonhostClusterCompletedFailureDF}
    return jsonAll

# End of Managers Tab-related functions

# Start of Tasks Queue Tab-related functions
@trial_tab.route("/views/tasks_queue_tab_render")
def tasksQueue():
    return render_template("trial_tab/tasks_queue.html")


@trial_tab.route("/views/tasks_queue_sub_tab_render_datatable")
def tasksQueueSubtabDatatable():
    return render_template("trial_tab/tasks_queue_sub_tab_datatable.html")


@trial_tab.route("/views/tasks_queue_sub_tab_render_plots")
def tasksQueueSubTabPlot():
    return render_template("trial_tab/tasks_queue_sub_tab_plots.html")


@cache.cached()
@trial_tab.route('/views/tasks_queue_data')
def get_tasks_queue():
    client = ptl.FractalClient("api.qcarchive.molssi.org", username=os.environ.get(
        'QCFRACTAL_USER', None), password=os.environ.get('QCFRACTAL_PASSWORD', None))
    limitVar = 5000
    dataSet_2 = client.query_tasks(limit=limitVar)
    arr = [None] * 2000  # since the server's limit is 2000
    iter = 0
    for ob in dataSet_2:
        rowRecord = {'id': ob.id, 'parser': ob.parser, 'status': ob.status,
                     'program': ob.program, 'procedure': ob.procedure, 'manager': ob.manager, 'priority': ob.priority,
                     'tag': ob.tag, 'base_result': ob.base_result, 'error': ob.error, 'modified_on': ob.modified_on.strftime('%Y-%m-%d-%H:%M:%S'), 'created_on': ob.created_on.strftime('%Y-%m-%d-%H:%M:%S')}
        arr[iter] = rowRecord
        iter = iter + 1
    return_data = {"data": arr}
    return jsonify(return_data)
# End of Tasks Queue Tab-related functions


@trial_tab.route('/views/tasks_queue_restart', methods=['GET', 'POST'])
def tasks_queue_restart():
    # print(request.get_data())
    # josnA = {"mydata": request.get_data()}

    client = ptl.FractalClient("api.qcarchive.molssi.org", username=os.environ.get(
        'QCFRACTAL_USER', None), password=os.environ.get('QCFRACTAL_PASSWORD', None))
    upd = client.modify_tasks("restart", base_result=request.get_data().decode('UTF-8'))
    print(upd.n_updated)
    # upd = Data(n_updated=1)

    # upd = client.modify_tasks("restart", base_result=request.get_data().decode('UTF-8'), full_return= True)
    # TaskQueuePUTResponse(meta=ResponseMeta(errors=[], success=True, error_description='False'), data=Data(n_updated=1))
    
    # class TaskQueuePUTResponse(ProtoModel):
    #     class Data(ProtoModel):
    #         n_updated: int = Field(..., description="The number of tasks which were changed.")

    #     meta: ResponseMeta = Field(..., description=common_docs[ResponseMeta])
    #     data: Data = Field(..., description="Information returned from attempting updates of Tasks.")


    # register_model("task_queue", "PUT", TaskQueuePUTBody, TaskQueuePUTResponse)
    return_data = {'number_of_updated':upd.n_updated }
    # print(return_data)
    # print(type(upd))
    return return_data


# Start of Users Access Tab-related functions
@trial_tab.route("/views/users_access_tab_render")
def usersAcess():
    return render_template("trial_tab/users_access.html")


@trial_tab.route('/views/users_access_data')
def get_user():
    # with open(url_for('static', filename='data/dummy_data_user_access.json')) as fp:
    # app/static/data/dummy_data_user_access.json
    with open('app/static/data/dummy_data_user_access.json') as fp:
        dataSet = json.load(fp)
    return jsonify(dataSet)
# End of Tasks Queue Tab-related functions

# Placeholder for Tabs that are needed, but not yet designed or developed.
@trial_tab.route("/views/database_statistics_tab_render")
def databaseStats():
    return render_template("trial_tab/database_statistics.html")


@trial_tab.route("/views/results_statistics_tab_render")
def resultsStats():
    return render_template("trial_tab/results_statistics.html")


def set_default(obj):
    if isinstance(obj, set):
        return list(obj)
    raise TypeError
