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
	private _scoreTextField; //显示的分数
	private _score = 0;	//分数
	private _gameTimer: egret.Timer;	//游戏计时器

	private _ball = new Bitmap("ball_png");	//小球
	private _moveToRight:boolean = true;	//小球是否在向右移动
	private _ballY = 400;
	private _ballMoveSpeed = 10;	//小球移动速度
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
	private _gameBg11;	//背景1
	private _gameBg22;	//背景2
	private _barrierArray1 = [];	//障碍物数组
	private _barrierArray2 = [];	//障碍物数组
	private _letterBgArray1 = [];	//字符数组
	private _letterBgArray2 = [];	//字符数组

	private _wordsArray = [];	//单词数组
	private _wordIndex = 0;	//当前是第几个单词
	private _wordTextField;		//显示的单词
	private _translateTextField;	//显示的翻译
	private _missLetter;	//单词缺的字母


	
	private createGameScene() {
		this._stageW = this.stage.stageWidth;
		this._stageH = this.stage.stageHeight;

		this._wordsArray = [
			{ "word":"Mondy", "chinese":"周一" },
			{ "word":"Tuesday", "chinese":"周二" },
			{ "word":"Wednesday", "chinese":"周三" },
			{ "word":"Thursday", "chinese":"周四" },
			{ "word":"Mondy", "chinese":"周一" },
			{ "word":"Tuesday", "chinese":"周二" },
			{ "word":"Wednesday", "chinese":"周三" },
			{ "word":"Thursday", "chinese":"周四" },
			{ "word":"Mondy", "chinese":"周一" },
			{ "word":"Tuesday", "chinese":"周二" },
			{ "word":"Wednesday", "chinese":"周三" },
			{ "word":"Thursday", "chinese":"周四" },
			{ "word":"Mondy", "chinese":"周一" },
			{ "word":"Tuesday", "chinese":"周二" },
			{ "word":"Wednesday", "chinese":"周三" },
			{ "word":"Thursday", "chinese":"周四" }
			];
		this.setupViews();
	}

	private setupViews() {
		//添加触摸事件
		this.stage.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.touchBegin, this);
		//添加帧事件
		this.addEventListener(egret.Event.ENTER_FRAME, this.frameObserve, this);

		//背景音乐
		let sound = new egret.Sound();
		sound.addEventListener(egret.Event.COMPLETE, function() {
			this._backgroundChannel = sound.play(0,0);
			this._backgroundChannel.volume = 0.8;
		}, this);
		sound.load("bg_mp3");

		//添加小球
		this._ball.width = 30;
		this._ball.height = 30;
		this._ball.anchorOffsetX = this._ball.width/2;
		this._ball.anchorOffsetY = this._ball.height/2;
		this._ball.x = this._stageW/2;
		this._ball.y = this._ballY;
		this.addChild(this._ball);
		
		this._guide = new Movie();
        this._guide.init("speed_json","speed_png","speed",-1);
		this._guide.alpha = 1;
		this._guide.width = 60;
		this._guide.height = 60;
		this._guide.anchorOffsetX = this._guide.width/2;
		this._guide.anchorOffsetY = this._guide.height;
		this._guide.x = this._ball.x;
		this._guide.y = this._ball.y;
		this.addChild(this._guide);

		//单词
		this._wordTextField  = new egret.TextField;
		this._wordTextField.x = 0;
		this._wordTextField.y = 50;
		this._wordTextField.width = this._stageW/2;
		this._wordTextField.height = 50;
		this._wordTextField.textColor = 0xffa340;
		this._wordTextField.verticalAlign = egret.VerticalAlign.MIDDLE;
		this._wordTextField.textAlign = egret.HorizontalAlign.CENTER;
		this._wordTextField.size = 35;
		this._wordTextField.text = "";
		this._wordTextField.fontFamily = "Microsoft YaHei";
		this.addChild(this._wordTextField);

		//翻译
		this._translateTextField  = new egret.TextField;
		this._translateTextField.x = 0;
		this._translateTextField.y = 100;
		this._translateTextField.width = this._stageW/2;
		this._translateTextField.height = 50;
		this._translateTextField.textColor = 0xffa340;
		this._translateTextField.verticalAlign = egret.VerticalAlign.MIDDLE;
		this._translateTextField.textAlign = egret.HorizontalAlign.CENTER;
		this._translateTextField.size = 35;
		this._translateTextField.text = "";
		this._translateTextField.fontFamily = "Microsoft YaHei";
		this.addChild(this._translateTextField);

		//分数
		let _scoreText  = new egret.TextField;
		_scoreText.x = this._stageW/2;
		_scoreText.y = 50;
		_scoreText.width = this._stageW/2;
		_scoreText.height = 50;
		_scoreText.textColor = 0x7ed7de;
		_scoreText.verticalAlign = egret.VerticalAlign.MIDDLE;
		_scoreText.textAlign = egret.HorizontalAlign.CENTER;
		_scoreText.size = 35;
		_scoreText.text = "得分";
		_scoreText.fontFamily = "Microsoft YaHei";
		this.addChild(_scoreText);

		this._scoreTextField  = new egret.TextField;
		this._scoreTextField.x = this._stageW/2;
		this._scoreTextField.y = 100;
		this._scoreTextField.width = this._stageW/2;
		this._scoreTextField.height = 50;
		this._scoreTextField.textColor = 0x7ed7de;
		this._scoreTextField.verticalAlign = egret.VerticalAlign.MIDDLE;
		this._scoreTextField.textAlign = egret.HorizontalAlign.CENTER;
		this._scoreTextField.size = 35;
		this._scoreTextField.text = "0";
		this._scoreTextField.fontFamily = "Microsoft YaHei";
		this.addChild(this._scoreTextField);

		this._gameTimer = new egret.Timer(1000, 99999);
		this._gameTimer.addEventListener(egret.TimerEvent.TIMER, function() {
			//改变分数
			this._score ++;
			this._scoreTextField.text = "" + this._score;
			if(this._isSpeedUp) {
				let speedTimer = new egret.Timer(500, 1);
				speedTimer.addEventListener(egret.TimerEvent.TIMER, function() {
				//改变分数
				this._score ++;
				this._scoreTextField.text = "" + this._score;
		
				}, this);
        		speedTimer.start();
			}

		}, this);
        this._gameTimer.start();

		//初次更新单词
		this.updateWord();

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

		this._gameBg11 = new egret.Sprite();
		this._gameBg11.x = 0;
		this._gameBg11.y = 0;
		this._gameBg11.width = this._stageW;
		this._gameBg11.height = this._stageH;
        this.addChild(this._gameBg11);

		this._gameBg22 = new egret.Sprite();
		this._gameBg22.x = 0;
		this._gameBg22.y = 0;
		this._gameBg22.width = this._stageW;
		this._gameBg22.height = this._stageH;
        this.addChild(this._gameBg22);
		
		//背景添加对象
		this.addBarriers(1);
		this._isFitstApperar = false;
		this.addBarriers(2);

		//设置初始位置
		this._lastLocusPointX = this._stageW/2;
		this._lastLocusPointY = this._ballY;
	}

	//更新单词
	private updateWord() {
		let word = this._wordsArray[this._wordIndex]["word"];
		let location = Math.floor(Math.random()*word.length);
		this._missLetter = word.slice(location,location+1);
		word = word.replace(this._missLetter,"( )");
		this._wordTextField.text = word;
		this._translateTextField.text = this._wordsArray[this._wordIndex]["chinese"];
	}

	private addBarriers(page) {
		if(page == 1) {
			this._barrierArray1.splice(0, this._barrierArray1.length);
			this._letterBgArray1.splice(0, this._letterBgArray1.length);
		} else {
			this._barrierArray2.splice(0, this._barrierArray2.length);
			this._letterBgArray2.splice(0, this._letterBgArray2.length);
		}

		for(var i = 0; i < ((this._isFitstApperar ? 2 : 5)+Math.random()*3); i++) {

			//背景
			let treeBg = new egret.Sprite;
			treeBg.x = Math.random()*(this._stageW-80);
			treeBg.y = Math.random()*(this._stageH-80-(this._isFitstApperar ? 700 : 0)) + (this._isFitstApperar ? 700 : 0);
			treeBg.width = 80;
			treeBg.height = 80;

			//树
			let treeImg  = new Bitmap("tree_png");
			treeImg.x = 0;
			treeImg.y = 0;
			treeImg.width = 80;
			treeImg.height = 80;
			treeBg.addChild(treeImg);

			//碰撞块
			let hitObject = new egret.Sprite;
			hitObject.width = 20;
			hitObject.height = 20;
			hitObject.anchorOffsetX = hitObject.width/2;
			hitObject.anchorOffsetY = hitObject.height/2;
			hitObject.x = 20;
			hitObject.y = treeBg.height - 15;
			hitObject.graphics.beginFill(0xff0000,0.001);
			hitObject.graphics.drawRect(0,0,20,20);
			hitObject.graphics.endFill();
			hitObject.name = "hit";
			treeBg.addChild(hitObject);

			if(page == 1) {
				this._gameBg11.addChild(treeBg);
				this._barrierArray1.push(treeBg);
			} else {
				this._gameBg22.addChild(treeBg);
				this._barrierArray2.push(treeBg);
			}
		}

		//添加字母
		let letterArray = ["a","b","c","d","e","f","g","h","i","g","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];
		let randomLetter = [];
		for (var i = 0; i < 3; i++){
			randomLetter.push(letterArray[Math.floor(Math.random()*letterArray.length)]);
		}
		randomLetter.push(this._missLetter);

		for(var l = 0; l < randomLetter.length; l++) {

			let letter = randomLetter[l].toLowerCase();
			let letImg = new Bitmap("Eword_json."+letter);
			letImg.width = 50;
			letImg.height = 50;
			letImg.anchorOffsetX = letImg.width/2;
			letImg.anchorOffsetY = letImg.height/2;
			letImg.x = 80 + Math.random()*(this._stageW-160);
			letImg.y = Math.random()*(this._stageH-80-(this._isFitstApperar ? 700 : 0)) + (this._isFitstApperar ? 700 : 0);
			letImg['name'] = randomLetter[l];

			if(page == 1) {
				this._gameBg1.addChild(letImg);
				this._letterBgArray1.push(letImg);
			} else {
				this._gameBg2.addChild(letImg);
				this._letterBgArray2.push(letImg);
			}
		}
	}

	//实时监听
	private frameObserve () {

		//根据移动方向设置球的位置,触碰到边缘游戏结束
		this._ball.x += (this._moveToRight == true ? this._ballMoveSpeed : -this._ballMoveSpeed);
		if((this._ball.x >= (this._stageW-this._ball.width)) || this._ball.x <= 0) {
			this.gameOverFunc();
		}

		//动画位置
		this._guide.x = this._ball.x;
		this._guide.y = this._ball.y;

		//移动游戏背景
		this._gameBg1.y -= this._bgMoveSpeed*this._baseSpeed;
		this._gameBg2.y -= this._bgMoveSpeed*this._baseSpeed;
		this._gameBg11.y = this._gameBg1.y;
		this._gameBg22.y = this._gameBg2.y;

		//重新设置背景位置,清空子视图
		if (this._gameBg1.y <= -this._stageH) {
			this._gameBg1.removeChildren();
			this._gameBg11.removeChildren();
			this._gameBg1.y = this._gameBg2.y + this._stageH;
			this._gameBg11.y = this._gameBg1.y;
			this._locusPointAaray.splice(0, this._locusPointAaray.length);
			this.addBarriers(1);
		}

		if (this._gameBg2.y <= -this._stageH) {
			this._gameBg2.removeChildren();
			this._gameBg22.removeChildren();
			this._gameBg2.y = this._gameBg1.y  + this._stageH;
			this._gameBg22.y = this._gameBg2.y;
			this._locusPointAaray.splice(0, this._locusPointAaray.length);
			this.addBarriers(2);
		}

		let locusPoint = new egret.Shape();	//轨迹点
		let currentLocusPointY = 0;	//点相对于背景图的Y值
		//判断添加到哪个背景,背景1的最大Y值在 _ballY ~ H+_ballY之间
		if ((this._gameBg1.y+this._gameBg1.height) > this._ballY && (this._gameBg1.y+this._gameBg1.height) <= (this._stageH+this._ballY)) {
			this._gameBg1.addChild(locusPoint);
			currentLocusPointY = this._ballY - this._gameBg1.y;
		} else {
			this._gameBg2.addChild(locusPoint);
			currentLocusPointY = this._ballY - this._gameBg2.y;
		}

		//跨背景图时特殊处理
		// console.log("line from= " + this._lastLocusPointY + " ----to " + (currentLocusPointY));
		if(this._lastLocusPointY >= (this._stageH - this._bgMoveSpeed*this._baseSpeed)) {
			this._lastLocusPointY = currentLocusPointY - this._bgMoveSpeed*this._baseSpeed;
		}

		//保存对象,起点,终点
		var dict = {
			"beginX":this._lastLocusPointX,
			"beginY":this._lastLocusPointY,
			"endX":this._ball.x,
			"endY":currentLocusPointY,
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
			point.graphics.lineStyle(maxWidth, this._isSpeedUp ? 0x7ed7de : 0x7ed7de, 1, true);
			point.graphics.moveTo(this._locusPointAaray[i]["beginX"], this._locusPointAaray[i]["beginY"]);
			point.graphics.lineTo(this._locusPointAaray[i]["endX"] , this._locusPointAaray[i]["endY"]);
		}

		//重新保存上次位置
		this._lastLocusPointX = this._ball.x;
		this._lastLocusPointY = currentLocusPointY;

		//碰撞检测
		this.checkBarrierHit();
	}
 
	//点击屏幕
	private touchBegin(event: egret.TouchEvent) {
		var bufferTimer: egret.Timer = new egret.Timer(5, 20);
        bufferTimer.addEventListener(egret.TimerEvent.TIMER, this.bufferTimerFunc, this);
        bufferTimer.addEventListener(egret.TimerEvent.TIMER_COMPLETE, this.bufferTimerComFunc, this);
        bufferTimer.start();

		this._guide.alpha = 1;
		this._guide.rotation = this._moveToRight ? 90 : -90;
		
		var speed:number = egret.setTimeout(function(param){
			this._guide.alpha = 1;
			this._guide.rotation = 0;
			
		}, this, 2000, "param");
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
		var timer: egret.Timer = new egret.Timer(5, 20);
        timer.addEventListener(egret.TimerEvent.TIMER, this.timerFunc, this);
        timer.start();
    }
	//加速
	private timerFunc(event:egret.TimerEvent) {
        this._ballMoveSpeed += 0.5;
		if(this._ballMoveSpeed > 10) {
			this._ballMoveSpeed = 10;
		}
    }

	private checkBarrierHit() {

		for(let index = 0; index < this._barrierArray1.length; index++) {
			let bar = this._barrierArray1[index].getChildByName("hit");
			let _isHit: boolean = bar.hitTestPoint(this._ball.x, this._ball.y);
			if(_isHit) {
				this.gameOverFunc();
			} 
		}
		for(let index = 0; index < this._barrierArray2.length; index++) {
			let bar = this._barrierArray2[index].getChildByName("hit");
			let _isHit: boolean = bar.hitTestPoint(this._ball.x, this._ball.y);
			if(_isHit) {
				this.gameOverFunc();
			} 
		}

		for(let index = 0; index < this._letterBgArray1.length; index++) {
			let bar = this._letterBgArray1[index];
			let _isHit: boolean = bar.hitTestPoint(this._ball.x, this._ball.y);
			if(_isHit) {
				var tf = this._letterBgArray1[index];
				if(tf && tf.parent) {
					this.hitWordLetter(tf);
					tf.parent.removeChild(tf);
				}
			} 
		}
		for(let index = 0; index < this._letterBgArray2.length; index++) {
			let bar = this._letterBgArray2[index];
			let _isHit: boolean = bar.hitTestPoint(this._ball.x, this._ball.y);
			if(_isHit) {
				var tf = this._letterBgArray2[index];
				if(tf && tf.parent) {
					this.hitWordLetter(tf);
					tf.parent.removeChild(tf);
				}
			} 
		}
	}

	private hitWordLetter(tf) {
		console.log(tf["name"]);

		let text = tf["name"];
		if(text == this._missLetter) {
			this._wordTextField.text = this._wordTextField.text.replace("( )","("+ text + ")");
			this._wordIndex++;
			this.updateWord();	
			if(this._wordIndex < this._wordsArray.length-1) {
				this._isSpeedUp = true;
				this._baseSpeed = 1.5;
				var speed:number = egret.setTimeout(function(param){
					this._isSpeedUp = false;
					this._baseSpeed = 1;
				}, this, 2000, "param");
			}
		}
	}

	//游戏结束
	private gameOverFunc () {
		// alert("game over");
		this.stage.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.touchBegin, this);
		this.removeEventListener(egret.Event.ENTER_FRAME, this.frameObserve, this);
		if (this._gameTimer) this._gameTimer.stop();

		if (this._backgroundChannel) this._backgroundChannel.stop();
		// // this.gameOver();
		// //test
		this._normalAlert = new Alert(Alert.GamePageScore, ""+this._score, ""+this._score, "1", 0,this._stageW,this._stageH);
		this._normalAlert.addEventListener(AlertEvent.Restart, this.restartGame, this);
		this.addChild(this._normalAlert);
	}

	private restartGame() {
		this.removeChildren();
		this.addChild(new Games());
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
				this.setupViews();
				
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

	//接口-请求单词
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