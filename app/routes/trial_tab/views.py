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
from json import JSONEncoder
import numpy


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


class NumpyArrayEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, numpy.ndarray):
            return obj.tolist()
        return JSONEncoder.default(self, obj)


@trial_tab.route("/views/tasks_queue_tab_render")
def tasksQueue():
    print('Tasks Queue got clicked!')
    return render_template("trial_tab/tasks_queue.html")


@trial_tab.route('/views/tasks_queue_data_2')
def get_tasks_queue_2():
    client = ptl.FractalClient("api.qcarchive.molssi.org", username=os.environ.get(
        'QCFRACTAL_USER', None), password=os.environ.get('QCFRACTAL_PASSWORD', None))


        
    limitVar = 5000 #
    dataSet_2 = client.query_tasks(limit=limitVar)
    # jsonObject = json.dumps(
    #     [ob.spec.args for ob in dataSet_2], cls=NumpyArrayEncoder)
    # print("dataSet_2")
    # print(dataSet_2.meta)
    # print(len(dataSet_2.data))
    # return jsonify(dataSet_2['meta'])
    # print(dataSet_2.data.id)
    # print("=================")
    # print("jsonObject")
    # print(type(jsonObject))
    # print("=================")

    # print(dataSet_2)
    # ResponseGETMeta(errors=[], success=True, error_description='False', missing=[], n_found=1876585)
    # print("======================================================")
    # response = dataSet_2.data
    pd.set_option('display.max_columns', None)
    # a_json = json.loads(jsonObject)
    # print(a_json)
    # df_task_queue = pd.DataFrame()
    # df_task_queue = pd.DataFrame.from_dict(a_json)

    # # json_df_task_queue = df_task_queue.to_json(orient='values')
    # df_task_queue.columns = ['id', 'status', 'manager',
    #     'priority', 'error', 'modified_on', 'created_on']

    arr = [None] * 2000 # since the server's limit is 2000
    iter = 0
    for ob in dataSet_2:
        specArgs = ob.spec.args

        # arr[iter]=ob.dict()
        
        # arr[iter] = [ob.base_result, ob.status, ob.manager, ob.priority, ob.modified_on,ob.created_on]
        # print(arr[iter])
        
        # rowRecord = {'id': ob.id, 'spec_args': specArgs, 'spec_kwargs': ob.spec.kwargs, 'parser': ob.parser, 'status': ob.status,
        # 'program': ob.program, 'procedure': ob.procedure, 'manager': ob.manager, 'priority': ob.priority,
        #              'tag': ob.tag, 'base_result': ob.base_result, 'error': ob.error, 'modified_on': ob.modified_on, 'created_on': ob.created_on}
        rowRecord = {'id': ob.id, 'parser': ob.parser, 'status': ob.status,
        'program': ob.program, 'procedure': ob.procedure, 'manager': ob.manager, 'priority': ob.priority,
                     'tag': ob.tag, 'base_result': ob.base_result, 'error': ob.error, 'modified_on': ob.modified_on, 'created_on': ob.created_on}
        
        
        arr[iter] = rowRecord
        iter = iter +1

        # print(rowRecord)
        # df_task_queue = df_task_queue.append(rowRecord, ignore_index=True)
    # print(df_task_queue)
    # returned = df_task_queue.to_json(orient='records')
    # print(df_task_queue['id'])
    # print(df_task_queue['schema_name'])
    # [[["id","6767788"],
    # [
    #     "spec",{"args":
    #     [
    #         {"id":null,"schema_name":"qcschema_input","schema_version":1,"molecule":{"schema_name":"qcschema_molecule","schema_version":2,"validated":true,"symbols":["H","O","H"],"geometry":[[3.73396269,-3.99497651,-4.77702772],[3.46529556,-5.32820275,-3.61160096],[4.71583711,-4.52698798,-2.61854388]],"name":"H2O","identifiers":{"molecule_hash":"95d0afad81634c59054db48ea1ea5e704d07fcb6","molecular_formula":"H2O","smiles":null,"inchi":null,"inchikey":null,"canonical_explicit_hydrogen_smiles":null,"canonical_isomeric_explicit_hydrogen_mapped_smiles":null,"canonical_isomeric_explicit_hydrogen_smiles":null,"canonical_isomeric_smiles":null,"canonical_smiles":null},"comment":null,"molecular_charge":0.0,"molecular_multiplicity":1,"masses":[1.0078250322,15.9949146196,1.0078250322],"real":[true,true,true],"atom_labels":["","",""],"atomic_numbers":[1,8,1],"mass_numbers":[1,16,1],"connectivity":null,"fragments":[[0,1,2]],"fragment_charges":[0.0],"fragment_multiplicities":[1],"fix_com":true,"fix_orientation":true,"fix_symmetry":null,"provenance":{"creator":"QCElemental","version":"v0.12.0","routine":"qcelemental.molparse.from_schema"},"id":"9683936","extras":null},"driver":"gradient","model":{"method":"wb97m-v","basis":"def2-tzvp"},"keywords":{"maxiter":1000,"e_convergence":8,"guess":"sad","scf_type":"df","dft_spherical_points":302,"dft_radial_points":100,"d_convergence":8,"freeze_core":true,"mp2_type":"df"},"protocols":{},"extras":{"_qcfractal_tags":{"program":"psi4","keywords":"1"}},"provenance":{"creator":"QCElemental","version":"v0.12.0","routine":"qcelemental.models.results"}},"psi4"],

    #     "fields":{"function":{"alias":"function","alt_alias":false,"default":{},"field_info":{"alias":null,"const":null,"default_factory":null,"extra":{},"gt":null,"lt":null,"max_length":null,"min_length":null,"regex":null},"has_alias":false,"key_field":null,"name":"function","parse_json":false,"post_validators":null,"required":true,"shape":1,"validate_always":false},"args":{"alias":"args","alt_alias":false,"default":{},"field_info":{"alias":null,"const":null,"default_factory":null,"extra":{},"gt":null,"lt":null,"max_length":null,"min_length":null,"regex":null},"has_alias":false,"key_field":null,"name":"args","parse_json":false,"post_validators":null,"required":true,"shape":2,"validate_always":false},"kwargs":{"alias":"kwargs","alt_alias":false,"default":{},"field_info":{"alias":null,"const":null,"default_factory":null,"extra":{},"gt":null,"lt":null,"max_length":null,"min_length":null,"regex":null},"has_alias":false,"key_field":{"alias":"key_kwargs","alt_alias":false,"default":null,"field_info":{"alias":null,"const":null,"default_factory":null,"extra":{},"gt":null,"lt":null,"max_length":null,"min_length":null,"regex":null},"has_alias":false,"key_field":null,"name":"key_kwargs","parse_json":false,"post_validators":null,"required":true,"shape":1,"validate_always":false},"name":"kwargs","parse_json":false,"post_validators":null,"required":true,"shape":4,"validate_always":false}},

    #     "function":"qcengine.compute","kwargs":{}}
    # ],

    # ["parser","single"],
    # ["status","ERROR"],["program","psi4"],["procedure",null],["manager","MolSSI_ARC_Cascades_Parsl-calogin1-98da9834-0056-4e78-bba7-c884f4fbe5bc"],["priority",1],["tag","molssi_large"],["base_result","12946559"],["error",null],["modified_on",1578456441737],["created_on",1576983756749]]
    # ]
    # 1 record:
    # [
#    TaskRecord(id = '6767788', spec = PythonComputeSpec(function = 'qcengine.compute', args =
#    [{
# 	'id': None,
# 	'schema_name': 'qcschema_input',
# 	'schema_version': 1,
# 	'molecule': {
# 		'schema_name': 'qcschema_molecule',
# 		'schema_version': 2,
# 		'validated': True,
# 		'symbols': array(['H', 'O', 'H'], dtype = '<U1'),
# 		'geometry': array([
# 			[3.73396269, -3.99497651, -4.77702772],
# 			[3.46529556, -5.32820275, -3.61160096],
# 			[4.71583711, -4.52698798, -2.61854388]
# 		]),
# 		'name': 'H2O',
# 		'identifiers': {
# 			'molecule_hash': '95d0afad81634c59054db48ea1ea5e704d07fcb6',
# 			'molecular_formula': 'H2O',
# 			'smiles': None,
# 			'inchi': None,
# 			'inchikey': None,
# 			'canonical_explicit_hydrogen_smiles': None,
# 			'canonical_isomeric_explicit_hydrogen_mapped_smiles': None,
# 			'canonical_isomeric_explicit_hydrogen_smiles': None,
# 			'canonical_isomeric_smiles': None,
# 			'canonical_smiles': None
# 		},
# 		'comment': None,
# 		'molecular_charge': 0.0,
# 		'molecular_multiplicity': 1,
# 		'masses': array([1.00782503, 15.99491462, 1.00782503]),
# 		'real': array([True, True, True]),
# 		'atom_labels': array(['', '', ''], dtype = '<U1'),
# 		'atomic_numbers': array([1, 8, 1], dtype = int16),
# 		'mass_numbers': array([1, 16, 1], dtype = int16),
# 		'connectivity': None,
# 		'fragments': [array([0, 1, 2], dtype = int32)],
# 		'fragment_charges': [0.0],
# 		'fragment_multiplicities': [1],
# 		'fix_com': True,
# 		'fix_orientation': True,
# 		'fix_symmetry': None,
# 		'provenance': {
# 			'creator': 'QCElemental',
# 			'version': 'v0.12.0',
# 			'routine': 'qcelemental.molparse.from_schema'
# 		},
# 		'id': '9683936',
# 		'extras': None
# 	},
# 	'driver': 'gradient',
# 	'model': {
# 		'method': 'wb97m-v',
# 		'basis': 'def2-tzvp'
# 	},
# 	'keywords': {
# 		'maxiter': 1000,
# 		'e_convergence': 8,
# 		'guess': 'sad',
# 		'scf_type': 'df',
# 		'dft_spherical_points': 302,
# 		'dft_radial_points': 100,
# 		'd_convergence': 8,
# 		'freeze_core': True,
# 		'mp2_type': 'df'
# 	},
# 	'protocols': {},
# 	'extras': {
# 		'_qcfractal_tags': {
# 			'program': 'psi4',
# 			'keywords': '1'
# 		}
# 	},
# 	'provenance': {
# 		'creator': 'QCElemental',
# 		'version': 'v0.12.0',
# 		'routine': 'qcelemental.models.results'
# 	}
# }, 'psi4'],


# kwargs = {}), parser = 'single', status = < TaskStatusEnum.error: 'ERROR' > , program = 'psi4', procedure = None, manager = 'MolSSI_ARC_Cascades_Parsl-calogin1-98da9834-0056-4e78-bba7-c884f4fbe5bc', priority = < PriorityEnum.NORMAL: 1 > , tag = 'molssi_large', base_result = '12946559', error = None, modified_on = datetime.datetime(2020, 1, 8, 4, 7, 21, 737497), created_on = datetime.datetime(2019, 12, 22, 3, 2, 36, 749547)), TaskRecord(id = '21138', spec = PythonComputeSpec(function = 'qcengine.compute_procedure', args = [{
# 	'input_specification': {
# 		'driver': 'gradient',
# 		'model': {
# 			'method': 'b3lyp-d3(bj)',
# 			'basis': 'dzvp'
# 		},
# 		'schema_name': 'qcschema_input',
# 		'schema_version': 1,
# 		'keywords': {
# 			'maxiter': 200,
# 			'scf_properties': ['dipole', 'quadrupole', 'wiberg_lowdin_indices', 'mayer_indices']
# 		},
# 		'extras': {
# 			'_qcfractal_tags': {
# 				'program': 'psi4',
# 				'keywords': '2'
# 			}
# 		}
# 	},
# 	'initial_molecule': {
# 		'symbols': ['C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'N', 'N', 'N', 'N', 'N', 'O', 'O', 'O', 'O', 'F', 'I', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
# 		'geometry': [5.93062291, 6.61245688, 5.28732053, 3.9366977, 4.91344049, 4.99531187, 6.83369605, 7.95506044, 3.20638433, -3.96880225, 0.57281252, -6.64144094, -5.23241431, 1.69010831, -8.66692734, 3.74897734, 5.89926718, 0.54134848, -8.43262369, -1.55981868, -8.46315538, -1.4364036, -0.29592266, -0.38816172, 3.10486532, -0.54576136, 0.13902706, 0.92383429, 0.67719565, 0.68800836, 2.84589158, 4.55677535, 2.6223499, 5.74290525, 7.59839846, 0.8334245, -4.93696844, -1.61093142, -5.52683789, -7.16889313, -2.67717321, -6.43766808, -7.46434396, 0.62386691, -9.57777419, -1.46231268, -1.93059199, -2.37402774, -3.87917922, 0.42076308, 0.8570184, 3.15277636, -2.3990443, -2.01105654, -1.52251732, 3.52061503, 3.4828879, 5.8017569, 8.83412129, -3.73499915, 5.60388168, -0.3336454, 1.49557918, 0.90643196, -4.54692282, -5.43911077, -3.63607731, 2.1235157, 2.81153296, 0.77331639, 2.79157919, 2.32054457, 0.86903981, -2.86598142, -3.23705118, -3.67402791, -2.72086872, -3.50838227, 6.64691958, 8.94198105, -1.24725173, -5.95385261, -0.42219714, 0.24784976, 5.17906833, -3.37075043, -2.62593692, -1.7947389, 5.3412432, 4.91892859, 4.10676388, 7.56557709, -4.66197735, -8.11588908, -4.77574603, -5.38047944, -9.34687847, 2.28824179, -12.59426675, 6.77868441, 6.89165922, 7.13520131, 3.25000077, 3.87671068, 6.63057963, 8.38974164, 9.2726943, 3.4572737, -2.23089204, 1.41930989, -5.94652493, -4.44518371, 3.39100246, -9.50795851, 2.89836192, 5.6205316, -1.30990937, -10.16868125, -2.42197573, -9.14299027, 6.91485512, 10.13472091, -4.92599224, 5.674721, -1.7331654, 2.9919466, 5.77954048, 1.54972601, 2.28772163, 7.1228068, -0.65990612, 0.15714171, 1.09946482, -3.44116894, -7.17318818, -0.84692313, -5.63572536, -5.53638451, 2.49548138, -5.86082976, -5.30782081, -5.19936497, 2.38874099, 3.89585978, -4.41266647, -4.29004997, -2.74298106, 8.11513216, 10.16686555, -0.92968361],
# 		'masses': [12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 14.00307400443, 14.00307400443, 14.00307400443, 14.00307400443, 14.00307400443, 15.99491461957, 15.99491461957, 15.99491461957, 15.99491461957, 18.99840316273, 126.9044719, 1.00782503223, 1.00782503223, 1.00782503223, 1.00782503223, 1.00782503223, 1.00782503223, 1.00782503223, 1.00782503223, 1.00782503223, 1.00782503223, 1.00782503223, 1.00782503223, 1.00782503223, 1.00782503223, 1.00782503223, 1.00782503223, 1.00782503223],
# 		'real': [True, True, True, True, True, True, True, True, True, True, True, True, True, True, True, True, True, True, True, True, True, True, True, True, True, True, True, True, True, True, True, True, True, True, True, True, True, True, True, True, True, True, True, True, True, True, True, True, True, True],
# 		'fragments': [
# 			[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49]
# 		],
# 		'fragment_charges': [0.0],
# 		'fragment_multiplicities': [1],
# 		'schema_name': 'qcschema_molecule',
# 		'schema_version': 2,
# 		'name': 'C22FH17IN5O4',
# 		'identifiers': {
# 			'molecule_hash': '27f080b6c7a549af6f77c4cd226f308529305b99',
# 			'molecular_formula': 'C22FH17IN5O4'
# 		},
# 		'comment': None,
# 		'molecular_charge': 0.0,
# 		'molecular_multiplicity': 1,
# 		'atom_labels': ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
# 		'atomic_numbers': [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 8, 8, 8, 8, 9, 53, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
# 		'mass_numbers': [12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 14, 14, 14, 14, 14, 16, 16, 16, 16, 19, 127, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
# 		'connectivity': [
# 			[0, 1, 2.0],
# 			[0, 2, 1.0],
# 			[0, 33, 1.0],
# 			[1, 10, 1.0],
# 			[1, 34, 1.0],
# 			[2, 11, 2.0],
# 			[2, 35, 1.0],
# 			[3, 4, 2.0],
# 			[3, 12, 1.0],
# 			[3, 36, 1.0],
# 			[4, 14, 1.0],
# 			[4, 37, 1.0],
# 			[5, 10, 2.0],
# 			[5, 11, 1.0],
# 			[5, 38, 1.0],
# 			[6, 13, 1.0],
# 			[6, 14, 2.0],
# 			[6, 39, 1.0],
# 			[7, 9, 1.0],
# 			[7, 15, 2.0],
# 			[7, 16, 1.0],
# 			[8, 9, 2.0],
# 			[8, 17, 1.0],
# 			[8, 20, 1.0],
# 			[9, 23, 1.0],
# 			[10, 23, 1.0],
# 			[11, 26, 1.0],
# 			[12, 13, 2.0],
# 			[12, 25, 1.0],
# 			[13, 31, 1.0],
# 			[14, 32, 1.0],
# 			[15, 24, 1.0],
# 			[15, 25, 1.0],
# 			[16, 22, 1.0],
# 			[16, 27, 2.0],
# 			[17, 24, 1.0],
# 			[17, 28, 2.0],
# 			[18, 22, 1.0],
# 			[18, 23, 1.0],
# 			[18, 29, 2.0],
# 			[19, 26, 1.0],
# 			[19, 30, 2.0],
# 			[19, 40, 1.0],
# 			[20, 41, 1.0],
# 			[20, 42, 1.0],
# 			[20, 43, 1.0],
# 			[21, 24, 1.0],
# 			[21, 44, 1.0],
# 			[21, 45, 1.0],
# 			[21, 46, 1.0],
# 			[22, 47, 1.0],
# 			[25, 48, 1.0],
# 			[26, 49, 1.0]
# 		],
# 		'fix_com': True,
# 		'fix_orientation': True,
# 		'fix_symmetry': None,
# 		'provenance': {
# 			'creator': 'QCElemental',
# 			'version': 'v0.4.0',
# 			'routine': 'qcelemental.molparse.from_schema'
# 		},
# 		'id': '1418639',
# 		'extras': None
# 	},
# 	'id': None,
# 	'hash_index': '982e62727c4adb018a9e404349ed487cfdc313a1',
# 	'schema_name': 'qcschema_optimization_input',
# 	'schema_version': 1,
# 	'keywords': {
# 		'coordsys': 'tric',
# 		'enforce': 0.1,
# 		'reset': True,
# 		'qccnv': True,
# 		'epsilon': 0,
# 		'constraints': {
# 			'set': [{
# 				'type': 'dihedral',
# 				'indices': [12, 25, 15, 24],
# 				'value': -90
# 			}]
# 		},
# 		'program': 'psi4'
# 	},
# 	'extras': {},
# 	'provenance': {
# 		'creator': 'QCElemental',
# 		'version': 'v0.4.0',
# 		'routine': 'qcelemental.models.procedures'
# 	}
# }, 'geometric'], kwargs = {}), parser = 'optimization', status = < TaskStatusEnum.error: 'ERROR' > , program = 'psi4', procedure = 'geometric', manager = 'MolSSI_ARC_Cascades_Parsl-calogin1-961d02f8-c95e-4c8f-8653-5e54013914a9', priority = < PriorityEnum.HIGH: 2 > , tag = None, base_result = '1792183', error = None, modified_on = datetime.datetime(2019, 7, 19, 8, 45, 28, 738978), created_on = datetime.datetime(2019, 6, 9, 19, 33, 5, 925087))
    return_data = {"data":arr}
    print("type(arr)")
    print(type(arr))
    return jsonify(return_data)
    # return jsonify(return_data['data'].tolist())


@trial_tab.route('/views/tasks_queue_data')
def get_tasks_queue():
    dataSet = {"data": [
        ["Tiger Nixon", "System Architect", "Edinburgh",
            "5421", "2011/04/25", "$320,800"],
        ["Garrett Winters", "Accountant", "Tokyo",
            "8422", "2011/07/25", "$170,750"],
        ["Ashton Cox", "Junior Technical Author",
            "San Francisco", "1562", "2009/01/12", "$86,000"],
        ["Cedric Kelly", "Senior Javascript Developer",
            "Edinburgh", "6224", "2012/03/29", "$433,060"],
        ["Airi Satou", "Accountant", "Tokyo", "5407", "2008/11/28", "$162,700"],
        ["Brielle Williamson", "Integration Specialist",
            "New York", "4804", "2012/12/02", "$372,000"],
        ["Herrod Chandler", "Sales Assistant",
            "San Francisco", "9608", "2012/08/06", "$137,500"],
        ["Rhona Davidson", "Integration Specialist",
            "Tokyo", "6200", "2010/10/14", "$327,900"],
        ["Colleen Hurst", "Javascript Developer",
            "San Francisco", "2360", "2009/09/15", "$205,500"],
        ["Sonya Frost", "Software Engineer", "Edinburgh",
            "1667", "2008/12/13", "$103,600"],
        ["Jena Gaines", "Office Manager", "London",
            "3814", "2008/12/19", "$90,560"],
        ["Quinn Flynn", "Support Lead", "Edinburgh",
            "9497", "2013/03/03", "$342,000"],
        ["Charde Marshall", "Regional Director",
            "San Francisco", "6741", "2008/10/16", "$470,600"],
        ["Haley Kennedy", "Senior Marketing Designer",
            "London", "3597", "2012/12/18", "$313,500"],
        ["Tatyana Fitzpatrick", "Regional Director",
            "London", "1965", "2010/03/17", "$385,750"],
        ["Michael Silva", "Marketing Designer",
            "London", "1581", "2012/11/27", "$198,500"],
        ["Paul Byrd", "Chief Financial Officer (CFO)",
         "New York", "3059", "2010/06/09", "$725,000"],
        ["Gloria Little", "Systems Administrator",
            "New York", "1721", "2009/04/10", "$237,500"],
        ["Bradley Greer", "Software Engineer",
            "London", "2558", "2012/10/13", "$132,000"],
        ["Dai Rios", "Personnel Lead", "Edinburgh",
            "2290", "2012/09/26", "$217,500"],
        ["Jenette Caldwell", "Development Lead",
            "New York", "1937", "2011/09/03", "$345,000"],
        ["Yuri Berry",
            "Chief Marketing Officer (CMO)", "New York", "6154", "2009/06/25", "$675,000"],
        ["Caesar Vance", "Pre-Sales Support", "New York",
            "8330", "2011/12/12", "$106,450"],
        ["Doris Wilder", "Sales Assistant", "Sydney",
            "3023", "2010/09/20", "$85,600"],
        ["Angelica Ramos",
            "Chief Executive Officer (CEO)", "London", "5797", "2009/10/09", "$1,200,000"],
        ["Gavin Joyce", "Developer", "Edinburgh", "8822", "2010/12/22", "$92,575"],
        ["Jennifer Chang", "Regional Director",
            "Singapore", "9239", "2010/11/14", "$357,650"],
        ["Brenden Wagner", "Software Engineer",
            "San Francisco", "1314", "2011/06/07", "$206,850"],
        ["Fiona Green",
            "Chief Operating Officer (COO)", "San Francisco", "2947", "2010/03/11", "$850,000"],
        ["Shou Itou", "Regional Marketing", "Tokyo",
            "8899", "2011/08/14", "$163,000"],
        ["Michelle House", "Integration Specialist",
            "Sydney", "2769", "2011/06/02", "$95,400"],
        ["Suki Burks", "Developer", "London", "6832", "2009/10/22", "$114,500"],
        ["Prescott Bartlett", "Technical Author",
            "London", "3606", "2011/05/07", "$145,000"],
        ["Gavin Cortez", "Team Leader", "San Francisco",
            "2860", "2008/10/26", "$235,500"],
        ["Martena Mccray", "Post-Sales support",
            "Edinburgh", "8240", "2011/03/09", "$324,050"],
        ["Unity Butler", "Marketing Designer",
            "San Francisco", "5384", "2009/12/09", "$85,675"]
    ]
    }
    return jsonify(dataSet)


@trial_tab.route("/views/users_access_tab_render")
def usersAcess():
    print('Users Access Tab got clicked!')
    return render_template("trial_tab/users_access.html")


@trial_tab.route('/views/users_access_data')
def get_user():
    dataSet = {"data": [
        ["Tiger Nixon", "System Architect", "Edinburgh",
            "5421", "2011/04/25", "$320,800"],
        ["Garrett Winters", "Accountant", "Tokyo",
            "8422", "2011/07/25", "$170,750"],
        ["Ashton Cox", "Junior Technical Author",
            "San Francisco", "1562", "2009/01/12", "$86,000"],
        ["Cedric Kelly", "Senior Javascript Developer",
            "Edinburgh", "6224", "2012/03/29", "$433,060"],
        ["Airi Satou", "Accountant", "Tokyo", "5407", "2008/11/28", "$162,700"],
        ["Brielle Williamson", "Integration Specialist",
            "New York", "4804", "2012/12/02", "$372,000"],
        ["Herrod Chandler", "Sales Assistant",
            "San Francisco", "9608", "2012/08/06", "$137,500"],
        ["Rhona Davidson", "Integration Specialist",
            "Tokyo", "6200", "2010/10/14", "$327,900"],
        ["Colleen Hurst", "Javascript Developer",
            "San Francisco", "2360", "2009/09/15", "$205,500"],
        ["Sonya Frost", "Software Engineer", "Edinburgh",
            "1667", "2008/12/13", "$103,600"],
        ["Jena Gaines", "Office Manager", "London",
            "3814", "2008/12/19", "$90,560"],
        ["Quinn Flynn", "Support Lead", "Edinburgh",
            "9497", "2013/03/03", "$342,000"],
        ["Charde Marshall", "Regional Director",
            "San Francisco", "6741", "2008/10/16", "$470,600"],
        ["Haley Kennedy", "Senior Marketing Designer",
            "London", "3597", "2012/12/18", "$313,500"],
        ["Tatyana Fitzpatrick", "Regional Director",
            "London", "1965", "2010/03/17", "$385,750"],
        ["Michael Silva", "Marketing Designer",
            "London", "1581", "2012/11/27", "$198,500"],
        ["Paul Byrd", "Chief Financial Officer (CFO)",
         "New York", "3059", "2010/06/09", "$725,000"],
        ["Gloria Little", "Systems Administrator",
            "New York", "1721", "2009/04/10", "$237,500"],
        ["Bradley Greer", "Software Engineer",
            "London", "2558", "2012/10/13", "$132,000"],
        ["Dai Rios", "Personnel Lead", "Edinburgh",
            "2290", "2012/09/26", "$217,500"],
        ["Jenette Caldwell", "Development Lead",
            "New York", "1937", "2011/09/03", "$345,000"],
        ["Yuri Berry",
            "Chief Marketing Officer (CMO)", "New York", "6154", "2009/06/25", "$675,000"],
        ["Caesar Vance", "Pre-Sales Support", "New York",
            "8330", "2011/12/12", "$106,450"],
        ["Doris Wilder", "Sales Assistant", "Sydney",
            "3023", "2010/09/20", "$85,600"],
        ["Angelica Ramos",
            "Chief Executive Officer (CEO)", "London", "5797", "2009/10/09", "$1,200,000"],
        ["Gavin Joyce", "Developer", "Edinburgh", "8822", "2010/12/22", "$92,575"],
        ["Jennifer Chang", "Regional Director",
            "Singapore", "9239", "2010/11/14", "$357,650"],
        ["Brenden Wagner", "Software Engineer",
            "San Francisco", "1314", "2011/06/07", "$206,850"],
        ["Fiona Green",
            "Chief Operating Officer (COO)", "San Francisco", "2947", "2010/03/11", "$850,000"],
        ["Shou Itou", "Regional Marketing", "Tokyo",
            "8899", "2011/08/14", "$163,000"],
        ["Michelle House", "Integration Specialist",
            "Sydney", "2769", "2011/06/02", "$95,400"],
        ["Suki Burks", "Developer", "London", "6832", "2009/10/22", "$114,500"],
        ["Prescott Bartlett", "Technical Author",
            "London", "3606", "2011/05/07", "$145,000"],
        ["Gavin Cortez", "Team Leader", "San Francisco",
            "2860", "2008/10/26", "$235,500"],
        ["Martena Mccray", "Post-Sales support",
            "Edinburgh", "8240", "2011/03/09", "$324,050"],
        ["Unity Butler", "Marketing Designer",
            "San Francisco", "5384", "2009/12/09", "$85,675"]
    ]
    }
    return jsonify(dataSet)


@trial_tab.route("/views/managers_status_tab")
def call_data():
    return list_managers()


@cache.cached()
def list_managers(status=None, modified_after=None):
    printVar = False
    client = ptl.FractalClient("api.qcarchive.molssi.org", username=os.environ.get(
        'QCFRACTAL_USER', None), password=os.environ.get('QCFRACTAL_PASSWORD', None))
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
    df['modified_on'] = pd.to_datetime(df['modified_on'])
    df['year'] = pd.DatetimeIndex(df['modified_on']).year
    df['month'] = pd.DatetimeIndex(df['modified_on']).month
    df.to_csv('/Users/emanhussein/Desktop/experimental_CSV.csv')
    sortedDF = df.sort_values(by='modified_on')

    hostClusterModifiedOnDF = sortedDF.groupby(['hostname', 'cluster']).tail(
        1)[['hostname', 'cluster', 'modified_on', 'month', 'year']]

    hostClusterCompletedFailureDF = sortedDF.groupby(['hostname', 'cluster'])[
        'completed', 'failures'].sum().reset_index()
    print(hostClusterCompletedFailureDF)

    # activeDF = sortedDF.loc[sortedDF['status'] == 'ACTIVE']
    activeOnlyDF = sortedDF.loc[sortedDF['status'] == 'ACTIVE']
    # print(activeOnlyDF.shape    )
    hostClusterActiveDF = activeOnlyDF.groupby(['hostname', 'cluster'])

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

    jsonhostClusterModifiedOnDF = hostClusterModifiedOnDF.to_json(
        orient='records')
    jsonhostClusterCompletedFailureDF = hostClusterCompletedFailureDF.to_json(
        orient='records')
    # jsonDF_3 = hostClusterActiveDF.to_json(orient='index')

    print('hostClusterModifiedOnDF')
    print(hostClusterModifiedOnDF.shape[0])
    print("===========================")

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
    jsonAll = {'jsonhostClusterModifiedOnDF': jsonhostClusterModifiedOnDF,
               'jsonhostClusterCompletedFailureDF': jsonhostClusterCompletedFailureDF}
    print(jsonAll)
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
