var /* @abtract */ CellElement = defineClass("CellElement", GridElement, {
	init: function (dom, name) {
		this._super(dom, name);
		this._grid = null;
		this._fixed = false;
		this._recycling = false;
		this._index = new CellIndex();
		this._renderRect = new Rectangle();
		this._textAlign = "near";
		this._lineAlign = "middle";
	},
	destroy: function() {
		this._destroying = true;
		this._grid = null;
		this._font = null;
		this._index = null;
		this._renderREct = null;
		this._super();
	},
	background: SolidBrush.WHITE,
	foreground: SolidBrush.BLACK,
	font: null,
	border: null,
	borderLeft: null,
	borderTop: null,
	borderRight: null,
	borderBottom: null,
	paddingLeft: 0,
	paddingTop: 0,
	paddingRight: 0,
	paddingBottom: 0,
	line: null,
	figureBackground: SolidBrush.DKGRAY,
	figureInactiveBackground: SolidBrush.LTGRAY,
	figureBorder: null,
	figureSize: null,
	figureName: null,
	figureState: null,
	textAlignment: Alignment.NEAR,
	lineAlignment: Alignment.CENTER,
	textWrap: TextWrapMode.NONE,
	pushed: false,
	mouseEntered: false,
    pressed: false,
	clickable: false,
	index: null,
	isFixed: function () { return this._fixed; },
	setIndex: function (value) { 
		if (!CellIndex.areEquals(this._index, value)) {
			this._index.assign(value); 
			this.invalidate();
		}
	},
	getItem: function () { return this._index.item(); },
	item: function () { return this._index.item(); },
	setTextAlignment: function (value) {
		if (value != this._textAlignment) {
			this._textAlignment = value;
			switch (value) {
			case Alignment.FAR:
				this._textAlign = "right";
				break;
			case Alignment.NEAR:
				this._textAlign = "left";
				break;
			default:
				this._textAlign = "center";
				break;
			}
			this.invalidate();
		}
	},
	setLineAlignment: function (value) {
		if (value != this._lineAlignment) {
			this._lineAlignment = value;
			switch (value) {
				case Alignment.FAR:
					this._lineAlign = "bottom";
					break;
				case Alignment.NEAR:
					this._lineAlign = "top";
					break;
				default:
					this._lineAlign = "middle";
					break;
			}
			this.invalidate();
		}
	},
	setFont: function (value) {
		var f = this._font;
		if (value == f) return;
		if (!value || !f || value.font != f.font || value.size != f.size || value.underline != f.underline) {
			this._font = value;
			this.invalidate();
		}
	},
	borderWidth: function () {
		return this._border ? this._border.width() : 0;
	},
	borderLeftWidth: function () {
		return this._borderLeft ? this._borderLeft.width() : 0;
	},
	borderRightWidth: function () {
		return this._borderRight ? this._borderRight.width() : 0;
	},
	borderHorzWidth: function () {
		return (this._borderLeft ? this._borderLeft.width() : 0) + (this._borderRight ? this._borderRight.width() : 0);
	},
	borderTopWidth: function () {
		return this._borderTop ? this._borderTop.width() : 0;
	},
	borderBottomWidth: function () {
		return this._borderBottom ? this._borderBottom.width() : 0;
	},
	borderVertWidth: function () {
		return (this._borderTop ? this._borderTop.width() : 0) + (this._borderBottom ? this._borderBottom.width() : 0);
	},
	paddingHorz: function () {
		return this._paddingLeft + this._paddingRight;
	},
	paddingVert: function () {
		return this._paddingTop + this._paddingBottom;
	},
	textAlign: function () {
		return this._textAlign;
	},
	lineAlign: function () {
		return this._lineAlign;
	},
	canHovering: function (hovered) {
		return true;
	},
	setMouseEntered: function (value) {
		if (value != this._mouseEntered) {
			this._mouseEntered = value;
			if (this.canHovering(value)) {
				this._doLayoutHandles();
				this.invalidate(false, true);
			}
		}
	},
    setPressed: function (value) {
        if (value != this._pressed) {
            this._pressed = value;
            this.invalidate(false, true);
        }
    },
	updateCell: function (model) {
		this._grid = this.grid();
		this.setIndex(model.index());
		this._doPrepareValue(model);
		this._doPrepareElement(model.styles());
		this._doUpdateContent(model);
	},
	inflatePadding: function (r) {
		r.x += this._paddingLeft;
		r.width -= this._paddingLeft + this._paddingRight;
		r.y += this._paddingTop;
		r.height -= this._paddingTop + this._paddingBottom;
		return r;
	},
	deflatePadding: function (r) {
		r.x -= this._paddingLeft;
		r.width += this._paddingLeft + this._paddingRight;
		r.y -= this._paddingTop;
		r.height += this._paddingTop + this._paddingBottom;
		return r;
	},
	deflatePadding2: function (r) {
		r.x += this._paddingLeft;
		r.width -= this._paddingLeft + this._paddingRight;
		r.y += this._paddingTop;
		r.height -= this._paddingTop + this._paddingBottom;
		return r;
	},
	inflatePadding2: function (r) {
		r.x -= this._paddingLeft;
		r.width += this._paddingLeft + this._paddingRight;
		r.y -= this._paddingTop;
		r.height += this._paddingTop + this._paddingBottom;
		return r;
	},
    getButtonWidth: function () {
        return 0;
    },
	propertyChanged: function (prop, value) {
		this.invalidate();
	},
	_doLayoutContent: function (lm) {
		this._doLayoutHandles();
	},
	_doRender: function (g, r) {
		g.drawTextRect(null, SolidBrush.BLACK, "Cell:" + this._index.toString(), r, TextAlign.CENTER);
	},
	_doPrepareValue: function (model) {
	},
	_doPrepareElement: function (styles) {
        this.setBackground(styles.background());
        this.setForeground(styles.foreground());
        this.setFont(styles.font());
        this.setBorder(styles.border());
        this.setBorderLeft(styles.borderLeft());
        this.setBorderTop(styles.borderTop());
        this.setBorderRight(styles.borderRight());
        this.setBorderBottom(styles.borderBottom());
        this.setPaddingLeft(styles.paddingLeft());
        this.setPaddingTop(styles.paddingTop());
        this.setPaddingRight(styles.paddingRight());
        this.setPaddingBottom(styles.paddingBottom());
        this.setLine(styles.line());
        this.setFigureBackground(styles.figureBackground());
        this.setFigureInactiveBackground(styles.figureInactiveBackground());
        this.setFigureBorder(styles.figureBorder());
        this.setFigureSize(styles.figureSize());
        this.setFigureName(styles.figureName());
        this.setFigureState(styles.figureState());
        this.setTextAlignment(styles.textAlignment());
        this.setLineAlignment(styles.lineAlignment());
        this.setTextWrap(styles.textWrap());
	},
	_doUpdateContent: function (model) {
	}, 
	_doLayoutHandles: function () {
	},
	_drawBorders: function (g, r) {
		var wLeft = this._borderLeft ? this._borderLeft.width() : 0;
		var wTop = this._borderTop ? this._borderTop.width() : 0;
		var wRight = this._borderRight ? this._borderRight.width() : 0;
		var wBottom = this._borderBottom ? this._borderBottom.width() : 0;
		if (wLeft) {
			wLeft = _floor(wLeft / 2);
			g.drawVertLineI(this._borderLeft, r.y, r.bottom(), r.x + wLeft);
		}
		if (wTop) {
			wTop = _floor(wTop / 2);
			g.drawHorzLineI(this._borderTop, r.x, r.right(), r.y + wTop);
		}
		if (wRight) {
			wRight = _floor((wRight + 1) / 2);
			g.drawVertLineI(this._borderRight, r.y, r.bottom(), r.right() - wRight);
		}
		if (wBottom) {
			wBottom = _floor((wBottom + 1) / 2);
			g.drawHorzLineI(this._borderBottom, r.x, r.right(), r.bottom() - wBottom);
		}
	},
	_drawHtmlBorders: function () {
		this._css.borderLeft = this._borderLeft ? this._borderLeft.css() : "";
		this._css.borderTop = this._borderTop ? this._borderTop.css() : "";
		this._css.borderRight = this._borderRight ? this._borderRight.css() : "";
		this._css.borderBottom = this._borderBottom ? this._borderBottom.css() : "";
	},
	_drawBordersWithBlank: function (g, r, blankState) {
		var wLeft = this._borderLeft ? this._borderLeft.width() : 0;
		var wTop = (this._borderTop && (blankState == BlankState.NONE || blankState == BlankState.HEAD)) ? this._borderTop.width() : 0;
		var wRight = this._borderRight ? this._borderRight.width() : 0;
		var wBottom = (this._borderBottom && (blankState == BlankState.NONE || blankState == BlankState.TAIL)) ? this._borderBottom.width() : 0;
		if (wLeft) {
			wLeft = _floor(wLeft / 2);
			g.drawVertLineI(this._borderLeft, r.y, r.bottom(), r.x + wLeft);
		}
		if (wTop) {
			wTop = _floor(wTop / 2);
			g.drawHorzLineI(this._borderTop, r.x, r.right(), r.y + wTop);
		}
		if (wRight) {
			wRight = _floor((wRight + 1) / 2);
			g.drawVertLineI(this._borderRight, r.y, r.bottom(), r.right() - wRight);
		}
		if (wBottom) {
			wBottom = _floor((wBottom + 1) / 2);
			g.drawHorzLineI(this._borderBottom, r.x, r.right(), r.bottom() - wBottom);
		}
	},
	_getRenderRect: function (source) {
		var r = this._renderRect;
		var wLeft = this._borderLeft ? _int((this._borderLeft.width() + 1) / 2) : 0;
		var wTop = this._borderTop ? _int((this._borderTop.width() + 1) / 2) : 0;
		if (source) {
			r.set(source.x + wLeft, source.y + wTop, 
				source.width - wLeft - (this._borderRight ? _int((this._borderRight.width() + 1) / 2) : 0), 
				source.height - wTop - (this._borderBottom ? _int((this._borderBottom.width() + 1) / 2) : 0));
		} else {
			r.set(wLeft, wTop, 
				this.width() - wLeft - (this._borderRight ? _int((this._borderRight.width() + 1) / 2) : 0), 
				this.height() - wTop - (this._borderBottom ? _int((this._borderBottom.width() + 1) / 2) : 0));
		}
		return r;
	}
});
var /* @abstract */ GroupCellElement = defineClass("GroupCellElement", CellElement, {
	init: function(dom, name) {
		this._super(dom, name);
		this._cells = {};
		this._fill = new SolidBrush(0xfff0f0f0);
	},
	destroy: function() {
		this._destroying = true;
		for (var cell in this._cells) {
			this._cells[cell] = null;
		}
		this._cells = null;
		this._fill = null;
		this._super();
	},
	focused: false,
	group: function() {
		return _cast(this._index.column(), ColumnGroup);
	},
	findCell: function (column) {
		var i;
		var view;
		var cnt = this.childCount();
		for (i = 0; i < cnt; i++) {
			view = this.getChild(i);
			if (view.isVisible()) {
				if (view.index().column() === column) {
					return view;
				}
				if (view instanceof GroupCellElement) {
					view = view.findCell(column);
					if (view) {
						return view;
					}
				}
			}
		}
		return null;
	},
	getCellBounds: function (cellView, bounds) {
		if (!bounds) {
			bounds = cellView.bounds();
		} else {
			bounds.copy(cellView.bounds());
		}
		var column = this.index().column();
		var group = cellView.index().column().group();
		var view = cellView;
		while (group && group != column) {
			view = view.parent(); 
			bounds.x += view.x();
			bounds.y += view.y();
			group = group.group();
		}
		return bounds;
	},
	$_getChild: function (p, x, y, recursive) {
		var i;
		var cell;
		var child;
		var cnt = p.childCount();
		for (i = 0; i < cnt; i++) {
			cell = p.getChild(i);
			if (recursive && cell instanceof GroupCellElement) {
				child = this.$_getChild(cell, x - cell.x(), y - cell.y(), recursive);
				if (child) {
					return child;
				}
			}
			if (cell.containsInBounds(x, y)) {
				return cell;
			}
		}
		return null;
	},
	getCellAt: function (x, y, recursive) {
		return this.$_getChild(this, x, y, recursive);
	},
	_updateCell: function (model) {
		this._super(model);
		this._doUpdateGroup(model.index().column());
	},
	_doMeasure: function (grid, hintWidth, hintHeight) {
		return new Size(hintWidth, grid.header().minHeight());	
	},
	_doRender: function (g, r) {
		if (this.childCount() <= 0) {
			g.drawRect(this._fill, null, r);
			this._drawBorders(g, r);
		}
	},
	_doRenderHtml: function (r) {
		if (this.childCount() <= 0) {
			this._css.background = this._fill ? this._fill.css() : null;
			this._drawHtmlBorders();
		}
	},
	_doLayoutContent: function (lm) {
		this._prepareCells(lm);
		this._layoutCells(lm);
	},
	_doUpdateGroup: function (group) {
	},
	_getCell: function (column) {
		return this._cells[column.$_hash];
	},
	$_setCell: function (column, view) {
		this._cells[column.$_hash] = view;
	},
	_prepareCells: function (lm) {
	},
	_layoutCells: function (lm) {
	}
}, {
	getRootOf: function (cell) {
		var group = _cast(cell.parent(), GroupCellElement);
		if (!group) {
			return null;
		}
		while (group) {
			var p = _cast(group.parent(), GroupCellElement);
			if (!p) {
				return group;
			}
			group = p;
		}
		return null;
	}
});
var /* @abstract */ ValueCellElement = defineClass("ValueCellElement", CellElement, {
	init: function(dom, name) {
		this._super(dom, name);
		this._numberFormatter = null;
		this._datetimeWriter = null;
		this._booleanFormatter = null;
	},
	focused: false,
	text: null,
	prefix: null,
	suffix: null,
	numberFormat: null,
	datetimeFormat: null,
	booleanFormat: null,
	setFocused: function (value) {
		if (value != this._focused) {
			this._focused = value;
			this.invalidate();
		}
	},
	setNumberFormat: function (value) {
		if (value != this._numberFormat) {
			this._numberFormat = value;
			if (value) {
				this._numberFormatter = new DecimalFormatter(value);
			} else {
				this._numberFormatter = null;
			}
			this.invalidate();
		}
	},
	setDatetimeFormat: function (value) {
		if (value != this._datetimeFormat) {
			this._datetimeFormat = value;
			if (value) {
				this._datetimeWriter = new DateTimeWriter(value);
			} else {
				this._datetimeWriter = null;
			}
			this.invalidate();
		}
	},
	setBooleanFormat: function (value) {
		if (value != this._booleanFormat) {
			this._booleanFormat = value;
			if (value) {
				this._boolFormatter = new BooleanFormatter(value);
			} else {
				this._boolFormatter = null;
			}
			this.invalidate();
		}
	},
	numberFormatter: function () {
		return this._numberFormatter;
	},
	/*
	datetimeFormatter: function () {
		return this._datetimeFormatter;
	},
	*/
	booleanFormatter: function () {
		return this._boolFormatter;
	},
	datetimeWriter: function () {
		return this._datetimeWriter || DateTimeWriter.Default;
	},
	_doPrepareValue: function(model) {
		this._super(model);
		var styles = model.styles();
		this.setNumberFormat(styles.numberFormat());
		this.setDatetimeFormat(styles.datetimeFormat());
		this.setBooleanFormat(styles.booleanFormat());
		this.setPrefix(styles.prefix());
		this.setSuffix(styles.suffix());
	}
});
var SelectableCellElement = defineClass("SelectableCellElement", CellElement, {
	init: function (dom, name) {
		this._super(dom, name);
	},
	hoveredBackground: SolidBrush.WHITE,
	hoveredForeground: SolidBrush.BLACK,
	selectedBackground: SolidBrush.WHITE,
	selectedForeground: SolidBrush.BLACK,
	selected: false,
	_doPrepareElement: function (styles) {
		this._super(styles);
		this.setHoveredBackground(styles.hoveredBackground());
		this.setHoveredForeground(styles.hoveredForeground());
		this.setSelectedBackground(styles.selectedBackground());
		this.setSelectedForeground(styles.selectedForeground());
	}
});
var $$_HCE_RECT = new Rectangle();
var HeaderCellElement = defineClass("HeaderCellElement", SelectableCellElement, {
	init: function(grid, dom) {
		this._super(dom, "headerCellView");
		this._sortHandle = new HeaderSortHandle(grid, dom, this);
		this._sortHandle.setVisible(false);
		this.addElement(this._sortHandle);
		this._filterHandle = new HeaderFilterHandle(grid, dom, this);
		this._filterHandle.setVisible(false);
		this.addElement(this._filterHandle);
        this._checkHandle = new HeaderCheckHandle(grid, dom, this);
		this._checkHandle.setVisible(false);
		this.addElement(this._checkHandle);
        this._imageHandle = null;
        this._column = null;
        this._handleWidth = 0;
	},
    subFont: null,
    subForeground: null,
    subHoveredForeground: null,
    subSelectedForeground: null,
    subTextWrap: null,
    subTextAlignment: null,
    subLineAlignment: null,
	focused: false,
	text: null,
    subText: null,
    subTextGap: 1,
	showHandles: true,
    checkLocation: ColumnHeaderItemLocation.NONE,
    imageLocation: ColumnHeaderItemLocation.NONE,
    subLocation: SubTextLocation.LOWER,
	imageList: null,
	imageIndex: -1,
    imageUrl: null,
    itemOffset: 2,
    itemGap: 2,
	checked: false,
	showTooltip:true,
	tooltip:null,
    setSubFont: function (value) {
        var f = this._subFont;
        if (value == f) return;
        if (!value || !f || value.font != f.font || value.size != f.size || value.underline != f.underline) {
            this._subFont = value;
            this.invalidate();
        }
    },
    setSubTextAlignment: function (value) {
        if (value != this._subTextAlignment) {
            this._subTextAlignment = value;
            switch (value) {
                case Alignment.FAR:
                    this._subTextAlign = "right";
                    break;
                case Alignment.NEAR:
                    this._subTextAlign = "left";
                    break;
                default:
                    this._subTextAlign = "center";
                    break;
            }
            this.invalidate();
        }
    },
    setSubLineAlignment: function (value) {
        if (value != this._subLineAlignment) {
            this._subLineAlignment = value;
            switch (value) {
                case Alignment.FAR:
                    this._subLineAlign = "bottom";
                    break;
                case Alignment.NEAR:
                    this._subLineAlign = "top";
                    break;
                default:
                    this._subLineAlign = "middle";
                    break;
            }
            this.invalidate();
        }
    },
    column: function () {
        return this.index().C();
    },
    setFocused: function (value) {
        if (value != this._focused) {
            this._focused = value;
            this._doLayoutHandles();
            this.invalidate();
        }
    },
	isHovered: function () {
		return this._super() || this._filterHandle.isHovered() || this._checkHandle.isHovered();
	},
	setHovered: function (value) {
		this._super(value);
		//if (this._sortHandle.isVisible())
		//	this._sortHandle.setHovered(value);
	}, 
	isClickable: function () {
		return true;
	},
	_doPrepareValue: function (model) {
		this._super(model);
		this._column = this.index().column();
		if (!this._column) { if ($_debug) debugger; }
		this.setText(model.text());
		var substyles = model.subStyles();
		this.setSubFont(substyles.font());
		this.setSubForeground(substyles.foreground());
        this.setSubHoveredForeground(substyles.hoveredForeground());
        this.setSubSelectedForeground(substyles.selectedForeground());
        this.setSubTextAlignment(substyles.textAlignment());
        this.setSubLineAlignment(substyles.lineAlignment());
        this.setSubTextWrap(substyles.textWrap());
        this.setSubText(model.subText());
        this.setSubTextGap(model.subTextGap());
        this.setSubLocation(model.subLocation());
		this.setItemOffset(model.itemOffset());
		this.setItemGap(model.itemGap());
		this.setImageList(model.imageList());
		this.setImageIndex(model.imageIndex());
		this.setImageUrl(model.imageUrl());
		this.setCheckLocation(model.checkLocation());
		this.setImageLocation(model.imageLocation());
		this.setChecked(model.isChecked());
		this.setShowTooltip(model.isShowTooltip());
		this.setTooltip(model.tooltip());
	},
	_doPrepareElement: function(styles) {
		this._super(styles);
	},
	_doLayoutHandles: function () {
		var grid = this.grid();
		var column = this._column;
		if (grid && column instanceof DataColumn) {
			var r = this._getRenderRect(null);
			var x = r.right() - 4;
			var y = r.x;
			var h = r.height;
			this._handleWidth = 0;
			if (this.$_canFilterHandleVisible(grid, column)) {
				this._filterHandle.setVisible(true);
				this._filterHandle.setMouseEnabled(true);
				this._filterHandle.setBounds(x - 12, y, 12, h);
				this._filterHandle.invalidate();
				x -= 12;
				this._handleWidth = 12;
			} else {
				this._filterHandle.setVisible(false);
			}
			var options = grid.sortingOptions();
			if (this.$_canSortHandleVisible(options, column)) {
				var width = 11 + (options._showSortOrder ? SORT_ORDER_WIDTH : 0);
				this._sortHandle.setSortOrder(column.sortOrder());
				this._sortHandle.setSortDir(column.sortDirection());
				this._sortHandle.setVisible(true);
				this._sortHandle.setBounds(x - width, y, width, h);
				this._sortHandle.invalidate();
				this._handleWidth += width;
			} else {
				this._sortHandle.setVisible(false);
			}
			this._handleWidth += this._handleWidth > 0 ? 4 : 0;
			this._checkHandle.setMouseEnabled(true);
		}
	},
    $_renderEdgedItems: function (g, tr) {
        var checkLoc = this._checkLocation;
        var imageLoc = this._imageLocation;
        var checkHandle = this._checkHandle;
        var imageHandle = this._imageHandle;
        var checked = 0;
        var sz = HEADER_CHECKBOX_SIZE;
        switch (checkLoc) {
            case ColumnHeaderItemLocation.LEFT_EDGE:
                checked = 1;
                break;
            case ColumnHeaderItemLocation.RIGHT_EDGE:
                checked = 2;
                break;
            case ColumnHeaderItemLocation.TOP_EDGE:
                checked = 3;
                break;
            case ColumnHeaderItemLocation.BOTTOM_EDGE:
                checked = 4;
                break;
        }
        if (checked) {
            switch (checked) {
                case 1: // left
                    tr.leftBy(this._itemOffset);
                    checkHandle.setBounds(tr.x, tr.y + (tr.height - sz) / 2, sz, sz);
                    tr.leftBy(sz);
                    break;
                case 2: // right
                    tr.rightBy(-this._itemOffset);
                    checkHandle.setBoundsI(tr.right() - sz, tr.y + (tr.height - sz) / 2, sz, sz);
                    tr.rightBy(-sz);
                    break;
                case 3: // top
                    tr.topBy(this._itemOffset);
                    checkHandle.setBoundsI(tr.x + (tr.width - sz) / 2, tr.y, sz, sz);
                    tr.topBy(sz);
                    break;
                case 4: // bottom
                    tr.bottomBy(-this._itemOffset);
                    checkHandle.setBoundsI(tr.x + (tr.width - sz) / 2, tr.bottom() - sz, sz, sz);
                    tr.bottomBy(-sz);
                    break;
            }
            checkHandle.setChecked(this._checked);
            checkHandle.setVisible(true);
        }
        var img, w, h;
        if (imageLoc != ColumnHeaderItemLocation.NONE) {
            if (!imageHandle) {
                imageHandle = this._imageHandle = new HeaderImageHandle(this.$_dom, this);
                this.addElement(imageHandle);
            }
            img = this._imageUrl && this.grid().getImage(this._imageUrl);
            if (img && (w = img.width) > 0 && (h = img.height) > 0) {
                var imaged = false;
                switch (imageLoc) {
                    case ColumnHeaderItemLocation.LEFT_EDGE:
                        if (checked == 1) {
                            tr.leftBy(this._itemGap);
                        } else {
                            tr.leftBy(this._itemOffset);
                        }
                        imageHandle.setBoundsI(tr.x, tr.y + (tr.height - h) / 2, w, h);
                        tr.leftBy(w);
                        imaged = true;
                        break;
                    case ColumnHeaderItemLocation.RIGHT_EDGE:
                        if (checkLoc == 2) {
                            tr.rightBy(-this._itemGap);
                        } else {
                            tr.rightBy(-this._itemOffset);
                        }
                        imageHandle.setBoundsI(tr.right() - w, tr.y + (tr.height - h) / 2, w, h);
                        tr.rightBy(-w);
                        imaged = true;
                        break;
                    case ColumnHeaderItemLocation.TOP_EDGE:
                        if (checkLoc == 3) {
                            tr.topBy(this._itemGap);
                        } else {
                            tr.topBy(this._itemOffset);
                        }
                        imageHandle.setBoundsI(tr.x + (tr.width - w) / 2, tr.y, w, h);
                        tr.topBy(h);
                        imaged = true;
                        break;
                    case ColumnHeaderItemLocation.BOTTOM_EDGE:
                        if (checkLoc == 4) {
                            tr.bottomBy(-this._itemGap);
                        } else {
                            tr.bottomBy(-this._itemOffset);
                        }
                        imageHandle.setBoundsI(tr.x + (tr.width - w) / 2, tr.bottom() - h, w, h);
                        tr.bottomBy(-h);
                        imaged = true;
                        break;
                }
                imageHandle.setImage(img);
                imageHandle.setVisible(imaged);
            } else {
                img = null;
            }
        }
        return img;
    },
    $_renderCenteredItems: function (g, tr, img) {
        var checkLoc = this._checkLocation;
        var imageLoc = this._imageLocation;
        var checkHandle = this._checkHandle;
        var imageHandle = this._imageHandle;
        var sz = HEADER_CHECKBOX_SIZE;
        var x, y, w, h, r;
        if (img) {
            w = img.width;
            h = img.height;
        } else {
            imageLoc = ColumnHeaderItemLocation.NONE
        }
        if (checkLoc == ColumnHeaderItemLocation.CENTER) {
            if (imageLoc == ColumnHeaderItemLocation.NONE || imageHandle.isVisible()) {
                tr.x += (tr.width - sz) / 2;
                tr.y += (tr.height - sz) / 2;
            } else {
                if (!imageHandle) {
                    imageHandle = this._imageHandle = new HeaderImageHandle(this.$_dom, this);
                    this.addElement(imageHandle);
                }
                r = tr.clone();
                switch (imageLoc) {
                    case ColumnHeaderItemLocation.RIGHT:
                    case ColumnHeaderItemLocation.CENTER:
                        tr.x += (tr.width - sz - w - this._itemGap) / 2;
                        tr.y += (tr.height - sz) / 2;
                        x = tr.x + sz + this._itemGap;
                        y = r.y + (r.height - h) / 2;
                        break;
                    case ColumnHeaderItemLocation.LEFT:
                        tr.x += (tr.width - sz - w - this._itemGap) / 2 + w + this._itemGap;
                        tr.y += (tr.height - sz) / 2;
                        x = tr.x - this._itemGap - w;
                        y = r.y + (r.height - h) / 2;
                        break;
                    case ColumnHeaderItemLocation.TOP:
                        tr.x += (tr.width - sz) / 2;
                        tr.y += (tr.height - sz - h - this._itemGap) / 2 + h + this._itemGap;
                        x = r.x + (r.width - w) / 2;
                        y = tr.y - this._itemGap - h;
                        break;
                    case ColumnHeaderItemLocation.BOTTOM:
                        tr.x += (tr.width - sz) / 2;
                        tr.y += (tr.height - sz - h - this._itemGap) / 2;
                        x = r.x + (r.width - w) / 2;
                        y = tr.y + sz + this._itemGap;
                        break;
                }
                imageHandle.setBoundsI(x, y, w, h);
                imageHandle.setVisible(true);
            }
            checkHandle.setChecked(this._checked);
            checkHandle.setVisible(true);
            checkHandle.setBoundsI(tr.x, tr.y, sz, sz);
            return true;
        } else if (imageLoc == ColumnHeaderItemLocation.CENTER) {
            if (checkLoc == ColumnHeaderItemLocation.NONE || (checkHandle && checkHandle.isVisible())) {
                tr.x += (tr.width - w) / 2;
                tr.y += (tr.height - h) / 2;
            } else {
                r = tr.clone();
                switch (checkLoc) {
                    case ColumnHeaderItemLocation.LEFT:
                    case ColumnHeaderItemLocation.CENTER:
                        tr.x += (tr.width - w - sz - this._itemGap) / 2 + w + this._itemGap;
                        tr.y += (tr.height - h) / 2;
                        x = tr.x - this._itemGap - sz;
                        y = r.y + (r.height - sz) / 2;
                        break;
                    case ColumnHeaderItemLocation.RIGHT:
                        tr.x += (tr.width - w - sz - this._itemGap) / 2;
                        tr.y += (tr.height - h) / 2;
                        x = tr.x + w + this._itemGap;
                        y = r.y + (r.height - sz) / 2;
                        break;
                    case ColumnHeaderItemLocation.TOP:
                        tr.x += (tr.width - w) / 2;
                        tr.y += (tr.height - h - sz - this._itemGap) / 2 + sz + this._itemGap;
                        x = r.x + (r.width - sz) / 2;
                        y = tr.y - this._itemGap - sz;
                        break;
                    case ColumnHeaderItemLocation.BOTTOM:
                        tr.x += (tr.width - w) / 2;
                        tr.y += (tr.height - h - sz - this._itemGap) / 2;
                        x = r.x + (r.width - sz) / 2;
                        y = tr.y + sz + this._itemGap;
                        break;
                    case ColumnHeaderItemLocation.NONE:
                    default:
                        tr.x += (tr.width - w) / 2;
                        tr.y += (tr.height - h) / 2;
                        break;
                }
                checkHandle.setChecked(this._checked);
                checkHandle.setVisible(true);
                checkHandle.setBoundsI(x, y, sz, sz);
            }
            imageHandle.setBoundsI(tr.x, tr.y, w, h);
            imageHandle.setVisible(true);
            return true;
        }
        return false;
    },
    $_calcTextRect: function (g, r, info) {
        switch (info.wrap) {
            case TextWrapMode.EXPLICIT:
                return g.getExplicitTextRect(info.font, info.text, r.x, r.y, r.width, r.height, info.align, info.valign);
            case TextWrapMode.NORMAL:
                return g.getWrapTextRect(info.font, info.text, r.x, r.y, r.width, r.height, info.align, info.valign);
            default:
                return g.getTextRect(info.font, info.text, r.x, r.y, r.width, r.height, info.align, info.valign);
        }
    },
    $_renderText: function (g, r, info) {
        switch (info.wrap) {
            case TextWrapMode.EXPLICIT:
                g.drawTextBoundsExplicit(info.font, info.fill, info.text, r.x, r.y, r.width, r.height, info.align, info.valign);
                break;
            case TextWrapMode.NORMAL:
                g.drawTextBoundsWrap(info.font, info.fill, info.text, r.x, r.y, r.width, r.height, info.align, info.valign);
                break;
            default:
                g.drawTextBounds(info.font, info.fill, info.text, r.x, r.y, r.width, r.height, info.align, info.valign);
                break;
        }
    },
    $_renderTexts: function (g, r, img, hovered, selected) {
        var checkHandle = this._checkHandle;
        var imageHandle = this._imageHandle;
        var checkLoc = (!checkHandle || !checkHandle.isVisible()) ? this._checkLocation : ColumnHeaderItemLocation.NONE;
        var imageLoc = (img && !imageHandle.isVisible()) ? this._imageLocation : ColumnHeaderItemLocation.NONE;
        var text = this._text;
        var stext = this._subText;
        var textInfo, subInfo, fill;
        if (text) {
            hovered && (fill = this._hoveredForeground);
            (!fill && selected) && (fill = this._selectedForeground);
            !fill && (fill = this._foreground);
            textInfo = {
                text: text,
                font: this._font,
                fill: fill,
                wrap: this._textWrap,
                align: this._textAlign,
                valign: this._lineAlign
            };
        }
        if (stext) {
            fill = null;
            hovered && (fill = this._subHoveredForeground);
            (!fill && selected) && (fill = this._subSelectedForeground);
            !fill && (fill = this._subForeground);
            subInfo = {
                text: stext,
                font: this._subFont,
                fill: fill,
                wrap: this._subTextWrap,
                align: this._textAlign, // this._subTextAlign,
                valign: this._lineAlign // this._subLineAlign
            };
        }
        var itemGap = this._itemGap;
        var gap = this._subTextGap;
        var wimg = img ? img.width : 0;
        var himg = img ? img.height : 0;
        var sz = HEADER_CHECKBOX_SIZE;
		var cleft = 0;
		var cright = 0;
		var ctop = 0;
		var cbottom = 0;
		var ileft = 0;
		var iright = 0;
		var itop = 0;
		var ibottom = 0;
		switch (checkLoc) {
			case ColumnHeaderItemLocation.LEFT:
				cleft = sz + itemGap;
				break;
			case ColumnHeaderItemLocation.RIGHT:
				cright = sz + itemGap;
				break;
			case ColumnHeaderItemLocation.TOP:
				ctop = sz + itemGap;
				break;
			case ColumnHeaderItemLocation.BOTTOM:
				cbottom = sz + itemGap;
				break;
		}
		switch (imageLoc) {
			case ColumnHeaderItemLocation.LEFT:
				ileft = img.width + itemGap;
				break;
			case ColumnHeaderItemLocation.RIGHT:
				iright = img.width + itemGap;
				break;
			case ColumnHeaderItemLocation.TOP:
				itop = img.height + itemGap;
				break;
			case ColumnHeaderItemLocation.BOTTOM:
				ibottom = img.height + itemGap;
				break;
		}
		var tr, sr, x, y, r2, w, h;
        var cx, cy, ix, iy;
        if (text || stext) {
            r.leftBy(cleft + ileft);
            r.rightBy(-cright - iright);
            r.topBy(ctop + itop);
            r.bottomBy(-cbottom - ibottom);
            tr = text && this.$_calcTextRect(g, r, textInfo);
            if (tr && tr.width > r.width && textInfo.align == "center" && textInfo.wrap == "none") {
            	textInfo.align = "near";
            	tr = this.$_calcTextRect(g, r, textInfo);
            }
            sr = stext && this.$_calcTextRect(g, r, subInfo);
            if (sr && sr.width > r.width && subInfo.align == "center" && subInfo.wrap == "none") {
            	subInfo.align = "near";
            	sr = this.$_calcTextRect(g, r, subInfo);
            }
        }
        if (text && stext) {
			switch (this._subLocation) {
				case SubTextLocation.LOWER:
					if ((y = tr.height + gap + sr.height) <= r.height) {
                        switch (textInfo.valign) {
                            case "middle":
                                y = r.y + (r.height - y) / 2;
                                break;
                            case "bottom":
                                y = r.bottom() - sr.height - gap - tr.height;
                                break;
                            default:
                                y = r.y;
                                break;
                        }
						tr.y = y;
						this.$_renderText(g, tr, textInfo);
						sr.y = tr.bottom() + gap;
						this.$_renderText(g, sr, subInfo);
                        r2 = tr;
                        h = tr.height + sr.height;
                        x = Math.min(tr.x, sr.x);
                        w = Math.max(tr.right(), sr.right()) - x;
					} else if (tr.height <= r.height) {
						tr.y = r.y;
						this.$_renderText(g, tr, textInfo);
						sr.y = tr.bottom() + gap;
						this.$_renderText(g, sr, subInfo);
                        r2 = r;
                        h = r.height;
                        x = Math.min(tr.x, sr.x);
                        w = Math.max(tr.right(), sr.right()) - x;
                    } else {
						this.$_renderText(g, r, textInfo);
                        sr = null;
                        r2 = r;
                        h = r.height;
                        x = tr.x;
                        w = tr.width;
					}
                    (cleft || cright) && (cy = r2.y + (h - sz) / 2);
                    (ileft || iright) && (iy = r2.y + (h - himg) / 2);
                    (ctop || cbottom) && (cx = x + (w - sz) / 2);
                    (itop || ibottom) && (ix = x + (w - wimg) / 2);
					break;
				case SubTextLocation.UPPER:
					if ((y = tr.height + gap + sr.height) <= r.height) {
                        switch (textInfo.valign) {
                            case "middle":
                                y = r.y + (r.height - y) / 2;
                                break;
                            case "bottom":
                                y = r.bottom() - sr.height - gap - tr.height;
                                break;
                            default:
                                y = r.y;
                                break;
                        }
						sr.y = y;
						this.$_renderText(g, sr, subInfo);
						tr.y = sr.bottom() + gap;
						this.$_renderText(g, tr, textInfo);
                        r2 = sr;
                        h = tr.height + sr.height;
                        x = Math.min(tr.x, sr.x);
                        w = Math.max(tr.right(), sr.right()) - x;
                    } else if (tr.height <= r.height) {
						tr.y = r.bottom() - tr.height;
						this.$_renderText(g, tr, textInfo);
						sr.y = tr.y - gap - sr.height;
						this.$_renderText(g, sr, subInfo);
                        r2 = r;
                        h = r.height;
                        x = Math.min(tr.x, sr.x);
                        w = Math.max(tr.right(), sr.right()) - x;
					} else {
						this.$_renderText(g, tr, textInfo);
                        sr = null;
                        r2 = r;
                        h = r.height;
                        x = tr.x;
                        w = tr.width;
					}
                    (cleft || cright) && (cy = r2.y + (h - sz) / 2);
                    (ileft || iright) && (iy = r2.y + (h - himg) / 2);
                    (ctop || cbottom) && (cx = x + (w - sz) / 2);
                    (itop || ibottom) && (ix = x + (w - wimg) / 2);
					break;
				case SubTextLocation.RIGHT:
					if ((x = tr.width + gap + sr.width) <= r.width) {
						switch (textInfo.align) {
							case "center":
								x = r.x + (r.width - x) / 2;
								break;
							case "right":
								x = r.right() - sr.width - gap - tr.width;
								break;
							default:
								x = r.x;
						}
						tr.x = x;
						this.$_renderText(g, tr, textInfo);
						sr.x = tr.right() + gap;
						this.$_renderText(g, sr, subInfo);
                        r2 =  tr;
                        w = tr.width + sr.width;
						y = Math.min(tr.y, sr.y);
						h = Math.max(tr.bottom(), sr.bottom()) - y;
                    } else if (tr.width <= r.width) {
						tr.x = r.x;
						this.$_renderText(g, tr, textInfo);
						sr.x = tr.right() + gap;
						this.$_renderText(g, sr, subInfo);
                        r2 = r;
						w = r.width;
                        y = Math.min(tr.y, sr.y);
                        h = Math.max(tr.bottom(), sr.bottom()) - y;
					} else {
						this.$_renderText(g, r, textInfo);
                        r2 = r;
						w = r.width;
                        y = tr.y;
                        h = tr.height;
                        sr = null;
					}
                    (cleft || cright) && (cy = y + (h - sz) / 2);
                    (ileft || iright) && (iy = y + (h - himg) / 2);
					(ctop || cbottom) && (cx = r2.x + (w - sz) / 2);
					(itop || ibottom) && (ix = r2.x + (w - wimg) / 2);
					break;
				case SubTextLocation.LEFT:
					if ((x = tr.width + gap + sr.width) <= r.width) {
						switch (textInfo.align) {
							case "center":
								x = r.x + (r.width - x) / 2;
								break;
							case "right":
								x = r.right() - sr.width - gap - tr.width;
								break;
							default:
								x = r.x;
						}
						sr.x = x;
						this.$_renderText(g, sr, subInfo);
						tr.x = sr.right() + gap;
						this.$_renderText(g, tr, textInfo);
                        r2 =  r;
						y = Math.min(tr.y, sr.y);
						h = Math.max(tr.bottom(), sr.bottom()) - y;
						w = tr.width + sr.width;
                    } else if (tr.width <= r.width) {
						tr.x = r.right() - tr.width;
						this.$_renderText(g, tr, textInfo);
						sr.x = tr.x - gap - sr.width;
						this.$_renderText(g, sr, subInfo);
                        r2 =  r;
						w = r.width;
                        y = Math.min(tr.y, sr.y);
                        h = Math.max(tr.bottom(), sr.bottom()) - y;
					} else {
						this.$_renderText(g, tr, textInfo);
                        r2 = r;
						w = r.width;
                        y = tr.y;
                        h = tr.height;
                        sr = null;
					}
					(cleft || cright) && (cy = y + (h - sz) / 2);
					(ileft || iright) && (iy = y + (h - himg) / 2);
					(ctop || cbottom) && (cx = r2.x + (w - sz) / 2);
					(itop || ibottom) && (ix = r2.x + (w - wimg) / 2);
					break;
				default:
					this.$_renderText(g, r, textInfo);
					break;
			}
		} else if (text || stext) {
            if (text) {
                this.$_renderText(g, r, textInfo);
                r = tr;
            } else {
                this.$_renderText(g, r, subInfo);
                r = sr;
            }
            (cleft || cright) && (cy = r.y + (r.height - sz) / 2);
            (ileft || iright) && (iy = r.y + (r.height - himg) / 2);
            (ctop || cbottom) && (cx = r.x + (r.width - sz) / 2);
            (itop || ibottom) && (ix = r.x + (r.width - wimg) / 2);
		}
        if (cleft || ileft) {
            x = tr && sr ? Math.min(tr.x, sr.x) : tr ? tr.x : sr ? sr.x : r.x;
            if (cleft && ileft) {
                ix = x - itemGap - wimg;
                cx = ix - itemGap - sz;
            } else if (cleft) {
                cx = x - itemGap - sz;
            } else if (ileft) {
                ix = x - itemGap - wimg;
            }
        }
        if (cright + iright) {
            x = tr && sr ? Math.max(tr.right(), sr.right()) : tr ? tr.right() : sr ? sr.right() : r.right();
            if (cright && iright) {
                cx = x + itemGap;
                ix = cx + sz + itemGap;
            } else if (cright) {
                cx = x + itemGap;
            } else if (iright) {
                ix = x + itemGap;
            }
        }
        if (ctop || itop) {
            y = tr && sr ? Math.min(tr.y, sr.y) : tr ? tr.y : sr ? sr.y : r.y;
            if (ctop && itop) {
                iy = y - itemGap - himg;
                cy = iy - itemGap - sz;
            } else if (ctop) {
                cy = y - itemGap - sz;
            } else if (itop) {
                iy = y - itemGap - himg;
            }
        }
        if (cbottom || ibottom) {
            y = tr && sr ? Math.max(tr.bottom(), sr.bottom()) : tr ? tr.bottom() : sr ? sr.bottom() : r.bottom();
            if (cbottom && ibottom) {
                cy = y + itemGap;
                iy = cy + sz + itemGap;
            } else if (cbottom) {
                cy = y + itemGap;
            } else if (ibottom) {
                iy = y + itemGap;
            }
        }
        if (cleft + cright + ctop + cbottom > 0) {
            checkHandle.setChecked(this._checked);
            checkHandle.setVisible(true);
            checkHandle.setBoundsI(cx, cy, sz, sz);
        }
        if (ileft + iright + itop + ibottom > 0) {
            imageHandle.setImage(img);
            imageHandle.setVisible(true);
            imageHandle.setBoundsI(ix, iy, wimg, himg);
        }
    },
    _doRender: function (g, r) {
		var fill = null;
		var textFill = null;
		var itemCount = this.grid().itemCount();
		var hovered = this.isHovered();
        var selected;
		if (hovered) {
			fill = this.hoveredBackground();
		} 
		if (!fill && (selected = itemCount > 0 && (this.isFocused() || this.isSelected()))) {
			fill = this.selectedBackground();
		}
		if (!fill) {
			fill = this.background();
		}
		if (fill) {
			g.drawRect(fill, null, r);
		}
		var s = this.text();
		var s2 = this.subText();
        var checkLoc = this._checkLocation;
        var imageLoc = this._imageLocation;
		var checkHandle = this._checkHandle;
		var imageHandle = this._imageHandle;
		checkHandle && checkHandle.setVisible(false);
		imageHandle && imageHandle.setVisible(false);
		r.width -= this._handleWidth;
		this.deflatePadding2(r);
		if (r.width > 0) {
			var tr = r.clone();
            var img = this.$_renderEdgedItems(g, tr);
            if (!this.$_renderCenteredItems(g, tr, img)) {
                this.$_renderTexts(g, tr, img, hovered, selected);
            }
		}
		this.inflatePadding2(r);
		r.width += this._handleWidth;
		this._drawBorders(g, r);
		return;
        if (s || s2) {
            this.inflatePadding(r);
            switch (this._textWrap) {
                case TextWrapMode.EXPLICIT:
                    s = s.split(g.LINES_REG);
                    tr = g.getExplicitTextRect(this._font, s, r.x, r.y, r.width, r.height, this._textAlign, this._lineAlign, $$_HCE_RECT);
                    break;
                case TextWrapMode.NORMAL:
                    s = s.split(g.LINES_REG);
                    tr = g.getWrapTextRect(this._font, s, r.x, r.y, r.width, r.height, this._textAlign, this._lineAlign, $$_HCE_RECT);
                    break;
                default:
                    tr = g.getTextRect(this._font, s, r.x, r.y, r.width, r.height, this._textAlign, $$_HCE_RECT);
                    break;
            }
            this.deflatePadding(r);
        }
		if (s) {
			if (hovered) {
				textFill = this.hoveredForeground();
			}
			if (!textFill) {
				if (selected === undefined) {
					selected = itemCount > 0 && (this.isFocused() || this.isSelected());
				}
				if (selected) {
					textFill = this.selectedForeground();
				}
			}
			if (!textFill) {
				textFill = this.foreground();
			}
            r.width -= this._handleWidth;
            if (r.width > 0) {
                this.inflatePadding(r);
                if (checkLoc == ColumnHeaderItemLocation.NONE && imageLoc == ColumnHeaderItemLocation.NONE) {
                    switch (this._textWrap) {
                        case TextWrapMode.EXPLICIT:
                            g.drawTextBoundsExplicit(this._font, textFill, s, r.x, r.y, r.width, r.height, this._textAlign, this._lineAlign);
                            break;
                        case TextWrapMode.NORMAL:
                            g.drawTextBoundsWrap(this._font, textFill, s, r.x, r.y, r.width, r.height, this._textAlign, this._lineAlign);
                            break;
                        default:
                            g.drawTextBounds(this._font, textFill, s, r.x, r.y, r.width, r.height, this._textAlign);
                            break;
                    }
                    g.drawRect(null, SolidPen.RED, tr);
                } else {
                    var tr = r.clone();
                    /*var checkLayouted = */this.$_layoutCheckBox(checkLoc, imageLoc, tr, s, this._font);
                    /*var imageLayouted = */this.$_layoutImage(imageLoc, checkLoc, tr);
                    if (checkLoc != ColumnHeaderItemLocation.CENTER && imageLoc != ColumnHeaderItemLocation.CENTER) {
                        switch (this._textWrap) {
                            case TextWrapMode.EXPLICIT:
                                g.drawTextBoundsExplicit(this._font, textFill, s, tr.x, tr.y, tr.width, tr.height, this._textAlign, this._lineAlign);
                                break;
                            case TextWrapMode.NORMAL:
                                g.drawTextBoundsWrap(this._font, textFill, s, tr.x, tr.y, tr.width, tr.height, this._textAlign, this._lineAlign);
                                break;
                            default:
                                g.drawTextBounds(this._font, textFill, s, tr.x, tr.y, tr.width, tr.height, this._textAlign);
                                break;
                        }
                    }
                }
                this.deflatePadding(r);
            }
            r.width += this._handleWidth;
		} else {
        }
		this._drawBorders(g, r);
	},
	_doRenderHtml: function (r) {
		var selected;
		var fill = null;
		var itemCount = this.grid().itemCount();
		var hovered = this.isHovered();
		if (hovered) {
			fill = this.hoveredBackground();
		}
		if (!fill && (selected = itemCount > 0 && (this.isFocused() || this.isSelected()))) {
			fill = this.selectedBackground();
		}
		if (!fill) {
			fill = this.background();
		}
		this._css.clip = Dom.getClipRect(r);
		_ieOld ? this.$_setCssFill(fill) : (this._css.background = fill ? fill.css() : null);
		var s = this.text();
		if (s) {
			var textFill = null;
			if (hovered) {
				textFill = this.hoveredForeground();
			}
			if (!textFill) {
				if (selected === undefined) {
					selected = itemCount > 0 && (this.isFocused() || this.isSelected());
				}
				if (selected) {
					textFill = this.selectedForeground();
				}
			}
			if (!textFill) {
				textFill = this.foreground();
			}
			/*
			 this.inflatePadding(r);
			 switch (this._textWrap) {
			 case TextWrapMode.EXPLICIT:
			 g.drawTextBoundsExplicit(this._font, textFill, s, r.x, r.y, r.width, r.height, this._textAlign, this._lineAlign);
			 break;
			 case TextWrapMode.NORMAL:
			 g.drawTextBoundsWrap(this._font, textFill, s, r.x, r.y, r.width, r.height, this._textAlign, this._lineAlign);
			 break;
			 default:
			 g.drawTextBounds(this._font, textFill, s, r.x, r.y, r.width, r.height, this._textAlign);
			 break;
			 }
			 this.deflatePadding(r);
			 */
			this.inflatePadding(r);
			var span = this.$_prepareSpan();
			Dom.renderTextBounds(span, this.font(), textFill, s, r.x, r.y, r.width, r.height, this.textAlign());
			this.deflatePadding(r);
		}
		this._drawHtmlBorders();
	},
	$_canFilterHandleVisible: function (grid, column) {
		var visible = this.isShowHandles() && column && column.hasFilters();
		if (visible) {
			switch (grid.filteringOptions().handleVisibility()) {
				case HandleVisibility.HIDDEN:
					visible = false;
					break;
				case HandleVisibility.HOVERED:
					visible = this.isHovered() || grid.isFilterSelecting(column);
					break;
			}
		}
		return visible;
	},
	$_canSortHandleVisible: function (options, column) {
		var visible = this.isShowHandles() && column;
		if (visible) {
			switch (options.handleVisibility()) {
				case HandleVisibility.VISIBLE:
					visible = column.sortOrder() >= 0;
					break;
				case HandleVisibility.HOVERED:
					visible = this.isHovered() && column.sortOrder() >= 0;
					break;
				case HandleVisibility.HIDDEN:
					visible = false;
					break;
			}
		}
		return visible;
	},
	$_canCheckHandleVisible: function (options, column) {
		var visible = this.isShowHandles() && column;
		if (visible) {
			switch (options.handleVisibility()) {
				case HandleVisibility.VISIBLE:
					visible = column.sortOrder() >= 0;
					break;
				case HandleVisibility.HOVERED:
					visible = this.isHovered();
					break;
				case HandleVisibility.HIDDEN:
					visible = false;
					break;
			}
		}
		return visible;
	}
});
var HeaderGroupCellElement = defineClass("HeaderGroupCellElement", GroupCellElement, {
	init: function(dom) {
		this._super(dom, "headerGroupCellView");
	},
	focused: false,
	_prepareCells: function (lm) {
		var group = this.group();
		this.$_createCells(group);
		this._fillUnit = _int(this.height() / group.headerLevel());
		var notFixed = true;
		if (this._grid.header().heightFill() == HeaderHeightFill.FIXED) {
			var fill = {levels: 0, fixHeight: 0};
			this.$_calculateFillLevel(group, fill);
			this._fillLevels = fill.levels;
			if (!group.parent().header()._notHeightFixed && fill.fixHeight <= this.height() - this._fillLevels*3 && (fill.levels != 0 || fill.fixHeight == this.height())) {
				notFixed = false;
				if (fill.levels > 0) {
					this._fillUnit = _int((this.height() - fill.fixHeight) / fill.levels);
				}
			}
			this.$_prepareHeight(group, notFixed);
		}
		group.header()._notHeightFixed = notFixed;
	},
	_layoutCells: function (lm) {
		var view;
		var y;
		var h;
		var i;
		var column;
		var dy;
		var x;
		var w;
		var r = new Rectangle();
		var group = this.group();
		var width = this.width();
		var height = this.height();
		var cnt = group.visibleCount();
		var header = group.header();
		if (header.isVisible()) {
			view = this._getCell(group);
			if (view) {
				r.set(0, 0, width, height);
				r.height = header.fixedHeight() > 0 && !header._notHeightFixed ? header.fixedHeight() : this._fillUnit;
				view.setRect(r);	
			}
		}
		if (!group.isHideChildHeaders()) {
			y = r.bottom();
			if (group.isVertical()) {
				h = this._fillUnit;
				for (i = 0; i < cnt; i++) {
					column = group.getVisibleItem(i);
					var colHeader = column.header();
					view = this._getCell(column);
					if (view) {
						dy = 0;
						if (i == cnt - 1) {
							dy = height - y;
						} else if (view instanceof HeaderGroupCellElement) {
							dy = colHeader._fillHeight > 0 ? colHeader._fillHeight : h * view.group().headerLevel();
						} else {
							dy += colHeader.fixedHeight() > 0 && !header._notHeightFixed ? colHeader.fixedHeight() : h;
						}
						view.setBounds(0, y, width, dy);
						view.layoutContent(lm);
						y += dy;
						if (view instanceof HeaderGroupCellElement) {
							view._layoutCells(lm);
						}
					}
				}
			} else {
				x = 0;
				for (i = 0; i < cnt; i++) {
					column = group.getVisibleItem(i);
					view = this._getCell(column);		
					if (view) {
						if (i == cnt - 1) {
							w = width - x;
						} else {
							w = column.displayWidth();
						}
						view.setBounds(x, y, w, height - y);
						view.layoutContent(lm);
						x += w;
						if (view instanceof HeaderGroupCellElement) {
							view._layoutCells(lm);
						}
					}
				}
			}
		}
	},
	// header.fixedHeight 값이 있는 컬럼들의 최대 level, fixed 높이의 합을 계산  
	$_calculateFillLevel: function (group, fill) {
		var header = group.header();
		if (header.isVisible()) {
			if (header.fixedHeight() > 0) {
				fill.fixHeight += header.fixedHeight();
			} else {
				fill.levels++;	
			}
		}
		if (!group._hideChildHeaders) {
			var i,
			    f,
				col,
				cols = group.visibleCount(),
				cnt = 0,
				fixHeight = 0;
			if (cols > 0) {
				if (group.isHorizontal()) {
					for (i = 0; i < cols; i++) {
						col = group.getVisibleItem(i);
						if (col instanceof ColumnGroup) {
							var colfill = {levels:0, fixHeight:0};
							this.$_calculateFillLevel(col, colfill);
							if (colfill.levels > cnt) {
								cnt = colfill.levels;
								fixHeight = colfill.fixHeight;
							} 
						} else {
							f = col.header().fixedHeight();
							if (f > 0) {
								cnt = 0;
								fixHeight = Math.max(fixHeight, f);
							}
						}
					}
					if (fixHeight == 0) {
						cnt = 1;
					}
					fill.levels += cnt;
					fill.fixHeight += fixHeight
				} else {
					for (i = 0; i < cols; i++) {
						col = group.getVisibleItem(i);
						if (col instanceof ColumnGroup) {
							var colfill = {levels:0, fixHeight:0};
							this.$_calculateFillLevel(col, colfill);
							fill.levels += colfill.levels;
							fill.fixHeight += colfill.fixHeight;
						} else { 
							header = col.header();
							f = col.header().fixedHeight();
							if (f > 0) {
								fill.fixHeight += f;
							} else {
								fill.levels ++;
							}
						}
					}
				}
			}
		}
	},
	// 각각의 group._fillHeight를 설정
	$_prepareHeight: function (group, notFixed) {
		var header,
			i,
			col,
			cols = group.visibleCount(),
			height = 0;
		if (!group._hideChildHeaders) {
			if (cols > 0) {
				if (group.isHorizontal()) {
					var fixedMax = 0;
					for (i = 0; i < cols; i++) {
						col = group.getVisibleItem(i);
						if (col instanceof ColumnGroup) {
							height = Math.max(height, this.$_prepareHeight(col,notFixed));
						} else {
							var fixedHeight = col.header().fixedHeight();
							if ((fixedHeight > 0 && !notFixed) || fixedMax > 0) {
								fixedMax = Math.max(fixedMax, fixedHeight);
								height = Math.max(height, fixedMax);
							} else {
								height = Math.max(height, this._fillUnit);
							}
								
						}
					}
				} else {
					for (i = 0; i < cols; i++) {
						col = group.getVisibleItem(i);
						if (col instanceof ColumnGroup) {
							height += this.$_prepareHeight(col,notFixed);
						} else { 
							header = col.header();
							height += header.fixedHeight() > 0 && !notFixed ? header.fixedHeight() : this._fillUnit;
						}
					}
				}
			}
		}
		header = group.header();
		if (header.isVisible()) {
			height += header.fixedHeight() > 0 && !notFixed ? header.fixedHeight() : this._fillUnit;
		}
		return header._fillHeight = height;
	},
	$_createCells: function (group) {
		this.hideAll();
		var i;
		var cnt;
		var column;
		var view;
		var model;
		var cols;
		var grid = this.grid();
		var header = grid.header();
		var colheader = group.header();
		if (colheader.isVisible()) {
			view = this._getCell(group);
			if (!view) {
				this.$_setCell(group, view = new HeaderCellElement(grid, this._dom));
				this.addElement(view);
			}
			view.setVisible(true);
			model = header.getCell(CellIndex.temp(grid, -1, group));
			view.updateCell(model);
		}
		if (!group.isHideChildHeaders()) {
			for (i = 0, cols = group.visibleCount(); i < cols; i++) {
				column = group.getVisibleItem(i);
				view = this._getCell(column);
				if (!view) {
					if (column instanceof ColumnGroup) {
						view = new HeaderGroupCellElement(this._dom);
					} else { 
						view = new HeaderCellElement(grid, this._dom);
					}
					this.$_setCell(column, view);
					this.addElement(view);
				}
				view.setVisible(true);					
				model = header.getCell(CellIndex.temp(grid, -1, column));
				view.updateCell(model);
				if (view instanceof HeaderCellElement) {
				} else {
				}
				if (column instanceof ColumnGroup) {
					view.$_createCells(column);
				}
			}
		}
	}
});
var SummaryCellElement = defineClass("SummaryCellElement", ValueCellElement, {
	init: function(dom) {
		this._super(dom, "summaryCellView");
		this._value = NaN;
		this._error = null;
		this._errorDetail = null;
	},
	text: null,
	column: function () {
		return this.index().C();
	},
	value: function () {
		return this._value;
	},
	error: function () {
		return this._error;
	},
	errorDetail: function () {
		return this._errorDetail;
	},
	_doPrepareValue: function(model) {
		this._super(model);
		this._value = model.value();
		var fmt;
		var s = null;
		var f = null;

		if (this._value !== UNDEFINED) {
			if (model.index().column() instanceof DataColumn && model.index().column().valueType() == ValueType.DATETIME) {
				if (this._value instanceof Date && (fmt = this.datetimeWriter())) {
					s = fmt.getText(this._value)
				} else {
					s = model.displayText();
				}
			} else {
				var v = Number(this._value);
				if (!isNaN(v) && (fmt = this.numberFormatter())) {
					s = fmt.format(v);
				} else if (this._value) {
					s = this._value;
				} else {
					s = model.displayText();
				}
			}
		} else {
			s = model.displayText();
		}
		if (s != null) {
			if (f = this.prefix()) {
				s = f + s;
			}
			if (f = this.suffix()) {
				s = s + f;
			}
		}
		this.setText(s);
		this._error = model.error();
	},
	_doPrepareElement: function(styles) {
		this._super(styles);
	},
	_doLayoutHandles: function() {
	},
	_doRender: function(g, r) {
		var fill = this.background();
		if (fill) {
			g.drawRectI(fill, null, r);
		}
		var s = this.text();
		if (s) {
			this.inflatePadding(r);
			g.drawTextRect(this._font, this._foreground, s, r, this._textAlign);
			this.deflatePadding(r);
		}
		this._drawBorders(g, r);
	},
	_doRenderHtml: function(r) {
        this._css.clip = Dom.getClipRect(r);
        _ieOld ? this.$_setCssFill(fill) : (this._css.background = fill ? fill.css() : null);
		var s = this.text();
		if (s) {
			var textFill = this.foreground();
            this.inflatePadding(r);
            var span = this.$_prepareSpan();
            Dom.renderTextBounds(span, this.font(), textFill, s, r.x, r.y, r.width, r.height, this.textAlign());
            this.deflatePadding(r);
			/*
			this.inflatePadding(r);
			g.drawTextRect(this._font, this._foreground, s, r, this._textAlign);
			this.deflatePadding(r);
			*/
            /*
			this._css.font = this._font.font;
			this._css.color = textFill.css();
			this._css.textAlign = "center";
			this._css.lineHeight = (this._height - 2) + "px";
			this._span.style.verticalAlign = "middle";
			this._span.textContent = s;
			*/
		}
		this._drawHtmlBorders();
	},
	canHovering: function () {
		return false;
	}
});
var SummaryGroupCellElement = defineClass("SummaryGroupCellElement", GroupCellElement, {
	init: function(dom) {
		this._super(dom, "summaryGroupCellView");
	},
	_prepareCells: function(lm) {
		this.$_createCells(this.group());
	},
	_layoutCells: function(lm) {
		var i;
		var dy;
		var x;
		var y;
		var h;
		var w;
		var column;
		var view;
		var group = this.group();
		var r = new Rectangle();
		var width = this.width();
		var height = this.height();
		var cnt = group.visibleCount();
		if (group.isVertical()) {
			y = r.bottom();
			h = _int(height / group.dataLevel());
			for (i = 0; i < cnt; i++) {
				column = group.getVisibleItem(i);
				view = this._getCell(column);
				if (view) {
					dy = 0;
					if (i == cnt - 1) {
						dy = height - y;
					} else if (view instanceof SummaryGroupCellElement) {
						dy = h * view.group().dataLevel();
					} else {
						dy += h;
					}
					view.setBounds(0, y, width, dy);
					view.layoutContent(lm);
					y += dy;
					if (view instanceof SummaryGroupCellElement) {
						view._layoutCells(lm);
					}
				}
			}
		} else {
			x = 0;
			for (i = 0; i < cnt; i++) {
				column = group.getVisibleItem(i);
				view = this._getCell(column);
				if (view) {
					if (i == cnt - 1) {
						w = width - x;
					} else {
						w = column.displayWidth();
					}
					view.setBounds(x, 0, w, height);
					view.layoutContent(lm);
					x += w;
					if (view instanceof SummaryGroupCellElement) {
						view._layoutCells(lm);
					}
				}
			}
		}
	},
	canHovering: function () {
		return false;
	},
	$_createCells: function (group) {
		this.hideAll();
		var i;
		var cnt;
		var column;
		var view;
		var model;
		var grid = this.grid();
		var summary = grid.header().summary();
		for (i = 0, cnt = group.visibleCount(); i < cnt; i++) {
			column = group.getVisibleItem(i);
			view = this._getCell(column);
			if (!view) {
				if (column instanceof ColumnGroup) {
					view = new SummaryGroupCellElement(this._dom);
				} else {
					view = new SummaryCellElement(this._dom);
				}
				this.$_setCell(column, view);
				this.addElement(view);
			}
			view.setVisible(true);
			model = summary.getCell(CellIndex.temp(grid, -1, column));
			view.updateCell(model);
			if (column instanceof ColumnGroup) {
				view.$_createCells(column);
			}
		}
	}
});
var FooterCellElement = defineClass("FooterCellElement", ValueCellElement, {
	init: function(dom) {
		this._super(dom, "footerCellView");
		this._value = NaN;
		this._error = null;
		this._errorDetail = null;
	},
	text: null,
    column: function () {
        return this.index().C();
    },
	value: function () {
		return this._value;
	},
	error: function () { 
		return this._error;
	},
	errorDetail: function () {
		return this._errorDetail;
	},
	_doPrepareValue: function(model) {
		this._super(model);
		this._value = model.value();
		var fmt;
		var s = null;
		var f = null;
		if (this._value !== UNDEFINED) {
			if (model.index().column() instanceof DataColumn && model.index().column().valueType() == ValueType.DATETIME) {
				if (this._value instanceof Date && (fmt = this.datetimeWriter())) {
					s = fmt.getText(this._value)
				} else {
					s = model.displayText();
				}
			} else {
				var v = Number(this._value);
				if (!isNaN(v) && (fmt = this.numberFormatter())) {
					s = fmt.format(v);
				} else if (this._value) {
					s = this._value;
				} else {
					s = model.displayText();
				}
			}
		} else {
			s = model.displayText();
		}
		if (s != null) {
			if (f = this.prefix()) {
				s = f + s;
			}
			if (f = this.suffix()) {
				s = s + f;
			}
		}
		this.setText(s);
		this._error = model.error();
	},
	_doPrepareElement: function(styles) {
		this._super(styles);
	},
	_doLayoutHandles: function() {
	},
	_doRender: function(g, r) {
		var fill = this.background();
		if (fill) {
			g.drawRectI(fill, null, r);
		}
		var s = this.text();
		if (s) {
			this.inflatePadding(r);
			if (typeof s == "string") {
				g.drawTextBoundsExplicit(this._font, this._foreground, s, r.x, r.y, r.width, r.height, this._textAlign); 
			} else {
				g.drawTextRect(this._font, this._foreground, s, r, this._textAlign);			
			}
			this.deflatePadding(r);
		}
		this._drawBorders(g, r);
	},
	_doRenderHtml: function(r) {
		var fill = this.background();
        this._css.clip = Dom.getClipRect(r);
        _ieOld ? this.$_setCssFill(fill) : (this._css.background = fill ? fill.css() : null);
		var s = this.text();
		if (s) {
			var textFill = this.foreground();
            this.inflatePadding(r);
            var span = this.$_prepareSpan();
            Dom.renderTextBounds(span, this.font(), textFill, s, r.x, r.y, r.width, r.height, this.textAlign());
            this.deflatePadding(r);
			/*
			this.inflatePadding(r);
			g.drawTextRect(this._font, this._foreground, s, r, this._textAlign);
			this.deflatePadding(r);
			*/
            /*
			this._css.font = this._font.font;
			this._css.color = textFill.css();
			this._css.textAlign = "center";
			this._css.lineHeight = (this._height - 2) + "px";
			this._span.style.verticalAlign = "middle";
			this._span.textContent = s;
			*/
		}
		this._drawHtmlBorders();
	},
	canHovering: function () {
		return false;
	}
});
var FooterGroupCellElement = defineClass("FooterGroupCellElement", GroupCellElement, {
	init: function(dom) {
		this._super(dom, "fooerGroupCellView");
	},
	layoutContent: function (lm, fIndex) {
		return this._doLayoutContent(lm, fIndex);
	},	
	_doLayoutContent: function (lm, fIndex) {
		this._prepareCells(lm, fIndex);
		this._layoutCells(lm, fIndex);
	},
	_prepareCells: function(lm, fIndex) {
		this.$_createCells(this.group(), fIndex);
	},
	_layoutCells: function(lm, fIndex) {
		var i;
		var dy;
		var x;
		var y;
		var h;
		var w;
		var column;
		var view;
		var group = this.group();
		var r = new Rectangle();
		var width = this.width();
		var height = this.height();
		var cnt = group.visibleCount();
		if (group.isVertical()) {
			y = r.bottom();
			h = _int(height / group.dataLevel());
			for (i = 0; i < cnt; i++) {
				column = group.getVisibleItem(i);
				view = this._getCell(column);
				if (view) {
					dy = 0;
					if (i == cnt - 1) {
						dy = height - y;
					} else if (view instanceof FooterGroupCellElement) {
						dy = h * view.group().dataLevel();
					} else {
						dy += h;
					}
					view.setBounds(0, y, width, dy);
					view.layoutContent(lm, fIndex);
					y += dy;
					if (view instanceof FooterGroupCellElement) {
						view._layoutCells(lm, fIndex);
					}
				}
			}
		} else {
			x = 0;
			for (i = 0; i < cnt; i++) {
				column = group.getVisibleItem(i);
				view = this._getCell(column);
				if (view) {
					if (i == cnt - 1) {
						w = width - x;
					} else {
						w = column.displayWidth();
					}
					view.setBounds(x, 0, w, height);
					view.layoutContent(lm, fIndex);
					x += w;
					if (view instanceof FooterGroupCellElement) { 
						view._layoutCells(lm, fIndex);
					}							
				}
			}
		}
	},
	canHovering: function () {
		return false;
	},
	$_createCells: function (group, fIndex) {
		this.hideAll();
		var i;
		var cnt;
		var column;
		var view;
		var model;
		var grid = this.grid();
		var footer = grid.footer();
		for (i = 0, cnt = group.visibleCount(); i < cnt; i++) {
			column = group.getVisibleItem(i);
			view = this._getCell(column);
			if (!view) {
				if (column instanceof ColumnGroup) {
					view = new FooterGroupCellElement(this._dom);
				} else { 
					view = new FooterCellElement(this._dom);
				}
				this.$_setCell(column, view);
				this.addElement(view);
			}
			view.setVisible(true);					
			model = footer.getCell(CellIndex.temp(grid, -1, column), fIndex);
			view.updateCell(model);
			if (column instanceof ColumnGroup) {
				view.$_createCells(column);
			}
		}
	}
});
var GroupFooterCellElement = defineClass("GroupFooterCellElement", ValueCellElement, {
	init: function(dom) {
		this._super(dom, "groupFooterCellElement");
		this._value = UNDEFINED;
		this._error = null;
	},
	text: null,
	textVisible: true,
	value: function () {
		return this._value;
	},
	error: function () { 
		return this._error;
	},
	_doPrepareValue: function(model) {
		this._super(model);
		this._value = model.value();
		var fmt;
		var s = null;
		var f = null;
		if (this._value !== UNDEFINED) {
			if (model.index().column() instanceof DataColumn && model.index().column().valueType() == ValueType.DATETIME) {
				if (this._value instanceof Date && (fmt = this.datetimeWriter())) {
					s = fmt.getText(this._value)
				} else {
					s = model.displayText();
				}
			} else {
				var v = Number(this._value);
				if (!isNaN(v) && (fmt = this.numberFormatter())) {
					s = fmt.format(v);
				} else if (this._value) {
					s = this._value;
				} else {
					s = model.displayText();
				}
			}
		} else {
			s = model.displayText();
		}
		if (s != null) {
			if (f = this.prefix()) {
				s = f + s;
			} 
			if (f = this.suffix()) {
				s = s + f;
			}
		}
		this.setText(s);
		this._error = model.error();
	},
	_doPrepareElement: function(styles) {
		this._super(styles);
	},
	_doLayoutHandles: function() {
	},
	_doRender: function(g, r) {
		var fill = this.background();
		if (fill) {
			g.drawRect(fill, null, r);
		}
		var s = this.text();
		if (s && this._textVisible) {
			this.inflatePadding(r);
			if (typeof s == "string") {
				g.drawTextBoundsExplicit(this._font, this._foreground, s, r.x, r.y, r.width, r.height, this._textAlign); 
			} else {
				g.drawTextRect(this._font, this._foreground, s, r, this._textAlign);			
			}
			this.deflatePadding(r);
		}
		this._drawBorders(g, r);
	},
	_doRenderHtml: function(r) {
		var fill = this.background();
		this._css.clip = Dom.getClipRect(r);
		_ieOld ? this.$_setCssFill(fill) : (this._css.background = fill ? fill.css() : null);
		var s = this.text();
		if (s) {
			this.inflatePadding(r);
			var span = this.$_prepareSpan();
			Dom.renderTextBounds(span, this._font, this._foreground, s, r.x, r.y, r.width, r.height, this._textAlign);
			this.deflatePadding(r);
		}
		this._drawHtmlBorders();
	},
	clip: function (g) {
		this.getClientRect(this._drawRect);
		var dr = this._drawRect.clone();
		var grid = this.grid();
		var lm = grid.layoutManager();
		var lfr = lm._nonfixedBounds;
		var cr = this.boundsBy();
		if (cr.x < lfr.x && !this._index._column.isFixed()) {
			var sx = lfr.x - cr.x + grid._x;
			// sx = this._shiftLeft ? sx - this._shiftLeft : sx;
			dr.leftBy(sx);
		};
		this._shiftLeft ? dr.leftBy(-this._shiftLeft) : null;
		if (cr.right() > lm._rfixedBounds.x && !this._index._column.isRightFixed()) {
			dr.rightBy(lm._rfixedBounds.x - cr.right() + 1);
		}
		g.clipRect(dr);
	}
});
var GroupFooterGroupCellElement = defineClass("GroupFooterGroupCellElement", GroupCellElement, {
	init: function (dom) {
		this._super(dom, "groupFooterGroupCellView");
	},
	_prepareCells: function (lm) {
		this.$_createCells(this.group());
	},
	_layoutCells: function (lm) {
		var i;
		var dy;
		var x;
		var y;
		var h;
		var w;
		var column;
		var view;
		var group = this.group();
		var r = new Rectangle();
		var width = this.width();
		var height = this.height();
		var cnt = group.visibleCount();
		if (group.isVertical()) {
			y = r.bottom();
			h = _int(height / this.childCount());
			for (i = 0; i < cnt; i++) {
				column = group.getVisibleItem(i);
				view = this._getCell(column);
				if (view) {
					dy = 0;
					if (i == cnt - 1) {
						dy = height - y;
					} else if (view instanceof GroupFooterGroupCellElement) {
						dy = h * view.group().dataLevel();
					} else {
						dy += h;
					}
					view.setBounds(0, y, width, dy);
					y += dy;
				}
				if (view instanceof GroupFooterGroupCellElement) {
					view._layoutCells(lm);
				}
			}
		} else {
			x = 0;
			for (i = 0; i < cnt; i++) {
				column = group.getVisibleItem(i);
				view = this._getCell(column);
				if (view) {
					if (i == cnt - 1) {
						w = width - x;
					} else {
						w = column.displayWidth();
					}
					view.setBounds(x, 0, w, height);
					x += w;
				}
				if (view instanceof GroupFooterGroupCellElement) {
					view._layoutCells(lm);
				}
			}
		}
	},
	$_createCells: function (group) {
		this.hideAll();
		var i;
		var cnt;
		var column;
		var view;
		var model;
		var grid = this.grid();
		var rowGroup = grid.rowGroup();
		for (i = 0, cnt = group.visibleCount(); i < cnt; i++) {
			column = group.getVisibleItem(i);
			view = this._getCell(column);
			if (!view) {
				if (column instanceof ValueColumn) {
					view = new GroupFooterCellElement(this._dom);
				} else  if (column instanceof ColumnGroup) {
					view = new GroupFooterGroupCellElement(this._dom);
				}
				this.$_setCell(column, view);
				if (view) {
					this.addElement(view);
				}
			}
			if (view) {
				view.setVisible(true);
				model = rowGroup.getFooterCell(CellIndex.temp(grid, this.index().I(), column));
				view.updateCell(model);
				if (column instanceof DataColumn) {
				} else if (column instanceof ColumnGroup) {
				}
			}
			if (column instanceof ColumnGroup) {
				view.$_createCells(column);
			}
		}
	}
});
var SectionHeadFootElement = defineClass("SectionHeadFootElement", CellElement, {
	init: function(dom, name) {
		this._super(dom, name);
	},
	text: null,
	image: null,
	_renderCell: function (g, r) {
		if (this._image) {
        	var w = Math.min(this._image.width, r.width);
        	var h = Math.min(this._image.height, r.height)
			g.drawImage(this._image, (r.width-w)/2, (r.height-h)/2, w, h);
		} else if (this._text) {
			stroke = this.foreground();
			if (stroke) {
				this.inflatePadding(r);
				g.drawTextBoundsExplicit(this._font, stroke, this._text, r.x, r.y, r.width, r.height, this._textAlign, this._lineAlign);
				this.deflatePadding(r);
			}
		}		
	},
	_renderCellHtml: function (r) {
		if (this._text) {
			fill = this.background();
			if (fill) {
				this.inflatePadding(r);
				var span = this.$_prepareSpan();
				Dom.renderTextBounds(span, this.font(), fill, this._text, r.x, r.y, r.width, r.height, this._textAlign);
				this.deflatePadding(r);
			}
		}
	}
});

var IndicatorHeadElement = defineClass("IndicatorHeadElement", SectionHeadFootElement, {
	init: function(dom) {
		this._super(dom, "indicatorHeadView");
	},
	_doUpdateContent: function(model) {
		this._super(model);
		var grid = this.grid();
		var indicator = grid.indicator();
		this._text = indicator.headText();
		this._image = indicator.headImage();
	},
	_doMeasure: function(grid, hintWidth, hintHeight) {
	},
	_doRender: function(g, r) {
		var fill = this.background();
		if (fill) {
			g.drawRect(fill, null, r);
		}
		this._renderCell(g, r);
		this._drawBorders(g, r);
	},
	_doRenderHtml: function (r) {
		var fill = this.background();
		if (fill) {
			this._css.background = fill.css();
		}
		this._renderCellHtml(r);
		this._drawHtmlBorders();
	}
});
var IndicatorFootElement = defineClass("IndicatorFootElement", SectionHeadFootElement, {
	init: function(dom, name) {
		this._super(dom, name || "indicatorFootView");
	},
	renderer: null,
	_doUpdateContent: function(model) {
		this._super(model);
		var grid = this.grid();
		var indicator = grid.indicator();
		this._text = indicator.footText();
		this._image = indicator.footImage();
	},
	_doMeasure: function(grid, hintWidth, hintHeight) {
	},
	_doRender: function(g, r) {
		if (this._renderer && !this._text && !this._image) {
			this._renderer.render(this, g, r);
		} else {
			var fill = this.background();
			if (fill) {
				g.drawRect(fill, null, r);
			}
			this._renderCell(g, r);
		}
		this._drawBorders(g, r);
	},
	_doRenderHtml: function (r) {
		if (this._renderer && !this.text) {
			this._renderer.renderHtml(this, r);
		} else {
			var fill = view.background();
			if (fill) {
				view._css.background = fill.css();
			}
			this._renderCellHtml(r);
		}
		this._drawHtmlBorders();
	}
});
var FooterHeadRenderer = defineClass("FooterHeadRenderer", null, {
	init: function () {
		this._super();
	},
	render: function (view, g, r) {
		var fill = view.background();
		if (fill) {
			g.drawRect(fill, null, r);
		}
		this.$_drawSigma(view, g, r);
	},
	renderHtml: function (view, r) {
		var fill = view.background();
		if (fill) {
			view._css.background = fill.css();
		}
	},
	$_drawSigma: function (view, g, r) {
		var fill = view.figureBackground();
		if (fill) {
			var w = 11;
			var h = 11;
			var x = r.x + (r.width - w) / 2;
			var y = r.y + (r.height - h) / 2;
			var points = [
				x + 2, y + 1,
				x + 2, y + 2.5,
				x + 4, y + 5,
				x + 1, y + 8.5,
				x + 1, y + 10,
				x + 9, y + 10,
				x + 9, y + 6.5,
				x + 8, y + 8.5,
				x + 2, y + 8.5,
				x + 5, y + 5,
				x + 3, y + 2.5,
				x + 9, y + 2.5,
				x + 10, y + 4.5,
				x + 10, y + 1
			];
			g.drawPolygonArray(fill, null, points);
		}
	}
});

var IndicatorSummaryElement = defineClass("IndicatorSummaryElement", IndicatorFootElement, {
    init: function (dom) {
        this._super(dom, "indicatorSummaryView");
    },
   	_doUpdateContent: function(model) {
   		this._super(model);
		var grid = this.grid();
		var indicator = grid.indicator();
		this._text = indicator.summaryText() || indicator.footText();
		this._image =indicator.summaryImage() || indicator.footImage();
   	}

});
var StateBarHeadElement = defineClass("StateBarHeadElement", SectionHeadFootElement, {
	init: function(dom) {
		this._super(dom, "stateBarHeadView");
	},
	_doUpdateContent: function(model) {
		this._super(model);
		var grid = this.grid();
		var stateBar = grid.stateBar();
		this._text = stateBar.headText();
		this._image = stateBar.headImage();
	},
	_doMeasure: function(grid, hintWidth, hintHeight) {
	},
	_doRender: function(g, r) {
		var fill = this.background();
		if (fill) {
			g.drawRect(fill, null, r);
		}
		this._renderCell(g, r);
		this._drawBorders(g, r);
	},
	_doRenderHtml: function (r) {
		var fill = this.background();
		if (fill) {
			this._css.background = fill.css();
		}
		this._renderCellHtml(r);
		this._drawHtmlBorders();
	}
});
var StateBarFootElement = defineClass("StateBarFootElement", SectionHeadFootElement, {
	init: function(dom, name) {
		this._super(dom, name || "stateBarFootView");
	},
	_doUpdateContent: function(model) {
		this._super(model);
		var grid = this.grid();
		var stateBar = grid.stateBar();
		this._text = stateBar.footText();
		this._image = stateBar.footImage();
	},
	_doMeasure: function(grid, hintWidth, hintHeight) {
	},
	_doRender: function(g, r) {
		var fill = this.background();
		if (fill) {
			g.drawRect(fill, null, r);
		}
		this._renderCell(g, r);
		this._drawBorders(g, r);
	},
	_doRenderHtml: function (r) {
		var fill = this.background();
		if (fill) {
			this._css.background = fill.css();
		}
		this._renderCellHtml(r);
		this._drawHtmlBorders();
	}
});
var StateBarSummaryElement = defineClass("StateBarSummaryElement", StateBarFootElement, {
    init: function (dom) {
        this._super(dom, "stateBarSummaryView");
    },
   	_doUpdateContent: function(model) {
   		this._super(model);
		var grid = this.grid();
		var stateBar = grid.stateBar();
		this._text = stateBar.summaryText() || stateBar.footText();
		this._image =stateBar.summaryImage() || stateBar.footImage();
   	}
});
var CheckBarHeadElement = defineClass("CheckBarHeadElement", SectionHeadFootElement, {
	init: function(dom) {
		this._super(dom, "checkBarHeadView");
	},
	showCheck: true,
	checked: false,
	_doUpdateContent: function(model) {
		this._super(model);
		var grid = this.grid();
		var checkBar = grid.checkBar();
		this.setShowCheck(checkBar.isShowAll() && !checkBar.isExclusive() && grid.itemCount() > 0);
		this._text = checkBar.headText();
		this._image = checkBar.headImage();
		if (grid.itemCount() <= 0) {
			this.setChecked(false);
		}
	},
	_doMeasure: function(grid, hintWidth, hintHeight) {
	},
	_doRender: function(g, r) {
		var fill = this.background();
		if (fill) {
			g.drawRect(fill, null, r);
		}
		if (this.isShowCheck()) {
			this.$_drawCheck(g, r);
		} else {
			this._renderCell(g, r);
		}
		this._drawBorders(g, r);
	},
	_doRenderHtml: function (r) {
		var fill = this.background();
		if (fill) {
			this._css.background = fill.css();
		}
		if (this.isShowCheck()) {
			if (!this._check) {
				this._check = document.createElement("input");
				this._check.type = "checkbox";
				this._check.style.position = "absolute";
				this._check.style.padding = "0px";
				this._check.style.margin = "0px";
				this._dom.appendChild(this._check);
			}
			var cr = this._check.getBoundingClientRect2();
			this._check.style.left = (r.x + this.paddingLeft() + (r.width - this.paddingHorz() - cr.width) / 2) + "px";
			this._check.style.top = (r.y + this.paddingTop() + (r.height - this.paddingVert() - cr.height) / 2) + "px";
		} else {
			this._renderCellHtml(r);
		}
		this._drawHtmlBorders();
	},
	$_drawCheck: function (g, r) {
		var fill = this.isChecked() ? this.figureBackground() : this.figureInactiveBackground();
		if (fill) {
			var fs = this.figureSize();
			var sz = fs ? fs.getDimension(r.height) : 12;
			$$_drawCheckMark(g, fill, r, sz);
		}
	}
});
var CheckBarFootElement = defineClass("CheckBarFootElement", SectionHeadFootElement, {
	init: function(dom, name) {
		this._super(dom, name || "checkBarFootView");
	},
	_doUpdateContent: function(model) {
		this._super(model);
		var grid = this.grid();
		var checkBar = grid.checkBar();
		this._text = checkBar.footText();
		this._image = checkBar.footImage();
	},
	_doMeasure: function(grid, hintWidth, hintHeight) {
	},
	_doRender: function(g, r) {
		var fill = this.background();
		if (fill) {
			g.drawRect(fill, null, r);
		}
		this._renderCell(g, r);
		this._drawBorders(g, r);
	},
	_doRenderHtml: function (r) {
		var fill = this.background();
		this._css.background = fill ? fill.css() : null;
		this._renderCellHtml(r);
		this._drawHtmlBorders();
	}
});
var CheckBarSummaryElement = defineClass("CheckBarSummaryElement", CheckBarFootElement, {
    init: function (dom) {
        this._super(dom, "checkBarSummaryView");
    },
   	_doUpdateContent: function(model) {
   		this._super(model);
		var grid = this.grid();
		var checkBar = grid.checkBar();
		this._text = checkBar.summaryText() || checkBar.footText();
		this._image =checkBar.summaryImage() || checkBar.footImage();
   	}
});
var IndicatorCellElement = defineClass("IndicatorCellElement", SelectableCellElement, {
	init: function(dom) {
		this._super(dom, "indicatorCellView");
	},
	text: null,
	itemState: ItemState.NORMAL,
	setItemState: function (value) {
		if (value != this._itemState) {
			this._itemState = value;
			this.invalidate();
		}
	},
	_doPrepareElement: function(styles) {
		this._super(styles);
	},
	_doUpdateContent: function(model) {
		this._super(model);
		this.setItemState(model.itemState());
		this.setText(model.displayText());
	},
	_doRender: function(g, r) {
		var itemState = this.itemState();
		var fill = null;
		if (this.isHovered()) {
			fill = this.hoveredBackground();
		}
		if (!fill && (this.isSelected() || itemState != ItemState.NORMAL)) {
			fill = this.selectedBackground();
		}
		if (!fill) {
			fill = this.background();
		}
		if (fill) {
			g.drawRect(fill, null, r);
		}
		fill = this.figureBackground();
		if (fill && itemState != ItemState.NORMAL) {
			if (itemState == ItemState.INSERTING || itemState == ItemState.APPENDING) {
				this.$_drawInsert(g, fill, r);
			} else if (itemState == ItemState.UPDATING) {
				this.$_drawEdit(g, fill, r);
			}
			 else if (itemState == ItemState.FOCUSED) {
				this.$_drawArrow(g, fill, r);
			}
		} else {
			var s = this.text();
			if (s) {
				fill = null;
				if (this.isSelected()) {
					fill = this.selectedForeground();
				}
				if (!fill && this.isHovered()) {
					fill = this.hoveredForeground();
				}
				if (!fill) {
					fill = this.foreground();
				}
				if (fill) {
					this.inflatePadding(r);
					g.drawTextRect(this._font, fill, s, r, this._textAlign);
					this.deflatePadding(r);
				}
			}
		}
		this._drawBorders(g, r);
	},
	_doRenderHtml: function (r) {
		var itemState = this.itemState();
		var fill = null;
		if (this.isHovered()) {
			fill = this.hoveredBackground();
		}
		if (!fill && (this.isSelected() || itemState != ItemState.NORMAL)) {
			fill = this.selectedBackground();
		}
		if (!fill) {
			fill = this.background();
		}
		this._css.background = fill ? fill.css() : null;
		fill = this.figureBackground();
		if (fill && itemState != ItemState.NORMAL) {
			/*
			if (itemState == ItemState.INSERTING || itemState == ItemState.APPENDING) {
				this.$_drawInsert(g, fill, r);
			} else if (itemState == ItemState.UPDATING) {
				this.$_drawEdit(g, fill, r);
			}
			else if (itemState == ItemState.FOCUSED) {
				this.$_drawArrow(g, fill, r);
			}
			*/
		} else {
			var s = this.text();
			if (s) {
				/*
				 * TODO : rendering 최적화 후에..
				 if (this.isSelected()) {
				 fill = this.selectedForeground();
				 }
				 if (!fill && this.isHovered()) {
				 fill = this.hoveredForeground();
				 }
				 if (!fill) {
				 fill = this._foreground;
				 }
				 */
				if (fill) {
					this.inflatePadding(r);
					var span = this.$_prepareSpan();
					Dom.renderTextBounds(span, this.font(), fill, s, r.x, r.y, r.width, r.height, this._textAlign);
					this.deflatePadding(r);
				}
			}
		}
		this._drawHtmlBorders();
	},
	_hoveredChanged: function () {
		this.invalidate();
	},
	$_drawArrow: function (g, fill, r) {
		var W = 11;
		var H = 11;
		var x = r.x + (r.width - W) / 2;
		var y = r.y + (r.height - H) / 2;
		g.drawPolygonArray(fill, null, [
			x + 4, y + 2,
			x + 7.5, y + 5.5,
			x + 4, y + 9,
			x + 5, y + 10,
			x + 9.5, y + 5.5,
			x + 5, y + 1
		]);
	},
	$_drawEdit: function (g, fill, r) {
		var W = 11;
		var H = 11;
		var x = r.x + (r.width - W) / 2;
		var y = r.y + (r.height - H) / 2;
		g.drawPolygonArray(fill, null, [
			x + 9, y + 0,
			x + 3, y + 6,
			x + 3, y + 8,
			x + 5, y + 8,
			x + 11, y + 2
		]);
		g.drawPolygonArray(fill, null, [
			x + 0, y + 9,
			x + 0, y + 11,
			x + 11, y + 11,
			x + 11, y + 9,
		]);
	},
	$_drawInsert: function (g, fill, r) {
		var W = 11;
		var H = 11;
		var x = r.x + (r.width - W) / 2;
		var y = r.y + (r.height - H) / 2;
		g.drawPolygonArray(fill, null, [
			x + 0, y + 0,
			x + 0, y + 11,
			x + 5, y + 11,
			x + 5, y + 9,
			x + 2, y + 9,
			x + 2, y + 2,
			x + 9, y + 2,
			x + 9, y + 5,
			x + 11, y + 5,
			x + 11, y + 0
		]);
		g.drawPolygonArray(fill, null, [
			x + 7, y + 5,
			x + 7, y + 7,
			x + 5, y + 7,
			x + 5, y + 9,
			x + 7, y + 9,
			x + 7, y + 11,
			x + 9, y + 11,
			x + 9, y + 9,
			x + 11, y + 9,
			x + 11, y + 7,
			x + 9, y + 7,
			x + 9, y + 5,
		]);
	}});
var $_SBC_CW = 14;
var $_SBC_CH = 10;
var StateBarCellElement = defineClass("StateBarCellElement", SelectableCellElement, {
	init: function(dom) {
		this._super(dom, "stateBarCellView");
	},
	rowState: RowState.NONE,
	mark: StateMark.DEFAULT,
	stateTexts: null,
	_doPrepareElement: function(styles) {
		this._super(styles);
	},
	_doUpdateContent: function(model) {
		this._super(model);
		this.setRowState(model.index().item().rowState());
		var grid = this.grid();
		var stateBar = grid.stateBar();
		this._mark = stateBar.mark();
		var texts = null;
		if (texts = stateBar.stateTexts()) {
			this.setStateTexts(texts);
		}
	},
	_doRender: function(g, r) {
		var rowState = this.rowState();
		var fill = null;
		if (this.isHovered()) {
			fill = this.hoveredBackground();
		}
		if (!fill) {
			fill = this.background();
		}
		if (fill) {
			g.drawRect(fill, null, r);
		}

		if (rowState != RowState.NONE) {
			if (this._mark == StateMark.TEXT) {
				var text = this._stateTexts[rowState];
				fill = this.isHovered() ? this.hoveredForeground() : null;
				if (!fill)
					fill = this.foreground();
				if (fill) {
					this.inflatePadding(r);
					g.drawTextRect(this._font, fill, text, r, this._textAlign);
					this.deflatePadding(r);
				}
			} else {
				fill = this.figureBackground();
				if (fill) {
					var rc = this._getRenderRect(r);
					var figureSize = this.figureSize();
					var w = figureSize ? figureSize.getDimension(rc.width) : $_SBC_CW;
					var h = figureSize ? figureSize.getDimension(rc.width) : $_SBC_CH;
					var x = (rc.width - w) / 2;
					var y = (rc.height - h) / 2;
					rc.set(_int(x), _int(y), w, h);
					switch(rowState) {
					case RowState.CREATED:
						this.$_drawCreated(g, fill, rc);
						break;
					case RowState.DELETED:
						this.$_drawDeleted(g, fill, rc);
						break;
					case RowState.UPDATED:
						this.$_drawUpdated(g, fill, rc);
						break;
					case RowState.CREATE_AND_DELETED:
						this.$_drawCreateAndDeleted(g, fill, rc);
						break;
					}
				}
			}
		}
		this._drawBorders(g, r);
	},
	_doRenderHtml: function(r) {
		var rowState = this.rowState();
		var fill = null;
		if (this.isHovered()) {
			fill = this.hoveredBackground();
		}
		if (!fill) {
			fill = this.background();
		}
		this._css.background = fill ? fill.css() : null;
		if (rowState != RowState.NONE && this._stateTexts) {
			var text = this._stateTexts[rowState];
			fill = this.background();
			if (fill) {
				this.inflatePadding(r);
				var span = this.$_prepareSpan();
				Dom.renderTextBounds(span, this.font(), fill, text, r.x, r.y, r.width, r.height, this._textAlign);
				this.deflatePadding(r);
			}
		}
		/*
		fill = this.figureBackground();
		if (fill && rowState != RowState.NONE) {
			var rc = this._getRenderRect(r);
			var figureSize = this.figureSize();
			var w = figureSize ? figureSize.getDimension(rc.width) : $_SBC_CW;
			var h = figureSize ? figureSize.getDimension(rc.width) : $_SBC_CH;
			var x = (rc.width - w) / 2;
			var y = (rc.height - h) / 2;
			rc.set(_int(x), _int(y), w, h);
			switch(rowState) {
				case RowState.CREATED:
					this.$_drawCreated(g, fill, rc);
					break;
				case RowState.DELETED:
					this.$_drawDeleted(g, fill, rc);
					break;
				case RowState.UPDATED:
					this.$_drawUpdated(g, fill, rc);
					break;
				case RowState.CREATE_AND_DELETED:
					this.$_drawCreateAndDeleted(g, fill, rc);
					break;
			}
		}
		*/
		this._drawHtmlBorders();
	},
	$_drawCreated: function (g, fill, r) {
		var x = r.x;
		var y = r.y;
		var w = r.width;
		var h = r.height;
		var pts = [
			x + 6 * w / $_SBC_CW, y + 0 * h / $_SBC_CH,
			x + 6 * w / $_SBC_CW, y + 2 * h / $_SBC_CH,
			x + 4 * w / $_SBC_CW, y + 2 * h / $_SBC_CH,
			x + 4 * w / $_SBC_CW, y + 4 * h / $_SBC_CH,
			x + 6 * w / $_SBC_CW, y + 4 * h / $_SBC_CH,
			x + 6 * w / $_SBC_CW, y + 6 * h / $_SBC_CH,
			x + 8 * w / $_SBC_CW, y + 6 * h / $_SBC_CH,
			x + 8 * w / $_SBC_CW, y + 4 * h / $_SBC_CH,
			x + 10 * w / $_SBC_CW, y + 4 * h / $_SBC_CH,
			x + 10 * w / $_SBC_CW, y + 2 * h / $_SBC_CH,
			x + 8 * w / $_SBC_CW, y + 2 * h / $_SBC_CH,
			x + 8 * w / $_SBC_CW, y + 0 * h / $_SBC_CH,
		];
		g.drawPolygonArray(fill, null, pts);
		pts = [
			x + 1 * w / $_SBC_CW, y + 9 * h / $_SBC_CH,
			x + 1 * w / $_SBC_CW, y + 10 * h / $_SBC_CH,
			x + 13 * w / $_SBC_CW, y + 10 * h / $_SBC_CH,
			x + 13 * w / $_SBC_CW, y + 9 * h / $_SBC_CH,
		];
		g.drawPolygonArray(fill, null, pts);
	},
	$_drawUpdated: function (g, fill, r) {
		var x = r.x;
		var y = r.y;
		var w = r.width;
		var h = r.height;
		var pts = [
			x + 2 * w / $_SBC_CW, y + 1 * h / $_SBC_CH,
			x + 2 * w / $_SBC_CW, y + 5 * h / $_SBC_CH,
			x + 3 * w / $_SBC_CW, y + 5 * h / $_SBC_CH,
			x + 3 * w / $_SBC_CW, y + 2 * h / $_SBC_CH,
			x + 9 * w / $_SBC_CW, y + 2 * h / $_SBC_CH,
			x + 9 * w / $_SBC_CW, y + 4 * h / $_SBC_CH,
			x + 7 * w / $_SBC_CW, y + 4 * h / $_SBC_CH,
			x + 7 * w / $_SBC_CW, y + 5 * h / $_SBC_CH,
			x + 8 * w / $_SBC_CW, y + 5 * h / $_SBC_CH,
			x + 8 * w / $_SBC_CW, y + 6 * h / $_SBC_CH,
			x + 9 * w / $_SBC_CW, y + 6 * h / $_SBC_CH,
			x + 9 * w / $_SBC_CW, y + 7 * h / $_SBC_CH,
			x + 10 * w / $_SBC_CW, y + 7 * h / $_SBC_CH,
			x + 10 * w / $_SBC_CW, y + 6 * h / $_SBC_CH,
			x + 11 * w / $_SBC_CW, y + 6 * h / $_SBC_CH,
			x + 11 * w / $_SBC_CW, y + 5 * h / $_SBC_CH,
			x + 12 * w / $_SBC_CW, y + 5 * h / $_SBC_CH,
			x + 12 * w / $_SBC_CW, y + 4 * h / $_SBC_CH,
			x + 10 * w / $_SBC_CW, y + 4 * h / $_SBC_CH,
			x + 10 * w / $_SBC_CW, y + 1 * h / $_SBC_CH,
		];
		g.drawPolygonArray(fill, null, pts);
		pts = [
			x + 1 * w / $_SBC_CW, y + 9 * h / $_SBC_CH,
			x + 1 * w / $_SBC_CW, y + 10 * h / $_SBC_CH,
			x + 13 * w / $_SBC_CW, y + 10 * h / $_SBC_CH,
			x + 13 * w / $_SBC_CW, y + 9 * h / $_SBC_CH,
		];
		g.drawPolygonArray(fill, null, pts);
	},
	$_drawDeleted: function (g, fill, r) {
		var x = r.x;
		var y = r.y;
		var w = r.width;
		var h = r.height;
		var pts = [
			x + 4 * w / $_SBC_CW, y + 2 * h / $_SBC_CH,
			x + 4 * w / $_SBC_CW, y + 4 * h / $_SBC_CH,
			x + 10 * w / $_SBC_CW, y + 4 * h / $_SBC_CH,
			x + 10 * w / $_SBC_CW, y + 2 * h / $_SBC_CH,
		];
		g.drawPolygonArray(fill, null, pts);
		pts = [
			x + 0 * w / $_SBC_CW, y + 9 * h / $_SBC_CH,
			x + 0 * w / $_SBC_CW, y + 10 * h / $_SBC_CH,
			x + 2 * w / $_SBC_CW, y + 10 * h / $_SBC_CH,
			x + 2 * w / $_SBC_CW, y + 9 * h / $_SBC_CH,
		];
		g.drawPolygonArray(fill, null, pts);
		pts = [
			x + 3 * w / $_SBC_CW, y + 9 * h / $_SBC_CH,
			x + 3 * w / $_SBC_CW, y + 10 * h / $_SBC_CH,
			x + 5 * w / $_SBC_CW, y + 10 * h / $_SBC_CH,
			x + 5 * w / $_SBC_CW, y + 9 * h / $_SBC_CH,
		];
		g.drawPolygonArray(fill, null, pts);
		pts = [
			x + 6 * w / $_SBC_CW, y + 9 * h / $_SBC_CH,
			x + 6 * w / $_SBC_CW, y + 10 * h / $_SBC_CH,
			x + 8 * w / $_SBC_CW, y + 10 * h / $_SBC_CH,
			x + 8 * w / $_SBC_CW, y + 9 * h / $_SBC_CH,
		];
		g.drawPolygonArray(fill, null, pts);
		pts = [
			x + 9 * w / $_SBC_CW, y + 9 * h / $_SBC_CH,
			x + 9 * w / $_SBC_CW, y + 10 * h / $_SBC_CH,
			x + 11 * w / $_SBC_CW, y + 10 * h / $_SBC_CH,
			x + 11 * w / $_SBC_CW, y + 9 * h / $_SBC_CH,
		];
		g.drawPolygonArray(fill, null, pts);
		pts = [
			x + 12 * w / $_SBC_CW, y + 9 * h / $_SBC_CH,
			x + 12 * w / $_SBC_CW, y + 10 * h / $_SBC_CH,
			x + 14 * w / $_SBC_CW, y + 10 * h / $_SBC_CH,
			x + 14 * w / $_SBC_CW, y + 9 * h / $_SBC_CH,
		];
		g.drawPolygonArray(fill, null, pts);
	},
	$_drawCreateAndDeleted: function (g, fill, r) {
		var x = r.x;
		var y = r.y;
		var w = r.width;
		var h = r.height;
		var pts = [
			x + 3 * w / $_SBC_CW, y + 0 * h / $_SBC_CH,
			x + 3 * w / $_SBC_CW, y + 2 * h / $_SBC_CH,
			x + 1 * w / $_SBC_CW, y + 2 * h / $_SBC_CH,
			x + 1 * w / $_SBC_CW, y + 3 * h / $_SBC_CH,
			x + 3 * w / $_SBC_CW, y + 3 * h / $_SBC_CH,
			x + 3 * w / $_SBC_CW, y + 5 * h / $_SBC_CH,
			x + 4 * w / $_SBC_CW, y + 5 * h / $_SBC_CH,
			x + 4 * w / $_SBC_CW, y + 3 * h / $_SBC_CH,
			x + 6 * w / $_SBC_CW, y + 3 * h / $_SBC_CH,
			x + 6 * w / $_SBC_CW, y + 2 * h / $_SBC_CH,
			x + 4 * w / $_SBC_CW, y + 2 * h / $_SBC_CH,
			x + 4 * w / $_SBC_CW, y + 0 * h / $_SBC_CH,
		];
		g.drawPolygonArray(fill, null, pts);
		pts = [
			x + 7 * w / $_SBC_CW, y + 2 * h / $_SBC_CH,
			x + 7 * w / $_SBC_CW, y + 4 * h / $_SBC_CH,
			x + 13 * w / $_SBC_CW, y + 4 * h / $_SBC_CH,
			x + 13 * w / $_SBC_CW, y + 2 * h / $_SBC_CH,
		];
		g.drawPolygonArray(fill, null, pts);
		pts = [
			x + 0 * w / $_SBC_CW, y + 9 * h / $_SBC_CH,
			x + 0 * w / $_SBC_CW, y + 10 * h / $_SBC_CH,
			x + 2 * w / $_SBC_CW, y + 10 * h / $_SBC_CH,
			x + 2 * w / $_SBC_CW, y + 9 * h / $_SBC_CH,
		];
		g.drawPolygonArray(fill, null, pts);
		pts = [
			x + 3 * w / $_SBC_CW, y + 9 * h / $_SBC_CH,
			x + 3 * w / $_SBC_CW, y + 10 * h / $_SBC_CH,
			x + 5 * w / $_SBC_CW, y + 10 * h / $_SBC_CH,
			x + 5 * w / $_SBC_CW, y + 9 * h / $_SBC_CH,
		];
		g.drawPolygonArray(fill, null, pts);
		pts = [
			x + 6 * w / $_SBC_CW, y + 9 * h / $_SBC_CH,
			x + 6 * w / $_SBC_CW, y + 10 * h / $_SBC_CH,
			x + 8 * w / $_SBC_CW, y + 10 * h / $_SBC_CH,
			x + 8 * w / $_SBC_CW, y + 9 * h / $_SBC_CH,
		];
		g.drawPolygonArray(fill, null, pts);
		pts = [
			x + 9 * w / $_SBC_CW, y + 9 * h / $_SBC_CH,
			x + 9 * w / $_SBC_CW, y + 10 * h / $_SBC_CH,
			x + 11 * w / $_SBC_CW, y + 10 * h / $_SBC_CH,
			x + 11 * w / $_SBC_CW, y + 9 * h / $_SBC_CH,
		];
		g.drawPolygonArray(fill, null, pts);
		pts = [
			x + 12 * w / $_SBC_CW, y + 9 * h / $_SBC_CH,
			x + 12 * w / $_SBC_CW, y + 10 * h / $_SBC_CH,
			x + 14 * w / $_SBC_CW, y + 10 * h / $_SBC_CH,
			x + 14 * w / $_SBC_CW, y + 9 * h / $_SBC_CH,
		];
		g.drawPolygonArray(fill, null, pts);
	}
});
var CHECK_CELL_BORDER = new SolidPen("rgba(170, 170, 170, 0.7)");
var CHECK_CELL_GRAY_FILL = new SolidBrush(0xffeeeeee);
var CHECK_CELL_GRAY_BORDER = new SolidPen("rgba(170, 170, 170, 0.35)");
var CheckBarCellElement = defineClass("CheckBarCellElement", SelectableCellElement, {
	init: function(dom) {
		this._super(dom, "checkBarCellView");
	},
	markVisible: true,
	exclusive: false,
	checked: false,
	checkable: true,
	_doPrepareElement: function(styles) {
		this._super(styles);
	},
	_doUpdateContent: function(model) {
		this._super(model);
		var item = model.index().item();
		this.setCheckable(item.isCheckable());
		this.setChecked(item.isChecked());
	},
	_doRender: function(g, r) {
		var fill = null;
		if (this.isHovered()) {
			fill = this.hoveredBackground();
		}
		if (!fill) {
			fill = this.background();
		}
		if (fill) {
			g.drawRect(fill, null, r);
		}
		if (this._markVisible) {
			this._exclusive ? this.$_drawRadio(g, r) : this.$_drawCheck(g, r);
		}
		this._drawBorders(g, r);
	},
	_doRenderHtml: function(r) {
		var fill = null;
		if (this.isHovered()) {
			fill = this.hoveredBackground();
		}
		if (!fill) {
			fill = this.background();
		}
		this._css.background = fill ? fill.css() : null;
		if (!this._check) {
			this._check = document.createElement("input");
			this._check.type = "checkbox";
			this._check.style.position = "absolute";
			this._check.style.padding = "0px";
			this._check.style.margin = "0px";
			this._dom.appendChild(this._check);
		}
		var cr = this._check.getBoundingClientRect2();
		this._check.checked = this.isChecked();
		this._check.style.left = (r.x + this.paddingLeft() + (r.width - this.paddingHorz() - cr.width) / 2) + "px";
		this._check.style.top = (r.y + this.paddingTop() + (r.height - this.paddingVert() - cr.height) / 2) + "px";
		/*
		if (this._markVisible) {
			this._exclusive ? this.$_drawRadio(g, r) : this.$_drawCheck(g, r);
		}
		*/
		this._drawHtmlBorders();
	},
	$_drawCheck: function (g, r) {
		r = this._getRenderRect(r);
		var fill;
		var	checkSize = this.figureSize() ? this.figureSize().getDimension(r.height) : 12;
		var	sz = _floor(checkSize - 2);
		var	x = _floor(r.x + (r.width - sz) / 2);
		var	y = _floor(r.y + (r.height - sz) / 2);
		if (this.isCheckable()) {
			g.drawBoundsI(null, CHECK_CELL_BORDER, x, y, sz, sz);
		} else {
			g.drawBoundsI(CHECK_CELL_GRAY_FILL, CHECK_CELL_GRAY_BORDER, x, y, sz, sz);
		}
		if (this.isChecked()) {
			fill = this.figureBackground();
			$$_drawCheckMark(g, fill, r, checkSize);
		}
	},
	$_drawRadio: function (g, r) {
		r = this._getRenderRect(r);
		var fill,
			checkSize = this.figureSize() ? this.figureSize().getDimension(r.height) : 12,
			rd = (checkSize - 2) / 2,
			cx = r.x + r.width  / 2,
			cy = r.y + r.height / 2;
		if (this.isCheckable()) {
			g.drawCircle(null, CHECK_CELL_BORDER, cx, cy, rd);
		} else {
			g.drawCircle(CHECK_CELL_GRAY_FILL, CHECK_CELL_GRAY_BORDER, cx, cy, rd);
		}
		if (this.isChecked()) {
			rd -= 2;
			fill = this.figureBackground();
			g.drawCircle(fill, null, cx, cy, rd);
		}
	}
});
var DataCellElement = defineClass("DataCellElement", ValueCellElement, {
	init: function(dom, name) {
		this._super(dom, name || "dataCellView");
		this._dataColumn = null;
        this._cellStyles = null;
		this._error = null;
		this._errorLevel = ValidationLevel.IGNORE;
		this._leftButtonsWidth = 0;
		this._buttonWidth = 0;
		this._editWidth = 0;
		this._errorWidth = 0;
		this._buttonHovered = false;
		this._buttonPressed = false;
		this._buttonIndex = undefined;
		this._editButtonHovered = false;
		this._editButtonPressed = false;
		this._expandHandle = null;
	},
	contentFit: ContentFit.NONE,
	iconIndex: 0,
	iconLocation: IconLocation.NONE,
	iconAlignment: Alignment.NEAR,
	iconOffset: 0,
	iconPadding: 0,
    writable: true,
	renderer: null,
	text: null,
	value: UNDEFINED,
	blankState: BlankState.NONE,
	button: CellButton.NONE,
	buttonVisibility: ButtonVisibility.DEFAULT,
    editButtonVisibility: ButtonVisibility.DEFAULT,
    expanderVisible: false,
	innerIndex: -1,
	setInnerIndex: function (value) {
		if (value != this._innerIndex) {
			this._innerIndex = value;
			this.$_resetButtonVisible();
			this.invalidate();
		}
	},
	mergeRoom: function () {
		return null;
	},
	expanderVisible_: function () {
		return this._expandHandle != null;
	},
	setExpanderVisible: function (value) {
		if (value != this.isExpanderVisible()) {
			if (this._expandHandle) {
				if (this.contains(this._expandHandle)) {
					this.removeChild(this._expandHandle);
				}
				this._expandHandle = null;
			} else {
				this._expandHandle = new DataCellExpandHandle(this._dom, this);
			}
			this.invalidate();
		}
	},
	group: function () {
		var room = this.mergeRoom();
		return room ? room.group() : this.index().item().parent();
	},
	layoutTreeContent: function (lm) {
		this._doLayoutHandles();
	},
	ptInCell: function (x, y) {
		return (x > this._leftButtonsWidth) && (x < this.width() - this._buttonWidth - this._editWidth - this._errorWidth);
	},
	ptInButton: function (x, y) {
		var w = this._buttonWidth;
		var bx = this.width() - w;
		if (w > 0 && x >= bx && x < this.width() && y >= 0 && y <= this.height()) {
			return this.grid().delegate().getCellButtonRenderer(this.index()).hitTest(w, this.height(), x - bx, y);
		}
		return false;
	},
	getPtInButtonIndex: function (x, y) {
		var w = this._buttonWidth;
		var bx = this.width() - w;
		return this.grid().delegate().getCellButtonRenderer(this.index()).getButtonIndex(w, this.height(), x - bx, y);
	},
	ptInEditButton: function (x, y) {
		var w = this._editWidth;
		var bx = this.width() - w - this._buttonWidth;
		if (w > 0 && x >= bx && x < this.width() && y >= 0 && y <= this.height()) {
			return this.grid().delegate().getCellEditButtonRenderer(this.index()).hitTest(w, this.height(), x - bx, y);
		}
		return false;
	},
    ptInDataButton: function (x, y) {
        var renderer = this._renderer;
        if (renderer && renderer.isButton()) {
            return renderer.ptInButton(this, x, y);
        }
        return false;
    },
	setButtonState: function (hovered, pressed, buttonIndex) {
		if (this._buttonHovered != hovered || this._buttonPressed != pressed || buttonIndex != this._buttonIndex) {
			this._buttonHovered = (this._buttonPressed && !pressed && this._buttonHovered) ? true : hovered;
			this._buttonPressed = pressed;
			this._buttonIndex = buttonIndex;
			this.invalidate();
		}
	},
	setEditButtonState: function (hovered, pressed) {
		if (this._editButtonHovered != hovered || this._editButtonPressed != pressed) {
			this._editButtonHovered = hovered;
			this._editButtonPressed = pressed;
			this.invalidate();
		}
	},
	/** grid.getEditBounds()에서 호출된다. -1을 해준다. */
	getButtonsWidth: function () {
		return this.$_buttonWidth() + this.$_editButtonWidth() + this.$_errorWidth() - 1;
	},
	getValueOf: function (fieldName) {
		var idx = this.index();
		var item = idx.item();
		var ds = item.dataSource();
		var fld = ds.getFieldIndex(fieldName);
		if (fld >= 0) {
			return item.getData(fld);
		}
		return undefined;
	},
	canHovering: function (hovered) {
		if (hovered) {
			if (this.button() != CellButton.NONE || this.$_editButtonWidth() > 0 || this._expandHandle || this._error) {
				return true;
			}
		} else {
			if (this._leftButtonsWidth + this._buttonWidth + this._editWidth + this._errorWidth != 0) {
				return true;
			}
		}
		return false;
	},
	_hoveredChanged: function () {
		var renderer = this.renderer();
		if (renderer && renderer.isClickable(this.index())) {
			if (this._hovered) {
				this._fontUnderline = this._font.underline;
				this._font.underline = true;
			} else {
				this._font.underline = this._fontUnderline;
			}
            this.invalidate(false, true);
		}
	},
	_doLayoutHandles: function () {
		this._super();
		if (this._expandHandle) {
			var sz = DataCellElement.EXPANDER_SIZE;
			this._expandHandle.setBounds(2, 2, sz, sz);
			this._expandHandle.setExpanded(this.group && this.group() && this.group().isExpanded());
			if (!this.contains(this._expandHandle)) {
				this.addElement(this._expandHandle);
				this._expandHandle.invalidate();
			}
		}
	},
	_doPrepareValue: function (model) {
		this._super(model);
		this._dataColumn = this._index.dataColumn();
		this.setValue(model.value());
		this._error = model.error();
		this._errorLevel = model.errorLevel();
		var s = null;
		var col = this._dataColumn;
		if (col) {
			switch (col.valueType()) {
			case ValueType.TEXT:
				s = model.displayText();
				break;
			case ValueType.NUMBER:
				var v = Number(this._value);
				if (isNaN(v)) {
					s = col.nanText();
				} else if (this._numberFormatter) {
					s = this._numberFormatter.format(v);
				} else {
					s = model.displayText();
				}
				break;
			case ValueType.DATETIME:
				/*if (this._value instanceof Date && this._datetimeFormatter) {
					s = this._datetimeFormatter.format(this._value);
				} else*/ if (this._value instanceof Date && this.datetimeWriter()) {
					s = this.datetimeWriter().getText(this._value);
				} else {
					s = model.displayText();
				}
				break;
			case ValueType.BOOLEAN:
				if (this._boolFormatter) {
					s = this._boolFormatter.formatValue(this._value);
				} else {
					s = model.displayText();
				}
				break;
			default:
				s = model.displayText();
				break;
			}
		}
		this.setText(s);
	},
	_doPrepareElement: function (styles) {
		this._super(styles);
		this.setContentFit(styles.contentFit());
		this.setIconIndex(styles.iconIndex());
		this.setIconLocation(styles.iconLocation());
		this.setIconAlignment(styles.iconAlignment());
		this.setIconOffset(styles.iconOffset());
		this.setIconPadding(styles.iconPadding());
		var renderer = null;
		var rendererId = styles.renderer();
		if (rendererId) {
			renderer = this.grid().dataCellRenderers().getRenderer(rendererId);
		}
		if (!renderer) {
			renderer = this._index.column().rendererObj();
		}
		this.setRenderer(renderer);
	},
	_doUpdateContent: function (model) {
		this._super(model);
        var col = this._dataColumn;
        this._cellStyles = model._cellStyles;
		this.setInnerIndex(-1);
		this.setBlankState(model.blankState());
		if (col) {
            var w = this._grid.$_editOptionsWritable;
            if (w) {
                if (this._cellStyles) {
                    w = this._cellStyles.calcWritable(col.isEditable(), col.isReadOnly());
                } else {
                    w = col.isWritable() &&
                    (this._grid.$_fixedRowCount < 1 || this._grid.$_fixedRowEditable || this._index.itemIndex() >= this._grid.$_fixedRowCount);
                }
            }
            this.setWritable(w);
			this.setButton(col.button());
			this.setButtonVisibility(col.buttonVisibility());
			this.setEditButtonVisibility(col.editButtonVisibility());
		} else {
            this.setWritable(false);
        }
	},
	_doMeasure: function(grid, hintWidth, hintHeight) {
		var sz = this.renderer().measure(grid, this, hintWidth, hintHeight);
		sz.width += this._borderLeft ? this._borderLeft.width() : 0;
		sz.width += this._borderRight ? this._borderRight.width() : 0;
		return sz;
	},
	_doMeasureHeight: function (grid, hintWidth, maxHeight) {
		var sz = this.renderer().measureHeight(grid, this, hintWidth, maxHeight);
        sz.height += this._borderTop ? this._borderTop.width() : 0;
        sz.height += this._borderBottom ? this._borderBottom.width() : 0;
        return sz;
    },
	_doRender: function (g, rc) {
		g.drawRectI(SolidBrush.WHITE, null, rc);
		var fill = this._background;
		if (fill) {
			g.drawRectI(fill, null, rc);
		}
		var r = this._getRenderRect(rc);
		this._leftButtonsWidth = r.height > DataCellElement.EXPANDER_SIZE*3 ? 0 : this.$_leftButtonsWidth();
		this._buttonWidth = this.$_buttonWidth();
		this._editWidth = this.$_editButtonWidth();
		this._errorWidth = this.$_errorWidth();
		var hasButton = this._buttonWidth > 0 || this._editWidth > 0 || this._errorWidth > 0;
		if (this._renderer && (this._blankState == BlankState.NONE || this._blankState == BlankState.HEAD)) {
			if (hasButton || this._leftButtonsWidth > 0) {
				r.leftBy(this._leftButtonsWidth);
				r.rightBy(-this._buttonWidth - this._editWidth - this._errorWidth);
				g.save();
				g.clipRect(r);
				this._renderer.applyDynamicStyles(this);
				this._renderer.render(this, g, r);
				g.restore();
				r.rightBy(this._buttonWidth + this._editWidth + this._errorWidth);
				r.leftBy(-this._leftButtonsWidth);
			} else {
				this._renderer.applyDynamicStyles(this);
				this._renderer.render(this, g, r);
			}
		}
		if (hasButton) {
			var br = r.clone();
			var buttonVisibility = this._dataColumn && this._dataColumn._editButtonVisibility;
			if ((this._innerIndex >= 0 || buttonVisibility == ButtonVisibility.ROWFOCUSED) && this._mergeRoom) {
				var grid = this.grid();
				var cr;
				if ( buttonVisibility === ButtonVisibility.ROWFOCUSED && grid._focusedIndex) {
					cr = grid.layoutManager().getItemRect(grid._focusedIndex.itemIndex() - grid.topIndex());
				} else if (this._innerIndex >= 0){
					cr = grid.layoutManager().getItemRect(this._mergeRoom.headItem() + this._innerIndex - grid.topIndex());
				}
				if (cr) {
					br.y = cr.y - this.topBy(grid, 0);
					br.height = cr.height;
				}
			}
			if (this._buttonWidth > 0) {
				br.setLeft(br.right() - this._buttonWidth);
				this.$_drawButton(g, br);
			}
			if (this._editWidth > 0) {
				br.set(r.x, br.y, r.width, br.height);
				br.rightBy(-this._buttonWidth);
				br.setLeft(br.right() - this._editWidth);
				this.$_drawEditorButton(g, br);
			}
			if (this._errorWidth > 0) {
				br.set(r.x, br.y, r.width, br.height);
				br.rightBy(-this._buttonWidth - this._editWidth);
				br.setLeft(br.right() - this._errorWidth);
				this.$_drawError(g, br);
			}
		}
		this._drawBordersWithBlank(g, rc, this._blankState);
	},
	_doRenderHtml: function (rc) {
		var fill = this._background;
		this._css.clip = Dom.getClipRect(rc);
		_norgba ? this.$_setCssFill(fill) : (this._css.background = fill ? fill.css() : null);
		var r = this._getRenderRect(rc);
		this._leftButtonsWidth = this.$_leftButtonsWidth();
		this._buttonWidth = this.$_buttonWidth();
		this._editWidth = this.$_editButtonWidth();
		this._errorWidth = this.$_errorWidth();
		var hasButton = this._buttonWidth > 0 || this._editWidth > 0 || this._errorWidth > 0;
		if (this._renderer && (this._blankState == BlankState.NONE || this._blankState == BlankState.HEAD)) {
			if (hasButton || this._leftButtonsWidth > 0) {
				r.leftBy(this._leftButtonsWidth);
				r.rightBy(-this._buttonWidth - this._editWidth - this._errorWidth);
				/*
				g.save();
				g.clipRect(r);
				this._renderer.applyDynamicStyles(this);
				this._renderer.render(this, g, r);
				g.restore();
				*/
				r.rightBy(this._buttonWidth + this._editWidth + this._errorWidth);
				r.leftBy(-this._leftButtonsWidth);
			} else {
				this._renderer.applyDynamicStyles(this);
				this._renderer.renderHtml(this, r);
			}
		}
		/*
		if (hasButton) {
			var br = r.clone();
			if (this._buttonWidth > 0) {
				br.setLeft(br.right() - this._buttonWidth);
				this.$_drawButton(g, br);
			}
			if (this._editWidth > 0) {
				br.set(r.x, r.y, r.width, r.height);
				br.rightBy(-this._buttonWidth);
				br.setLeft(br.right() - this._editWidth);
				this.$_drawEditorButton(g, br);
			}
			if (this._errorWidth > 0) {
				br.set(r.x, r.y, r.width, r.height);
				br.rightBy(-this._buttonWidth - this._editWidth);
				br.setLeft(br.right() - this._errorWidth);
				this.$_drawError(g, br);
			}
		}
		*/
		this._drawHtmlBorders();
	},
	$_leftButtonsWidth: function () {
		return this._expandHandle ? 16 : 0;
	},
    _getButtonVisible: function (visibility) {
        var vis;
        switch (visibility) {
            case ButtonVisibility.ALWAYS:
                vis = true;
                break;
            case ButtonVisibility.HIDDEN:
                vis = false;
                break;
            case ButtonVisibility.VISIBLE:
                vis = this._focused;
                break;
            case ButtonVisibility.ROWFOCUSED:
           		vis = this._grid && this._grid.focusedIndex() && this._grid.focusedIndex()._itemIndex == this._index._itemIndex;
            	break;
            case ButtonVisibility.DEFAULT:
            default:
                vis = this._focused || this._mouseEntered;
                break;
        }
        return vis;
    },
	$_resetButtonVisible: function () {
		var col = this._dataColumn;
		if (col) {
			this.setButton(col.button());
			this.setButtonVisibility(col.buttonVisibility());
			this.setEditButtonVisibility(col.editButtonVisibility());
		}
	},
	$_editButtonWidth: function () {
		var w = 0;
        if (this._writable) {
        	var grid = this.grid();
            var column = this._dataColumn;
            if (column) {
                if (grid._delegate.hasEditorButton(this._index)) {
                	var editorListing = false;
                	if (CellIndex.areEquals(grid.focusedIndex(), this._index)) {
	                	var editor = grid.delegate().getCellEditor(this._index);
	                	editorListing = editor ? editor.isListing() : false;
                	}

                    if (editorListing || this._getButtonVisible(this._editButtonVisibility)) {
                        var renderer = grid._delegate.getCellEditButtonRenderer(this._index);
                        if (renderer) {
                            w = renderer.measure(this._index, 0, this.height()).width;
                        }
                    }
                }
            }
        }
		return w;
	},
	$_drawEditorButton: function (g, r) {
		var renderer = this._grid._delegate.getCellEditButtonRenderer(this._index);
		renderer.render(this._index, g, r, this._editButtonHovered, this._editButtonPressed, this._focused);
	},
	$_buttonWidth: function () {
        var w = 0;
		var focused;
		var index;
		var renderer;
		var grid = this.grid();
		if (this.button() != CellButton.NONE) {
			focused = this.isFocused();
			index = this.index();
			var focusIndex = grid.focusedIndex();
			if (this._innerIndex > 0) {
				focusIndex = focusIndex.clone();
				focusIndex.incRow(-this._innerIndex);
			}
			var equals = CellIndex.areEquals(focusIndex, index);
			if (focused) {
				if (!equals)
					this._focused = false;
			} else if (equals) {
				this._focused = true;
			}
            if (this._getButtonVisible(this._buttonVisibility)) {
				renderer = grid.delegate().getCellButtonRenderer(index);
				if (renderer) {
					w = renderer.measure(index, 0, this.height()).width;
				}
			}
		}
		return w;
	},
	getButtonWidth: function () {
		if (this.button() != CellButton.NONE) {
			var index = this.index();
			var renderer = this.grid().delegate().getCellButtonRenderer(index);
			if (renderer) {
				return renderer.measure(index, 0, this.height()).width;
			}
		}
		return 0;
	},
	$_drawButton: function (g, r) {
		var renderer = this.grid().delegate().getCellButtonRenderer(this.index());
		renderer.render(this.index(), g, r, this._buttonHovered, this._buttonPressed, this._focused, this._buttonIndex);
		this._buttonIndex = undefined;
	},
	$_errorWidth: function () {
		if (this._error) {
			var icon = DataCellElement.getErrorIcon(this.grid(), this._errorLevel);
			return icon ? icon.width + 4 : 0;
		}
		return 0;
	},
	$_drawError: function (g, r) {
		var w, h;
		var img = DataCellElement.getErrorIcon(this.grid(), this._errorLevel);
		if (img && (w = img.width) > 0 && (h = img.height) > 0) {
			var x = _int(r.x + (r.width - w) / 2);
			var y = _int(r.y + (r.height - h) / 2);
			g.drawImage(img, x, y, w, h);
		}
	}
}, {
}, function (f) {
	var icons = {};
	f.getErrorIcon = function (grid, level) {
		var icon = icons[level];
		if (!icon) {
			icon = grid.getImage($$_rootContext + $$_assets + "error_" + level + ".png");
			if (icon) {
				icons[level] = icon;
			}
		}
		return icon;
	};
});
DataCellElement.EXPANDER_SIZE = 12;

var DataGroupCellElement = defineClass("DataGroupCellElement", GroupCellElement, {
	init: function(dom) {
		this._super(dom, "dataGroupCellView");
	},
	layoutTreeContent: function (lm) {
		this._layoutTreeCells(lm);
	},
	_prepareCells: function (lm) {
		this.$_createCells(this.group());
	},
	_layoutCells: function (lm) {
		var width = this._width;
		var height = this._height;
		var group = this.group();
		var cnt = group.visibleCount();
		var i, w, h, column, view, x, y;
		if (group.isVertical()) {
			y = 0;
			for (i = 0; i < cnt; i++) {
				column = group.getVisibleItem(i);
				view = this._getCell(column);
				h = this.grid().getDataLevel() == 1 ? height : column.measuredHeight(); // int 이어야 한다.
				column._layoutRect.set(0, y, width, h);
				view.setBounds(0, y, width, h);
				y += h;
				if (view instanceof DataGroupCellElement) { 
					view._layoutCells(lm);
				}
			}
		}  else {
			x = 0;
			h = height;
			for (i = 0; i < cnt; i++) {
				column = group.getVisibleItem(i);
				view = this._getCell(column);
				if (i == cnt - 1) {
					w = width - x;
				} else {
					w = column.displayWidth(); // int 이어야 한다.
				}
				column._layoutRect.set(x, 0, w, h);
				view.setBounds(x, 0, w, h);
				x += w;
				if (view instanceof DataGroupCellElement) {
					view._layoutCells(lm);
				}
			}
		}
	},
	_layoutTreeCells: function (lm) {
		var width = this._width;
		var height = this._height;
		var group = this.group();
		var cnt = group.visibleCount();
		var i, w, h, column, view, x, y;
		if (group.isVertical()) {
			y = 0;
			for (i = 0; i < cnt; i++) {
				column = group.getVisibleItem(i);
				view = this._getCell(column);
				h = column.measuredHeight();
				column._layoutRect.set(0, y, width, h);
				view.setBounds(0, y, width, h);
				y += h;
				if (view instanceof DataGroupCellElement) {
					view._layoutTreeCells(lm);
				}
			}
		}  else {
			x = 0;
			h = height;
			for (i = cnt - 1; i >= 0; i--) {
				column = group.getVisibleItem(i);
				view = this._getCell(column);
				if (i == 0) {
					w = Math.max(0, width - x);
				} else {
					w = Math.min(width, column.displayWidth());
				}
				x += w;
				column._layoutRect.set(width - x, 0, w, h);
				view.setBounds(width - x, 0, w, h);
				if (view instanceof DataGroupCellElement) {
					view._layoutTreeCells(lm);
				}
			}
		}
	},
	$_createCells: function (group) {
		this.hideAll();
		var i;
		var cnt;
		var column;
		var view;
		var model;
		var grid = this.grid();
		var body = grid.body();
		var index = this.index().I();
		for (i = 0, cnt = group.visibleCount(); i < cnt; i++) {
			column = group.getVisibleItem(i);
			view = this._getCell(column);
			if (!view) {
				if (column instanceof DataColumn) {
					view = new DataCellElement(this._dom);
				} else if (column instanceof SeriesColumn) {
					view = new SeriesCellElement(this._dom);
				} else { //if (column is ColumnGroup) 
					view = new DataGroupCellElement(this._dom);
				}
				this.$_setCell(column, view);
				this.addElement(view);
			}
			view.setVisible(true);
			model = body.getCell(CellIndex.temp(grid, index, column));
			view.updateCell(model);
			view.setMouseEntered(false);
			if (view instanceof DataCellElement) {
				view.setFocused(false);
			}
			if (column instanceof ValueColumn) {
			} else if (column instanceof ColumnGroup) {
				view.$_createCells(column);
			}
		}
	}
    /*
	$_checkResourceColumn: function (column, list) {
		var i;
		var view;
		var cnt = this.childCount();
		for (i = 0; i < cnt; i++) {
			view = this.getChild(i);
			if (view instanceof DataCellElement) {
				if (view.index().column() === column) {
					list.push(view);
				}
			} else if (view instanceof DataGroupCellElement) {
				view.$_checkResourceColumn(column, list);
			}
		}
	},
	$_checkResourceUse: function (url, list) {
		var i;
		var view;
		var cnt = this.childCount();
		for (i = 0; i < cnt; i++) {
			view = this.getChild(i);
			if (view instanceof DataCellElement) {
				var renderer = view.renderer();
				if (renderer.useResource(view, url)) {
					list.push(view);
				}
			} else if (view instanceof DataGroupCellElement) {
				view.$_checkResourceUse(url, list);
			} 
		}
	}
	*/
});
var SeriesCellElement = defineClass("SeriesCellElement", DataCellElement, {
	init : function(dom, name) {
		this._super(dom, name || "seriesCellView");
		this._values = null;
	},
	_doPrepareValue: function (model) {
		this._super(model);
	},
	value: function () {
		return this._values;
	},
	setValue: function (v) {
		if (!equalArrays(v, this._values)) {
			this._values = v;
			this.invalidate();
		}
	}
});
