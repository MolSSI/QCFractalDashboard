// Not used, we are using tasks-queue-datatable.js instead
$(function ($) {

    $('#datatables_wrapper').LoadingOverlay("show", {
      text: 'Loading Users Access Data'
    });
  
    var columns = [
      { title: "ID", data: "id", "width": "70px" },
      { title: "User", data: 'user', "width": "70px" }
    
    ];
  
  
    $('#users_info').DataTable({
      ajax: {
        url: '/views/server_error_logs',
        dataSrc: "",
        dataType: 'json',
        error: function (xhr, error) {
          console.log("error /views/server_error_logs: " + xhr);
        },
        success: function(data_ret)
        {
          console.log("data_ret in server_error_logs ajax datatable")
          console.log(data_ret)
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
    });// end of datatable
  
    function initViz() {
      $.ajax({
        complete: function () {
          $('#datatables_wrapper').LoadingOverlay("hide");
        }
      });
    }// end of initViz()
  
  
  });