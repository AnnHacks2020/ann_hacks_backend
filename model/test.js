//$ node test.js

var room = require('./room');

function test(){
    var roomId = room.makeRoom("Kyosuke", "Natsumatsuri", 6, 100000);
    console.log("Room ID: " + roomId + " の情報を取得します");
    var myRoom = room.getRoom(roomId);
    console.log(myRoom);
    
}

test();