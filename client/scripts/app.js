
var app;

$(function() {
  app = {

    server: 'https//api.parse.com/1/classes/chatterbox/',
    username: 'anonymous',
    room: 'lobby',
    friends: {},

    init: function() {
      app.username = window.location.search.substr(10);

      app.$main = $('#main');
      app.$message = $('#message');
      app.$chats = $('#chats');
      app.$roomSelect = $('#roomSelect');
      app.$send = $('#send');

      app.$roomSelect.on('change', app.saveRoom);
      app.$send.on('submit', app.handleSubmit);
      app.$main.on('click', '.username', app.addFriend);

      app.stopSpinner();
      app.fetch();

      setInterval(app.fetch, 3000);
    },

    saveRoom: function(event) {
      var selectedIndex = app.$roomSelect.prop('selectedIndex');

      if (selectedIndex === 0) {
        var roomname = prompt('Enter a room name');
        if (roomname) {
          app.room = roomname;
          app.addRoom(roomname);
          app.$roomSelect.val(roomname);
          app.fetch();
        }
      } else {
        app.room = app.$roomSelect.val();
        app.fetch();
      }
    },

    send: function(data) {
      app.startSpinner();

      $.ajax({
        url: app.server,
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application.json',
        success: function(result) {
          app.fetch();
        },
        error: function(reason) {
          console.error('Failed to send data: ', reason);
        },
        complete: function() {
          app.stopSpinner();
        }
      });
    },

    fetch: function() {
      app.startSpinner();

      $.ajax({
        url: app.server,
        type: 'GET',
        contentType: 'application/json',
        data: {
          order: '-createdAt'
        },
        complete: function() {
          app.stopSpinner();
        },
        success: function(data) {
          app.populateRooms(data.results);
          app.populateMessages(data.results);
        },
        error: function(reason) {
          console.error('failed to fetch data: ', reason);
        }
      });
    },

    startSpinner: function() {
      $('.spinner img').show();
    },

    stopSpinner: function() {
      $('.spinner img').hide();
    },

    populateRooms: function(results) {
      app.$roomSelect.html('<option value="__newRoom">New Room...</option><option value="lobby" selected>Lobby</option>');

      if (results) {
        var processsedRooms = {};
        if (app.room !== 'lobby') {
          app.addRoom(app.room);
          processedRooms[app.room] = true;
        }
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

          if (app.friends[data.username] === true) {
            $username.addClass('.friend');
          }

          var $message = $('<br><span />');

          $message.text('data.text').appendTo($chat);
          app.$chats.append($chat);
        }
      }
    },

    addRoom: function(roomname) {
      var $option = $('<option />').val(roomname).text(roomname);

      app.$roomSelect.append($option);
    },

    addFriend: function(event) {
      var username = $(event.currentTarget).attr('data-username');

      if (username !== undefined) {
        console.log('chatbox: adding %s as a friend', username);
        app.friends[username] = true;

        var selector = '[data-username="' + username.replace(/"/g, '\\\"') + '"]';
        $(selector).addClass('friend');
      }
    },

    handleSubmit: function(event) {
      event.preventDefault();

      var message = {
        username: app.username,
        roomname: app.room || 'lobby',
        text: app.$message.val()
      };
      app.send(message);
    }
  };
});