$(function ($) {
  // $.ajax
  //   ({
  //     url: "/views/general_stats",
  //     async: false, //to wait until data is returned, potential bug
  //     dataType: 'json',
  //     error: function (xhr, error) {
  //       alert("error /views/general_stats: " + xhr);
  //     },
  //     success: function (ret) {
  var columns = [
    { title: "ID", data: "id", "width": "70px" },
    { title: "User", data: 'user', "width": "70px" },
    // { title: "Request Duration", data: "request_duration" },
    { title: "Access Type", data: "access_type"},
    // { title: "Access Date", data: "access_date", render: $.fn.dataTable.render.moment( 'M/D/YYYY' ) },
    { title: "Access Date", data: "access_date"},

    // { title: "IP Address", data: "ip_address" },
    { title: "User Agent", data: "user_agent" },
    { title: "Geo Location", data: "country" }
  ];

  $('#users_info_table_landing').DataTable({
    ajax: {
      url: '/views/users_access_data_table',
      dataSrc: "",
      dataType: 'json',
      error: function (xhr, error) {
        console.log("error /views/users_access_data_table: " + xhr);
      }
    },
    columns: columns,
    
    dom: "<'row'<'col-sm-6'l><'col-sm-6'f>>" +
      "<'row'<'col-sm-5'i><'col-sm-7'p>>" +
      "<'row'<'col-sm-12'tr>>",
    initComplete: function () {
      $('#datatables_wrapper').LoadingOverlay("text", "Loading Users Access Data");
    },
  });// end of datatable
// UMD
(function( factory ) {
  "use strict";

  if ( typeof define === 'function' && define.amd ) {
      // AMD
      define( ['jquery'], function ( $ ) {
          return factory( $, window, document );
      } );
  }
  else if ( typeof exports === 'object' ) {
      // CommonJS
      module.exports = function (root, $) {
          if ( ! root ) {
              root = window;
          }

          if ( ! $ ) {
              $ = typeof window !== 'undefined' ?
                  require('jquery') :
                  require('jquery')( root );
          }

          return factory( $, root, root.document );
      };
  }
  else {
      // Browser
      factory( jQuery, window, document );
  }
}
(function( $, window, document ) {


$.fn.dataTable.render.moment = function ( from, to, locale ) {
  // Argument shifting
  if ( arguments.length === 1 ) {
      locale = 'en';
      to = from;
      from = 'YYYY-MM-DD';
  }
  else if ( arguments.length === 2 ) {
      locale = 'en';
  }

  return function ( d, type, row ) {
      if (! d) {
          return type === 'sort' || type === 'type' ? 0 : d;
      }

      var m = window.moment( d, from, locale, true );

      // Order and type get a number value from Moment, everything else
      // sees the rendered value
      return m.format( type === 'sort' || type === 'type' ? 'x' : to );
  };
};


}));
  // }
  // });
});