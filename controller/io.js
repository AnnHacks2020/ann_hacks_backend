var socketio = require('socket.io');

function io(server) {
    var io = socketio.listen(server);

    var store = {};

    io.on('connection', function (socket) {
        console.log("connection");
        socket.on('join', function (msg) {
            usrobj = {
                'room': msg.roomid,
                'name': msg.name
            };
            store[msg.id] = usrobj;
            socket.join(msg.roomid);
        });

        // クライアントからメッセージ受信
        socket.on('clear send', function (msg) {
            // 自分以外の全員に送る
            // io.to(store[msg.id].room).emit('clear user'); //こちらだと自分にも送られる
            socket.broadcast.to(store[msg.id].room).emit('clear user');
        });
        // クライアントからメッセージ受信
        socket.on('server send', function (msg) {
            // 自分以外の全員に送る
            // io.to(store[msg.id].room).emit('send user', msg); //こちらだと自分にも送られる
            socket.broadcast.to(store[msg.id].room).emit('send user', msg);
        });
    
        // 切断 (この項目の必要性不明)
        socket.on('disconnect', function (msg) {
            console.log(msg);
            // io.to(store[msg.id].room).emit('user disconnected');
        });
    });
}
module.exports = io;