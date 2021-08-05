$(function ($) {
    $('#server-error-table-main-body').LoadingOverlay("show", {
        text: 'Loading Tasks Data'
    });

    var columns = [
        { title: "Select", data: "id", "width": "20px" },
        {
            title: 'Info', data: "id", "width": "40px", "fnCreatedCell": function (nTd, sData, oData, iRow, iCol) {
                if (sData != '') {
                    $(nTd).html("<button type='button' class='btn-success' >Info</button>")
                }
            }
        },
        {
            title: "Error Date", data: "error_date", "width": "70px"
        },
        { title: "QCFractal Version", data: "qcfractal_version", "width": "auto" },
        {
            title: "User", data: "user"
        },
        { title: "Request Path", data: "request_path", "width": "50px" }
    ];

    var table = $('#server_error_table').DataTable({
        // dom: 'Bfrtip',
        dom: 'b',
        dataSrc: 'JSON',
        columns: columns,
        ajax: '/views/server_error_datatable',
        columnDefs: [
            {
                targets: 0,
                checkboxes: {
                    select: true,
                    selectRow: true
                }
            }
        ],
        select: {
            style: 'multi'
        },

        initComplete: function () {
            $('#server-error-table-main-body').LoadingOverlay("hide");
        },
        // order: [[7, 'desc']],
        // dom: "<'row'<'col-sm-2'l><'col-sm-7 text-center'B><'col-sm-3'f>>" +
        //     "<'row'<'col-sm-5'i><'col-sm-7'p>>" +
        //     "<'row'<'col-sm-12'tr>>"
    });

    $('#server_error_table tbody').on('click', 'button', function () {
        var data = table.row($(this).parents('tr')).data();
        var task_details = "<p> hello" + "</p>"
        $('.modal-body').html(task_details);
        $('.modal-body').append(data.htmlresponse);
        $('#empModal').modal('show');
    });
    // }

});