/*jscrambler
 {
 "ignore_transformations_@": {
 "*": {
 "*": false
 },
 "ignorewm": {
 "*": false,
 "string_splitting": true
 }
 }
 }
 */
//"use strict";

var Grids = (function ($) {
	var _win = $ || window;
	var _doc = ($ && $.document) || document;
	var _ver = "/*$version$*/";
	var $$_rootContext = "";
    var $$_assets = "assets/";

	var _setRootContext = function (path) {
		if (path) {
			path = String(path).trim();
		}
		if (path && path.lastIndexOf('/') != path.length - 1) {
			path += '/';
		}
		$$_rootContext = path;
	};
    var _setAssetRoot = function (path) {
        if (path) {
            path = String(path).trim();
        }
        if (path && path.lastIndexOf('/') != path.length - 1) {
            path += '/';
        }
        $$_assets = path;
    };
	var _getAsset = function (url) {
        return "url(" + $$_rootContext + $$_assets + url + ")";
	};
	var _getVersion = function () {
		return _ver;
	};

	var REALGRID_LISTENER_STACK = "realgrid_event_stack";
	__addWindowEventListener = function (ref, type, listener, useCapture){
		var temp = window[REALGRID_LISTENER_STACK];
		if(!temp){
			window[REALGRID_LISTENER_STACK] = temp = [];
		}
		temp.push({ref : ref, type : type, listener : listener, useCapture : useCapture});
		//console.log("RealGrid addWindowEventListener call", ref);
		return _win.addEventListener(type, listener, useCapture);
	};
	__removeWindowEventListener = function (ref, type, listener, useCapture){
		return _win.addEventListener(_win, type, listener, useCapture);
	};
	__clearWindowEventListeners = function(ref){
		var events = window[REALGRID_LISTENER_STACK];
		for (var i = events.length - 1, event; i >= 0; i--) {
			event = events[i];
			if(event.ref === ref){
				_win.removeEventListener(event.type, event.listener, event.useCapture);
				events.splice(i, 1);
			}
		}
		//console.log("RealGrid clearWindowEventListeners call", events.length);
	};