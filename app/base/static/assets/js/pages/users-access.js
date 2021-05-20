$(function ($) {

  $('#datatables_wrapper').LoadingOverlay("show", {
    text: 'Loading Users Access Data'
  });

  var columns = [
    { title: "ID", data: "id", "width": "70px" },
    { title: "User", data: 'user', "width": "70px" },
    { title: "Request Duration", data: "request_duration" },
    { title: "Access Type", data: "access_type" },
    { title: "Access Date", data: "access_date" },
    { title: "IP Address", data: "ip_address" },
    { title: "User Agent", data: "user_agent" },
    { title: "Geo Location", data: "country" }
  ];

  $('#users_info').DataTable({
    ajax: {
      url: '/views/users_access_data_table',
      dataSrc: "",
      dataType: 'json',
      error: function (xhr, error) {
        console.log("error /views/table: " + xhr);
      }
    },
    columns: columns,
    dom: "<'row'<'col-sm-6'l><'col-sm-6'f>>" +
      "<'row'<'col-sm-5'i><'col-sm-7'p>>" +
      "<'row'<'col-sm-12'tr>>",
    initComplete: function () {
      $('#datatables_wrapper').LoadingOverlay("text", "Loading Users Access Plots Data");

      initViz()
    },
  });

  function initViz() {
    $.ajax({
      url: "/views/users_access_data",
      async: false,
      dataType: 'json',
      error: function (xhr, error) {
        console.log("error /views/users_access_data: " + xhr);
      },
      success: function (ret) {
        var DateAccessesjson = ret.DateAccessesJSON
        var parsed_DateAccessesJSON = JSON.parse(DateAccessesjson);

        var access_date_type_count = ret.access_date_type
        len = Object.keys(access_date_type_count).length
        var traces = [];
        for ([key, value] of Object.entries(access_date_type_count)) {
          var group_data = { x: value['access_date'], y: value['id'], stackgroup: 'one', name: key }
          traces.push(group_data)
        }
        Plotly.newPlot('users-access', traces);

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
        if (Object.keys(subdivision_dict).length > 0){
          console.log("data.length")
          console.log(Object.keys(subdivision_dict))
          Plotly.newPlot('subdivisionDiv', data, layout, {responsive: true});
        }

        // Plotly.newPlot('subdivisionDiv', data, layout);
      },
      complete: function(){
        $('#datatables_wrapper').LoadingOverlay("hide");
      }
    });
  }


});