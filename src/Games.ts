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

	private _stageW;	//舞台宽度
	private _stageH;	//舞台高度
	private _backgroundChannel: egret.SoundChannel;	//游戏背景音乐

	//this game
	private _ball = new egret.Sprite;	//真实小球
	private _falseBall = new egret.Sprite;	//顶部的小球,位置与真正的相反
	private _moveToRight:boolean = false;	//小球是否在向右移动
	private _ballLocus; //轨迹 
	private _moveSepped = 0.3;	//小球移动速度
	private _lastToX = 0;//小球上次移动到的位置(上次点击的位置)(顶部小球动画终点位置)

	private createGameScene() {
		//常量设置
		this._stageW = this.stage.stageWidth;
		this._stageH = this.stage.stageHeight;

		this.setupViews();

		//添加触摸事件
		this.stage.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.touchBegin, this);


	}

	private setupViews() {
		//背景音乐
		let sound = new egret.Sound();
		sound.addEventListener(egret.Event.COMPLETE, function() {
			this._backgroundChannel = sound.play(0,0);
			this._backgroundChannel.volume = 0.9;
		}, this);
		sound.load("resource/sound/bg.mp3");

		//添加对象
		this._ball.x = this._stageW/2;
		this._ball.y = 400;
		this._ball.width = 20;
		this._ball.height = 20;
		this._ball.graphics.beginFill(0x00C5CD,1);
		this._ball.graphics.drawCircle(10, 10, 10);
		this._ball.graphics.endFill();
		this.addChild(this._ball);

		//顶部跟随点
		this._falseBall.x = this._stageW / 2;
		this._falseBall.y = 0;
		this._falseBall.width = 2;
		this._falseBall.height = 2;
		this._falseBall.graphics.beginFill(0xFFFFE0,1);
		this._falseBall.graphics.drawCircle(1, 1, 1);
		this._falseBall.graphics.endFill();
		this.addChild(this._falseBall);
	}

	private touchBegin(event: egret.TouchEvent) {
		console.log(this._ballLocus);
		if(!this._ballLocus) {
			this._ballLocus = new egret.Shape()
			this.addChild(this._ballLocus); 
			//添加实时监听
			this.addEventListener(egret.Event.ENTER_FRAME, this.locusAnimation, this);
		}

		//更新顶部小球的动画重点位置
		this._lastToX = this._ball.x;

		//每次点击移除之前的缓动动画
		egret.Tween.removeTweens(this._ball);
		egret.Tween.removeTweens(this._falseBall);

		//正在向右移动
		if(this._moveToRight == true) {
			egret.Tween.get(this._ball).to({x:0}, this._ball.x/this._moveSepped);
			egret.Tween.get(this._falseBall).to({x:this._lastToX}, this._ball.x/this._moveSepped);

		} else {
			egret.Tween.get(this._ball).to({x:this._stageW-this._ball.width}, (this._stageW - this._ball.width - this._ball.x)/this._moveSepped);
			egret.Tween.get(this._falseBall).to({x:this._lastToX}, (this._stageW - this._ball.width - this._ball.x)/this._moveSepped);
		}

		//更改移动方向
		this._moveToRight = !this._moveToRight;
	}


	//画运动轨迹
	private locusAnimation() {
		//x左边控制点 
		let controlX = this._stageW/2  + (this._moveToRight ?  -150 : 100);

		this._ballLocus.graphics.clear();
		this._ballLocus.graphics.lineStyle(5,0x00C5CD);  
		this._ballLocus.graphics.moveTo(this._ball.x+this._ball.width/2, this._ball.y+this._ball.height/2);  //起点  
		this._ballLocus.graphics.curveTo(controlX, 100, this._falseBall.x, this._falseBall.y);  //控制点,终点  
		this._ballLocus.graphics.endFill(); 
	}






	//游戏结束
	private gameTimerCompleteFunc () {

		this.stage.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.touchBegin, this);

		if (this._backgroundChannel) this._backgroundChannel.stop();

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