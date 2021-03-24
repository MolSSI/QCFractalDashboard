/* global Chart */

/**
 * --------------------------------------------------------------------------
 * CoreUI Free Boostrap Admin Template (v2.0.0-beta.2): main.js
 * Licensed under MIT (https://coreui.io/license)
 * --------------------------------------------------------------------------
 */

/* eslint-disable no-magic-numbers */
var ChartsView = function ($) {
  // random Numbers
  var random = function random() {
    return Math.round(Math.random() * 100);
  }; // eslint-disable-next-line no-unused-vars


  var lineChart = new Chart($('#canvas-1'), {
    type: 'line',
    data: {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [{
        label: 'My First dataset',
        backgroundColor: 'rgba(220, 220, 220, 0.2)',
        borderColor: 'rgba(220, 220, 220, 1)',
        pointBackgroundColor: 'rgba(220, 220, 220, 1)',
        pointBorderColor: '#fff',
        data: [random(), random(), random(), random(), random(), random(), random()]
      }, {
        label: 'My Second dataset',
        backgroundColor: 'rgba(151, 187, 205, 0.2)',
        borderColor: 'rgba(151, 187, 205, 1)',
        pointBackgroundColor: 'rgba(151, 187, 205, 1)',
        pointBorderColor: '#fff',
        data: [random(), random(), random(), random(), random(), random(), random()]
      }]
    },
    options: {
      responsive: true
    }
  }); // eslint-disable-next-line no-unused-vars

  var barChart = new Chart($('#canvas-2'), {
    type: 'bar',
    data: {
      labels: ['lal', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: 
      [
        {
        backgroundColor: 'rgba(220, 220, 220, 0.5)',
        borderColor: 'rgba(220, 220, 220, 0.8)',
        highlightFill: 'rgba(220, 220, 220, 0.75)',
        highlightStroke: 'rgba(220, 220, 220, 1)',
        data: [random(), random(), random(), random(), random(), random(), random()]
        }
        , 
      {
        backgroundColor: 'rgba(151, 187, 205, 0.5)',
        borderColor: 'rgba(151, 187, 205, 0.8)',
        highlightFill: 'rgba(151, 187, 205, 0.75)',
        highlightStroke: 'rgba(151, 187, 205, 1)',
        data: [random(), random(), random(), random(), random(), random(), random()]
      }
      ] 
    },
    options: {
      scales: {
        xAxes: [{
          display: false,
          barPercentage: 1.3,
          ticks: {
              max: 3,
          }
       }, {
          display: true,
          ticks: {
              autoSkip: false,
              max: 4,
          }
        }],
        yAxes: [{
          ticks: {
            beginAtZero:true
          }
        }]
      },
      responsive: true
    }
    // options: {
    //   responsive: true
    // }
  }); // eslint-disable-next-line no-unused-vars
  // ##################################################################################################################
  function plotting_trial_manager_status(){
    var lineDiv = document.getElementById('line_chart_manager_status');
    var data = null;
    var parsedJson=[];
    $.ajax({
      url: "/views/managers_status_tab",
      async: false, //to wait until data is returned, potential bug
      dataType: 'json',
      error: function(xhr, error){
          alert("error /views/managers_status_tab: "+xhr);
      }, 
      success: function (ret) {
          // alert("success /views/managers_status_tab: "+ret);
          data = ret;
          
          console.log("linediv managers_status is ")
          console.log(lineDiv) //to use always
          console.log(data)
          console.log("data active")
          for(i=0; i<data.length ; i++)
          {
            if(data[i].status=="ACTIVE")
              parsedJson.push(data[i].hostname)
          }
          console.log(parsedJson)
          var da= [{
            histfunc: "count",
            x: parsedJson,
            type: "histogram",
            name: "count"
          }
        ]
          plot_data(da, lineDiv)
        }
      });
  
  }
// ##################################################################################################################

  var doughnutChart = new Chart($('#canvas-3'), {
    type: 'doughnut',
    data: {
      labels: ['Red', 'Green', 'Yellow'],
      datasets: [{
        data: [300, 50, 100],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
      }]
    },
    options: {
      responsive: true
    }
  }); // eslint-disable-next-line no-unused-vars

  var radarChart = new Chart($('#canvas-4'), {
    type: 'radar',
    data: {
      labels: ['Eating', 'Drinking', 'Sleeping', 'Designing', 'Coding', 'Cycling', 'Running'],
      datasets: [{
        label: 'My First dataset',
        backgroundColor: 'rgba(220, 220, 220, 0.2)',
        borderColor: 'rgba(220, 220, 220, 1)',
        pointBackgroundColor: 'rgba(220, 220, 220, 1)',
        pointBorderColor: '#fff',
        pointHighlightFill: '#fff',
        pointHighlightStroke: 'rgba(220, 220, 220, 1)',
        data: [65, 59, 90, 81, 56, 55, 40]
      }, {
        label: 'My Second dataset',
        backgroundColor: 'rgba(151, 187, 205, 0.2)',
        borderColor: 'rgba(151, 187, 205, 1)',
        pointBackgroundColor: 'rgba(151, 187, 205, 1)',
        pointBorderColor: '#fff',
        pointHighlightFill: '#fff',
        pointHighlightStroke: 'rgba(151, 187, 205, 1)',
        data: [28, 48, 40, 19, 96, 27, 100]
      }]
    },
    options: {
      responsive: true
    }
  }); // eslint-disable-next-line no-unused-vars

  var pieChart = new Chart($('#canvas-5'), {
    type: 'pie',
    data: {
      labels: ['Red', 'Green', 'Yellow'],
      datasets: [{
        data: [300, 50, 100],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
      }]
    },
    options: {
      responsive: true
    }
  }); // eslint-disable-next-line no-unused-vars

  var polarAreaChart = new Chart($('#canvas-6'), {
    type: 'polarArea',
    data: {
      labels: ['Red', 'Green', 'Yellow', 'Grey', 'Blue'],
      datasets: [{
        data: [11, 16, 7, 3, 14],
        backgroundColor: ['#FF6384', '#4BC0C0', '#FFCE56', '#E7E9ED', '#36A2EB']
      }]
    },
    options: {
      responsive: true
    }
  });
  return ChartsView;
}($);
//# sourceMappingURL=charts.js.map


// Eman - trials
var barChart_managers = new Chart($('#canvas-7'), {
  type: 'bar',
  data: {
    labels: ['Lala', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [{
      backgroundColor: 'rgba(220, 220, 220, 0.5)',
      borderColor: 'rgba(220, 220, 220, 0.8)',
      highlightFill: 'rgba(220, 220, 220, 0.75)',
      highlightStroke: 'rgba(220, 220, 220, 1)',
      data: [random(), random(), random(), random(), random(), random(), random()]
    }, {
      backgroundColor: 'rgba(151, 187, 205, 0.5)',
      borderColor: 'rgba(151, 187, 205, 0.8)',
      highlightFill: 'rgba(151, 187, 205, 0.75)',
      highlightStroke: 'rgba(151, 187, 205, 1)',
      data: [random(), random(), random(), random(), random(), random(), random()]
    }]
  },
  options: {
    responsive: true
  }
}); // eslint-disable-next-line no-unused-vars
