var /* @abstract */ HandleElement = defineClass("HandleElement", VisualElement, {
	init: function (dom, owner, name) {
		this._super(dom, name);
		this._owner = owner;
	},
	clickable: false,
	owner: function () { return this._owner; },
	propertyChanged: function (prop, value) {
		this.invalidate();
	},
	hoverChanged: function (lm) {
		this.invalidate();
	}
});
var /* @abstract */ CellHandle = defineClass("CellHandle", HandleElement, {
	init: function (dom, cellView, name) {
		this._super(dom, cellView, name);
	},
	cellView: function () {
		return this._owner;
	}
});

var /* @abstract */ HeaderCellHandle = defineClass("HeaderCellHandle", CellHandle, {
	init: function (dom, cellView, name) {
		this._super(dom, cellView, name);
	},
	destroy: function() {
		this._destroying = true;
		this._options = null;
		this._super();
	},
});

var SORT_ICON_WIDTH = 8;
var SORT_ORDER_WIDTH = 12;
var SORT_ICON_HEIGHT = 9;
var HeaderSortHandle = defineClass("HeaderSortHandle", HeaderCellHandle, {
	init: function(grid, dom, cellView) {
		this._super(dom, cellView, "sortHandle");
		this.setMouseEnabled(false);
		this.setClickable(false);
		this._grid = grid;

		this._options = grid.sortingOptions();
		if (this._options._handleFill)
			this._fill = this._options._handleFill;
		if (this._options._handleNoneFill)
			this._noneFill = this._options._handleNoneFill;
		if (this._options._hoveredHandleFill)
			this._hoveredFill = this._options._hoveredHandleFill;
		if (this._options._hoveredHandleNoneFill)
			this._hoveredNoneFill = this._options._hoveredHandleNoneFill;
		if (this._options._handleBorderPen)
			this._border = this._options._handleBorderPen;
	},
	sortOrder: -1,
	sortDir: SortDirection.ASCENDING,
	fill: SolidBrush.GRAY,
	noneFill: SolidBrush.EMPTY,
	hoveredFill: SolidBrush.GRAY,
	hoveredNoneFill: SolidBrush.EMPTY,
	border: SolidPen.GRAY,
	_doDraw: function (g) {
		var options = this._options;
		if (options.visibility == HandleVisibility.HOVERED && !this._owner.isHovered()) {
			return;
		}
		var r = this.getClientRect();
        var sortOrder = this.sortOrder();
        if (options.isImageHandle())
        	this.$_drawHandleImage(g, r, sortOrder);
        else 
        	this.$_drawHandle(g, r, sortOrder);

		if (options.isShowSortOrder() && sortOrder >= 0) {
			var st = options._sortOrderStyles;
			r.setLeft(SORT_ORDER_WIDTH);
			r.y = (r.height - (SORT_ICON_HEIGHT + 6)) / 2;
			r.height = SORT_ICON_HEIGHT + 4;
			var font = (st && st.font()) || this._owner.font();
			var foreground = (st && st.foreground()) || this._owner.foreground();
			var align = st.textAlignment();
			var line = st.lineAlignment();
			align = !align ? "left" : align == Alignment.FAR ? "right" : align == Alignment.NEAR ? "left" : "center";
			line = !line ? "top" : line == Alignment.FAR ? "bottom" : line == Alignment.NEAR ? "top" : "middle";
			g.drawTextRect(font, foreground, (sortOrder+1).toString(), r, align, line);	
		}     
	},
	$_drawHandle: function (g, r, sortOrder) {
		var orderWidth = this._options._showSortOrder ? SORT_ORDER_WIDTH : 0;
        var	x = (r.width - orderWidth) / 2;
        var	y = (r.height - SORT_ICON_HEIGHT) / 2;
        var	pts, fill;
		if (sortOrder < 0 || this.sortDir() == SortDirection.ASCENDING) {
			pts = [
				x, y,
				x - SORT_ICON_WIDTH / 2, y + SORT_ICON_HEIGHT - 1,
				x + SORT_ICON_WIDTH/ 2, y + SORT_ICON_HEIGHT - 1,
				x, y
			];
		} else{
			pts = [
				x - SORT_ICON_WIDTH / 2, y,
				x + SORT_ICON_WIDTH / 2, y,
				x, y + SORT_ICON_HEIGHT - 1,
				x - SORT_ICON_WIDTH / 2, y
			];
		}
		if (this.isHovered()) {
			fill = sortOrder < 0 ? this._hoveredNoneFill : this._hoveredFill;
		} else {
			fill = sortOrder < 0 ? this._noneFill : this._fill;
		}
		g.drawPolygonArray(fill, this._border, pts);
	},
	$_drawHandleImage: function (g, r, sortOrder) {
		var sortDir = this.sortDir();
		var hovered = this.isHovered();
		var images = this._options.handleImages();
		var url;
		var orderWidth = this._options._showSortOrder ? SORT_ORDER_WIDTH : 0;
		if (sortOrder < 0) {
			url = hovered ? images._hoveredNone : images._none;
		} else if ( sortDir == SortDirection.ASCENDING) {
			url = hovered ? images._hoveredAscending : images._ascending;
		} else {
			url = hovered ? images._hoveredDescending : images._descending;
		}
		if (url) {
			var img = this._grid.getImage(url);

        	var w = Math.min(img.width, r.width-orderWidth);
        	var h = Math.min(img.height, r.height)
            g.drawImage(img, (r.width-orderWidth-w)/2 + orderWidth, (r.height-h)/2, w, h);	
	    }
	},
	isHovered: function () {
		return this._super() || (this._owner && this._owner.isHovered());
	}
});
var FILTER_ICON_WIDTH = 10;
var FILTER_ICON_HEIGHT = 12;
var FILTER_ICON_BAR = 4;
var HeaderFilterHandle = defineClass("HeaderFilterHandle", HeaderCellHandle, {
	init: function(grid, dom, cellView) {
		this._super(dom, cellView, "filterHandle");
		this.setClickable(true);
		this._grid = grid;

		this._options = grid.filteringOptions();
		if (this._options._handleFill)
			this._fill = this._options._handleFill;
		if (this._options._handleNoneFill)
			this._noneFill = this._options._handleNoneFill;
		if (this._options._hoveredHandleFill)
			this._hoveredFill = this._options._hoveredHandleFill;
		if (this._options._hoveredHandleNoneFill)
			this._hoveredNoneFill = this._options._hoveredHandleNoneFill;
		if (this._options._handleBorderPen)
			this._border = this._options._handleBorderPen;
	},
	fill: SolidBrush.GRAY,
	noneFill: SolidBrush.EMPTY,
	hoveredFill: SolidBrush.GRAY,
	hoveredNoneFill: SolidBrush.EMPTY,
	border: SolidPen.GRAY,
	isClickable: function () {
		return true;
	},
	_doDraw: function(g) {
		
		var cellView = this.cellView();
		if (!cellView) {
			return;
		}
		var column = cellView.index().dataColumn();
		if (!column) {
			return;
		}
		if (this._options.isImageHandle())
			this.$_drawHandleImage(g, this.clientRect(), column);
		else
			this.$_drawHandle2(g, this.clientRect(), column);
	},
	$_drawHandle2: function (g, r, column) {
		var x = r.width / 2;
		var y = (r.height - FILTER_ICON_HEIGHT) / 2;
		var pts = [
			x - FILTER_ICON_WIDTH / 2, y,
			x + FILTER_ICON_WIDTH / 2, y,
			x, y + FILTER_ICON_HEIGHT - FILTER_ICON_BAR + 2,
			x - FILTER_ICON_WIDTH / 2, y
		];
		var fill;
		var filtered = column.isFiltered();
		if (this.isHovered()) {
			fill = filtered ? this._hoveredFill : this._hoveredNoneFill;
		} else {
			fill = filtered ? this._fill : this._noneFill;
		}
		g.drawPolygonArray(fill, this._border, pts);
		g.drawLineI(this._border, x - 1, y + FILTER_ICON_HEIGHT - FILTER_ICON_BAR - 1, x - 1, y + FILTER_ICON_HEIGHT + 1);
		g.drawLineI(this._border, x, y + FILTER_ICON_HEIGHT - FILTER_ICON_BAR - 1, x, y + FILTER_ICON_HEIGHT + 1);
	},
	$_drawHandleImage: function (g, r, column) {
		var filtered = column.isFiltered();
		var hovered = this.isHovered();
		var images = this._options.handleImages();
		var url;

		if (filtered) {
			url = hovered ? images._hoveredFill : images._fill;
		} else {
			url = hovered ? images._hoveredNone : images._none;
		}

		var img = this._grid.getImage(url);
		if (img) {
        	var w = Math.min(img.width, r.width);
        	var h = Math.min(img.height, r.height)
            g.drawImage(img, (r.width-w)/2, (r.height-h)/2, w, h);	
        }	
	}, 
	setHovered: function (value) {
		this._super(value);
		//if (value && this._owner)
		//	this._owner.setHovered(value);
	}
});
var HEADER_CHECKBOX_SIZE = 12;
var HeaderCheckHandle = defineClass("HeaderCheckHandle", HeaderCellHandle, {
    init: function(grid, dom, cellView) {
        this._super(dom, cellView, "checkHandle");
        this.setClickable(true);
		this._grid = grid;

		this._options = grid.columnHeaderOptions();
		if (this._options._checkFill)
			this._fill = this._options._checkFill;
		if (this._options._checkNoneFill)
			this._noneFill = this._options._checkNoneFill;
		if (this._options._hoveredCheckFill)
			this._hoveredFill = this._options._hoveredCheckFill;
		if (this._options._hoveredCheckNoneFill)
			this._hoveredNoneFill = this._options._hoveredCheckNoneFill;
		if (this._options._checkBorderPen)
			this._border = this._options._checkBorderPen;
    },
    checked: false,
	fill: SolidBrush.DKGRAY,
	noneFill: SolidBrush.EMPTY,
	hoveredFill: SolidBrush.DKGRAY,
	hoveredNoneFill: SolidBrush.EMPTY,
	border: SolidPen.GRAY,
    _doDraw: function (g) {
        var r = this.getClientRect();

        if (this._options.isImageCheckHandle())
        	this.$_drawImageCheck(g, r);
        else 
        	this.$_drawCheck(g, r);
    },
    $_drawCheck: function (g, r) {
        var fill = SolidBrush.WHITE;
        if (fill) {
            g.drawRectI(fill, this._border, r);
        }
        var sz = HEADER_CHECKBOX_SIZE;
        g.drawBoundsI(null, this._border, r.x, r.y, sz, sz);

        r.y+=2;

        var fill;
        if (this.isHovered()) {
        	fill = this.isChecked() ? this._hoveredFill : this._hoveredNoneFill;
        } else {
        	fill = this.isChecked() ? this._fill : this._noneFill;
        }

        $$_drawCheckMark(g, fill, r, sz - 1);
    },
    $_drawImageCheck: function(g, r) {
		var checked = this.isChecked();
		var hovered = this.isHovered();
		var images = this._options.checkImages();
		var url;

		if (checked) {
			url = hovered ? images._hoveredFill : images._fill;
		} else {
			url = hovered ? images._hoveredNone : images._none;
		}
		var img = this._grid.getImage(url);
		if (img) {
         	var w = Math.min(img.width, r.width);
        	var h = Math.min(img.height, r.height)
            g.drawImage(img, (r.width-w)/2, (r.height-h)/2, w, h);	
		}
    },
	setHovered: function (value) {
		this._super(value);
		//if (value && this._owner)
			//this._owner.setHovered(value);
	}
});
var HeaderImageHandle = defineClass("HeaderImageHandle", HeaderCellHandle, {
    init: function(dom, cellView) {
        this._super(dom, cellView, "imageHandle");
        this.setMouseEnabled(false);
        this.setClickable(false);
    },
    image: null,
    _doDraw: function (g) {
        var img = this._image;
        if (img && img.width > 0 && img.height > 0) {
            g.drawImage(img, 0, 0, img.width, img.height);
        }
    }
});
var DataCellExpandHandle = defineClass("DataCellExpandHandle", CellHandle, {
	init: function(dom, cellView) {
		this._super(dom, cellView, "dataCellExpandHandle");
	},
	expanded: false,
	background: null,
	group: function () {
		var view = _cast(this.cellView(), MergedDataCellElement);
		return view ? view.mergeRoom().group() : null;
	},
	isClickable: function() {
		return true;
	},
	_doDraw: function (g) {
		var r = this.clientRect();
		var fill = this._background || SolidBrush.DKGRAY;
		if (this.isExpanded()) {
			$$_drawMinusBox(g, r, 9, fill, SolidBrush.WHITE);
		} else {
			$$_drawPlusBox(g, r, 9, fill, SolidBrush.WHITE);
		}
	}
});