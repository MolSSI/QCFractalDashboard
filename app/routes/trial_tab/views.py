
import qcfractal.interface as ptl
# from ..interface.models.task_models import PriorityEnum, TaskStatusEnum
from flask import render_template, url_for, jsonify, current_app, request
# from qcportal.interface.models.task_models import PriorityEnum
import json
import pandas as pd
import numpy
import math
from ... import cache
import time
from datetime import datetime
import os
from . import trial_tab
import matplotlib

# client = ptl.FractalClient(address="https://staging.qcarchive.molssi.org")

client = ptl.FractalClient("https://staging.qcarchive.molssi.org", username=os.environ.get(
    'QCFRACTAL_USER', None), password=os.environ.get('QCFRACTAL_PASSWORD', None))

# Start of Managers Tab-related functions
@trial_tab.route("/views/managers_status_tab_render")
def my_link2():
    return render_template("trial_tab/managers_status_tab.html")


@trial_tab.route("/views/managers_status_tab")
def call_data():
    return list_managers()


@cache.cached()
def list_managers(status=None, modified_after=None):

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
    #  return render_template("trial_tab/tasks_queue.html")
    return render_template("trial_tab/tasks_queue_sub_tab_datatable.html")


@trial_tab.route("/views/tasks_queue_sub_tab_render_plots")
def tasksQueueSubTabPlot():
    return render_template("trial_tab/tasks_queue_sub_tab_plots.html")


@cache.cached()
@trial_tab.route('/views/tasks_queue_data')
def get_tasks_queue():

    limitVar = 5000
    dataSet_2 = client.query_tasks(limit=100)

    # get the data size from meta, and use it to allocate the array (arr)
    arr = [None] * 2000  # since the server's limit is 2000,
    iter = 0
    print("=======================")
    print(dataSet_2[0])

    for ob in dataSet_2:
        print("--------------------")
        print(ob)
        if(ob != None):
            rowRecord = {'id': ob.id, 'parser': ob.parser, 'status': ob.status,
                        'program': ob.program, 'procedure': ob.procedure, 'manager': ob.manager, 'priority': priorityText(ob.priority),
                        'tag': ob.tag, 'base_result': ob.base_result, 'modified_on': ob.modified_on.strftime('%Y-%m-%d-%H:%M:%S'), 'created_on': ob.created_on.strftime('%Y-%m-%d-%H:%M:%S')}
            
            arr[iter] = rowRecord
            iter = iter + 1
    return_data = {"data": arr}
    return jsonify(return_data)


def priorityText(pr):
    if pr == 2:
        return 'High'
    elif pr == 1:
        return 'Normal'
    elif pr == 0:
        return 'Low'


@trial_tab.route('/views/tasks_queue_restart', methods=['POST'])
def tasks_queue_restart():
    ids = request.get_json().values()

    # Will not call this for now:
    # for id_entry in ids:
    #     # upd = client.modify_tasks("restart", base_result=request.get_data().decode('UTF-8'), full_return= True)
    #     upd = client.modify_tasks("restart", base_result=id_entry)
    # return_data = {'number_of_updated': upd.n_updated}
    # return return_data
    return jsonify(1)


@trial_tab.route('/views/tasks_queue_delete', methods=['POST'])
def tasks_queue_delete():
    print("request.get_json()")
    print(request.get_json())
    ids = request.get_json().get('ids')
    print("len(ids)")
    print(type(ids))
    print(len(ids))
    for id_entry in ids:
        print(id_entry)
    returned_data = {'deleted': len(ids)}
    # return jsonify(1)
    return returned_data

# End of Tasks Queue Tab-related functions

# Start of Users Access Tab-related functions
@trial_tab.route("/views/users_access_tab_render")
def usersAcess():
    return render_template("trial_tab/users_access.html")


@cache.cached()
@trial_tab.route('/views/users_access_data_table')
def get_user_table():
    dataSet = client.query_access_log()  # new function
    return jsonify(dataSet)


@cache.cached()
@trial_tab.route('/views/users_access_data_map')
def get_map_data():
    with open('app/static/data/access_log_data.json') as fp:
        # with open("app/static/data/tiny_access_logs.json") as fp:
        dataSet = json.load(fp)
    # dataSet =  client.query_access_log() #new function
    df = pd.DataFrame(dataSet)
    print("df=====================")
    print(df)
    map_df = df[['ip_lat', 'ip_long', 'country', 'city', 'id']]
    print(map_df.shape)
    map_df.dropna(subset=['ip_lat', 'ip_long'])
    print("map_df.shape after removing nan")
    print(map_df.shape)
    map_df_grouped = map_df.groupby(['ip_lat', 'ip_long']).count()['id']
    df_map_df_grouped = pd.DataFrame(map_df_grouped)
    print(map_df_grouped)
    # map_data_json = df_map_df_grouped.to_dict()
    map_data_json = df_map_df_grouped.to_json()
    print(map_data_json)
    to_return = {'data': map_data_json, 'size': df_map_df_grouped.shape[0]}
    return to_return


@cache.cached()
@trial_tab.route('/views/users_access_data')
def get_user():
    # with open(url_for('static', filename='data/dummy_data_user_access.json')) as fp:
    # app/static/data/dummy_data_user_access.json
    start = time.time()

    # with open('app/static/data/access_log_data.json') as fp:
    #     # with open("app/static/data/tiny_access_logs.json") as fp:
    #     dataSet = json.load(fp)
    dataSet = client.query_access_log()  # new function

    df = pd.DataFrame(dataSet)
    df['access_date'] = pd.to_datetime(df['access_date'])
    df.set_index('access_date', inplace=True)
    df.sort_index(inplace=True)
    dateAccessesDF_grouped = df.groupby('access_type').resample(
        'H').count()['id']  # group all data by month, but for dates
    dateAccessesDF_grouped.to_frame()
    # dateAccessesDF_grouped.rename(columns={'id':'count'}, inplace=True)
    dateAccessesDF_grouped = dateAccessesDF_grouped.reset_index(level=1)

    dateAccessesDF_grouped.to_csv('app/static/data/dateAccessesDF_grouped.csv')

    access_type_list = dateAccessesDF_grouped.index.unique().to_list()
    nested_dict = {}
    for access_type_element in access_type_list:
        print(access_type_element)
        df_per_type = dateAccessesDF_grouped.loc[[access_type_element], :]
        df_per_type = df_per_type.reset_index(level=0, drop=True)
        dictionary_group = df_per_type.to_dict(orient='list')
        nested_dict[access_type_element] = dictionary_group
        print(nested_dict)
        print("=======================")
    # print("nested_dict after loop")
    # print(nested_dict)

    DateAccessesJSON = dateAccessesDF_grouped.to_json(
        orient='records')

    # group all data by month, but for dates
    subdivision_df = df.groupby('subdivision').count()['id']

    subdivision_df = subdivision_df.reset_index(level=0)
    subdivision_df.sort_values(by=['id'])
    # subdivision_df.to_frame()
    print(subdivision_df)
    top_x_subdivisions = subdivision_df.head(20)
    subdivision_json = top_x_subdivisions.to_json(orient='records')

    allData = {'DateAccessesJSON': DateAccessesJSON,
               'access_date_type': nested_dict, 'subdivision': subdivision_json}
    return allData
    # return jsonify(allData)


# End of Users Access Tab-related functions

@trial_tab.route("/views/users_access_tab_render_map")
def user_access_map():
    return render_template("trial_tab/users_access_map.html")


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
