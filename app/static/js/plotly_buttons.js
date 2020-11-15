
$(document).ready(function () {
  // For the Heatmap graph
  Plotly.d3.csv('https://raw.githubusercontent.com/plotly/datasets/master/api_docs/mt_bruno_elevation.csv', function (err, rows) {
    function unpack(rows, key) {
      return rows.map(function (row) { return row[key]; });
    }
    var z_data = []
    for (i = 0; i < 24; i++) {
      z_data.push(unpack(rows, i));
    }

    var data = [{
      z: z_data,
      type: 'surface',
      colorscale: 'Viridis'
    }]

    var updatemenus = [
      {
        buttons: [
          {
            args: ['type', 'surface'],
            label: '3D Surface',
            method: 'restyle'
          },
          {
            args: ['type', 'heatmap'],
            label: 'Heatmap',
            method: 'restyle' //try having our own method, and call it here
          }
        ],
        direction: 'left',
        pad: { 'r': 10, 't': 10 },
        showactive: true,
        type: 'buttons',
        x: 0.15,
        xanchor: 'left',
        y: 1.1,
        yanchor: 'top'
      }
    ]

    var annotations = [
      {
        text: 'Trace type:',
        x: 0,
        y: 1.06,
        yref: 'paper',
        align: 'left',
        showarrow: false
      }
    ]
    // var annotations_2 = [
    //   {
    //     text: 'Options:',
    //     // x: 0,
    //     // y: 1.06,
    //     yref: 'paper',
    //     align: 'left',
    //     showarrow: false
    //   }
    // ]
    var layout = {
      margin: { t: 0, b: 0, l: 0, r: 0 },
      updatemenus: updatemenus,
      annotations: annotations,
      scene: {
        xaxis: {
          gridcolor: 'rgb(255, 255, 255)',
          zerolinecolor: 'rgb(255, 255, 255)',
          showbackground: true,
          backgroundcolor: 'rgb(230, 230,230)'
        },
        yaxis: {
          gridcolor: 'rgb(255, 255, 255)',
          zerolinecolor: 'rgb(255, 255, 255)',
          showbackground: true,
          backgroundcolor: 'rgb(230, 230, 230)'
        },
        zaxis: {
          gridcolor: 'rgb(255, 255, 255)',
          zerolinecolor: 'rgb(255, 255, 255)',
          showbackground: true,
          backgroundcolor: 'rgb(230, 230,230)'
        },
        aspectratio: { x: 1, y: 1, z: 0.7 },
        aspectmode: 'manual'
      }
    }
    var updatemenus_2 = [
      {
        x:5,
        y: 100,
        yanchor: 'top',
        buttons: [{
          method: 'restyle',
          args: ['visible', [true, false, false, false]], //purpose
          label: 'Hostnames'
        }, {
          method: 'restyle',
          args: ['visible', [false, true, false, false]],
          label: 'Status'
        }, {
          method: 'restyle',
          args: ['visible', [false, false, true, false]],
          label: 'Completed'
        }, {
          method: 'restyle',
          args: ['visible', [false, false, false, true]],
          label: 'Failures'
        }]
      }
    ]



    // buttons: [
    //   {
    //     args: ['type', 'surface'],
    //     label: 'Clusters Names',
    //     method: 'restyle'
    //   },
    //   {
    //     args: ['type', 'heatmap'],
    //     label: 'Status',
    //     method: 'restyle'
    //   }
    // ],
    //   direction: 'left',
    //   pad: { 'r': 10, 't': 10 },
    //   showactive: true,
    //   type: 'buttons',
    //   x: 0.15,
    //   xanchor: 'left',
    //   y: 1.1,
    //   yanchor: 'top'
    // }


    // function plotting_trial_manager_status_multiple(){
    var lineDiv = document.getElementById('myDiv2');

    var data_ret = null;

    var parsedJson = [];
    var active_inactive = [];
    var completed = [];
    var failures = [];
    // var completed_failures_submitted = [];
    // var submitted=[];
    // var completed_failures_submitted = [];
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

            // completed_failures_submitted = Array.prototype.push.apply(completed, failures, submitted)
            console.log(parsedJson)
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

            layout2 = {
              updatemenus: updatemenus_2,
              // annotations: annotations_2,
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
            // Plotly.plot("myDiv2", da, layout2);


            // plot_data(da, lineDiv, "Hostnames")
            // plot_data(d_active_inactive, lineDiv2, "Status")
            // plot_data(d_clusters_names, lineDiv4, "Clusters Names")
            // plot_data(d_completed_failures, lineDiv3, "Completed and Failed")

          }
        });
    // Plotly.plot("myDiv2", clusters_names, layout, {showSendToCloud: true});

    //   }


    Plotly.plot("myDiv", data, layout, { showSendToCloud: true });

    Plotly.newPlot('myDiv3', da, layout2);

    var myPlot = document.getElementById('myDiv3');
    myPlot.on('plotly_click', function (data) {
      var update = { x: [active_inactive] };
      Plotly.restyle('myDiv3', update);
    });

  });
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

  //   // Default Country Data
  //   setBubblePlot('Denmark');

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

  //   var innerContainer = document.querySelector('[data-num="0"'),
  //     plotEl = innerContainer.querySelector('.plot'),
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
  var graphDiv = document.getElementById('myDiv_select');
  var N = 1000;
  var color1 = '#7b3294';
  var color1Light = '#c2a5cf';
  var colorX = '#ffa7b5';
  var colorY = '#fdae61';

  function randomArray() {
    var out = new Array(N);
    for (var i = 0; i < N; i++) {
      out[i] = Math.random();
    }
    return out;
  }
  var x = randomArray();
  var y = randomArray();

  Plotly.newPlot(graphDiv, [{
    type: 'scatter',
    mode: 'markers',
    x: x,
    y: y,
    xaxis: 'x',
    yaxis: 'y',
    name: 'random data',
    marker: { color: color1, size: 10 }
  }, {
    type: 'histogram',
    x: x,
    xaxis: 'x2',
    yaxis: 'y2',
    name: 'x coord dist.',
    marker: { color: colorX }
  }, {
    type: 'histogram',
    x: y,
    xaxis: 'x3',
    yaxis: 'y3',
    name: 'y coord dist.',
    marker: { color: colorY }
  }], {
    title: 'Lasso around the scatter points to see sub-distributions',
    dragmode: 'lasso',
    xaxis: {
      zeroline: false,
    },
    yaxis: {
      domain: [0.55, 1],
    },
    xaxis2: {
      domain: [0, 0.45],
      anchor: 'y2',
    },
    yaxis2: {
      domain: [0, 0.45],
      anchor: 'x2'
    },
    xaxis3: {
      domain: [0.55, 1],
      anchor: 'y3'
    },
    yaxis3: {
      domain: [0, 0.45],
      anchor: 'x3'
    }
  });

  graphDiv.on('plotly_selected', function (eventData) {
    var x = [];
    var y = [];

    var colors = [];
    for (var i = 0; i < N; i++) colors.push(color1Light);

    eventData.points.forEach(function (pt) {
      x.push(pt.x);
      y.push(pt.y);
      colors[pt.pointNumber] = color1;
    });

    Plotly.restyle(graphDiv, {
      x: [x, y],
      xbins: {}
    }, [1, 2]);

    Plotly.restyle(graphDiv, 'marker.color', [colors], [0]);
  });
  /////////////////////////////    End of Selection Example   ///////////////////////////////////////////////////////////////////////////////
})
