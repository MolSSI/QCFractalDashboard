$(function ($) {

  $('#tasks-plots-main-body').LoadingOverlay("show", {
    text: 'Loading DB Plots Data'
  });

  $.ajax({
    url: "/views/db_stats",
    async: false,
    dataType: 'json',
    error: function (xhr, error) {
      alert("error /views/db_stats plot: " + xhr);
    },
    success: function (ret) {
      console.log(ret)
      var d = ret
      var x_ = []
      var y_ = []
      var i=0
      d.forEach(function (d_element, index) {
        console.log(d_element)
        x_[i] = d_element['timestamp']
        console.log(x_)
        var kb=d_element['db_total_size'] / 1024
        var mb = kb/1024
        y_[i] =mb  //need to divide by some number to make the plot more readable (make it Megabytes)
        i++



      });

      var db_Div = document.getElementById("db_stats_plot");

      var layout = {
        yaxis:
        {
          rangemode: 'tozero',
          title: 'DB Total Size'
        },
        xaxis:
        {
          title: "TimeStamp"
        }

      };
      var trace = {
        x: x_,
        y:y_,
        type: 'scatter'

      };
      var data = [trace];
      Plotly.newPlot(db_Div, data, layout, { responsive: true })

    
    }, //end of success
    complete: function () {
      $('#tasks-plots-main-body').LoadingOverlay("hide");
    }
  });//end of ajax
});