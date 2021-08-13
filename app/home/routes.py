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
from pprint import pprint 
import ast
from pandas.io.json import json_normalize
# from flatten_dict import flatten
import datetime

@blueprint.route('/index')
@login_required
def index():
    client = get_client()
    # # dataSet = client.server_info(full_return=True)
    # # dataSet = client.query_tasks(full_return=True) #return all of the tasks (server_infor)
    # query_meta = dataSet.meta
    # print("get_general_stats dataSet")
    # print(dataSet)
    server_information = client.server_info
    # print("server_information")
    # print(server_information)
    # print(type(server_information)) #dict
    # print(server_information['name'])

    stats ={}
    # stats["query_n_found"] = query_meta.n_found
    stats["server_information"] = server_information
    # print("server_information")
    # print(server_information)
    server_information_dropped_info = server_information.copy()
    del server_information_dropped_info['client_upper_version_limit']
    # del server_information_dropped_info['last_update']
    del server_information_dropped_info['version']
    del server_information_dropped_info['query_limits']
    del server_information_dropped_info['manager_heartbeat_frequency']
    del server_information_dropped_info['name']
    del server_information_dropped_info['client_lower_version_limit']
    # print( "server_information_dropped_info = ")
    # print(type(server_information_dropped_info))
    # print(server_information_dropped_info)
    # print("server_information to double check")
    # print(server_information)
    stats['access_types']=server_information_dropped_info
    
    dataSet_logs = client.query_access_log()
    dataSet_log_df = pd.DataFrame(dataSet_logs)
    print("dataSet_log_df")
    print(dataSet_log_df)
    users_set=dataSet_log_df.user.unique()
    stats["users_set"] = users_set
    # stats['last_update_format']=last_update_format

# https://github.com/MolSSI/QCFractal/blob/bdb213f62972de092b45b40143ffd2196e6534f2/qcfractal/interface/client.py#L1261 
# line # 1243
    error_log_info = client.query_error_log() #list
    print("query_error_log")
    print(type(error_log_info))
    print(error_log_info)
    if len(error_log_info) == 0:
        stats['error_log'] = "No error logs. All Good!"
    else:
        stats['error_log'] = error_log_info
    print("stats['error_log']")
    print(stats['error_log'])
    return render_template('index.html', segment='index', posts=stats)

@blueprint.route('/views/server_error_logs')
def server_error_logs():
    client = get_client()
    error_log_info = client.query_error_log() #list
    print("query_error_log")
    print(type(error_log_info))
    print(error_log_info)

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
    print("query_error_log at error_tab function")
    error = {'data': 
        [{ 'id': 'sff', 'error_date':'fdfdf', 'qcfractal_version':'fgfdf', 'user':'fdfd', 'request_path':'ldjfhdlj'}]
        }
    return jsonify(error)
    
    # return jsonify({'data': [{ 'id': '', 'error_date':'', 'qcfractal_version':'', 'user':'', 'request_path':''}]})



@blueprint.route('/views/tasks_queue_data_details' , methods=['POST'])
@login_required
def task_details():
    client = get_client()
    id = request.get_json()
    print("id is")
    print(id)
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


# @blueprint.route("/views/tasks_queue_sub_tab_render_datatable")
# @login_required
# def tasksQueueSubtabDatatable():
#     #  return render_template("blueprint/tasks_queue.html")
#     return render_template("blueprint/tasks_queue_sub_tab_datatable.html")


# @blueprint.route("/views/tasks_queue_sub_tab_render_plots")
# @login_required
# def tasksQueueSubTabPlot():
#     return render_template("trial_tab/tasks_queue_sub_tab_plots.html")


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
    print(ids['ids'])
    upd = client.modify_tasks("restart", base_result=ids['ids'])
    return_data = {'number_of_updated': upd.n_updated}
    return return_data

@blueprint.route('/views/tasks_queue_delete', methods=['POST'])
@login_required
def tasks_queue_delete():
    ids = request.get_json().get('ids')
    # for id_entry in ids:
    #     print(id_entry)
    return {'deleted': len(ids)}

# End of Tasks Queue Tab-related functions

#Begining of Landing page related functions
@blueprint.route('/views/general_stats')
@login_required
def get_general_stats():
    client = get_client()
    dataSet = client.query_tasks(full_return=True)
    print("get_general_stats dataSet")
    print(dataSet)
    ret_modified = client.query_managers(status=None, full_return=True)
    ret_modified_data = ret_modified.data  # returns dictionaries
    n_found = ret_modified.meta.n_found
    print("get_general_stats ret_modified")
    print(ret_modified)


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
    # print("dataset from users_access_data_table")
    # print(dataSet)
    ret = {'data': dataSet}
    return jsonify(dataSet)


# @cache.cached()
@blueprint.route('/views/users_access_data_map')
@login_required
def get_map_data():
    # /Users/emanhussein/MOLSSI/NewDashboard/QCFractalDashboard/app/data
    # with open('app/data/access_log_data.json') as fp:
    #     dataSet = json.load(fp)

    client = get_client()
    dataSet = client.query_access_log()     
    df = pd.DataFrame(dataSet)
    print("df=====================")
    print(df)
    map_df = df[['ip_lat', 'ip_long', 'country', 'city', 'subdivision', 'id']]
    print(map_df.shape)
    map_df.dropna(subset=['ip_lat', 'ip_long'])
    print("map_df and its shape after removing nan")
    print(map_df.shape)
    print(map_df)
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
   

# @blueprint.route('/views/users_access_data', methods=['POST'])
# @login_required
# def get_user():
#     client = get_client()
#     date_begining = request.get_json()
#     print("==========================================================================")
#     print("date_begining")
#     print(date_begining)
    
#     # date_begining_format = datetime.strptime(date_begining, '%y-%m-%d')

#     dataSet_2 = client.query_access_summary(after=date_begining)
#     print("dataSet_2")
#     print(type(dataSet_2))
#     pprint(dataSet_2)  # new function
   
#     # print(dataSet_2.keys())
#     # print("dataset_values ==================================================")
#     dataset_values = dataSet_2.values()
#     # print(type(dataset_values) )
#     # print(dataSet_2.values())
#     s = set()
#     for dic in dataset_values:
#         # print("dic in dataset_values==========================================************************=====")
#         # print("type of dic")
#         # print(type(dic))
#         # print(dic)     
#         for val in dic:
#             # print("val in dic==========")
#             # print(val)
#             for x in val.keys():
#                 # print(" x in val.keys():")
#                 # print("type of x")
#                 # print(type(x))
#                 # print(x)
#                 if x == 'access_type':
#                     # print(val[x])
#                     s.add(val[x])
#             # print("===************************=====")
#     # print("s= ")
#     # print(s)

#     df = pd.DataFrame.from_dict(dataSet_2, orient = 'index') # ValueError: arrays must all be same length, solved by orient = 'index' & transpose 
#     df.transpose()
#     df.to_csv('/Users/emanhussein/Desktop/query_access_summary.csv')
#     df_copy = df
#     longest = df.shape[1]
#     # print("==================================================")
#     # print("df_copy before renaming columns")
#     # print(df_copy.head(5))
#     nested_dictionary = {}

#     # access_types_returned = df_copy.name.unique()
#     large_df = pd.DataFrame(columns = list(s), index=df_copy.index)
#     dict_combo = {}
#     for ind in  range (df_copy.shape[0]):
#         # print("index = ")
#         # print(ind)
#         for x in range (longest):
#             # print("x= ")
#             # print(x)
#             dict_elem = df_copy[x][ind]
#             # print("dict_elem = df_copy[ind][x] ")
#             # print(dict_elem )
#             if dict_elem != None:
#                 # print("dict_elem['access_type']")
#                 # print(dict_elem['access_type'])

#                 access_type_col = dict_elem['access_type']
#                 # print("large_df.iloc[ind][access_type_col] ")
#                 # print(large_df.iloc[ind][access_type_col] )
#                 large_df.iloc[ind][access_type_col]  = dict_elem['count']
#                 # print("large_df===========================================")
#                 # print(large_df)
#                 # print("==================================")
#                 # stacked_area_plot_elem = large_df[i]
#                 # print(stacked_area_plot_elem)
#                 # print("type(stacked_area_plot_elem)")
#                 # print(type(stacked_area_plot_elem))
#                 # dict_combo[dict_elem['access_type']] =  stacked_area_plot_elem
    
#     print("large_df===========================================")
#     print(large_df)
#     large_df = large_df.fillna(0)
#     large_df.sort_index(inplace=True)
#     large_df.to_csv('/Users/emanhussein/Desktop/large_df.csv')
#     all_arr = []
#     for i in list(s):
#         # print("i in list(s):")
#         # print(i)
#         stacked_area_plot_elem = large_df[i]
#         # print("large_df[i]")
#         # print(large_df[i])
#         # print("^^^^^^^^^^^^^^^^________^^^^^^^^^^^^^^^^^^^^^")
#         # print(stacked_area_plot_elem)
#         # print(type(stacked_area_plot_elem))
#         stacked_area_plot_elem_dict = stacked_area_plot_elem.to_dict()
#         dict_combo[i] =  stacked_area_plot_elem_dict
#     print("dict_combo")
#     print(dict_combo)
#     print(dict_combo.keys())
#     dict_combo_values = dict_combo.values()
#     # for item in dict_combo.items():
#     #     print(item)
#     #     print("_________________-------_____________")
#     return json.dumps(dict_combo)
    
    # # with open(url_for('static', filename='data/dummy_data_user_access.json')) as fp:
    # # app/static/data/dummy_data_user_access.json
    # start = time.time()

    # # with open('app/static/data/access_log_data.json') as fp:
    # #     # with open("app/static/data/tiny_access_logs.json") as fp:
    # #     dataSet = json.load(fp)
    # client = get_client()
    # dataSet = client.query_access_log()  # new function

    # df = pd.DataFrame(dataSet)
    # df['access_date'] = pd.to_datetime(df['access_date'])
    # df.set_index('access_date', inplace=True)
    # df.sort_index(inplace=True)
    # dateAccessesDF_grouped = df.groupby('access_type').resample(
    #     'H').count()['id']  # group all data by month, but for dates
    # dateAccessesDF_grouped.to_frame()
    # # dateAccessesDF_grouped.rename(columns={'id':'count'}, inplace=True)
    # dateAccessesDF_grouped = dateAccessesDF_grouped.reset_index(level=1)
    # dateAccessesDF_grouped.to_csv('app/data/dateAccessesDF_grouped.csv')

    # access_type_list = dateAccessesDF_grouped.index.unique().to_list()
    # nested_dict = {}
    # for access_type_element in access_type_list:
    #     # print(access_type_element)
    #     df_per_type = dateAccessesDF_grouped.loc[[access_type_element], :]
    #     df_per_type = df_per_type.reset_index(level=0, drop=True)
    #     dictionary_group = df_per_type.to_dict(orient='list')
    #     nested_dict[access_type_element] = dictionary_group
    #     # print(nested_dict)
    #     # print("=======================")
    # # print("nested_dict after loop")
    # # print(nested_dict)

    # DateAccessesJSON = dateAccessesDF_grouped.to_json(
    #     orient='records')

    # # group all data by month, but for dates
    # subdivision_df = df.groupby('subdivision').count()['id']

    # subdivision_df = subdivision_df.reset_index(level=0)
    # subdivision_df.sort_values(by=['id'])
    # # subdivision_df.to_frame()
    # print(subdivision_df)
    # top_x_subdivisions = subdivision_df.head(20)
    # subdivision_json = top_x_subdivisions.to_json(orient='records')

    # allData = {'DateAccessesJSON': DateAccessesJSON,
    #            'access_date_type': nested_dict, 'subdivision': subdivision_json}
    # return allData
    # return jsonify(allData)

@blueprint.route('/views/users_access_data_slider', methods=['POST', 'GET'])
@login_required
def get_user_slider():
    client = get_client()
    date_begining = request.get_json()
    print("==========================================================================")
    print("date_begining")
    print(date_begining)

    plotting_threshold = datetime.datetime.now() - datetime.timedelta(7)
    print("plotting_threshold")
    print(plotting_threshold)

    if date_begining == None: # returning all data, this is needed when loading the data first time before making any slider selection
        today = datetime.datetime.now()
        days = datetime.timedelta(365)
        new_date = today - days
        print("new date")
        print(type(new_date))
        print(new_date)
        dataSet_2 = client.query_access_summary(after=new_date)
    
    elif datetime.datetime.strptime(date_begining, '%Y-%m-%d') > plotting_threshold:
        print("plotting by hour")
        dataSet_2 = client.query_access_summary(after=datetime.datetime.strptime(date_begining, '%Y-%m-%d'), group_by="hour")

    else: 
        date_time_obj = datetime.datetime.strptime(date_begining, '%Y-%m-%d')
        print(date_time_obj)
        dataSet_2 = client.query_access_summary(after=date_time_obj)

    print("dataSet_2")
    print(type(dataSet_2))
    pprint(dataSet_2)  # new function
   
    # print(dataSet_2.keys())
    # print("dataset_values ==================================================")
    dataset_values = dataSet_2.values()
    # print(type(dataset_values) )
    # print(dataSet_2.values())
    s = set()
    for dic in dataset_values:
        # print("dic in dataset_values==========================================************************=====")
        # print("type of dic")
        # print(type(dic))
        # print(dic)     
        for val in dic:
            print("val in dic==========")
            print(val)
            for x in val.keys():
                print(" x in val.keys():")
                print("type of x")
                print(type(x))
                print(x)
                if x == 'access_type':
                    print(val[x])
                    s.add(val[x])
            # print("===************************=====")
    # print("s= ")
    # print(s)

    df = pd.DataFrame.from_dict(dataSet_2, orient = 'index') # ValueError: arrays must all be same length, solved by orient = 'index' & transpose 
    df.transpose()
    # df.to_csv('/Users/emanhussein/Desktop/query_access_summary.csv')
    df_copy = df
    longest = df.shape[1]
    # print("==================================================")
    # print("df_copy before renaming columns")
    # print(df_copy.head(5))
    nested_dictionary = {}

    # access_types_returned = df_copy.name.unique()
    large_df = pd.DataFrame(columns = list(s), index=df_copy.index)
    steps_arr = []
    large_df.sort_index(inplace=True)
    print("large_df.iterrows()")
    iterrows = large_df.iterrows()
    print(type(iterrows))
    for i, row in large_df.iterrows():
        print('index: ', i)
        step_element =  { "label": i, "method": 'skip', "execute": False}
        steps_arr.append(step_element)
    dict_combo = {}
    print(type(steps_arr))
    for ind in  range (df_copy.shape[0]):
        print("index = ")
        print(ind)
        for x in range (longest):
            # print("x= ")
            # print(x)
            dict_elem = df_copy[x][ind]
            # print("dict_elem = df_copy[ind][x] ")
            # print(dict_elem )
            if dict_elem != None:
                # print("dict_elem['access_type']")
                # print(dict_elem['access_type'])

                access_type_col = dict_elem['access_type']
                # print("large_df.iloc[ind][access_type_col] ")
                # print(large_df.iloc[ind][access_type_col] )
                large_df.iloc[ind][access_type_col]  = dict_elem['count']
                # print("large_df===========================================")
                # print(large_df)
                # print("==================================")
                # stacked_area_plot_elem = large_df[i]
                # print(stacked_area_plot_elem)
                # print("type(stacked_area_plot_elem)")
                # print(type(stacked_area_plot_elem))
                # dict_combo[dict_elem['access_type']] =  stacked_area_plot_elem
    
    print("large_df===========================================")
    print(large_df)
    large_df = large_df.fillna(0)
    # large_df.to_csv('/Users/emanhussein/Desktop/large_df.csv')
    all_arr = []
    for i in list(s):
        print("i in list(s):")
        print(i)
        stacked_area_plot_elem = large_df[i]
        # print("large_df[i]")
        # print(large_df[i])
        # print("^^^^^^^^^^^^^^^^________^^^^^^^^^^^^^^^^^^^^^")
        # print(stacked_area_plot_elem)
        # print(type(stacked_area_plot_elem))
        stacked_area_plot_elem_dict = stacked_area_plot_elem.to_dict()
        dict_combo[i] =  stacked_area_plot_elem_dict
       

        
    print("dict_combo")
    print(dict_combo)
    print(dict_combo.keys())

    dict_combo_values = dict_combo.values()
    # removing the last element in steps [ for better visualization in the stacked area plot]
    print("steps_arr before pop")
    print(steps_arr)
    steps_arr.pop()
    print("steps_arr after pop")
    print(steps_arr)

    to_return = {"dict_combo": dict_combo, "steps": steps_arr}
    # for item in dict_combo.items():
    #     print(item)
    #     print("_________________-------_____________")
    return jsonify(to_return)
    # return json.dumps(dict_combo)

@blueprint.route('/views/query_access_summary')
@login_required
def get_query_access_summary_boxplot():
    client = get_client()
    dataSet = client.query_access_summary( group_by="hour")
    print("dataSet for boxplot")
    print(type(dataSet)) #dict
    print(dataSet)
    return jsonify(dataSet)



    
@blueprint.route('/views/users_access_data_subdivision')
@login_required    
def get_user_subdivision():
    client = get_client()
    dataSet = client.query_access_log()  # new function
    df = pd.DataFrame(dataSet)
    print("subdivision")
    print(df)
    subdivision_df = df.groupby('subdivision').count()['id']

    subdivision_df = subdivision_df.reset_index(level=0)
    subdivision_df.sort_values(by=['id'])
    # subdivision_df.to_frame()
    print(subdivision_df)
    top_x_subdivisions = subdivision_df.head(20)
    subdivision_json = top_x_subdivisions.to_json(orient='records')

    
    # return top_x_subdivisions
    # return jsonify(allData)
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
