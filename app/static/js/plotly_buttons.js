
$(document).ready(function () {
  // $('#hostnamesdata').multiselect();

  var lineDiv = document.getElementById('myDiv2');

  var data_ret = null;

  var parsedJson = [];
  var active_inactive = [];
  var completed = [];
  var failures = [];
  var clusters_names = [];
  var da;
  var layout2;
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
            // submitted.push("Submitted"
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

              height: 400,
              width: 480
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
            clustername_active_tasks={};

            for (var i = 0; i < data_ret.length; i++) {
              if (data_ret[i].cluster === chosenClustername) {
                console.log("data_ret[i]");
                console.log(data_ret[i]);
                if (clustername_completed[chosenClustername] != null) {
                  clustername_completed[chosenClustername] = clustername_completed[chosenClustername] + data_ret[i].completed;
                  clustername_failed[chosenClustername] = clustername_failed[chosenClustername] + data_ret[i].failures;
                  clustername_active_tasks[chosenClustername]=clustername_active_tasks[chosenClustername] +data_ret[i].active_tasks;
                }
                else {
                  clustername_completed[chosenClustername] = data_ret[i].completed;
                  clustername_failed[chosenClustername] = data_ret[i].failures;
                  clustername_active_tasks[chosenClustername]= data_ret[i].active_tasks;
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

              height: 400,
              width: 480
            };
            var layout_active_tasks = {
              title: 'Active Tasks Plot of Selected Clusternames',

              height: 300,
              width: 480
            };

            Plotly.newPlot('clusternamesDiv', d_completed_failures, layout);
            Plotly.newPlot('clusternamesDiv_active_tasks', d_active_tasks, layout_active_tasks);
            
          };

          var innerContainer = document.querySelector('[data-num="2"'),
            clusternameSelector = innerContainer.querySelector('.clusternamesdata');

          function updateClustername() {
            setBubblePlot_clusters(clusternameSelector.value);
          }

          clusternameSelector.addEventListener('change', updateClustername, false);


          ////////////////////////////////////////////////// End of Clusternames dropdown ////////////////////////////////////////////////////////////////
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

            // console.log(eventData.points)
            // var x = [];
            // var y = [];

            // var colors = [];
            // for(var i = 0; i < N; i++) colors.push(color1Light);

            // console.log(eventData.points)

            // eventData.points.forEach(function(pt) {
            //   x.push(pt.x);
            //   y.push(pt.y);
            //   colors[pt.pointNumber] = color1;
            // });

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
//////////////////////////////////////// Countries GDP example /////////////////////////////////////////////////////////////////////////////////////////////////
// Plotly.d3.csv('https://raw.githubusercontent.com/plotly/datasets/master/gapminderDataFiveYear.csv', function (err, rows) {

//   function unpack(rows, key) {
//     return rows.map(function (row) { return row[key]; });
//   }

//   var allCountryNames = unpack(rows, 'country'),
//     allYear = unpack(rows, 'year'),
//     allGdp = unpack(rows, 'gdpPercap'),
//     listofCountries = [],
//     currentCountry,
//     currentGdp = [],
//     currentYear = [];

//   for (var i = 0; i < allCountryNames.length; i++) {
//     if (listofCountries.indexOf(allCountryNames[i]) === -1) {
//       listofCountries.push(allCountryNames[i]);
//     }
//   }

//   function getCountryData(chosenCountry) {
//     currentGdp = [];
//     currentYear = [];
//     for (var i = 0; i < allCountryNames.length; i++) {
//       if (allCountryNames[i] === chosenCountry) {
//         currentGdp.push(allGdp[i]);
//         currentYear.push(allYear[i]);
//       }
//     }
//   };

//   setBubblePlot('Afghanistan');

//   function setBubblePlot(chosenCountry) {
//     getCountryData(chosenCountry);

//     var trace1 = {
//       x: currentYear,
//       y: currentGdp,
//       mode: 'lines+markers',
//       marker: {
//         size: 12,
//         opacity: 0.5
//       }
//     };

//     var data = [trace1];

//     var layout = {
//       title: 'Line and Scatter Plot',
//       height: 400,
//       width: 480
//     };

//     Plotly.newPlot('countryDiv', data, layout);
//   };

//   var innerContainer = document.querySelector('[data-num="1"'),
//     // plotEl = innerContainer.querySelector('.plot'),
//     countrySelector = innerContainer.querySelector('.countrydata');

//   function assignOptions(textArray, selector) {
//     for (var i = 0; i < textArray.length; i++) {
//       var currentOption = document.createElement('option');
//       currentOption.text = textArray[i];
//       selector.appendChild(currentOption);
//     }
//   }

//   assignOptions(listofCountries, countrySelector);

//   function updateCountry() {
//     setBubblePlot(countrySelector.value);
//   }

//   countrySelector.addEventListener('change', updateCountry, false);
// });
//////////////////////////////////    End of Countries Example   ///////////////////////////////////////////////////////////////////////////////



  //////////////////////////////////// Select example /////////////////////////////////////////////////////
  // var graphDiv = document.getElementById('myDiv_select');
  // var N = 1000;
  // var color1 = '#7b3294';
  // var color1Light = '#c2a5cf';
  // var colorX = '#ffa7b5';
  // var colorY = '#fdae61';

  // function randomArray() {
  //   var out = new Array(N);
  //   for (var i = 0; i < N; i++) {
  //     out[i] = Math.random();
  //   }
  //   return out;
  // }
  // var x = randomArray();
  // var y = randomArray();

  // Plotly.newPlot(graphDiv, [{
  //   type: 'scatter',
  //   mode: 'markers',
  //   x: x,
  //   y: y,
  //   xaxis: 'x',
  //   yaxis: 'y',
  //   name: 'random data',
  //   marker: { color: color1, size: 10 }
  // }, {
  //   type: 'histogram',
  //   x: x,
  //   xaxis: 'x2',
  //   yaxis: 'y2',
  //   name: 'x coord dist.',
  //   marker: { color: colorX }
  // }, {
  //   type: 'histogram',
  //   x: y,
  //   xaxis: 'x3',
  //   yaxis: 'y3',
  //   name: 'y coord dist.',
  //   marker: { color: colorY }
  // }], {
  //   title: 'Lasso around the scatter points to see sub-distributions',
  //   dragmode: 'lasso',
  //   xaxis: {
  //     zeroline: false,
  //   },
  //   yaxis: {
  //     domain: [0.55, 1],
  //   },
  //   xaxis2: {
  //     domain: [0, 0.45],
  //     anchor: 'y2',
  //   },
  //   yaxis2: {
  //     domain: [0, 0.45],
  //     anchor: 'x2'
  //   },
  //   xaxis3: {
  //     domain: [0.55, 1],
  //     anchor: 'y3'
  //   },
  //   yaxis3: {
  //     domain: [0, 0.45],
  //     anchor: 'x3'
  //   }
  // });

  // graphDiv.on('plotly_selected', function (eventData) {
  //   var x = [];
  //   var y = [];

  //   var colors = [];
  //   for (var i = 0; i < N; i++) colors.push(color1Light);

  //   eventData.points.forEach(function (pt) {
  //     x.push(pt.x);
  //     y.push(pt.y);
  //     colors[pt.pointNumber] = color1;
  //   });

  //   Plotly.restyle(graphDiv, {
  //     x: [x, y],
  //     xbins: {}
  //   }, [1, 2]);

  //   Plotly.restyle(graphDiv, 'marker.color', [colors], [0]);
  // });
  /////////////////////////////    End of Selection Example   ///////////////////////////////////////////////////////////////////////////////
// })
// Plotly.d3.csv('https://raw.githubusercontent.com/plotly/datasets/master/finance-charts-apple.csv', function (err, rows) {
//   function unpack(rows, key) {
//     return rows.map(function (row) { return row[key]; });
//   }

//   const arrAvg = arr => arr.reduce((a, b) => a + b, 0) / arr.length

//   var button_layer_2_height = 1.2
//   var high = unpack(rows, 'AAPL.High').map(x => parseFloat(x))
//   var low = unpack(rows, 'AAPL.Low').map(x => parseFloat(x))
//   var date = unpack(rows, 'Date')


//   var high_ave = arrAvg(high)
//   var high_max = Math.max(...high)
//   var low_ave = arrAvg(low)
//   var low_min = Math.min(...low)

//   var data = [{
//     x: date,
//     y: high,
//     mode: 'lines',
//     name: 'High',
//     marker: { color: '#33CFA5' }
//   },
//   {
//     x: date,
//     y: date.map(a => high_ave),
//     mode: 'lines',
//     name: 'Low Average',
//     line: { color: '#33CFA5', dash: 'dash' },
//     visible: false
//   },
//   {
//     x: date,
//     y: low,
//     name: 'Low',
//     mode: 'lines',
//     marker: { color: '#F06A6A' }
//   },
//   {
//     x: date,
//     y: date.map(a => low_ave),
//     mode: 'lines',
//     name: 'High Average',
//     visible: false,
//     line: { color: '#F06A6A', dash: 'dash' }
//   },

//   ]

//   var high_annotations = [
//     {
//       text: 'High Average:<br>' + high_ave.toFixed(2),
//       x: '2016-03-01',
//       y: high_ave,
//       yref: 'y', xref: 'x',
//       ay: -40, ax: 0
//     },
//     {
//       text: 'High Max:<br>' + high_max.toFixed(2),
//       x: date[high.indexOf(high_max)],
//       y: high_max,
//       yref: 'y', xref: 'x',
//       ay: -40, ax: 0
//     },
//   ]

//   var low_annotations = [{
//     text: 'Low Average:<br>' + low_ave.toFixed(2),
//     x: '2015-05-01',
//     y: low_ave,
//     yref: 'y', xref: 'x',
//     ay: 40, ax: 0
//   },
//   {
//     text: 'Low Min:<br>' + low_min.toFixed(2),
//     x: date[low.indexOf(low_min)],
//     y: low_min,
//     yref: 'y', xref: 'x',
//     ay: 40, ax: 0
//   }
//   ]

//   var updatemenus = [
//     {
//       buttons: [
//         {
//           args: [{ 'visible': [true, false, false, false] },
//           {
//             'title': 'Yahoo High',
//             'annotations': high_annotations
//           }],
//           label: 'High',
//           method: 'update'
//         },
//         {
//           args: [{ 'visible': [false, false, true, true,] },
//           {
//             'title': 'Yahoo Low',
//             'annotations': low_annotations
//           }],
//           label: 'Low',
//           method: 'update'
//         },
//         {
//           args: [{ 'visible': [true, true, true, true,] },
//           {
//             'title': 'Yahoo',
//             'annotations': [...low_annotations, ...high_annotations]
//           }],
//           label: 'Both',
//           method: 'update'
//         },
//         {
//           args: [{ 'visible': [true, false, true, false,] },
//           {
//             'title': 'Yahoo',
//             'annotations': []
//           }],
//           label: 'Reset',
//           method: 'update'
//         },

//       ],
//       direction: 'left',
//       pad: { 'r': 10, 't': 10 },
//       showactive: true,
//       type: 'buttons',
//       x: 0.1,
//       xanchor: 'left',
//       y: button_layer_2_height,
//       yanchor: 'top'
//     },

//   ]

//   var layout = {
//     title: 'Yahoo',
//     updatemenus: updatemenus,
//     showlegend: false
//   }

