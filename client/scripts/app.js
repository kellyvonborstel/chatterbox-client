
var app;

$(function() {

  app = {
    server: 'https//api.parse.com/1/classes/chatterbox/',
    username: 'anonymous',
    roomname: 'lobby',
    lastMessageId: 0,
    friends: {},

    init: function() {
      // get username
      app.username = window.location.search.substr(10);

      // cache jQuery selectors
      app.$main = $('#main');
      app.$message = $('#message');
      app.$chats = $('#chats');
      app.$roomSelect = $('#roomSelect');
      app.$send = $('#send');

      // add listeners
      app.$roomSelect.on('change', app.saveRoom);
      app.$send.on('submit', app.handleSubmit);
      app.$main.on('click', '.username', app.addFriend);

      // fetch previous messages
      app.stopSpinner();
      app.fetch(false);

      // poll for new messages
      setInterval(app.fetch, 3000);
    },

    send: function(data) {
      app.startSpinner();
      // clear message input
      app.$message.empty();

      // POST message to server
      $.ajax({
        url: app.server,
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application.json',
        success: function(data) {
          console.log('chatterbox: message sent');
          // update messages
          app.fetch();
        },
        error: function(data) {
          console.error('chatterbox: failed to send message');
        }
      });
    },

    fetch: function(animate) {
      app.startSpinner();

      $.ajax({
        url: app.server,
        type: 'GET',
        contentType: 'application/json',
        data: {
          order: '-createdAt'
        },
        success: function(data) {
          console.log('chatterbox: messages fetched');

          // return if we have no results
          if (!data.results || !data.results.length) {
            return;
          }

          // get the last message
          var mostRecentMessage = data.results[data.results.length - 1];
          var displayedRoom = $('.chat span').first().data('roomname');
          app.stopSpinner();

          // only update DOM if we have new message
          if (mostRecentMessage.objectId !== app.lastMessageId || app.roomname !== displayedRoom) {

            // update UI with fetched rooms
            app.populateRooms(data.results);

            // update UI with fetched messages
            app.populateMessages(data.results, animate);
            
            // store the ID of most recent message
            app.lastMessageId = mostRecentMessage.objectId;
          }
        },
        error: function(data) {
          console.error('chatterbox: failed to fetch messages');
        }
      });
    },

    clearMessages: function() {
      app.$chats.empty();
    },

    populateMessages: function(results) {
      app.clearMessages();
      app.stopSpinner();

      if (Array.isArray(results)) {
        // add all fetched messages
        results.forEach(app.addMessage);
      }

      // make it scroll to bottom
      var scrollTop = app.$chats.prop('scrollHeight');
      if (animate) {
        app.$chats.animate({
          scrollTop: scrollTop
        });
      } else {
        app.$chats.scrollTop(scrollTop);
      }
    },

    populateRooms: function(results) {
      app.$roomSelect.html('<option value="__newRoom">New Room...</option><option value="lobby" selected>Lobby</option>');

      if (results) {
        var rooms = {};
        results.forEach(function(data) {
          var roomname = data.roomname;
          if (roomname && !rooms[roomname]) {
            // add the room to select menu
            app.addRoom(roomname);

            // store that we already add this room
            rooms[roomname] = true;
          }
        });
      }

      // select the menu option
      app.$roomSelect.val(app.room);
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

    startSpinner: function() {
      $('.spinner img').show();
    },

    stopSpinner: function() {
      $('.spinner img').hide();
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