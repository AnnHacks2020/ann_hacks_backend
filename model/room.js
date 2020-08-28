/************************************************************************************* */
////var roomList = new Array();
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
/************************************************************************************* */

const pg = require("pg");
const { use } = require("../controller/room");
const pool = new pg.Pool({
  host: process.env.ENV_HOST,
  database: process.env.ENV_DB,
  user: process.env.ENV_USER,
  port: 5432,
  password: process.env.ENV_PASS,
});

function newId() {
  pool.connect(function (err, client) {
    if (err) {
      console.log(err);
    } else {
      client.query("SELECT COUNT(*) FROM rooms", function (err, result) {
        if (err) {
          throw err;
        }
        id = result.rows[0];
      });
    }
  });
  return id + 1;
}

const MAXINK = 5000;
//makeRoom():新規テーマ部屋を作ります，DBのroomsとmemberを更新します，ルームIDを返します
//hostUserId:作成者ユーザID, theme:テーマ文字列, due:期間
//！！一時的に最大メンバー数を考慮していません！！
function makeRoom(hostUserId, theme, due) {
  var roomId = newId();

  //deadlineには期日のIntが入る
  var deadline = Date.now() + due; //!NOTICE!dueの単位がミリ秒である必要があります
  //注意：データベースのdueには期間ではなく期日が入ります！！

  pool.connect(function (err, client) {
    if (err) {
      console.log(err);
    } else {
      //templateテーブルから白紙画像のBase64を取得
      client.query("SELECT img FROM template", function(err, result){
        if(err){
          throw err;
        }
        base64Image = result.rows[0];
      });
      //roomsテーブル
      client.query(
        "INSERT INTO rooms(due, fav, id, img, theme) VALUES (" +
          deadline +
          ", 0, " +
          roomId +
          ", " +
          base64Image +
          ", '" +
          theme +
          "')",
        function (err, result) {
          if (err) {
            throw err;
          }
        }
      );
      //memberテーブル
      client.query(
        "INSERT INTO member(ink, roomid, userid) VALUES (" +
          MAXINK +
          ", " +
          roomId +
          ", '" +
          hostUserId +
          "')",
        function (err, result) {
          if (err) {
            throw err;
          }
        }
      );
    }
  });

  return roomId;
}

/***************************************************************************************
//getRoomListNo:ルームIDを引数とし，ルームリスト内での配列番号を返します
function getRoomListNo(roomId){
    return roomList.map(function(e) { return e.roomId; }).indexOf(roomId);
}

//getRoom:ルームIDを引数とし，ルームオブジェクトを取得します
function getRoom(roomId){
    return roomList[ getRoomListNo(roomId) ];
}
*****************************************************************************************/

//冗長性を図るため，ルームのdrawlistを取得するだけの関数を用意しました
function getDrawlist(roomId){
  pool.connect(function(err, client){
    if(err){
      console.log(err);
    }else{
      client.query("SELECT drawlist FROM rooms WHERE id = " + roomId, function(err, result){
        if(err){
          throw err;
        }
        return result.rows[0];
      })
    }
  })
}


//enterRoom():joinしたメンバー情報でDB:memberを更新します
//！！一時的に最大メンバー数を考慮していません！！
function enterRoom(userId, roomId) {
    console.log("enterRoom :" + userId + " " + roomId);
  pool.connect(function (err, client) {
    if (err) {
      console.log(err);
    } else {

      //過去に入室したことがあるかどうかを調べます，具体的には
      //指定したルームにいる人全員のユーザIDを取得して，引数のものと一致するものがあるか調べます
      var user_in_this_room;
      client.query("SELECT userid FROM member WHERE roomid = " + roomId, function (err, result) {
        if (err) {
          throw err;
        }
        console.log("result:" + result);
        console.log("result.rows:" + result.rows);
        user_in_this_room = result.rows.userId.indexOf(userId);
        //過去の入室がなければ(はじめて来たならば)user_in_this_roomに-1が入ります
      });

      console.log("user_in_this_room:" + user_in_this_room);
      //user_in_this_roomに-1が入っていたら，memberに新しい列をINSERTし，drawlistとインク量を返します
      if(user_in_this_room === -1){
        client.query(
          "INSERT INTO member(ink, roomid, userid) VALUES (" +
            MAXINK +
            ", " +
            roomId +
            ", '" +
            userId +
            "')",
          function (err, result) {
            if (err) {
              throw err;
            }
          }
        );
        console.log("new room:" + getDrawlist(roomId));
        return {
          drawlist: getDrawlist(roomId), 
          ink: MAXINK
        };
      }
      else{//過去に入室があれば，memberから該当の列を引っ張り出し，drawlistとインク量を返します
        var restInk;
        client.query("SELECT ink FROM member WHERE roomid = " + roomId + " AND userid = '" + userId + "'", function (err, result) {
          if (err) {
            throw err;
          }
          restInk = result.rows[0];
        });
        console.log("existed room:" + getDrawlist(roomId));
        return {
          drawlist: getDrawlist(roomId),
          ink: restInk
        };
      }


    }
  });
}

/****************************************************************************************
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
******************************************************************************************/

//update():画像とインク量を更新します
//roomId:ルームID, userId:描画者のID, base64Image:書き換わった画像のbase64, restInk:残りインク量
function update(roomId, userId, base64Image, drawlist, restInk) {
  pool.connect(function (err, client) {
    if (err) {
      console.log(err);
    } else {
      //roomsテーブル
      client.query(
        "UPDATE rooms SET img = '" + 
          base64Image + 
          "'::bytea, drawlist = '" + 
          drawlist + 
          "' WHERE id = " + 
          roomId,
        function (err, result) {
          if (err) {
            throw err;
          }
        }
      );
      //memberテーブル
      client.query(
        "UPDATE member SET ink = " +
          restInk +
          " WHERE roomid = " +
          roomId +
          " AND userid = '" +
          userId + 
          "'",
        function (err, result) {
          if (err) {
            throw err;
          }
        }
      );
    }
  });
}

module.exports.makeRoom = makeRoom;
////module.exports.getRoom = getRoom;
module.exports.getDrawlist = getDrawlist;
module.exports.enterRoom = enterRoom;
////module.exports.favorRoom = favorRoom;
////module.exports.disfavorRoom = disfavorRoom;
////module.exports.useInk = useInk;
module.exports.update = update;
