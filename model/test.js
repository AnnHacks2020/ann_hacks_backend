//$ node test.js

var user = require('./user');

function test(){
    var myUser = new user.User(1);
    console.log(myUser);
    console.log(myUser.userId);
}

test();