$(document).ready(function () {
    $.ajax
        (
            {
                url: "/views/users_access_data_map",
                async: false, //to wait until data is returned
                dataType: 'json',
                error: function (xhr, error) {
                    alert("error /views/users_access_data_map: " + xhr);
                },

                success: function (ret) {
                    var map_data = JSON.parse(ret.data);
                    map_data_id = map_data['id']
                    map_data_subdivision = map_data['subdivision']
                    const keys = Object.keys(map_data_id)
                    const values_count = Object.values(map_data_id)
                    const values_subdivision = Object.values(map_data_subdivision)

                    latit = []
                    longit = []
                    bubbleSize = []
                    scale = 5;
                    minSize = 50
                    maxSize = 200
                    hoverText = []

                    for (var i = 0; i < keys.length; i++) {
                        var lat_long = keys[i]
                        lat_long_modified = String(lat_long).replace(/['"()]+/g, '')
                        lat_long_modified_split = lat_long_modified.split(",")
                        var lat_elem = parseFloat(lat_long_modified_split[0])
                        var longit_elem = parseFloat(lat_long_modified_split[1])
                        latit.push(lat_elem)
                        longit.push(longit_elem)
                        var currentVal = values_count[i]
                        var currentSize = Math.log10(currentVal) * scale
                        var subdiv_elem = values_subdivision[i]
                        if (subdiv_elem == null) {
                            var currentText = "Subdivision: " + "Unknown" + ', Count: ' + currentVal;
                        }
                        else {
                            var currentText = "Subdivision: " + values_subdivision[i] + ', Count: ' + currentVal;
                        }
                        bubbleSize.push(currentSize);
                        hoverText.push(currentText);
                    }

                    var data = [{
                        type: 'scattergeo',
                        locationmode: 'USA-states',
                        lat: latit,
                        lon: longit,
                        hoverinfo: 'text',
                        text: hoverText,
                        marker: {
                            size: bubbleSize,
                            line: {
                                color: 'black',
                                width: 2
                            },
                        }
                    }];

                    var layout = {
                        title: 'Users Access Bubble Plot',
                        // showlegend: true, 
                        geo: {
                            // scope: 'world',
                            scope: 'usa',
                            projection: {
                                type: 'albers usa'
                                // type:  'world'
                            },
                            showland: true,
                            landcolor: 'rgb(217, 217, 217)', // grey
                            subunitwidth: 1,
                            countrywidth: 1,
                            subunitcolor: 'rgb(255,255,255)',
                            countrycolor: 'rgb(255,255,255)'
                        },
                    };
                    Plotly.plot('users-access-map', data, layout, { showLink: false, showSendToCloud: true });
                }
            });
}
);
