var roomList = new Array();
/*  roomListは，ルームオブジェクトのリストです．
    単一のルームオブジェクトは，以下を要素に持ちます．

    roomId: ルームのID, int
    hostUserId: ルーム作成者のユーザID, int
    theme: テーマの文字列, String
    maxMembers: 参加可能最大人数, int
    image: 現在のキャンバス, !!NOTICE!!画像をうまく扱える型
    fav: いいねの数, int
    member[]: maxMembers長の参加者IDリスト, int[]
    ink: メンバーID(int)とその人の残りインク量(int)を対にしたハッシュテーブル, Map()
    deadline: 期限日時，具体的には1970/1/1 0:00 からの経過ミリ秒, int

 */

const pg = require("pg");
const pool = new pg.Pool({
    host: process.env.ENV_HOST,
    database: process.env.ENV_DB,
    user: process.env.ENV_USER,
    port: 5432,
    password: process.env.ENV_PASS,
});

const MAXINK = 100000;
var inc = 0;

function newId(){
    inc++;
    return inc;
}

//makeRoom:新規テーマ部屋を作ります
//hostUserId:作成者ユーザID, theme:テーマ文字列, maxMembers:最大人数, due:期間
function makeRoom(hostUserId, theme, maxMembers, due, image, ink){
    var roomId = newId();

    //member配列の最初に作成者ユーザIDを入れておく//
    var member = new Array();
    member.push(hostUserId);

    //ハッシュテーブルinkはメンバーIDをキーとし残りインク量を返します
    var ink = new Map();
    ink.set(hostUserId, MAXINK);

    //deadlineには期日のIntが入る
    var deadline = Date.now() + due;//!NOTICE!dueの単位がミリ秒である必要があります

    pool.connect(function (err, client){
        if(err){
            console.log(err);
        }
        else{
            //roomsテーブル
            client.query("INSERT INTO rooms(due, fav, id, img, theme) VALUES (" + deadline + ", 0, " + roomId + ", " + image + ", " + theme + ")", function(err, result){
                if(err){
                    throw err;
                }
            });
            //
            //client.query();
        }
    });
    

    return roomId;
}

//getRoomListNo:ルームIDを引数とし，ルームリスト内での配列番号を返します
function getRoomListNo(roomId){
    return roomList.map(function(e) { return e.roomId; }).indexOf(roomId);
}

//getRoom:ルームIDを引数とし，ルームオブジェクトを取得します
function getRoom(roomId){
    return roomList[ getRoomListNo(roomId) ];
}

//enterRoom:ユーザID，ルームIDを引数とし，ルームメンバーにユーザ情報を追加します
function enterRoom(userId, roomId){
    var roomListNo = getRoomListNo(roomId);
    if( roomList[roomListNo].member.length < roomList[roomListNo].maxMembers ){
        roomList[roomListNo].member.push(userId);
        roomList[roomListNo].ink.set(userId, MAXINK);
        return "Admission succeeded.";
    }
    else{
        return "Admission failed: the room is full.";
    }
}

//favorRoom:指定したルームのfavをインクリメントします
//disfavorRoom:指定したルームのfavをデクリメントします
function favorRoom(roomId){
    var roomListNo = getRoomListNo(roomId);
    roomList[roomListNo].fav++;
}
function disfavorRoom(roomId){
    var roomListNo = getRoomListNo(roomId);
    roomList[roomListNo].fav--;
}

//useInk:指定したルームのメンバーのInkを減らします
//usedInkAmountはint型で，マイナス値を入力することでインク量を巻き戻します
function useInk(userId, roomId, usedInkAmount){
    var roomListNo = getRoomListNo(roomId);
    prev_amount = roomList[roomListNo].ink.get(userId);
    next_amount = prev_amount - usedInkAmount;
    roomList[roomListNo].ink.set(userId, next_amount);
    return next_amount;
}

//update():画像とインク量を更新します
function update(roomId, userId, base64Image, restInk){
    pool.connect(function (err, client){
        if(err){
            console.log(err);
        }
        else{
            //roomsテーブル
            client.query("UPDATE rooms SET img = " + base64Image + " WHERE id = " + roomId, function(err, result){
                if(err){
                    throw err;
                }
            });
            //memberテーブル
            client.query("UPDATE member SET ink = " + restInk + " WHERE roomid = " + roomId + " AND userid = " + userId, function(err, result){
                if(err){
                    throw err;
                }
            });
        }
    });
}



module.exports.makeRoom = makeRoom;
module.exports.getRoom = getRoom;
module.exports.enterRoom = enterRoom;
module.exports.favorRoom = favorRoom;
module.exports.disfavorRoom = disfavorRoom;
module.exports.useInk = useInk;
module.exports.update = update;