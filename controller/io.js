var socketio = require('socket.io');

function io(server) {
    var io = socketio.listen(server);

    var store = {};

    console.log(server);

    io.on('connection', function (socket) {
        console.log("connection");
        socket.on('join', function (msg) {
            usrobj = {
                'room': msg.roomid,
                'name': msg.name
            };
            store[msg.id] = usrobj;
            socket.join(msg.roomid);
            console.log(msg, usrobj);
            console.log("join!!");
        });

        // socket.on('chat message', function (msg) {
        //     io.to(store[msg.id].room).emit('chat message', msg);
        // });
        // socket.on('map message', function (msg) {
        //     io.to(store[msg.id].room).emit('map message', msg);
        // });
        socket.on('clear send', function (msg) {
            io.to(store[msg.id].room).emit('clear user');
        });
        socket.on('server send', function (msg) {
            // 自分以外の全員に送る
            io.to(store[msg.id].room).emit('send user', msg);
        });
        // socket.on('map message', function (msg) {
        //     io.to(store[msg.id].room).emit('map message', msg);
        // });
        // クライアントからメッセージ受信
        // socket.on('clear send', function () {
    
        //     // 自分以外の全員に送る
        //     socket.broadcast.emit('clear user');
        // });
    
        // // クライアントからメッセージ受信
        // socket.on('server send', function (msg) {
    
        //     // 自分以外の全員に送る
        //     socket.broadcast.emit('send user', msg);
        // });
    
        // // 切断
        // socket.on('disconnect', function () {
        //     io.sockets.emit('user disconnected');
        // });
    });
}
module.exports = io;