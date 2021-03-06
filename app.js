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

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/", (req, res) => {
  var userID;
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
      client.query(
        "SELECT id, theme, encode(img, 'base64'), fav FROM ROOMS",
        function (err, result) {
          if (err) {
            throw err;
          }
          gallery = result.rows;
        }
      );
      // お気に入りしたroom一覧を取得
      client.query(
        "SELECT roomid FROM fav WHERE userid='" + userID + "'",
        function (err, result) {
          if (err) {
            throw err;
          }
          favs = result.rows;
          res.send({ gallery: gallery, favs: favs });
        }
      );
    }
  });
});

app.use(express.static(__dirname + "/public"));
app.use("/room", room);

app.post("/", (req, res) => {
  ret = room.makeRoom(
    req.headers.cookie.replace("1st_access=", ""),
    req.body.theme,
    req.body.due
  );
  res.send(ret);
});

app.post("/fav", (req, res) => {
  pool.connect(function (err, client) {
    if (err) {
      console.log(err);
    } else {
      var already = 0;
      client.query(
        "SELECT COUNT(*) FROM fav WHERE roomid = " +
          roomID +
          " AND userid = " +
          userID,
        function (err, result) {
          if (err) {
            throw err;
          }
          already = result.rows[0];
        }
      );
      if (already > 0) {
        client.query(
          "DELETE FROM fav WHERE roomid = " +
            roomID +
            " AND userid = " +
            userID,
          function (err, result) {
            if (err) {
              throw err;
            }
          }
        );
      } else {
        client.query(
          "INSERT INTO fav (roomid, userid) VALUES(" +
            roomID +
            ", " +
            userID +
            ")",
          function (err, result) {
            if (err) {
              throw err;
            }
          }
        );
      }
    }
  });
});

io(server);
