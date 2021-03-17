
$(document).ready(function () {

  // var lineDiv = document.getElementById('myDiv2');

  var data_ret = null;
  var hostnames = [];
  var active_inactive = [];
  var completed = [];
  var failures = [];
  var clusters_names = [];
  var clusters_active_tasks = [];

  var dict_clustername_failed = {};
  var dict_clustername_completed = {};

  var dict_hostname_failed = {};
  var dict_hostname_completed = {};
  var dict_clusters_active_tasks = {}
  var size_dict_clusters_active_tasks;
  var hostname_clustername_json;

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
          // console.log(jsonhostClusterCompletedFailure)
          var parsed_jsonhostClusterCompletedFailure = JSON.parse(jsonhostClusterCompletedFailure);


          data_ret = parsed;
          data_ret_hostClusterCompletedFailure = parsed_jsonhostClusterCompletedFailure

          // console.log('data_ret_hostClusterCompletedFailure')
          // console.log(data_ret_hostClusterCompletedFailure[0].get_group)
          var stringRepresentationSet = new Set(); //to store premitive representation of the object
          var default_selected_hostnames_3 = []
          var df_trial = []


          // sessionStorage.setItem('dataFromPython', JSON.stringify(data_ret))
          // console.log('dataFromPython: ', JSON.parse(sessionStorage.getItem('dataFromPython')));

          var dateSet = new Set()
          var hostnamesDict = {}
          Date.shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          function short_months(dt) {
            var d = Date.shortMonths[dt.getMonth()]
            return d;
          }
          // use for each and see if it would be faster
          // data_ret.each(function) --> check syntax
          for (var i = 0; i < data_ret.length; i++) {
            hostnames.push(data_ret[i].hostname)

            // example of the modified_on field: 2019-07-04T22:36:28.618504
            // modified_on_year = data_ret[i].modified_on.substring(0, 4);
            // modified_on_month = data_ret[i].modified_on.substring(5, 7);
            // modified_on_day = data_ret[i].modified_on.substring(8, 10);
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

              // if (default_selected_hostnames_3.length < 3) {
              //   default_selected_hostnames_3.push(hostname_clustername_json);
              //   df_trial.push(data_ret[i].hostname + ", Cluster: " + data_ret[i].clustername)
              // }//end of if condition checking the size of default_selected_hostnames_3
            } //end of if (stringRepresentationSet.has(stringRepresentation) == false) {

            hostnamesDict[data_ret[i].hostname] = {
              "clustername": data_ret[i].cluster,
              "modified_on_date": modified_on_date,
              "modified_on_year": modified_on_year, "modified_on_month": modified_on_month,
              // "modified_day": modified_on_day
            }
            // console.log("data_ret_hostClusterCompletedFailure[i].hostname")
            // console.log( data_ret_hostClusterCompletedFailure[i])
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

            // console.log("dict_hostname_completed")
            // console.log(typeof(dict_hostname_completed))
            // console.log(dict_hostname_completed)


            active_inactive.push(data_ret[i].status) // total for all returned data 
            clusters_names.push(data_ret[i].cluster)
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
          }//end of for loop ==> for (var i = 0; i < data_ret.length; i++)
          // console.log("df_trial")
          // console.log(df_trial)

          size_dict_clusters_active_tasks = Object.keys(dict_clusters_active_tasks).length

          //////////////////////////////////////      hostnames dropdown       ////////////////////////////////////////////////////////////////////////

          var select = document.getElementById("hostnamesdata");
          var optgroup_array = []; // Contains Cluternames to group Hostnames accordingly
          var clustArray = [];

          //Populate dropdown of hostnames available 
          for (var i = 0; i < hostname_clustername_json_array.length; i++) {
            var el = document.createElement("option");
            el.textContent = hostname_clustername_json_array[i]
            el.value = hostname_clustername_json_array[i].hostname
            select.appendChild(el);

            var clustName = hostname_clustername_json_array[i].clustername
            var json_obj = { value: clustName, label: clustName }
            if (clustArray.includes(clustName) == false) {
              clustArray.push(clustName)
              optgroup_array.push(json_obj)
            }
          }// End of for loop that populates the dropdown of hostnames available
          // console.log("optgroup_array.length")
          // console.log(optgroup_array.length)

          // console.log("optgroup_array")
          // console.log(optgroup_array)
          // console.log("hostname_clustername_json_array")
          // console.log(hostname_clustername_json_array)



          var df = [hostname_clustername_json_array[0].hostname, hostname_clustername_json_array[1].hostname, hostname_clustername_json_array[2].hostname]


          // initialize the Selectize control
          var $selectize_hostname = $('.hostnamesdata').selectize({
            options: hostname_clustername_json_array, //An array of the initial options available to select; array of objects. 
            plugins: ["remove_button"],
            items: df, //An array of the initial selected values
            maxItems: null,
            optgroups: optgroup_array,
            optgroupField: "clustername",
            closeAfterSelect: true,
            render: {
              // optgroup_header: function (data, escape) {
              //   return '<div class="optgroup-header">' + escape(data.clustername) + '</div>';
              // },
              item: function (item, escape) {
                // alert(item.hostname);
                return '<div>' +
                  '<span>' + escape(item.hostname) + '</span>' //+ '<span>' + ', Cluster: ' + escape(item.clustername) + '</span>'
                '</div>';
              },
              option: function (item, escape) {
                // alert(item.hostname);
                return '<div>' +
                  '<span>' + escape(item.hostname) + '</span>' //+ '<span>' + ', Cluster: ' + escape(item.clustername) + '</span>'
                '</div>';
              }
            },

          });

          var hostnamesDiv = document.getElementById("hostnamesDiv");

          var layout_hostnames = {

            // title: 'Task Status for Selected Hosts',
            yaxis:
            {
              rangemode: 'tozero'
            },
            xaxis: {
              automargin: true,
            },
            sliders: [{
              pad: { t: 85 },
              // margin: {
              //   t: 100,

              //   pad: 40
              // },

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
            }],
            // margin: {
            //   t: 100
            //   // ,
            //   // t: 100
            //   // ,
            //   // pad: 4
            // },
          };

          var te = layout_hostnames.sliders[0]
          var initialSelection = te.steps[0].label
          // console.log(te.steps[0].label)
          var sl = layout_hostnames.sliders[0].active

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
            var t1 = performance.now()
            console.log("Time taken to calculate steps of the slider in milliseconds =")
            console.log(t1 - t0)
            return steps

          }//end of calculateSteps function


          function getHostnameData(chosenHostname, plottingDiv) {

            var hoverData = [];
            // console.log("chosenHostname to get their data (getHostnameData):")
            // console.log(chosenHostname)

            currentCompleted_hostname = {};
            currentFailed_hostname = {};

            var t0 = performance.now()
            var filteredList = filterAccordingToSlider(chosenHostname, layout_hostnames)
            var t1 = performance.now()
            console.log("Time taken to execut filterAccordingToSlider function in getHostnameData in milliseconds =")
            console.log(t1 - t0)

            console.log("filteredList to get their data (getHostnameData):")
            console.log(filteredList)

            for (var i = 0; i < filteredList.length; i++) {
              currentFailed_hostname[filteredList[i]] = dict_hostname_failed[filteredList[i]]
              currentCompleted_hostname[filteredList[i]] = dict_hostname_completed[filteredList[i]]
              // hoverData.push("Modified on: " + map_month(hostnamesDict[filteredList[i]].modified_on_month) + " " + hostnamesDict[filteredList[i]].modified_on_year)
              // console.log("currentCompleted_hostname")
              // console.log(currentCompleted_hostname)
              // console.log(" dict_hostname_completed[filteredList[i]]")
              // console.log( dict_hostname_completed[filteredList[i]])
              // console.log(hostnamesDict[filteredList[i]].modified_on_month)
            }//end of for loop
            // console.log("currentCompleted_hostname after for loop:")
            // console.log("dict_hostname_completed")
            // console.log(dict_hostname_completed)

            var toReturn = [{ currentCompleted_hostname }, { currentFailed_hostname }]
            // console.log("toReturn[0] in get hostnameData function")
            // console.log(Object.keys(toReturn[0].currentCompleted_hostname))
            // console.log(toReturn[1])

            var returnedObject = {
              'currentCompleted_hostname': currentCompleted_hostname,
              'currentFailed_hostname': currentFailed_hostname
            }


            return toReturn;
          }; //end of getHostnamesData function

          function sliderChangeReflect(dataReturnedParam, chosenHostname, plottingDiv, layout) {
            $(this).on('plotly_sliderchange', function (e) {
              // console.log("===============================================")
              var t0 = performance.now()
              var dataReturned = getHostnameData(chosenHostname, plottingDiv);
              var t1 = performance.now()
              console.log("Time taken to get hostname data in sliderChange Reflect function in milliseconds =")
              console.log(t1 - t0)
              // var hoverData = d_testParam[0].text;
              // console.log("hoverData initially")
              // console.log(hoverData)

              // var stepLabel = getActiveSliderStep(layout)

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
          // $selectize_hostname[0].selectize.setValue(default_selected_clusternames_3);

          var tempVar = selectizeControl_hostname.getValue()

          dataReturned = getHostnameData(tempVar, hostnamesDiv);
          var dataToPlot = [
            {
              histfunc: "count",
              x: Object.keys(dataReturned[0].currentCompleted_hostname),
              y: Object.values(dataReturned[0].currentCompleted_hostname),
              type: "bar",
              name: "Completed",
              // text: hoverData
            },
            {
              histfunc: "count",
              x: Object.keys(dataReturned[1].currentFailed_hostname),
              y: Object.values(dataReturned[1].currentFailed_hostname),
              type: "bar",
              name: "Failed",
              // text: hoverData
            }
          ]
          Plotly.react(hostnamesDiv, dataToPlot, layout_hostnames)
          // var t0 = performance.now()
          sliderChangeReflect(dataReturned, tempVar, hostnamesDiv, layout_hostnames)
          // var t1 = performance.now()
          // console.log("Time taken to execute sliderChangeReflect function in milliseconds =")
          // console.log(t1 - t0)

          // var dataToPlot = getHostnameData(tempVar, hostnamesDiv);
          // Plotly.newPlot(hostnamesDiv, dataToPlot, layout_hostnames) //first plot

          function getActiveSliderStep(layout) {

            var stepLabelIndex = layout.sliders[0].active
            if (stepLabelIndex == undefined) {
              stepLabelIndex = 0
            }
            var stepVar = layout.sliders[0].steps[stepLabelIndex]
            var stepLabel = stepVar.label
            return stepLabel
          }
          function filterAccordingToSlider(chosenHostnamedList, layout) {
            var t0 = performance.now()
            var activeSliderStepVar = getActiveSliderStep(layout);
            var t1 = performance.now()
            console.log("Time taken to execute getActiveSliderStep function in milliseconds =")
            console.log(t1 - t0)
            var stepLabelDate = new Date(activeSliderStepVar);

            if (activeSliderStepVar == layout.sliders[0].steps[0].label) {
              var filteredHostnamesList = chosenHostnamedList
            }
            else {
              var filteredHostnamesList = []
              for (var i = 0; i < chosenHostnamedList.length; i++) {
                // console.log("chosenHostnamedList[i] in filterAccordingToSlider:")
                // console.log(chosenHostnamedList[i])
                // console.log("hostnamesDict[chosenHostnamedList[i]].modified_on_date:")
                // console.log(hostnamesDict[chosenHostnamedList[i]].modified_on_date)
                //if this element has modified_on_month that is > the selected slider value, remove it from chosen hostnames
                if (hostnamesDict[chosenHostnamedList[i]].modified_on_date >= stepLabelDate) {
                  // console.log(String(chosenHostnamedList[i]) + " has modified_on month after the selected month, so including it")
                  filteredHostnamesList.push(chosenHostnamedList[i]) // potential bottleneck
                }
              }

            }
            // console.log("filteredHostnamesList in filterAccordingToSlider:")
            // console.log(filteredHostnamesList)

            return filteredHostnamesList
          }//end of filterAccordingToSlider function

          selectizeControl_hostname.on('change', function () {
            var chosenhostname = selectizeControl_hostname.getValue();
            // console.log("typeof chosenhostname")
            // console.log(typeof (chosenhostname))
            dataReturned = getHostnameData(chosenhostname, hostnamesDiv);

            var dataToPlot = [
              {
                histfunc: "count",
                x: Object.keys(dataReturned[0].currentCompleted_hostname),
                y: Object.values(dataReturned[0].currentCompleted_hostname),
                type: "bar",
                name: "Completed",
                // text: hoverData
              },
              {
                histfunc: "count",
                x: Object.keys(dataReturned[1].currentFailed_hostname),
                y: Object.values(dataReturned[1].currentFailed_hostname),
                type: "bar",
                name: "Failed",
                // text: hoverData
              }
            ]
            Plotly.react(hostnamesDiv, dataToPlot, layout_hostnames)
            var t0 = performance.now()
            sliderChangeReflect(dataToPlot, chosenhostname, hostnamesDiv, layout_hostnames)
            var t1 = performance.now()
            console.log("Time taken to execute sliderChangeReflect function in milliseconds =")
            console.log(t1 - t0)
          });

          ////////////////////////////////////// End of Hostnames example //////////////////////////////////////////

          ///////////////////////////////////// Clusternames dropdown////////////////////////////////////////////////////////////////////////////
          var select = document.getElementById("clusternamesdata");
          var options_clusters = [...new Set(clusters_names)]; //changed this to cluster names to compare
          options_clusters = options_clusters.sort(function (a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
          });

          var default_selected_clusternames_3 = []
          //Populate dropdown of hostnames available 

          for (var i = 0; i < options_clusters.length; i++) {
            var opt = options_clusters[i];
            if (i < 3) {
              default_selected_clusternames_3.push(opt);
            }
            var el = document.createElement("option");
            el.textContent = opt;
            el.value = opt; // concatenate the clustername_hostaname
            select.appendChild(el);
          }

          // initialize selectize 
          var $selectize = $('#clusternamesdata').selectize({
            // options: options_clusters, //This creates issues, therefore commented
            plugins: ['remove_button'],
            maxItems: null,
            items: default_selected_clusternames_3
          });

          var clusternamesDiv = document.getElementById("clusternamesDiv");

          var layout_clusters = {
            title: 'Task Status for Selected Clusters',

            // height: 300,//in pixels
            // width: 480,//in pixels
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
                  // console.log("data_ret[i]");
                  // console.log(data_ret[i]);
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
              // console.log(currentFailed);

              currentCompleted_hostname.push(hostname_completed[chosenClustername[i]]);
              currentFailed_hostname.push(hostname_failed[chosenClustername[i]]);
              // currentActiveTasks.push(clustername_active_tasks[chosenClustername[i]]);
              // console.log(currentFailed);

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
          // Third plot
          var clusternames_activeTasksDiv = document.getElementById('clusternames_activeTasksDiv');
          var randomColor = [];
          const data_traces = new Array(size_dict_clusters_active_tasks);
          // console.log("size_dict_clusters_active_tasks")
          // console.log(size_dict_clusters_active_tasks)
          // for (var i = 0; i < size_dict_clusters_active_tasks; i++) {
          //   var trace_x = Object.keys(dict_clusters_active_tasks)[i];
          //   var trace_y = Object.values(dict_clusters_active_tasks)[i];
          //   randomColor = Math.floor(Math.random() * 16777215).toString(16);
          //   var combined =
          //   {
          //     x: trace_x,
          //     y: trace_y,
          //     marker: { color: randomColor },
          //     type: 'bar'
          //   };

          //   data_traces[i] = combined;

          // }

          for (var i = 0; i < size_dict_clusters_active_tasks; i++) {
            randomColor.push(Math.floor(Math.random() * 16777215).toString(16))

          }
          // console.log(data_traces)
          // var data_plot = [data_traces]

          var trial = [
            {
              marker: { color: "baf363" },
              type: "bar",
              x: "PacificResearchPlatformQM",
              y: 62
            },
            {
              marker: { color: "fe56bb" },
              type: "bar",
              x: "lilac_multithread",
              y: 143
            },
            {
              marker: { color: "7bb5b0" },
              type: "bar",
              x: "PacificResearchPlatformML",
              y: 32
            }]

          // console.log("trial")
          // console.log(trial)
          Plotly.newPlot(clusternames_activeTasksDiv, trial);

          var data_cluster_active_tasks = [
            {
              // histfunc: "count",
              x: Object.keys(dict_clusters_active_tasks),
              y: Object.values(dict_clusters_active_tasks),
              type: "bar",

              name: "Number of Active tasks",
              // marker: Object.values(dict_clusters_active_tasks).map(String),
              marker: { color: randomColor },

              hoverinfo: 'Number of Active Tasks',
            }
          ]
          var layout_clusters_active_tasks = {
            title: 'Clusters with Active tasks',
            yaxis:
            {
              rangemode: 'tozero',
              label: 'Number of Active tasks'
            }
          };
          // Plotly.newPlot(clusternames_activeTasksDiv, data_traces, layout_clusters_active_tasks);
          // Plotly.newPlot(clusternames_activeTasksDiv, data_cluster_active_tasks, layout_clusters_active_tasks);


        } //end of ajax "success"
      }); //end of ajax call
}); //end of: $(document).ready