var app = require('express')();
var server = require('http').Server(app);
var user = require("../model/user");
var io = require("./io");

// http://localhost:8124/test2/?id=121
app.get('/', function (req, res) {
    // res.sendFile(__dirname + '/test.html');
    console.log(req.query.id);
    // user = new User(req.query.id);
    // console.log(user);
    // console.log(user.userID);
    // res.send(`test2 page. userID:` + user.getInfo());
    var myUser = new user.User(1);
    console.log(myUser);
    console.log(myUser.userId);
    io(server);
    res.sendFile(__dirname + "/index.html");
});

module.exports = app;