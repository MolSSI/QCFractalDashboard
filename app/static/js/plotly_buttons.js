
$(document).ready(function () {

  var lineDiv = document.getElementById('myDiv2');

  var data_ret = null;

  var parsedJson = [];
  var active_inactive = [];
  var completed = [];
  var failures = [];
  var clusters_names = [];
  var da;
  var layout2;
  var clusters_active_tasks = [];
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

          // alert("success /views/managers_status_tab: "+ret);
          data_ret = ret;
          console.log("data.length")
          console.log(data_ret.length)
          console.log("data active")


          for (i = 0; i < data_ret.length; i++) {
            // if(data[i].status=="ACTIVE")
            parsedJson.push(data_ret[i].hostname)
            active_inactive.push(data_ret[i].status)
            clusters_names.push(data_ret[i].cluster)
            completed.push(data_ret[i].completed)
            failures.push(data_ret[i].failures)

            if (data_ret[i].active_tasks != null) {
              clusters_active_tasks.push(data_ret[i].active_tasks)
            }

          }
          ////////////////////////////////////// hostnames dropdown, the way countries example was made////////////////////////////////////////////////////////////////////////
          var select = document.getElementById("hostnamesdata");
          var options = [...new Set(parsedJson)]; //changed this to cluster names to compare
          options = options.sort(function (a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
          });
          //Populate dropdown of hostnames available 
          for (var i = 0; i < options.length; i++) {
            var opt = options[i];
            // console.log(opt);
            var el = document.createElement("option");
            el.textContent = opt;
            el.value = opt;
            select.appendChild(el);
          }

          // plotting 
          function getHostnameData(chosenHostname) {
            currentCompleted = [];
            currentFailed = [];

            hostname_completed = {};
            hostname_failed = {};

            for (var i = 0; i < data_ret.length; i++) {
              if (data_ret[i].hostname === chosenHostname) {
                console.log("data_ret[i]");
                console.log(data_ret[i]);
                if (hostname_completed[chosenHostname] != null) {
                  hostname_completed[chosenHostname] = hostname_completed[chosenHostname] + data_ret[i].completed;
                  hostname_failed[chosenHostname] = hostname_failed[chosenHostname] + data_ret[i].failures;

                }
                else {
                  hostname_completed[chosenHostname] = data_ret[i].completed;
                  hostname_failed[chosenHostname] = data_ret[i].failures;
                }

              }//end of if (data_ret[i].hostname === chosenHostname)
            }//end of for loop
            currentCompleted.push(hostname_completed[chosenHostname]);
            currentFailed.push(hostname_failed[chosenHostname]);

          };

          setBubblePlot(options[0]);
          console.log("options[0]");
          console.log(options[0]);

          function setBubblePlot(chosenHostname) {
            getHostnameData(chosenHostname);
            console.log(chosenHostname);
            chosenHostnameList = [chosenHostname]
            var d_completed_failures = [
              {
                // histfunc: "count",
                x: chosenHostnameList,
                y: currentCompleted,
                type: "bar",
                name: "Completed"
              },
              {
                // histfunc: "count",
                x: chosenHostnameList,
                y: currentFailed,
                type: "bar",
                name: "Failed"
              }
            ]

            var layout = {
              title: 'Completed & Failed Tasks Plot of Selected Hostname',

              height: 400,//in pixels
              width: 480, //in pixels
              yaxis:
              {
                rangemode: 'tozero'
              }

            };

            Plotly.newPlot('hostnamesDiv', d_completed_failures, layout);
          };

          var innerContainer = document.querySelector('[data-num="0"'),
            hostnameSelector = innerContainer.querySelector('.hostnamesdata');

          function updateHostname() {
            setBubblePlot(hostnameSelector.value);
          }

          hostnameSelector.addEventListener('change', updateHostname, false);

          ////////////////////////////////////// End of Hostnames example ////////////////////////////////////

          ///////////////////////////////////// Clusternames dropdown////////////////////////////////////////////////////////////////////////////
          var select = document.getElementById("clusternamesdata");
          var options_clusters = [...new Set(clusters_names)]; //changed this to cluster names to compare
          options_clusters = options_clusters.sort(function (a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
          });
          //Populate dropdown of hostnames available 
          for (var i = 0; i < options_clusters.length; i++) {
            var opt = options_clusters[i];
            // console.log(opt);
            var el = document.createElement("option");
            el.textContent = opt;
            el.value = opt;
            select.appendChild(el);
          }
          // plotting 
          function getClusternameData(chosenClustername) {
            currentCompleted = [];
            currentFailed = [];
            currentActiveTasks = [];

            clustername_completed = {};
            clustername_failed = {};
            clustername_active_tasks = {};

            for (var i = 0; i < data_ret.length; i++) {
              if (data_ret[i].cluster === chosenClustername) {
                console.log("data_ret[i]");
                console.log(data_ret[i]);
                if (clustername_completed[chosenClustername] != null) {
                  clustername_completed[chosenClustername] = clustername_completed[chosenClustername] + data_ret[i].completed;
                  clustername_failed[chosenClustername] = clustername_failed[chosenClustername] + data_ret[i].failures;
                  clustername_active_tasks[chosenClustername] = clustername_active_tasks[chosenClustername] + data_ret[i].active_tasks;
                }
                else {
                  clustername_completed[chosenClustername] = data_ret[i].completed;
                  clustername_failed[chosenClustername] = data_ret[i].failures;
                  clustername_active_tasks[chosenClustername] = data_ret[i].active_tasks;
                }

              }//end of if (data_ret[i].cluster === chosenClustername)
            }//end of for loop
            currentCompleted.push(clustername_completed[chosenClustername]);
            currentFailed.push(clustername_failed[chosenClustername]);
            currentActiveTasks.push(clustername_active_tasks[chosenClustername]);
          };

          setBubblePlot_clusters(options_clusters[0]);
          console.log("options_clusters[0]");
          console.log(options_clusters[0]);

          function setBubblePlot_clusters(chosenClustername) {
            getClusternameData(chosenClustername);
            console.log(chosenClustername);
            chosenClusternameList = [chosenClustername]

            var d_active_tasks = [
              {
                // histfunc: "count",
                x: chosenClusternameList,
                y: currentActiveTasks,
                type: "bar",
                name: "Active Taks Count"
              }
            ]
            var d_completed_failures = [
              {
                // histfunc: "count",
                x: chosenClusternameList,
                y: currentCompleted,
                type: "bar",
                name: "Completed"
              },
              {
                // histfunc: "count",
                x: chosenClusternameList,
                y: currentFailed,
                type: "bar",
                name: "Failed"
              }
            ]

            var layout = {
              title: 'Completed & Failed Tasks Plot of Selected Clusternames',

              height: 400, //in pixels
              width: 480 //in pixels
            };
            var layout_active_tasks = {
              title: 'Active Tasks Plot of Selected Clusternames',

              height: 300,//in pixels
              width: 480,//in pixels
              yaxis:
              {
                rangemode: 'tozero'
              }
            };

            // Plotly.newPlot('clusternamesDiv', d_completed_failures, layout);
            // Plotly.newPlot('clusternamesDiv_active_tasks', d_active_tasks, layout_active_tasks);

          };

          var innerContainer = document.querySelector('[data-num="2"'),
            clusternameSelector = innerContainer.querySelector('.clusternamesdata');

          function updateClustername() {
            setBubblePlot_clusters(clusternameSelector.value);
          }

          clusternameSelector.addEventListener('change', updateClustername, false);


          ////////////////////////////////////////////////// End of Clusternames dropdown ////////////////////////////////////////////////////////////////

          ////////////////////////////////////////////////// Dropdown for Cluster with active tasks //////////////////////////////////////////////////
          var select = document.getElementById("clusternamesdata_active_tasks");
          var options_clusters_active_tasks = [...new Set(clusters_active_tasks)]; //changed this to cluster names to compare
          options_clusters = options_clusters.sort(function (a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
          });
          //Populate dropdown of hostnames available 
          for (var i = 0; i < options_clusters_active_tasks.length; i++) {
            var opt = options_clusters_active_tasks[i];
            // console.log(opt);
            var el = document.createElement("option");
            el.textContent = opt;
            el.value = opt;
            select.appendChild(el);
          }

          ////////////////////////////////////////////////// End of Dropdown for Cluster with active tasks //////////////////////////////////////////////////

          // initialize selectize for box plot
          var $selectize = $('#clusternamesdata').selectize({
            options_clusters,
            plugins: ['remove_button'],
            maxItems: null,
          });

          var clusternamesDiv = document.getElementById("clusternamesDiv");

          var layout_clusters = {
            title: 'Clusternames',

            height: 300,//in pixels
            width: 480,//in pixels
            yaxis:
            {
              rangemode: 'tozero'
            }
          };
          // // plotly initialize
          // Plotly.newPlot(clusternamesDiv, options_clusters,layout_clusters);


          // function updatePlot(chosenClusters) {
          //   console.log("chosenClusters ya gama3a")
          //   console.log(chosenClusters)
          //   var chosenClusters = chosenClusters || []
          //   // var traceIndex = getActiveTrace()

          //   for (var i = 0; i < chosenClusters.length; i++) {
          //     plotlyData.push(chosenClusters[i])
          //   }
          //   Plotly.update(clusternamesDiv,plotlyData )
          //   // Plotly.react(clusternamesDiv, plotlyData)

          // };
          function getClusternameData(chosenClustername) {
            currentCompleted = [];
            currentFailed = [];
            currentActiveTasks = [];

            clustername_completed = {};
            clustername_failed = {};
            clustername_active_tasks = {};

            for (var i = 0; i < chosenClustername.length; i++) {

              for (var j = 0; j < data_ret.length; j++) {
                if (data_ret[j].cluster === chosenClustername[i]) {
                  console.log("data_ret[i]");
                  console.log(data_ret[i]);
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

                }//end of if (data_ret[i].cluster === chosenClustername)
              }//end of for loop
              currentCompleted.push(clustername_completed[chosenClustername[i]]);
              currentFailed.push(clustername_failed[chosenClustername[i]]);
              currentActiveTasks.push(clustername_active_tasks[chosenClustername[i]]);
              console.log(currentFailed);
            }

          };

          var selectizeControl = $selectize[0].selectize;

          selectizeControl.on('change', function () {

            var chosenClustername = selectizeControl.getValue();
            getClusternameData(chosenClustername);
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
            Plotly.newPlot(clusternamesDiv, d_test, layout_clusters);

          });
          // show current values in multi input dropdown ////////////////////////
          // $('select.selectized,input.selectized').each(function () {
          //   console.log("choosen clustername")
          //   var $input = $(this);

          //   var update = function (e) {
          //     var selectedClusters = $input.val();
          //     console.log("type(selectedClusters)")
          //     console.log(type(selectedClusters))
          //     console.log(selectedClusters)
          //     if (selectedClusters) {
          //       var chosenClusters = [];
          //       for (var i = 0; i < selectedClusters.length; i++) {
          //         chosenClusters.push(selectedClusters[i]);
          //       }
          //       updatePlot(chosenClusters)

          //     }

          //     $(this).on('change', update);
          //   }
          // });

          // $('#select-to').selectize({
          //   persist: false,
          //   maxItems: null, //The max number of items the user can select. 1 makes the control mono-selection, null allows an unlimited number of items.	
          //   valueField: 'cluster_name', //The name of the property to use as the value when an item is selected.	
          //   labelField: 'cluster_name', //The name of the property to render as an option / item label (not needed when custom rendering functions are defined).	
          // searchField: ['cluster_name'],
          // options: options_clusters,
          // render: {
          //   item: function (item, escape) {
          //     return '<div>' +
          //       (item.name ? '<span class="name">' + escape(item.name) + '</span>' : '') +
          //       (item.email ? '<span class="email">' + escape(item.email) + '</span>' : '') +
          //       '</div>';
          //   },
          //   option: function (item, escape) {
          //     var label = item.name || item.email;
          //     var caption = item.name ? item.email : null;
          //     return '<div>' +
          //       '<span class="label">' + escape(label) + '</span>' +
          //       (caption ? '<span class="caption">' + escape(caption) + '</span>' : '') +
          //       '</div>';
          //   }
          // },
          // createFilter: function (input) {
          //   var match, regex;

          //   // email@address.com
          //   regex = new RegExp('^' + REGEX_EMAIL + '$', 'i');
          //   match = input.match(regex);
          //   if (match) return !this.options.hasOwnProperty(match[0]);

          //   // name <email@address.com>
          //   regex = new RegExp('^([^<]*)\<' + REGEX_EMAIL + '\>$', 'i');
          //   match = input.match(regex);
          //   if (match) return !this.options.hasOwnProperty(match[2]);

          //   return false;
          // },
          //   create: false
          // });
          ////////////////////////////////////////////////////////////////////////////////////////////////////
          // completed_failures_submitted = Array.prototype.push.apply(completed, failures, submitted)
          // console.log(parsedJson)
          da = [{
            histfunc: "count",
            x: parsedJson,
            type: "histogram",
            name: "Count"
          }
          ]

          var d_active_inactive = [{
            histfunc: "count",
            x: active_inactive,
            type: "histogram",
            name: "Count"
          }
          ]
          var d_clusters_names = [{
            histfunc: "count",
            x: clusters_names,
            type: "histogram",
            name: "Count"
          }
          ]
          var d_completed_failures = [
            {
              histfunc: "count",
              x: clusters_names,
              y: completed,
              type: "bar",
              name: "Completed"
            },
            {
              histfunc: "count",
              x: clusters_names,
              y: failures,
              type: "bar",
              name: "Failed"
            }
          ]
          console.log("d_completed_failures:")
          console.log(d_completed_failures)

          var multiple_data = [
            {
              histfunc: "count",
              x: parsedJson,
              type: "histogram",
              name: "Count",
              visible: true
            },
            {
              histfunc: "count",
              x: active_inactive,
              type: "histogram",
              name: "Count",
              visible: false
            },
            {
              histfunc: "count",
              x: clusters_names,
              type: "histogram",
              name: "Count Per Cluster",
              visible: false
            },

            {
              histfunc: "count",
              x: clusters_names,
              y: completed,
              type: "bar",
              name: "Completed",
              visible: false
            }
            ,
            {
              histfunc: "count",
              x: clusters_names,
              y: failures,
              type: "bar",
              name: "Failed",
              visible: false
            }
          ]

          var updatemenus_2 =
            [
              {
                x: 5,
                y: 100,
                yanchor: 'top',


                buttons:
                  [{
                    method: 'update',
                    args: [{ 'visible': [true, false, false, false, false] },
                    {
                      'title': 'Hostnames',
                      // 'annotations': hostnames_annotations
                    }

                    ],
                    label: 'Hostnames'
                  }, {
                    method: 'update',
                    args: [{ 'visible': [false, true, false, false, false] },
                    {
                      'title': 'Status',
                      // 'annotations': status_annotations
                    }
                    ],
                    label: 'Status'
                  },

                  {
                    method: 'update',
                    args: [{ 'visible': [false, false, true, false, false] },
                    {
                      'title': 'Cluster Per Cluster',
                      // 'annotations': completed_annotations
                    }
                    ],
                    label: 'Count Per Cluster'
                  },


                  {
                    method: 'update',
                    args: [{ 'visible': [false, false, false, true, false] },
                    {
                      'title': 'Completed',
                      // 'annotations': completed_annotations
                    }
                    ],
                    label: 'Completed'
                  },



                  {
                    method: 'update',
                    args: [{ 'visible': [false, false, false, false, true] },
                    {
                      'title': 'Failures',
                      // 'annotations': failures_annotations
                    }
                    ],
                    label: 'Failures'
                  }



                    , {
                    method: 'update',
                    args: [{ 'visible': [false, false, false, true, true] },
                    {
                      'title': 'Completed & Failures',
                      // 'annotations': failures_annotations
                    }
                    ],
                    label: 'Completed & Failures'
                  }
                  ]
              }
            ]

          layout2 = {
            updatemenus: updatemenus_2,
            showlegend: true,
            title: "title",
            // title:'Analytics Histogram of Hostnames (trial_tab_plotly.js)',

            xaxis: {
              // title: 'Hostnames',
              showgrid: true,
              zeroline: false
            },
            yaxis: {
              // title: 'Number of Jobs ',
              showline: false
            }
          }

          // Plotly.newPlot("myDiv", data, layout);
          Plotly.newPlot("myDiv2", multiple_data, layout2);

          //////////////////////////////////////////////////// Selecting ////////////////// 
          lineDiv.on('plotly_selected', function () {
            alert("select4r")
            // var update = { x: [active_inactive] };
            // Plotly.restyle('myDiv3', update);
          });

          lineDiv.on('plotly_click', function (pointSelect) {
            alert(pointSelect)

          });

          //////////////////////////////////////////////////////////////////////////////

          // plot_data(da, lineDiv, "Hostnames")
          // plot_data(d_active_inactive, lineDiv2, "Status")
          // plot_data(d_clusters_names, lineDiv4, "Clusters Names")
          // plot_data(d_completed_failures, lineDiv3, "Completed and Failed")
          // Plotly.newPlot('myDiv3', da, layout2);

        } //end of ajax "success"
      }); //end of ajax call
  // Plotly.plot("myDiv2", clusters_names, layout, {showSendToCloud: true});

  //   }


  // Plotly.plot("myDiv", data, layout, { showSendToCloud: true });


  // var myPlot = document.getElementById('myDiv3');
  // myPlot.on('plotly_click', function (data) {
  //   var update = { x: [active_inactive] };
  //   Plotly.restyle('myDiv3', update);
  // });

}); //end of: $(document).ready
