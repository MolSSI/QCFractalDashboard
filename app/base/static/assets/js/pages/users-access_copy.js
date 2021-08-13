$(function ($) {

  $('#datatables_wrapper').LoadingOverlay("show", {
    text: 'Loading Users Access Data'
  });

  var columns = [
    { title: "ID", data: "id", "width": "70px" },
    { title: "User", data: 'user', "width": "70px" },
    {
      title: "Request Duration (ms)", data: "request_duration", render: function (data, type, row) {
        return Number((data * 1000).toFixed(1));
      }
    },
    { title: "Access Type", data: "access_type" },
    {
      title: "Access Date", data: "access_date", render: function (data, type, row) {
        datetime = new Date(data);
        day = datetime.getDate();
        month = datetime.getMonth() + 1; //month: 0-11
        year = datetime.getFullYear();
        date = year + "-" + day + "-" + month;
        hours = datetime.getHours();
        minutes = datetime.getMinutes();
        seconds = datetime.getSeconds();
        time = hours + ":" + minutes + ":" + seconds;
        all = date + " , " + time
        return all;
      }
    },
    { title: "IP Address", data: "ip_address" },
    { title: "User Agent", data: "user_agent" },
    { title: "Geo Location", data: "country" }
  ];


  $('#users_info').DataTable({
    columns: columns,

    ajax: {
      url: '/views/users_access_data_table',
      dataSrc: "",
      dataType: 'json',
      error: function (xhr, error) {
        console.log("error /views/table: " + xhr);
      },
      // success: function(data_ret)
      // {
      //   console.log("data_ret in ajax datatable")
      //   console.log(data_ret)
      //    // Boxplot 
      //    var y0 = [];
      //    for (var i = 0; i < 50; i ++) {
      //     console.log(data_ret[i]['request_duration'])
      //     var duration =  data_ret[i]['request_duration']
      //     y0[i] = Number((duration * 1000).toFixed(1))         
      //   }

      //   var trace1 = {
      //     y: y0,
      //     type: 'box',
      //     name: 'Users',
      //   };
      //   console.log("trace1")
      //   console.log(trace1)
      //   var data = [trace1];
      //   var layout = {
      //     yaxis: {
      //       title: 'Request Duration in ms',
      //       zeroline: false
      //     },
      //   };

      //   Plotly.newPlot('boxplotDiv', data, layout);
      // }
    },

    dom: "<'row'<'col-sm-6'l><'col-sm-6'f>>" +
      "<'row'<'col-sm-5'i><'col-sm-7'p>>" +
      "<'row'<'col-sm-12'tr>>",
    initComplete: function () {
      $('#datatables_wrapper').LoadingOverlay("text", "Loading Users Access Plots Data");
      // $('.datepicker').datetimepicker();
      initViz()
      boxplotInfo()

    },
  });// end of datatable

  function initViz() {
    $.ajax({
      // url: "/views/users_access_data",
      url: "/views/users_access_data_slider",
      type: 'POST',
      async: false,
      dataType: 'json',
      error: function (xhr, error) {
        console.log("error /views/users_access_data: " + xhr);
      },

      success: function (ret_data) {
        console.log("success of ajax getting data from python, the first time")
        ret = ret_data.dict_combo
        console.log(ret_data)
        console.log(ret)

        console.log(Object.entries(ret))
        console.log(Object.values(ret))
        type_count_dict = {}
        traces_slider = []
        traces = []
        for (const item of Object.entries(ret)) {
          var k = item[1]
          x_values = Object.keys(k)
          y_values = Object.values(k)
          var group_data = { x: x_values, y: y_values, stackgroup: 'one', name: item[0] }
          traces.push(group_data)
        }//end of for loop creating plotting data values
        console.log("traces:")
        console.log(traces)
        console.log(traces.length)
        console.log(ret_data.steps)
        var layout_slider = {
          sliders: [{
            pad: { t: 100 },
            automargin: true,
            currentvalue: {
              xanchor: 'center',
              prefix: 'Month to Start Filtering from: ',
              font: {
                color: '#888',
                size: 20
              }
            },
            steps: ret_data.steps,
            transition: { duration: 500 },
          }],

        }
        // Plotly.plot('myDiv_2', traces, layout, { showSendToCloud: true });
        Plotly.react('users-access', traces, layout_slider);
        sliderChangeReflect(layout_slider)


        function getData(layout) {
          $.ajax
            ({
              url: '/views/users_access_data_slider',
              type: 'POST',
              async: false,
              contentType: "application/json; charset=utf-8",
              dataType: 'json',
              data: JSON.stringify(getActiveSliderStep(layout)),
              error: function (xhr, error) {
                alert("error /views/users_access_data_slider" + xhr);
              },
              success: function (data_returned) { // summary function
                // alert("success of data returned to getData function which is called when slider change is triggered:")
                console.log("data returned to getData function which is called when slider change is triggered:")
                data = data_returned.dict_combo
                console.log(data)

                console.log(Object.entries(data))
                console.log(Object.values(data))
                type_count_dict = {}
                traces_slider = []
                for (const item of Object.entries(data)) {
                  // console.log("item:")
                  // console.log(typeof(item))
                  // console.log(item[0])
                  // console.log(item[1])
                  var k = item[1]
                  // console.log(typeof(k))
                  // console.log(Object.keys(k))
                  x_values = Object.keys(k)
                  y_values = Object.values(k)
                  // console.log(Object.values(k))
                  var group_data = { x: x_values, y: y_values, stackgroup: 'one', name: item[0] }
                  traces_slider.push(group_data)
                }//end of for loop creating plotting data values
                console.log("traces_slider:")
                console.log(traces_slider)
                console.log(traces_slider.length)
              }// end of ajax success getting data
            })// end of ajax getting data
          // Plotly.react('users-access', traces, layout_slider)
          // })//end of done
          console.log("Printing traces after")
          console.log(traces_slider)

          return traces_slider
        } // end of getData function

        function getActiveSliderStep(layout) {
          console.log("getActiveSliderStep Label: ")

          var stepLabelIndex = layout.sliders[0].active
          if (stepLabelIndex == undefined) {
            stepLabelIndex = 0
          }
          var stepVar = layout.sliders[0].steps[stepLabelIndex]
          var stepLabel = stepVar.label
          console.log(stepLabel)
          return stepLabel
        }

        function sliderChangeReflect(layout) {
          $(this).on('plotly_sliderchange', function (e) {
            // getData(layout)
            var dataReturned = getData(layout);
            console.log(dataReturned)
            Plotly.react('users-access', dataReturned, layout)
          })
        }//end of sliderChangeReflect



        //*********************Box Plot **********************/
        // $.ajax({
        //   url: "/views/query_access_summary",
        //   async: false,
        //   dataType: 'json',
        //   error: function (xhr, error) {
        //     console.log("error /views/query_access_summary: " + xhr);
        //   },
        //   success: function (ret) {
        //     console.log("returned data for box plot, size and data")
        //     console.log(ret)
        //     // Boxplot 
        //     var x_dates = []
        //     var values = []
        //     for (let key in ret) {
        //       var current = ret[key]
        //       console.log(key)
        //       console.log(current)
        //       x_dates.push(key)
        //       for (let key_2 in current) {
        //         var f = current[key_2]
        //         console.log("f")
        //         console.log(f)
        //         var duration = f['request_duration_info']
        //         // [minimum, first quar, median, 3rd quar, 95th percentile, max]
        //         console.log("duration: minimum, first quar, median, 3rd quar, 95th percentile, max]")
        //         console.log(duration)
        //         // y0[i] = Number((duration * 1000).toFixed(1))

        //         if (duration[1] != null || duration[2] != null || duration[3] != null) {
        //           var box = {
        //             type: 'box',
        //             name: '',
        //             q1: duration[1] * 1000,
        //             median: duration[2] * 1000,
        //             q3: duration[3] * 1000,
        //             // x: key_2
        //           }
        //           console.log("box = ")
        //           console.log(box)
        //           const newDiv = document.createElement("div" + String(key_2));
        //           Plotly.newPlot(newDiv, box, {
        //             yaxis: {
        //               range: [0, 5]
        //             }
        //           }
        //           );
        //           values.push(box)
        //         }//end of if condition

        //       }// end of inner for --> (let key_2 in current)
        //     } //end of out for --> (let key in ret)
        //     console.log(values)
        //     // Plotly.newPlot('boxplotDiv', values, {
        //     //   yaxis: {
        //     //     range: [0, 5]
        //     //   }
        //     // }
        //     // );
        //     // Plotly.newPlot('boxplotDiv', values);
        //     //   Plotly.newPlot('boxplotDiv', [{
        //     //     type: 'box',
        //     //     name: '',
        //     //     q1: [duration[1]],
        //     //     median: [duration[2]],
        //     //     q3: [duration[3]],
        //     //   }, {
        //     //     type: 'box',
        //     //     name: '',
        //     //     q1: [ 3 ],
        //     //     median: [ 4 ],
        //     //     q3: [ 5 ],
        //     // }]
        //     //     , {
        //     //       yaxis: {
        //     //         range: [0, 5]
        //     //       }
        //     //     }
        //     //   );
        //     // var trace1 = {
        //     //   y: y0,
        //     //   type: 'box',
        //     //   name: 'Users',
        //     // };
        //     // console.log("trace1")
        //     // console.log(trace1)
        //     // var data = [trace1];
        //     // var layout = {
        //     //   yaxis: {
        //     //     title: 'Request Duration in ms',
        //     //     zeroline: false
        //     //   },
        //     // };

        //     // Plotly.newPlot('boxplotDiv', data, layout);
        //   }//end of ajax.success
        // }); //end of ajax call
        //********************************* Subdivision Plot *********************************
        $.ajax({
          url: "/views/users_access_data_subdivision",
          async: false,
          dataType: 'json',
          error: function (xhr, error) {
            console.log("error /views/users_access_data_subdivision: " + xhr);
          },

          success: function (ret) {
            console.log(ret)
            if (ret.size > 0) {
              var parsed_SubDivision = JSON.parse(ret.subdivision);
              subdivision_dict = {}
              parsed_SubDivision.forEach(function (d_element, index) {
                subdivision_dict[d_element['subdivision']] = d_element['id']
              });

              var trace1 = {
                x: Object.values(subdivision_dict),
                y: Object.keys(subdivision_dict),
                // name: 'SF Zoo',
                orientation: 'h',
                marker: {
                  color: 'rgba(55,128,191,0.6)',
                  width: 1
                },
                type: 'bar'
              };
              var data = [trace1];
              var layout = {
                barmode: 'stack'
              };
              if (Object.keys(subdivision_dict).length > 0) {
                console.log("data.length")
                console.log(Object.keys(subdivision_dict))
                Plotly.newPlot('subdivisionDiv', data, layout, { responsive: true });
              }
            }

            // Plotly.newPlot('subdivisionDiv', data, layout);
          }
        })


      }, //end of ajax success
      complete: function () {
        $('#datatables_wrapper').LoadingOverlay("hide");
      }

    });

  }// end of initViz()

  function boxplotInfo() {
    var all_dropdown_elements = []
    var dates = []
    $.ajax
      ({
        url: "/views/query_access_summary",
        async: false, //to wait until data is returned, potential bug
        dataType: 'json',
        error: function (xhr, error) {
          alert("error /views/query_access_summary: " + xhr);
        },
        success: function (ret) {
          console.log("data returned for dropdown and boxplot")
          // console.log(ret.size)
          console.log(ret)
          all_dropdown_elements = []
          // dates = []
          // dates = Object.keys(ret)
          // console.log(dates)
          var unique_access_types = new Set()
          Object.keys(ret).forEach(function (key) {
            console.log(key)
            // 2021-08-06
            //group_bu hour ==> 2021-03-23 03

            var value = ret[key];
            console.log(value) //array
            // 0: {access_method: "GET", access_type: "access/log", count: 36, request_duration_info: Array(6), response_bytes_info: Array(6)}
            // 1: {access_method: "GET", access_type: "access/summary", count: 24, request_duration_info: Array(6), response_bytes_info: Array(6)}
            // 2: {access_method: "GET", access_type: "error", count: 4, request_duration_info: Array(6), response_bytes_info: Array(6)}
            // 3: {access_method: "GET", access_type: "information", count: 4, request_duration_info: Array(6), response_bytes_info: Array(6)}
            // length: 4

            value.forEach(function (v) {
              console.log(v)
              unique_access_types.add(v.access_type)

              // var dropdown_element = { 'date': key, 'corresponding_data': v.access_type, 'boxplot_info': v.request_duration_info, 'count': v.count }
              var dropdown_element = { 'corresponding_data': v.access_type }
              all_dropdown_elements.push(dropdown_element)

            });
          }); //end of for loop
          console.log("unique_access_types")
          console.log(unique_access_types)

          let unique_access_types_array = Array.from(unique_access_types);
          console.log(typeof (unique_access_types_array)) //object
          console.log(unique_access_types_array)

          default_selected = []
          default_selected.push(all_dropdown_elements[0].corresponding_data)
          console.log(default_selected)
          // console.log(dates)
          console.log(all_dropdown_elements)

          var all_values = unique_access_types.values()
          console.log(all_values)
          var default_value = [all_values.next().value]
          console.log(default_value)

          var $selectize_server_logs = $('#server_logs').selectize({
            options: all_dropdown_elements, //An array of the options available to select; array of objects.
            valueField: 'corresponding_data',
            labelField: 'corresponding_data',
            plugins: ["remove_button"],
            items: default_selected, //An array of the initial(default) selected values
            maxItems: 1,

          });
          // fetch the instance
          var selectizeControl_server_logs = $selectize_server_logs[0].selectize;
          var accessTypeSelected = default_selected[0];
          selectizeControl_server_logs.on('change', function () {
            accessTypeSelected = selectizeControl_server_logs.getValue();
          }); // end of selectizeControl_server_logs.on('change', function () ...

          $("#datepicker").datepicker();
          var dateSelected;
          $("#datepicker").on("change", function () {
            dateSelected = $(this).val(); // Calendar: 08/25/2021 --> 2021-08-25
            var reformatted_date = dateSelected.substring(6, 10) + "-" + dateSelected.substring(0, 2) + "-" + dateSelected.substring(3, 5)
            alert(reformatted_date);
            plotBoxPlot(reformatted_date, accessTypeSelected)
          });


          function plotBoxPlot(dateSelectedParam, accessTypeParam) {
            console.log("dateSelectedParam and accessTypeParam = ")
            console.log(dateSelectedParam)
            console.log(accessTypeParam)
            var orig_dateSelectedParam = dateSelectedParam
            var x_hours = []
            var boxplot_hourly = []
            var q1_24_hours = []
            var median_24_hours = []
            var q3_24_hours = []
            var min_24_hours = []
            var max_24_hours = []
            for (i = 00; i < 24; i++) {
              console.log(orig_dateSelectedParam + " " + i)

              dateSelectedParam = orig_dateSelectedParam + " " + i
              x_hours.push(i)
              // }
              // if (ret[dateSelectedParam] != null) {
              //   console.log("date exists in ret data keys")
              // }
              var title_value = 'Plot for access type: ' + accessTypeParam + ' on ' + orig_dateSelectedParam

              console.log("=================================")
              var current = ret[dateSelectedParam]
              console.log(current) // json-like data (value of that key)

              if (current == undefined) {
                console.log("undefined current")
                // var box = [{
                //   type: 'box',
                //   name: '',
                //   q1: [0],
                //   median: [0],
                //   q3: [0]
                // }]
                q1_24_hours.push(0)
                median_24_hours.push(0)
                q3_24_hours.push(0)
                min_24_hours.push(0)
                max_24_hours.push(0)
                // var box = {
                //   type: 'box',
                //   // name: i,
                //   q1: [0],
                //   median: [0],
                //   q3: [0],
                // }
                // boxplot_hourly.push(box)

                // Plotly.newPlot('boxplotDiv', box, {
                //   yaxis: {
                //     title: "Request Duration (ms)"
                //   },
                //   layout: {
                //     "xaxis": {
                //       "visible": false
                //     },
                //     "yaxis": {
                //       "visible": false
                //     },
                //     "annotations": [
                //       {
                //         "text": "No matching data found",
                //         // "xref": "paper",
                //         // "yref": "paper",
                //         // "showarrow": false,
                //         // "font": {
                //         //   "size": 28
                //         // }
                //       }
                //     ]
                //   },

                //   title: { 'text': title_value + " <br> No matching data for the picked Date" }
                // }
                // );

              }
              else {
                for (let key_2 in current) {
                  console.log("==============")
                  console.log("key_2= ")
                  console.log(key_2)
                  var f = current[key_2]
                  console.log("f")
                  console.log(f) // f = {access_method: "GET", access_type: "error", count: 3, request_duration_info: Array(6), response_bytes_info: Array(6)}

                  var current_access_type = f['access_type']
                  console.log('f of access_type = current_access_type= ')
                  console.log(current_access_type)
                  if (current_access_type == accessTypeParam) {
                    console.log("combination of date and access type exists")
                    var duration = f['request_duration_info']
                    // [minimum, first quar, median, 3rd quar, 95th percentile, max]
                    console.log("duration: minimum, first quar, median, 3rd quar, 95th percentile, max]")
                    console.log(duration)

                    if (duration[1] != null || duration[2] != null || duration[3] != null) { // should use and not or ??
                      var q1_value = (duration[1] * 1000).toFixed(1)
                      var median_value = (duration[2] * 1000).toFixed(1)
                      var q3_value = (duration[3] * 1000).toFixed(1)
                      var min_value = (duration[0] * 1000).toFixed(1)
                      var max_value = (duration[5] * 1000).toFixed(1)
                      // var box = [{
                      //   type: 'box',
                      //   name: '',
                      //   q1: [parseFloat(q1_value)],
                      //   median: [parseFloat(median_value)],
                      //   q3: [parseFloat(q3_value)],
                      //   lowerfence: [parseFloat(min_value)],
                      //   upperfence: [parseFloat(max_value)], //https://codepen.io/alexcjohnson/pen/JjYVBgW?editors=1010
                      //   // boxpoints: 'all',
                      //   // jitter: 0.3,
                      //   // pointpos: -1.8,
                      // }]
                      // var box = {
                      //   type: 'box',
                      //   name: i,
                      //   q1: [parseFloat(q1_value)],
                      //   median: [parseFloat(median_value)],
                      //   q3: [parseFloat(q3_value)],
                      //   lowerfence: [parseFloat(min_value)],
                      //   upperfence: [parseFloat(max_value)], //https://codepen.io/alexcjohnson/pen/JjYVBgW?editors=1010
                      //   // boxpoints: 'all',
                      //   // jitter: 0.3,
                      //   // pointpos: -1.8,

                      // }
                      // console.log("box = ")
                      // console.log(box)
                      // boxplot_hourly.push(box)

                      q1_24_hours.push(parseFloat(q1_value))
                      median_24_hours.push(parseFloat(median_value))
                      q3_24_hours.push(parseFloat(q3_value))
                      min_24_hours.push(parseFloat(min_value))
                      max_24_hours.push(parseFloat(max_value))

                      // Plotly.newPlot('boxplotDiv', box, {
                      //   yaxis: {
                      //     title: "Request Duration (ms)"
                      //   },
                      //   title: { 'text': title_value }
                      // }
                      // );


                    }//end of if (duration[1] != null || duration[2] != null || duration[3] != null) 
                    else {
                      console.log("values are null")
                      // var box = [{
                      //   type: 'box',
                      //   name: '',
                      //   q1: [0],
                      //   median: [0],
                      //   q3: [0]
                      // }]
                      // var box = {
                      //   type: 'box',
                      //   name: i,
                      //   q1: [0],
                      //   median: [0],
                      //   q3: [0],
                      // }
                      // boxplot_hourly.push(box)
                      q1_24_hours.push(0)
                      median_24_hours.push(0)
                      q3_24_hours.push(0)
                      min_24_hours.push(0)
                      max_24_hours.push(0)
                      //   Plotly.newPlot('boxplotDiv', box, {
                      //     yaxis: {
                      //       title: "Request Duration (ms)"
                      //     },
                      //     layout: {
                      //       "xaxis": {
                      //         "visible": false
                      //       },
                      //       "yaxis": {
                      //         "visible": false
                      //       },
                      //       // "annotations": [
                      //       //   {
                      //       // "text": "No matching data found",
                      //       // "xref": "paper",
                      //       // "yref": "paper",
                      //       // "showarrow": false,
                      //       // "font": {
                      //       //   "size": 28
                      //       // }
                      //       // }
                      //       // ]
                      //     },

                      //     title: { 'text': title_value + " <br> Values of Q1, Median, or Q3 of the <br> Request Duration of the Selected date equal(s) Null" }
                      //   }
                      //   );
                    }

                    // break;

                  }// end of if (current_access_type == accessTypeParam)


                }// end of for --> (let key_2 in current)  

              }//end of else current is not undefined
            }//end of for loop i=00 --> 23
            // console.log("boxplot_hourly")
            // console.log(boxplot_hourly)
            var layout_24_hours = {
              yaxis: {
                    title: "Request Duration (ms)"
                  },
                  xaxis:{
                    title:"24 Hours of the selected day",
                    range:[0, 23]
                  },
                  title: { 'text': title_value }

            }
            Plotly.newPlot('boxplotDiv', [{
              "type": "box",
              "name": "",
              "offsetgroup": "1",
              "q1": q1_24_hours,
              "median": median_24_hours,
              "q3": q3_24_hours,
              "lowerfence": min_24_hours,
              "upperfence": max_24_hours
            }], layout_24_hours)

          }//end of function plotBoxPlot

        } //end of ajax success
      });


  }//end of boxplotInfo function


});