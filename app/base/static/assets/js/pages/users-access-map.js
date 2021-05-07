$(function ($) {
  $('#users-access-map-main-body').LoadingOverlay("show", {
    text: 'Loading Users Access Map Data'
  });

  $.ajax({
    url: "/views/users_access_data_map",
    async: false,
    dataType: 'json',
    error: function (xhr, error) {
      alert("error /views/users_access_data_map: " + xhr);
    },
    success: function (ret) {
      var map_data = JSON.parse(ret.data);
      map_data_id = map_data['id']
      latit = []
      longit = []
      bubbleSize = []
      scale = 1;
      minSize = 50
      maxSize = 200

      const keys = Object.keys(map_data_id)
      const values = Object.values(map_data_id)

      for (var i = 0; i < keys.length; i++) {
        var lat_long = keys[i]
        lat_long_modified = String(lat_long).replace(/['"()]+/g, '')
        lat_long_modified_split = lat_long_modified.split(",")
        var lat_elem = parseFloat(lat_long_modified_split[0])
        var longit_elem = parseFloat(lat_long_modified_split[1])
        latit.push(lat_elem)
        longit.push(longit_elem)
        var currentVal = values[i]
        if (currentVal > maxSize) {
          currentVal = maxSize
        }
        else if (currentVal < minSize) {
          currentVal = minSize
        }
        var currentSize = currentVal * scale;

        bubbleSize.push(currentSize);
      }

      var data = [{
        type: 'scattergeo',
        locationmode: 'USA-states',
        lat: latit,
        lon: longit,
        marker: {
          size: bubbleSize,
          line: {
            color: 'black',
            width: 2
          },

        }
      }];

      var layout = {
        geo: {
          scope: 'usa',
          projection: {
            type: 'albers usa'
          },
          showland: true,
          landcolor: 'rgb(217, 217, 217)',
          subunitwidth: 1,
          countrywidth: 1,
          subunitcolor: 'rgb(255,255,255)',
          countrycolor: 'rgb(255,255,255)'
        },
      };
      Plotly.plot('users-access-map', data, layout, { showLink: false, showSendToCloud: true });
    },
    complete: function(){
      $('#users-access-map-main-body').LoadingOverlay("hide");
    }
  });
});