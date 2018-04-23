class Games extends egret.DisplayObjectContainer {
	public constructor() {
		super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.createGameScene, this);
	}

	//public
    private _info = new Info(); //公用信息表
	private _linnum: number;	//剩余挑战次数
	private _rands: string;		//随机字符串,提交分数时加	
	private _tid: string;
	private _normalAlert;
	private _score = 0;		//游戏分数
	private _stageW;	//舞台宽度
	private _stageH;	//舞台高度
	private _backgroundChannel: egret.SoundChannel;	//游戏背景音乐

	private _ball = new Bitmap("person_png");	//小球
	private _moveToRight:boolean = true;	//小球是否在向右移动
	private _ballMoveSpeed = 8;	//小球移动速度
	private _bgMoveSpeed = 10;	//背景移动速度
	private _baseSpeed = 1;		//速度系数,加速时增加
	private _isSpeedUp:boolean = false;	//是否加速
	private _guide;	//加速时小球的动画
	private _isFitstApperar:boolean = true;	//游戏开始障碍物位置在下方,避免一出来就死

	private _locusW = 8;	//初始轨迹宽度
	private _lastLocusPointX;	//上个轨迹点的x坐标
	private _lastLocusPointY;	//上个轨迹点的y坐标
	private _locusPointAaray = [];	//轨迹点数组

	private _gameBg1;	//背景1
	private _gameBg2;	//背景2
	private _highScoreArray1 = [];	//高分区数组
	private _barrierArray1 = [];	//障碍物数组
	private _highScoreArray2 = [];	//高分区数组
	private _barrierArray2 = [];	//障碍物数组


	private createGameScene() {
		this._stageW = this.stage.stageWidth;
		this._stageH = this.stage.stageHeight;

		this.setupViews();
	}

	private setupViews() {
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
		let _gameBg = new egret.Sprite();
		_gameBg.x = 0;
		_gameBg.y = 0;
		_gameBg.width = this._stageW;
		_gameBg.height = this._stageH;
		_gameBg.graphics.beginFill(0xFFF8F5);
        _gameBg.graphics.drawRect(0, 0, _gameBg.width, _gameBg.height);
        _gameBg.graphics.endFill();
        this.addChild(_gameBg);

		//添加小球
		this._ball.x = this._stageW/2;
		this._ball.y = 400;
		this._ball.width = 40;
		this._ball.height = 40;
		this.addChild(this._ball);
		
		this._guide = new Movie();
        this._guide.init("guide_json","guide_png","guide",-1);
		this._guide.alpha =1;
        this._guide.x = 200;
		this._guide.y = 340;
		this._guide.width = 100;
		this._guide.height = 60;
		// this.addChild(this._guide);

		//添加背景1
		this._gameBg1 = new egret.Sprite();
		this._gameBg1.x = 0;
		this._gameBg1.y = 0;
		this._gameBg1.width = this._stageW;
		this._gameBg1.height = this._stageH;
		// this._gameBg1.graphics.beginFill(0xFFC1C1);
        // this._gameBg1.graphics.drawRect(0, 0, this._gameBg1.width, this._gameBg1.height);
        // this._gameBg1.graphics.endFill();
        this.addChild(this._gameBg1);
		
		//添加背景2
		this._gameBg2 = new egret.Sprite();
		this._gameBg2.x = 0;
		this._gameBg2.y = this._stageH;
		this._gameBg2.width = this._stageW;
		this._gameBg2.height = this._stageH;
		// this._gameBg2.graphics.beginFill(0xFFF68F);
        // this._gameBg2.graphics.drawRect(0, 0, this._gameBg2.width, this._gameBg2.height);
        // this._gameBg2.graphics.endFill();
        this.addChild(this._gameBg2);
		
		this.addBarriers(1);
		this._isFitstApperar = false;
		this.addBarriers(2);

		this._lastLocusPointX = this._stageW/2 + this._ball.width/2;
		this._lastLocusPointY = 400;
	}

	private addBarriers(page) {
		if(page == 1) {
			this._highScoreArray1.splice(0, this._highScoreArray1.length);
			this._barrierArray1.splice(0, this._barrierArray1.length);
		} else {
			this._highScoreArray2.splice(0, this._highScoreArray2.length);
			this._barrierArray2.splice(0, this._barrierArray2.length);
		}

		for(var i = 0; i < ((this._isFitstApperar ? 5 : 10)+Math.random()*5); i++) {
			//高分区
			let scoreBg = new egret.Sprite;
			scoreBg.x = Math.random()*(this._stageW-80);
			scoreBg.y = Math.random()*(this._stageH-80-(this._isFitstApperar ? 700 : 0)) + (this._isFitstApperar ? 700 : 0);
			scoreBg.width = 80;
			scoreBg.height = 80;
			scoreBg.graphics.beginFill(0x53868B,0.01);
			scoreBg.graphics.drawCircle(40, 40, 40);
			scoreBg.graphics.endFill();

			//障碍物背景,爆炸
			let barrierBg = new egret.Sprite;
			barrierBg.x = scoreBg.x + 20;
			barrierBg.y = scoreBg.y + 20;
			barrierBg.width = 40;
			barrierBg.height = 40;
			barrierBg.graphics.beginFill(0xFF0000,0.01);
			barrierBg.graphics.drawCircle(20, 20, 20);
			barrierBg.graphics.endFill();

			//障碍物
			let barrier  = new Bitmap("monster_png");
			barrier.x = 5;
			barrier.y = 5;
			barrier.width = 30;
			barrier.height = 30;
			barrierBg.addChild(barrier);

			if(page == 1) {
				this._gameBg1.addChild(scoreBg);
				this._gameBg1.addChild(barrierBg);
				this._highScoreArray1.push(scoreBg);
				this._barrierArray1.push(barrierBg);
			} else {
				this._gameBg2.addChild(scoreBg);
				this._gameBg2.addChild(barrierBg);
				this._highScoreArray2.push(scoreBg);
				this._barrierArray2.push(barrierBg);
			}
		}
	}

	//实时监听
	private frameObserve () {

		//根据移动方向设置球的位置,触碰到边缘游戏结束
		if(this._moveToRight == true) {
			if(this._ball.x >= (this._stageW-this._ball.width)) {
				this.gameOverFunc();
			} else {
				this._ball.x += this._ballMoveSpeed;
			}
			this._guide.x = this._ball.x+50;
		} else {
			if(this._ball.x <= 0) {
				this.gameOverFunc();
			} else {
				this._ball.x -= this._ballMoveSpeed;
			}
			this._guide.x = this._ball.x-50;
		}

		//移动游戏背景
		this._gameBg1.y -= this._bgMoveSpeed*this._baseSpeed;
		this._gameBg2.y -= this._bgMoveSpeed*this._baseSpeed;

		//重新设置背景位置,清空子视图
		if (this._gameBg1.y <= -this._stageH) {
			this._gameBg1.removeChildren();
			this._gameBg1.y = this._gameBg2.y + this._stageH;
			this._locusPointAaray.splice(0, this._locusPointAaray.length);
			this.addBarriers(1);
		}

		if (this._gameBg2.y <= -this._stageH) {
			this._gameBg2.removeChildren();
			this._gameBg2.y = this._gameBg1.y  + this._stageH;
			this._locusPointAaray.splice(0, this._locusPointAaray.length);
			this.addBarriers(2);
		}

		let locusPoint = new egret.Shape();	//轨迹点
		let currentLocusPointY = 0;	//点相对于背景图的Y值
		//判断添加到哪个背景,背景1的最大Y值在 400 ~ H+400之间
		if ((this._gameBg1.y+this._gameBg1.height) > 400 && (this._gameBg1.y+this._gameBg1.height) <= (this._stageH+400)) {
			this._gameBg1.addChild(locusPoint);
			currentLocusPointY = 400 - this._gameBg1.y;
		} else {
			this._gameBg2.addChild(locusPoint);
			currentLocusPointY = 400 - this._gameBg2.y;
		}

		//跨背景图时特殊处理
		// console.log("line from= " + this._lastLocusPointY + " ----to " + (currentLocusPointY));
		if(this._lastLocusPointY >= (this._stageH - this._bgMoveSpeed*this._baseSpeed)) {
			this._lastLocusPointY = (currentLocusPointY) - this._bgMoveSpeed*this._baseSpeed;
		}

		
		// //保存对象,起点,终点
		var dict = {
			"beginX":this._lastLocusPointX,
			"beginY":this._lastLocusPointY,
			"endX":(this._ball.x + this._ball.width/2),
			"endY":(currentLocusPointY),
			"object":locusPoint,
		};

		this._locusPointAaray.reverse();
		this._locusPointAaray.push(dict);
		this._locusPointAaray.reverse();

		for (var i = 0; i < this._locusPointAaray.length; i++) {
			let maxWidth = this._locusW*0.055*i;
			if(maxWidth > this._locusW*4) {
				maxWidth = this._locusW*4;	
			}
			if(maxWidth < this._locusW) {
				maxWidth = this._locusW;
			}
			var point = this._locusPointAaray[i]["object"];	// 红 0xEBBCB5
			point.graphics.lineStyle(maxWidth, this._isSpeedUp ? 0xCDE3E2 : 0xCDE3E2, 1, true);
			point.graphics.moveTo(this._locusPointAaray[i]["beginX"], this._locusPointAaray[i]["beginY"]);
			point.graphics.lineTo(this._locusPointAaray[i]["endX"] , this._locusPointAaray[i]["endY"]);
		}

		//重新保存上次位置
		this._lastLocusPointX = this._ball.x + this._ball.width/2;
		this._lastLocusPointY = currentLocusPointY;

		//碰撞检测
		this.checkBarrierHit();
		this.checkHighScoreHit();

	}
 
	//点击屏幕
	private touchBegin(event: egret.TouchEvent) {
		var bufferTimer: egret.Timer = new egret.Timer(10, 20);
        bufferTimer.addEventListener(egret.TimerEvent.TIMER, this.bufferTimerFunc, this);
        bufferTimer.addEventListener(egret.TimerEvent.TIMER_COMPLETE, this.bufferTimerComFunc, this);
        bufferTimer.start();

		this._guide.alpha = 1;

		var guideTimer: egret.Timer = new egret.Timer(500, 1);
		guideTimer.addEventListener(egret.TimerEvent.TIMER, function() {
			this._guide.alpha = 1;
		}, this);
        guideTimer.start();
	}
	//减速
 	private bufferTimerFunc(event:egret.TimerEvent) {
		this._ballMoveSpeed -= 0.5;
		if(this._ballMoveSpeed < 0) {
			this._ballMoveSpeed = 0;
		}
    }
	//减速结束-转向-加速
    private bufferTimerComFunc(event: egret.TimerEvent) {
		//更改移动方向
		this._moveToRight = !this._moveToRight;

        this._ballMoveSpeed = 0;
		var timer: egret.Timer = new egret.Timer(10, 20);
        timer.addEventListener(egret.TimerEvent.TIMER, this.timerFunc, this);
        timer.start();
    }
	//加速
	private timerFunc(event:egret.TimerEvent) {
        this._ballMoveSpeed += 0.5;
		if(this._ballMoveSpeed > 15) {
			this._ballMoveSpeed = 15;
		}
    }

	private seppedTimer: egret.Timer;
	private checkHighScoreHit() {

		for(let index = 0; index < this._highScoreArray1.length; index++) {
			let bar = this._highScoreArray1[index];
			let _isHit: boolean = bar.hitTestPoint(this._ball.x+this._ball.width/2, this._ball.y+this._ball.height);
			if(_isHit) {
				// console.log("加速");
				this._isSpeedUp = true;
				this._baseSpeed = 1.5;
				if(this.seppedTimer) {
					this.seppedTimer.reset();
				}
				this.seppedTimer = new egret.Timer(2000, 1);
				this.seppedTimer.addEventListener(egret.TimerEvent.TIMER, function() {
					this._isSpeedUp = false;
					this._baseSpeed = 1;
				}, this);
				this.seppedTimer.start();
				
			} 
		}

		for(let index = 0; index < this._highScoreArray2.length; index++) {
			let bar = this._highScoreArray2[index];
			let _isHit: boolean = bar.hitTestPoint(this._ball.x+this._ball.width/2, this._ball.y+this._ball.height);
			if(_isHit) {
				// console.log("加速");
				this._isSpeedUp = true;
				this._baseSpeed = 1.5;
				if(this.seppedTimer) {
					this.seppedTimer.reset();
				}
				this.seppedTimer = new egret.Timer(2000, 1);
				this.seppedTimer.addEventListener(egret.TimerEvent.TIMER, function() {
					this._isSpeedUp = false;
					this._baseSpeed = 1;
				}, this);
				this.seppedTimer.start();
			} 
		}
	}
	private checkBarrierHit() {

		for(let index = 0; index < this._barrierArray1.length; index++) {
			let bar = this._barrierArray1[index];
			let _isHit: boolean = bar.hitTestPoint(this._ball.x+this._ball.width/2, this._ball.y+this._ball.height);
			if(_isHit) {
				this.gameOverFunc();
			} 
		}
		for(let index = 0; index < this._barrierArray2.length; index++) {
			let bar = this._barrierArray2[index];
			let _isHit: boolean = bar.hitTestPoint(this._ball.x+this._ball.width/2, this._ball.y+this._ball.height);
			if(_isHit) {
				this.gameOverFunc();
			} 
		}
	}
	//游戏结束
	private gameOverFunc () {
		// alert("game over");
		this.stage.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.touchBegin, this);
		this.removeEventListener(egret.Event.ENTER_FRAME, this.frameObserve, this);
		if (this._backgroundChannel) this._backgroundChannel.stop();
		// // this.gameOver();
		// //test
		// this._normalAlert = new Alert(Alert.GamePageScore, "999", "1000", "1", 0,this._stageW,this._stageH);
		// this._normalAlert.addEventListener(AlertEvent.Restart, this.restart, this);
		// this.addChild(this._normalAlert);
	}
	private restart() {
		this.removeChildren();

		this._highScoreArray1.splice(0, this._highScoreArray1.length);
		this._barrierArray1.splice(0, this._barrierArray1.length);
		this._highScoreArray2.splice(0, this._highScoreArray2.length);
		this._barrierArray2.splice(0, this._barrierArray2.length);

		this._moveToRight = true;	//小球是否在向右移动
		this._ballMoveSpeed = 8;	//小球移动速度
		this._bgMoveSpeed = 10;	//背景移动速度
		this._baseSpeed = 1;		//速度系数,加速时增加
		this._isSpeedUp = false;	//是否加速
		this._isFitstApperar = true;
		this.setupViews();
	}

	//接口-减游戏次数
	private minusGameCount() {
		let params = "?vuid=" + this._info._vuid +
					 "&key=" + this._info._key +
					 "&timenum=" + this._info._timenum +
					 "&activitynum=" + this._info._activitynum + 
					 "&isfrom=" + this._info._isfrom;
        let request = new egret.HttpRequest();
        request.responseType = egret.HttpResponseType.TEXT;
        request.open(this._info._downnum + params, egret.HttpMethod.GET);
        request.send();
        request.addEventListener(egret.Event.COMPLETE, function() {
			let result = JSON.parse(request.response);
            if (result["code"] == 0) {
				//减次数成功
				
			} else if(result["code"] == 2) {

				let _overAlert = new Alert(Alert.GamePageShare, "", "", "",0,this._stageW,this._stageH);
				_overAlert.addEventListener(AlertEvent.Share, this.shareButtonClick, this);
				_overAlert.addEventListener(AlertEvent.Cancle, function() {
					window.location.reload();
				}, this);
				this.addChild(_overAlert);
			} else {
				alert(result["msg"]);
			}
		}, this);
		request.addEventListener(egret.IOErrorEvent.IO_ERROR, function() {
            alert("numdown5　post error : " + event);
        }, this);
	}

	//接口-请求单词, 只在初次请求时添加UI
	private getWords(type: number) {
		let params = "?vuid=" + this._info._vuid + 
					 "&key=" + this._info._key +
					 "&timenum=" + this._info._timenum +
					 "&activitynum=" + this._info._activitynum + 
					 "&rands=" + this._rands + 
					 "&isfrom=" + this._info._isfrom;
					 
		let request = new egret.HttpRequest();
        request.responseType = egret.HttpResponseType.TEXT;
        request.open(this._info._getWord + params, egret.HttpMethod.GET);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.send();
		request.addEventListener(egret.Event.COMPLETE, function() {
			let result = JSON.parse(request.response);

	        if (result["code"] == 0) {
				
			} else {
				alert(result["msg"]);
			}
		}, this);
		request.addEventListener(egret.IOErrorEvent.IO_ERROR, function() {
        }, this);
	}
	
	//接口-增加分数
	private plusScore(score: number) {
		let params = "?vuid=" + this._info._vuid + 
					 "&rands=" + this._rands + 
					 "&tid=" + this._tid + 
					 "&md5=" + score + 
					 "&timenum=" + this._info._timenum + 
					 "&activitynum=" + this._info._activitynum + 
					 "&isfrom=" + this._info._isfrom;
		let request = new egret.HttpRequest();
        request.responseType = egret.HttpResponseType.TEXT;
        request.open(this._info._typosTempjump+params, egret.HttpMethod.GET);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.send();
		request.addEventListener(egret.Event.COMPLETE, function() {
			let result = JSON.parse(request.response);
		}, this);
		request.addEventListener(egret.IOErrorEvent.IO_ERROR, function() {
        }, this);
	}

	//接口-游戏结束
    private gameOver() {
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
		request.addEventListener(egret.Event.COMPLETE, function() {
			let result = JSON.parse(request.response);
			let highScore = result["data"]["score"];
			if(this._score > parseInt(highScore)){
				highScore = this._score;
			}
			this._normalAlert = new Alert(Alert.GamePageScore, this._score.toString(), highScore,result["data"]["order"], result["data"]["text"],this._stageW,this._stageH);
			this._normalAlert.addEventListener(AlertEvent.Ranking, this.checkRanking, this);
			this._normalAlert.addEventListener(AlertEvent.Restart, this.restartGame, this);
			this.addChild(this._normalAlert);

		}, this);
		request.addEventListener(egret.IOErrorEvent.IO_ERROR, function() {
            alert("GameOver　post error : " + event);
        }, this);
    }

	//游戏结束alert-查看排名
	private checkRanking() {
		if(this._normalAlert && this._normalAlert.parent) {
			this._normalAlert.parent.removeChild(this._normalAlert);
		} 
        window.location.href = this._info._rankUrl + this._info._timenum + "/activitynum/" + this._info._activitynum + "/vuid/" + this._info._vuid + "/key/" + this._info._key + "/isfrom/" + this._info._isfrom;
    }

	//游戏结束alert-重玩
    private restartGame() {

		//移动当前场景
        this.removeChildren();

		//重玩时清空数组


		//重新初始化赋值参数


		this.minusGameCount();
    }

	private shareButtonClick() {
        //分享引导图
        let _shareGuide = new Bitmap("shareGui_png");
        _shareGuide.touchEnabled = true;
        _shareGuide.x =  0;
        _shareGuide.y =  0 ;
        _shareGuide.width = this.stage.stageWidth ;
        _shareGuide.height = this.stage.stageHeight ;
        _shareGuide.addEventListener(egret.TouchEvent.TOUCH_TAP, function() {
            this.removeChild(_shareGuide);
        }, this);
		this.addChild(_shareGuide);
	}
}