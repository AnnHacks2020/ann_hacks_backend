const express = require('express');
const app = express();

app.get('/', function (req, res) {
    res.sendFile("/index.html", {root: './public'});
});

module.exports = app;