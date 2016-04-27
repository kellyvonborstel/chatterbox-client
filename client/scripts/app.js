var app;

$(function() {
  app = {
    server: 'https://api.parse.com/1/classes/chatterbox/',
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
      app.$main.on('click', '.username', app.addFriend);
      app.$send.on('submit', app.handleSubmit);
      app.$roomSelect.on('change', app.saveRoom);

      // fetch previous messages
      app.startSpinner();
      app.fetch(false);

      // poll for new messages
      setInterval(app.fetch, 3000);
    },

    send: function(data) {
      app.startSpinner();

      // clear messages input
      app.$message.val('');

      $.ajax({
        url: app.server,
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (data) {
          console.log('chatterbox: Message sent');
          // fetch to update messages; pass true to animate
          app.fetch();
        },
        error: function (data) {
          console.error('chatterbox: Failed to send message');
        }
      });
    },

    fetch: function(animate) {
      $.ajax({
        url: app.server,
        type: 'GET',
        contentType: 'application/json',
        data: { order: '-createdAt'},
        success: function(data) {
          console.log('chatterbox: Messages fetched');

          // return if no results
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

            // store ID of most recent message
            app.lastMessageId = mostRecentMessage.objectId;
          }
        },
        error: function(data) {
          console.error('chatterbox: Failed to fetch messages');
        }
      });
    },

    clearMessages: function() {
      app.$chats.html('');
    },

    populateMessages: function(results, animate) {
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
      }
      else {
        app.$chats.scrollTop(scrollTop);
      }
    },

    populateRooms: function(results) {
      app.$roomSelect.html('<option value="__newRoom">New room...</option><option value="" selected>lobby</option>');

      if (results) {
        var rooms = {};
        results.forEach(function(data) {
          var roomname = data.roomname;
          if (roomname && !rooms[roomname]) {
            // add room to select menu
            app.addRoom(roomname);
            // store that we've already added this room
            rooms[roomname] = true;
          }
        });
      }

      // select the menu option
      app.$roomSelect.val(app.roomname);
    },

    addRoom: function(roomname) {
      // prevent XSS by escaping with DOM methods
      var $option = $('<option/>').val(roomname).text(roomname);

      // add to select
      app.$roomSelect.append($option);
    },

    addMessage: function(data) {
      if (!data.roomname)
        data.roomname = 'lobby';

      // only add messages that are in current room
      if (data.roomname === app.roomname) {
        // create div to hold chats
        var $chat = $('<div class="chat"/>');

        // add message data using DOM methods to prevent XSS
        // store the username in element's data
        var $username = $('<span class="username"/>');
        $username.text(data.username + ': ')
          .attr('data-username', data.username)
          .attr('data-roomname',data.roomname)
          .appendTo($chat);

        // add friend class
        if (app.friends[data.username] === true)
          $username.addClass('friend');

        // add the message to UI
        var $message = $('<br><span/>');
        $message.text(data.text).appendTo($chat);
        app.$chats.append($chat);
      }
    },

    addFriend: function(event) {
      var username = $(event.currentTarget).attr('data-username');

      if (username !== undefined) {
        console.log('chatterbox: Adding %s as a friend', username);

        // store as a friend
        app.friends[username] = true;

        // escape the username in case it contains a quote
        var selector = '[data-username="'+username.replace(/"/g, '\\\"')+'"]';
        // bold all previous messages
        var $usernames = $(selector).addClass('friend');
      }
    },

    saveRoom: function() {
      var selectIndex = app.$roomSelect.prop('selectedIndex');
      // new room is always the first option
      if (selectIndex === 0) {
        var roomname = prompt('Enter room name');
        if (roomname) {
          // set as current room
          app.roomname = roomname;
          // add room to menu
          app.addRoom(roomname);
          // select menu option
          app.$roomSelect.val(roomname);
          // fetch messages again
          app.fetch();
        }
      } else {
        app.startSpinner();
        // store as undefined for empty names
        app.roomname = app.$roomSelect.val();
        // fetch messages again
        app.fetch();
      }
    },

    handleSubmit: function(event) {
      var message = {
        username: app.username,
        text: app.$message.val(),
        roomname: app.roomname || 'lobby'
      };

      app.send(message);

      // stop form from submitting
      event.preventDefault();
    },
    
    startSpinner: function() {
      $('.spinner img').show();
      $('form input[type=submit]').attr('disabled', "true");
    },

    stopSpinner: function() {
      $('.spinner img').fadeOut('fast');
      $('form input[type=submit]').attr('disabled', null);
    }
  };
}());
