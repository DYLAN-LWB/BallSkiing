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
        _this._ball = new Bitmap("person_png"); //小球
        _this._moveToRight = true; //小球是否在向右移动
        _this._ballMoveSpeed = 8; //小球移动速度
        _this._bgMoveSpeed = 10; //背景移动速度
        _this._baseSpeed = 1; //速度系数,加速时增加
        _this._isSpeedUp = false; //是否加速
        _this._isFitstApperar = true; //游戏开始障碍物位置在下方,避免一出来就死
        _this._locusW = 8; //初始轨迹宽度
        _this._locusPointAaray = []; //轨迹点数组
        _this._barrierArray1 = []; //障碍物数组
        _this._barrierArray2 = []; //障碍物数组
        _this._letterTFArray1 = []; //字符数组
        _this._letterTFArray2 = []; //字符数组
        _this._wordsArray = []; //单词数组
        _this.addEventListener(egret.Event.ADDED_TO_STAGE, _this.createGameScene, _this);
        return _this;
    }
    Games.prototype.createGameScene = function () {
        this._stageW = this.stage.stageWidth;
        this._stageH = this.stage.stageHeight;
        this.setupViews();
    };
    Games.prototype.setupViews = function () {
        //添加触摸事件
        this.stage.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.touchBegin, this);
        //添加帧事件
        this.addEventListener(egret.Event.ENTER_FRAME, this.frameObserve, this);
        //背景音乐
        // let sound = new egret.Sound();
        // sound.addEventListener(egret.Event.COMPLETE, function() {
        // 	this._backgroundChannel = sound.play(0,0);
        // 	this._backgroundChannel.volume = 0.8;
        // }, this);
        // sound.load("resource/sound/bg.mp3");
        //固定背景
        var _gameBg = new egret.Sprite();
        _gameBg.x = 0;
        _gameBg.y = 0;
        _gameBg.width = this._stageW;
        _gameBg.height = this._stageH;
        _gameBg.graphics.beginFill(0xFFF8F5);
        _gameBg.graphics.drawRect(0, 0, _gameBg.width, _gameBg.height);
        _gameBg.graphics.endFill();
        this.addChild(_gameBg);
        //添加小球
        this._ball.x = this._stageW / 2;
        this._ball.y = 400;
        this._ball.width = 40;
        this._ball.height = 40;
        this.addChild(this._ball);
        this._guide = new Movie();
        this._guide.init("guide_json", "guide_png", "guide", -1);
        this._guide.alpha = 1;
        this._guide.x = 200;
        this._guide.y = 340;
        this._guide.width = 100;
        this._guide.height = 60;
        // this.addChild(this._guide);
        //添加成语
        this._wordTextField = new egret.TextField;
        this._wordTextField.x = 0;
        this._wordTextField.y = 50;
        this._wordTextField.width = this._stageW / 2;
        this._wordTextField.height = 50;
        this._wordTextField.textColor = 0xFF0000;
        this._wordTextField.verticalAlign = egret.VerticalAlign.MIDDLE;
        this._wordTextField.textAlign = egret.HorizontalAlign.CENTER;
        this._wordTextField.size = 35;
        this._wordTextField.text = "";
        this._wordTextField.fontFamily = "Microsoft YaHei";
        this.addChild(this._wordTextField);
        this._translateTextField = new egret.TextField;
        this._translateTextField.x = 0;
        this._translateTextField.y = 100;
        this._translateTextField.width = this._stageW / 2;
        this._translateTextField.height = 50;
        this._translateTextField.textColor = 0xFF0000;
        this._translateTextField.verticalAlign = egret.VerticalAlign.MIDDLE;
        this._translateTextField.textAlign = egret.HorizontalAlign.CENTER;
        this._translateTextField.size = 35;
        this._translateTextField.text = "";
        this._translateTextField.fontFamily = "Microsoft YaHei";
        this.addChild(this._translateTextField);
        this.updataWord();
        //添加背景1
        this._gameBg1 = new egret.Sprite();
        this._gameBg1.x = 0;
        this._gameBg1.y = 0;
        this._gameBg1.width = this._stageW;
        this._gameBg1.height = this._stageH;
        this.addChild(this._gameBg1);
        //添加背景2
        this._gameBg2 = new egret.Sprite();
        this._gameBg2.x = 0;
        this._gameBg2.y = this._stageH;
        this._gameBg2.width = this._stageW;
        this._gameBg2.height = this._stageH;
        this.addChild(this._gameBg2);
        this.addBarriers(1);
        this._isFitstApperar = false;
        this.addBarriers(2);
        this._lastLocusPointX = this._stageW / 2 + this._ball.width / 2;
        this._lastLocusPointY = 400;
    };
    //更新单词
    Games.prototype.updataWord = function () {
        // let word = this._currentWordDict[""];
        var word = "Mondy";
        var location = Math.floor(Math.random() * word.length);
        this._missLetter = word.slice(location, location + 1);
        word = word.replace(this._missLetter, "( )");
        this._wordTextField.text = word;
        this._translateTextField.text = "周一";
    };
    Games.prototype.addBarriers = function (page) {
        if (page == 1) {
            this._barrierArray1.splice(0, this._barrierArray1.length);
        }
        else {
            this._barrierArray2.splice(0, this._barrierArray2.length);
        }
        for (var i = 0; i < ((this._isFitstApperar ? 2 : 5) + Math.random() * 5); i++) {
            //障碍物背景,爆炸
            var barrierBg = new egret.Sprite;
            barrierBg.x = Math.random() * (this._stageW - 80);
            barrierBg.y = Math.random() * (this._stageH - 80 - (this._isFitstApperar ? 700 : 0)) + (this._isFitstApperar ? 700 : 0);
            barrierBg.width = 50;
            barrierBg.height = 50;
            barrierBg.graphics.beginFill(0xFF0000, 0.01);
            barrierBg.graphics.drawCircle(20, 20, 20);
            barrierBg.graphics.endFill();
            //障碍物
            var barrier = new Bitmap("monster_png");
            barrier.x = 10;
            barrier.y = 10;
            barrier.width = 30;
            barrier.height = 30;
            barrierBg.addChild(barrier);
            if (page == 1) {
                this._gameBg1.addChild(barrierBg);
                this._barrierArray1.push(barrierBg);
            }
            else {
                this._gameBg2.addChild(barrierBg);
                this._barrierArray2.push(barrierBg);
            }
        }
        //添加字母
        var letterArray = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "g", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
        var randomLetter = [];
        for (var i = 0; i < 3; i++) {
            randomLetter.push(letterArray[Math.floor(Math.random() * letterArray.length)]);
        }
        randomLetter.push(this._missLetter);
        for (var l = 0; l < randomLetter.length; l++) {
            var letter = new egret.TextField;
            letter.x = Math.random() * (this._stageW - 80);
            letter.y = Math.random() * (this._stageH - 80 - (this._isFitstApperar ? 700 : 0)) + (this._isFitstApperar ? 700 : 0);
            letter.width = 50;
            letter.height = 50;
            letter.textColor = 0xFF0000;
            letter.backgroundColor = 0x545454;
            letter.verticalAlign = egret.VerticalAlign.MIDDLE;
            letter.textAlign = egret.HorizontalAlign.CENTER;
            letter.size = 25;
            letter.text = randomLetter[l];
            letter.fontFamily = "Microsoft YaHei";
            letter.text = randomLetter[l];
            if (page == 1) {
                this._gameBg1.addChild(letter);
                this._letterTFArray1.push(letter);
            }
            else {
                this._gameBg2.addChild(letter);
                this._letterTFArray2.push(letter);
            }
        }
    };
    //实时监听
    Games.prototype.frameObserve = function () {
        //根据移动方向设置球的位置,触碰到边缘游戏结束
        if (this._moveToRight == true) {
            if (this._ball.x >= (this._stageW - this._ball.width)) {
                this.gameOverFunc();
            }
            else {
                this._ball.x += this._ballMoveSpeed;
            }
            this._guide.x = this._ball.x + 50;
        }
        else {
            if (this._ball.x <= 0) {
                this.gameOverFunc();
            }
            else {
                this._ball.x -= this._ballMoveSpeed;
            }
            this._guide.x = this._ball.x - 50;
        }
        //移动游戏背景
        this._gameBg1.y -= this._bgMoveSpeed * this._baseSpeed;
        this._gameBg2.y -= this._bgMoveSpeed * this._baseSpeed;
        //重新设置背景位置,清空子视图
        if (this._gameBg1.y <= -this._stageH) {
            this._gameBg1.removeChildren();
            this._gameBg1.y = this._gameBg2.y + this._stageH;
            this._locusPointAaray.splice(0, this._locusPointAaray.length);
            this.addBarriers(1);
        }
        if (this._gameBg2.y <= -this._stageH) {
            this._gameBg2.removeChildren();
            this._gameBg2.y = this._gameBg1.y + this._stageH;
            this._locusPointAaray.splice(0, this._locusPointAaray.length);
            this.addBarriers(2);
        }
        var locusPoint = new egret.Shape(); //轨迹点
        var currentLocusPointY = 0; //点相对于背景图的Y值
        //判断添加到哪个背景,背景1的最大Y值在 400 ~ H+400之间
        if ((this._gameBg1.y + this._gameBg1.height) > 400 && (this._gameBg1.y + this._gameBg1.height) <= (this._stageH + 400)) {
            this._gameBg1.addChild(locusPoint);
            currentLocusPointY = 400 - this._gameBg1.y;
        }
        else {
            this._gameBg2.addChild(locusPoint);
            currentLocusPointY = 400 - this._gameBg2.y;
        }
        //跨背景图时特殊处理
        // console.log("line from= " + this._lastLocusPointY + " ----to " + (currentLocusPointY));
        if (this._lastLocusPointY >= (this._stageH - this._bgMoveSpeed * this._baseSpeed)) {
            this._lastLocusPointY = (currentLocusPointY) - this._bgMoveSpeed * this._baseSpeed;
        }
        //保存对象,起点,终点
        var dict = {
            "beginX": this._lastLocusPointX,
            "beginY": this._lastLocusPointY,
            "endX": (this._ball.x + this._ball.width / 2),
            "endY": (currentLocusPointY),
            "object": locusPoint,
        };
        this._locusPointAaray.reverse();
        this._locusPointAaray.push(dict);
        this._locusPointAaray.reverse();
        for (var i = 0; i < this._locusPointAaray.length; i++) {
            var maxWidth = this._locusW * 0.055 * i;
            if (maxWidth > this._locusW * 4) {
                maxWidth = this._locusW * 4;
            }
            if (maxWidth < this._locusW) {
                maxWidth = this._locusW;
            }
            var point = this._locusPointAaray[i]["object"]; // 红 0xEBBCB5
            point.graphics.lineStyle(maxWidth, this._isSpeedUp ? 0xCDE3E2 : 0xCDE3E2, 1, true);
            point.graphics.moveTo(this._locusPointAaray[i]["beginX"], this._locusPointAaray[i]["beginY"]);
            point.graphics.lineTo(this._locusPointAaray[i]["endX"], this._locusPointAaray[i]["endY"]);
        }
        //重新保存上次位置
        this._lastLocusPointX = this._ball.x + this._ball.width / 2;
        this._lastLocusPointY = currentLocusPointY;
        //碰撞检测
        this.checkBarrierHit();
    };
    //点击屏幕
    Games.prototype.touchBegin = function (event) {
        var bufferTimer = new egret.Timer(10, 20);
        bufferTimer.addEventListener(egret.TimerEvent.TIMER, this.bufferTimerFunc, this);
        bufferTimer.addEventListener(egret.TimerEvent.TIMER_COMPLETE, this.bufferTimerComFunc, this);
        bufferTimer.start();
        this._guide.alpha = 1;
        var guideTimer = new egret.Timer(500, 1);
        guideTimer.addEventListener(egret.TimerEvent.TIMER, function () {
            this._guide.alpha = 1;
        }, this);
        guideTimer.start();
    };
    //减速
    Games.prototype.bufferTimerFunc = function (event) {
        this._ballMoveSpeed -= 0.5;
        if (this._ballMoveSpeed < 0) {
            this._ballMoveSpeed = 0;
        }
    };
    //减速结束-转向-加速
    Games.prototype.bufferTimerComFunc = function (event) {
        //更改移动方向
        this._moveToRight = !this._moveToRight;
        this._ballMoveSpeed = 0;
        var timer = new egret.Timer(10, 20);
        timer.addEventListener(egret.TimerEvent.TIMER, this.timerFunc, this);
        timer.start();
    };
    //加速
    Games.prototype.timerFunc = function (event) {
        this._ballMoveSpeed += 0.5;
        if (this._ballMoveSpeed > 15) {
            this._ballMoveSpeed = 15;
        }
    };
    Games.prototype.checkBarrierHit = function () {
        for (var index = 0; index < this._barrierArray1.length; index++) {
            var bar = this._barrierArray1[index];
            var _isHit = bar.hitTestPoint(this._ball.x + this._ball.width / 2, this._ball.y + this._ball.height);
            if (_isHit) {
                // this.gameOverFunc();
            }
        }
        for (var index = 0; index < this._barrierArray2.length; index++) {
            var bar = this._barrierArray2[index];
            var _isHit = bar.hitTestPoint(this._ball.x + this._ball.width / 2, this._ball.y + this._ball.height);
            if (_isHit) {
                // this.gameOverFunc();
            }
        }
        for (var index = 0; index < this._letterTFArray1.length; index++) {
            var bar = this._letterTFArray1[index];
            var _isHit = bar.hitTestPoint(this._ball.x + this._ball.width / 2, this._ball.y + this._ball.height);
            if (_isHit) {
                var tf = this._letterTFArray1[index];
                this.hitWordLetter(tf.text);
            }
        }
        for (var index = 0; index < this._letterTFArray2.length; index++) {
            var bar = this._letterTFArray2[index];
            var _isHit = bar.hitTestPoint(this._ball.x + this._ball.width / 2, this._ball.y + this._ball.height);
            if (_isHit) {
                var tf = this._letterTFArray2[index];
                this.hitWordLetter(tf.text);
            }
        }
    };
    Games.prototype.hitWordLetter = function (text) {
        console.log(text);
        // this._isSpeedUp = true;
        // this._baseSpeed = 1.5;
        // if(this.seppedTimer) {
        // 	this.seppedTimer.reset();
        // }
        // this.seppedTimer = new egret.Timer(2000, 1);
        // this.seppedTimer.addEventListener(egret.TimerEvent.TIMER, function() {
        // 	this._isSpeedUp = false;
        // 	this._baseSpeed = 1;
        // }, this);
        // this.seppedTimer.start();
    };
    //游戏结束
    Games.prototype.gameOverFunc = function () {
        // alert("game over");
        this.stage.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.touchBegin, this);
        this.removeEventListener(egret.Event.ENTER_FRAME, this.frameObserve, this);
        if (this._backgroundChannel)
            this._backgroundChannel.stop();
        // // this.gameOver();
        // //test
        // this._normalAlert = new Alert(Alert.GamePageScore, "999", "1000", "1", 0,this._stageW,this._stageH);
        // this._normalAlert.addEventListener(AlertEvent.Restart, this.restart, this);
        // this.addChild(this._normalAlert);
    };
    Games.prototype.restart = function () {
        this.removeChildren();
        this._barrierArray1.splice(0, this._barrierArray1.length);
        this._barrierArray2.splice(0, this._barrierArray2.length);
        this._moveToRight = true; //小球是否在向右移动
        this._ballMoveSpeed = 8; //小球移动速度
        this._bgMoveSpeed = 10; //背景移动速度
        this._baseSpeed = 1; //速度系数,加速时增加
        this._isSpeedUp = false; //是否加速
        this._isFitstApperar = true;
        this.setupViews();
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