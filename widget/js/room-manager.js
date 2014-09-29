/**
 * @file room-manager.js
 * @version 0.0.1
 * 
 * @copyright 2014 CoNWeT Lab., Universidad Politécnica de Madrid
 * @license Apache v2 (https://github.com/Wirecloud/room-manager-widget/blob/master/LICENSE)
 */


var RoomManager = function () {
  var button = document.getElementById('refresh'),
      form   = document.getElementById('create-room');

  this.url    = 'ws://130.206.81.33:8080/groupcall/ws/websocket';
  this.client = new RpcBuilder.clients.JsonRpcClient(this.url,
    this.onRequest.bind(this), this.onOpen.bind(this));

  this.username    = MashupPlatform.context.get('username');
  this.rooms       = [];
  this.active_room = '';

  button.addEventListener('click', this.onRefresh.bind(this), true);
  form.addEventListener('submit', this.onCreate.bind(this), true);

  MashupPlatform.wiring.registerCallback('participant', this.onParticipantChange.bind(this));
};

RoomManager.prototype.constructor = RoomManager;

RoomManager.prototype.create = function (name) {
  this.client.sendRequest('addRoom', {room_name : name},
    function (error) {
      if (error) {
        console.log(error);
      }
      else {
        this.list();
      }
    }.bind(this)
  );
};

RoomManager.prototype.list = function () {
  this.client.sendRequest('getRooms', {},
    function(error, result) {
      var button = document.getElementById('refresh').querySelector('.fa');

      if (error) {
        console.error('Could not retrieve rooms from server');
      } else {
        this.rooms = result.value;
        this.refresh();
      }

      button.className = 'fa fa-refresh';

    }.bind(this)
  );
};
  
RoomManager.prototype.onCreate = function (event) {
  var name = document.getElementById('name'),
      re   = new RegExp(/^[\w-]{3,}$/);

  if (name.value !== '' && re.test(name.value)) {
    this.create(name.value);
  }

  name.value = '';

  event.preventDefault();
  event.stopPropagation();

};

RoomManager.prototype.onJoin = function (event) {
  var a          = event.currentTarget,
      collection = a.parentNode.querySelectorAll('.list-group-item');

  for (var i = 0; i < collection.length; i++) {
    collection[i].className = 'list-group-item';
  }

  this.active_room = a.id;
  a.className = 'list-group-item active';

  event.preventDefault();
  event.stopPropagation();

  MashupPlatform.wiring.pushEvent('join_room', this.username + ' ' + a.id);

};

RoomManager.prototype.onOpen = function () {
  this.list();
};

RoomManager.prototype.onParticipantChange = function () {
  this.list();
};

RoomManager.prototype.onRefresh = function (event) {
  var button = event.currentTarget;

  button.querySelector('.fa').className = 'fa fa-refresh fa-spin';
  this.list();

  event.preventDefault();
  event.stopPropagation();
};

RoomManager.prototype.onRequest = function (response) {
  switch (response.method) {
    case 'newParticipantArrived':
      onNewParticipant(response);
      break;
    case 'participantLeft':
      onParticipantLeft(response);
      break;
    default:
      console.error('Error! Unrecognized request.');
  }
};

RoomManager.prototype.refresh = function () {
  var body = document.querySelector('.list-group');
 
  body.innerHTML = '';

  if (!this.rooms.length) {
    var message = 'Chat rooms not found, you can create one above.',
        div = body.appendChild(document.createElement('div'));

    div.className = 'alert alert-info';
    div.innerHTML = '<span class="fa fa-info-circle"></span> ' + message;

    return this;
  }

  for (var i = 0; i < this.rooms.length; i += 2) {
    var room = body.appendChild(document.createElement('a'));

    room.id = this.rooms[i];
    room.href = '';
    if (this.active_room && this.active_room === this.rooms[i]) {
      room.className = 'list-group-item active';
    }
    else {
      room.className = 'list-group-item';
    }
    room.innerHTML = '<span class="fa fa-group fa-fw"></span>&nbsp; ' + this.rooms[i] +
                     '<span class="badge pull-right">' + this.rooms[i+1] + '</span>';
    room.addEventListener('click', this.onJoin.bind(this), true);
  }
};
