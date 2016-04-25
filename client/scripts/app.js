
var app;

$(function() {
  app = {

    server: 'https//api.parse.com/1/classes/chatterbox/',
    username: 'anonymous',

    init: function() {
      app.username = window.location.search.substr(10);
      app.fetch();
    },

    send: function() {

    },

    fetch: function() {
      $.ajax({
        url: app.server,
        type: 'GET',
        contentType: 'application/json',
        data: {
          order: '-createdAt'
        },
        success: function(data) {
          console.log(data);
        },
        error: function(reason) {
          console.log('failed to fetch data: ', reason);
        }
      });
    },

    clearMessages: function() {

    },

    addMessage: function() {

    },

    addRoom: function() {

    },

    addFriend: function() {

    },

    handleSubmit: function() {

    }
  };
});