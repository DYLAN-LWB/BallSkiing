var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var __extends = this && this.__extends || function __extends(t, e) { 
 function r() { 
 this.constructor = t;
}
for (var i in e) e.hasOwnProperty(i) && (t[i] = e[i]);
r.prototype = e.prototype, t.prototype = new r();
};
/**
 * Created by Mac_c on 15/10/8.
 */
var Movie = (function (_super) {
    __extends(Movie, _super);
    function Movie() {
        return _super.call(this) || this;
        //      this.init();
    }
    Movie.prototype.init = function (str1, str2, str3, str4) {
        var data = RES.getRes(str1);
        var tex = RES.getRes(str2);
        this.mcf = new egret.MovieClipDataFactory(data, tex);
        this.mc = new egret.MovieClip();
        this.mc.movieClipData = this.mcf.generateMovieClipData(str3);
        this.mc.play(str4); //playTimes:number — 播放次数。 参数为整数，可选参数，>=1：设定播放次数，<0：循环播放，默认值 0：不改变播放次数(MovieClip初始播放次数设置为1)，
        this.addChild(this.mc);
        this.mc.addEventListener(egret.Event.COMPLETE, this.removeBomb, this);
    };
    Movie.prototype.removeBomb = function (evt) {
        if (this.parent != null) {
            this.parent.removeChild(this);
        }
    };
    return Movie;
}(egret.Sprite));
__reflect(Movie.prototype, "Movie");
//# sourceMappingURL=Movie.js.map