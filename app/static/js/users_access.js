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
                    $('#users_info').DataTable({
                        ajax: {
                            url: '/views/users_access_data_table',
                            dataSrc: "",
                            dataType: 'json',
                            error: function (xhr, error) {
                                alert("error /views/table: " + xhr);
                            }
                        },
                        columns: [
                            { title: "ID", data: "id" },
                            {title: "User", data: 'user'},
                            {title: "Request Duration", data: "request_duration"},
                            { title: "Access Type", data: "access_type" },
                            { title: "Access Date", data: "access_date" },
                            { title: "IP Address", data: "ip_address" },
                            { title: "User Agent", data: "user_agent" },
                            { title: "Geo Location", data: "country" }
                        ]
                    }); // end of datatable

                    console.log("ret.DateAccessesJSON")
                    console.log(ret.DateAccessesJSON)
                    var DateAccessesjson = ret.DateAccessesJSON
                    var parsed_DateAccessesJSON = JSON.parse(DateAccessesjson);

                    var access_date_type_count = ret.access_date_type
                    console.log(access_date_type_count)
                    len = Object.keys(access_date_type_count).length
                    console.log(len)
                    var traces = [];
                    for ([key, value] of Object.entries(access_date_type_count)) {
                        // console.log(key, value);
                        console.log(key)
                        console.log("=======")
                        console.log(value)
                        var group_data = { x: value['access_date'], y: value['id'], stackgroup: 'one', name: key }
                        traces.push(group_data)

                    }// end of for loop
                    Plotly.newPlot('myDiv', traces, { title: 'Timeline for Users Accesses for Different Access Types' });

                    console.log("ret.subdivision")
                    console.log(ret.subdivision)
                    var parsed_SubDivision = JSON.parse(ret.subdivision);
                    console.log(parsed_SubDivision)
                    subdivision_dict = {}
                    parsed_SubDivision.forEach(function (d_element, index) {
                        subdivision_dict[d_element['subdivision']] = d_element['id']
                        console.log(subdivision_dict)
                    });
                    // console.log(parsed_SubDivision['subdivision'])
                    // console.log(Object.values(parsed_SubDivision['id']))

                    var trace1 = {
                        x: Object.values(subdivision_dict),
                        y: Object.keys(subdivision_dict),
                        // name: 'SF Zoo',
                        orientation: 'h',
                        marker: {
                            color: 'rgba(55,128,191,0.6)',
                            width: 1
                        },
                        type: 'bar'
                    };
                    var data = [trace1];
                    var layout = {
                        title: 'Subdivisions Histogram',
                        barmode: 'stack'
                    };
                    Plotly.newPlot('subdivisionDiv', data, layout);



                    // ajax call to flask
                    // loading the file would be in a flask function
                    // same way as @trial_tab.route('/views/users_access_data')
                    // might need to limit 
                }
            });


} //end of $(document).ready(function() 

);