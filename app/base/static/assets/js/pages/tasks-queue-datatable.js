$(function ($) {

  $('#task-queue-table-main-body').LoadingOverlay("show", {
    text: 'Loading Tasks Data'
  });

  var columns = [
    { title: "Select", data: "base_result", "width": "20px" },
    { title: "Result ID", data: "base_result", "width": "70px" },
    { title: "Status", data: "status", "width": "50px" },
    { title: "Manager", data: "manager" },
    { title: "Tag", data: "tag", "width": "50px" },
    { title: "Priority", data: "priority", "width": "50px" },
    { title: "Modified on", data: "modified_on", "width": "120px" },
    { title: "Created on", data: "created_on", "width": "120px" }
  ];

  var table = $('#task_queue_table').DataTable({
    buttons: [
      {
        text: 'Delete',
        className: 'btn-primary'
      },
      {
        text: 'Restart',
        className: 'btn-primary'
      }],
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
    order: [[1, 'asc']],
    dom: "<'row'<'col-sm-2'l><'col-sm-7 text-center'B><'col-sm-3'f>>" +
      "<'row'<'col-sm-5'i><'col-sm-7'p>>" +
      "<'row'<'col-sm-12'tr>>",
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
      row_ids.push(rowId);
    });

    if (selected.length != 0) {
      $.confirm({
        title: 'Restart confirmation',
        type: 'red',
        escapeKey: true,
        content: `Are you sure you want to restart ${selected.length} task(s)?`,
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
                    `${selected.length} task(s) restarted successfully.`, {
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