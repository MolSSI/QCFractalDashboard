$(document).ready(function () {
    $.ajax
        (
            {
                url: "/views/tasks_queue_data",
                async: false, //to wait until data is returned
                dataType: 'json',
                error: function (xhr, error) {
                    alert("error /views/tasks_queue_data: " + xhr);
                },
                success: function (ret) {
                    var d = ret.data
                    var x2 = [];
                    var x_manager2 = []
                    console.log(d)
                    d.forEach(function (d_element, index) {

                        console.log(d_element)
                        if (d_element != null) {
                            x2[index] = d_element['status']
                            x_manager2[index] = d_element['manager']
                        }
                        else{
                            console.log("null encountered")
                        }
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

                    // Setup - add a text input to each header cell
                    $('#task_queue_table thead tr').clone(true).appendTo('#task_queue_table thead');
                    $('#task_queue_table thead tr:eq(1) th').each(function (i) {
                        var title = $(this).text();
                        $(this).html('<input type="text" placeholder="Search ' + title + '" />');
                        $('input', this).on('keyup change', function () {
                            if (table.column(i).search() !== this.value) {
                                table
                                    .column(i)
                                    .search(this.value)
                                    .draw();
                            }
                        });
                    });

                    var table = $('#task_queue_table').DataTable({
                        orderCellsTop: true,
                        fixedHeader: true,

                        ajax: '/views/tasks_queue_data',
                        columns: [
                            { title: "Base result ID", data: "base_result" },
                            { title: "Status", data: "status" },
                            { title: "Manager", data: "manager" },
                            { title: "Priority", data: "priority" },
                            { title: "Modified_on", data: "modified_on" },
                            { title: "Created_on", data: "created_on" }
                        ],
                        columnDefs: [{
                            orderable: false,
                            className: 'select-checkbox',
                            targets: 0
                        }],
                        select: {
                            style: 'multi',
                            selector: 'td:not(:last-child)'
                        },
                        dom: 'Bfrtip',
                        buttons: [
                            {
                                text: 'Select All',
                                action: function () {
                                    table.rows().select();

                                }
                            },
                            {
                                text: 'Deselect All',
                                action: function () {
                                    table.rows().deselect();
                                }
                            },
                            {

                                extend: 'selected', // Bind to Selected row
                                text: 'Delete',
                                name: 'delete',     // do not change name
                                action: function (e, dt, node, config) {
                                    alert('Delete activated');
                                }
                            },
                            {
                                extend: 'selected', // Bind to Selected row
                                text: 'Restart',
                                action: function () {
                                    var count = table.rows({ selected: true }).count();
                                    // var base_result_ids = []
                                    for (i = 0; i < count; i++) {
                                        var data_ = table.rows({ selected: true }).data()[i].base_result;
                                        // base_result_ids.push(data_)
                                        // }
                                        // console.log(base_result_ids)
                                        // Begining of restart ajax call
                                        // $.ajax({
                                        //     url: '/views/tasks_queue_restart',
                                        //     type: 'POST',
                                        //     // data: base_result_ids,
                                        //     data: data_,
                                        //     error: function (xhr, error) {
                                        //         alert("error /views/tasks_queue_restart: " + xhr);
                                        //     },
                                        //     success: function (response) {
                                        //         alert(response.number_of_updated + " Task(s) Restarted ")
                                        //         table.ajax.reload(); // but the chosen task sometimes doesn't show from the first time
                                        //     }
                                        // })
                                        // end of restart ajax call
                                    }//end of for loop
                                }
                            }
                        ],
                    }); //end of datatable
                } //end of ajax "success"
            }); //end of ajax call

}); //end of: $(document).ready