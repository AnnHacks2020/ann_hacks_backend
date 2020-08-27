const app = require('express')();
const room = require("../model/room");

// http://localhost:8124/test2/?id=121
app.get('/', function (req, res) {
    // console.log(req.query.id);
    // if(room.getRoom(req.query.id) == undefined){
    //     room.makeRoom(1, "testmember", 100, 10000000000000);
    //     console.log("made new room.");
    // }
    // room.makeRoom(0, "theme", 10000000, "base64image...", 1000);
    res.sendFile(__dirname + "/index.html");
});

module.exports = app;