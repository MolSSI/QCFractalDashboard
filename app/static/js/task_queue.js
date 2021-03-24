$(document).ready(function () {
    $.ajax
        ({
            url: "/views/tasks_queue_data",
            dataType: 'json',
            error: function (xhr, error) {
                alert("error /views/tasks_queue_data: " + xhr);
            },
            success: function (ret) {

                var d = ret.data
                var x2 = [];
                var x_manager2 = []
                d.forEach(function(d_element, index) {
                    x2[index] = d_element['status']
                    x_manager2[index] = d_element['manager']
                });
                
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
                Plotly.newPlot(task_queueDiv, data, layout)

                var layout_2 = {
                    title: 'Histogram of Managers of Tasks Queue',
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
                Plotly.newPlot(task_queue_managersDiv, data_2, layout_2)


                $('#task_queue_table').DataTable({
                    ajax: '/views/tasks_queue_data',
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