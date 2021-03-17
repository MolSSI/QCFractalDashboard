$(document).ready(function () {
    $.ajax
        ({
            url: "/views/tasks_queue_data_2",
            dataType: 'json',
            error: function (xhr, error) {
                alert("error /views/tasks_queue_data_2: " + xhr);
            },
            success: function (ret) {

                var d = ret.data
                var x = [];
                var x_manager = []
                // var t0 = performance.now()
                // for (var i = 0; i < ret.length; i++) {
                //     console.log(d[i][1])

                //     x[i] = d[i][1]
                //     x_manager[i] = d[i][2]
                //     // console.log(x[i])
                // }
                // var t1 = performance.now()
                // console.log("Time taken using for(var i=0...) in milliseconds =")
                // console.log(t1 - t0)

                var x2 = [];
                var x_manager2 = []

                var t0 = performance.now()
                var i = 0
                $.each(ret, function (d) {
                    x2[i] = d[i][1]
                    x_manager2[i] = d[i][2]
                    i = i + 1
                    // console.log(x2[i])
                });
                var t1 = performance.now()
                console.log("Time taken using .each in milliseconds =")
                console.log(t1 - t0)

                dataToPlot = ret

                var task_queueDiv = document.getElementById("task_queueDiv");
                var task_queue_managersDiv = document.getElementById("task_queue_managersDiv");

                var layout = {
                    title: 'Histogram of Status of Tasks Queue',
                    yaxis:
                    {
                        rangemode: 'tozero'
                    }
                };

                var trace = {
                    x: x,
                    type: 'histogram',
                };
                var data = [trace];
                Plotly.newPlot(task_queueDiv, data, layout)

                var layout_2 = {
                    title: 'Histogram of Managers of Tasks Queue',
                    yaxis:
                    {
                        rangemode: 'tozero'
                    }
                };
                var trace_2 = {
                    x: x_manager,
                    type: 'histogram',
                };
                var data_2 = [trace_2];
                Plotly.newPlot(task_queue_managersDiv, data_2, layout_2)


                $('#users_info_2').DataTable({
                    ajax: '/views/tasks_queue_data_2',
                    columns: [
                        { title: "base result id" },
                        { title: "status" },
                        { title: "manager" },
                        { title: "priority" },
                        { title: "modified_on" },
                        { title: "created_on" }
                    ]
                });
            }
        })

}
);