const express = require("express");
const pg = require("pg");
const pool = new pg.Pool({
  host: process.env.ENV_HOST,
  databese: process.env.ENV_DB,
  user: process.env.ENV_USER,
  port: process.env.ENV_PORT,
  password: process.env.ENV_PASS,
});

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  pool.connect(function (err, client) {
    if (err) {
      console.log(err);
    } else {
      client.query("SELECT theme FROM ROOMS", function (err, result) {
        if (err) {
          throw err;
        }
        res.render("index", {
          title: "Express",
          datas: result.rows[0].theme,
        });
        console.log(result);
      });
    }
  });
});

app.listen(process.env.ENV_PORT || 3000);
