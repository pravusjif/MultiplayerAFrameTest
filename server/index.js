let usersListClass = require('./lib/ConnectedUsersList');

let app = require('express')();
let http = require('http').Server(app); // createServer was used before.
let io = require('socket.io')(http);

let port = 1338;
http.listen(port, () => {
  console.log(`Listening at port ${port}`);
});

let connectedUsersList = new usersListClass();

io.on('connection', (socket) => {
  let id = socket.id;

  socket.on('join', (data, callback) => {
    let otherUsers = connectedUsersList.all();
    callback(otherUsers);

    let user = {...data, id};
    connectedUsersList.add(user);

    socket.broadcast.emit('join', user);
  });

  socket.on('state', (state) => {
    if(connectedUsersList.exists(id)) {
      connectedUsersList.setState(id, state);

      socket.broadcast.emit('state', id, state);
    }
  });

  socket.on('disconnect', () => {
    connectedUsersList.remove(id);

    socket.broadcast.emit('leave', id);
  });
});
