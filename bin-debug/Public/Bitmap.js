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
var Bitmap = (function (_super) {
    __extends(Bitmap, _super);
    function Bitmap(name) {
        var _this = _super.call(this) || this;
        var result = new egret.Bitmap();
        var texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }
    return Bitmap;
}(egret.Bitmap));
__reflect(Bitmap.prototype, "Bitmap");
//# sourceMappingURL=Bitmap.js.map