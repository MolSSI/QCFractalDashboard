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
        },
        initComplete: function () {
            $('#datatables_wrapper').LoadingOverlay("text", "Loading Users Access Plots Data");
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
});