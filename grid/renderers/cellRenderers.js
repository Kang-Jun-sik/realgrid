var /* abstract */ DynamicRendererOption = defineClass("DynamicRendererOption", null, {
	init: function (owner/* DataCellRenderer */) {
		this._super();
		_assert(owner != null, "owner is null");
		this._owner = owner; //
	},
	owner: function () {
		return this._owner;
	},
	apply: function (runtime/* DataCellRendererRuntime */, target/* Object */) {
	},
	_changed: function () {
	}
});
var DynamicRendererOptionImpl = defineClass("DynamicRendererOptionImpl", DynamicRendererOption, {
	init: function (owner, config) {
		this._super(owner);
		this._exprNode = null;
		this._propMap = {};
		if (config) {
			if (config.hasOwnProperty("criteria")) {
				this.setCriteria(config.criteria);
			}
			if (config.hasOwnProperty("options")) {
				this.setOptions(config.options);
			} else if (config.hasOwnProperty("styles")) {
				this.setOptions(config.styles);
			}
		}
	},
	criteria: null,
	options: null,
	setCriteria: function (value) {
		if (value != this._criteria) {
			this._criteria = value;
			this.$_buildExpression();
			this._changed();
		}
	},
	setOptions: function (value) {
		if (value != this._options) {
			this._options = value;
			this.$_buildStyles();
			this._changed();
		}
	},
	apply: function (runtime, target) {
		if (this._exprNode && this._exprNode.evaluate(runtime)) {
			for (var p in this._propMap) {
				var v = this._owner._readOption(p, this._propMap[p]);
				if (v !== undefined) {
					target[p] = v;
				}
			}
		}
	},
	$_buildExpression: function () {
		if (this._criteria) {
			this._exprNode = ExpressionParser.Default.parse(this._criteria, this._owner ? this._owner.capitalIndexers() : null);
			if (this._exprNode == null) {
				this._exprNode = EmptyExpressionNode.Default;
			}
		} else {
			this._exprNode = EmptyExpressionNode.Default;
		}
	},
	$_buildStyles: function () {
		var i;
		var cnt;
		var items;
		var item;
		var arr;
		this._propMap = {};
		if (typeof this._options === "string") {
			items = this._options.split(";");
			for (i = 0, cnt = items.length; i < cnt; i++) {
				item = items[i];
				arr = item.split("=");
				if (arr.length > 1) {
					this._propMap[arr[0]] = arr[1];
				} else {
					this._propMap[arr[0]] = UNDEFINED;
				}
			}
		} else if (this._options) {
			for (var p in this._options) {
				this._propMap[p] = this._options[p];
			}
		}
	}
});
var DynamicRendererOptionCase = defineClass("DynamicRendererOptionCase", DynamicRendererOption, {
	init : function(owner, config) {
		this._super(owner);
		this._exprNodes = [];
		this._propMaps = [];
		if (config) {
			if (config.hasOwnProperty("criteria")) {
				this.setCriteria(config.criteria);
			}
			if (config.hasOwnProperty("options")) {
				this.setStyles(config.options);
			} else if (config.hasOwnProperty("styles")) {
				this.setOptions(config.styles);
			}
		}
	},
	criteria: null,
	styles: null,
	setCriteria: function (value) {
		if (value != this._criteria) {
			this._criteria = value;
			this.$_buildExpressions();
			this._changed();
		}
	},
	setStyles: function (value) {
		if (value != this._options) {
			this._options = value;
			this.$_buildStyles();
			this._changed();
		}
	},
	apply: function(runtime, target/* Object */) {
		for (var i = 0, len = this._exprNodes.length; i < len; i++) {
			var expr = this._exprNodes[i];
			if (expr && expr.evaluate(runtime)) {
				var options = this._propMaps[i];
				for (var p in options) {
					var v = this._owner._readOption(p, options[p]);
					if (v !== undefined) {
						target[p] = v;
					}
				}
				break;
			}
		}
	},
	$_buildExpressions: function () {
		var cnt;
		var owner = this.owner();
		this._exprNodes = [];
		if (this._criteria && (cnt = this._criteria.length) > 0) {
			for (var i = 0; i < cnt; i++) {
				var c = this._criteria[i];
				if (c) {
					var expr = ExpressionParser.Default.parse(c, owner ? owner.capitalIndexers() : null);
					if (expr == null) {
						expr = EmptyExpressionNode.Default;
					}
					this._exprNodes.push(expr);
				} else {
					this._exprNodes.push(EmptyExpressionNode.Default);
				}
			}
		}
	},
	$_buildStyles: function () {
		this._propMaps = [];
		for (var i = 0, cnt = this._exprNodes.length; i < cnt; i++) {
			var styles = this._options.length > i ? this._options[i] : this._options[cnt - 1];
			var items = styles.split(";");
			var map = {};
			this._propMaps.push(map);
			for (var j = 0; j < items.length; j++) {
				var item = items[j];
				var arr = item.split(/\s*=/);
				if (arr.length > 1) {
					map[arr[0]] = arr[1];
				} else {
					map[arr[0]] = null;
				}
			}
		}
	}
});
var DynamicRendererOptionCollection = defineClass("DynamicRendererOptionCollection", null, {
	init: function (owner) {
		this._super();
		this._owner = owner;
		this._items = [];
	},
	owner: function () {
		return this._owner;
	},
	count: function () {
		return this._items.length;
	},
	getItem: function (index) {
		return this._items[index];
	},
	clear: function () {
		this._items = [];
	},
	add: function (item) {
		var option = this.$_createOption(item);
		if (option && this._items.indexOf(option) < 0) {
			this._items.push(option);
		}
	},
	setItems: function (items) {
		this._items = [];
		if (items) {
			if (items instanceof DynamicRendererOptionCollection) {
				items = items.toArray();
			}
			if (!_isArray(items)) {
				return;
			}
			var i, option;
			var cnt = items.length;
			for (i = 0; i < cnt; i++) {
				option = this.$_createOption(items[i]);
				option && this._items.push(option);
			}
		}
	},
	prepare: function () {
	},
	apply: function (runtime, target) {
		var i, option;
		var cnt = this._items.length;
		for (i = 0; i < cnt; i++) {
			option = this._items[i];
			option.apply(runtime, target);
		}
	},
	toArray: function () {
		return this._items.concat();
	},
	$_createOption: function (source) {
		var s = null;
		if (source instanceof DynamicRendererOption) {
			source._owner = this._owner;
			s = source;
		} else if (_isArray(source)) {
			var cstyle;
			if (_isArray(source.options) || _isArray(source.styles)) {
				cstyle = new DynamicRendererOptionCase(this._owner, source);
				s = cstyle;
			} else {
				cstyle = new DynamicRendererOptionCase(this._owner, source);
				s = cstyle;
			}
		} else if (source && source.criteria) {
			var option = new DynamicRendererOptionImpl(this._owner, source);
			s = option;
		}
		return s;
	}
});

var /* abstract */ DataCellRenderer = defineClass("DataCellRenderer", GridObject, {
	init: function () {
		this._super();
		this._rect = new Rectangle();
		this._runtime = null;
		this._dynamicOptions = null;
		this._runtimeOptions = {};
	},
	destroy: function() {
		return false;  // CellRenderer는 삭제하지 않는다.
	},
	minWidth: 4,
	dynamicOptions: null,
	dynamicOptions_: function () {
		return this._dynamicOptions ? this._dynamicOptions.toArray() : null;
	},
	setDynamicOptions: function (value) {
		if (value != this._dynamicOptions) {
			if (value) {
				if (!this._runtime) {
					this._runtime = new DataCellRendererRuntime();
				}
				if (!this._dynamicOptions) {
					this._dynamicOptions = new DynamicRendererOptionCollection(this);
				}
				this._dynamicOptions.setItems(value);
				this._changed();
			} else if (this._dynamicOptions) {
				this._dynamicOptions = null;
				this._changed();
			}
		}
	},
	capitalIndexers: function () {
		return null;
	},
	isEditable: function () {
		return false;
	},
	isStartEditOnClick: function () {
		return false;
	},
	isDblClickEnabled: function () {
		return false;
	},
	isClickable: function (index) {
		return false;
	},
    isButton: function () {
        return false;
    },
	setOptions: function (options) {
	},
	prepareRuntime: function (grid) {
		this._runtime && this._runtime.setDataSource(grid.dataSource());
	},
	applyDynamicStyles: function (target/*DataCellElement*/) {
		if (this._dynamicOptions && this._dynamicOptions.count() > 0) {
			this._runtime.setTarget(target);
			this._dynamicOptions.apply(this._runtime, this._runtimeOptions = {});
		}
	},
	measure: function (grid, cell, hintWidth, hintHeight) {
		return this._doMeasure(grid, cell, hintWidth, hintHeight);
	},
	measureHeight:function (grid, cell, columnWidth, maxHeight) {
		return this._doMeasureHeight(grid, cell, columnWidth, maxHeight)
	},
	render: function (cell, g, r) {
	},
	renderHtml: function (cell, r) {
	},
	getButtonRenderer: function () {
		return null;
	},
	isEditableKey: function (index, key) {
		return false;
	},
	performEdit: function (index) {
	},
	performClick: function (cell, x, y) {
		return false;
	},
    showTooltip: false,
    getTooltip: function (cell) {
        if (this.isShowTooltip()) {
            var s = this._getText(cell);
            return s ? s : undefined;
        }
        return undefined;
    },
	assign: function (source) {
		this._super(source);
		if (source && !source.hasOwnProperty("dynamicOptions") && source.hasOwnProperty("dynamicStyles")) {
			this.setDynamicOptions(source.dynamicStyles);
		}
	},
	propertyChanged: function (prop, newValue) {
		this._changed();
	},
	_readOption: function (prop, value) {
		return value;
	},
	_getOption: function (prop) {
		if (this._runtimeOptions.hasOwnProperty(prop)) {
			var v = this._runtimeOptions[prop];
			if (v !== undefined) return v;
		}
		return this[prop]();
	},
	_doMeasure: function (grid, cell, hintWidth, hintHeight) {
		return new Size(Math.max(this._minWidth, hintWidth), hintHeight);
	},
	_doMeasureHeight: function (grid, cell, columnWidth, maxHeight) {
		return new Size(Math.max(this._minWidth, columnWidth), 0);
	},
	_getText: function (cell) {
		var t;
		var s = cell.text();
		if (s === null || s === UNDEFINED) {
			s = "";
		}
		if ((t = cell.prefix()) != null) {
			s = t + s;
		}
		if ((t = cell.suffix()) != null) {
			s += t;
		}
		return s;
	},
	_changed: function () {
	}
}, {
	consumeKey: function (index, key, shift, ctrl) {
		var grid = index ? index.grid() : null;
		if (grid && !grid.isEditing() && index.dataColumn() && key == Keys.SPACE) {
			var cell = grid.body().getCell(index);
			var rendererId = cell ? cell.styles().renderer() : null;
			var renderer = rendererId ? grid.dataCellRenderers().getRenderer(rendererId) : index.dataColumn().rendererObj();
			if (renderer) {
				if (!grid.isReadOnly(index) && renderer.isEditable()) {
					if (renderer.isEditableKey(index, key, shift, ctrl) && grid.edit(index)) {
						var item = index.item();
						if ((grid.isItemEditing(item) || grid.canUpdate(item, index.dataField())) && grid.canWrite(index)) {
							grid.makeCellVisible(index, true);
							renderer.performEdit(index);
							return true;
						}
					}
				}
			}
		}
		return false;
	}
});
var /* internal */ DataCellRendererCollection = function (delegate) {
	var _delegate = delegate;
	var _options = {};
	var _renderers = {};
	this.addRenderers = function (renderers) {
		if (renderers) {
			var options = renderers;
			if (!_isArray(options)) {
				options = [renderers];
			}
			for (var i = 0, cnt = options.length; i < cnt; i++) {
				var opt = options[i];
				if (opt && opt.hasOwnProperty("id") && opt.id) {
					_options[opt.id] = _extend({}, opt);
				}
			}
		}
	};
	this.getRenderer = function (id) {
		var options = _options[id];
		if (options) {
			var renderer = _cast(_renderers[id], DataCellRenderer);
			if (!renderer) {
				renderer = delegate.createRenderer(options);
				if (renderer) {
					_renderers[id] = renderer;
				}
			}
			return renderer;
		}
		return null;
	};
};
var TextCellRenderer = defineClass("TextCellRenderer", DataCellRenderer, {
	init: function () {
		this._super();
	},
	_doMeasure: function (grid, cell, hintWidth, hintHeight) {
		if (cell._textWrap && (cell._textWrap == TextWrapMode.NORMAL || cell._textWrap == TextWrapMode.EXPLICIT)) {
			var r = new Rectangle(0, 0, 0, 0);
			grid.measureTextRect(cell.font(),this._getText(cell), 0, 0, hintWidth, hintHeight, cell._textAlign, cell._lineAlign, cell._textWrap,r)
			return _tempSize(r.width+cell.paddingHorz(), hintHeight);
		} else {
			return _tempSize(grid.measureText(cell.font(), this._getText(cell)) + cell.paddingHorz(), hintHeight);
		}
	},
	_doMeasureHeight: function (grid, cell, columnWidth, maxHeight) {
		var r = _tempSize(columnWidth, grid.measureTextRect(cell.font(),this._getText(cell), 0, 0, columnWidth, maxHeight, cell._textAlign, cell._lineAlign, cell._textWrap )+cell.paddingVert());
		r.height = Math.min(r.height, maxHeight);
		return r;
    },
	render: function (cell, g, r) {
		var s = this._getText(cell);
		r = this._rect.copy(r);
		cell.inflatePadding(r);
		TextCellRenderer.renderWrapText(cell, g, r.x, r.y, r.width, r.height, s);
	},
	renderHtml: function (cell, r) {
		var span = cell.$_prepareSpan();
		var s = this._getText(cell);
		r = this._rect.copy(r);
		cell.inflatePadding(r);
		Dom.renderTextBounds(span, cell.font(), cell.foreground(), s, r.x, r.y, r.width, r.height, cell.textAlign(), cell.lineAlign());
	}
}, {
	renderWrapText: function(cell, g, x, y, w, h, s) {
		switch (cell.textWrap()) {
			case TextWrapMode.EXPLICIT:
				g.drawTextBoundsExplicit(cell.font(), cell.foreground(), s, x, y, w, h, cell.textAlign(), cell.lineAlign());
				break;
			case TextWrapMode.NORMAL:
				g.drawTextBoundsWrap(cell.font(), cell.foreground(), s, x, y, w, h, cell.textAlign(), cell.lineAlign());
				break;
			default:
				g.drawTextBounds(cell.font(), cell.foreground(), s, x, y, w, h, cell.textAlign(), cell.lineAlign());
				break;
		}
	}	
});
TextCellRenderer.Default = new TextCellRenderer();
var BarCellRenderer = defineClass("BarCellRenderer", DataCellRenderer, {
	init: function() {
		this._super();
		this.setMinWidth(100);
	},
	minimum: 0,
	maximum: 100,
	showLabel: false,
	origin: "default",
	render: function(cell, g, r) {
		if (this._maximum > this._minimum) {
			var v = cell.value();
			var rate = Math.min(1, (v - this._minimum) / (this._maximum - this._minimum));
			var border = cell.figureBorder();
			var fill = cell.figureBackground();
			if (border || fill) {
				switch (this.origin()) {
					case BarCellRenderer.ORIGIN_LEFT:
						this.$_drawLeft(cell, g, fill, border, r, rate);
						break;
					case BarCellRenderer.ORIGIN_RIGHT:
						this.$_drawRight(cell, g, fill, border, r, rate);
						break;
					case BarCellRenderer.ORIGIN_BOTTOM:
						this.$_drawBottom(cell, g, fill, border, r, rate);
						break;
					case BarCellRenderer.ORIGIN_TOP:
						this.$_drawTop(cell, g, fill, border, r, rate);
						break;
					default:
						this.$_drawLeft(cell, g, fill, border, r, rate);
						break;
				}
			}
		}
		if (this.isShowLabel()) {
			var s = this._getText(cell);
			TextCellRenderer.renderWrapText(cell, g, r.x, r.y, r.width, r.height, s);
			//g.drawTextRect(null, cell.foreground(), s, r, cell.textAlign());
		}
	},
	$_drawLeft: function (cell, g, fill, border, r, rate) {
		var x = cell.paddingLeft();
		var w = (r.width - x - cell.paddingRight()) * rate;
		if (w >= 0) {
			var y = cell.paddingTop();
			var h = r.height - cell.paddingBottom() - y;
			var h2 = h;
			var sz = cell.figureSize();
			if (sz) {
				h2 = sz.getDimension(h);
			}
			if (h2 >= 0) {
				g.drawBoundsI(fill, border, r.x + x, r.y + y + (h - h2) / 2, w, h2);
			}
		}
	},
	$_drawRight: function (cell, g, fill, border, r, rate) {
		var x = cell.paddingRight();
		var w = (r.width - cell.paddingLeft() - x) * rate;
		if (w >= 0) {
			var y = cell.paddingTop();
			var h = r.height - cell.paddingBottom() - y;
			var h2 = h;
			var sz = cell.figureSize();
			if (sz) {
				h2 = sz.getDimension(h)
			}
			if (h2 >= 0) {
				g.drawBoundsI(fill, border, r.right() - x - w, r.y + y + (h - h2) / 2, w, h2);
			}
		}
	},
	$_drawBottom: function (cell, g, fill, border, r, rate) {
		var y = cell.paddingBottom();
		var h = (r.height - y - cell.paddingTop()) * rate;
		if (h >= 0) {
			var x = cell.paddingLeft();
			var w = r.width - cell.paddingRight() - x;
			var w2 = w;
			var sz = cell.figureSize();
			if (sz) {
				w2 = sz.getDimension(w)
			}
			if (w2 >= 0) {
				g.drawBoundsI(fill, border, r.x + x + (w - w2) / 2, r.bottom() - y - h, w2, h);
			}
		}
	},
	$_drawTop: function (cell, g, fill, border, r, rate) {
		var y = cell.paddingTop();
		var h = (r.height - y - cell.paddingBottom()) * rate;
		if (h >= 0) {
			var x = cell.paddingLeft();
			var w = r.width - cell.paddingRight() - x;
			var w2 = w;
			var sz = cell.figureSize();
			if (sz) {
				w2 = sz.getDimension(w)
			}
			if (w2 >= 0) {
				g.drawBoundsI(fill, border, r.x + x + (w - w2) / 2, r.y + y, w2, h);
			}
		}
	}
});
BarCellRenderer.ORIGIN_DEFAULT = "default";
BarCellRenderer.ORIGIN_LEFT = "left";
BarCellRenderer.ORIGIN_RIGHT = "right";
BarCellRenderer.ORIGIN_TOP = "top";
BarCellRenderer.ORIGIN_BOTTOM = "bottom";
var ProgressCellRenderer = defineClass("ProgressCellRenderer", DataCellRenderer, {
	init: function () {
		this._super();
		this.setMinWidth(100);
	},
	render: function (cell, g, r) {
	}
});
var CheckCellRenderer = defineClass("CheckCellRenderer", DataCellRenderer, {
	init: function() {
		this._super();
		this._values = {};
		this._falseValue = undefined;
		this._trueValues = undefined;
	},
	trueValues: null,
	falseValues: null,
	shape: undefined,
	labelPosition: "hidden",
	labelGap: 4,
	spaceKey: true,
	editable: false,
	dblClickEditable: false,
	startEditOnClick: false,
	threeState: false,
	setTrueValues: function (value) {
		if (value != this._trueValues) {
			this._trueValues = value;
			this.$_resetValues();
		}
	},
	falseValues: null,
	setFalseValues: function (value) {
		if (value != this._falseValues) {
			this._falseValues = value;
			this.$_resetValues();
		}
	},
	_doMeasure: function (grid, cell, hintWidth, hintHeight) {
		var sz = _tempSize(cell.paddingHorz(), hintHeight);
		var w = 12;
		var dim = cell.figureSize();
		if (dim) {
			w = dim.getDimension(12);
		}
		sz.width += w;
		if (this.labelPosition() != CheckCellRenderer.HIDDEN) {
			sz.width += this.labelGap() + grid.measureText(cell.font(), cell.value());
		}
		return sz;
	},
	render: function(cell, g, r) {
		var x, y, w, h, tr, s, sz;
		var	value = cell.value();
		var	v = this.$_getValue(value);
		var empty = (this._threeState && v === undefined);
		var	border = empty ? null : cell.figureBorder();
		var	fill =  empty ? null : v ? cell.figureBackground() : cell.figureInactiveBackground();
		if (fill || border) {
			if (this._shape == CheckCellRenderer.SHAPE_BOX) {
				w = 12;
				h = 12;
			} else {
				w = 12;
				h = 10;
			};
			sz = cell.figureSize();
			if (sz) {
				w = sz.getDimension(w);
				h = w * 10 / 12;
			}
			tr = null;
			switch (this._labelPosition) {
				case CheckCellRenderer.RIGHT:
					x = cell.paddingLeft() + r.x;
					y = r.y + (r.height - h) / 2;
					tr = this._rect;
					tr.copy(r);
					tr.leftBy(w + this._labelGap);
					tr.rightBy(-cell.paddingRight());
					break;
				case CheckCellRenderer.LEFT:
					x = r.right() - cell.paddingRight() - w;
					y = r.y + (r.height - h) / 2;
					tr = this._rect;
					tr.copy(r);
					tr.leftBy(cell.paddingLeft());
					tr.right(x - this._labelGap);
					break;
				case CheckCellRenderer.BOTTOM:
					x = r.x + (r.width - w) / 2;
					y = cell.paddingTop();
					tr = this._rect;
					tr.copy(r);
					tr.leftBy(cell.paddingLeft());
					tr.rightBy(-cell.paddingRight());
					tr.topBy(h + this._labelGap);
					break;
				case CheckCellRenderer.TOP:
					x = r.x + (r.width - w) / 2;
					y = r.bottom() - h - cell.paddingBottom();
					tr = this._rect;
					tr.copy(r);
					tr.leftBy(cell.paddingLeft());
					tr.rightBy(-cell.paddingRight());
					tr.bottomBy(-h - this._labelGap);
					break;
				default:
					x = r.x + (r.width - w) / 2;
					y = r.y + (r.height - h) / 2;
					break;
			}
			if (tr) {
				s = this._getText(cell);
				tr.topBy(cell.paddingTop());
				tr.bottomBy(-cell.paddingBottom());
				TextCellRenderer.renderWrapText(cell, g, tr.x, tr.y, tr.width, tr.height, s);
				//g.drawTextRect(null, cell.foreground(), s, tr, cell.textAlignment());
			}
			if (this._shape == CheckCellRenderer.SHAPE_BOX) {
				var line = border ? border : SolidPen.DKGRAY; 
				var boxR = new Rectangle(x, y, w, h);
				g.drawRectI(null, line, boxR);

				boxR.inflate(-1,-1);
				g.drawPolygonArray(fill, border, [
					boxR.x + boxR.width * 1.25 / 8, boxR.y + boxR.height * 2.65 / 7,
					boxR.x + boxR.width * 0, boxR.y + boxR.height * 4.25 / 7,
					boxR.x + boxR.width * 3.45 / 8, boxR.y + boxR.height * 7.0 / 7,
					boxR.x + boxR.width * 8.0 / 8, boxR.y + boxR.height * 1.2 / 7,
					boxR.x + boxR.width * 6.5 / 8, boxR.y + boxR.height * 0.1,
					boxR.x + boxR.width * 3.45 / 8, boxR.y + boxR.height * 4.25 / 7
				]);
			} else {
				g.drawPolygonArray(fill, border, [
					x + w * 1.25 / 8, y + h * 2.65 / 7,
					x + w * 0, y + h * 4.25 / 7,
					x + w * 3.95 / 8, y + h * 7.0 / 7,
					x + w * 8.0 / 8, y + h * 1.2 / 7,
					x + w * 6.3 / 8, y + h * 0,
					x + w * 3.45 / 8, y + h * 4.25 / 7
				]);
			}
		}
		if (this.isEditable() && cell.isFocused()) {
			var grid = cell.grid();
			if (grid && !grid.isReadOnly(cell.index())) {
				r.inflate(-3, -3);
				!r.isEmpty() && g.drawRect(null, SolidPen.FOCUS, r);
				/*
				 g.lineStyle(0, 0, 0.5, true);
				 if (tr) {
				 r = cell.getTextBounds();
				 r.inflate(3, 1);
				 r = r.intersection(tr);
				 GraphicUtils.drawFocusRect(g, r.left, r.top, r.width, r.height);
				 } else {
				 GraphicUtils.drawFocusRect(g, x, y, w, h);
				 }
				 */
			}
		}
	},
	isEditableKey: function (index, key) {
		return this.isSpaceKey() && key == Keys.SPACE;
	},
	performEdit: function (index) {
		var v = this.$_getValue(index.value());
		var fld = index.dataField();
		var ds = index.grid().dataSource();
		var item = index.item();
		if (fld >= 0 && ds.getValueType(fld) == ValueType.BOOLEAN) {
			if (this._threeState && v !== undefined && !v) {
				v = undefined;
			} else {
				v = !v;
			}
		} else {
			if (v) {
				v = this._falseValue ? this._falseValue : false;
			} else if (v !== undefined && this._threeState) {
				v = undefined;
			} else {
				v = this._trueValue ? this._trueValue : true;
			}
		}
		item.setData(fld, v);
		if (index.grid()) {
			index.grid().validateCellCommit(index, v);
		}
	},
	$_resetValues: function () {
		var vals, len, i;
		this._values = {};
		if (this._falseValues) {
			vals = this._falseValues.split(",");
			if (vals) {
				this._falseValue = (len = vals.length) > 0 ? vals[0] : undefined;
				for (i = 0; i < len; i++) {
					this._values[vals[i]] = false;
				}
			} else {
				this._falseValue = undefined;
			}
		} 
		if (this._trueValues) {
			vals = this._trueValues.split(",");
			if (vals) {
				this._trueValue = (len = vals.length) > 0 ? vals[0] : undefined;
				for (i = 0; i < len; i++) {
					this._values[vals[i]] = true;
				}
			} else {
				this._trueValue = undefined;
			}
		}
	},
	$_getValue: function (v) {
		if (typeof v === "boolean") {
			return v;
		} else {
			var val = String(v);
			if (this._values.hasOwnProperty(val)) {
				return this._values[val];
			} else if (this._threeState && (v == "" || v === undefined || v === null)) {
				return undefined;
			} else {
				return Boolean(v);
			}
		}
	}
});
CheckCellRenderer.HIDDEN = "hidden";
CheckCellRenderer.RIGHT = "right";
CheckCellRenderer.LEFT = "left";
CheckCellRenderer.BOTTOM = "bottom";
CheckCellRenderer.TOP = "top";
CheckCellRenderer.SHAPE_DEFAULT = "default";
CheckCellRenderer.SHAPE_BOX = "box";


var ShapeCellRenderer = defineClass("ShapeCellRenderer", DataCellRenderer, {
	init: function() {
		this._super();
		this._ellipse = null;
		this._polygon = null;
		this._rect = new Rectangle();
	},
	sizeRate: 0.6,
	render: function(cell, g, r) {
		var shapeType = cell.figureName();
		var shape = this._getShape(shapeType);
		switch (cell.iconLocation()) {
			case IconLocation.RIGHT:
				this._drawRight(cell, shape, g, r);
				break;
			case IconLocation.TOP:
				this._drawTop(cell, shape, g, r);
				break;
			case IconLocation.BOTTOM:
				this._drawBottom(cell, shape, g, r);
				break;
			case IconLocation.CENTER:
				this._drawCenter(cell, shape, g, r);
				break;
			case IconLocation.LEFT:
			default:
				this._drawLeft(cell, shape, g, r);
				break;
		}
	},
	_getShape: function (type) {
		var shape = null;
		if (type) {
			type = type.toLowerCase();
			if (type == "null") {
				shape = NullShape.Default;
			} else if (type == "ellipse") {
				shape = this._ellipse ? this._ellipse : (this._ellipse = new EllipseShape());
			} else {
				shape = this._polygon ? this._polygon : (this._polygon = new PolygonShape());
				this._polygon.setShape(type);
			}
		}
		return shape;
	},
	_drawLeft: function (cell, shape, g, r) {
		var iconOff = cell.iconOffset();
		var iconGap = cell.iconPadding() + iconOff;
		var tx = r.x + cell.paddingLeft();
		var ty = r.y + cell.paddingTop();
		var tw = r.width - cell.paddingHorz();
		var th = r.height - cell.paddingVert();
		var sw = 0;
		if (shape) {
			sw = Math.min(tw, th);
			var sh = sw;
			var sz = cell.figureSize();
			if (sz) {
				sw = sz.getDimension(sw);
				sh = sz.getDimension(sh);
			} else {
				sw = sw * this._sizeRate;
				sh = sh * this._sizeRate;
			}
			var x = tx + iconOff;
			var y = ty;
			switch (cell.iconAlignment()) {
				case Alignment.CENTER:
					y += (th - sh) / 2;
					break;
				case Alignment.FAR:
					y += th - cell.paddingVert() - sh;
					break;
			}
			this._rect.set(x, y, sw, sh);
			shape.draw(g, this._rect, cell.figureBackground(), cell.figureBorder());
		}
		var s = this._getText(cell);
		if (s) {
			tx += sw + iconGap;
			tw -= sw + iconGap;
			TextCellRenderer.renderWrapText(cell, g, tx, ty, tw, th, s);
			//g.drawTextBounds(null, cell.foreground(), s, tx, ty, tw, th, cell.textAlign());
		}
	},
	_drawRight: function (cell, shape, g, r) {
		var iconOff = cell.iconOffset();
		var iconGap = cell.iconPadding() + iconOff;
		var tx = r.x + cell.paddingLeft();
		var ty = r.y + cell.paddingTop();
		var tw = r.width - cell.paddingHorz();
		var th = r.height - cell.paddingVert();
		var sw = 0;
		if (shape) {
			sw = Math.min(tw, th);
			var sh = sw;
			var sz = cell.figureSize();
			if (sz) {
				sw = sz.getDimension(sw);
				sh = sz.getDimension(sh);
			} else {
				sw = sw * this._sizeRate;
				sh = sh * this._sizeRate;
			}
			var x = r.right() - sw - iconOff - cell.paddingRight();
			var y = ty;
			switch (cell.iconAlignment()) {
				case Alignment.CENTER:
					y += (th - sh) / 2;
					break;
				case Alignment.FAR:
					y += th - cell.paddingVert() - sh;
					break;
			}
			this._rect.set(x, y, sw, sh);
			shape.draw(g, this._rect, cell.figureBackground(), cell.figureBorder());
		}
		var s = this._getText(cell);
		if (s) {
			tw -= sw + iconGap;
			TextCellRenderer.renderWrapText(cell, g, tx, ty, tw, th, s);
			//g.drawTextBounds(null, cell.foreground(), s, tx, ty, tw, th, cell.textAlign());
		}
	},
	_drawTop: function (cell, shape, g, r) {
		var iconOff = cell.iconOffset();
		var iconGap = cell.iconPadding() + iconOff;
		var tx = r.x + cell.paddingLeft();
		var ty = r.y + cell.paddingTop();
		var tw = r.width - cell.paddingHorz();
		var th = r.height - cell.paddingVert();
		var sh = 0;
		if (shape) {
			sh = Math.min(tw, th);
			var sw = sh;
			var sz = cell.figureSize();
			if (sz) {
				sw = sz.getDimension(sw);
				sh = sz.getDimension(sh);
			} else {
				sw = sw * this._sizeRate;
				sh = sh * this._sizeRate;
			}
			var x = tx;
			var y = ty + iconOff;
			switch (cell.iconAlignment()) {
				case Alignment.CENTER:
					x += (tw - sw) / 2;
					break;
				case Alignment.FAR:
					x += tw - cell.paddingHorz() - sw;
					break;
			}
			this._rect.set(x, y, sw, sh);
			shape.draw(g, this._rect, cell.figureBackground(), cell.figureBorder());
		}
		var s = this._getText(cell);
		if (s) {
			ty += sh + iconGap;
			th -= sh + iconGap;
			TextCellRenderer.renderWrapText(cell, g, tx, ty, tw, th, s);
			//g.drawTextBounds(null, cell.foreground(), s, tx, ty, tw, th, cell.textAlign());
		}
	},
	_drawBottom: function (cell, shape, g, r) {
		var iconOff = cell.iconOffset();
		var iconGap = cell.iconPadding() + iconOff;
		var tx = r.x + cell.paddingLeft();
		var ty = r.y + cell.paddingTop();
		var tw = r.width - cell.paddingHorz();
		var th = r.height - cell.paddingVert();
		var sh = 0;
		if (shape) {
			sh = Math.min(tw, th);
			var sw = sh;
			var sz = cell.figureSize();
			if (sz) {
				sw = sz.getDimension(sw);
				sh = sz.getDimension(sh);
			} else {
				sw = sw * this._sizeRate;
				sh = sh * this._sizeRate;
			}
			var x = tx;
			var y = r.bottom() - sh - iconOff - cell.paddingBottom();
			switch (cell.iconAlignment()) {
				case Alignment.CENTER:
					x += (tw - sw) / 2;
					break;
				case Alignment.FAR:
					x += tw - cell.paddingHorz() - sw;
					break;
			}
			this._rect.set(x, y, sw, sh);
			shape.draw(g, this._rect, cell.figureBackground(), cell.figureBorder());
		}
		var s = this._getText(cell);
		if (s) {
			th -= sh + iconGap;
			TextCellRenderer.renderWrapText(cell, g, tx, ty, tw, th, s);
			//g.drawTextBounds(null, cell.foreground(), s, tx, ty, tw, th, cell.textAlign());
		}
	},
	_drawCenter: function (cell, shape, g, r) {
		var iconOff = cell.iconOffset();
		var iconGap = cell.iconPadding() + iconOff;
		var tx = r.x + cell.paddingLeft();
		var ty = r.y + cell.paddingTop();
		var tw = r.width - cell.paddingHorz();
		var th = r.height - cell.paddingVert();
		var sw = 0;
		if (shape) {
			sw = Math.min(tw, th);
			var sh = sw;
			var sz = cell.figureSize();
			if (sz) {
				sw = sz.getDimension(sw);
				sh = sz.getDimension(sh);
			} else {
				sw = sw * this._sizeRate;
				sh = sh * this._sizeRate;
			}
			var x = tx + iconOff;
			var y = ty + iconOff;
			x += (tw - sw) / 2;
			y += (th - sh) / 2;
			this._rect.set(x, y, sw, sh);
			shape.draw(g, this._rect, cell.figureBackground(), cell.figureBorder());
		}
	}
});
var SignalBarCellRenderer = defineClass("SignalBarCellRenderer", DataCellRenderer, {
	init : function() {
		this._super();
	},
	barCount: 4,
	minimum: NaN,
	maximum: NaN,
	setBarCount: function (value) {
		value = Math.max(2, value);
		if (value != this._barCount) {
			this._barCount = value;
			this._changed();
		}
	},
	render : function(cell, g, r) {
		var v = NaN;
		var s = cell.figureState();
		var isValue = s && typeof s == "string" && s.toLowerCase() == "value";
		var state = isValue ? (v = cell.value()) : parseInt(s);
		var border = cell.figureBorder();
		var fill = cell.figureBackground();
		if (isValue && !isNaN(this._minimum) && !isNaN(this._maximum)) {
			state = this._barCount * (v - this._minimum) / (this._maximum - this._minimum); 
		}
		if (border || fill) {
			var i;
			var fillInactive = cell.figureInactiveBackground();
			var w = r.width - cell.paddingHorz();
			var h = r.height - cell.paddingVert();
			var x = cell.paddingLeft();
			var y = cell.paddingTop();
			var bg = 2; // bar gap
			var bw = (w - (this._barCount  + 1) * bg) / this._barCount;
			var bx = x;
			var by = y + h / 2;
			var dy = h / 2 / (this._barCount - 1);
			for (i = 0; i < this._barCount; i++) {
				fill = i < state ? fill : fillInactive;
				g.drawBounds(fill, border, bx, by, bw, h - by);
				bx += bw + bg;
				by -= dy;
			}
		}
	}
});
var IconCellRenderer = defineClass("IconCellRenderer", DataCellRenderer, {
	init: function() {
		this._super();
	},
	textVisible: true,
	render: function(cell, g, r) {
		var s = this._textVisible ? this._getText(cell) : undefined;
		IconCellRenderer.renderBitmapText(cell, s, g, r);
	}
}, {
	renderBitmapText: function (cell, text, g, r) {
		var padHorz = cell.paddingHorz();
		var padVert = cell.paddingVert();
		var iconOff = cell.iconOffset();
		var iconGap = cell.iconPadding() + iconOff;
		var tx = r.x + cell.paddingLeft();
		var ty = r.y + cell.paddingTop();
		var tw = r.width - padHorz;
		var th = r.height - padVert;
		var idx = cell.iconIndex();
		var loc = cell.iconLocation();
		var img = null;
		if (typeof idx == "string" && idx.indexOf("value") == 0) {
			if (idx.length == 5) {
				idx = cell.value();
			} else if (idx.charAt(5) == "[") {
				var c = idx.lastIndexOf("]");
				if (c >= 0) {
					idx = idx.substring(6, c);
					idx = parseInt(cell.getValueOf(idx));
				}
			}
		}
		if (idx >= 0) {
			var images = cell.index().dataColumn().images();
			img = images ? images.getImage(idx) : null;
		}
		if (img) {
			var x = tx;
			var y = ty;
			var w = img.width;
			var h = img.height;
			switch (loc) {
				case IconLocation.RIGHT:
					x = r.right() - w - iconOff - cell.paddingRight();
					switch (cell.iconAlignment()) {
						case Alignment.CENTER:
							y += (th - h) / 2;
							break;
						case Alignment.FAR:
							y += th - padVert - h;
							break;
					}
					tw -= w + iconGap;
					break;
				case IconLocation.TOP:
					y += iconOff;
					switch (cell.iconAlignment()) {
						case Alignment.CENTER:
							x += (tw - w) / 2;
							break;
						case Alignment.FAR:
							x += tw - padHorz - w;
							break;
					}
					ty += h + iconGap;
					th -= h + iconGap;
					break;
				case IconLocation.BOTTOM:
					y = r.bottom() - h - iconOff - cell.paddingBottom();
					switch (cell.iconAlignment()) {
						case Alignment.CENTER:
							x += (tw - w) / 2;
							break;
						case Alignment.FAR:
							x += tw - padHorz - w;
							break;
					}
					th -= h + iconGap;
					break;
				case IconLocation.CENTER:
					x += (tw - w) / 2;
					y += (th - h) / 2;
					break;
				case IconLocation.LEFT:
				default:
					x += iconOff;
					switch (cell.iconAlignment()) {
						case Alignment.CENTER:
							y += (th - h) / 2;
							break;
						case Alignment.FAR:
							y += th - padVert - h;
							break;
					}
					tx += w + iconGap;
					tw -= w + iconGap;
					break;
			}
            g.drawImageI(img, x, y);
		}
		if (text && loc != IconLocation.CENTER) {
			TextCellRenderer.renderWrapText(cell, g, tx, ty, tw, th, text);
			//g.drawTextBounds(cell.font(), cell.foreground(), text, tx, ty, tw, th, cell.textAlign());
		}
	}
});
var ImageCellRenderer = defineClass("ImageCellRenderer", DataCellRenderer, {
	init: function() {
		this._super();
	},
	render: function(cell, g, r) {
		var url = cell.value();
		if (url) {
			var img = cell.grid().getImage(url);
			if (img) {
				r = this._rect.copy(r);
				cell.inflatePadding(r);
				var x = r.x;
				var y = r.y;
				var w = img.width;
				var h = img.height;
				var ratio;
				var rw;
				var rh;
				switch (cell.contentFit()) {
					case ContentFit.CENTER:
						x += (r.width - w) / 2;
						y += (r.height - h) / 2;
						break;
					case ContentFit.BOTH:
						rw = r.width / w;
						rh = r.height / h;
						w = r.width;
						h = r.height;
						break;
					case ContentFit.WIDTH:
						ratio = r.width / w;
						w = r.width;
						y += (r.height - h) / 2;
						break;
					case ContentFit.HEIGHT:
						ratio = r.height / h;
						h = r.height;
						x += (r.width - w) / 2;
						break;
					case ContentFit.AUTO:
						rw = r.width / w;
						rh = r.height / h;
						ratio = Math.min(rw, rh);
						w = w * ratio;
						h = h * ratio;
						if (rw > rh) {
							x += (r.width - w) / 2;
						} else {
							y += (r.height - h) / 2;
						}
						break;			
				}
				g.drawImage(img, x, y, w, h);
			}
		}
	},
	_doMeasure: function (grid, cell, hintWidth, maxHeight) {
		var url = cell.value();
		var grid = cell.grid();
		var img = url && grid.getImage(url);
		var w = this._minWidth, h = 0;
		if (img) {
			w = Math.max(img.width, w);
			h = Math.max(img.height, h);
			if (maxHeight && h > maxHeight) {
				var ratio = maxHeight / h;
				h = maxHeight;
				w = parseInt(w * ratio);
			}
		}
		return new Size(w, h);
	},
	_doMeasureHeight: function(grid, cell, columnWidth, maxHeight) {
		return this._doMeasure(grid, cell, columnWidth, maxHeight);
	}
});
var RatingCellRenderer = defineClass("RatingCellRenderer", DataCellRenderer, {
	init : function() {
		this._super();
	},
	base: 0,
	delta: 1,
	rangeType: "match",	// match, closed, open, expression
	ranges: null,
	render : function(cell, g, r) {
	}
});
var Code39CellRenderer = defineClass("Code39CellRenderer", DataCellRenderer, {
	init: function() {
		this._super();
		this._barcode = new Code39();
		this.setMinWidth(100);
	},
	render: function(cell, g, r) {
		var s = cell.value();
		if (!s) {
			return;
		}
		var fill = cell.figureBackground();
		if (fill) {
			this._rect.copy(r);
			var tr = cell.inflatePadding(this._rect);
			this._barcode.setValue(s.toUpperCase());
			this._barcode.setBarFill(fill);
			this._barcode.render(g, tr);
		}
	}
});
var Code128CellRenderer = defineClass("Code128CellRenderer", DataCellRenderer, {
	init: function() {
		this._super();
		this._barcode = new Code128();
		this.setMinWidth(100);
	},
	render: function(cell, g, r) {
		var s = cell.value();
		if (!s) {
			return;
		}
		var fill = cell.figureBackground();
		if (fill) {
			this._rect.copy(r);
			var tr = cell.inflatePadding(this._rect);
			this._barcode.setValue(s);
			this._barcode.setBarFill(fill);
			this._barcode.render(g, tr);
		}
	}
});
var /* abstract */ClickableCellRenderer = defineClass("ClickableCellRenderer", DataCellRenderer, {
	init : function() {
		this._super();
	},
	spaceKey: true,
	isClickable: function (index) {
		return true;
	},
	performClick: function (cell, x, y) {
		return this._doClick(cell.index());
	},
	render : function(cell, g, r) {
	},
	_getClickSource: function () {
		return null;
	},
	_getClickData: function () {
		return null;
	},
	_doClick: function (index, x, y) {
		var data = this._getClickData(index);
		if (data) {
			this._fireClicked(index, this._getClickSource(), data);
			return true;
		}
		return false;
	},
	_fireClicked: function (index, source, data) {
		var grid = index.grid();
		grid && grid.fireEvent(GridBase.CLICKABLE_CELL_CLICKED, index, source, data);
	}
});
ClickableCellRenderer.LINKABLE_CELL = "linkableCell";
ClickableCellRenderer.IMAGE_BUTTON_CELL = "imageButtonCell";
var LinkCellRenderer = defineClass("LinkCellRenderer", ClickableCellRenderer, {
	init : function() {
		this._super();
		this._urlStatement = new ExpressionStatement(null, true);
		this._urlRuntime = new LinkCellRendererRuntime();
	},
	urlField: null,
	url: null,
	showUrl: true,
	openUrl: false,
	requiredFields: null,
	isClickable: function (index) {
		return index && this._getClickData(index) ? true : false;
	},
	setUrl: function (value) {
		if (value != this._url) {
			this._url = value;
			this._urlStatement.setSource(value);
			this._changed();
		}
	},
	setRequiredFields: function (value) {
		if (value != this._requiredFields) {
			this._requiredFields = value;
			if (value) {
				var flds = value.split(",");
				for (var i = flds.length; i--;) {
					flds[i] = flds[i].trim().toUpperCase();
				}
				this._urlRuntime.setRequiredFields(flds);
			} else {
				this._urlRuntime.setRequiredFields(null);
			}
		}
	},
	/*
	_doMeasure: function (grid, cell, hintWidth, hintHeight) {
		var s = this._getText(cell);
		return new Size(Math.max(this._minWidth, hintWidth), hintHeight);
	},
	*/
	render: function (cell, g, r) {
		var s = cell.iconLocation() != IconLocation.CENTER ? this._getText(cell) : null;
		IconCellRenderer.renderBitmapText(cell, s, g, r);
	},
	_getClickSource: function () {
		return ClickableCellRenderer.LINKABLE_CELL;
	},
	_getClickData: function (index) {
		return this._getUrl(index);
	},
	getTooltip: function (cell, index) {
		if (this._showUrl) { 
			// var index;
			if (index && cell.grid().getItem(index._itemIndex) instanceof GridRow) {

			} else if (cell instanceof MergedDataCellElement) {
				index = cell.index().clone();
				var item = cell.item();
				item = item instanceof GridRow ? item : item instanceof MergedGroupFooter ? item.parent().firstItem() : item.firstItem();
				if (item) {
					index.setItemIndex(item.index());	
				} else {
					return null;
				}
			} else {
				index = cell.index();
			}
			return this._getUrl(index);
		} else {
			return null
		};
	},
	_getUrl: function (index) {
		if (this._url) {
			this._urlRuntime.setIndex(index);
			return this._urlStatement.evaluate(this._urlRuntime);
		} else if (this._urlField) {
			var item = index.item();
			if (item) {
				var ds = item.dataSource();
				if (ds) {
					var fld = ds.getFieldIndex(this._urlField);
					if (fld >= 0) {
						return item.getData(fld);
					}
				}
			}
		}
		return null;
	}
});
var ImageButtonCellRenderer = defineClass("ImageButtonCellRenderer", ClickableCellRenderer, {
	init : function() {
		this._super();
	},
	imageUrl: null,
	disabledUrl: null,
	hoverUrl: null,
	activeUrl: null,
	text: "Click",
	hoverText: undefined,
	disabledText: undefined,
	enabledExpression: null,
    downOffset: IntProp_0,
    ptInButton: function (cell, x, y) {
		var grid = cell.grid();
		var url = this._hoverUrl ? this._hoverUrl : this._imageUrl;
		var img = grid.getImage(url);
		if (img && this._rect) {
			var r = this._rect;
			var imgX = r.x + (r.width - img.width) / 2;
			var imgY = r.y + (r.height - img.height) / 2;
			var imgRight = imgX + img.width;
			var imgBottom = imgY + img.height;
			return (x >= imgX && y >= imgY && x <= imgRight && y <= imgBottom);
		}
    },
    isButton: function () {
        return true;
    },
	/*
	 _doMeasure: function (grid, cell, hintWidth, hintHeight) {
	 var s = this._getText(cell);
	 return new Size(Math.max(this._minWidth, hintWidth), hintHeight);
	 },
	 */
	render: function (cell, g, r) {
        var grid = cell.grid();
        var s = this._text || this._getText(cell);
        r = this._rect.copy(r);
        cell.inflatePadding(r);
        var url = this._imageUrl;
        if (cell.isPressed()) {
            url = this._activeUrl;
        } else if (cell.isHovered()) {
            url = this._hoverUrl;
        }
        var img = grid.getImage(url) || grid.getImage(this._imageUrl);
        var x, y, w, h;
        if (img && (w = img.width) > 0 && (h = img.height) > 0) {
            x = r.x + (r.width - w) / 2;
            y = r.y + (r.height - h) / 2;
            g.drawImage(img, x, y, w, h);
        }
        TextCellRenderer.renderWrapText(cell, g, r.x, r.y, r.width, r.height, s);
        /*
        switch (cell.textWrap()) {
            case TextWrapMode.EXPLICIT:
                g.drawTextBoundsExplicit(cell.font(), cell.foreground(), s, r.x, r.y, r.width, r.height, cell.textAlign(), cell.lineAlign());
                break;
            case TextWrapMode.NORMAL:
                g.drawTextBoundsWrap(cell.font(), cell.foreground(), s, r.x, r.y, r.width, r.height, cell.textAlign(), cell.lineAlign());
                break;
            default:
                g.drawTextBounds(cell.font(), cell.foreground(), s, r.x, r.y, r.width, r.height, cell.textAlign(), cell.lineAlign());
                break;
        }
        */
	},
    renderHtml: function (cell, r) {
        var span = this._text || cell.$_prepareSpan();
        var s = this._getText(cell);
        r = this._rect.copy(r);
        cell.inflatePadding(r);
        Dom.renderTextBounds(span, cell.font(), cell.foreground(), s, r.x, r.y, r.width, r.height, cell.textAlign(), cell.lineAlign());
    },
});