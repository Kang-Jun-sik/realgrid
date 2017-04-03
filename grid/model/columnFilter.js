var ColumnFilter = defineClass("ColumnFilter", EventAware, {
	init : function(criteria) {
		this._super();
		this.setCriteria(criteria);
	},
	destroy: function() {
		this._destroying = true;
		return this._super();
	},
	name: null,
	criteria: null,
	text: null,
	description: null,
	active: false,
	hidden: false,
	propertyChanged: function (prop, newValue) {
		this._changed();
	},
	toString: function () {
		return this._text || this._name;
	},
	_changed: function () {
		this.fireEvent(ColumnFilter.CHANGED);
	}
});
ColumnFilter.CHANGED = "onColumnFilterChanged";
var ColumnFilterRun = defineClass("ColumnFilterRun", ColumnFilter, {
	init : function(criteria) {
		this._super(criteria);
		this._exprNode = null;
		this.$_parse();
	},
	destroy: function() {
		this._destroying = true;
		this._exprNode = null;
		return this._super();
	},
	prepare: function (runtime, dataSource) {
		runtime.setDataSource(dataSource);
	},
	select: function (runtime, item, field) {
		if (this._exprNode) {
			runtime.setData(item, field);
			return this._exprNode.evaluate(runtime);
		} else
			return true;
	},
	setCriteria: function (value) {
		if (value != this._criteria) {
			this._criteria = value;
			this.$_parse();
		}
	},
	$_parse: function () {
		if (this._criteria) {
			this._exprNode = ExpressionParser.Default.parse(this._criteria, null);
		} else {
			this._exprNode = null;
		}
	}
});
var ColumnFilterCollection = defineClass("ColumnFilterCollection", EventAware, {
	init : function(column) {
		this._super();
		this._column = column;
		this._items = [];
		this._names = {};
		this._updating = false;
	},
	destroy: function() {
		this._destroying = true;
		this.clear(false);
		for (var i = 0, cnt = this._items.length; i < cnt ; i++) {
			this._items[i] && !this._items[i]._destroying && this._items[i].destroy && this._items[i].destroy();
			this._items[i] = null;
		}
		this._items = null;
		this._super();
		this._names = null;
	},
	count: function () {
		return this._items.length;
	},
	activeCount: function () {
		var i, cnt = 0;
		for (i = this._items.length; i--;) {
			if (this._items[i].isActive()) {
				cnt++;
			}
		}
		return cnt;
	},
	items: function () {
		return this._items.slice();
	},
	isVisible: function () {
		for (var i = this._items.length; i--;) {
			if (!this._items[i].isHidden()) {
				return true;
			}
		}
		return false;
	},
	getItemAt: function (index) {
		if (index < 0 || index >= this._items.length) {
			if ($_debug) debugger;
			throw new Error("Invalid index: " + index);
		}
		return this._items[index];
	},
	getItem: function (filterName) {
		return this._names[filterName] || null;
	},
	getItemIndex: function (filterName) {
		for (var i = this._items.length - 1; i >= 0; i--) {
			if (this._items[i]._name == filterName) {
				return i;
			}
		}
		return -1;
	},
	getActiveItems: function (active) {
		var items = [];
		for (var i = this._items.length - 1; i >= 0; i--) {
			if (this._items[i].isActive() == active) {
				items.push(this._items[i]);
			}
		}
		return items;
	},
	assign: function (source) {
		if (source === this) {
			return;
		}
		var cleared = this.clear(false);
		if (source) {
			var i;
			var cnt;
			var filter;
			var src = _asArray(source);
			if (!src) {
				src = [source];
			}
			cnt = src.length;
			for (i = 0; i < cnt; i++) {
				source = src[i];
				if (source && source.name) {
					this.$_checkName(source.name);
					filter = new ColumnFilter();
					filter.assign(source);
					this._items.push(filter);
					this._names[source.name] = filter;
					filter.addListener(this);
				}
			}
		}
		if (cleared || this.count() > 0) {
			this._changed(null);
		}
	},
	clear: function (fireEvent) {
		fireEvent = arguments.length > 0 ? fireEvent : true;
		var cnt = this._items.length;
		if (cnt > 0) {
			for (var i = 0; i < cnt; i++) {
				this._items[i].removeListener(this);
			}
			this._items.length = 0;
			this._names = {};
			fireEvent && this._changed(null);
			return true;
		}
		return false;
	},
	add: function (filter) {
		var f = _cast(filter, ColumnFilter);
		if (f) {
			if (this._items.indexOf(f) < 0 && f.name()) {
				this.$_checkName(f.name);
			}
		} else if (filter && filter.name) {
			this.$_checkName(filter.name);
			f = new ColumnFilter();
			f.assign(filter);
		}
		this._items.push(f);
		this._names[f.name] = f;
		f.addListener(this);
		this._changed(null);
	},
	addItems: function (filters, overwrite) {
		if (!_isArray(filters) && filters) {
			filters = [filters];
		}
		if (filters && filters.length > 0) {
			var i;
			var idx;
			var filter;
			var cnt = 0;
			var len = filters.length;
			for (i = 0; i < len; i++) {
				filter = _cast(filters[i], ColumnFilter);
				if (filter) {
					if (this._items.indexOf(filters[i]) < 0 && filter.name()) {
						if (!overwrite) {
							this.$_checkName(filter.name());
						}
					}
				} else if (filters[i] && filters[i].name) {
					if (!overwrite) {
						this.$_checkName(filters[i].name);
					}
					filter = new ColumnFilter();
					filter.assign(filters[i]);
				}
				idx = this.getItemIndex(filter.name());
				if (idx >= 0) {
					if (this._items[idx]) {
						this._items[idx].removeListener(this);
					}
					this._items[idx] = filter;
				} else {
					this._items.push(filter);
				}
				filter.addListener(this);
				this._names[filter.name()] = filter;
				cnt++;
			}
			if (cnt > 0) {
				this._changed(null);
			}
		}
	},
	remove: function (filterName) {
		if (!filterName) {
			return;
		}
		var i,
			filter;
		for (i = this._items.length - 1; i >= 0; i--) {
			filter = this._items[i];
			if (filter.name() == filterName) {
				this._items.splice(i, 1);
				delete this._names[filter.name()];
				filter.removeListener(this);
				this._changed(null);
				return true;
			}
		}
		return false;
	},
	removeItems: function (filterNames) {
		if (!_isArray(filterNames)) {
			return;
		}
		var i;
		var j;
		var filter;
		var cnt = 0;
		for (i = filterNames.length - 1; i >= 0; i--) {
			j = this.getItemIndex(filterNames[i]);
			if (j >= 0) {
				filter = this._items[j];
				this._items.splice(j, 1);
				delete this._names[filter.name()];
				filter.removeListener(this);
				cnt++;
			}				
		}
		if (cnt > 0) {
			this._changed(null);
		}
	},
	activateItems: function (filterNames, active) {
		if (!_isArray(filterNames)) {
			return;
		}
		var i;
		var filter;
		var cnt = 0;
		this._updating = true;
		try {
			for (i = filterNames.length - 1; i >= 0; i--) {
				filter = this._names[filterNames[i]];
				if (filter && filter.isActive() != active) {
					filter.setActive(active);
					cnt++;
				}				
			}
		} finally {
			this._updating = false;				
		}
		if (cnt > 0) {
			this._changed(null);
		}
	},
	activateAll: function (active) {
		this._updating = true;
		try {
			var i;
			var filter;
			var cnt = this._items.length;
			var dirty = false;
			for (i = 0; i < cnt; i++) {
				filter = this._items[i];
				if (filter.isActive() != active) {
					filter.setActive(active);
					dirty = true;
				}
			}
		} finally {
			this._updating = false;
		}
		if (dirty) {
			this._changed(null);
		}
	},
	toggleItems: function (filterNames) {
		if (!filterNames) {
			return;
		}
		var i;
		var filter;
		var cnt = 0;
		this._updating = true;
		try {
			for (i = filterNames.length - 1; i >= 0; i--) {
				filter = this._names[filterNames[i]];
				if (filter) {
					filter.setActive(!filter.isActive());
					cnt++;
				}
			}
		} finally {
			this._updating = false;				
		}
		if (cnt > 0) {
			this._changed(null);
		}
	},
	toggleAll: function () {
		this._updating = true;
		try {
			var i;
			var filter;
			var cnt = this._items.length;
			var dirty = false;
			for (i = 0; i < cnt; i++) {
				filter = this._items[i];
				filter.setActive(!filter.isActive());
				dirty = true;
			}
		} finally {
			this._updating = false;
		}
		if (dirty) {
			this._changed(null);
		}
	},
	$_checkName: function (name) {
		if (this._names.hasOwnProperty(name)) {
			throw new Error("Column filter already existes: " + name);
		}
	},
	_changed: function (filter) {
		if (!this._updating) {
			this.fireEvent(ColumnFilter.CHANGED, filter);
		}
	},
	onColumnFilterChanged: function (filter) {
		this._changed(filter);
	}
});
var ColumnFilterSelector = defineClass("ColumnFilterSelector", EventAware, {
	init : function (container) {
		this._super();
		this._container = container;
		this._eltActions = null;
		this._eltAll = null;
		this._eltItems = null;
		this._column = null;
		this._showing = false;
		this._x = 0;
		this._y = 0;
		this._globalMouseHandler = function (e) {
			var p = e.target;
			while (p) {
				if (p == this._element) {
					return;
				}
				p = p.parentNode;
			}
			this.hide();
		}.bind(this);
	},
	destroy: function() {
		this._destroying = true;
		this._x = null;
		this._y = null;
		this._eltActions = null;
		this._eltAll = null;
		this._eltItems = null;
		this._column = null;
		this._globalMouseHandler = null;
		this._super();
	},
	closeWhenClick: false,
	column: function () {
		return this._column;
	},
	isOpened: function () {
		return this._element && this._container.contains(this._element);
	},
	show: function (columnView, options) {
		this.hide();
		if (!columnView) return;
		this._showing = true;
		try {
			options = options || columnView.grid().filteringOptions().selector();
			this._closeWhenClick = options.isCloseWhenClick();
			this.$_show(columnView, options);
		} finally {
			this._showing = false;
		}
	},
	$_show: function (columnView, options) {
		var self = this;
		var grid = columnView.grid();
		var useCssStyle = options.isUseCssStyle(); // || grid.editorOptions().isUseCssStyle();
		this._element = this._initControl(useCssStyle);
		var elt = this._element;
		if (!elt || elt.parentNode) {
			return;
		}
		var p, cr;
		var r = columnView.boundsByContainer();
		var w = grid.width() - 10; // minus paddings + border
		var h = grid.height() - 10;
		elt.style.position = "absolute";
		elt.style.float = "none";
		elt.style.overflow = "hidden";
		elt.style.zIndex = 3000;
		if (!useCssStyle) {
			elt.style.background = "rgb(233, 233, 233)";
			elt.style.border = "1px solid rgb(200, 200, 200)";
			elt.style.boxShadow = "rgba(0, 0, 0, 0.8) 1px 2px 5px";
			elt.style.fontFamily = "Tahoma";
			elt.style.fontStyle = "normal";
			elt.style.fontVariant = "normal";
			elt.style.fontWeight = "normal";
			elt.style.fontSize = "10pt";
			elt.style.padding = "4px";
		};
		this._column = columnView.index().column();
		this.$_clearActions();
		var action = this.$_buildActions(this._column, useCssStyle);
		this.$_clearItems();
		var hasItems = this.$_buildItems(this._column, useCssStyle);
		p = parseFloat(options.getMinWidth(w));
		if (!isNaN(p) && p > 0) {
			elt.style.minWidth = p + "px";
		}
		p = parseFloat(options.getMaxWidth(w));
		if (!isNaN(p) && p > 0) {
			elt.style.maxWidth = Math.min(p, w) + "px";
		} else {
            elt.style.maxWidth = w + "px";
        }
		p = parseFloat(options.getMinHeight(h));
		if (!isNaN(p) && p > 0) {
			elt.style.minHeight = p + "px";
		}
		p = parseFloat(options.getMaxHeight(h));
		if (!isNaN(p) && p > 0) {
			elt.style.maxHeight = Math.min(p, h) + "px";
		} else {
            elt.style.maxHeight = h + "px";
        }
		this._eltAll.style.visibility = hasItems ? "" : "collapse";
		this._eltAll.style.height = hasItems ? "" : "0px";
		this._container.appendChild(elt);
		cr = elt.getBoundingClientRect();
		this._eltItems.style.height = (cr.height - this._eltActions.offsetHeight - this._eltAll.offsetHeight - 8/* paddings */) + "px";
		if (this._eltItems.offsetWidth > this._eltItems.clientWidth) {
			elt.style.width = (cr.width + this._eltItems.offsetWidth - this._eltItems.clientWidth) + "px"; // for scroll bar
		}
		p = (r.right() - cr.width);
		elt.style.left = (this._x = Math.max(0, p))  + "px";
		var y = r.bottom();
		h += 10; // padding + border 추가
		if (y + cr.height >= h) {
			y = Math.max(0, h - cr.height - 3); // TODO 3을 빼주지 않으면 아래로 넘친다. Why?
		}
		elt.style.top = (this._y = y) + "px";
		if (action && !hasItems) {
			this.hide();
			action.click(r.x/*this._x*/, this._y);
		} else if (!this._column.hasFilterAction() && !hasItems) {
			this.hide();
		} else {
			setTimeout(function () {
				_win.addEventListener("mousedown", self._globalMouseHandler);
			}, 0);
		}
	},
	hide: function () {
		var elt = this._element;
		if (!elt || !elt.parentNode) {
			return;
		}
		$_evl ? _win.removeEventListener("mousedown", this._globalMouseHandler) : _win.detachEvent("onmousedown", this._globalMouseHandler);	
		this._container.removeChild(elt);
	},
	_initControl: function (useCssStyle) {
		var container = _doc.createElement("div");
		if (useCssStyle) {
			container.className = "rg-filterselector";
		}
		container.onkeydown = function (e) {
			if (e.keyCode == 27) {
				this.hide();
			}
		}.bind(this);
		var div = this._eltActions = _doc.createElement("div");
		if (useCssStyle) {
			div.className = "rg-filter-actions";
		}
		div.style.float = "none";
		div.style.overflow = "auto";
		container.appendChild(div);
		div = this._eltAll = _doc.createElement("div");
		if (useCssStyle) {
			div.className = "rg-filter-all";
		}
		div.style.float = "none";
		if (!useCssStyle) {
			div.style.backgroundColor = "#333";
			div.style.color = "#fff";
		}
		var check = _doc.createElement("input");
		if (useCssStyle) {
			check.className = "rg-filter-all-check";
		}
		check.id = "$columnFilter_all_" + ColumnFilterSelector.$_checkId++;
		check.type = "checkbox";
		check.tabIndex = -1;
		check.onclick = function (e) {
			this._column.activateAllFilters(e.target.checked);
			this.$_refreshItems();
		}.bind(this);
		div.appendChild(check);
		var label = _doc.createElement("label");
		if (useCssStyle) {
			label.className = "rg-filter-all-label";
		}
		label.htmlFor = check.id;
		label.innerHTML = "All";
		div.appendChild(label);
		var hr = _doc.createElement("hr");
		if (useCssStyle) {
			hr.className = " ";
		}
		hr.style.height = "1px";
		hr.style.border = "0px";
		hr.style.margin = "2px";
		hr.style.color = "#777";
		hr.style.backgroundColor = "#777";
		div.appendChild(hr);
		container.appendChild(div);
		div = this._eltItems = _doc.createElement("div");
		if (useCssStyle) {
			div.className = "rg-filter-items";
		}
		div.style.float = "none";
		div.style.overflow = "auto";
		container.appendChild(div);
		return container;
	},
	_disableSelection: function (element) {
		if (typeof element.onselectstart !== 'undefined') {
			element.onselectstart = function() { return false; };
		} else if (typeof element.style.MozUserSelect !== 'undefined') {
			element.style.MozUserSelect = 'none';
		} else {
			element.onmousedown = function() { return false; };
		}
	},
	$_clearActions: function () {
		var elt = this._eltActions;
		while (elt.lastChild) {
			elt.removeChild(elt.lastChild);
		}
	},
	$_buildActions: function (column, useCssStyle) {
		var actions = column.filterActions();
		var cnt = actions.length;
		var self = this;
		!useCssStyle && (this._eltActions.style.paddingBottom = cnt ? "4px" : "0px");
		for (var i = 0; i < cnt; i++) {
			var action = actions[i];
			var div = _doc.createElement("div");
			if (useCssStyle) {
				div.className = "rg-filter-action-item"
			}
			div.container = this;
			div.action = action;
			div.style.float = "none";
			div.style.whiteSpace = "nowrap";
			div.style.cursor = "pointer";
			this._disableSelection(div);
			this._eltActions.appendChild(div);
			div.onclick = function (e) {
				var div = this._currDiv = e.currentTarget;
				var action = div.action;
				div.container.hide();
				action && action.click(self._x, self._y);
				self._closeWhenClick && self.hide();
			};
			if (!useCssStyle) {
				div.onmouseover = function (e) {
					var div = this._currDiv = e.currentTarget;
					div.style.textDecoration = "underline";
				};
				div.onmouseout = function (e) {
					var div = this._currDiv = e.currentTarget;
					div.style.textDecoration = "none";
				};
			}
			var check = _doc.createElement("input");
			if (useCssStyle) {
				check.className = "rg-filter-action-check"
			}
			check.id = "$columnAction_item_" + ColumnFilterSelector.$_checkId++;
			check.type = "checkbox";
			check.tabIndex = -1;
			check.checked = false;
			check.action = action;
			check.style.visibility = "hidden";
			div.check = check;
			div.appendChild(check);
			var label = _doc.createElement("span");
			if (useCssStyle) {
				label.className = "rg-filter-action-label";
			}
			label.innerHTML = action.displayText();
			label.title = action.description();
			div.appendChild(label);
		}
		return cnt == 1 ? actions[0] : null;
	},
	$_clearItems: function () {
		var elt = this._eltItems;
		while (elt.lastChild) {
			elt.removeChild(elt.lastChild);
		}
	},
	$_buildItems: function (column, useCssStyle) {
		var filters = column.filters();
		var visible = false;
		var self = this;
		for (var i = 0, cnt = filters.length; i < cnt; i++) {
			var filter = filters[i];
			if (!filter.isHidden()) {
				var div = _doc.createElement("div");
				if (useCssStyle) {
					div.className = "rg-filter-item"
				}
				div.style.float = "none";
				div.style.whiteSpace = "nowrap";
				this._disableSelection(div);
				this._eltItems.appendChild(div);
				if (!useCssStyle) {
					div.onmouseover = function (e) {
						var div = this._currDiv = e.currentTarget;
						div.style.textDecoration = "underline";
					};
					div.onmouseout = function (e) {
						var div = this._currDiv = e.currentTarget;
						div.style.textDecoration = "none";
					};
				}
				var check = _doc.createElement("input");
				if (useCssStyle) {
					check.className = "rg-filter-item-check";
				}
				check.id = "$columnFilter_item_" + ColumnFilterSelector.$_checkId++;
				check.type = "checkbox";
				check.tabIndex = -1;
				check.checked = filter.isActive();
				check.filter = filter;
				check.onclick = function (e) {
					var check = e.target;
					var filter = check.filter;
					filter.setActive(check.checked);
					self._closeWhenClick && self.hide();
				};
				div.check = check;
				div.appendChild(check);
				var label = _doc.createElement("label");
				if (useCssStyle) {
					label.className = "rg-filter-item-label";
				}
				label.htmlFor = check.id;
				label.innerHTML = filter.toString();
				div.appendChild(label);
				visible = true;
			}
		}
		return visible;
	},
	$_refreshItems: function () {
		var children = this._eltItems.children;
		for (var i = 0, cnt = children.length; i < cnt; i++) {
			var child = children[i];
			child.check.checked = child.check.filter.isActive();
		}
	},
	_changed: function () {
		this.fireEvent(ColumnFilter.CHANGED);
	}
}, {
	$_checkId: 0
});
ColumnFilterSelector.CHANGED = "onColumnFilterSelectorChanged";
var ColumnFilterAction = defineClass("ColumnFilterAction", EventAware, {
	init: function (column, name) {
		this._super();
		this._column = column;
		this._name = name;
	},
	name: null,
	text: null,
	description: null,
	column: function () {
		return this._column;
	},
	displayText: function () {
		return this._text || this._name;
	},
	click: function (x, y) {
		this._column && this._column.$_filterActionClick(this, x, y);
	}
});