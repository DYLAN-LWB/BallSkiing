var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Games = (function (_super) {
    __extends(Games, _super);
    function Games() {
        var _this = _super.call(this) || this;
        //public
        _this._info = new Info(); //公用信息表
        _this._score = 0; //游戏分数
        //this game
        _this._ball = new egret.Sprite; //小球
        _this._moveToRight = true; //小球是否在向右移动
        _this._moveSepped = 0.3; //小球移动速度
        _this.addEventListener(egret.Event.ADDED_TO_STAGE, _this.createGameScene, _this);
        return _this;
    }
    Games.prototype.createGameScene = function () {
        //常量设置
        this._stageW = this.stage.stageWidth;
        this._stageH = this.stage.stageHeight;
        this.setupViews();
        //添加触摸事件
        this.stage.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.touchBegin, this);
        this.addEventListener(egret.Event.ENTER_FRAME, this.frameObserve, this);
    };
    Games.prototype.setupViews = function () {
        //背景音乐
        var sound = new egret.Sound();
        sound.addEventListener(egret.Event.COMPLETE, function () {
            this._backgroundChannel = sound.play(0, 0);
            this._backgroundChannel.volume = 0.8;
        }, this);
        sound.load("resource/sound/bg.mp3");
        //添加背景
        this._gameBg1 = new egret.Sprite();
        this._gameBg1.x = 0;
        this._gameBg1.y = 0;
        this._gameBg1.width = this._stageW;
        this._gameBg1.height = this._stageH;
        this._gameBg1.graphics.beginFill(0xFFFFF0);
        this._gameBg1.graphics.drawRect(0, 0, this._gameBg1.width, this._gameBg1.height);
        this._gameBg1.graphics.endFill();
        this.addChild(this._gameBg1);
        this._gameBg2 = new egret.Sprite();
        this._gameBg2.x = 0;
        this._gameBg2.y = this._stageH;
        this._gameBg2.width = this._stageW;
        this._gameBg2.height = this._stageH;
        this._gameBg2.graphics.beginFill(0xFFFAFA);
        this._gameBg2.graphics.drawRect(0, 0, this._gameBg2.width, this._gameBg2.height);
        this._gameBg2.graphics.endFill();
        this.addChild(this._gameBg2);
        //添加对象
        this._ball.x = this._stageW / 2;
        this._ball.y = 400;
        this._ball.width = 20;
        this._ball.height = 20;
        this._ball.graphics.beginFill(0x00C5CD, 1);
        this._ball.graphics.drawCircle(10, 10, 10);
        this._ball.graphics.endFill();
        this.addChild(this._ball);
    };
    Games.prototype.frameObserve = function () {
        this._gameBg1.y -= this._moveSepped * 20;
        this._gameBg2.y -= this._moveSepped * 20;
        if (this._gameBg1.y == -this._stageH) {
            this._gameBg1.removeChildren();
            this._gameBg1.y = this._stageH;
        }
        if (this._gameBg2.y == -this._stageH) {
            this._gameBg2.removeChildren();
            this._gameBg2.y = this._stageH;
        }
        var locus = new egret.Shape();
        var addY = 0;
        if (this._gameBg2.y > this._ball.y) {
            addY = Math.abs(this._gameBg1.y) + this._ball.y;
            this._gameBg1.addChild(locus);
        }
        else if (this._gameBg2.y < this._ball.y && this._gameBg2.y > 0) {
            addY = this._ball.y - this._gameBg2.y;
            this._gameBg2.addChild(locus);
        }
        else if (this._gameBg1.y > this._ball.y) {
            addY = Math.abs(this._gameBg2.y) + this._ball.y;
            this._gameBg2.addChild(locus);
        }
        else if (this._gameBg1.y < this._ball.y && this._gameBg1.y > 0) {
            addY = this._ball.y - this._gameBg1.y;
            this._gameBg1.addChild(locus);
        }
        locus.x = this._ball.x;
        locus.y = addY;
        locus.width = 10;
        locus.height = 10;
        locus.graphics.beginFill(0xFF3030);
        locus.graphics.drawRect(0, 0, 10, 10);
        locus.graphics.endFill();
        if (this._moveToRight == true) {
            if (this._ball.x > (this._stageW - this._ball.width)) {
                this._ball.x = this._stageW - this._ball.width;
                this.gameOverTest();
            }
            else {
                this._ball.x += this._moveSepped * 20;
            }
        }
        else {
            if (this._ball.x < 0) {
                this._ball.x = 0;
                this.gameOverTest();
            }
            else {
                this._ball.x -= this._moveSepped * 20;
            }
        }
    };
    Games.prototype.gameOverTest = function () {
        alert("game over");
        this.addEventListener(egret.Event.ENTER_FRAME, this.frameObserve, this);
        // this.removeEventListener();
    };
    Games.prototype.touchBegin = function (event) {
        // //每次点击移除之前的动画
        // egret.Tween.removeTweens(this._ball);
        // let durationTime = 0;	//动画时间=距离/速度
        // let durationToX = 0;	//要移动到屏幕左/右侧
        // if(this._moveToRight == true) {
        // 	durationToX = 0;
        // 	durationTime = this._ball.x/this._moveSepped;
        // } else {
        // 	durationToX = this._stageW-this._ball.width;
        // 	durationTime = (this._stageW - this._ball.width - this._ball.x)/this._moveSepped;
        // }
        // //开始移动动画
        // egret.Tween.get(this._ball).to({x:durationToX}, durationTime);
        //更改移动方向
        this._moveToRight = !this._moveToRight;
    };
    //游戏结束
    Games.prototype.gameTimerCompleteFunc = function () {
        this.stage.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.touchBegin, this);
        if (this._backgroundChannel)
            this._backgroundChannel.stop();
    };
    //接口-减游戏次数
    Games.prototype.minusGameCount = function () {
        var params = "?vuid=" + this._info._vuid +
            "&key=" + this._info._key +
            "&timenum=" + this._info._timenum +
            "&activitynum=" + this._info._activitynum +
            "&isfrom=" + this._info._isfrom;
        var request = new egret.HttpRequest();
        request.responseType = egret.HttpResponseType.TEXT;
        request.open(this._info._downnum + params, egret.HttpMethod.GET);
        request.send();
        request.addEventListener(egret.Event.COMPLETE, function () {
            var result = JSON.parse(request.response);
            if (result["code"] == 0) {
                //减次数成功
            }
            else if (result["code"] == 2) {
                var _overAlert = new Alert(Alert.GamePageShare, "", "", "", 0, this._stageW, this._stageH);
                _overAlert.addEventListener(AlertEvent.Share, this.shareButtonClick, this);
                _overAlert.addEventListener(AlertEvent.Cancle, function () {
                    window.location.reload();
                }, this);
                this.addChild(_overAlert);
            }
            else {
                alert(result["msg"]);
            }
        }, this);
        request.addEventListener(egret.IOErrorEvent.IO_ERROR, function () {
            alert("numdown5　post error : " + event);
        }, this);
    };
    //接口-请求单词, 只在初次请求时添加UI
    Games.prototype.getWords = function (type) {
        var params = "?vuid=" + this._info._vuid +
            "&key=" + this._info._key +
            "&timenum=" + this._info._timenum +
            "&activitynum=" + this._info._activitynum +
            "&rands=" + this._rands +
            "&isfrom=" + this._info._isfrom;
        var request = new egret.HttpRequest();
        request.responseType = egret.HttpResponseType.TEXT;
        request.open(this._info._getWord + params, egret.HttpMethod.GET);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.send();
        request.addEventListener(egret.Event.COMPLETE, function () {
            var result = JSON.parse(request.response);
            if (result["code"] == 0) {
            }
            else {
                alert(result["msg"]);
            }
        }, this);
        request.addEventListener(egret.IOErrorEvent.IO_ERROR, function () {
        }, this);
    };
    //接口-增加分数
    Games.prototype.plusScore = function (score) {
        var params = "?vuid=" + this._info._vuid +
            "&rands=" + this._rands +
            "&tid=" + this._tid +
            "&md5=" + score +
            "&timenum=" + this._info._timenum +
            "&activitynum=" + this._info._activitynum +
            "&isfrom=" + this._info._isfrom;
        var request = new egret.HttpRequest();
        request.responseType = egret.HttpResponseType.TEXT;
        request.open(this._info._typosTempjump + params, egret.HttpMethod.GET);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.send();
        request.addEventListener(egret.Event.COMPLETE, function () {
            var result = JSON.parse(request.response);
        }, this);
        request.addEventListener(egret.IOErrorEvent.IO_ERROR, function () {
        }, this);
    };
    //接口-游戏结束
    Games.prototype.gameOver = function () {
        var params = "?score=" + this._score +
            "&vuid=" + this._info._vuid +
            "&key=" + this._info._key +
            "&rands=" + this._rands +
            "&timenum=" + this._info._timenum +
            "&activitynum=" + this._info._activitynum +
            "&isfrom=" + this._info._isfrom;
        var request = new egret.HttpRequest();
        request.responseType = egret.HttpResponseType.TEXT;
        request.open(this._info._gameover + params, egret.HttpMethod.GET);
        request.send();
        request.addEventListener(egret.Event.COMPLETE, function () {
            var result = JSON.parse(request.response);
            var highScore = result["data"]["score"];
            if (this._score > parseInt(highScore)) {
                highScore = this._score;
            }
            this._normalAlert = new Alert(Alert.GamePageScore, this._score.toString(), highScore, result["data"]["order"], result["data"]["text"], this._stageW, this._stageH);
            this._normalAlert.addEventListener(AlertEvent.Ranking, this.checkRanking, this);
            this._normalAlert.addEventListener(AlertEvent.Restart, this.restartGame, this);
            this.addChild(this._normalAlert);
        }, this);
        request.addEventListener(egret.IOErrorEvent.IO_ERROR, function () {
            alert("GameOver　post error : " + event);
        }, this);
    };
    //游戏结束alert-查看排名
    Games.prototype.checkRanking = function () {
        if (this._normalAlert && this._normalAlert.parent) {
            this._normalAlert.parent.removeChild(this._normalAlert);
        }
        window.location.href = this._info._rankUrl + this._info._timenum + "/activitynum/" + this._info._activitynum + "/vuid/" + this._info._vuid + "/key/" + this._info._key + "/isfrom/" + this._info._isfrom;
    };
    //游戏结束alert-重玩
    Games.prototype.restartGame = function () {
        //移动当前场景
        this.removeChildren();
        //重玩时清空数组
        //重新初始化赋值参数
        this.minusGameCount();
    };
    Games.prototype.shareButtonClick = function () {
        //分享引导图
        var _shareGuide = new Bitmap("shareGui_png");
        _shareGuide.touchEnabled = true;
        _shareGuide.x = 0;
        _shareGuide.y = 0;
        _shareGuide.width = this.stage.stageWidth;
        _shareGuide.height = this.stage.stageHeight;
        _shareGuide.addEventListener(egret.TouchEvent.TOUCH_TAP, function () {
            this.removeChild(_shareGuide);
        }, this);
        this.addChild(_shareGuide);
    };
    return Games;
}(egret.DisplayObjectContainer));
__reflect(Games.prototype, "Games");
//# sourceMappingURL=Games.js.map