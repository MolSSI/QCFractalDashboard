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
    }); // end of datatable

    var plotDiv = document.getElementById('plot');
    var traces = [
        { x: [1, 2, 3], y: [2, 1, 4], stackgroup: 'one' },
        { x: [1, 2, 3], y: [1, 1, 2], stackgroup: 'one' },
        { x: [1, 2, 3], y: [3, 0, 2], stackgroup: 'one' }
    ];

    Plotly.newPlot('myDiv', traces, { title: 'stacked and filled line chart' });
// ajax call to flask
// loading the file would be in a flask function
// same way as @trial_tab.route('/views/users_access_data')
// might need to limit 

} //end of $(document).ready(function() 

);