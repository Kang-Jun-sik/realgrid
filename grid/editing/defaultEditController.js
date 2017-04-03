var DefaultEditController = defineClass("DefaultEditController", null, {
	init: function (grid) {
		this._super();
		this._grid = grid;
		this._editIndex = new CellIndex();
		this._editors = [];
		this._starting = false;
		this._editRow = -1;
		this._editor = null;
		this._editState = UNDEFINED;
		this._modified = false;
		this._commiting = false;
		this._canceling = false;
		this._resetting = false;
		this._dirty = false;
		this._editable = false;
		this._readOnly = false;
        this.$_editFocused = false;
		this._defaultEditor = grid.delegate().createDefaultCellEditor();
		this._defaultEditor.setController(this);
		this._internalHideEditor(this._defaultEditor);
		this._showEditorTimer = null;
	},
	destroy: function() {
		this._destroying = true;
		this._grid = null;
		this._defaultEditor = null;
		this._editor = null;
		this._editors = null;// 사용하는지 확인 필요.
		this._super();
	},
	editIndex: function () {
		return this._editIndex.clone();
	},
	isEditing: function () {
		return this._editor && this._editor.isEditing();
	},
	setFocus: function (force) {
		this.$_focusToEditor(force);
	},
	resetEditor: function (resetValue) {
		if (this.isEditing()) {
			if (!this._grid.isValid(this._editIndex)) {
				this.hideEditor();
			} else {
				this._resetBounds(false);
				if (resetValue && this.isEditing()) {
					var v = this.getData(this._editIndex);
					this._resetting = true;
					try {
						this._editor.setEditValue(v);
						this._editor.beginEdit(false, true);
					} finally {
						this._resetting = false;
					}
				}
			}
		}
	},
	reprepareEditor: function (index) {
		if (CellIndex.areEquals(index, this._editIndex)) {
			if (this.isEditing()) {
				this._editor.selectAll();
			} else {
				this._prepareEditor(index);
			}
		}
	},
	invalidateEditor: function () {
		this._dirty = true;
	},
	closeList: function (accept) {
		if (this._editor) {
			this._editor.closeList(accept);
		}
	},
	focusedIndexChanging: function () {
		if (this.isEditing()) {
			this.closeList(true);
			return this.commitEditor();
		}
		return true;
	},
	focusedIndexChanged: function (oldIndex, newIndex) {
		this._hideEditor();
		if (this._grid.isValid(newIndex)) {
			this._prepareEditor(newIndex);
		}
	},
	dataColumnChanged: function (column) {
		if (column && this._editor && this._editIndex && this._editIndex.dataColumn() === column) {
			var readOnly = !column.isEditable() || column.isReadOnly();
			if (readOnly != (!this._editable || this._readOnly)) {
				if (this.isEditing()) {
					this._editor.setReadOnly(readOnly);
				} else {
					this._prepareEditor(this._editIndex);
				}
			}
		}
	},
	showEditor: function (index, dropdown) {
		var grid = this._grid;
		if (grid && grid.isValid(index)) {
            if (this._editor && this._editor.isEditing()) {
                grid.makeCellVisible(index);
                return true;
            }
			var canShow = /*(grid.isItemEditing(item) || grid.canUpdate(item, index.dataField())) &&*/
							/* grid.canEdit(index) &&*/ this._editor && !this._editor.isEditing();
			if (canShow) {
				!this._showEditorTimer && this._prepareEditor(index);
				if (this._editor) {
					if (!this._editor.isTextReadOnly || !this._editor.isTextReadOnly())
						this._editor.setReadOnly(this._readOnly);
				}
				grid.makeCellVisible(index);
				return this._activateEditor(false, true, dropdown);
			}
		}
        return false;
	},
    caretToLast: function () {
        this._editor && this._editor.caretToLast();
    },
	hideEditor: function () {
		if (this.isEditing()) {
			this._modified = false;
			this._resetting = true;
			try {
				this._internalHideEditor(this._editor);
				this._prepareEditor(this._editIndex);
			} finally {
				this._resetting = false;
			}
		}
	},
	commitEditor: function (hideEditor, throwError) {
		if (!this.isEditing() || this._commiting) {
			return true;
		}
		var grid = this._grid;
		var editOptions = grid.editOptions();
		var index = this._editIndex;
		var column = index.dataColumn();
		var commit = true;
        var v, err;
        var editor = this._editor;
        var mask = editor && editor._mask;
		this._commiting = true;
		try {
			editor.commit();
			if (this._modified || editor.isEdited()) {
				if (column && column.dataIndex() >= 0) {
					try {
						try {
							v = mask && !mask.checkValid() ? CellEditor.InvalidFormat : editor.getEditValue();
							if (v === CellEditor.InvalidFormat) {
								commit = false;
								editOptions.isShowInvalidFormatMessage() && mask && mask.isShowInvalidFormatMessage() && alert((mask && mask.invalidFormatMessage()) || editOptions.invalidFormatMessage());
							} else if (v === CellEditor.Unselected) {
								commit = false;
							} else {
                                var editResult = { text: editor.getEditText(), value: v };
                                this._grid.getEditValue(editor, index, editResult);
                                v = editResult.value;
                                commit = this._grid.editorCommit(editor, index, this._getData(index), v);
                            }
						} catch (e) {
							// err = e;
							_trace(e.message || e);
							commit = false;
						}
                        if (!this._grid.isItemEditing()) {
                            this._modified = false;
                        } else if (commit) {
							this._setData(index, v);
							if (this._grid.isItemEditing(index.item())) {
								v = this._getData(index);
								this._grid.validateCellCommit(index, v);
							}
							this._modified = false;
						}
					} catch (e) {
						err = e;
						commit = false;
					}
				}
			}
			this._resetting = true;
			if (hideEditor) {
				try {
					this._internalHideEditor(editor);
					this._prepareEditor(index);
				} finally {
					this._resetting = false;
				}
			}
			if (err) {
				_trace(err.message || err);
				if (throwError) {
					throw err;
				} else {
					alert(err.message || err);
				}
			}
		} finally {
			this._commiting = false;
		}
		return commit;
	},
	cancelEditor: function (hideEditor) {
		if (!this.isEditing()) {
			return;
		}
		this._canceling = true;
		try {
			try {
				this._modified = false;
				this._grid.editorCancel(this._editor, this._editIndex);
			} catch (err) {
				throw err;
			}
			this._resetting = true;
			try {
				this._internalHideEditor(this._editor);
				this._prepareEditor(this._editIndex);
			} finally {
				this._resetting = false;
			}
		} finally {
			this._canceling = false;
			this._grid.editorCanceled();
		}
	},
	fillSearchItems: function (column, searchKey, values, labels) {
		if (this.isEditing() && this._editIndex.column() === column && this._editor instanceof SearchCellEditor) {
			this._editor.fillItems(searchKey, values, labels);
		}
	},
	buttonClicked: function (index) {
		if (this._editor && CellIndex.areEquals(this._editIndex, index) && this._editor.hasButton()) {
			this._editor.buttonClicked(this._editIndex);
		}
	},
	$_focusToEditor: function (force) {
		if (force || this._grid.$_editFocused) {
			this._grid._container._setFocusAndScroll(this._editor || this._defaultEditor);
            if (!this.isEditing()) {
                this._editor && this._editor.selectAll();
            }
		}
	},
	$_focusToContainer: function () {
	},
	_internalHideEditor: function (editor) {
		this.closeList(false);
		editor.setVisible(false);
		editor.endEdit();
	},
	$_hideEdit: function (index, editor) {
		if (editor) {
			//editor.setReadOnly(this._readOnly = true);
			editor.setEditIndex(index);
			editor.setVisible(false);
			this.$_focusToEditor();
		}
	},
	$_getCellEditor: function (index) {
		var editor = this._grid.delegate().getCellEditor(index);
		if (editor) {
			editor.setController(this);
		}
		return editor;
	},
	_prepareEditor: function (index) {
		this._dirty = false;
		if (!this._grid.isValid(index)) {
			return;
		}
		this._hideEditor();
        this._editor = this.$_getCellEditor(index);
        if (!this._editor) {
            return;
        }
		this._editIndex.assign(index);
		this._editor.setReadOnly(false);
		var grid = this._grid;
		var options = grid.editOptions();
		var editorOpts = grid.editorOptions();
		var column = index.dataColumn();
		var item = index.item();
		var itemState = item.itemState();
		var row = ItemState.isInserting(itemState) ? -1 : index.dataRow();
		var style = grid.itemSource().getCellStyle(row, index.dataField());
		var fRowEditable = (grid.fixedOptions().isRowEditable() || index.itemIndex() >= grid.layoutManager().fixedItemCount()) && grid.canEdit(index);
		var editable = style ? style.calcWritable(fRowEditable) : fRowEditable;
       	editorOpts._titleExprStatement && this._editor.setEditorTitle(index);
		// if (!grid.fixedOptions().isRowEditable() && index.itemIndex() < grid.layoutManager().fixedItemCount()) {
        //     this.$_hideEdit(index, this._editor);
        //     return;
        // }
		// var column = index.dataColumn();
		// var item = index.item();
		// var itemState = item.itemState();
		// var row = ItemState.isInserting(itemState) ? -1 : index.dataRow();
		// var style = grid.itemSource().getCellStyle(row, index.dataField());
		// var editable = style ? style.isEditable() : undefined;
        // if (editable === undefined) {
        //     editable = grid.canEdit(index);
        // }
		if (!editable) {
			this.$_hideEdit(index, this._editor);
			return;
		}
		var readOnly = style ? style.isReadOnly() : undefined;
		if (readOnly === undefined) {
			readOnly = column.isReadOnly() || (!ItemState.isInserting(itemState) && !grid.canUpdate(item, index.dataField()));
		}
		this._editor.initOptions();
		column.editorOptions() && this._editor.applyOptions(column.editorOptions());
        var ds = item.dataSource();
        var field = ds ? ds.getField(index.dataField()) : null;
		this._readOnly = readOnly || options.isReadOnly() || !field || !field.isUpdatable() || !index.dataColumn() || field.dataType() == ValueType.OBJECT;
		//this._editor.setReadOnly(this._readOnly);
		this._editor.setEditIndex(index);
		this._editable = true;
		this._editor.clear();
		var v = this._getData(index);
        this._editor.setEditValue(v);
        this._editor.selectAll();
		if (options.isEditWhenFocused() && !this._editor.isEditing()) {
			if (this._showEditorTimer) {
				clearTimeout(this._showEditorTimer);
			} 
			if (!this._canceling) {
				this._showEditorTimer = setTimeout(function() {
					grid.showEditor();
					this._showEditorTimer = null;
				}.bind(this),100);
			}
		} else {
			this._editor.setVisible(false);
		}
		this.$_focusToEditor();
	},
	_applyCellFont: function () {
		var grid = this._grid;
		var options = grid.editorOptions();
		if (options.isApplyCellFont()) {
			var cell = grid.body().getCell(this._editIndex);
			var style = cell.styles();
			this._editor.setFontFamily(style.fontFamily());
			this._editor.setFontSize(style.fontSize()+"px");
		} 
	},
	_hideEditor: function () {
		if (this._editor) {
			try {
				this._editor.clear();
				this._editor.setVisible(false);
			} finally {
				this._editor.endEdit();
				this._editor = null;
                this._editable = false;
				this.$_focusToEditor();
			}
		}
	},
	_initEditor: function (bClear, bSelect, bDropdown) {
		if (this._dirty) {
			this._dirty = false;
			if (!this._starting) {
				this._prepareEditor(this._editIndex);
			}
		}
        var editor = this._editor;
		if (editor) {
			editor.endEdit();
			this._resetBounds();
			this._applyCellFont();
			editor.setVisible(true);
			editor.beginEdit(bClear, bSelect);
            bClear && editor.clear();
            bSelect && editor.selectAll();
            bDropdown && editor.dropDownList && editor.dropDownList();
            this.$_focusToEditor(true)
		}
	},
	_setEditAttribute: function(attrs) {
		var editor = this._editor;
		if (editor) {
			for (var attr in attrs) {
				if (attr === "callback") continue;
				editor._editor.setAttribute(attr, attrs[attr])
			}
			if (attrs.callback && typeof attrs.callback == "function") {
				attrs.callback();
			}
		}
	},
	_activateEditor: function (bClear, bSelect, bDropdown) {
        var grid = this._grid;
        var editor = this._editor;
        var index = this._editIndex;
        var attrs = {};
		if (this._editable && editor && !editor.isEditing() && grid.canShowEditor(index, attrs)) {
			this._initEditor(bClear, bSelect, bDropdown);
            this._modified = false;
			this._grid.editorActivated(this._editor);
			this._setEditAttribute(attrs);
            return true;
		}
        return false;
	},
	_resetBounds: function () {
		if (this._editor) {
			var r = this._grid.getEditBounds(this._editIndex);
			r.x--;
			r.y--;
			r.width++;
			r.height++;
            /**
             * ie에서 편집기가 그리드 크기 밖에 있는 상태에서,
             * 편집기가 새로 focus를 받으면 편집기를 표시하기 위해 canvas를 강제 스크롤 시키고 있다.
             * 편집기 너비/높이를 0으로 하면 그렇게 동작하지 않는다.
             */
            if (_isIE && r.right() > this._grid.width() + 3) {
                this._editor.setBounds(r.x + 10000, r.y, 0, 0);
            } else {
                this._editor.setBounds(r.x, r.y, r.width, r.height);
            }
			r = this._grid.getEditCellBounds(this._editIndex);
			this._editor.setCellBounds(r.x, r. y, r.width, r.height);
			if (r.x < 0) {
				this._resetFocused = true;
			}
		}
	},
	_getData: function (index) {
		var item = index.item();
		if (item) {
			var idx = index.column().dataIndex();
			if (idx >= 0) {
				return item.getData(idx);
			}
		}
		return undefined;
	},
	_setData: function (index, value) {
		var item = index.item();
		if (item) {
			var idx = index.column().dataIndex();
			if (idx >= 0) {
				return item.setData(idx, value);
			}
		}
	},
	_isEditKey : function (key) {
		return (key == 8) || //backspace
		    (key >= 46 && key <= 90)   ||  // delete, 0-9a-z
			(key >= 96 && key <= 111)  ||  // numberpad 0-9, *+-./
			(key >= 186 && key <= 222) ||  // special char
			(key == Keys.ENTER && this._grid.editOptions().isEnterToEdit())
	},
	onEditorStart: function (editor) {
		if (!editor.isVisible() && !this._commiting && !this._canceling) {
			return this._activateEditor(false, false);
		}
	},
	onEditorKeyDown: function (editor, keyCode, ctrl, shift, alt) {
		if (this._editor) {
			if ((!this._editor.isTextReadOnly || !this._editor.isTextReadOnly()) && !ctrl && !alt && this._isEditKey(keyCode)) {
				this._editor.setReadOnly(this._readOnly);
			} else if (keyCode == 229) {
				this._editor.setReadOnly(this._readOnly);
			}
		}
		return this._grid.activeTool().keyDown(keyCode, ctrl, shift, alt);
	},
	onEditorKeyUp: function (editor, keyCode, ctrl, shift, alt) {
		return this._grid.activeTool().keyUp(keyCode, ctrl, shift, alt);
	},
	onEditorKeyPress: function (editor, keyCode) {
		return this._grid.activeTool().keyPress(keyCode);
	},
	onEditorChange: function (editor) {
		if (!this._modified) {
			this._modified = true;
			this._grid._editorStarted(this._editor, this._editIndex);
		}
		if (this.isEditing()) {
			this._grid.makeCellVisible(this._editIndex);
			this._grid._editorChange(this._editor, this._editIndex, this._editor.getEditValue(false));//, this._editor.getEditText());
		}
	},
	onEditorSearch: function (editor, text) {
		this._grid._editorSearch(this._editor, this._editIndex, text);
	},
	onSearchCellButtonClick: function(editor, text) {
		return this._grid._searchCellButtonClick(this._editor, this._editIndex, text);
	},
    onEditorCommit: function (editor) {
        this.commitEditor(true);
    }
});