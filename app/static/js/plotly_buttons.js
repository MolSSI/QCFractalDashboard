
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
          data_ret = ret;
          for (i = 0; i < data_ret.length; i++) {
            hostnames.push(data_ret[i].hostname)
            if (data_ret[i].hostname in dict_hostname_completed) {
              dict_hostname_completed[data_ret[i].hostname] = dict_hostname_completed[data_ret[i].hostname] + data_ret[i].completed;
            }
            else {
              dict_hostname_completed[data_ret[i].hostname] = data_ret[i].completed;
            }

            if (data_ret[i].hostname in dict_hostname_failed) {
              dict_hostname_failed[data_ret[i].hostname] = dict_hostname_failed[data_ret[i].hostname] + data_ret[i].failures;
            }
            else {
              dict_hostname_failed[data_ret[i].hostname] = data_ret[i].failures;
            }


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
              console.log(dict_clusters_active_tasks)
            }


          }
          size_dict_clusters_active_tasks = Object.keys(dict_clusters_active_tasks).length
          ////////////////////////////////////// hostnames dropdown, the way countries example was made////////////////////////////////////////////////////////////////////////
          var select = document.getElementById("hostnamesdata");
          var options = [...new Set(hostnames)]; //changed this to cluster names to compare
          options = options.sort(function (a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
          });

          var default_selected_hostnames_3 = []
          //Populate dropdown of hostnames available 
          for (var i = 0; i < options.length; i++) {
            var opt = options[i];
            if (i < 3) {
              default_selected_hostnames_3.push(opt);
            }
            var el = document.createElement("option");
            el.textContent = opt;
            el.value = opt;
            select.appendChild(el);
          }

          // initialize selectize 
          var $selectize_hostname = $('.hostnamesdata').selectize({
            // options,//This creates issues, therefore commented
            plugins: ['remove_button'],
            maxItems: null,
            items: default_selected_hostnames_3
          });

          var hostnamesDiv = document.getElementById("hostnamesDiv");

          var layout_hostnames = {
            title: 'Task Status for Selected Hosts',

            // height: 300,//in pixels
            // width: 480,//in pixels
            yaxis:
            {
              rangemode: 'tozero'
            }
          };

          function getHostnameData(chosenHostname, plottingDiv) {

            currentCompleted_hostname = {};
            currentFailed_hostname = {};

            for (var i = 0; i < chosenHostname.length; i++) {
              currentFailed_hostname[chosenHostname[i]] = dict_hostname_failed[chosenHostname[i]]
              currentCompleted_hostname[chosenHostname[i]] = dict_hostname_completed[chosenHostname[i]]

            }//end of for loop
            var d_test = [
              {
                // histfunc: "count",
                x: Object.keys(currentCompleted_hostname),
                y: Object.values(currentCompleted_hostname),
                type: "bar",
                name: "Completed"
              },
              {
                // histfunc: "count",
                x: Object.keys(currentFailed_hostname),
                y: Object.values(currentFailed_hostname),
                type: "bar",
                name: "Failed"
              }
            ]
            Plotly.newPlot(plottingDiv, d_test, layout_hostnames);

          }; //end of getClusternamesData function

          var selectizeControl_hostname = $selectize_hostname[0].selectize;
          getHostnameData(selectizeControl_hostname.getValue(), hostnamesDiv);

          // console.log(selectizeControl_hostname.getOptions())
          // console.log("typeof(selectizeControl_hostname)");

          // console.log(typeof(selectizeControl_hostname));
          // for (var i=1;i<3;i++){
          //    selectizeControl_hostname = $selectize_hostname[i].selectize;
          //    getHostnameData(selectizeControl_hostname.getValue(), hostnamesDiv);

          // }

          selectizeControl_hostname.on('change', function () {
            var chosenhostname = selectizeControl_hostname.getValue();
            getHostnameData(chosenhostname, hostnamesDiv);

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
            el.value = opt;
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

              for (var j = 0; j < data_ret.length; j++) {
                if (data_ret[j].cluster === chosenClustername[i]) {
                  // console.log("data_ret[i]");
                  // console.log(data_ret[i]);
                  if (clustername_completed[chosenClustername[i]] != null) {
                    clustername_completed[chosenClustername[i]] = clustername_completed[chosenClustername[i]] + data_ret[j].completed;
                    clustername_failed[chosenClustername[i]] = clustername_failed[chosenClustername[i]] + data_ret[j].failures;
                    // clustername_active_tasks[chosenClustername] = clustername_active_tasks[chosenClustername] + data_ret[i].active_tasks;
                  }
                  else {
                    clustername_completed[chosenClustername[i]] = data_ret[j].completed;
                    clustername_failed[chosenClustername[i]] = data_ret[j].failures;
                    // clustername_active_tasks[chosenClustername] = data_ret[i].active_tasks;
                  }

                  break; //no need to keep iterating


                }//end of if (data_ret[i].cluster === chosenClustername)

                if (data_ret[j].hostname === chosenClustername[i]) {
                  // console.log("data_ret[i]");
                  // console.log(data_ret[i]);
                  if (hostname_completed[chosenClustername[i]] != null) {
                    hostname_completed[chosenClustername[i]] = hostname_completed[chosenClustername[i]] + data_ret[j].completed;
                    hostname_failed[chosenClustername[i]] = hostname_failed[chosenClustername[i]] + data_ret[j].failures;
                    // clustername_active_tasks[chosenClustername] = clustername_active_tasks[chosenClustername] + data_ret[i].active_tasks;
                  }
                  else {
                    hostname_completed[chosenClustername[i]] = data_ret[j].completed;
                    hostname_failed[chosenClustername[i]] = data_ret[j].failures;
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
          console.log(size_dict_clusters_active_tasks)
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
          console.log(data_traces)
          var data_plot = [data_traces]

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

          // Plotly.newPlot(clusternames_activeTasksDiv, trial, layout_clusters_active_tasks);

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
          Plotly.newPlot(clusternames_activeTasksDiv, data_cluster_active_tasks, layout_clusters_active_tasks);


        } //end of ajax "success"
      }); //end of ajax call
}); //end of: $(document).ready