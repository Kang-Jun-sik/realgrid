var $$_SCROLL_SIZE = 17;
var Dom = defineClass("Dom", null, {
	init: function (element) {
		this._super();
		this._element = element;
	},
	x: function () {
		return this._element.offsetLeft;
	},
	y: function () {
		return this._element.offsetTop;
	},
	size: function () {
		return Dom.getSize(this._element);
	},
	element: function () {
		return this._element;
	},
	detach: function () {
		this._element.parentNode && this._element.parentNode.removeChild(this._element);
	},
	clearChildren: function () {
        Dom.clearChildren(this._element);
	},
	addChild: function (child) {
		Dom.addChild(this._element, child);
	},
	setStyles: function (styles) {
		Dom.setStyles(this._element, styles);
	},
	getBounds: function () {
		return Dom.getBounds(this._element);
	},
	getOffset: function () {
		return Dom.getOffset(this._element);
	},
	move: function (x, y) {
		Dom.move(this._element, x, y);
	},
	disableSelection: function () {
		Dom.disableSelection(this._element);
	},
	isAncestorOf: function (element) {
		var p = element.parentElement;
		while (p) {
			if (p == this._element) {
				return true;
			}
		}
		return false;
	}
}, {
	createElement: function (elementType, styles, attrs) {
		var elt = document.createElement(elementType);
		styles && Dom.setStyles(elt, styles);
        if (attrs) {
            for (var attr in attrs) {
                elt[attr] = attrs[attr];
            }
        }
		return elt;
	},
	setStyles: function (element, styles) {
		if (styles) {
			var eltStyles = element.style;
			for (var p in styles) {
				eltStyles[p] = styles[p];
			}
		}
	},
	addWindowListener: function (event, callback) {
		__addWindowEventListener(this, event, callback);
		//_win.addEventListener(event, callback);
	},
	removeWindowListener: function (event, callback) {
		__removeWindowEventListener(this, event, callback);
		//_win.removeEventListener(event, callback);
	},
	getSize: function (element) {
		var r = element.getBoundingClientRect();
		return { width: r.width, height: r.height };
	},
	setSize: function (element, w, h) {
		var style = element.style;
		style.width = w + "px";
		style.height = h + "px";
	},
	getBounds: function (element) {
		var r = element.getBoundingClientRect();
		/*
		*/
		r.cx = element.offsetLeft;
		r.cy = element.offsetTop;
		return r;
	},
	setBounds: function (element, x, y, w, h) {
		var style = element.style;
		style.left = x + "px";
		style.top = y + "px";
		style.width = w + "px";
		style.height = h + "px";
	},
	getScrolled: function () {
		var body = document.body;
		var docElem = document.documentElement;
		return {
			sx: window.pageXOffset || docElem.scrollLeft || body.scrollLeft,
			sy: window.pageYOffset || docElem.scrollTop || body.scrollTop
		};
	},
	getOffset: function (element) {
		var box = element.getBoundingClientRect();
		var body = document.body;
		var docElem = document.documentElement;
		var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
		var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
		var clientTop = docElem.clientTop || body.clientTop || 0;
		var clientLeft = docElem.clientLeft || body.clientLeft || 0;
		var x = box.left + scrollLeft - clientLeft;
		var y = box.top + scrollTop - clientTop;
		return { x: Math.round(x), y: Math.round(y) }
	},
	move: function (element, x, y) {
		element.style.left = x + "px";
		element.style.top = y + "px";
	},
	disableSelection: function (element) {
		element.style["-moz-user-select"] = "-moz-none";
		element.style["-khtml-user-select"] = "none";
		element.style["-webkit-user-select"] = "none";
		element.style["-o-user-select"] = "none";
		element.style["-ms-user-select"] = "none";
		element.style["user-select"] = "none";
		/*
		if (typeof element.onselectstart !== 'undefined') {
			element.onselectstart = function() { return false; };
		} else if (typeof element.style.MozUserSelect !== 'undefined') {
			element.style.MozUserSelect = 'none';
		} else {
			element.onmousedown = function() { return false; };
		}
		*/
	},
	addChild: function (element, child) {
		if (element && child && child.parentNode !== element) {
			element.appendChild(child);
			return true;
		}
		return false;
	},
	removeChild: function (element, child) {
		if (element && child && child.parentNode === element) {
			element.removeChild(child);
			return true;
		}
		return false;
	},
    clearChildren: function (element) {
        var elt = element;
        while (elt.lastChild) {
            elt.removeChild(elt.lastChild);
        }
    },
    clearElements: function(element) {
    	while (element.lastChild) {
    		Dom.clearElements(element.lastChild);
    		element.removeChild(element.lastChild);
    	}
    },    
	getChildIndex: function (element) {
        if (element) {
            var parent = element.parentNode;
            if (parent) {
                var childs = parent.childNodes;
                for (var i = 0; i < childs.length; i++) {
                    if (childs[i] === element) {
                        return i;
                    }
                }
            }
        }
		return -1;
	},
    getRadioGroupValue: function (groupName) {
        var items = document.getElementsByName(groupName);
        if (items) {
            for (var i = items.length; i--;) {
                if (items[i].checked) {
                    return items[i].value;
                }
            }
        }
        return undefined;
    },
	htmlEncode: function (text) {
		return document.createElement('a').appendChild(document.createTextNode(text)).parentNode.innerHTML;
	},
	getClipRect: function (r) {
		return "rect(" + r.y + "px," + (r.x + r.width) + "px," + (r.y + r.height) + "px," + r.x + "px)";
	},
	renderTextRect: function (span, font, fill, text, r, align) {
		Dom.renderTextBounds(span, font, fill, text, r.x, r.y, r.width, r.height, align);
	},
	renderTextBounds: function (span, font, fill, text, x, y, w, h, align, valign) {
		if (fill && text) {
			var css = span.style;
			span.textContent = text;
			css.font = font ? font.font : DEF_FONT;
			css.color = fill.css();
			css.whiteSpace = "nowrap";
            css.textDecoration = font.underline ? "underline" : "none";
			var cr = span.getBoundingClientRect2();
			switch (align) {
				case TextAlign.CENTER:
					x = x + (w - cr.width) / 2;
					break;
				case TextAlign.RIGHT:
					x = x + w - cr.width;
					break;
			}
			css.left = x + "px";
			switch (valign) {
				case TextLayout.TOP:
					break;
				case TextLayout.BOTTOM:
					y = y + h - cr.height;
					break;
				case TextLayout.MIDDLE:
				default:
					y = y + (h - cr.height) / 2;
					break;
			}
			css.top = y + "px";
		}
	},
	isAncestorOf: function (elt, child) {
		var p = child.parentElement;
		while (p) {
			if (p == elt) {
				return true;
			}
			p = p.parentElement;
		}
		return false;
	}
});