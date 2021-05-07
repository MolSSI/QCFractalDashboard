$(function() {
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

    var columns = [
      { title: "Base result ID", data: "base_result" },
      { title: "Status", data: "status" },
      { title: "Manager", data: "manager" },
      { title: "Tag", data: "tag" },
      { title: "Priority", data: "priority" },
      { title: "Modified_on", data: "modified_on" },
      { title: "Created_on", data: "created_on" }
    ];

    var table = $('#task_queue_table').DataTable({
      orderCellsTop: true,
      fixedHeader: true,
      ajax: '/views/tasks_queue_data',
      columns: columns,
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
          extend: 'selected',
          text: 'Delete',
          className: 'deleteButton',
          // name: 'delete',     // do not change name
          action: function () {
            var count = table.rows({ selected: true }).count();
            var base_result_ids = []
            for (i = 0; i < count; i++) {
              var data_ = table.rows({ selected: true }).data()[i].base_result;
              base_result_ids.push(data_)
            }
            var base_result_ids_json = { 'ids': base_result_ids }
            console.log(base_result_ids_json)
            $.ajax({
              url: '/views/tasks_queue_delete',
              type: 'POST',
              dataType: 'json',
              data: JSON.stringify(base_result_ids_json),
              contentType: "application/json; charset=utf-8",
              error: function (xhr, error) {
                alert("error /views/tasks_queue_delete: " + xhr);
              },
              success: function (response) {
                alert(response.deleted + " Task(s) Deleted ")
                table.rows({ selected: true })
                  .remove()
                  .draw();

              }
            })
          }
        },
        {
          extend: 'selected',
          text: 'Restart',
          action: function () {
            var count = table.rows({ selected: true }).count();
            var base_result_ids = []
            for (i = 0; i < count; i++) {
              var data_ = table.rows({ selected: true }).data()[i].base_result;
              base_result_ids.push(data_)
            }
            var base_result_ids_json = { 'ids': base_result_ids }

            $.ajax({
              url: '/views/tasks_queue_restart',
              type: 'POST',
              dataType: 'json',
              data: JSON.stringify(base_result_ids_json),
              contentType: "application/json; charset=utf-8",
              error: function (xhr, error) {
                alert("error /views/tasks_queue_restart: " + xhr);
              },
              success: function (response) {
                alert(response.number_of_updated + " Task(s) Restarted ")
                table.ajax.reload();
              }
            })
          }
        }
      ],
    });
});