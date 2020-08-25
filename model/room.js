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

const MAXINK = 100000;
var inc = 0;

function newId(){
    inc++;
    return inc;
}

//makeRoom:新規テーマ部屋を作ります
//hostUserId:作成者ユーザID, theme:テーマ文字列, maxMembers:最大人数, due:期間
function makeRoom(hostUserId, theme, maxMembers, due){
    var roomId = newId();
    var image = null;//!NOTICE!白紙を代入したい
    var fav = 0;

    //member配列の最初に作成者ユーザIDを入れておく//
    var member = new Array();
    member.push(hostUserId);

    //ハッシュテーブルinkはメンバーIDをキーとし残りインク量を返します
    var ink = new Map();
    ink.set(hostUserId, MAXINK);

    //deadlineには期日のIntが入る
    var deadline = Date.now() + due;//!NOTICE!dueの単位がミリ秒である必要があります

    roomList.push({
        roomId: roomId,
        hostUserId: hostUserId,
        theme: theme,
        maxMembers: maxMembers,
        image: image,
        fav: fav,
        member: member,
        ink: ink,
        deadline: deadline
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

//useInk:指定したルームのメンバーのInkを
//usedInkAmountはint型で，マイナス値を入力することでインク量を巻き戻します



module.exports.makeRoom = makeRoom;
module.exports.getRoom = getRoom;
module.exports.enterRoom = enterRoom;
module.exports.favorRoom = favorRoom;
module.exports.disfavorRoom = disfavorRoom;