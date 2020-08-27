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

app.get("/", (req, res) => {
  console.log(JSON.stringify(req.headers));
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
            res.send(result.rows[0]);
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
      client.query("SELECT theme FROM ROOMS", function (err, result) {
        if (err) {
          throw err;
        }
        res.send("Welcome " + userID + result.rows[0].theme);
      });
    }
  });
});

app.post("/", (req, res) => {
  ret = room.makeRoom(
    req.headers.cookie.replace("1st_access=", ""),
    req.body.theme,
    req.body.due
  );
  room.enterRoom(req.headers.cookie.replace("1st_access=", ""), ret);
  res.send(ret);
});

app.listen(process.env.PORT || port);
