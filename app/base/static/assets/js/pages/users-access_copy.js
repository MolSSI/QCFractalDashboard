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
    },

    dom: "<'row'<'col-sm-6'l><'col-sm-6'f>>" +
      "<'row'<'col-sm-5'i><'col-sm-7'p>>" +
      "<'row'<'col-sm-12'tr>>",
    initComplete: function () {
      $('#datatables_wrapper').LoadingOverlay("text", "Loading Users Access Plots Data");
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
        ret = ret_data.dict_combo
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
                data = data_returned.dict_combo
                type_count_dict = {}
                traces_slider = []
                for (const item of Object.entries(data)) {
                  var k = item[1]
                  x_values = Object.keys(k)
                  y_values = Object.values(k)
                  var group_data = { x: x_values, y: y_values, stackgroup: 'one', name: item[0] }
                  traces_slider.push(group_data)
                }//end of for loop creating plotting data values
              }// end of ajax success getting data
            })// end of ajax getting data
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
          all_dropdown_elements = []
          var unique_access_types = new Set()
          Object.keys(ret).forEach(function (key) {
            // 2021-08-06
            //group_by hour ==> 2021-03-23 03
            var value = ret[key];
            value.forEach(function (v) {
              unique_access_types.add(v.access_type)
              // var dropdown_element = { 'date': key, 'corresponding_data': v.access_type, 'boxplot_info': v.request_duration_info, 'count': v.count }
              var dropdown_element = { 'corresponding_data': v.access_type }
              all_dropdown_elements.push(dropdown_element)
            });
          }); //end of for loop

          let unique_access_types_array = Array.from(unique_access_types);
          default_selected = []
          default_selected.push(all_dropdown_elements[0].corresponding_data)
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
            plotBoxPlot(reformatted_date, accessTypeSelected)
          });


          function plotBoxPlot(dateSelectedParam, accessTypeParam) {
            var orig_dateSelectedParam = dateSelectedParam
            var x_hours = []
            var q1_24_hours = []
            var median_24_hours = []
            var q3_24_hours = []
            var min_24_hours = []
            var max_24_hours = []
            for (i = 00; i < 24; i++) {
              console.log(orig_dateSelectedParam + " " + i)
              dateSelectedParam = orig_dateSelectedParam + " " + i
              x_hours.push(i)
              var title_value = 'Plot for access type: ' + accessTypeParam + ' on ' + orig_dateSelectedParam
              var current = ret[dateSelectedParam]
              if (current == undefined) {
                q1_24_hours.push(0)
                median_24_hours.push(0)
                q3_24_hours.push(0)
                min_24_hours.push(0)
                max_24_hours.push(0)
              }
              else {
                for (let key_2 in current) {
                  var f = current[key_2]
                  var current_access_type = f['access_type']
                  if (current_access_type == accessTypeParam) {
                    var duration = f['request_duration_info']
                    // [minimum, first quar, median, 3rd quar, 95th percentile, max]
                    if (duration[1] != null || duration[2] != null || duration[3] != null) { // should use and not or ??
                      var q1_value = (duration[1] * 1000).toFixed(1)
                      var median_value = (duration[2] * 1000).toFixed(1)
                      var q3_value = (duration[3] * 1000).toFixed(1)
                      var min_value = (duration[0] * 1000).toFixed(1)
                      var max_value = (duration[5] * 1000).toFixed(1)
                      q1_24_hours.push(parseFloat(q1_value))
                      median_24_hours.push(parseFloat(median_value))
                      q3_24_hours.push(parseFloat(q3_value))
                      min_24_hours.push(parseFloat(min_value))
                      max_24_hours.push(parseFloat(max_value))
                    }//end of if (duration[1] != null || duration[2] != null || duration[3] != null) 
                    else {
                      q1_24_hours.push(0)
                      median_24_hours.push(0)
                      q3_24_hours.push(0)
                      min_24_hours.push(0)
                      max_24_hours.push(0)
                    }
                  }// end of if (current_access_type == accessTypeParam)
                }// end of for --> (let key_2 in current)  
              }//end of else current is not undefined
            }//end of for loop i=00 --> 23

            var layout_24_hours = {
              yaxis: {
                title: "Request Duration (ms)"
              },
              xaxis: {
                title: "24 Hours of the selected date",
                range: [0, 23]
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