const express = require("express");
const mysql = require("mysql");
const redis = require("redis");
const config = {
  host: "127.0.0.1",
  port: 6379,
};
//const client = redis.createClient(config);

const app = express();
const port = 3000;

// const connection = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "ekaki_app",
// });

// connection.connect((err) => {
//   if (err) {
//     console.log("error connecting: " + err.stack);
//     return;
//   }
//   console.log("success");
// });

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(process.env.PORT || port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
