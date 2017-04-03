var /* @abstract */ CellButtonRenderer = defineClass("CellButtonRenderer", null, {
	init: function (name) {
		this._super();
		this._name = name;
	},
	name: function () {
		return this._name;
	},
	measure: function (index, hintWidth, hintHeight) {
		return this._doMeasure(index, hintWidth, hintHeight);	
	},
	render: function (index, g, r, hovered, pressed, focused, buttonIndex) {
		this._doRender(index, g, r, hovered, pressed, focused, buttonIndex);
	},
	hitTest: function (w, h, x, y) {
		return this._doHitTest(w, h, x, y);
	},
	getButtonIndex: function (w, h, x, y) {
		return this._buttonIndex(w, h, x, y);
	},
	toString: function () {
		return this._name;
	},
	_doMeasure: function (index, hintWidth, hintHeight) {
		return new Size(hintWidth, hintHeight);
	},
	_doRender: function (index, g, r, hovered, pressed, focused) {
	},
	_doHitTest: function (w, h, x, y) {
		return true;
	},
	_buttonIndex: function (w, h, x, y) {
		return 0;
	}
});
var DefaultCellButtonRenderer = defineClass("DefaultCellButtonRenderer", CellButtonRenderer, {
	init: function (name) {
		this._super(name);
		this._inited = false;
		this._imageUrls = {
			ed: "ellipsis_down.png",
			eh: "ellipsis_hover.png",
			eu: "ellipsis_up.png",
			dd: "dropdown_down.png",
			dh: "dropdown_hover.png",
			du: "dropdown_up.png",
			cd: "calendar_down.png",
			ch: "calendar_hover.png",
			cu: "calendar_up.png"
		};
		this._images = {};
	},
	prepare: function (grid) {
		if (!this._inited) {
			for (var p in this._imageUrls) {
				grid.getImage($$_rootContext + $$_assets + this._imageUrls[p]);
			}
			this._inited = true;
		}
	},
	_doMeasure: function (index, hintWidth, hintHeight) {
		return new Size(DefaultCellButtonRenderer.BUTTON_WIDTH + 4, hintHeight);
	},
	_doRender: function (index, g, r, hovered, pressed, focused) {
		var column = index.dataColumn();
		if (column) {
			var br = r.clone();
			if (focused && index.grid().isEditing()) {
				br.leftBy(2);
				br.rightBy(-2);
			} else {
				br.leftBy(1);
				br.rightBy(-3);
			}
			var button = column.button();
			if (button == CellButton.ACTION) {
				this.$_drawEllipsisButton(index.grid(), g, br, true, hovered, pressed);
			} else if (button == CellButton.POPUP) {
				this.$_drawMenuButton(index.grid(), g, br, true, hovered, pressed);
			}
		}
	},
	$_getImage: function (grid, key, url) {
		var img = this._images[key];
		if (!img) {
			img = grid.getImage($$_rootContext + $$_assets + url);
			if (img) {
				this._images[key] = img;
			}
		}
		return img;
	},
	$_drawEllipsisButton: function (grid, g, r, enabled, hovered, pressed) {
		var w, h;
		var img = pressed ? "ed" : hovered ? "eh" : "eu";
		img = this.$_getImage(grid, img, this._imageUrls[img]);
		if (img && (w = img.width) > 0 && (h = img.height) > 0) {
			var x = _int(r.x + (r.width - w) / 2);
			var y = _int(r.y + (r.height - h) / 2);
			g.drawImage(img, x, y, w, h);
		}
	},
	$_drawMenuButton: function (grid, g, r, enabled, hovered, pressed) {
		var w, h;
		var img = pressed ? "dd" : hovered ? "dh" : "du";
		img = this.$_getImage(grid, img, this._imageUrls[img]);
		if (img && (w = img.width) > 0 && (h = img.height) > 0) {
			var x = _int(r.x + (r.width - w) / 2);
			var y = _int(r.y + (r.height - h) / 2);
			g.drawImage(img, x, y, w, h);
		}
	},
	$_drawCalendarButton: function (grid, g, r, enabled, hovered, pressed) {
		var w, h;
		var img = pressed ? "cd" : hovered ? "ch" : "cu";
		img = this.$_getImage(grid, img, this._imageUrls[img]);
		if (img && (w = img.width) > 0 && (h = img.height) > 0) {
			var x = _int(r.x + (r.width - w) / 2);
			var y = _int(r.y + (r.height - h) / 2);
			g.drawImage(img, x, y, w, h);
		}
	}
}, {
	BUTTON_WIDTH: 16,
	BUTTON_HEIGHT: 14
});
var EditButtonType = _enum({
	COMBO: "combo",
	ELLIPSIS: "ellipsis",
	CALENDAR: "calendar"
});
var EditButtonRenderer = defineClass("EditButtonRenderer", DefaultCellButtonRenderer, {
	init: function (name) {
		this._super(name);
	},
	buttonType: EditButtonType.COMBO,
	_doRender: function(index, g, rc, hovered, pressed, focused) {
		var column = index.dataColumn();
		if (column) {
			var br = rc.clone();
			br.leftBy(1);
			br.rightBy(-3);
			br.topBy(Math.max(1, _int((rc.height - DefaultCellButtonRenderer.BUTTON_HEIGHT) / 2)));
			br.setBottom(Math.min(br.y + DefaultCellButtonRenderer.BUTTON_HEIGHT, br.bottom() - 3));
			switch (this._buttonType) {
				case EditButtonType.COMBO:
					this.$_drawMenuButton(index.grid(), g, br, true, hovered, pressed);
					break;
				case EditButtonType.ELLIPSIS:
					this.$_drawEllipsisButton(index.grid(), g, br, true, hovered, pressed);
					break;
				case EditButtonType.CALENDAR:
					this.$_drawCalendarButton(index.grid(), g, br, true, hovered, pressed);
					break;
			}
		}
	}
});

var ImageButtonsRenderer = defineClass("ImageButtonsRenderer", CellButtonRenderer, {
	init: function (name) {
		this._super(name);
		this._inited = false;
		this._images = [];
		this._count = 0;
	},
	imageWidth: 16,
	imageHeight: 14,
	imageUrls: [],
	setImageUrls: function (value) {
		if (!value) {
			this._count = 0;
			this._imageUrls = null;
			this._images = null;
		} else {
			value = value && _isArray(value) ? value : [value];
			this._count = value.length;
			this._imageUrls = [];
			this._images = [];

			for (var i = 0; i < this._count; i++) {
				var obj = value[i];
				var clone = {};
				for (var attr in obj) {
    				if (obj.hasOwnProperty(attr)) {
    					for (var state in ButtonState) {
    						if (ButtonState[state] == attr) {
		    					clone[attr] = obj[attr];
    							break;
    						}
    					}
    				}
    			}
    			this._imageUrls.push(clone);
    			this._images.push({"name":obj["name"]});
			}
		}
		this._inited = false;
	},
	prepare: function (grid) {
		if (!this._inited) {
			for (var i = 0; i < this._count; i ++) {
				for (var attr in this._imageUrls[i]) {
					grid.getImage(this._imageUrls[i][attr]);
				}
			}
			this._inited = true;
		}
	},
	_buttonIndex: function (w, h, x, y) {
		return _int((x - 1) / (this._imageWidth+2)); 
	},
	_doMeasure: function (index, hintWidth, hintHeight) {
		return new Size((this._imageWidth+2) * this._count + 2, hintHeight); // 이미지 각각의 좌우 여벽 1, 렌터러의 좌우 여백 1 증가
	},
	_doRender: function (index, g, r, hovered, pressed, focused, buttonIndex) {
		var column = index.dataColumn();
		if (column) {
			var br = r.clone();
			if (focused && index.grid().isEditing()) {
				br.leftBy(2);
				br.rightBy(-2);
			} else {
				br.leftBy(1);
				br.rightBy(-3);
			}
			for (var i = 0; i < this._count; i++) {
				if (buttonIndex === i) {
					this.$_drawButton(index.grid(), g, br, i, hovered, pressed);
				} else {
					this.$_drawButton(index.grid(), g, br, i, false, false);
				}
			}
		}
	},
	$_getImage: function (grid, index, state, url) {
		var img = this._images[index][state];
		if (!img) {
			img = grid.getImage(url);
			if (img) {
				this._images[index][state] = img;
			}
		}
		return img;
	},
	$_drawButton: function (grid, g, r, index, hovered, pressed) {
		var w, h;
		var state = pressed ? ButtonState.DOWN : hovered ? ButtonState.HOVER : ButtonState.UP;
		// Hover, Down Image가 없을땐 Normal이미지로 대체
		if (!this._imageUrls[index][state]) {
			if (this._imageUrls[index][ButtonState.UP]) {
				state = ButtonState.UP;
			}
		}
		img = this.$_getImage(grid, index, state, this._imageUrls[index][state]);
		if (img && (w = img.width) > 0 && (h = img.height) > 0) {
			var x = _int(r.x + 1 + (this._imageWidth + 2) * index);
			var y = _int(r.y + (r.height - h) / 2);
			g.drawImage(img, x, y, w, h);
		}
	}
}, {

});