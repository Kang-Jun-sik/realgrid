var PopupMenuItem = defineClass("PopupMenuItem", null, {
	init : function (parent, source) {
		this._super();
		this._parent = parent;
		this._children = null;
		if (source) {
			this.assign(source);
		}
	},
	visible: true,
	enabled: true,
	label: null,
	type: null,
	group: null,
	checked: false,
	tag: UNDEFINED,
	children: null,
	callback: null,
	parent: function () {
		return this._parent;
	},
	setChildren: function (value) {
	},
	isSeparator: function () {
		return this._label == "-" || this._type == MenuItemType.SEPARATOR;
	},
	getData: function () {
		return {
			label: this._label,
			checked: this._checked,
			enabled: this._enabled,
			tag: this._tag
		};
	},
	click: function () {
		if(this._type == "check") {
			this._checked = !this._checked;
		}
		this._parent._itemClicked(this);
	}
});
/* 	menu = [{
 label: "menu label", // "-" 면 separator
 type: "radio | check | normal | separator",
 group: "",
 enabled: true | false,
 checked: true | false,
 tag: "",
 children: [
 ],
 callback
 }, {
 }];
 */
var PopupMenu = defineClass("PopupMenu", EventAware, {
	init: function (name, parent, source) {
		this._super();
		this._name = name;
		this._parent = parent;
		this._items = this._load(source);
	},
	visible: true,
	enabled: true,
	name: null,
	label: null,
	manager: function () {
		var p = this._parent;
		while (p) {
			if (p.popupMenuManager && p.popupMenuManager() instanceof PopupMenuManager) {
				return p.popupMenuManager();
			}
			if (p instanceof PopupMenuManager) {
				return p;
			}
			p = p._parent;
		}
		return null;
	},
	items: function () {
		return this._items;
	},
	count: function () {
		return this._items ? this._items.length : 0;
	},
	isDescendant: function (menu) {
		var p = menu;
		while (p) {
			if (p == this) {
				return true;
			}
			p = p._parent;
		}
		return false;
	},
	_load: function (source) {
		var items = [];
		if (source) {
			source = _makeArray(source);
			for (var i = 0; i < source.length; i++) {
				var src = source[i];
				if (_isArray(src.children) && src.children.length > 0) {
					var menu = new PopupMenu(null, this, src.children);
					menu._parent = this;
					menu._label = src.label;
					menu._callback = src.callback;
					items.push(menu);
				} else {
					var item = new PopupMenuItem(this, src);
					items.push(item);
				}
			}
		}
		return items;
	},
	_itemClicked: function (menuItem) {
		if (menuItem.parent() == this && menuItem.type() == "radio") {
			var group = menuItem.group();
			if (group) {
				for (var i = 0; i < this._items.length; i++) {
					var mi = this._items[i];
					if (mi instanceof PopupMenuItem && mi.type() == "radio" && mi.group() == group) {
						mi.setChecked(false);
					}
				}
				menuItem.setChecked(true);
			}
		}
		var index = this.manager()._popupIndex;
		if (typeof menuItem.callback() === "function") {
			menuItem.callback()(menuItem.proxy(), index.proxy());// callback
		} else if (this._parent instanceof PopupMenuManager) {
			this._parent._doMenuItemClick(menuItem, index);  // dataCell button
		} else if (this._parent.onMenuItemClick) {
			this._parent.onMenuItemClick(menuItem, index);   // contextMenu
		} else {
			this._parent._itemClicked(menuItem);      // clildren click
		}
	}
});
PopupMenu.CLICKED = "onPopupMenuClicked";
var PopupMenuView = defineClass("PopupMenuView", EventAware, {
	init : function (container) {
		this._super();
		this._container = container;
		this._useCssStyle = container._gridView instanceof GridView && (container._gridView._editorOptions._useCssStyle || container._gridView._editorOptions._useCssStylePopupMenu);
		this._containerElement = null;
		this._parentView = null;
		this._dom = new Dom(this._element = this._createElement(this._useCssStyle));
		this._element.addEventListener("contextmenu", function (e) {
			e.preventDefault();
		});
		this._currDiv = null;
		this._menu = null;
		this._childView = null;
		this._showing = false;
		this._timer = undefined;
		this._viewGridInside = false;
	},
	minWidth: 0,
	maxWidth: 0,
	dropDownCount: 8,
	manager: function () {
		return this._menu.manager();
	},
	show: function (containerElement, parentView, menuModel, x, y, width, targetHeight) {
		if (!this._showing) {
			this._showing = true;
			try {
				this._containerElement = containerElement;
				this._parentView = parentView;
				this._menu = menuModel;
				var p = menuModel._parent;
				while(p._parent) {
					if (p instanceof GridView) break;
					p = p._parent;
				}
				if (p && p instanceof GridView) {
					this._viewGridInside = p._editorOptions._viewGridInside;
				} else if (p && p instanceof PopupMenuManager) {
					this._viewGridInside = p._container._gridView._editorOptions._viewGridInside;
				}

				if (menuModel._parent instanceof GridBase || menuModel._parent instanceof PopupMenuManager) {
					var grid = this.manager()._container._gridView;
					var index = CellIndex.temp(grid, -1, null).clone();
					grid._layoutManager.mouseToIndex(grid._container._currentX,grid._container._currentY,index);
					this.manager()._popupIndex = index;
				}
				this.$_show(containerElement, this._menu, x, y, width, targetHeight);
			} finally {
				this._showing = false;
			}
		}
	},
	$_show: function (containerElement, menu, x, y, width, targetHeight) {
		var elt = this._element;
		var container = this._viewGridInside ? containerElement : _doc.documentElement;
		if (!elt) {
			return;
		}
		this._menu = menu;
		this._dom.clearChildren();
		this.$_buildItems(menu);
		this._disableSelection(elt);

		container.appendChild(elt);
		var br = _getBrowserSize();
		var pr = _ieTen || _ieNine ? Dom.getBounds(_doc.body) : Dom.getBounds(_doc.documentElement);
		// var pr = Dom.getBounds(_doc.documentElement);
		var cr = Dom.getBounds(containerElement); // grid.container;
		var w = br.width;
		var h = br.height;
		var r = this._dom.getBounds();
		var sx = window.pageXOffset || _doc.documentElement.scrollLeft;
		var sy = window.pageYOffset || _doc.documentElement.scrollTop;
		if (document.documentElement.scrollWidth > document.documentElement.clientWidth) {
			h -= 18;
		}
		if (document.documentElement.scrollHeight > document.documentElement.clientHeight) {
			w -= 18;
		}
		if (this._viewGridInside) {
			if (y + cr.top + r.height > cr.bottom) {
				if (!this._parentView) {
					y = y - r.height - targetHeight;
				} else {
					y = cr.bottom - r.height - cr.top - 3;
				}
			}
		} else {
			if (!this._parentView) {
				x += cr.left - pr.left;
				y += cr.top - pr.top;
			}
			if (y + r.height >= h + sy - 3) {
				y = y - r.height - 3;
				if (y < 0) {
					y = Math.max(0, h - r.height - 3);
				}
			}
			if (x + r.width >= w + sx - 3) {
				x = Math.max(0, w - r.width - 3);
			} else if (width !== undefined) {
				if (r.width < width) {
					x += width - r.width;
				}
			}
		}
		this._dom.move(Math.max(0, x), Math.max(0, y));
	},
	hide: function (recursive) {
		if (recursive && this._parentView) {
			this._parentView.hide(true);
		} else {
			this.$_hideChildView();
			var elt = this._element;
			if (elt && elt.parentNode) {
				this._viewGridInside ? this._containerElement.removeChild(elt) : _doc.documentElement.removeChild(elt);
			}
		}
	},
	_createElement: function (useCssStyle) {
		var element = Dom.createElement("div",{
			position : "absolute",
			float : "none",
			minWidth : "60px",
			overflow : "hidden",
			zIndex : 3000
		});
		!useCssStyle && Dom.setStyles(element,{
			background : "rgb(233, 233, 233)",
			border : "1px solid rgb(200, 200, 200)",
			boxShadow : "rgba(0, 0, 0, 0.8) 1px 2px 5px",
			fontFamily : "Tahoma",
			fontStyle : "normal",
			fontVariant : "normal",
			fontWeight : "normal",
			fontSize : "10pt",
			padding : "4px",
			margin : "0px"
		});
		if (useCssStyle) {
			element.className = "rg-popup-menu";
		}
		element.onkeydown = function (e) {
			if (e.keyCode == 27) {
				this.hide();
			}
		}.bind(this);
		return element;
	},
	_showChild: function (menuDiv) {
		if (this != this.manager()._showingView) {
			return;
		}
		if (this._childView && this._childView._menu === menuDiv.menuItem || this._currDiv !== menuDiv) {
			return;
		}
		this.$_hideChildView();
		var menuItem = menuDiv.menuItem;
		var r = this._element.getBoundingClientRect();
		var x = this._element.offsetLeft + r.width - 4;
		var y = this._element.offsetTop + menuDiv.offsetTop;
		this._childView = PopupMenuView._borrowView(this._container);
		this._childView.show(this._containerElement, this, menuItem, x, y);
	},
	$_hideChildView: function () {
		this.manager()._showingView = null;
		if (this._childView) {
			this._childView.$_hideChildView();
			var container = this._viewGridInside ? this._containerElement : _doc.documentElement;
			this._childView._element && container.removeChild(this._childView._element);
			PopupMenuView._returnView(this._childView);
			this._childView = null;
		}
	},
	_disableSelection: function (element) {
		/*
		 element.style["-webkit-user-select"] = "none";
		 element.style["-moz-user-select"] = "none";
		 element.style["-khtml-user-select"] = "none";
		 element.style["-ms-user-select"] = "none";
		 */
		element.style.WebkitUserSelect = "none";
		element.style.MozUserSelect = "none";
		element.style.KhtmlUserSelect = "none";
		element.style.MsUserSelect = "none";
		if (typeof element.onselectstart !== 'undefined') {
			element.onselectstart = function() { return false; };
		} else if (typeof element.style.MozUserSelect !== 'undefined') {
			element.style.MozUserSelect = 'none';
		} else {
			element.onmousedown = function() { return false; };
		}
	},
	$_buildItems: function (menu) {
		var items = menu.items();
		var n = 0;
		var clsList = [];
		for (var i = 0, cnt = items.length; i < cnt; i++) {
			var menuItem = items[i];
			if (!menuItem.isVisible()) continue;
			var div = _doc.createElement("div");
			div.menuView = this;
			div.menuItem = menuItem;
			Dom.setStyles(div, {
				position : "relative",
				float : "none",
				width : "100%"
			});
			!this._useCssStyle && Dom.setStyles(div,{
				paddingTop : "2px",
				paddingBottom : "2px",
				cursor : "default"
			})
			if (menuItem instanceof PopupMenuItem && menuItem.isSeparator()) {
				this._useCssStyle && (div.className = "rg-popup-separator");
				var hr = _doc.createElement("hr");
				!this._useCssStyle && Dom.setStyles(hr,{
					height : "1px",
					border : "0px",
					margin : "2px",
					color : "#777",
					backgroundColor : "#777"
				});
				this._useCssStyle && (hr.className = "rg-popup-separator-hr");
				div.appendChild(hr);
				div.onmouseover = function (e) {
					if (div.menuView && div.menuView._childView) {
						div.menuView.$_hideChildView();
					}
				}
			} else {
				clsList.length = 0;
				!this._useCssStyle && ( div.style.color = menuItem.isEnabled() ? "#333" : "#aaa" );
				this._useCssStyle && clsList.push("rg-popup-item");
				this._useCssStyle && menuItem.group && menuItem.group() && clsList.push("rg-popup-"+menuItem.group());
				this._useCssStyle && !menuItem.isEnabled() && clsList.push("rg-popup-item-disable");
				this._useCssStyle && (div.className = clsList.join(" "));
				div.style.whiteSpace = "pre";
				div.onclick = function (e) {
					var div = e.currentTarget;
					var menuItem = div.menuItem;
					if (menuItem instanceof PopupMenu) {
						if (menuItem.isEnabled()) {
							this._showChild(div);
						}
					} else if (menuItem) {
						this.hide(true);
						if (menuItem.isEnabled()) {
							menuItem.click();
						}
					} else {
						this.$_hideChildView();
					}
				}.bind(this);
				div.onmouseover = function (e) {
					var div = this._currDiv = e.currentTarget;
					var menuItem = div.menuItem;
					if (menuItem.isEnabled() && !this._useCssStyle) {
						div.style.background = "rgba(0, 255, 0, 0.2)";
					}
					if (menuItem instanceof PopupMenu) {
						this.manager()._showingView = div.menuView;
						this.timer = setTimeout(function () {
							div.menuView._showChild(div);
						}, 200);
					} else {
						if (div.menuView && div.menuView._childView) {
							div.menuView.$_hideChildView();
						}
					}
				}.bind(this);
				div.onmouseout = function (e) {
					var div = e.currentTarget;
					!this._useCssStyle && (div.style.background = "");
				};
				var check = _doc.createElement("span");
				clsList.length = 0;
				check.style.display = "inline-block";
				check.style.minWidth = "20px";
				check.style.minHeight = "7px";
				check.style.verticalAlign = "middle";
				check.innerHTML = "";
				this._useCssStyle && menuItem.type && (menuItem.type() === "radio" || menuItem.type() === "check") && clsList.push(menuItem.group() ? "rg-popup-radio" : "rg-popup-check");

				if (menuItem.isChecked && menuItem.isChecked()) {
					!this._useCssStyle && Dom.setStyles(check, {
						backgroundImage : "url(" + $$_rootContext + $$_assets + (menuItem.group() ? "menu_radio.png" : "menu_check.png") + ")",
						backgroundRepeat : "no-repeat",
						backgroundPosition : "center center"
					})
					this._useCssStyle && clsList.push(menuItem.group() ? "rg-popup-radio-checked" : "rg-popup-check-checked");
				}
				this._useCssStyle && (check.className = clsList.join(" "));
				check.tabIndex = -1;
				this._disableSelection(check);
				div.appendChild(check);
				var span = _doc.createElement("span");
				span.id = "$popupMenu_item_" + PopupMenuView.$_menuId++;
				span.style.paddingRight = "24px";
				span.innerHTML = menuItem.label();
				span.tabIndex = -1;
				this._disableSelection(span);
				div.appendChild(span);
				if (menuItem instanceof PopupMenu) {
					var arrow = _doc.createElement("span");
					this._useCssStyle && (arrow.className = "rg-popup-expander");
					div.appendChild(arrow);
					arrow.style.position = "absolute";
					arrow.style.right = "0px";
					arrow.style.width = "24px";
					arrow.style.height = (13 + 2 + 2) + "px"; // 13 = 10pt
					check.style.verticalAlign = "middle";
					arrow.innerHTML = " ";
					!this._useCssStyle && Dom.setStyles(arrow, {
						backgroundImage : "url(" + $$_rootContext + $$_assets + "menu_expander.png" + ")",
						backgroundRepeat : "no-repeat",
						backgroundPosition : "center center"
					})
					arrow.tabIndex = -1;
					this._disableSelection(arrow);
					div.appendChild(arrow);
				}
			}
			this._disableSelection(div);
			this._element.appendChild(div);
			n++;
		}
	}
}, {
	$_menuId: 0,
	$_views: [],
	_borrowView: function (container) {
		var view = PopupMenuView.$_views.pop();
		if (!view) {
			view = new PopupMenuView(container);
		}
		return view;
	},
	_returnView: function (view) {
		if (view._children) {
			for (var i = 0; i < view._children.length; i++) {
				PopupMenuView.returnView(view[i]);
			}
		}
		PopupMenuView.$_views.push(view);
	}
});
var PopupMenuManager = defineClass("PopupMenuManager", EventAware, {
	init: function (visualContainer) {
		this._super();
		this._container = visualContainer;
		this._menus = [];
		this._mainView = null;
		this._showingView = null;
		this._popupIndex = null;
		this._globalMouseHandler = function (e) {
			var p = e.target;
			while (p) {
				if (p == this._mainView._element || p.menuItem) {
					return;
				}
				p = p.parentNode;
			}
			this.close();
		}.bind(this);
	},
	indexOf: function (name) {
		for (var i = this._menus.length; i--;) {
			if (_equalsText(this._menus[i].name(),name)) {
				return i;
			}
		}
		return -1;
	},
	getMenu: function (name) {
		for (var i = this._menus.length; i--;) {
			if (_equalsText(this._menus[i].name(),name)) {
				return this._menus[i];
			}
		}
		return null;
	},
	addMenu: function (name, menuItems, overwrite) {
		if (_isWhiteSpace(name)) {
			throw "Menu name is empty.";
		}
		var index = -1;
		if (!overwrite) {
			index = this.indexOf(name);
			if (index >= 0) {
				return this._menus[index];
			}
		}
		var menu = new PopupMenu(name, this, menuItems);
		if (overwrite) {
			this._menus[index] = menu;
		} else {
			this._menus.push(menu);
		}
		return menu;
	},
	removeMenu: function (name) {
		var i = this.indexOf(name);
		if (i >= 0) {
			this._menus.splice(i, 1);
		}
	},
	clearMenus: function () {
		this._menus.length = 0;
	},
	show: function (menu, targetView) {
		if (!this._mainView) {
			if (typeof menu === "string") {
				menu = this.getMenu(menu);
			} else 	if (!(menu instanceof PopupMenu)) {
				menu = new PopupMenu(null, this, menu);
			}
			if (menu) {
				var r = targetView.boundsByContainer();
				var y = r.top();
				if (targetView instanceof MergedDataCellElement) {
					var grid = targetView.grid();
					var lm = grid.layoutManager();
					var itemIndex = targetView.index().I() + targetView.innerIndex() - grid.topItem()+grid.fixedOptions().rowCount();
					if (itemIndex >= 0) {
						var r2 = lm.itemBounds(itemIndex);
						y = lm.bodyBounds().top()+r2.bottom();
					} else {
						y = r.bottom();
					}
				} else {
					y = r.bottom();
				}
				this._mainView = PopupMenuView._borrowView(this._container);
				this._mainView.show(this._container._container, null, menu, r.x, y, r.width, r.height);
				$_evl ? _win.addEventListener("mousedown", this._globalMouseHandler) : _win.attachEvent("onmousedown", this._globalMouseHandler);
			}
		}
	},
	showContext: function (menu, x, y) {
		if (menu && !this._mainView) {
			this._mainView = PopupMenuView._borrowView(this._container);
			this._mainView.show(this._container._container, null, menu, x, y, 0, 0);
			$_evl ? _win.addEventListener("mousedown", this._globalMouseHandler) : _win.attachEvent("onmousedown", this._globalMouseHandler);
		}
	},
	close: function () {
		if (this._mainView) {
			this._mainView.hide();
			PopupMenuView._returnView(this._mainView);
			this._mainView = null;
			$_evl ? _win.removeEventListener("mousedown", this._globalMouseHandler) : _win.detachEvent("onmousedown", this._globalMouseHandler);	
		}
	},
	_doMenuItemClick: function (menuItem, index) {
		this.fireEvent(PopupMenuManager.MENU_ITEM_CLICKED, menuItem, index);
	}
});
PopupMenuManager.MENU_ITEM_CLICKED = "onPopupMenuManagerMenuItemClicked";