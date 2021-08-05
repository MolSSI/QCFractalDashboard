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

      initViz()
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
        $.ajax({
          url: "/views/query_access_summary",
          async: false,
          dataType: 'json',
          error: function (xhr, error) {
            console.log("error /views/query_access_summary: " + xhr);
          },
          success: function (ret) {
            console.log("returned data for box plot, size and data")
            console.log(ret)
            // Boxplot 
            var x_dates = []
            var values = []
            for (let key in ret) {
              var current = ret[key]
              console.log(key)
              console.log(current)
              x_dates.push(key)
              for (let key_2 in current) {
                var f = current[key_2]
                console.log("f")
                console.log(f)
                var duration = f['request_duration_info']
                // [minimum, first quar, median, 3rd quar, 95th percentile, max]
                console.log("duration: minimum, first quar, median, 3rd quar, 95th percentile, max]")
                console.log(duration)
                // y0[i] = Number((duration * 1000).toFixed(1))

                if (duration[1] != null || duration[2] != null || duration[3] != null) {
                  var box = {
                    type: 'box',
                    name: '',
                    q1: duration[1] * 1000,
                    median: duration[2] * 1000,
                    q3: duration[3] * 1000,
                    // x: key_2
                  }
                  console.log("box = ")
                  console.log(box)
                  const newDiv = document.createElement("div"+String(key_2));
                  Plotly.newPlot(newDiv, box, {
                    yaxis: {
                      range: [0, 5]
                    }
                  }
                  );
                  values.push(box)
                }//end of if condition

              }// end of inner for --> (let key_2 in current)
            } //end of out for --> (let key in ret)
            console.log(values)
            // Plotly.newPlot('boxplotDiv', values, {
            //   yaxis: {
            //     range: [0, 5]
            //   }
            // }
            // );
            // Plotly.newPlot('boxplotDiv', values);
            //   Plotly.newPlot('boxplotDiv', [{
            //     type: 'box',
            //     name: '',
            //     q1: [duration[1]],
            //     median: [duration[2]],
            //     q3: [duration[3]],
            //   }, {
            //     type: 'box',
            //     name: '',
            //     q1: [ 3 ],
            //     median: [ 4 ],
            //     q3: [ 5 ],
            // }]
            //     , {
            //       yaxis: {
            //         range: [0, 5]
            //       }
            //     }
            //   );
            // var trace1 = {
            //   y: y0,
            //   type: 'box',
            //   name: 'Users',
            // };
            // console.log("trace1")
            // console.log(trace1)
            // var data = [trace1];
            // var layout = {
            //   yaxis: {
            //     title: 'Request Duration in ms',
            //     zeroline: false
            //   },
            // };

            // Plotly.newPlot('boxplotDiv', data, layout);
          }//end of ajax.success
        }); //end of ajax call
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


});