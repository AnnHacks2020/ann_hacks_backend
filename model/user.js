/*
    Userクラス
    userId: ユーザID
    LikeList: いいねしたルームのID配列
    favor(roomId): ルームIDをLikeListに追加
 */


function User(userId){
    this.userId = userId;
    this.LikeList = new Array();
    this.favor = function(roomId){
        LikeList.push(roomId);
    }
}

module.exports.User = User;