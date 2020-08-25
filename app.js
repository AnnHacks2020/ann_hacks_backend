const express = require("express");
const pg = require("pg");
const pool = new pg.Pool({
  host: process.env.ENV_HOST,
  databese: "ddsip3ad8jodbv",
  user: "eljuqgwscxejta",
  port: 5432,
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

console.log(process.env.ENV_DB, process.env.ENV_USER);
app.listen(process.env.PORT || 3000);
