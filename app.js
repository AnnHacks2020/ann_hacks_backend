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

app.get("/", (req, res) => {
  const now = Date.now();
  var userID;
  console.log(JSON.stringify(req.headers));
  if (req.headers.cookie == undefined) {
    res.setHeader("Set-Cookie", "1st_access=" + now + ";");
    userID = res.header.cookie;
  } else {
    userID = req.headers.cookie;
  }
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
});

app.post("/", (req, res) => {
  pool.connect(function (err, client) {
    if (err) {
      console.log(err);
    } else {
      var id = -1;
      const img = NaN;
      client.query("SELECT COUNT(*) FROM rooms", function (err, result) {
        if (err) {
          throw err;
        }
        id = result.rows[0];
      });

      client.query(
        {
          text:
            "INSERT INTO rooms(id, theme, img, due, fav) VALUES($1, $2, $3, $4, $5)",
          values: [id, req.body.theme, img, req.body.due, 0],
        },
        function (err, result) {
          if (err) {
            throw err;
          }
        }
      );
    }
  });
});

app.listen(process.env.PORT || port);
