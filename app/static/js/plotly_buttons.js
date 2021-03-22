
$(document).ready(function () {
  var data_ret = null;
  var hostnames = [];
  var active_inactive = [];
  var completed = [];
  var failures = [];
  var clusters_names = [];
  var stringRepresentationClusterSet = new Set()

  var dict_hostname_failed = {};
  var dict_hostname_completed = {};
  var dict_clusters_active_tasks = {}
  var size_dict_clusters_active_tasks;
  var hostname_clustername_json;
  var randomColorArray = [];

  var optgroup_array = []; // Contains Cluternames to group Hostnames accordingly for the dropdown
  var clustArray = [];
  $.ajax
    (
      {
        url: "/views/managers_status_tab",
        async: false, //to wait until data is returned, potential bug
        dataType: 'json',
        error: function (xhr, error) {
          alert("error /views/managers_status_tab: " + xhr);
        },
        success: function (ret) {
          var hostname_clustername_json_array = [];

          var jsonhostClusterModifiedOn = ret['jsonhostClusterModifiedOnDF']
          var parsed = JSON.parse(jsonhostClusterModifiedOn);

          var jsonhostClusterCompletedFailure = ret['jsonhostClusterCompletedFailureDF']
          var parsed_jsonhostClusterCompletedFailure = JSON.parse(jsonhostClusterCompletedFailure);

          data_ret = parsed;
          data_ret_hostClusterCompletedFailure = parsed_jsonhostClusterCompletedFailure

          var stringRepresentationSet = new Set(); //to store premitive representation of the object

          sessionStorage.setItem('dataFromPython', JSON.stringify(data_ret))
          // console.log('dataFromPython: ', JSON.parse(sessionStorage.getItem('dataFromPython')));

          var dateSet = new Set()
          var hostnamesDict = {}
          Date.shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          function short_months(dt) {
            var d = Date.shortMonths[dt.getMonth()]
            return d;
          }

          for (var i = 0; i < data_ret.length; i++) {
            hostnames.push(data_ret[i].hostname)
            modified_on_year = data_ret[i].year;
            modified_on_month = data_ret[i].month;
            var concatString = String(modified_on_year) + "," + String(modified_on_month)
            modified_on_date = new Date(concatString); //To be added to the list of hostnames data

            if (!dateSet.has(concatString)) {
              dateSet.add(concatString)
            }

            hostname_clustername_json = {
              "hostname": data_ret[i].hostname, "clustername": data_ret[i].cluster,
              // "modified_on_date": modified_on_date,
              "modified_on_year": modified_on_year, "modified_on_month": modified_on_month,
              // "modified_day": modified_on_day
            }

            var stringRepresentation = data_ret[i].hostname + " " + data_ret[i].cluster
            if (stringRepresentationSet.has(stringRepresentation) == false) {
              stringRepresentationSet.add(stringRepresentation)
              hostname_clustername_json_array.push(hostname_clustername_json)
            } //end of if (stringRepresentationSet.has(stringRepresentation) == false) {

            var clustName = hostname_clustername_json_array[i].clustername
            var json_obj = { value: clustName, label: clustName }
            if (clustArray.includes(clustName) == false) {
              clustArray.push(clustName)
              optgroup_array.push(json_obj)
            }//end of if condition

            hostnamesDict[data_ret[i].hostname] = {
              "clustername": data_ret[i].cluster,
              "modified_on_date": modified_on_date,
              "modified_on_year": modified_on_year, "modified_on_month": modified_on_month,
              // "modified_day": modified_on_day
            }

            if (data_ret_hostClusterCompletedFailure[i].hostname in dict_hostname_completed) {
              dict_hostname_completed[data_ret_hostClusterCompletedFailure[i].hostname] = dict_hostname_completed[data_ret_hostClusterCompletedFailure[i].hostname] + data_ret_hostClusterCompletedFailure[i].completed;
            }
            else {
              dict_hostname_completed[data_ret_hostClusterCompletedFailure[i].hostname] = data_ret_hostClusterCompletedFailure[i].completed;
            }

            if (data_ret_hostClusterCompletedFailure[i].hostname in dict_hostname_failed) {
              dict_hostname_failed[data_ret_hostClusterCompletedFailure[i].hostname] = dict_hostname_failed[data_ret_hostClusterCompletedFailure[i].hostname] + data_ret_hostClusterCompletedFailure[i].failures;
            }
            else {
              dict_hostname_failed[data_ret_hostClusterCompletedFailure[i].hostname] = data_ret_hostClusterCompletedFailure[i].failures;
            }

            active_inactive.push(data_ret[i].status) // total for all returned data 

            // Set containing clusters
            var stringRepresentationCluster = String(data_ret[i].cluster)
            var clustername_json = { "clustername": data_ret[i].cluster}
            if (stringRepresentationClusterSet.has(stringRepresentationCluster) == false) {
              stringRepresentationClusterSet.add(stringRepresentationCluster)
              clusters_names.push(clustername_json)
            } //end of if (stringRepresentationSet.has(stringRepresentation) == false)
            
            completed.push(data_ret[i].completed)// total for all returned data
            failures.push(data_ret[i].failures)// total for all returned data

            if (data_ret[i].status == "ACTIVE") {
              if (data_ret[i].active_tasks != null) {
                if (data_ret[i].cluster in dict_clusters_active_tasks) {
                  dict_clusters_active_tasks[data_ret[i].cluster] = dict_clusters_active_tasks[data_ret[i].cluster] + data_ret[i].active_tasks
                }
                else {
                  dict_clusters_active_tasks[data_ret[i].cluster] = data_ret[i].active_tasks
                }
              }
            }
            randomColorArray.push(Math.floor(Math.random() * 16777215).toString(16))


          }//end of for loop ==> for (var i = 0; i < data_ret.length; i++)

          size_dict_clusters_active_tasks = Object.keys(dict_clusters_active_tasks).length

          //////////////////////////////////////      hostnames dropdown       ////////////////////////////////////////////////////////////////////////

          var df = [hostname_clustername_json_array[0].hostname, hostname_clustername_json_array[1].hostname, hostname_clustername_json_array[2].hostname]

          // initialize the Selectize control
          var $selectize_hostname = $('.hostnamesdata').selectize({
            options: hostname_clustername_json_array, //An array of the options available to select; array of objects. 
            valueField: 'hostname',
            labelField: 'hostname',
            plugins: ["remove_button"],
            // persist: false,
            items: df, //An array of the initial(default) selected values
            maxItems: null,
            optgroups: optgroup_array,
            optgroupField: "clustername",
            // closeAfterSelect: true,
            render: {
              item: function (item, escape) {
                return '<div>' +
                  '<span>' + escape(item.hostname) + '</div>';
              },
              option: function (item, escape) {
                return '<div>' +
                  '<span>' + escape(item.hostname) + '</div>';
              }
            },

          });

          var hostnamesDiv = document.getElementById("hostnamesDiv");
          var layout_hostnames = {
            yaxis:
            {
              rangemode: 'tozero'
            },
            xaxis: {
              automargin: true,
            },
            sliders: [{
              pad: { t: 85 },
              currentvalue: {
                automargin: true,
                xanchor: 'center',
                prefix: 'Select Month to Start Filtering from: ',
                font: {
                  color: '#888',
                  size: 20
                }
              },
              transition: { duration: 500 },
              steps: calculateSteps(dateSet)
            }]
          };

          function calculateSteps(dateSetParam) {
            var t0 = performance.now();
            var modifiedOnMonthStep = []
            for (let stringEntry of dateSetParam) {
              var dateEntry = new Date(stringEntry)
              modifiedOnMonthStep.push(dateEntry)
            }
            modifiedOnMonthStep.sort(Plotly.d3.ascending)
            // calculate steps
            var steps = []
            for (var i = 0; i < modifiedOnMonthStep.length; i++) {
              var sliderLabel = String(short_months(modifiedOnMonthStep[i])) + " " + String(modifiedOnMonthStep[i].getFullYear())
              var step = {
                label: sliderLabel,
                method: 'skip',
                execute: false
                // method: 'restyle',
                // args: [['red'], {
                //   mode: 'immediate',
                //   frame: { redraw: false, duration: 500 },
                //   transition: { duration: 500 }
                // }]
              }
              steps.push(step)
            }
            //maximum will be today's date
            var maxStepDate = new Date()
            var maxStepLabel = String(short_months(maxStepDate)) + " " + String(maxStepDate.getFullYear())
            var step = {
              label: maxStepLabel,
              method: 'skip',
              execute: false
              // method: 'restyle',
              // args: [['red'], {
              //   mode: 'immediate',
              //   frame: { redraw: false, duration: 500 },
              //   transition: { duration: 500 }
              // }]
            }
            steps.push(step)
            return steps
          }//end of calculateSteps function

          function getHostnameData(chosenHostname, plottingDiv) {
            // var hoverData = [];
            var filteredList = filterAccordingToSlider(chosenHostname, layout_hostnames)

            currentCompleted_hostname = {};
            currentFailed_hostname = {};
            for (var i = 0; i < filteredList.length; i++) {
              currentFailed_hostname[filteredList[i]] = dict_hostname_failed[filteredList[i]]
              currentCompleted_hostname[filteredList[i]] = dict_hostname_completed[filteredList[i]]
              // hoverData.push("Modified on: " + map_month(hostnamesDict[filteredList[i]].modified_on_month) + " " + hostnamesDict[filteredList[i]].modified_on_year)
            }//end of for loop

            var toReturn = [{ currentCompleted_hostname }, { currentFailed_hostname }]
            return toReturn;
          }; //end of getHostnamesData function

          function sliderChangeReflect(dataReturnedParam, chosenHostname, plottingDiv, layout) {
            $(this).on('plotly_sliderchange', function (e) {
              var dataReturned = getHostnameData(chosenHostname, plottingDiv);

              var dataToPlot = [
                {
                  automargin: true,
                  histfunc: "count",
                  x: Object.keys(dataReturned[0].currentCompleted_hostname),
                  y: Object.values(dataReturned[0].currentCompleted_hostname),
                  type: "bar",
                  name: "Completed",
                  // text: hoverData
                },
                {
                  automargin: true,
                  histfunc: "count",
                  x: Object.keys(dataReturned[1].currentFailed_hostname),
                  y: Object.values(dataReturned[1].currentFailed_hostname),
                  type: "bar",
                  name: "Failed",
                  // text: hoverData
                }
              ]
              Plotly.react(plottingDiv, dataToPlot, layout_hostnames)
            })// end of plottingDiv.on('plotly_sliderchange'...
          }
          // fetch the instance
          var selectizeControl_hostname = $selectize_hostname[0].selectize;
          var tempVar = selectizeControl_hostname.getValue()
          dataReturned = getHostnameData(tempVar, hostnamesDiv);
          var dataToPlot = [
            {
              histfunc: "count",
              x: Object.keys(dataReturned[0].currentCompleted_hostname),
              y: Object.values(dataReturned[0].currentCompleted_hostname),
              type: "bar",
              name: "Completed",
              // text: Object.values(dataReturned[0].currentCompleted_hostname).map(String),
              // text: hoverData
            },
            {
              histfunc: "count",
              x: Object.keys(dataReturned[1].currentFailed_hostname),
              y: Object.values(dataReturned[1].currentFailed_hostname),
              type: "bar",
              name: "Failed",
              // text: Object.values(dataReturned[1].currentFailed_hostname).map(String),
              // text: hoverData
            }
          ]
          Plotly.react(hostnamesDiv, dataToPlot, layout_hostnames)
          sliderChangeReflect(dataReturned, tempVar, hostnamesDiv, layout_hostnames)

          function getActiveSliderStep(layout) {
            var stepLabelIndex = layout.sliders[0].active
            if (stepLabelIndex == undefined) {
              stepLabelIndex = 0
            }
            var stepVar = layout.sliders[0].steps[stepLabelIndex]
            var stepLabel = stepVar.label
            return stepLabel
          } // end of getActiveSliderStep function

          function filterAccordingToSlider(chosenHostnamedList, layout) {
            var activeSliderStepVar = getActiveSliderStep(layout);
            var stepLabelDate = new Date(activeSliderStepVar);

            if (activeSliderStepVar == layout.sliders[0].steps[0].label) {
              var filteredHostnamesList = chosenHostnamedList
            }
            else {
              var filteredHostnamesList = []
              for (var i = 0; i < chosenHostnamedList.length; i++) {
                //if this element has modified_on_month that is > the selected slider value, remove it from chosen hostnames
                if (hostnamesDict[chosenHostnamedList[i]].modified_on_date >= stepLabelDate) {
                  filteredHostnamesList.push(chosenHostnamedList[i]) // potential bottleneck
                } // end of if condition
              } // end of for loop
            } // end of else
            return filteredHostnamesList
          }//end of filterAccordingToSlider function

          selectizeControl_hostname.on('change', function () {
            var chosenhostname = selectizeControl_hostname.getValue();
            dataReturned = getHostnameData(chosenhostname, hostnamesDiv);
            var dataToPlot = [
              {
                histfunc: "count",
                x: Object.keys(dataReturned[0].currentCompleted_hostname),
                y: Object.values(dataReturned[0].currentCompleted_hostname),
                type: "bar",
                name: "Completed",
                // text: Object.values(dataReturned[0].currentCompleted_hostname).map(String),
                // text: hoverData
              },
              {
                histfunc: "count",
                x: Object.keys(dataReturned[1].currentFailed_hostname),
                y: Object.values(dataReturned[1].currentFailed_hostname),
                type: "bar",
                name: "Failed",
                // text: Object.values(dataReturned[1].currentFailed_hostname).map(String),
                // text: hoverData
              }
            ]
            Plotly.react(hostnamesDiv, dataToPlot, layout_hostnames)
            sliderChangeReflect(dataToPlot, chosenhostname, hostnamesDiv, layout_hostnames)
          });
          ////////////////////////////////////// End of Hostnames Related Part ////////////////////////////////////////////
          // ********************************************************************************************************** //
          ///////////////////////////////////// Beginning of Clusternames dropdown///////////////////////////////////////
          // var options_clusters = [...new Set(clusters_names)]; //changed this to cluster names to compare
          // options_clusters = options_clusters.sort(function (a, b) {
          //   return a.clustername.toLowerCase().localeCompare(b.clustername.toLowerCase());
          // });
          console.log(clusters_names)

          var df_cluster = [clusters_names[0].clustername, clusters_names[1].clustername, clusters_names[2].clustername]
          // initialize selectize 
          var $selectize = $('#clusternamesdata').selectize({
            options: clusters_names, 
            valueField: 'clustername',
            labelField: 'clustername',
            plugins: ['remove_button'],
            maxItems: null,
            items: df_cluster
          });

          var clusternamesDiv = document.getElementById("clusternamesDiv");

          var layout_clusters = {
            title: 'Task Status for Selected Clusters',
            yaxis:
            {
              rangemode: 'tozero'
            }
          };


          function getClusternameData(chosenClustername, plottingDiv) {

            currentCompleted = [];
            currentFailed = [];
            currentActiveTasks = [];

            clustername_completed = {};
            clustername_failed = {};
            clustername_active_tasks = {};

            currentCompleted_hostname = [];
            currentFailed_hostname = [];
            currentActiveTasks_hostname = [];

            hostname_completed = {};
            hostname_failed = {};
            hostname_active_tasks = {};

            for (var i = 0; i < chosenClustername.length; i++) {

              for (var j = 0; j < data_ret_hostClusterCompletedFailure.length; j++) {
                if (data_ret_hostClusterCompletedFailure[j].cluster === chosenClustername[i]) {
                  if (clustername_completed[chosenClustername[i]] != null) {
                    clustername_completed[chosenClustername[i]] = clustername_completed[chosenClustername[i]] + data_ret_hostClusterCompletedFailure[j].completed;
                    clustername_failed[chosenClustername[i]] = clustername_failed[chosenClustername[i]] + data_ret_hostClusterCompletedFailure[j].failures;
                    // clustername_active_tasks[chosenClustername] = clustername_active_tasks[chosenClustername] + data_ret[i].active_tasks;
                  }
                  else {
                    clustername_completed[chosenClustername[i]] = data_ret_hostClusterCompletedFailure[j].completed;
                    clustername_failed[chosenClustername[i]] = data_ret_hostClusterCompletedFailure[j].failures;
                    // clustername_active_tasks[chosenClustername] = data_ret[i].active_tasks;
                  }

                  break; //no need to keep iterating


                }//end of if (data_ret[i].cluster === chosenClustername)

                if (data_ret_hostClusterCompletedFailure[j].hostname === chosenClustername[i]) {
                  // console.log("data_ret[i]");
                  // console.log(data_ret[i]);
                  if (hostname_completed[chosenClustername[i]] != null) {
                    hostname_completed[chosenClustername[i]] = hostname_completed[chosenClustername[i]] + data_ret_hostClusterCompletedFailure[j].completed;
                    hostname_failed[chosenClustername[i]] = hostname_failed[chosenClustername[i]] + data_ret_hostClusterCompletedFailure[j].failures;
                    // clustername_active_tasks[chosenClustername] = clustername_active_tasks[chosenClustername] + data_ret[i].active_tasks;
                  }
                  else {
                    hostname_completed[chosenClustername[i]] = data_ret_hostClusterCompletedFailure[j].completed;
                    hostname_failed[chosenClustername[i]] = data_ret_hostClusterCompletedFailure[j].failures;
                    // clustername_active_tasks[chosenClustername] = data_ret[i].active_tasks;
                  }

                }//end of if (data_ret[i].cluster === chosenClustername)

              }//end of for loop
              currentCompleted.push(clustername_completed[chosenClustername[i]]);
              currentFailed.push(clustername_failed[chosenClustername[i]]);
              currentActiveTasks.push(clustername_active_tasks[chosenClustername[i]]);

              currentCompleted_hostname.push(hostname_completed[chosenClustername[i]]);
              currentFailed_hostname.push(hostname_failed[chosenClustername[i]]);
            }
            var d_test = [
              {
                // histfunc: "count",
                x: chosenClustername,
                y: currentCompleted,
                type: "bar",
                name: "Completed"
              },
              {
                // histfunc: "count",
                x: chosenClustername,
                y: currentFailed,
                type: "bar",
                name: "Failed"
              }
            ]
            Plotly.newPlot(plottingDiv, d_test, layout_clusters);

          }; //end of getClusternamesData function

          // fetch the instance
          var selectizeControl = $selectize[0].selectize;
          getClusternameData(selectizeControl.getValue(), clusternamesDiv);

          selectizeControl.on('change', function () {
            var chosenClustername = selectizeControl.getValue();
            getClusternameData(chosenClustername, clusternamesDiv);
          });


          ///////////////////////////////////// Clusternames dropdown////////////////////////////////////////////////////////////////////////////
          // Third plot [If there are clusters with active_tasks >0]
          var clusternames_activeTasksDiv = document.getElementById('clusternames_activeTasksDiv');
          var data = [
            {
              x: Object.keys(dict_clusters_active_tasks),
              y: Object.values(dict_clusters_active_tasks),
              type: 'bar',
              marker:  {color:randomColorArray},
              hoverinfo: 'Number of Active Tasks',
            }
          ];
          if (size_dict_clusters_active_tasks >0)
            Plotly.newPlot(clusternames_activeTasksDiv, data);

        } //end of ajax "success"
      }); //end of ajax call
}); //end of: $(document).ready