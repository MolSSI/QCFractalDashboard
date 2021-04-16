// No end point yet.
$(document).ready(function () {
    $.ajax
        (
            {
                url: "/views/users_access_data",
                async: false, //to wait until data is returned
                dataType: 'json',
                error: function (xhr, error) {
                    alert("error /views/users_access_data: " + xhr);
                },
                success: function (ret) {
                    console.log("ret.DateAccessesJSON")
                    console.log(ret.DateAccessesJSON)
                    var DateAccessesjson = ret.DateAccessesJSON
                    
                    var parsed_DateAccessesJSON = JSON.parse(DateAccessesjson);
                    var DateAccessesDict = {}
                    
                    for (var i = 0; i< parsed_DateAccessesJSON.length; i++)
                    {
                        DateAccessesDict[parsed_DateAccessesJSON[i].Combined] = parsed_DateAccessesJSON[i].hits
                    }
                    

                    console.log(DateAccessesDict)

                    // var ids = ret[0].id
                    // console.log(ids)
                    var idsArray = [];
                    var accessTypeArray = []

                    var access_typeStringRepresentationSet = new Set(); //to store premitive representation of the object

                    var dateSet = new Set()
                    var hostnamesDict = {}
                    Date.shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    function short_months(dt) {
                        var d = Date.shortMonths[dt.getMonth()]
                        return d;
                    }

                    $('#users_info').DataTable({

                        ajax: {
                            url: '/views/users_access_data',
                            dataSrc: ""
                        },
                        columns: [
                            { title: "ID", data: "id" },
                            { title: "Access Type", data: "access_type" },
                            { title: "Access Date", data: "access_date" },
                            { title: "IP Address", data: "ip_address" },
                            { title: "User Agent", data: "user_agent" },
                            { title: "Geo Location", data: "country" }
                        ],
                    }); // end of datatable
                    // X-axis: date
                    // Y-axis: number of hits(accesses)
                    // Colors: for access type
                    // var x_values = ret.DateAccessesJSON
                    // console.log(x_values)
                    // console.log(typeof(x_values))
                    console.log(Object.keys(DateAccessesDict))
                    var traces = [
                        { x: Object.keys(DateAccessesDict), y:  Object.values(DateAccessesDict), stackgroup: 'one' },
                        // { x: [1, 2, 3], y: [1, 1, 2], stackgroup: 'one' },
                        // { x: [1, 2, 3], y: [3, 0, 2], stackgroup: 'one' }
                    ];

                    Plotly.newPlot('myDiv', traces, { title: 'stacked and filled line chart' });
                    // ajax call to flask
                    // loading the file would be in a flask function
                    // same way as @trial_tab.route('/views/users_access_data')
                    // might need to limit 
                }
            });


} //end of $(document).ready(function() 

);