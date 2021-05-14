# -*- encoding: utf-8 -*-
"""
Copyright (c) 2019 - present AppSeed.us
"""

import qcfractal.interface as ptl
import os

from app.home import blueprint
from app.base.routes import get_client
from flask import render_template, redirect, url_for, request, jsonify
from flask_login import login_required, current_user
from app import login_manager, cache
from jinja2 import TemplateNotFound
import pandas as pd
import math, time, json



@blueprint.route('/index')
@login_required
def index():
    return render_template('index.html', segment='index')

@blueprint.route('/<template>')
@login_required
def route_template(template):

    try:

        if not template.endswith( '.html' ):
            template += '.html'

        # Detect the current page
        segment = get_segment( request )

        # Serve the file (if exists) from app/templates/FILE.html
        return render_template( template, segment=segment )

    except TemplateNotFound:
        return render_template('page-404.html'), 404

    except:
        return render_template('page-500.html'), 500

# Helper - Extract current page name from request
def get_segment( request ):

    try:

        segment = request.path.split('/')[-1]

        if segment == '':
            segment = 'index'

        return segment

    except:
        return None

@blueprint.route("/views/managers_status")
@login_required
def call_data():
    return list_managers()

# @cache.cached()
def list_managers(status=None, modified_after=None):

    client = get_client()

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
    # df.to_csv('/Users/emanhussein/Desktop/experimental_CSV.csv')
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
@blueprint.route("/views/tasks_queue_tab_render")
@login_required
def tasksQueue():
    return render_template("blueprint/tasks_queue.html")


@blueprint.route("/views/tasks_queue_sub_tab_render_datatable")
@login_required
def tasksQueueSubtabDatatable():
    #  return render_template("blueprint/tasks_queue.html")
    return render_template("blueprint/tasks_queue_sub_tab_datatable.html")


@blueprint.route("/views/tasks_queue_sub_tab_render_plots")
@login_required
def tasksQueueSubTabPlot():
    return render_template("trial_tab/tasks_queue_sub_tab_plots.html")


# @cache.cached()
@blueprint.route('/views/tasks_queue_data')
@login_required
def get_tasks_queue():

    client = get_client()

    limitVar = 5000
    dataSet = client.query_tasks(limit=limitVar)
    # get the data size from meta, and use it to allocate the array (arr)
    arr = [None] * len(dataSet)  # since the server's limit is 2000,
    iter = 0
    for ob in dataSet:
        rowRecord = {'id': ob.id,
                     'parser': ob.parser,
                     'status': ob.status,
                     'program': ob.program,
                     'procedure': ob.procedure,
                     'manager': ob.manager,
                     'priority': priorityText(ob.priority),
                     'tag': ob.tag,
                     'base_result': ob.base_result,
                    #  'error': ob.error,
                     'modified_on': ob.modified_on.strftime('%Y-%m-%d-%H:%M:%S'),
                     'created_on': ob.created_on.strftime('%Y-%m-%d-%H:%M:%S')}
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


@blueprint.route('/views/tasks_queue_restart', methods=['POST'])
@login_required
def tasks_queue_restart():
    ids = request.get_json().values()

    # Will not call this for now:
    # for id_entry in ids:
    #     # upd = client.modify_tasks("restart", base_result=request.get_data().decode('UTF-8'), full_return= True)
    #     upd = client.modify_tasks("restart", base_result=id_entry)
    # return_data = {'number_of_updated': upd.n_updated}
    # return return_data
    return jsonify(1)


@blueprint.route('/views/tasks_queue_delete', methods=['POST'])
@login_required
def tasks_queue_delete():
    ids = request.get_json().get('ids')
    # for id_entry in ids:
    #     print(id_entry)
    return {'deleted': len(ids)}

# End of Tasks Queue Tab-related functions

# Start of Users Access Tab-related functions
@blueprint.route("/views/users_access_tab_render")
@login_required
def usersAcess():
    return render_template("blueprint/users_access.html")

@blueprint.route('/views/users_access_data_table')
@login_required
def get_user_table():
    client = get_client()
    dataSet = client.query_access_log()  # new function
    return jsonify(dataSet)


# @cache.cached()
@blueprint.route('/views/users_access_data_map')
@login_required
def get_map_data():
    # /Users/emanhussein/MOLSSI/NewDashboard/QCFractalDashboard/app/data
    with open('app/data/access_log_data.json') as fp:
        dataSet = json.load(fp)
    
    # dataSet =  client.query_access_log() #new function
    df = pd.DataFrame(dataSet)
    print("df=====================")
    print(df)
    map_df = df[['ip_lat', 'ip_long', 'country', 'city', 'subdivision', 'id']]
    print(map_df.shape)
    map_df.dropna(subset=['ip_lat', 'ip_long'])
    print("map_df and its shape after removing nan")
    print(map_df.shape)
    print(map_df)
    # map_df_grouped = map_df.groupby(['ip_lat', 'ip_long']).count()['id']
    map_df_grouped = map_df.groupby(['ip_lat', 'ip_long']).agg(
        {'id': 'count', 'country': 'first', 'city': 'first', 'subdivision': 'first'})
    df_map_df_grouped = pd.DataFrame(map_df_grouped)
    print("df_map_df_grouped")
    print(df_map_df_grouped)
    # map_data_json = df_map_df_grouped.to_dict()
    map_data_json = df_map_df_grouped.to_json()
    print(map_data_json)
    to_return = {'data': map_data_json, 'size': df_map_df_grouped.shape[0]}
    return to_return
    # df = pd.DataFrame(dataSet)
    # map_df = df[['ip_lat', 'ip_long', 'country', 'city', 'id']]
    # map_df.dropna(subset=['ip_lat', 'ip_long'])
    # map_df_grouped = map_df.groupby(['ip_lat', 'ip_long']).count()['id']
    # df_map_df_grouped = pd.DataFrame(map_df_grouped)
    # map_data_json = df_map_df_grouped.to_json()
    # to_return = {'data': map_data_json, 'size': df_map_df_grouped.shape[0]}
    # return to_return


@blueprint.route('/views/users_access_data')
@login_required
def get_user():
    # with open(url_for('static', filename='data/dummy_data_user_access.json')) as fp:
    # app/static/data/dummy_data_user_access.json
    start = time.time()

    # with open('app/static/data/access_log_data.json') as fp:
    #     # with open("app/static/data/tiny_access_logs.json") as fp:
    #     dataSet = json.load(fp)
    client = get_client()
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

    dateAccessesDF_grouped.to_csv('app/base/static/data/dateAccessesDF_grouped.csv')

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

# Placeholder for Tabs that are needed, but not yet designed or developed.
@blueprint.route("/views/database_statistics_tab_render")
@login_required
def databaseStats():
    return render_template("blueprint/database_statistics.html")


@blueprint.route("/views/results_statistics_tab_render")
@login_required
def resultsStats():
    return render_template("blueprint/results_statistics.html")


def set_default(obj):
    if isinstance(obj, set):
        return list(obj)
    raise TypeError
