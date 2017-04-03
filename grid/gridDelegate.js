var GridDelegate = defineClass("GridDelegate", null, {
	init : function(grid) {
		this._super();
		this._grid = grid;
        this._dom = grid._dom;
		this._defaultEditor = null;
		this._defaultButtonRenderer = new DefaultCellButtonRenderer();
		this._defaultEditButtonRenderer = new EditButtonRenderer();
		this._cellEditors = {};
		this._selectionViews = [];
		this._rowViews = [];
		this._groupHeaderViews = [];
		this._groupFooterViews = [];
		this._mergedHeaderViews = [];
		this._mergedFooterViews = [];
		this._FooterHeadRenderer = new FooterHeadRenderer();
	},
	destroy: function() {
		this._destroying = true;
		for (var type in this._cellEditors) {
			this._cellEditors[type] && !this._cellEditors[type]._destroying && this._cellEditors[type].destroy && this._cellEditors[type].destroy();
			this._cellEditors[type] = null;
			delete this._cellEditors[type]
		}
		this._cellEditors = null;
		this._grid = null;
		this._cellEditors = null;
		this._selectionViews = null;
		this._rowViews = null;
		this._groupHeaderViews = null;
		this._groupFooterViews = null;
		this._mergedHeaderViews = null;
		this._mergedFooterViews = null;
		this._defaultEditor = null;
		this._super();
	},
	isFixed: function () { return this._fixed; },
	prepareResources: function () {
		this._defaultButtonRenderer.prepare(this._grid);
	},
	createRenderer: function (renderer) {
		var r = null;
		if (renderer) {
			var type, options = null;
			if (typeof renderer === "string") {
				type = renderer;
			} else {
				type = renderer.type || "text";
				options = renderer;
			}
			switch (type) {
			case "text":
				r = new TextCellRenderer();
				break;
			case "bar":
				r = new BarCellRenderer();
				break;
			case "check":
				r = new CheckCellRenderer();
				break;
			case "icon":
				r = new IconCellRenderer();
				break;
			case "shape":
				r = new ShapeCellRenderer();
				break;
			case "signal":
				r = new SignalBarCellRenderer();
				break;
			case "image":
				r = new ImageCellRenderer();
				break;
			case "link":
				r = new LinkCellRenderer();
				break;
            case "imageButton":
                r = new ImageButtonCellRenderer();
                break;
			case "code39":
				r = new Code39CellRenderer();
				break;
			case "code128":
				r = new Code128CellRenderer();
				break;
			case "sparkLine":
				r = new SparkLineRenderer();
				break;
			case "sparkColumn":
				r = new SparkColumnRenderer();
				break;
			case "sparkWinLoss":
				r = new SparkWinLossRenderer();
				break;
				break;
			case "actualTargetBullet":
				r = new ActualTargetBulletRenderer();
				break;
			case "actualTargetText":
				r = new ActualTargetTextRenderer();
				break;
			}
			if (r && options) {
				r.assign(options);
			}
		}
		return r;
	},
	borrowItemView: function (item, fixed, rightFixed) {
		var view = null;
		if (item instanceof GridRow) {
			view = this._rowViews.pop() || new RowElement(this._dom);
			view.setFixed(fixed);
			view.setRightFixed(rightFixed);
		} else if (item instanceof GroupItemImpl) {
			view = this._groupHeaderViews.pop() || new RowGroupHeaderElement(this._dom);
		} else if (item instanceof MergedGroupFooter) {
			view = this. _mergedFooterViews.pop() || new MergedFooterElement(this._dom);
			view.setFixed(fixed);
			view.setRightFixed(rightFixed);
		} else if (item instanceof GroupFooter) {
			view = this._groupFooterViews.pop() || new RowGroupFooterElement(this._dom);
			view.setFixed(fixed);
			view.setRightFixed(rightFixed);
		} else if (item instanceof MergedGroupHeader) {
			view = this._mergedHeaderViews.pop() || new MergedHeaderElement(this._dom);
			view.setFixed(fixed);
			view.setRightFixed(rightFixed);
		}
		return view;
	},
	returnItemView: function (view) {
		if (view instanceof RowElement && this._rowViews.indexOf(view) < 0) {
			this._rowViews.push(view);
		} else if (view instanceof RowGroupHeaderElement && this._groupHeaderViews.indexOf(view) < 0) {
			this._groupHeaderViews.push(view);
		} else if (view instanceof RowGroupFooterElement && this._groupFooterViews.indexOf(view) < 0) {
			this._groupFooterViews.push(view);
		} else if (view instanceof MergedHeaderElement && this._mergedHeaderViews.indexOf(view) < 0) {
			this._mergedHeaderViews.push(view);
		} else if (view instanceof MergedFooterElement && this._mergedFooterViews.indexOf(view) < 0) {
			this._mergedFooterViews.push(view);
		}
	},
	borrowSelectionView: function (item) {
		var view = this._selectionViews.pop() || (_isMobile() ? new MobileSelectionView(this._dom) : new SelectionView(this._dom));
		return view;
	},
	returnSelectionView: function (view) {
		if (view && this._selectionViews.indexOf(view) < 0) {
			this._selectionViews.push(view);
		}
	},
	getDefaultCellRenderer: function () {
		return TextCellRenderer.Default;
	},
	getCellButtonRenderer: function (index) {
		var column = index.column();
		return (column && column.button() == CellButton.IMAGE) ? column.getImageButtonRenderer() : this._defaultButtonRenderer;
	},
	createDefaultCellEditor: function () {
		var parent = this._grid._container._container;
		var editor = this._defaultEditor = new LineCellEditor(this._grid, parent);
        this._cellEditors[null] = editor;
        editor.setController(this._grid._editController);
        return editor;
	},
	getDefaultCellEditor: function () {
		if (!this._defaultEditor) {
			var parent = this._grid._container._container;
			this._defaultEditor = new LineCellEditor(this._grid, parent);
			this._cellEditors[null] = this._defaultEditor;
            this._defaultEditor.setController(this._grid._editController);
		}
		return this._defaultEditor;
	},
	getCellEditor: function (index) {
        var editorType = this.$_getCellEditorType(index);
        var parent = this._grid._container._container;
        var editor = this._cellEditors[editorType];
        if (!editor) {
            switch (editorType) {
                case "dropdown":
                    editor = new DropDownCellEditor(this._grid, parent);
                    break;
                case "multiline":
                    editor = new MultiLineCellEditor(this._grid, parent);
                    break;
                case "number":
                    editor = new NumberCellEditor(this._grid, parent);
                    break;
                case "date":
                    editor = new DateCellEditor(this._grid, parent);
                    break;
                case "search":
                    editor = new SearchCellEditor(this._grid, parent);
                    break;
                case "multicheck":
                	editor = new MultiCheckCellEditor(this._grid, parent);
                	break;
                case "line":
                default:
                    editor = this.getDefaultCellEditor();
                    break;
            }
            this._cellEditors[editorType] = editor;
            editor && editor.setController(this._grid._editController);
		}
		return editor;
	},
    hasEditorButton: function (index) {
        var editorType = this.$_getCellEditorType(index);
        if (editorType) {
            switch (editorType) {
                case "dropdown":
                case "date":
                case "search":
                case "multicheck":
                    return true;
                case "multiline":
                case "number":
                case "line":
                default:
                    return false;
            }
        }
        return false;
    },
	getCellEditButtonRenderer: function (index) {
		var renderer = null;
		var column = index.dataColumn();
		if (column) {
			var editorType = this.$_getCellEditorType(index);
			renderer = this._defaultEditButtonRenderer;
			if (editorType == "date") {
				renderer.setButtonType(EditButtonType.CALENDAR);
			} else {
				renderer.setButtonType(EditButtonType.COMBO);
			}
		}
		return renderer;
	},
	getFooterHeadRenderer: function () {
		return this._FooterHeadRenderer;
	},
    getRowHeaderSummaryRenderer: function () {
        return this._FooterHeadRenderer;
    },
    createGridEventHandler: function () {
        return null;
    },
    $_getCellEditorType: function (index) {
        var column = index.dataColumn();
        if (column) {
            var s = column.editor() ? column.editor().toLowerCase() : null;
            return s;
        }
        return null;
    }
});