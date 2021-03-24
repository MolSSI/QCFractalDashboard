// No end point yet.
$(document).ready(function () {
    $('#users_info').DataTable({
        ajax: '/views/users_access_data',
        columns: [
            { title: "Name" },
            { title: "Position" },
            { title: "Office" },
            { title: "Extn." },
            { title: "Start date" },
            { title: "Salary" }
        ]
    });
} //end of $(document).ready(function() 

);