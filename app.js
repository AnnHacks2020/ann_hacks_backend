const http = require("http");
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
const server = app.listen(process.env.PORT || port);

app.get("/", (req, res) => {
  if (req.headers.cookie == undefined) {
    const now = Date.now();
    res.setHeader("Set-Cookie", "1st_access=" + now + ";");
    userID = now;
    pool.connect(function (err, client) {
      if (err) {
        console.log(err);
      } else {
        client.query(
          {
            text: "INSERT INTO users(id) VALUES($1)",
            values: [userID],
          },
          function (err, result) {
            if (err) {
              throw err;
            }
          }
        );
      }
    });
  } else {
    userID = req.headers.cookie.replace("1st_access=", "");
  }

  pool.connect(function (err, client) {
    if (err) {
      console.log(err);
    } else {
      var gallery;
      var favs;
      client.query("SELECT theme, img, fav FROM ROOMS", function (err, result) {
        if (err) {
          throw err;
        }
        gallery = result.rows;
      });
      client.query("SELECT roomid FROM fav WHERE userid=" + userID, function (
        err,
        result
      ) {
        if (err) {
          throw err;
        }
        favs = result.rows;
        res.send({ gallery: gallery, favs: favs });
      });
    }
  });
});

app.use("/room", room);

app.post("/", (req, res) => {
  ret = room.makeRoom(
    req.headers.cookie.replace("1st_access=", ""),
    req.body.theme,
    req.body.due
  );
  room.enterRoom(req.headers.cookie.replace("1st_access=", ""), ret);
  res.send(ret);
});

io(server);
