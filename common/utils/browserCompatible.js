var _isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
var _isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
var _isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
var _isWhale = !!window.whale; // whale은 체크만하고 처리하지는 않는다. 
var _isChrome = !!window.chrome && !_isOpera;              // Chrome 1+
var _isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0 || (!_isChrome && !_isOpera && navigator.userAgent.indexOf("Safari") >= 0);
var _isWinSafari = _isSafari && (navigator.platform == "Win32" || navigator.userAgent.indexOf("Windows") >= 0);
var _isIE = /*@cc_on!@*/false || !!document.documentMode; // At least IE6
var _isEdge = navigator.userAgent.toLowerCase().indexOf('edge/') >= 0; // MS Edge 
var _ieVer = (function(){
    var undef,
        v = 3,
        div = document.createElement('div'),
        all = div.getElementsByTagName('i');
    while (
        div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
            all[0]
        );
    return v > 4 ? v : undef;
})();
var _ieOld = _ieVer !== undefined && _ieVer <= 9;
var _ieLeg = _ieVer !== undefined && _ieVer <= 8;
var _norgba = false;
var _ieTen = navigator.appVersion.indexOf("MSIE 10") !== -1;
var _ieNine = navigator.appVersion.indexOf("MSIE 9") !== -1;

(function () {
    var div = document.createElement('div');
    var err = false;
    var cr;
    try {
        cr = div.getBoundingClientRect();
    } catch (e) {
        err = true;
    }
    if (err || isNaN(cr.width)) {
        Element.prototype.getBoundingClientRect2 = function () {
            var cr = Element.prototype.getBoundingClientRect.call(this);
            return {
                left: cr.left,
                right: cr.right,
                width: cr.right - cr.left,
                top: cr.top,
                bottom: cr.bottom,
                height: cr.bottom - cr.top
            }
        };
    } else {
        Element.prototype.getBoundingClientRect2 = Element.prototype.getBoundingClientRect;
    }
    try {
        div.style.background = "rgba(0, 0, 0, 1)";
    } catch (e) {
        _norgba = true;
    }
})();
if (Object.defineProperty && Object.getOwnPropertyDescriptor &&
    Object.getOwnPropertyDescriptor(Element.prototype, "textContent") &&
    !Object.getOwnPropertyDescriptor(Element.prototype, "textContent").get) {
    (function () {
        var innerText = Object.getOwnPropertyDescriptor(Element.prototype, "innerText");
        Object.defineProperty(Element.prototype, "textContent", {
            get: function () {
                return innerText.get.call(this)
            },
            set: function (x) {
                return innerText.set.call(this, x)
            }
        });
    })();
}
var _getBrowserSize = function () {
    return {
        width: _win.innerWidth || _doc.documentElement.clientWidth || _doc.body.clientWidth,
        height: _win.innerHeight || _doc.documentElement.clientHeight || _doc.body.clientHeight
    };
};