# -*- encoding: utf-8 -*-
"""
Copyright (c) 2019 - present AppSeed.us
"""

# import qcfractal.interface as ptl
import qcportal as ptl
import os

from app.home import blueprint
from app.base.routes import get_client
from app.base.routes import login
from flask import render_template, redirect, url_for, request, jsonify
from flask_login import login_required, current_user
from app import login_manager, cache
from jinja2 import TemplateNotFound
import pandas as pd
import math, time, json
from pprint import pprint 
import ast
from pandas.io.json import json_normalize
import datetime

from flask_jwt_extended import create_access_token
# from flask_jwt_extended import jwt_required
# from flask_jwt_extended import JWTManager

@blueprint.route('/index')
@login_required
def index():
    client = get_client()
    # # dataSet = client.server_info(full_return=True)
    # # dataSet = client.query_tasks(full_return=True) #return all of the tasks (server_infor)
    # query_meta = dataSet.meta
    server_information = client.server_info
    stats ={}
    # stats["query_n_found"] = query_meta.n_found
    stats["server_information"] = server_information
    server_information_dropped_info = server_information.copy()
    del server_information_dropped_info['client_upper_version_limit']
    # del server_information_dropped_info['last_update']
    del server_information_dropped_info['version']
    del server_information_dropped_info['query_limits']
    del server_information_dropped_info['manager_heartbeat_frequency']
    del server_information_dropped_info['name']
    del server_information_dropped_info['client_lower_version_limit']
    stats['access_types']=server_information_dropped_info
    
    dataSet_logs = client.query_access_log()
    dataSet_log_df = pd.DataFrame(dataSet_logs)
    users_set=dataSet_log_df.user.unique()
    stats["users_set"] = users_set
    # stats['last_update_format']=last_update_format
    error_log_info = client.query_error_log() #list
    if len(error_log_info) == 0:
        stats['error_log'] = "No error logs. All Good!"
    else:
        stats['error_log'] = error_log_info
    return render_template('index.html', segment='index', posts=stats)

@blueprint.route('/views/db_stats')
@login_required
def db_stats():
    client = get_client()
    db_stats_info = client.query_server_stats() #list
    return jsonify(db_stats_info)

@blueprint.route('/views/db_table_information')
@login_required
def db_stats_table_information():
    client = get_client()
    db_stats_info = client.query_server_stats() #list
    db_table_information = db_stats_info[0]['db_table_information']
    return jsonify(db_table_information)

@blueprint.route('/views/server_error_logs')
@login_required
def server_error_logs():
    client = get_client()
    error_log_info = client.query_error_log() #list
    if len(error_log_info) == 0:
        result = "No error logs. All Good!"
        return 0
    else:
       result = error_log_info
       return result

@blueprint.route('/views/server_error_datatable')
@login_required
def error_tab():
    client = get_client()
    error_log_info = client.query_error_log() #list
    return jsonify(error_log_info)


@blueprint.route('/views/tasks_queue_data_details' , methods=['POST'])
@login_required
def task_details():
    client = get_client()
    id = request.get_json()
    task_details = client.query_tasks(id)
    return task_details


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

@blueprint.route("/views/managers_status", methods=['GET','POST'])
@login_required
def call_data():
    return list_managers()

# @cache.cached()
@login_required
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
    client = get_client()
    ids = request.get_json()
    upd = client.modify_tasks("restart", base_result=ids['ids'])
    return_data = {'number_of_updated': upd.n_updated}
    return return_data

@blueprint.route('/views/tasks_queue_delete', methods=['POST'])
@login_required
def tasks_queue_delete():
    ids = request.get_json().get('ids')
    return {'deleted': len(ids)}

# End of Tasks Queue Tab-related functions

#Begining of Landing page related functions
@blueprint.route('/views/general_stats')
@login_required
def get_general_stats():
    client = get_client()
    dataSet = client.query_tasks(full_return=True)
    ret_modified = client.query_managers(status=None, full_return=True)
    ret_modified_data = ret_modified.data  # returns dictionaries
    n_found = ret_modified.meta.n_found

# Start of Users Access Tab-related functions
@blueprint.route("/views/users_access_tab_render")
@login_required
def usersAcess():
    return render_template("blueprint/users_access.html")

@blueprint.route('/views/users_access_data_table')
@login_required
def get_user_table():
    client = get_client()
    dataSet = client.query_access_log(limit=1000)  # new function
    # dataSet = client.query_access_log()  # if limit not specified, returned data is approx. 10,000
    ret = {'data': dataSet}
    return jsonify(dataSet)


@cache.cached()
@blueprint.route('/views/users_access_data_map')
@login_required
def get_map_data():
    client = get_client()
    dataSet = client.query_access_log()     
    df = pd.DataFrame(dataSet)
    map_df = df[['ip_lat', 'ip_long', 'country', 'city', 'subdivision', 'id']]
    map_df.dropna(subset=['ip_lat', 'ip_long'])
    map_df_grouped = map_df.groupby(['ip_lat', 'ip_long']).agg(
        {'id': 'count', 'country': 'first', 'city': 'first', 'subdivision': 'first'})
    df_map_df_grouped = pd.DataFrame(map_df_grouped)
    map_data_json = df_map_df_grouped.to_json()
    to_return = {'data': map_data_json, 'size': df_map_df_grouped.shape[0]}
    return to_return
   
@blueprint.route('/views/users_access_data_slider', methods=['POST', 'GET'])
@login_required
def get_user_slider():
    client = get_client()
    date_begining = request.get_json()
    plotting_threshold = datetime.datetime.now() - datetime.timedelta(7)
    if date_begining == None: # returning all data, this is needed when loading the data first time before making any slider selection
        today = datetime.datetime.now()
        days = datetime.timedelta(365)
        new_date = today - days
        dataSet_2 = client.query_access_summary(after=new_date)
    
    elif datetime.datetime.strptime(date_begining, '%Y-%m-%d') > plotting_threshold:
        dataSet_2 = client.query_access_summary(after=datetime.datetime.strptime(date_begining, '%Y-%m-%d'), group_by="hour")

    else: 
        date_time_obj = datetime.datetime.strptime(date_begining, '%Y-%m-%d')
        dataSet_2 = client.query_access_summary(after=date_time_obj)
    dataset_values = dataSet_2.values()
    s = set()
    for dic in dataset_values:
        for val in dic:
            for x in val.keys():
                if x == 'access_type':
                    s.add(val[x])
    df = pd.DataFrame.from_dict(dataSet_2, orient = 'index') # ValueError: arrays must all be same length, solved by orient = 'index' & transpose 
    df.transpose()
    df_copy = df
    longest = df.shape[1]
    nested_dictionary = {}

    # access_types_returned = df_copy.name.unique()
    large_df = pd.DataFrame(columns = list(s), index=df_copy.index)
    steps_arr = []
    large_df.sort_index(inplace=True)
    iterrows = large_df.iterrows()
    for i, row in large_df.iterrows():
        step_element =  { "label": i, "method": 'skip', "execute": False}
        steps_arr.append(step_element)
    dict_combo = {}
    for ind in  range (df_copy.shape[0]):
        for x in range (longest):
            dict_elem = df_copy[x][ind]
            if dict_elem != None:
                access_type_col = dict_elem['access_type']
                large_df.iloc[ind][access_type_col]  = dict_elem['count']
    large_df = large_df.fillna(0)
    all_arr = []
    for i in list(s):
        stacked_area_plot_elem = large_df[i]
        stacked_area_plot_elem_dict = stacked_area_plot_elem.to_dict()
        dict_combo[i] =  stacked_area_plot_elem_dict
    
    dict_combo_values = dict_combo.values()
    # removing the last element in steps [ for better visualization in the stacked area plot]
    steps_arr.pop()
    to_return = {"dict_combo": dict_combo, "steps": steps_arr}
    return jsonify(to_return)

@blueprint.route('/views/query_access_summary')
@login_required
def get_query_access_summary_boxplot():
    client = get_client()
    dataSet = client.query_access_summary( group_by="hour")
    return jsonify(dataSet)
    
@blueprint.route('/views/users_access_data_subdivision')
@login_required    
def get_user_subdivision():
    client = get_client()
    dataSet = client.query_access_log()  # new function
    df = pd.DataFrame(dataSet)
    subdivision_df = df.groupby('subdivision').count()['id']

    subdivision_df = subdivision_df.reset_index(level=0)
    subdivision_df.sort_values(by=['id'])
    top_x_subdivisions = subdivision_df.head(20)
    subdivision_json = top_x_subdivisions.to_json(orient='records')
    return subdivision_json


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
