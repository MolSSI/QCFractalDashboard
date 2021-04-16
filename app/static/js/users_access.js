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
                                    { title: "Access Type", data:"access_type" },
                                    { title: "Access Date", data: "access_date" },
                                    { title: "IP Address", data: "ip_address" },
                                    { title: "User Agent", data: "user_agent" },
                                    { title: "Geo Location", data: "country" }
                                ]
                            
                        // }
                    }); // end of datatable

                    console.log("ret.DateAccessesJSON")
                    console.log(ret.DateAccessesJSON)
                    var DateAccessesjson = ret.DateAccessesJSON
                    var parsed_DateAccessesJSON = JSON.parse(DateAccessesjson);
                    var parsed_ret = JSON.parse(ret.all_fields);

                    var molecule_1_dict = {}
                    var molecule_2_dict = {}
                    var molecule_3_dict = {}
                    var molecule_4_dict = {}
                    for (var i = 0; i < parsed_DateAccessesJSON.length; i++) {
                        console.log(typeof(parsed_DateAccessesJSON[i].Combined))

                        if (parsed_DateAccessesJSON[i].access_type == 'molecule_1') {
                            molecule_1_dict[parsed_DateAccessesJSON[i].Combined] = parsed_DateAccessesJSON[i].hits
                        }
                        else if (parsed_DateAccessesJSON[i].access_type == 'molecule_2') {
                            molecule_2_dict[parsed_DateAccessesJSON[i].Combined] = parsed_DateAccessesJSON[i].hits

                        }
                        else if (parsed_DateAccessesJSON[i].access_type == 'molecule_3') {
                            molecule_3_dict[parsed_DateAccessesJSON[i].Combined] = parsed_DateAccessesJSON[i].hits

                        }
                        else if (parsed_DateAccessesJSON[i].access_type == 'molecule_4') {
                            molecule_4_dict[parsed_DateAccessesJSON[i].Combined] = parsed_DateAccessesJSON[i].hits

                        }
                    }

                    console.log(molecule_2_dict)
                    console.log(ret)
                    console.log(parsed_ret)

                    Date.shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    function short_months(dt) {
                        var d = Date.shortMonths[dt.getMonth()]
                        return d;
                    }
                    // X-axis: date
                    // Y-axis: number of hits(accesses)
                    // Colors: for access type

                    console.log(molecule_1_dict)
                    console.log(Object.keys(molecule_1_dict))
                    console.log(Object.values(molecule_1_dict))
                    var traces = [
                        { x: Object.keys(molecule_1_dict), y: Object.values(molecule_1_dict), stackgroup: 'one', name: 'molecule_1' },
                        { x: Object.keys(molecule_2_dict), y: Object.values(molecule_2_dict), stackgroup: 'one', name:'molecule_2' },
                        { x: Object.keys(molecule_3_dict), y: Object.values(molecule_3_dict), stackgroup: 'one', name:'molecule_3' },
                        { x: Object.keys(molecule_4_dict), y: Object.values(molecule_4_dict), stackgroup: 'one', name:'molecule_4' }
                    ];
                    Plotly.newPlot('myDiv', traces, { title: 'Timeline for Users Accesses for Different Access Types' });

                    // ajax call to flask
                    // loading the file would be in a flask function
                    // same way as @trial_tab.route('/views/users_access_data')
                    // might need to limit 
                }
            });


} //end of $(document).ready(function() 

);