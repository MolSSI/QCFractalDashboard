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
                console.log(d)
                var x2 = [];
                var x_manager2 = []
                var t0 = performance.now()
                d.forEach(function(d_element, index) {
                    x2[index] = d_element['status']
                    x_manager2[index] = d_element['manager']
                });
                var t1 = performance.now()
                console.log("Time taken using .each in milliseconds =")
                console.log(t1 - t0)

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
                    x: x2,
                    type: 'histogram',
                };
                var data = [trace];
                // console.log("data")
                // console.log(data)
                Plotly.newPlot(task_queueDiv, data, layout)

                var layout_2 = {
                    title: 'Histogram of Managers of Tasks Queue',
                    yaxis:
                    {
                        rangemode: 'tozero'
                    }
                };
                var trace_2 = {
                    x: x_manager2,
                    type: 'histogram',
                };
                var data_2 = [trace_2];
                // console.log("data_2")
                // console.log(data_2)
                Plotly.newPlot(task_queue_managersDiv, data_2, layout_2)


                $('#users_info_2').DataTable({
                    ajax: '/views/tasks_queue_data_2',
                    columns: [
                        { title: "base result id", data: "base_result" },
                        { title: "status", data: "status" },
                        { title: "manager", data: "manager" },
                        { title: "priority" , data: "priority"},
                        { title: "modified_on", data: "modified_on" },
                        { title: "created_on" , data: "created_on"}
                    ]
                });
            }
        })

}
);