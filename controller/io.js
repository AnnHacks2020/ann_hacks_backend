const socketio = require('socket.io');
const room = require("../model/room");

function io(server) {
    var io = socketio.listen(server);

    var store = {};

    // スタックデータ保存用の配列
    let tagStack = [];
    // スタックデータ保存用の配列
    let pointStack = [];

    let drawlist = { points: pointStack, tags: tagStack };

    let json_drawlist = JSON.stringify(drawlist);

    io.on('connection', function (socket) {
        console.log("connection");
        socket.on('join', function (msg) {
            usrobj = {
                'room': msg.roomId,
            };
            store[msg.userId] = usrobj;
            socket.join(msg.roomId);
            room.enterRoom(msg.userId, msg.roomId, msg.ink);
            // console.log(room.enterRoom(msg.id, msg.roomid));
            // 画像を送信 
            socket.broadcast.to(store[msg.userId].room).emit('send image'/*, room.*/);  //最初の座標とタグのリスト(drawlist)とインク量
        });

        // クライアントからメッセージ受信
        // socket.on('clear send', function (msg) {
        //     // 自分以外の全員に送る
        //     // io.to(store[msg.id].room).emit('clear user'); //こちらだと自分にも送られる
        //     socket.broadcast.to(store[msg.id].room).emit('clear user');
        // });
        // クライアントからメッセージ受信
        // 確定した座標データの受け取り
        socket.on('server send base64', function (msg) {
            // 自分以外の全員に送る
            // io.to(store[msg.id].room).emit('send user', msg); //こちらだと自分にも送られる

            pointStack = pointStack.concat(msg.points);
            tagStack.push(pointStack.length);
            //socket.broadcast.emit('send user fix', { points: pointStack, tags: tagStack });
            drawlist = { points: pointStack, tags: tagStack };
            json_drawlist = JSON.stringify(drawlist);
            console.log(json_drawlist);
            drawlist = JSON.parse(json_drawlist);

            room.update(msg.roomId, msg.userId, msg.base64, json_drawlist, msg.restInk);
            socket.broadcast.to(store[msg.userId].room).emit('send user fix', drawlist);
        });
    
        // 切断 (この項目の必要性不明)
        socket.on('disconnect', function (msg) {
            console.log(msg);
            // io.to(store[msg.id].room).emit('user disconnected');
        });
    });
}
module.exports = io;