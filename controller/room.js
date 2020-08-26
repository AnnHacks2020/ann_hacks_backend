var app = require('express')();

// http://localhost:8124/test2/?id=121
app.get('/', function (req, res) {
    // console.log(req.query.id);
    res.sendFile(__dirname + "/index.html");
});

module.exports = app;