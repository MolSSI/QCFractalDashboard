$(function ($) {
  $('#task-queue-table-main-body').LoadingOverlay("show", {
    text: 'Loading Tasks Data'
  });

  var columns = [
    { title: "Select", data: "base_result", "width": "20px" },
    {
      title: 'Info', data: "base_result", "width": "40px", "fnCreatedCell": function (nTd, sData, oData, iRow, iCol) {
        $(nTd).html("<button type='button' class='btn-success' >Info</button>")
      }
    },
    {
      title: "Result ID", data: "base_result", "width": "70px"
    },
    { title: "Status", data: "status", "width": "auto" },
    {
      title: "Manager", data: "manager", render: function (data, type, row) {
        if (data != null) {
          var partial = data.slice(0,15) + "..."
          return partial;

        }
        else {
          return data
        }
      }
    },
    { title: "Tag", data: "tag", "width": "50px" },
    { title: "Priority", data: "priority", "width": "50px" },
    { title: "Modified on", data: "modified_on", "width": "120px" },
    { title: "Created on", data: "created_on", "width": "120px" }
  ];

  var table = $('#task_queue_table').DataTable({
    dom: 'Bfrtip',
    buttons: [
      // { // commented for now until there is an end point for the delete functionality
      //   extend: 'selected',
      //   text: 'Delete',
      //   className: 'btn-primary'
      // },
      {
        extend: 'selected',
        text: 'Restart',
        className: 'btn-primary'
      },
      'selectAll',
      'selectNone'
    ],
    language: {
      buttons: {
        selectAll: "Select All",
        selectNone: "Deselect All"
      }
    },
    columns: columns,
    ajax: '/views/tasks_queue_data',
    initComplete: function () {
      table.buttons().container()
        .appendTo('#task_queue_table_wrapper .col-md-6:eq(0)');
      table.buttons()
        .action(function (e, dt, button, config) {
          if (this.text() === 'Delete') {
            deleteAction()
          } else if (this.text() === 'Restart') {
            restartAction()
          }
          else if (this.text() === 'Select All') {
            table.rows().select();
          }
          else if (this.text() === 'Deselect All') {
            table.rows().deselect();
          }
          else if (this.title() === 'Info') {
            alert(info)
          }
        });
      $('#task-queue-table-main-body').LoadingOverlay("hide");
    },
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
    order: [[7, 'desc']],
    dom: "<'row'<'col-sm-2'l><'col-sm-7 text-center'B><'col-sm-3'f>>" +
      "<'row'<'col-sm-5'i><'col-sm-7'p>>" +
      "<'row'<'col-sm-12'tr>>",
  });
  $('#task_queue_table tbody').on('click', 'button', function () {
    var data = table.row($(this).parents('tr')).data();
    var task_details = "<p> <b>-Base Result ID:</b> " + data.base_result + "<br> <b>-Created on: </b>" + data.created_on +
      "<br> <b>-ID:</b> " + data.id + "<br> <b>-Manager:</b> " + data.manager + "<br> <b>-Modified On: </b>" + data.modified_on +
      "<br> <b>-Parser: </b>" + data.parser + "<br> <b>-Priority: </b>" + data.priority + "<br> <b>-Procedure: </b>" + data.procedure +
      "<br> <b>-Program: </b>" + data.program + "<br> <b>-Status: </b>" + data.status + "<br> <b>-Tag: </b>" + data.tag
    "</p>"
    $('.modal-body').html(task_details);
    $('.modal-body').append(data.htmlresponse);
    $('#empModal').modal('show');
  });

  function deleteAction() {
    var selected = table.column(0).checkboxes.selected();
    var row_ids = [];
    $.each(selected, function (index, rowId) {
      row_ids.push(rowId);
    });

    if (selected.length != 0) {
      $.confirm({
        title: 'Delete confirmation',
        type: 'red',
        escapeKey: true,
        content: `Are you sure you want to delete ${selected.length} task(s)?`,
        theme: 'bootstrap',
        container: '.main-body',
        closeIcon: true,
        backgroundDismiss: true,
        buttons: {
          formSubmit: {
            text: 'Submit',
            btnClass: 'btn-success',
            keys: [
              'enter'
            ],
            action: function () {
              $.ajax({
                url: '/views/tasks_queue_delete',
                type: 'POST',
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                data: JSON.stringify({ "ids": row_ids })
              })
                .done(function () {
                  $.notify(
                    `${selected.length} task(s) deleted successfully.`, {
                    clickToHide: true,
                    autoHide: true,
                    autoHideDelay: 5000,
                    arrowShow: false,
                    position: 'top center',
                    style: 'bootstrap',
                    className: 'success',
                    showAnimation: 'slideDown',
                    showDuration: 600,
                    hideAnimation: 'slideUp',
                    hideDuration: 200,
                    gap: 10
                  });
                  table.rows('.selected').remove().draw();
                })
                .fail(function () {
                  $.notify(
                    'Error occurred while removing task(s)', {
                    clickToHide: true,
                    autoHide: true,
                    autoHideDelay: 5000,
                    arrowShow: false,
                    position: 'top center',
                    style: 'bootstrap',
                    className: 'error',
                    showAnimation: 'slideDown',
                    showDuration: 800,
                    hideAnimation: 'slideUp',
                    hideDuration: 200,
                    gap: 10
                  });
                }).always(function () {
                  // FIXME:
                });
            }
          },
          Cancel: {
            btnClass: 'btn-danger'
          },
        },
        scrollToPreviousElement: false
      });
    } else {
      $.notify(
        'Select task(s) to be deleted!', {
        clickToHide: true,
        autoHide: true,
        autoHideDelay: 5000,
        arrowShow: false,
        position: 'top center',
        style: 'bootstrap',
        className: 'error',
        showAnimation: 'slideDown',
        showDuration: 800,
        hideAnimation: 'slideUp',
        hideDuration: 200,
        gap: 10
      });
    }
  }


  function restartAction() {
    var selected = table.column(0).checkboxes.selected();
    var row_ids = [];
    $.each(selected, function (index, rowId) {
      var status_ = table.rows({ selected: true }).data()[index].status
      if (status_ != 'WAITING') {
        row_ids.push(rowId);
      }
    });
    if (selected.length != 0) { // this check will not be needed if the buttons are enabled only upon selection
      $.confirm({
        title: 'Restart confirmation',
        type: 'red',
        escapeKey: true,
        content: `Are you sure you want to restart ${row_ids.length} task(s)? Only Tasks of Running or Error status can be restarted.`,
        theme: 'bootstrap',
        container: '.main-body',
        closeIcon: true,
        backgroundDismiss: true,
        buttons: {
          formSubmit: {
            text: 'Submit',
            btnClass: 'btn-success',
            keys: [
              'enter'
            ],
            action: function () {
              $.ajax({
                url: '/views/tasks_queue_restart',
                type: 'POST',
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                data: JSON.stringify({ "ids": row_ids })
              })
                .done(function () {
                  $.notify(
                    `${row_ids.length} task(s) restarted successfully.`, {
                    clickToHide: true,
                    autoHide: true,
                    autoHideDelay: 5000,
                    arrowShow: false,
                    position: 'top center',
                    style: 'bootstrap',
                    className: 'success',
                    showAnimation: 'slideDown',
                    showDuration: 600,
                    hideAnimation: 'slideUp',
                    hideDuration: 200,
                    gap: 10
                  });

                  table.ajax.reload();
                  // table.rows('.selected').remove().draw();
                })
                .fail(function () {
                  $.notify(
                    'Error occurred while removing task(s)', {
                    clickToHide: true,
                    autoHide: true,
                    autoHideDelay: 5000,
                    arrowShow: false,
                    position: 'top center',
                    style: 'bootstrap',
                    className: 'error',
                    showAnimation: 'slideDown',
                    showDuration: 800,
                    hideAnimation: 'slideUp',
                    hideDuration: 200,
                    gap: 10
                  });
                }).always(function () {
                  // FIXME:
                });
            }
          },
          Cancel: {
            btnClass: 'btn-danger'
          },
        },
        scrollToPreviousElement: false
      });
    } else {
      $.notify(
        'Select task(s) to be restarted!', {
        clickToHide: true,
        autoHide: true,
        autoHideDelay: 5000,
        arrowShow: false,
        position: 'top center',
        style: 'bootstrap',
        className: 'error',
        showAnimation: 'slideDown',
        showDuration: 800,
        hideAnimation: 'slideUp',
        hideDuration: 200,
        gap: 10
      });
    }
  }
});