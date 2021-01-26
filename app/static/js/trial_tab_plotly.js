
function plotting_trial(){
  var lineDiv = document.getElementById('line-chart');
  var data = null;

  $.ajax({
    url: "views/data",
    async: false, //to wait until data is returned, potential bug
    dataType: 'json',
    error: function(xhr, error){
        alert("error: "+xhr);
    }, 
    success: function (ret) {
        alert("success js"+ret);
        data = [ret];
        console.log("linediv plotting_trial is ")
        console.log(lineDiv) //to use always
        plot_data(data, lineDiv)

      }
    });

}

function plotting_trial_2(){
  var lineDiv = document.getElementById('line-chart2');
  var data = null;

  $.ajax({
    url: "views/QCPortal_data",
    async: false, //to wait until data is returned, potential bug
    dataType: 'json',
    error: function(xhr, error){
        alert("error: "+xhr);
    }, 
    success: function (ret) {
        alert("success retrieval from QCPortal");
        // alert(ret)
        data = ret;
        console.log("linediv is ")
        console.log(lineDiv) //to use always

        //display the returned data as text for now
        var para = document.createElement("p");
        var node = document.createTextNode(ret);
        para.appendChild(node);
        var element = document.getElementById("line-chart2");
        element.appendChild(para);

        //plot_data(data, lineDiv)

      }
    });

}

function plot_data(dataParam, lineDivParam, title)
  {
    var layout = {
      showlegend: true,
      title: title,
      // title:'Analytics Histogram of Hostnames (trial_tab_plotly.js)',

      xaxis: {
        // title: 'Hostnames',
        showgrid: false,
        zeroline: false
      },
      yaxis: {
        // title: 'Number of Jobs ',
        showline: false
      }
    }
    console.log("lineDivParam")
    console.log(lineDivParam)
    console.log("dataParam")
    console.log(dataParam)

    Plotly.plot( lineDivParam, dataParam, layout );
  }//end of plot_data function

////////////////////////////// Managers status related /////////////////

function plotting_trial_manager_status(){
  var lineDiv = document.getElementById('line_chart_manager_status');
  var lineDiv2 = document.getElementById('line_chart_manager_status2');
  var lineDiv3 = document.getElementById('line_chart_manager_status3');
  var lineDiv4 = document.getElementById('line_chart_manager_status4');

  var data = null;

  var parsedJson=[];
  var active_inactive =[];
  var completed = [];
  var failures= [];
  // var submitted=[];
  // var completed_failures_submitted = [];
var clusters_names = [];
  $.ajax
  (
    {
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
        console.log("data.length")
        console.log(data.length)
        console.log("data active")

        
        for(i=0; i<data.length ; i++)
        {
          // if(data[i].status=="ACTIVE")
          parsedJson.push(data[i].hostname)
          active_inactive.push(data[i].status)
          clusters_names.push(data[i].cluster)
          completed.push(data[i].completed)
          failures.push(data[i].failures)
          // submitted.push("Submitted"
        }
        
        // completed_failures_submitted = Array.prototype.push.apply(completed, failures, submitted)
        // console.log(parsedJson)
        var da= [{
          histfunc: "count",
          x: parsedJson,
          type: "histogram",
          name: "Count"
        }
      ]
      
      var d_active_inactive= [{
        histfunc: "count",
        x: active_inactive,
        type: "histogram",
        name: "Count"
      }
    ]
    var d_clusters_names= [{
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
        y:failures,
        type: "bar",
        name: "Failed"
      }
    ]
    // console.log("da:")
    // console.log(da)
      // plot_data(da, lineDiv, "Hostnames")
      // plot_data(d_active_inactive, lineDiv2, "Status")
      // plot_data(d_clusters_names, lineDiv4, "Clusters Names")
      // plot_data(d_completed_failures, lineDiv3, "Completed and Failed")

    }
  });

}
//////////////////////////////////////////////////////////////////////////////////////////
function managers_status_trial(){
  var lineDiv = document.getElementById('line-chart2');
  var data = null;

  $.ajax({
    url: "views/managers_status2",
    async: false, //to wait until data is returned, potential bug
    dataType: 'json',
    error: function(xhr, error){
        alert("error managers: "+xhr);
    }, 
    success: function (ret) {
        alert("success retrieval from managers");
        // alert(ret)
        data = ret;
        console.log("linediv is ")
        console.log(lineDiv) //to use always

        //display the returned data as text for now
        var para = document.createElement("p");
        var node = document.createTextNode(ret);
        para.appendChild(node);
        var element = document.getElementById("line-chart2");
        element.appendChild(para);

        //plot_data(data, lineDiv)

      }
    });

}
$(document).ready(function(){
  // plotting_trial()
  plotting_trial_manager_status()
  // managers_status_trial()
  // plotting_trial_2() //QCPORTAL
})
