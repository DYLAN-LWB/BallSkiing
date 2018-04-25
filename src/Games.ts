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

	private _ball = new egret.Sprite();	//小球
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
	private _randomTreeNum = 5;

	private _wordsArray = [];	//单词数组
	private _wordTextField;		//显示的单词
	private _translateTextField;	//显示的翻译
	private _missLetter;	//单词缺的字母


	
	private createGameScene() {
		this._stageW = this.stage.stageWidth;
		this._stageH = this.stage.stageHeight;

		//test	
		this.getWords(1);
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
		}, this);
		sound.load("resource/sound/bg.mp3");

		//添加轨迹背景1
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

		//树图层,避免轨迹在树上方
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

		//添加小球
		this._ball.width = 30;
		this._ball.height = 30;
		this._ball.anchorOffsetX = this._ball.width/2;
		this._ball.anchorOffsetY = this._ball.height/2;
		this._ball.x = this._stageW/2;
		this._ball.y = this._ballY;
		this._ball.graphics.beginFill(0x7ed7de,1);
		this._ball.graphics.drawCircle(15,15,15);
		this._ball.graphics.endFill();
		this.addChild(this._ball);

		//单词
		this._wordTextField  = new egret.TextField;
		this._wordTextField.x = 0;
		this._wordTextField.y = 30;
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
		this._translateTextField.y = 80;
		this._translateTextField.width = this._stageW/2;
		this._translateTextField.height = 100;
		this._translateTextField.textColor = 0xffa340;
		this._translateTextField.verticalAlign = egret.VerticalAlign.TOP;
		this._translateTextField.textAlign = egret.HorizontalAlign.CENTER;
		this._translateTextField.size = 30;
		this._translateTextField.text = "";
		this._translateTextField.fontFamily = "Microsoft YaHei";
		this.addChild(this._translateTextField);

		//分数
		let _scoreText  = new egret.TextField;
		_scoreText.x = this._stageW/2;
		_scoreText.y = 30;
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
		this._scoreTextField.y = 80;
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
			if(!this._isSpeedUp) {
				this._score ++;
				this._scoreTextField.text = "" + this._score;
			}

		}, this);
        this._gameTimer.start();

		//初次更新单词
		this.updateWord();

		//背景添加对象
		this.addBarriers(1);
		this._isFitstApperar = false;
		this.addBarriers(2);

		//设置轨迹点初始位置
		this._lastLocusPointX = this._stageW/2;
		this._lastLocusPointY = this._ballY;
	}

	//更新单词
	private updateWord() {
		let word = this._wordsArray[0]["word"];
		let location = Math.floor(Math.random()*word.length);
		this._missLetter = word.slice(location,location+1);
		word = word.replace(this._missLetter,"( )");
		this._wordTextField.text = word;
		this._translateTextField.text = this._wordsArray[0]["explain"];

		//显示之后删除
		this._wordsArray.splice(0,1);
		//检查单词剩余个数
		if(this._wordsArray.length < 3){
			this.getWords(2);
		}
	}

	private addBarriers(page) {
		if(page == 1) {
			this._barrierArray1.splice(0, this._barrierArray1.length);
			this._letterBgArray1.splice(0, this._letterBgArray1.length);
		} else {
			this._barrierArray2.splice(0, this._barrierArray2.length);
			this._letterBgArray2.splice(0, this._letterBgArray2.length);
		}

		if(this._score > 50) this._randomTreeNum = 10;
		if(this._score > 100) this._randomTreeNum = 15;
		if(this._score > 150) this._randomTreeNum = 20;
		if(this._score > 200) this._randomTreeNum = 25;
		if(this._score > 250) this._randomTreeNum = 30;
		if(this._score > 300) this._randomTreeNum = 40;
		if(this._score > 350) this._randomTreeNum = 50;

		for(var i = 0; i < ((this._isFitstApperar ? 2 : 5)+Math.random()*this._randomTreeNum); i++) {
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
			hitObject.height = 30;
			hitObject.anchorOffsetX = hitObject.width/2;
			hitObject.anchorOffsetY = hitObject.height/2;
			hitObject.x = 20;
			hitObject.y = treeBg.height - 15;
			hitObject.graphics.beginFill(0xff0000,0.001);
			hitObject.graphics.drawRect(0,0,20,30);
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
			letImg.width = 60;
			letImg.height = 60;
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
		if((this._ball.x >= (this._stageW-this._ball.width/2)) || this._ball.x <= this._ball.width/2) {
			this.gameOverFunc();
		}
		
		if(this._guide) {
			this._guide.x += (this._moveToRight == true ? this._ballMoveSpeed : -this._ballMoveSpeed);
		}

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
			this.addBarriers(1);
		}

		if (this._gameBg2.y <= -this._stageH) {
			this._gameBg2.removeChildren();
			this._gameBg22.removeChildren();
			this._gameBg2.y = this._gameBg1.y  + this._stageH;
			this._gameBg22.y = this._gameBg2.y;
			this.addBarriers(2);
		}

		//移除超出屏幕的
		if (this._locusPointAaray.length > 40) {
			this._locusPointAaray.splice(0, 1);
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
		if(this._lastLocusPointY >= (this._stageH - this._bgMoveSpeed*this._baseSpeed)) {
			this._lastLocusPointY = currentLocusPointY - this._bgMoveSpeed*this._baseSpeed;
		}

		locusPoint.graphics.lineStyle(this._locusW, 0x7ed7de, 1, true);
		locusPoint.graphics.moveTo(this._lastLocusPointX, this._lastLocusPointY);
		locusPoint.graphics.lineTo(this._ball.x, currentLocusPointY);

		this._locusPointAaray.push(locusPoint);

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

		if(this._guide && this._guide.parent) {
			this._guide.parent.removeChild(this._guide);
		}
		this._guide = new Movie();
        this._guide.init("speed_json","speed_png","speed",-1);
		this._guide.width = 50;
		this._guide.height = 150;
		this._guide.anchorOffsetX = this._guide.width/2;
		this._guide.anchorOffsetY = this._guide.height;
		this._guide.x = this._ball.x - this._ball.width;
		this._guide.y = this._ball.y - this._ball.height;
		
		if(this._moveToRight) {
			this._guide.rotation = 30;
			this._guide.x = this._ball.x - this._ball.width + 30;
			this._guide.y = this._ball.y - this._ball.height - 25;
		} else {
			this._guide.rotation = -30;
			this._guide.x = this._ball.x - this._ball.width - 30;
			this._guide.y = this._ball.y - this._ball.height + 10;
		}
		this.addChild(this._guide);

		var speed:number = egret.setTimeout(function(param){
			if(this._guide && this._guide.parent) {
				this._guide.parent.removeChild(this._guide);
			}
		}, this, 600, "param");
	}
	//减速
 	private bufferTimerFunc(event:egret.TimerEvent) {445301354
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

		let sound = new egret.Sound();
		sound.addEventListener(egret.Event.COMPLETE, function() {
			let channel:egret.SoundChannel = sound.play(0,1);
		}, this);
		sound.load("resource/sound/eat.mp3");

		let text = tf["name"];
		if(text == this._missLetter) {
			let sound = new egret.Sound();
			sound.addEventListener(egret.Event.COMPLETE, function() {
				let channel:egret.SoundChannel = sound.play(0,1);
			}, this);
			sound.load("resource/sound/speedup.mp3");

			this._wordTextField.text = this._wordTextField.text.replace("( )","("+ text + ")");

			this.updateWord();	
			this._isSpeedUp = true;
			this._baseSpeed = 1.7;
			//改变分数
			let speedTimer = new egret.Timer(100, 20);
			speedTimer.addEventListener(egret.TimerEvent.TIMER, function() {
				this._score++;
				this._scoreTextField.text = "" + this._score;
			}, this);
			speedTimer.start();

			var speed:number = egret.setTimeout(function(param){
				this._isSpeedUp = false;
				this._baseSpeed = 1;
			}, this, 2000, "param");
		}
	}

	//游戏结束
	private gameOverFunc () {
		//取消监听事件
		this.stage.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.touchBegin, this);
		this.removeEventListener(egret.Event.ENTER_FRAME, this.frameObserve, this);
		if (this._gameTimer) this._gameTimer.stop();
		if (this._backgroundChannel) this._backgroundChannel.stop();

		let sound = new egret.Sound();
		sound.addEventListener(egret.Event.COMPLETE, function() {
			let channel:egret.SoundChannel = sound.play(0,1);
		}, this);
		sound.load("resource/sound/boom.mp3");

		//改变背景
		let gameChange = new egret.Sprite();
		gameChange.x = 0;
		gameChange.y = 0;
		gameChange.width = this._stageW;
		gameChange.height = this._stageH;
        this.addChild(gameChange);

		egret.setTimeout(function(){
			gameChange.graphics.beginFill(0xFF0000,0.6);
			gameChange.graphics.drawRect(0,0,this._stageW,this._stageH);
			gameChange.graphics.endFill();
		},this,50);

		egret.setTimeout(function(){
			gameChange.graphics.clear();
		},this,100);

		egret.setTimeout(function(){
			gameChange.graphics.clear();
			gameChange.graphics.beginFill(0xFF0000,0.6);
			gameChange.graphics.drawRect(0,0,this._stageW,this._stageH);
			gameChange.graphics.endFill();
		},this,150);

		egret.setTimeout(function(){
			gameChange.graphics.clear();
		},this,200);

		egret.setTimeout(function(){
			gameChange.graphics.clear();
			gameChange.graphics.beginFill(0xFF0000,0.6);
			gameChange.graphics.drawRect(0,0,this._stageW,this._stageH);
			gameChange.graphics.endFill();
		},this,250);

		egret.setTimeout(function(){
			gameChange.graphics.clear();
			gameChange.graphics.beginFill(0x000000,0.6);
			gameChange.graphics.drawRect(0,0,this._stageW,this._stageH);
			gameChange.graphics.endFill();

			// this.gameOver();
			//test
			this._normalAlert = new Alert(Alert.GamePageScore, ""+this._score, ""+this._score, "1", 0,this._stageW,this._stageH);
			this._normalAlert.addEventListener(AlertEvent.Restart, this.restartGame, this);
			this.addChild(this._normalAlert);

		},this,300);
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
				this.getWords(1);
				
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
	private getWords(type:number) {
		// let params = "?vuid=" + this._info._vuid + 
		// 			 "&key=" + this._info._key +
		// 			 "&rands=" + this._rands + 
		// 			 "&isfrom=" + this._info._isfrom;
		let params = "?vuid=6&key=296aab45fdcfc1695ef7f1202893f461&rands=9&isfrom=1";
		let request = new egret.HttpRequest();
        request.responseType = egret.HttpResponseType.TEXT;
        request.open(this._info._getWord + params, egret.HttpMethod.GET);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.send();
		request.addEventListener(egret.Event.COMPLETE, function() {
			let result = JSON.parse(request.response);
			
	        if (result["code"] == 0) {
				
				for(let i = 0; i < result["data"].length; i++) {
					let dict = result["data"][i];
					this._wordsArray.push(dict);
				}
				console.log(this._wordsArray);
				if(type == 1){
					this.setupViews();
				}
				
			} else {
				alert(result["msg"]);
			}
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