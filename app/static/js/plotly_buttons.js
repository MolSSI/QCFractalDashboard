
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
          data_ret = ret;
          var dateSet = new Set()

          var hostnamesDict = {}
          for (var i = 0; i < data_ret.length; i++) {
            hostnames.push(data_ret[i].hostname)

            //to group the list of hostnames by clustername
            // hostname_clustername_json.hostname = data_ret[i].hostname
            // hostname_clustername_json.clustername = data_ret[i].cluster


            // example of the modified_on field: 2019-07-04T22:36:28.618504
            modified_on_year = data_ret[i].modified_on.substring(0, 4);
            modified_on_month = data_ret[i].modified_on.substring(5, 7);
            modified_on_day = data_ret[i].modified_on.substring(8, 10);

            var concatString = String(modified_on_year) + "," + String(modified_on_month)
            // console.log("concatString")
            // console.log(concatString)
            modified_on_date = new Date(concatString);

            // console.log("modified_on_date = new Date(concatString) ")
            // console.log(modified_on_date)

            Date.shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            function short_months(dt) {
              var d = Date.shortMonths[dt.getMonth()]
              return d;
            }

            if (!dateSet.has(concatString)) {

              dateSet.add(concatString)
            }


            function map_month(modified_on_month) {
              var modified_on_month_string

              switch (modified_on_month) {
                case '01' || 01:
                  modified_on_month_string = 'January';
                  break;
                case '02' || 02:
                  modified_on_month_string = 'February';
                  break;
                case '03' || 03:
                  modified_on_month_string = 'March';
                  break;
                case '04' || 04:
                  modified_on_month_string = 'April';
                  break;
                case '05' || 05:
                  modified_on_month_string = 'May';
                  break;
                case '06' || 06:
                  modified_on_month_string = 'June';
                  break;
                case '07' || 07:
                  modified_on_month_string = 'July';
                  break;
                case '08' || 08:
                  modified_on_month_string = 'August';
                  break;
                case '09' || 09:
                  modified_on_month_string = 'September';
                  break;
                case '10' || 10:
                  modified_on_month_string = 'October';
                  break;
                case '11' || 11:
                  modified_on_month_string = 'November';
                  break;
                case '12' || 12:
                  modified_on_month_string = 'December';
                  break;
                default:
                  modified_on_month_string = "hmmm"

              }
              return modified_on_month_string

            }
            function map_monthToInt(modified_on_monthString) {
              var modified_on_month_int;

              switch (modified_on_monthString) {
                case 'January':
                  modified_on_month_int = '01';
                  break;
                case 'February':
                  modified_on_month_int = '02';
                  break;
                case 'March':
                  modified_on_month_int = '03';
                  break;
                case 'April':
                  modified_on_month_int = '04';
                  break;
                case 'May':
                  modified_on_month_int = '05';
                  break;
                case 'June':
                  modified_on_month_int = '06';
                  break;
                case 'July':
                  modified_on_month_int = '07';
                  break;
                case 'August':
                  modified_on_month_int = '08';
                  break;
                case 'September':
                  modified_on_month_int = '09';
                  break;
                case 'October':
                  modified_on_month_int = '10';
                  break;
                case 'November':
                  modified_on_month_int = '11';
                  break;
                case 'December':
                  modified_on_month_int = '12';
                  break;
                default:
                  modified_on_month_int = '00';

              }
              return modified_on_month_int

            }
            hostname_clustername_json = {
              "hostname": data_ret[i].hostname, "clustername": data_ret[i].cluster,
              "modified_on_date": modified_on_date,
              "modified_on_year": modified_on_year, "modified_on_month": modified_on_month,
              "modified_day": modified_on_day
            }
            // console.log("hostname_clustername_json")
            // console.log(hostname_clustername_json)

            // hostname_modiefied_on_date_json = { "hostname": data_ret[i].hostname, 
            // "modified_on_year": data_ret[i].modified_on_year, "modified_on_month": modified_on_month,
            // "modified_day":modified_day }

            hostnamesDict[data_ret[i].hostname] = {
              "clustername": data_ret[i].cluster,
              "modified_on_date": modified_on_date,
              "modified_on_year": modified_on_year, "modified_on_month": modified_on_month,
              "modified_day": modified_on_day
            }

            if (hostname_clustername_json_array.includes(hostname_clustername_json) == false) {
              hostname_clustername_json_array.push(hostname_clustername_json)
            }
            // console.log("hostname_clustername_json_array before sorting")
            // console.log(hostname_clustername_json_array)
            hostname_clustername_json_array.sort((a, b) => b.date - a.date)
            // console.log("hostname_clustername_json_array after sorting")
            // console.log(hostname_clustername_json_array)


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
              // console.log("dict_clusters_active_tasks")
              // console.log(dict_clusters_active_tasks)
            }

            // console.log("hostname_clustername_json_array.length:")
            // console.log(hostname_clustername_json_array.length)
          }//end of for loop



          // console.log("hostname_clustername_json_array.length: out of the loop")
          // console.log(hostname_clustername_json_array.length)
          console.log("hostnamesDict")
          console.log(hostnamesDict)

          size_dict_clusters_active_tasks = Object.keys(dict_clusters_active_tasks).length
          ////////////////////////////////////// hostnames dropdown, the way countries example was made////////////////////////////////////////////////////////////////////////
          var select = document.getElementById("hostnamesdata");
          // var options = [...new Set(hostnames)]; //changed this to cluster names to compare
          // var options = [...new Set(hostname_clustername_json_array)];
          // options = options.sort(function (a, b) {
          //   return a.toLowerCase().localeCompare(b.toLowerCase());
          // });


          var default_selected_hostnames_3 = []
          //Populate dropdown of hostnames available 
          for (var i = 0; i < hostname_clustername_json_array.length; i++) {
            var opt = hostname_clustername_json_array[i].hostname;
            if (default_selected_hostnames_3.length < 3) {
              if (default_selected_hostnames_3.includes(opt) == false) {
                default_selected_hostnames_3.push(opt);
              }

            }
            var el = document.createElement("option");
            el.textContent = opt;
            el.value = opt;
            select.appendChild(el);
          }// End of for loop that populates the dropdown of hostnames available

          var optgroup_array = []
          var slider_steps = []
          var slider_step_object;

          function calculateSteps(dateSetParam) {
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


          for (var i = 0; i < hostname_clustername_json_array.length; i++) {
            var json_obj = { value: hostname_clustername_json_array[i].clustername, label: hostname_clustername_json_array[i].clustername }
            optgroup_array.push(json_obj)
          }//end of for loop

          // initialize selectize 
          var $selectize_hostname = $('.hostnamesdata').selectize({
            options: hostname_clustername_json_array, //An array of the initial options available to select; array of objects. 
            plugins: ["remove_button"],
            maxItems: null,
            optgroupField: "clustername",
            optgroups: optgroup_array,
            // optgroups: [],
            render: {
              optgroup_header: function (data, escape) {
                return '<div class="optgroup-header">' + escape(data.label) + '</div>';
              }

            },

            items: default_selected_hostnames_3 //An array of the initial selected values
          });

          var hostnamesDiv = document.getElementById("hostnamesDiv");

          var layout_hostnames = {
            title: 'Task Status for Selected Hosts',
            yaxis:
            {
              rangemode: 'tozero'
            }
            ,
            sliders: [{
              automargin: true,
              currentvalue: {
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

          var te = layout_hostnames.sliders[0]
          var initialSelection = te.steps[0].label
          // console.log(te.steps[0].label)
          var sl = layout_hostnames.sliders[0].active




          var globalReturnedObject;
          function getHostnameData(chosenHostname, plottingDiv) {
            var hoverData = [];
            console.log("chosenHostname to get their data (getHostnameData)")
            console.log(chosenHostname)

            currentCompleted_hostname = {};
            currentFailed_hostname = {};
            var filteredList = filterAccordingToSlider(chosenHostname, layout_hostnames)
            console.log("filteredList to get their data (getHostnameData)")
            console.log(filteredList)

            for (var i = 0; i < filteredList.length; i++) {
              // if (!hostnamesDict[chosenHostname[i]].modified_on_date < stepLabelDate) {
              currentFailed_hostname[filteredList[i]] = dict_hostname_failed[filteredList[i]]
              currentCompleted_hostname[filteredList[i]] = dict_hostname_completed[filteredList[i]]
              hoverData.push("Modified on: " + map_month(hostnamesDict[filteredList[i]].modified_on_month) + " " + hostnamesDict[filteredList[i]].modified_on_year)
              console.log(currentCompleted_hostname)
              console.log("hostnamesDict[chosenHostname[i]].modified_on_month")
              console.log(filteredList[i])
              console.log(hostnamesDict[filteredList[i]].modified_on_month)
              // }//end of if condition
            }//end of for loop
            console.log("currentCompleted_hostname after for loop")
            console.log(currentCompleted_hostname)
            // var d_test = [
            //   {
            //     // histfunc: "count",
            //     x: Object.keys(currentCompleted_hostname),
            //     y: Object.values(currentCompleted_hostname),
            //     type: "bar",
            //     name: "Completed",
            //     text: hoverData
            //   },
            //   {
            //     // histfunc: "count",
            //     x: Object.keys(currentFailed_hostname),
            //     y: Object.values(currentFailed_hostname),
            //     type: "bar",
            //     name: "Failed",
            //     text: hoverData
            //   }
            // ]
            // var returnedObject
            var toReturn = [{currentCompleted_hostname}, {currentFailed_hostname}]
            console.log("toReturn[0] in get hostnameData function")
            console.log(Object.keys(toReturn[0].currentCompleted_hostname))
            console.log(toReturn[1])



            var returnedObject = {
              'currentCompleted_hostname': currentCompleted_hostname,
              'currentFailed_hostname': currentFailed_hostname
            }
            globalReturnedObject = returnedObject
            console.log("globalReturnedObject in get hostnameData")
            console.log(globalReturnedObject)


            // Plotly.react(plottingDiv, d_test, layout_hostnames)
            // console.log(currentCompleted_hostname)
            // // if (defaultSliderSelection) {
            // // sliderChangeReflect(returnedObject, chosenHostname, plottingDiv)
            // sliderChangeReflect(globalReturnedObject, d_test, chosenHostname, plottingDiv)

            // }
            return toReturn;
          }; //end of getHostnamesData function
          // sliderChangeReflect(dataToPlot, tempVar, hostnamesDiv, layout_hostnames)

          function sliderChangeReflect( dataReturnedParam, chosenHostname, plottingDiv, layout ) {
            $(this).on('plotly_sliderchange', function (e) {
              console.log("===============================================")
              var dataReturned = getHostnameData(chosenHostname,plottingDiv)

            

              // var hoverData = d_testParam[0].text;
              // console.log("hoverData initially")
              // console.log(hoverData)

              // var stepLabel = getActiveSliderStep(layout)

              // // dataToPlotParam[0].x
              // var tempVariableCompleted = globalReturnedObject['currentCompleted_hostname']
              // var tempVariableFailed = globalReturnedObject['currentFailed_hostname']

              // var d_test = d_testParam;
              // console.log("d_testParam")
              // console.log(d_testParam)

              // getHostnameData(chosenHostname)
              // for (var i = 0; i < chosenHostname.length; i++) {
              //   //if this element has modified_on_month that is > the selected slider value, remove it from chosen hostnames
              //   var stepLabelDate = new Date(stepLabel)
              //   console.log("hostnamesDict[chosenHostname[i]].modified_on_date")
              //   console.log(hostnamesDict[chosenHostname[i]].modified_on_date)
              //   console.log(chosenHostname[i])


              //   if (hostnamesDict[chosenHostname[i]].modified_on_date < stepLabelDate) {
              //     console.log(String(chosenHostname[i]) + " has modified on month before the selected month, so excluding it")
              //     console.log(globalReturnedObject)

              //     // hoverData.delete("Modified on: " + map_month(hostnamesDict[chosenHostname[i]].modified_on_month) + " " + hostnamesDict[chosenHostname[i]].modified_on_year)
              //     // hoverData.splice(0, 1);
              //     // hoverData = d_testParam[0].text.splice(i, 1);
              //     // console.log("hoverData after exluding an element")
              //     // console.log(hoverData)
              //     delete tempVariableFailed[chosenHostname[i]]
              //     delete tempVariableCompleted[chosenHostname[i]]

              //     var d_test = [
              //       {
              //         histfunc: "count",
              //         x: Object.keys(tempVariableCompleted),
              //         y: Object.values(tempVariableCompleted),
              //         type: "bar",
              //         name: "Completed",
              //         // text: hoverData
              //       },
              //       {
              //         histfunc: "count",
              //         x: Object.keys(tempVariableFailed),
              //         y: Object.values(tempVariableFailed),
              //         type: "bar",
              //         name: "Failed",
              //         // text: hoverData
              //       }
              //     ]
              //   } //end of if condition

              // }//end of for loop

              console.log("d_test  in sliderreflectchange")
              // console.log(d_test)          
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
              // Plotly.react(hostnamesDiv, dataToPlot, layout_hostnames)

              Plotly.react(plottingDiv, dataToPlot, layout_hostnames)
            })// end of plottingDiv.on('plotly_sliderchange'...
          }

          var selectizeControl_hostname = $selectize_hostname[0].selectize;
          var tempVar = selectizeControl_hostname.getValue()
          // getHostnameData(selectizeControl_hostname.getValue(), hostnamesDiv, initialSelection);
          // var plotlyLineDiv = $("#plotlyLineDiv")[0]
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
         
          sliderChangeReflect(dataReturned, tempVar, hostnamesDiv, layout_hostnames)

          // var dataToPlot = getHostnameData(tempVar, hostnamesDiv);
          // Plotly.newPlot(hostnamesDiv, dataToPlot, layout_hostnames) //first plot

          function getActiveSliderStep(layout) {

            var stepLabelIndex = layout.sliders[0].active
            if (stepLabelIndex == undefined) {
              stepLabelIndex = 0
            }

            var stepVar = layout.sliders[0].steps[stepLabelIndex]
            // console.log("stepVar")
            // console.log(stepVar)

            var stepLabel = stepVar.label
            console.log("stepLabel in getActiveSliderStep")
            console.log(stepLabel)
            // var stepLabel = layout.label

            return stepLabel
          }
          function filterAccordingToSlider(chosenHostnamedList, layout) {
            var activeSliderStepVar = getActiveSliderStep(layout)
            console.log("actiVeSliderStepVar in filterAccordingToSlider")
            console.log(activeSliderStepVar)

            // console.log("stepLabelDate in filterAccordingToSlider function")
            var stepLabelDate = new Date(activeSliderStepVar)
            // console.log(stepLabelDate)

            // console.log("layout.sliders[0].steps[0]")
            // console.log(layout.sliders[0].steps[0].label)


            if (activeSliderStepVar == layout.sliders[0].steps[0].label) {
              var filteredHostnamesList = chosenHostnamedList
            }
            else {
              var filteredHostnamesList = []
              for (var i = 0; i < chosenHostnamedList.length; i++) {
                console.log("chosenHostnamedList[i] in filterAccordingToSlider")
                console.log(chosenHostnamedList[i])
                console.log("hostnamesDict[chosenHostnamedList[i]].modified_on_date")
                console.log(hostnamesDict[chosenHostnamedList[i]].modified_on_date)
                //if this element has modified_on_month that is > the selected slider value, remove it from chosen hostnames
                if (hostnamesDict[chosenHostnamedList[i]].modified_on_date >= stepLabelDate) {
                  console.log(String(chosenHostnamedList[i]) + " has modified_on month after the selected month, so including it")
                  // delete filteredHostnamesList[chosenHostnamedList[i]]
                  filteredHostnamesList.push(chosenHostnamedList[i])
                }
              }

            }
            console.log("filteredHostnamesList in filterAccordingToSlider")
            console.log(filteredHostnamesList)

            return filteredHostnamesList
          }//end of filterAccordingToSlider function

          selectizeControl_hostname.on('change', function () {
            var chosenhostname = selectizeControl_hostname.getValue();
            // console.log("layout_hostnames when selecting new elements")
            // console.log(layout_hostnames)
            // var filteredHostnames = filterAccordingToSlider(chosenhostname, layout_hostnames)
            //Plot only if the selected element meets filtering criteria (its data is > selected date)
            // if (filteredHostnames.length > 0) {
            // var dataToPlot = getHostnameData(filteredHostnames, hostnamesDiv);
            // globalReturnedObject= getHostnameData(filteredHostnames, hostnamesDiv);
            // console.log("globalReturnedObject selectize ============================")
            // console.log(globalReturnedObject)
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
            sliderChangeReflect(dataToPlot, chosenhostname, hostnamesDiv, layout_hostnames)

            //newPlot or react? need to double check
            // Plotly.newPlot(hostnamesDiv, dataToPlot, layout_hostnames)
            // }
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