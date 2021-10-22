$(function ($) {
  $('#tasks-plots-main-body').LoadingOverlay("show", {
    text: 'Loading Tasks Plots Data'
  });

  $.ajax({
    url: "/views/tasks_queue_data",
    async: false,
    dataType: 'json',
    error: function (xhr, error) {
      alert("error /views/tasks_queue_data: " + xhr);
    },
    success: function (ret) {
      var d = ret.data
      var x2 = [];
      var x_manager2 = []
      d.forEach(function (d_element, index) {
        x2[index] = d_element['status']
        x_manager2[index] = d_element['manager']
      });

      var task_queueDiv = document.getElementById("task_queueDiv");
      var task_queue_managersDiv = document.getElementById("task_queue_managersDiv");

      var layout = {
        yaxis:
        {
          rangemode: 'tozero'
        }
      };
      var trace = {
        x: x2,
        type: 'histogram',
      };
      var data = [trace];
      Plotly.newPlot(task_queueDiv, data, layout, { responsive: true })

      var layout_2 = {
        yaxis:
        {
          rangemode: 'tozero',
          automargin: true

        }
      };
      var trace_2 = {
        x: x_manager2,
        type: 'histogram',
      };
      var data_2 = [trace_2];
      Plotly.newPlot(task_queue_managersDiv, data_2, layout_2, { responsive: true })
    },
    complete: function () {
      $('#tasks-plots-main-body').LoadingOverlay("hide");
    }
  });
});