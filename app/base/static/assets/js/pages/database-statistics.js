$(function ($) {

    var columns = [
        {
            title: 'Info', data: "db_table_information", "width": "40px", "fnCreatedCell": function (nTd, sData, oData, iRow, iCol) {
                $(nTd).html("<button type='button' class='btn-success' >Info</button>")
            }
        },
        {
            title: "Time Stamp", data: "timestamp", render: function (data, type, row) {
                return data.substring(0, 10) + ", " + data.substring(11, 19)
            }
        },
        // {
        //   title: "Request Duration (ms)", data: "request_duration", render: function (data, type, row) {
        //     return Number((data * 1000).toFixed(1));
        //   }
        // },
        {
            title: "DB Total Size(MB)", data: "db_total_size", "width": "auto", render: function (data, type, row) {
                var kb = Number(data / 1024)
                var mb = Number(kb / 1024)

                return mb.toFixed(2);
            }
        },
        {
            title: "DB Table Size (MB)", data: "db_table_size", "width": "auto", render: function (data, type, row) {
                var kb = Number(data / 1024)
                var mb = Number(kb / 1024)

                return mb.toFixed(2);
            }
        },
        {
            title: "DB Index Size (MB", data: "db_index_size", "width": "auto", render: function (data, type, row) {
                var kb = Number(data / 1024)
                var mb = Number(kb / 1024)

                return mb.toFixed(2);
            }
        },
        { title: "Collection Count", data: "collection_count", "width": "auto" },
        { title: "Molecule Count", data: "molecule_count", "width": "auto" },
        { title: "KVStore Count", data: "kvstore_count" },
        { title: "Error Count", data: "error_count", "width": "auto" },
        { title: "Result Count", data: "result_count", "width": "auto" },
        { title: "Access Count", data: "access_count", "width": "auto" },
        // { title: "Time Stamp", data: "timestamp", "width": "auto" },

    ];

    var table = $('#db_stats').DataTable({
        // dom: 'Bfrtip',
        dom: 'b',
        dataSrc: 'JSON',
        columns: columns,
        ajax: {
            url: '/views/db_stats',
            dataSrc: "",
            dataType: 'json',
            error: function (xhr, error) {
                console.log("error /views/table: " + xhr);
            },
            // success: function (data_ret) {
            //     alert("fddf")
            // }
        },
        initComplete: function () {
            $('#datatables_wrapper').LoadingOverlay("text", "Loading Users Access Plots Data");
            // $('.datepicker').datetimepicker();
            // initViz()

        },
    }); //end of datatable

    var db_table_information_columns = [
        { title: 'table_name' },
        { title: 'row_estimate' },
        { title: 'total_bytes' },
        { title: 'index_bytes' },
        { title: 'toast_bytes' }
    ]
    var table2 = $('#db_table_information').DataTable({
        // dom: 'Bfrtip',
        // dom: 'b',
        dataSrc: 'JSON',
        columns: db_table_information_columns,
        ajax: {
            url: '/views/db_table_information',
            // dataSrc: "db_table_information.rows",
            dataSrc: "rows",
            // dataType: 'json',
            error: function (xhr, error) {
                console.log("error /views/table: " + xhr);
            },
            // success: function (data_ret) {
            //     alert("fddf")
            // }
        },
        initComplete: function () {
            $('#datatables_wrapper').LoadingOverlay("text", "Loading Users Access Plots Data");
            // $('.datepicker').datetimepicker();
            // initViz()

        },
    }); //end of datatable

    $('#db_stats tbody').on('click', 'button', function () {
        $('#empModal').modal('show');
    });


    var columns_2 = [
        { title: "service_queue_status: result_type, status, and count", data: "service_queue_status.rows", "width": "auto" },
        // { title: "status", data: "service_queue_status.rows[0][0]", "width": "auto" },
        // { title: "count", data: "count", "width": "auto" },

    ];

    // var table_2 = $('#db_stats_2').DataTable({
    //     // dom: 'Bfrtip',
    //     dom: 'b',
    //     dataSrc: 'JSON',
    //     columns: columns_2,
    //     ajax: {
    //         url: '/views/db_stats',
    //         dataSrc: "",
    //         dataType: 'json',
    //         error: function (xhr, error) {
    //             console.log("error /views/table: " + xhr);
    //         },
    //         // success: function (data_ret) {
    //         //     alert("fddf")
    //         // }
    //     },
    //     initComplete: function () {
    //         $('#datatables_wrapper').LoadingOverlay("text", "Loading Users Access Plots Data");
    //         // $('.datepicker').datetimepicker();
    //         // initViz()

    //     },
    // }); //end of datatable

    var groupColumn = 0;
    var table = $('#example').DataTable({
        "dom": '<"toolbar">frtip',
        "columnDefs": [
            { "visible": false, "targets": groupColumn }
        ],
        "order": [[ groupColumn, 'asc' ]],
        "displayLength": 25,
        "drawCallback": function ( settings ) {
            var api = this.api();
            var rows = api.rows( {page:'current'} ).nodes();
            var last=null;
 
            api.column(groupColumn, {page:'current'} ).data().each( function ( group, i ) {
                if ( last !== group ) {
                    $(rows).eq( i ).before(
                        '<tr class="group"><td colspan="5">'+group+'</td></tr>'
                    );
 
                    last = group;
                }
            } );
        }
    } );
    $("div.toolbar").html('<b>The following table display service_queue_status</b>');
 
    // Order by the grouping
    $('#example tbody').on( 'click', 'tr.group', function () {
        var currentOrder = table.order()[0];
        if ( currentOrder[0] === groupColumn && currentOrder[1] === 'asc' ) {
            table.order( [ groupColumn, 'desc' ] ).draw();
        }
        else {
            table.order( [ groupColumn, 'asc' ] ).draw();
        }
    } );

    // function initViz() {
    //     $.ajax({
    //         url: "/views/db_stats",
    //         // type: 'POST',
    //         async: false,
    //         dataType: 'json',
    //         error: function (xhr, error) {
    //             console.log("error /views/db_stats: " + xhr);
    //         },

    //         success: function (ret_data) {
    //             alert("db_stats")
    //             console.log("success of ajax getting data from python, the first time")
    //             // ret = ret_data.dict_combo
    //             // console.log(ret_data)
    //             console.log(ret)

    //             // console.log(Object.entries(ret))
    //             // console.log(Object.values(ret))
    //             // type_count_dict = {}
    //             // traces_slider = []
    //             // traces = []
    //             // for (const item of Object.entries(ret)) {
    //             //     var k = item[1]
    //             //     x_values = Object.keys(k)
    //             //     y_values = Object.values(k)
    //             //     var group_data = { x: x_values, y: y_values, stackgroup: 'one', name: item[0] }
    //             //     traces.push(group_data)
    //             // }//end of for loop creating plotting data values
    //             // console.log("traces:")
    //             // console.log(traces)
    //             // console.log(traces.length)
    //             // console.log(ret_data.steps)
    //             // var layout_slider = {
    //             // }


    //             // });
    //         }
    //     });
    // }
});