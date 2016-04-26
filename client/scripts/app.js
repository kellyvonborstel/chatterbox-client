
var app;

$(function() {
  app = {

    server: 'https//api.parse.com/1/classes/chatterbox/',
    username: 'anonymous',
    room: 'lobby',

    init: function() {
      app.username = window.location.search.substr(10);

      app.$main = $('#main');
      app.$message = $('#message');
      app.$chats = $('#chats');
      app.$roomSelect = $('#roomSelect');
      app.$send = $('#send');

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
          app.populateRooms(data.results);
          app.populateMessages(data.results);
        },
        error: function(reason) {
          console.log('failed to fetch data: ', reason);
        }
      });
    },

    populateRooms: function(results) {
      app.$roomSelect.html('<option value="__newRoom">New Room...</option><option value="lobby" selected>Lobby</option>');
      if (results) {
        var processsedRooms = {};
        results.forEach(function(data) {
          var roomname = data.roomname;
          if (roomname && !processedRooms[roomname]) {
            app.addRoom(roomname);
            processedRooms[roomname] = true;
          }
        });
      }
      app.$roomSelect.val(app.room);
    },

    populateMessages: function(results) {
      app.clearMessages();
      if (Array.isArray(results)) {
        results.forEach(app.addMessage);
      }
    },

    clearMessages: function() {
      app.$chats.empty();
    },

    addMessage: function(data) {
      if (!data.roomname) {
        data.roomname = 'lobby';
        if (data.roomname === app.room) {
          var $chat = $('<div class="chat" />')
            .attr('data-username', data.username)
            .attr('data-roomname', data.roomname)
            .appendTo($chat);
          var $message = $('<br><span />');
          $message.text('data.text')
            .appendTo($chat);
          app.$chats.append($chat);
        }
      }
    },

    addRoom: function(roomname) {
      var $option = $('<option />').val(roomname).text(roomname);
      app.$roomSelect.append($option);
    },

    addFriend: function() {

    },

    handleSubmit: function() {

    }
  };
});