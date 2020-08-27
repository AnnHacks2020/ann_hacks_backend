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
const io = require("./controller/io");

// const server = require('http').Server(app);
const server = app.listen(process.env.PORT || port);

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
  res.send("<button onclick=\"location.href='./room'\">room</button>");
//   res.sendFile(__dirname + "/controller/index.html");
});

app.use("/room", room)

console.log(process.env.ENV_DB, process.env.ENV_USER);
// var server = app.listen(process.env.PORT || port);
io(server);
// server.listen(process.env.PORT || port);
