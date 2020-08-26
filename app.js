const express = require("express");
const pg = require("pg");
const pool = new pg.Pool({
  host: process.env.ENV_HOST,
  database: process.env.ENV_DB,
  user: process.env.ENV_USER,
  port: 5432,
  password: process.env.ENV_PASS,
});

const app = express();
const port = 3000;

const room = require("./controller/room");
// var socketio = require('socket.io');
const io = require("./controller/io");

// var server = require('http').Server(app);
var server = app.listen(process.env.PORT || port);

app.get("/", (req, res) => {
  // pool.connect(function (err, client) {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     client.query("SELECT theme FROM ROOMS", function (err, result) {
  //       if (err) {
  //         throw err;
  //       }
  //       res.send(result.rows[0].theme);
  //     });
  //   }
  // });
  // res.send("Hello World");

//   var io = socketio.listen(server);

  var store = {};

  // console.log(io);
//   var server = require('http').Server(app);

//   io.on('connection', function (socket) {
//       console.log("connection");
//       socket.on('join', function (msg) {
//           usrobj = {
//               'room': msg.roomid,
//               'name': msg.name
//           };
//           store[msg.id] = usrobj;
//           socket.join(msg.roomid);
//       });

//       socket.on('chat message', function (msg) {
//           io.to(store[msg.id].room).emit('chat message', msg);
//       });
//       socket.on('map message', function (msg) {
//           io.to(store[msg.id].room).emit('map message', msg);
//       });
//   });
  res.sendFile(__dirname + "/controller/index.html");
//   io(server);

});

app.use("/room", room)

console.log(process.env.ENV_DB, process.env.ENV_USER);
// var server = app.listen(process.env.PORT || port);
io(server);
// server.listen(process.env.PORT || port);
