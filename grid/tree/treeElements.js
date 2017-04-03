var TreeExpandHandle = defineClass("TreeExpandHandle", CellHandle, {
	init : function(dom, cell) {
		this._super(dom, cell, "treeItemExpandHandle");
		this._figureBackground = SolidBrush.BLACK;
	},
	expanded: false,
	figureSize: 9,
	figureBackground: null,
	background: null,
	isClickable: function () {
		return true;
	},
	_doDraw: function (g) {
		var sz = this.figureSize(),
			fill = this.background(),
			r = new Rectangle(0, 0, this.width(), this.height());
		if (fill) {
		}
		if (this.isExpanded()) {
			$$_drawMinusBox(g, r, sz, this.figureBackground(), fill);
		} else {
			$$_drawPlusBox(g, r, sz, this.figureBackground(), fill);
		}
	}
});
var TREE_CHECK_SIZE = 12;
var TREE_CHECK_BOX_SIZE = TREE_CHECK_SIZE - 2;
var TREE_CHECK_BORDER = new SolidPen(0xffbbbbbb);
var TREE_CHECK_FILL = new SolidBrush(0xffffffff);
var TREE_CHECK_FILL2 = new SolidBrush(0xffeeeeee);
var TREE_CHECK_MARK_FILL = new SolidBrush(0xff444444);
var TreeCheckElement = defineClass("TreeCheckElement", VisualElement, {
	init : function(dom) {
		this._super(dom, "treeCheckView");
	},
	item: null,
	checkable: true,
	checked: false,
	exclusive: false,
	isClickable: function () {
		return true;
	},
	_doDraw: function (g) {
		var r = new Rectangle(0, 0, this.width(), this.height());
		g.drawRectI(null, null, r);
		var checkSize = TREE_CHECK_SIZE;
		var sz = TREE_CHECK_BOX_SIZE;
		var x = _floor(r.x + (r.width - sz) / 2);
		var y = _floor(r.y + (r.height - sz) / 2);
		var stroke = TREE_CHECK_BORDER;
		if (this._exclusive) {
			var rd = sz / 2;
			g.drawCircle(this._checkable ? TREE_CHECK_FILL : TREE_CHECK_FILL2, TREE_CHECK_BORDER, x + rd, y + rd, rd);
			if (this._checked) {
				g.drawCircle(TREE_CHECK_MARK_FILL, null, x + rd, y + rd, rd / 2);
			}
		} else {
			g.drawBoundsI(this._checkable ? TREE_CHECK_FILL : TREE_CHECK_FILL2, TREE_CHECK_BORDER, x, y, sz, sz);
			if (this._checked) {
				checkSize *= 0.9;
				$$_drawCheckMark(g, TREE_CHECK_MARK_FILL, r, checkSize);
			}
		}
	}
});
var TreeExpanderElement = defineClass("TreeExpanderElement", CellElement, {
	init : function(dom, name) {
		this._super(dom, name);
		this._handle = new TreeExpandHandle(dom, this);
		this.addElement(this._handle);
		this._checkView = new TreeCheckElement(dom, this);
		this.addElement(this._checkView);
		this._iconView = new IconElement(dom, "treeIconView");
		this._iconView.setMouseEnabled(false);
		this.addElement(this._iconView);
		this._line = null;
		this._expanderWidth = 0;
		this._dataCell = null;
		this._useCellStyles = true;
	},
	setHandleWidth: function (value) {
		this._handle.setWidth(value);
	},
	setShowCheck: function (value) {
		this._checkView.setVisible(value);
	},
	setCheckSize: function (value) {
		this._checkView.setWidth(value);
	},
	setIconWidth: function (value) {
		this._iconView.setWidth(value);
	},
	setExpanderWidth: function (value) {
		this._expanderWidth = value;
	},
	setExclusive: function (value) {
		this._checkView.setExclusive(value);
	},
	getAdapter: function (adapter) {
		if (adapter == DataCellElement) {
			return this._dataCell;
		}
		return this._super(adapter);
	},
	_doPrepareElement: function (styles) {
		this._super(styles);
	},
	_doUpdateContent: function (cell) {
		this._super(cell);
		var tree = this.grid(),
			item = cell.index().item();
		if (this._checkView.isVisible()) {
			this._checkView.setItem(item);
			this._checkView.setCheckable(item.isCheckable());
			this._checkView.setChecked(item.isChecked());
		}
		this._iconView.setImage(tree.getTreeIcon(item));
		item.setIconHeight(this._iconView.iconHeight());
		this._handle.setVisible(item.hasChildren());
		this._handle.setExpanded(item.isExpanded());
		var styles = cell.styles();
		this._handle.setBackground(styles.background());
		this._handle.setFigureBackground(styles.figureBackground());
		this._handle.setFigureSize(styles.figureSize() ? styles.figureSize().getDimension(this._handle.width()) : 9);
	},
	_doLayoutContent: function (layout) {
		var styles = this.grid().treeOptions().expanderStyles();
		var x = this._handle.width() * (this.index().item().level() - 1);// + styles.paddingLeft();
		var wCheck = this._checkView.isVisible() ? this._checkView.width() : 0;
		this._handle.setBounds(x, this.borderTopWidth(), this._handle.width(), this.height() - this.borderTopWidth() - this.borderBottomWidth());
		this._handle.invalidate();
		if (wCheck > 0) {
			this._checkView.setBounds(x + this._handle.width(), this.borderTopWidth(), wCheck, this.height() - this.borderTopWidth() - this.borderBottomWidth());
			this._checkView.invalidate();
		}
		var wIcon = this._iconView.width();
		if (wIcon > 0) {
			this._iconView.setVisible(true);
			this._iconView.setBounds(x + this._handle.width() + wCheck, this.borderTopWidth(), wIcon, this.height() - this.borderTopWidth() - this.borderBottomWidth());
			this._iconView.invalidate()
		} else {
			this._iconView.setVisible(false);
		}
	},
	_doRender: function (g, rc) {
		var dataCell = this._useCellStyles ? this._dataCell : null;
		var fill = dataCell ? dataCell.background() : this.background();
		if (fill) {
			g.drawRectI(fill, null, rc);
		}
		var wBottom = dataCell ? dataCell.borderBottomWidth() : this.borderBottomWidth();
		var wRight = this.borderRightWidth();
		if (wBottom) {
			wBottom = _floor((wBottom + 1) / 2);
			g.drawLineI(dataCell ? dataCell._borderBottom : this._borderBottom, rc.x, rc.bottom() - wBottom, rc.right(), rc.bottom() - wBottom);
		}
		if (this.width() < this._expanderWidth && wRight) {
			wRight = _floor((wRight + 1) / 2);
			g.drawLineI(this._borderRight, rc.right() - wRight, rc.y, rc.right() - wRight, rc.bottom());
		}
	},
	canHovering: function () {
		return false;
	},
	_setDataCell: function (cell) {
		this._dataCell = cell;
	}
});
var TreeItemElement = defineClass("TreeItemElement", RowElement, {
	init : function(dom) {
		this._super(dom);
		this.setName("treeItemView");
		this._expander = new TreeExpanderElement(dom, "treeExpanderView");
		this.addElement(this._expander);
	},
	_clearChildren: function () {
		this._super();
		this.addElement(this._expander);
	},
	_prepareCells: function (lm) {
		this._super(lm);
		if (this.childCount() > 0 && (lm.firstCol() == 0 || this.isFixed()) && !this.isRightFixed()) {
			var tree = this.grid();
			var options = tree.treeOptions();
			var expander = this._expander;
			var cell = this.grid().getExpanderCell(this.index());
			var view = this._getFirstCell(lm);
			expander.setShowCheck(options.isShowCheckBox());
			expander.setExclusive(tree.checkBar().isExclusive());
			expander._setDataCell(view);
			expander.setVisible(true);
			expander.updateCell(cell);
		} else {
            this._expander.setVisible(false);
        }
	},
	_layoutCells: function (lm) {
		this._super(lm);
		if (this._expander.isVisible()) {
			var tree = this.grid();
			var item = this.item();
			var options = tree.treeOptions();
			var view = this._getFirstCell(lm);
			var level = item.level();
			var wHandle = options.expanderWidth();
			var wCheck = options.isShowCheckBox() ? options.checkBoxSize() : 0;
			var wIcon = options.iconWidth();
			var expander = this._expander;
			if (wIcon <= 0 && options.icons()) {
				var icon = tree.getTreeIcon(item);
				if (icon) {
					wIcon = icon.width;
				}
			}
			var styles = options.expanderStyles();
			var wExpander = wHandle * level + wCheck + wIcon + styles.paddingRight();// styles.paddingHorz();
			var wView = view.width();
			view.setWidth(wView - wExpander);
			view.setX(view.x() + wExpander);
			view.layoutTreeContent(lm);
			expander._useCellStyles = options.isExpanderWithCellStyles();
			expander.setHandleWidth(wHandle);
			expander.setShowCheck(options.isShowCheckBox());
			expander.setExclusive(tree.checkBar().isExclusive());
			expander.setCheckSize(wCheck);
			expander.setIconWidth(wIcon);
			expander.setExpanderWidth(wExpander);
			expander.setBounds(0, 0, Math.min(wExpander, wView), this.height());
			expander.setIndex(CellIndex.temp(tree, this.index(), null));
			expander.layoutContent(lm);
		}
	}
});
var TreeItemFooterElement = defineClass("TreeItemFooterElement", ItemElement, {
	init: function(dom, fixed, rightFixed) {
		this._super(dom, "treeItemFooterView");
		this._fixed = fixed;
		this._rightFixed = rightFixed;
		this._cells = {};
	},
	fixed: false,
	_doUpdateElement: function (styles) {
		this._super(styles);
	},
	_doMesasure: function (grid, hintWidth, hintHeight) {
		return { width: hintWidth, height: hintHeight };
	},
	_doLayoutContent: function (lm) {
		this._prepareCells(lm);
		this._layoutCells(lm);
	},
	_doRender: function (g, r) {
		if (this.isFixed()) {
			var fill, stroke, lstroke,
				options = this.grid().fixedOptions(),
				styles = options.colBarStyles(), 
				wbar = options.colBarWidth();

			if (this._rightFixed) {
				r.setRight(wbar);
			} else {
				r.setLeft(r.right() - wbar);
			}
			fill = styles.background();
			if (fill) {
				g.drawRectI(fill, null, r);
			}
			stroke = styles.borderRight();
			if (stroke) {
				g.drawLine(stroke, r.right() - 1, r.y, r.right() - 1, r.bottom());
			}
			lstroke = styles.borderLeft();
			if (lstroke && this._rightFixed) {
				g.drawLine(stroke, r.x, r.y, r.x, r.bottom());
			}
		}
	},
	prepareCells: function (lm) {
		this.clear();
		var	tree = this.grid();
		var	start = lm.firstCol(this._fixed, this._rightFixed);
		var	end = lm.lastCol(this._fixed, this._rightFixed);
		for (var i = start; i <= end; i++) {
			var column = lm.getColumn(i);
			var view = this._cells[column];
			if (!view) {
				if (column instanceof ColumnGroup) {
					view = new GroupFooterGroupCellElement(this._dom);
				} else {
					view = new GroupFooterCellElement(this._dom);
				}
				this._cells[column.$_hash] = view;
			}
			this.addElement(view);
			var index = CellIndex.temp(tree, this.index(), column);
			var model = tree.getFooterCell(index);
			view.updateCell(model);
		}
	},
	layoutCells: function (lm) {
		var	tree = this.grid();
		var	start = lm.firstCol(this._fixed, this._rightFixed);
		var	end = lm.lastCol(this._fixed, this._rightFixed);
		for (var i = start; i <= end; i++) {
			var view = this._cells[lm.getColumn(i).$_hash];
			var r = lm.columnBounds(i);
			if (!this.isFixed()) {
				r.x -= tree.leftPos;
			}
			r.height = this.height();
			view.setRect(r);
			view.layoutContent(lm);
		}
	}
});
var TreeLinesElement = defineClass("TreeLinesElement", LayerElement, {
	init : function(dom, tree) {
		this._super(dom, "treeLinesView");
		this._tree = tree;
		this._startIndex = -1;
		this._endIndex = -1;
		this._levelWidth = 20;
		this._handleWidth = 9;
		this._handleHeight = 9;
		this._stroke = SolidPen.LTGRAY;
		this._options = null;
	},
	setLevelWidth: function (value) {
		if (value != this._levelWidth) {
			this._levelWidth = value;
			this.invalidate();
		}
	},
	setHandleWidth: function (value) {
		if (value != this._handleWidth) {
			this._handleWidth = value;
			this.invalidate();
		}
	},
	setHandleHeight: function (value) {
		if (value != this._handleHeight) {
			this._handleHeight = value;
			this.invalidate();
		}
	},
	setStroke: function (value) {
		if (value != this._stroke) {
			this._stroke = value;
			this.invalidate();
		}
	},
	setRange: function (tree, startIndex, endIndex) {
		this._options = tree.treeOptions();
		if (startIndex != this._startIndex || endIndex != this._endIndex) {
			this._startIndex = startIndex;
			this._endIndex = endIndex;
			this.invalidate();
		}
	},
	$_findLevelItem: function (tree, level, start) {
		var i, item;
		for (i = start; i <= this._endIndex; i++) {
			item = tree.getItem(i);
			if (item && item.level() == level) {
				return item;
			}
		}
		return null;
	},
	$_drawVertLine: function (g, src, dst, level) {
		var r, sz,
			lm = this._tree.layoutManager(),
			top = lm.topIndex(),
			x1 = level * this._levelWidth + this._levelWidth / 2,
			y1 = 0,
			y2 = this.height();
		if (src) {
			r = lm.itemBounds(src.index() - top);
			sz = (src instanceof TreeItem && src.hasChildren()) ? this._handleHeight : 0;
			y1 = r.y + r.height / 2 + sz / 2;
		}
		if (dst) {
			r = lm.itemBounds(dst.index() - top);
			sz = (dst instanceof TreeItem && dst.hasChildren()) ? this._handleHeight : 0;
			y2 = r.y + r.height / 2 - sz / 2;
		}
		x1 = _floor(x1);
		g.drawLineI(this._stroke, x1, y1, x1, y2);
	},
	$_drawChildLine: function (g, src, dst) {
		var y1, r, sz, 
			lm = this._tree.layoutManager(),
			top = lm.topIndex(),
			x1 = src.level() * this._levelWidth + this._levelWidth / 2,
			y2 = this.height();
		r = lm.itemBounds(src.index() - top);
		if (this._options.isShowCheckBox()) {
			y1 = r.y + r.height / 2 + TREE_CHECK_BOX_SIZE / 2;
		} else if (this._options.icons() && src instanceof TreeItem && src.iconHeight() > 0) {
			y1 = r.y + r.height / 2 + src.iconHeight() / 2;
		} else {
			y1 = r.bottom() - r.height / 4;
		}
		if (dst) {
			r = lm.itemBounds(dst.index() - top);
			sz = (dst instanceof TreeItem && dst.hasChildren()) ? this._handleHeight : 0;
			y2 = r.y + r.height / 2 - sz / 2;
		}
		x1 = _floor(x1);
		g.drawLineI(this._stroke, x1, y1, x1, y2);
	},
	$_drawHorzLine: function (g, item) {
		var r,
			lm = this._tree.layoutManager(),
			top = lm.topIndex(),
			x1 = item.parent().level() * this._levelWidth + this._levelWidth / 2,
			x2 = item.level() * this._levelWidth,// + m_levelWidth / 2;
			y = 0;
		if (item instanceof TreeItem && item.hasChildren()) {
			x1 += this._handleWidth / 2;
		}
		r = lm.itemBounds(item.index() - top);
		y = _floor(r.y + r.height / 2);
		g.drawLineI(this._stroke, x1, y, x2, y);
	},
	_doDraw: function (g) {
		g.clipBounds(0, 0, this.width(), this.height());
		var tree = this._tree;
		if (!tree || this._startIndex < 0 || this._endIndex < 0 || this._startIndex > this._endIndex) {
			return;
		}
		var i, j, item, level, parent, next, prev, last, r1, r2, x1, y1, y2 ,sz;
		var lm = tree.layoutManager();
		var szExp = 9;
		var startLevel = -1; // 현재 표시되는 아이템들의 최소 level.
		var top = tree.topIndex();
		item = null;
		for (i = this._startIndex; i <= this._endIndex; i++) {
			item = tree.getItem(i);
			if (item) {
				break;
			}
		}
		if (!item) {
			return;
		}
		level = item.level();
		if (level > 1 || item.childIndex() > 0) {
			for (j = 0; j < level; j++) {
				parent = item.getAncestor(j);
				next = parent.last();
				if (next && next.index() >= i) {
					next = this.$_findLevelItem(tree, j + 1, i);
					this.$_drawVertLine(g, null, next, parent.level());
				}
			}
			if (item.childIndex() > 0) {
				this.$_drawVertLine(g, null, item, item.parent().level());
			}
		}
		for (; i <= this._endIndex; i++) {
			item = tree.getItem(i);
			parent = item.parent();
			j = item.childIndex();
			if (j < parent.count() - 1) {
				next = parent.getItem(j + 1);
				if (next.index() > this._endIndex) {
					next = null;
				}
				this.$_drawVertLine(g, item, next, parent.level());
			}
			parent = item;
			if (parent && parent.isExpanded() && parent.count() > 0) {
				next = parent.getItem(0);
				if (next.index() > this._endIndex) {
					next = null;
				}
				this.$_drawChildLine(g, item, next);
			}
			this.$_drawHorzLine(g, item);
		}
	}
});
var TreeBodyElement = defineClass("TreeBodyElement", GridBodyElement, {
	init : function(dom, body, fixed, rfixed) {
		this._super(dom, body, fixed, rfixed);
		this._footers = [];
		this._footerViews = [];
	},
	clearItems: function () {
		this._super();
		this._footers.splice(0, this._footers.length);
	},
	addItem: function (item) {
		if (item instanceof GroupFooter) {
			this._footers.push(item);
		} else {
			this._super(item);
		}
	}
});