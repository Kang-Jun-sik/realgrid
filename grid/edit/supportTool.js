var GridTool = defineClass("GridTool", VisualTool, {
	init: function (owner, name) {
		this._super(owner, name);
		this._grid = owner.gridView();
		this._focusView = new FocusView(this.grid()._dom, this._grid.displayOptions());
		this._rowFocusView = new RowFocusView(this.grid()._dom, this._grid.displayOptions());
		this._innerFocusView = null;
	},
    focused: null,
	grid: function () { return this._grid; },
	focused_: function () {
		return this._grid.focusedIndex();
	},
	setFocused: function (value, select) {
		if (this._grid.isValid(value)) {
			var grid = this._grid;
			var item = grid.getItem(value.itemIndex());
			if (!grid.isEditing() && item instanceof DummyEditItem) {
				grid.append();
			}
			return this._grid.setFocusedIndex(value, select, true);
		}
		return false;
	},
	layoutChanged: function () {
		this._doLayoutChanged && this._doLayoutChanged();
	},
	resetFocused: function () {
		this._resetFocusedView();
	},
	focusedIndexChanging: function (newIndex) {
		this._doFocusedIndexChanging && this._doFocusedIndexChanging(newIndex); 
	},
	focusedIndexChanged: function (oldIndex, newIndex) {
		this._doFocusedIndexChanged && this._doFocusedIndexChanged(oldIndex, newIndex); 
	},
	columnHeaderDblClicked: function (column) {
		this._grid._fireColumnHeaderDblClicked(column);
	},
	footerCellDblClicked: function (column) {
		this._grid._fireFooterCellDblClicked(column);
	},
	headerSummaryCellDblClicked: function (column) {
		this._grid._fireHeaderSummaryCellDblClicked(column);
	},
	checkBarFootDblClicked: function () {
		this._grid._fireCheckBarFootDblClicked();
	},
	indicatorCellDblClicked: function (index) {
		this._grid._fireIndicatorCellDblClicked(index);
	},
	stateBarCellDblClicked: function (index) {
		this._grid._fireStateBarCellDblClicked(index);
	},
	rowGroupHeadDblClicked: function () {
		this.grid()._fireRowGroupHeadDblClicked();
	},
	rowGroupFootDblClicked: function () {
		this.grid()._fireRowGroupFootDblClicked();
	},
	rowGroupHeaderFooterDblClicked: function (kind, index) {
		this.grid()._fireRowGroupHeaderFooterDblClicked(kind, index);
	},
	rowGroupBarDblClicked: function (index) {
		this.grid()._fireRowGroupBarDblClicked(index);
	},
	panelDblClicked: function () {
		this.grid()._firePanelDblClicked();
	},
	rowGroupPanelDblClicked: function (column) {
		this.grid()._fireRowGroupPanelDblClicked(column);
	},
	dataCellClicked: function (index) {
		this._grid._fireDataCellClicked(index);
	},
	dataCellDblClicked: function (index) {
		this._grid._fireDataCellDblClicked(index);
	},
	cellButtonClicked: function (index, buttonIndex) {
		var column = index.dataColumn();
		var grid = this._grid;
		if (column) {
			switch (column.button()) {
				case CellButton.POPUP:
					var menu = column.menu();
					if (menu) {
						var lm = grid.layoutManager();
						var room = lm.getMergedCell(index);
						var view;
						if (room) {
							view = grid.getCellView(grid._mergeView, index, index.isFixedCol());
						} else {
							view = _cast(grid.getCellView(null, index), CellElement);
						}
						if (view) {
							grid.popupMenuManager().show(menu, view);
						}
					}
					break;
				case CellButton.ACTION:
					grid._fireCellButtonClicked(index);
					break;
				case CellButton.IMAGE:
					var renderer = column._imageButtonsRenderer;
					if (renderer && buttonIndex >= 0 && buttonIndex < renderer._count ) {
						var name = renderer._images[buttonIndex].name;
						grid._fireImageButtonClicked(index, buttonIndex, name);
					}
					break;
			}
		}
	},
	editButtonClicked: function (index) {
		this._grid._fireEditButtonClicked(index);
	},
	imageButtonClicked: function (index) {
		this._grid._fireImageButtonClicked(index);
	},
    _doSetFocus: function () {
        this.grid().editController().setFocus(true);
    },
	_resetFocusedView: function () {
		var grid = this._grid;
		var options = grid.displayOptions()
		var showInnerFocus = options.isShowInnerFocus();
		var index = this.focused();
		var vis = false;
		var rowVis = false;
		var inner = false;
		var lm = grid.layoutManager();
		if (options.isFocusVisible() && grid.isValid(index)) {
			var cell = grid.getFocusedCellView(index);
			if (cell) {
                var fixed = lm.fixedColCount();
				var editing = grid.isEditing();
                var r = cell.boundsBy(grid);
				if (cell instanceof RowGroupFooterElement) {
					var r2 = lm._rowGroupBounds;
					var aw = r2.x + cell._level * grid.rowGroup().levelIndent();
					r.setLeft(aw);
					r.width = r2.width - grid.leftPos() - cell._level * grid.rowGroup().levelIndent();
				}
                if (cell instanceof MergedFooterElement) {
                	// 해당 컬럼의 right
					var c = cell._level - 1;
                	var x = lm.getColumnBounds(c).right() + lm.fixedBounds().x;
                	var fixedWidth = lm.fixedWidth();
                	var leftPos = grid.leftPos();
                	var er = lm._editBarBounds;

					if (fixed > 0) {
						if (c >= fixed) {
							x = Math.max(x + fixedWidth - leftPos , fixedWidth+lm.fixedBounds().x);
						} else if (c == fixed - 1) {
							x = fixedWidth + lm.fixedBounds().x;
						}
					} else if (fixed == 0) {
						x -= leftPos;
					}
                	r.x = x;
                	r.width = er.width + er.x - x ;
                }
				if (r.width > 0 && r.height > 0) {
					if (grid._container.$_rich) {
						r.x++;
						r.y++;
					}
					this._focusView.setRect(r);
					vis = true;
					if (cell instanceof MergedDataCellElement) {
						if (!this._innerFocusView) {
							this._innerFocusView = new InnerFocusView(grid._dom, grid.displayOptions());
							grid.addFocusElement(this._innerFocusView);
						}
						var r1 = lm.itemBounds(cell._topIndex);
						var r2 = lm.itemBounds(index.I() - grid.topIndex());
						cell.setInnerIndex(index.I() - cell.mergeRoom().headItem());
						r.y += r2.y - r1.y;
						r.height = r2.height;
						if (!editing) {
							r.x += 2;
							r.y += 2;
							r.width -= 5;
							r.height -= 5;
						}
						if (showInnerFocus && this._innerFocusView) {
							this._innerFocusView.setRect(r);
							this._innerFocusView.setEditing(editing, cell.getButtonWidth ? cell.getButtonWidth() : 0);
							inner = true;
						}
					}
					if (inner) {
						this._focusView.setEditing(false, 0);
					} else {
						this._focusView.setEditing(editing, cell.getButtonWidth ? cell.getButtonWidth() : 0);
					}
				}
			}
		}
		if (options.isRowFocusVisible() && grid.isValid(index)) {
			var idx = index.I();
			var t = grid.topIndex();
			var fixed = lm.fixedItemCount();
			var itemCount = lm.itemCount();
			if (rowVis = idx < fixed || (idx >= t && idx <= t+itemCount)) {
				var y = fixed > 0 ? lm.fixedHeight() + grid.fixedOptions().rowBarHeight() : 0;
				var gr = lm.gridBounds(); 
				if (idx < fixed) {
					fr = lm.itemBounds(Math.max(0, idx));
				} else {
					fr = lm.itemBounds(Math.max(0, idx - t));
					fr.y = Math.max(fr.y, y);
				}
				fr.y += gr.y;
				fr.x = 0;
				fr.width = gr.x+gr.width;
				grid._container.$_rich && (fr.x++, fr.y++);
				this._rowFocusView.setRect(fr)
			}
		}
		this._focusView.setVisible(vis);
		this._rowFocusView.setVisible(rowVis);
		this._innerFocusView && this._innerFocusView.setVisible(inner);
		if (this._focusView.isVisible()) {
			grid._resetFocusMask();
		}
		if (this._rowFocusView.isVisible()) {
			grid._resetRowFocusMask();
		}
	}
});
var GridScrollTool = defineClass("GridScrollTool", null, {
    init: function (owner) {
        this._super(owner, "gridScrollTool");
        this._scrollTimer = null;
    },
    isScrolling: function () {
        return this._scrollTimer != null;
    },
    stop: function (x, y) {
        if (this._scrollTimer) {
            this._scrollTimer.stop(x, y);
            this._scrollTimer = null;
        }
    },
    start: function (element, x, y) {
        if (element instanceof ScrollButton) {
            if (element.isEnabled()) {
                this._scrollTimer = new ScrollButtonTimer(element);
                this._scrollTimer.start();
            }
            return true;
        }
        if (element instanceof ScrollBar) {
            if (element.ptInTrack(x, y, true)) {
                this._scrollTimer = new ScrollTrackTimer(element, true);
            } else if (element.ptInTrack(x, y, false)) {
                this._scrollTimer = new ScrollTrackTimer(element, false);
            }
            if (this._scrollTimer) {
                this._scrollTimer.start();
                return true;
            }
        }
        return false;
    },
    move: function (x, y) {
        this._scrollTimer.move(x, y);
    }
});
var GridSelectionTool = defineClass("GridSelectionTool", GridTool, {
	init: function (owner) {
		this._super(owner, "selectionTool");
		this._clickPos = Point.empty();
		this._clickElement = null;
		this._clickHandle = null;
		this._clickCell = null;
		this._reclickCell = null;
		this._tmpIndex = this._grid.getIndex();
		this._skipIndex = this._grid.getIndex();
		this._tipCell = null;
		this._tipIndex = null;
		this._tipOptions = new ToolTipOptions();
        this._scrollTool = new GridScrollTool();
		this._rightClicked = null;
		this._prevElt = null;
	},
	destroy: function() {
		this._destroying = true;
		this._clickPos = null;
		this._clickElement = null;
		this._clickHandle = null;
		this._clickCell = null;
		this._reclickCell = null;
		this._tmpIndex = null;
		this._skipIndex = null;
		this._tipCell = null;
		this._tipIndex = null;
		this._tipOptions = null;
        this._scrollTool = null;
		this._rightClicked = null;
		this._prevElt = null;
		this._super();
	},
	hoveredCell: null,
	setHoveredCell: function (value) {
		if (value != this._hoveredCell) {
			this._hideTooltip();
			if (this._hoveredCell) {
				this._hoveredCell.setMouseEntered(false);
			}
			this._hoveredCell = value;
			if (this._hoveredCell) {
				this._hoveredCell.setMouseEntered(true);
			}
		}
		var grid = this.grid();
		var cell = value;
		var self = this;
		var tm = grid.toolTipManager();
		if (cell instanceof DataCellElement && grid.canHovering()) {
			if (tm) {
				if (tm._hintDuration > 0) {
					tm._showTimer && clearTimeout(tm._showTimer);
					tm._showTimer = setTimeout(function() {self._showTooltip2(cell)}.bind(self), tm._hintDuration);
				} else {
					this._showTooltip2(cell);
				}
			}
		} else if (cell instanceof HeaderCellElement && grid.canHovering) {
			if (tm) {
				if (tm._hintDuration > 0) {
					tm._showTimer && clearTimeout(tm._showTimer);
					tm._showTimer = setTimeout(function() {self._showHeaderTooltip2(cell)}.bind(self), tm._hintDuration);
				} else {
					this._showHeaderTooltip2(cell);
				}
			}
		}
	},
    isEditing: function () {
        return this._grid.isEditing();
    },
	_doActivate: function () {
		this._super();
		this._grid.addFocusElement(this._focusView);
        this._innerFocusView && this._grid.addFocusElement(this._innerFocusView);

        this._grid.addRowFocusElement(this._rowFocusView);
	},
	_doDeactivate: function () {
		this._grid.removeFocusElement(this._focusView);
        this._innerFocusView && this._grid.removeFocusElement(this._innerFocusView);
        this._grid.removeRowFocusElement(this._rowFocusView);
		this._super();
	},
	_doCancel: function (grid) {
		grid.closeFilterSelector();
		if (grid.isEditing()) {
			grid.cancelEditor(true);
		} else {
			if (grid.itemEditCancel()) {
				grid.cancel();
			}
		}
	},
	_doEnter: function (grid, options, focused) {
        var editing = grid.isEditing();
		if (editing && !options.isEnterToTab()) {
			grid.commitEditor(true);
		} else {
			var index = focused.clone();
			var skip = options.isSkipReadOnly();
			var skipCell = options.isSkipReadOnlyCell();
			if (!grid.isValid(index)) {
				index.normalize(grid);
			} else if (options.isEnterToNextRow() && index.I() < grid.itemCount() - 1) {
				index.down();
				if (skipCell && this.$_checkReadOnly(index)) {
					if (!this.$_skipReadOnlyCell(index, 1)) {
						index.assign(focused);
					}
				}
            } else if ((!editing || options.isEnterToTab()) && options.isCrossWhenExitLast() && index.isLast() && index.I() < grid.itemCount() - 1) {
                index.down();
                index.home();
                skip && this.$_skipReadOnly(index, 1);
            } else if ((!editing || options.isEnterToTab()) && options.isCommitWhenExitLast() && index.isLast()) {
            	try {
	                grid.commit(options.isCommitWhenNoEdit());
	            } catch (err) {
					if (err instanceof ValidationError) {
						err = grid._fireValidationFail(item._index, err.column, err);
						err ? alert(options.isShowOnlyValidationMessage() && err.userMessage ? err.userMessage : err.toString()) : null;
					}
					throw err;	
	            }
                if (options.isAppendWhenExitLast()) {
                    grid.append();
                    if (grid.isItemEditing()) {
                        index.down();
                        index.home();
                    }
                }
			} else if (options.isEnterToTab() && (grid.isEditing() || this.$_checkReadOnly(index))) {
				if (grid.isEditing()) {
					grid.commitEditor(true);
				}
				index.next();
				if (skip && !this.$_skipReadOnly(index, 1)) {
					index.assign(focused);
				}
			} else if (!options.isEnterToEdit()) {
				index.next();
				if (skip && !this.$_skipReadOnly(index, 1)) {
					index.assign(focused);
				}
			}
			if (!CellIndex.areEquals(index, focused)) {
				this.setFocused(index, true);
			} else if (grid.isValid(index) && options.isEnterToEdit()) {
				if (!grid.isEditing() && focused && focused.dataColumn() && !this.$_checkReadOnly(focused)){
					grid.showEditor(focused);
				}
			}
		}
		return true;
	},
	_doTab: function (grid, options, focused, ctrl, shift) {
		var index = focused.clone();
		if (!grid.isValid(index)) {
			index.normalize(grid);
			this.$_skipReadOnly(index, 1);
		} else if (options.isUseTabKey()) {
            if (shift) {
                index.prev();
                if (options.isSkipReadOnly() && !this.$_skipReadOnly(-1)) {
                    index.assign(focused);
                }
            } else {
                if (options.isCrossWhenExitLast() && index.isLast() && index.I() < grid.itemCount() - 1) {
                    index.down();
                    index.home();
                } else if (options.isCommitWhenExitLast() && index.isLast()) {
                	try {
                    	grid.commit(options.isCommitWhenNoEdit());
                    } catch (err) {
						if (err instanceof ValidationError) {
							err = grid._fireValidationFail(item._index, err.column, err);
							err ? alert(options.isShowOnlyValidationMessage() && err.userMessage ? err.userMessage : err.toString()) : null;
						}
						throw err;	
                    }
                    if (options.isAppendWhenExitLast()) {
                        grid.append();
                        if (grid.isItemEditing()) {
                            index.down();
                            index.home();
                        }
                    }
                } else {
                    index.next();
                }
                if (options.isSkipReadOnly() && !this.$_skipReadOnly(index,1)) {
                    index.assign(focused);
                }
            }
			if (!CellIndex.areEquals(index, focused)) {
				this.setFocused(index, true);
			}
			return true;
		}
		return false;
	},
	$_commitCancel: function(item, options) {
		var grid = this.grid();
		try {
			switch (item.itemState()) {
				case ItemState.INSERTING:
					if (!grid.commit(options.isForceInsert())) {
						grid.cancel(true);
					}
					return true;
				case ItemState.APPENDING:
					if (!grid.commit(options.isForceAppend())) {
						grid.cancel(true);
					}
					return true;
				case ItemState.UPDATING:
					if (!grid.commit(options.isCommitWhenNoEdit())) {
						grid.cancel(true);
					}
					return true;
			}
		} catch (err) {
			if (err instanceof ValidationError) {
				err = grid._fireValidationFail(item._index, err.column, err);
				err ? alert(options.isShowOnlyValidationMessage() && err.userMessage ? err.userMessage : err.toString()) : null;
				return false;
			}
			if (err instanceof AbortError) {
				return false;
			}
			throw err;
		}
		return false;
	},
	/**
	 * true를 리턴하면 editor에서 key 입력이 무시된다.
	 */
	_doKeyDown: function (key, ctrl, shift, alt) {
		trace("selectionTool K E Y: " + key);
		var item;
		var grid = this.grid();
		var lm = grid.layoutManager();
		var options = grid.editOptions();
		var skip = options.isSkipReadOnly();
		var skipCell = options.isSkipReadOnlyCell();
		var focused = this.focused();
		var verticalStep = options.verticalMovingStep()
		focused._verticalStep = verticalStep;
		var index = focused.clone();
		var isMac = false;
        var appending = false;
        if (!grid._fireKeyDown(key, ctrl, shift, alt))
        	return true;
		if (DataCellRenderer.consumeKey(index, key, ctrl, shift)) {
			return true;
		}
        grid.closeFilterSelector();
		if (key == Keys.ESCAPE) {
			grid.closePopups();
			this._doCancel(grid);
		} else if (key == Keys.ENTER) {
			return this._doEnter(grid, options, index);
		} else if (key == Keys.TAB) {
			return this._doTab(grid, options, index, ctrl, shift);
		} else if (key == Keys.F2) {
			if (!grid.isEditing() && index && index.dataColumn()) {
				grid.showEditor(index, shift);
			}
		} else if (key == Keys.INSERT) {
			if (options.isAppendWhenInsertKey() || grid.itemCount() == 0) {
				grid.append();
			} else {
				grid.insert(index.item(), shift, ctrl);
			}
		} else if (key == Keys.DELETE) {
            if (ctrl && shift) {
                grid.revertSelection();
                return true;
            } else if (ctrl) {
				grid.deleteSelection();
				return true;
			}
			return false;
		} else if (key == Keys.BACK) {
			return false;
		} else if (key == Keys.SPACE && grid.isReadMode()) {
			var cell = grid.checkBar().getCell(index);
			if (cell) {
				this._checkCellClicked(cell);
			}
		} else if (_included(key, Keys.HOME, Keys.END, Keys.RIGHT, Keys.LEFT, Keys.DOWN, Keys.UP, Keys.PAGEDOWN, Keys.PAGEUP)) {
			var itemCount = grid.itemCount();
			if (key == Keys.DOWN && itemCount == 0) {
				grid.append();
				return;
			}
			if (!grid.isValid(index)) {
				index.normalize(grid);
				this.setFocused(index, true);
				return true;
			}
			if ((_included(key, Keys.DOWN, Keys.PAGEDOWN) || (key == Keys.END && ctrl)) && index.isBottom() && this.$_checkAppending(index)) {
				return true;
			}
			if ((_included(key, Keys.UP, Keys.PAGEUP) || (key == Keys.HOME && ctrl)) && index.isTop() && this.$_checkAppending(index, true)) {
				return true;
			}
			switch (key) {
			case Keys.HOME:
				if (ctrl) {
					var orgIndex = index.clone();
					index.first();
					if (skip && this.$_checkReadOnly(index)) {
						if (!this.$_skipReadOnlyCell(index, 1, orgIndex)) {
							index.assign(focused);
							break;
						}
					}
				} else {
					index.home();
					this.$_skipReadOnly(index, 1);
				}
				break;
			case Keys.END:
				if (ctrl) {
					var orgIndex = index.clone();
					index.last();
					if (skip && this.$_checkReadOnly(index)) {
						if (!this.$_skipReadOnlyCell(index, -1, orgIndex)) {
							index.assign(focused);
							break;
						}
					}
				} else {
					index.end();
					this.$_skipReadOnly(index, -1);
				}
				break;
			case Keys.RIGHT:
				index.right();
				if (skip && this.$_checkReadOnly(index)) {
					if (!this.$_skipReadOnly(index, 1)) {
						index.assign(focused);
						break;
					}
				}
				break;
			case Keys.LEFT:
				index.left();
				if (skip && this.$_checkReadOnly(index)) {
					if (!this.$_skipReadOnly(index, -1)) {
						index.assign(focused);
						break;
					}
				}
				break;
			case Keys.DOWN:
				try {
					if (index.I() == grid.itemCount() - 1 && (index.isBottom() || verticalStep == VerticalMovingStep.ROW)) {
						if (index.isBottom()) {
							if (this.$_commitCancel(index.item(), options))
								return true;
						}
						grid.append();
	                    appending = true;
						if (ctrl && isMac) {
							index.last();
						} else {
							index.down(grid.isItemEditing(index.item()));
						}
					} else {
						if (ctrl && isMac) {
							index.last();
						} else {
							index.down(grid.isItemEditing(index.item()));
						}
					}
				} finally {
					if (skipCell && this.$_checkReadOnly(index)) {
						if (!this.$_skipReadOnlyCell(index, 1)) {
							index.assign(focused);
						}
					}
				}
				break;
			case Keys.UP:
				try {
	                if (index.I() == 0 && index.isTop()) {
						if (this.$_commitCancel(index.item(), options))
							return true;

	                    if (ctrl && isMac) {
	                        index.first();
	                    } else {
	                        index.up();
	                    }
	                } else {
	                    if (ctrl && isMac) {
	                        index.first();
	                    } else {
	                        index.up(grid.isItemEditing(index.item()));
	                    }
	                }
				} finally {
					if (skipCell && this.$_checkReadOnly(index)) {
						if (!this.$_skipReadOnlyCell(index, -1)) {
							index.assign(focused);
						}
					}				
				}
				break;
			case Keys.PAGEUP:
				var orgIndex = index.clone();
				index.incRow(-lm.fullItemCount());
				if (skip && this.$_checkReadOnly(index)) {
					if (!this.$_skipReadOnlyCell(index, 1, orgIndex)) {
						index.assign(focused);
						break;
					}
				}
				break;
			case Keys.PAGEDOWN:
				if (index.I() == grid.itemCount() - 1 && index.isBottom()) {
					if (ItemState.isInserting(index.item().itemState())) {
						if (grid.commit(options.isForceAppend())) {
						}
						return true;
					}
				}
				var orgIndex = index.clone();
				index.incRow(lm.fullItemCount());
				if (skip && this.$_checkReadOnly(index)) {
					if (!this.$_skipReadOnlyCell(index, -1, orgIndex)) {
						index.assign(focused);
						break;
					}
				}
				break;
			}
            if (shift && grid.selections().count() > 0) {
                this.setFocused(index, false);
                grid.selections().getItem(0).resizeTo(index);
            } else {
                this.setFocused(index, true);
            }
			return true;
		} else if (index.item() instanceof DummyEditItem) {
			grid.append();
		}
		return false;
	},
	_doKeyUp: function (key, ctrl, shift, alt) {
		trace("selectionTool KeyUp KEY: " + key + ",ctrl="+ctrl+",shift="+shift+",alt="+alt);
		this.grid()._fireKeyUp(key, ctrl, shift, alt);
	},
	_doKeyPress: function (key) {
		trace("selectionTool KeyPress");
		this.grid()._fireKeyPress(key);
	},
	_doClick: function (x, y) {
		if (this.isDragging()) { // || isScrollBar(event)) {
			return;
		}
		var grid = this._grid;
		var index = this.focused().clone();
		if (index) {
			var elt = this.findElementAt(x, y, true);
			elt = !elt ? this._clickElement : elt; // 반쯤 걸쳐진 셀을 클릭해서 스크롤 되었는데 마지막 셀인경우 null이 나온다.
			if (elt == this._clickElement) {
				if (this._clickElement instanceof DataCellElement) {
					// var clickIndex = this._clickElement.index();
					// if (this._clickCell instanceof MergedDataCellElement) {
					// 	clickIndex = clickIndex.clone();
					// 	this.$_calcInnerCellIndex(this._clickCell, clickIndex, x, y);
					// }
					this.dataCellClicked(index); // element의 경우 위치는 변경되지 않고 내부 값만 변경된다. focus된 index로 처리해야 한다.
					if (!grid.isEditing()) {
						if (index.column() instanceof DataColumn) {
							var col = index.dataColumn();
							var editor = grid.editController()._editor;
							if (!col.isReadOnly() && editor && (editor instanceof DropDownCellEditor || editor instanceof DateCellEditor) && col.editorOptions && col.editorOptions().dropDownWhenClick) {
								// this.editButtonClicked(index)
						        grid.makeCellVisible();
						        if (grid.showEditor(index)) {
						            grid.editorButtonClick(index);
						        }
							}
						}
						if (this._reclickCell) {
							this._performRendererClick(index, this._reclickCell, x, y, false, false);
						} else {
							this._performRendererClick(index, this._clickElement, x, y, false, true);
						}
					}
				} else if (this._clickElement instanceof IndicatorCellElement) {
					this._indicatorCellClicked(index.itemIndex());
				}
			}
		}
	},
    $_calcInnerCellIndex: function (cell, index, x, y) {
        if (cell instanceof MergedDataCellElement) {
            var grid = this._grid;
            var lm = grid.layoutManager();
			var p = grid.containerToElement(x, y);
			y -= lm.bodyBounds().y;
            for (var k = cell._topIndex; k <= cell._bottomIndex; k++) {
				var r = lm.itemBounds(k);
				if (y >= r.y && y < r.bottom()) {
					index.itemIndex(k + grid.topIndex());
					break;
				}
            }
        }
    },
	_doDblClick: function (x, y) {
		if (this.isDragging()) {
			return;
		}
		var grid = this._grid;
		var index = this.focused();
		var elt = this.findElementAt(x, y, true);
		if (elt === this._clickElement) {
			var clickIndex;
			var request = this._getEditRequest(this._clickElement, x, y, false, false);
			if (request instanceof RowResizeRequest) {
				var itemIndex = request.itemIndex()+grid.topIndex();
				grid.layoutManager().fitRowHeight(itemIndex, 0, false, true);
			};
			if (this._clickElement instanceof DataCellElement) {
				clickIndex = this._clickCell.index();
				if (this._clickCell instanceof MergedDataCellElement) {
					clickIndex = clickIndex.clone();
					this.$_calcInnerCellIndex(this._clickCell, clickIndex, x, y);
				}				
				this.dataCellDblClicked(clickIndex);
			}
			if (this._clickElement instanceof RowGroupHeaderCellElement) {
				var groupItem;
				var clickItem = this._clickElement.item();
				if ((clickItem instanceof GroupItemImpl || clickItem instanceof MergedGroupHeader) && clickItem.isExpanded && clickItem.setExpanded) {
					var expanded = !clickItem.isExpanded();
					clickItem.setExpanded(expanded);
				}
				var idx = CellIndex.temp(grid, this._clickElement.index().itemIndex(), grid.columnByField(clickItem._groupField));
				this.rowGroupHeaderFooterDblClicked(-1, idx);
			} else if (this._clickCell instanceof GroupFooterCellElement) {
				this.rowGroupHeaderFooterDblClicked(-2, this._clickCell.index());
			} else if (this._clickElement instanceof HeaderCellElement) {
				var request = this._getEditRequest(this._clickElement, x, y, false, false);
				if (request instanceof ColumnResizeRequest) {
					var col = this._clickElement.index().column();
					grid.layoutManager().fitColumnWidth(col, false, 0, 0);
					grid._fireColumnPropertyChanged(col, "width", col.width());
				} else {
					if (this._clickElement.parent() instanceof HeaderElement || this._clickElement.parent() instanceof HeaderGroupCellElement) {
						this.columnHeaderDblClicked(this._clickElement.index().column());
					} else if (elt.parent() instanceof GroupByView) {
						this.rowGroupPanelDblClicked(this._clickElement.index().column());
					}
				}
			} else if (index.isValid() && !grid.isEditing() && this._clickCell instanceof DataCellElement) {
				if (CellIndex.areEquals(clickIndex, index)) {
					grid.showEditor(clickIndex);
				}
			} else if (this._clickCell instanceof FooterCellElement) {
				if (this._clickCell.error()) {
					grid.alertCellError(this._clickCell, this._clickCell.errorDetail() || this._clickCell.error());
				} else {
					this.footerCellDblClicked(this._clickCell.index().column());
				}
			} else if (this._clickCell instanceof SummaryCellElement) {
				if (this._clickCell.error()) {
					grid.alertCellError(this._clickCell, this._clickCell.errorDetail() || this._clickCell.error());
				} else {
					this.headerSummaryCellDblClicked(this._clickCell.index().column());
				}

			} else if (this._clickCell instanceof GroupFooterCellElement && this._clickCell.error()) {
				grid.alertCellError(this._clickCell, this._clickCell.errorDetail() || this._clickCell.error());
			} else if (this._clickCell instanceof IndicatorHeadElement) {
				this.indicatorCellDblClicked(-1);
			} else if (this._clickCell instanceof IndicatorFootElement) {
				this.indicatorCellDblClicked(-2);
			} else if (this._clickCell instanceof IndicatorCellElement) {
				this.indicatorCellDblClicked(elt.index().itemIndex());
			} else if (this._clickCell instanceof StateBarHeadElement) {
				this.stateBarCellDblClicked(-1);
			} else if (this._clickCell instanceof StateBarFootElement) {
				this.stateBarCellDblClicked(-2);
			} else if (this._clickCell instanceof StateBarCellElement) {
				this.stateBarCellDblClicked(elt.index().itemIndex());
			} else if (this._clickCell instanceof CheckBarFootElement) {
				this.checkBarFootDblClicked();
			} else if (this._clickCell instanceof RowGroupHeadCellElement) {
				this.rowGroupHeadDblClicked();
			} else if (this._clickCell instanceof RowGroupFootCellElement) {
				this.rowGroupFootDblClicked();
			} else if (this._clickCell instanceof RowGroupBarCellElement) {
				this.rowGroupBarDblClicked(this._clickCell.level());
			} else if (this._clickCell instanceof RowGroupExpandHandle) {
				this.rowGroupBarDblClicked(-1);
			} else if (this._clickCell instanceof RowGroupExpanderElement) {
				this.rowGroupBarDblClicked(-2);
			} else if (this._clickElement instanceof GroupByView) {
				this.panelDblClicked();
			}
		}
	},
	_doMouseDown: function (x, y, ctrlKey, shiftKey, button, event) {
		var grid = this._grid;
		this._hideTooltip();
		grid.closePopups();
		grid.setFocus();
        this._scrollTool.stop();
		var clickElement = this._clickElement = null;
		var clickCell = this._clickCell = null;
		this._reclickCell = null;
		this._clickHandle = null;
		var preEditor,
		    curEditor;
		this._rightClicked = button > 1 ? true : false;
        if (button == 0 || grid.displayOptions().isRightClickable()) {
            clickElement = this._clickElement = this.findElementAt(x, y, false);
            if (this._scrollTool.start(clickElement, x, y)) return;
            this._clickHandle = _cast(clickElement, HandleElement);
            clickCell = this._clickCell = _cast(clickElement, CellElement);
            this._clickPos.set(x, y);
            if (this._clickHandle) {
                if (this._clickHandle.isClickable()) {
                    this.$_handleClicked(this._clickHandle);
                    return;
                }
            }
        }
		if (clickCell instanceof DataCellElement && this.$_checkAppending(grid.focusedIndex(), true, clickCell)) {
			this._clickElement = null;
			this._clickCell = null;
			return;
		}
		// shift + click시 선택할수 있도록 
		// if (shiftKey && clickCell) {
		// 	if (!grid.isEditing())
		// 		grid.selections().getItem(0).resizeTo(clickCell.index().clone());
		// 	return;
		// }
        var request, tracker;
		if (clickCell) {
			var idx, tracker;
			var selected = false;
			var footerView = null;
			var mergedFooter = null;
			var index = clickCell.index().clone();
            if (clickCell instanceof MergedDataCellElement) {
                this.$_calcInnerCellIndex(clickCell, index, x, y);
            }
            request = this._getEditRequest(clickCell, x, y, ctrlKey, shiftKey);
			if (!request || request.isSelectable()) {
				if (!shiftKey) {
					if (!this._rightClicked || !grid._selections.contains(index)) {
						if (clickCell instanceof DataCellElement) {
							grid._selections.clear();
						} else if (clickCell instanceof IndicatorCellElement && grid.indicator().isSelectable()) {
							grid._selections.clear();
						} else if (clickCell instanceof RowGroupHeaderCellElement) {
							grid._selections.clear();
						} else if ((footerView = this.$_getGroupFooterView(clickCell)) != null) {
							grid._selections.clear();
						} else if ((mergedFooter = this.$_getMergedFooterView(clickCell)) != null) {
							grid._selections.clear();
						}
					}
				}
				if (clickCell instanceof DataCellElement) {
					if (CellIndex.areEquals(index, this.focused())) {
						this._reclickCell = this._clickCell;
					}
                    if(!(request instanceof CellButtonRequest) && this._reclickCell && grid.editOptions().isEditWhenClickFocused()) {
						grid.showEditor(index);
						setTimeout(function(){
							grid._editController._editor.selectAll(); 
							grid._editController._editor.setFocus();
						},100);
                    } else {
                        selected = true;
                    }
				} else if (clickCell instanceof IndicatorCellElement) {
					if (grid.indicator().isSelectable()) {
						idx = this._tmpIndex;
						idx.assign(grid.focusedIndex());
						idx.itemIndex(index.I());
						if (idx.C() == null && idx.item() instanceof GridRow) {
							idx.column(grid.getFirstColumn());
						}
						index = idx;
						selected = true;
					}
				} else if (clickCell instanceof RowGroupHeaderCellElement) {
					index.setColumn(grid.getVisibleColumn(index.item().level()));
					selected = true;
				} else if (footerView) {
					idx = this.focused().clone();
					idx.itemIndex(footerView.item().index());
					index = idx;
					selected = true;
				} else if (mergedFooter) {
					selected = true;
				}
				if (selected) {
					index.normalize(grid);
					// right Click이면서 영역밖인 경우. selected True
					var hasSelect = this._rightClicked && !grid._selections.contains(index);
					preEditor = grid._editController._editor;
					if (this.setFocused(index, hasSelect)) { // 아래 selectionTracker에서 clear할 것이다.
						if (SelectionStyle.isSingle(grid._selectOptions.style()) && grid._selections.count() < 1) {
							grid.clearSelection();
						} 
					} else {
						return;
					}
					curEditor = grid._editController._editor;
				}
			}
            if (button == 0) {
                tracker = this._getDragTracker(request, x, y);
                this.setDragTracker(tracker);
                if (grid._selections.count() < 1) {
                    if (grid._selectOptions.style() == SelectionStyle.ROWS && !(tracker instanceof RowsSelectTracker) ||
                        grid._selectOptions.style() == SelectionStyle.COLUMNS && !(tracker instanceof ColumnsSelectTracker)) {
                        grid.clearSelection();
                    }
                }
            }
		} else if (clickElement) { // for scrollbar
			request = this._getEditRequest(clickElement, x, y, false, false);
			if (request) {
				this.setDragTracker(this._getDragTracker(request, x, y));
			}
		}
		tracker = this.dragTracker();
		if (tracker && tracker.isStartWhenCreated()) {
			this._startDragTracker(x, y);
		}
		if (preEditor && curEditor && preEditor != curEditor && curEditor instanceof MultiLineCellEditor) {
			if (event && event.preventDefault) {
				!_isFirefox && event.preventDefault();
			}
		}
	},
	_doMouseMove: function (x, y) {
		var grid = this._grid;
		if (this._scrollTool.isScrolling()) {
			this._scrollTool.move(x, y);
		} else if (this.dragTracker()) {
			this._hideTooltip();
		} else {
			var elt = null;
			grid.setCursor(Cursor.DEFAUT);
			elt = this.findElementAt(x, y, true);
			if (grid.canHovering()) {
				this.setHoveredCell(_cast(elt, CellElement));
			} else {
				this._hideTooltip();
			}
			if (this._prevElt) {
				this._prevElt.setButtonState(false, false);
				this._prevElt = null;
			}
			var request = this._getEditRequest(elt, x, y);
			if (request && request.cursor()) {
                grid.setCursor(request.cursor());
			} else if (elt instanceof DataCellElement) {
				x = elt.mouseX();
				y = elt.mouseY();
				if (elt.ptInButton(x, y)) {
					var button = elt.getPtInButtonIndex(x,y);
					elt.setButtonState(true, false, button);
					this._prevElt = elt;
				} else {
					elt.setButtonState(false, false);
				}
			}
		}
	},
	_doMouseUp: function (x, y, event) {
		var grid = this._grid;
		var elt = this.findElementAt(x, y, true);
        if (this._scrollTool.isScrolling()) {
            this._scrollTool.stop(x, y);
		} else if ((!this.dragTracker() || !this.dragTracker().isCompleted()) && elt == this._clickElement) {
			if (elt instanceof HeaderCellElement && elt.isClickable()) {
				var request = this._getEditRequest(this._clickElement, x, y, false, false);
				if (!request || !request.isDblClickable()) {
					if (elt.parent() instanceof HeaderElement || elt.parent() instanceof HeaderGroupCellElement) {
						this.$_columnHeaderClicked(elt.index().column(), this._rightClicked, event);
					} else if (elt.parent() instanceof GroupByView) {
						this._rowGroupPanelClicked(elt.index().column());
					}
				}
			} else if (elt instanceof HeaderCheckHandle) {
                elt.cellView().column().setChecked(!elt.cellView().column().isChecked());
            } else if (elt instanceof CheckBarCellElement) {
				this._checkCellClicked(elt);
			} else if (elt instanceof CheckBarHeadElement) {
				this._checkAllClicked(elt);
			} else if (elt instanceof CheckBarFootElement) {
				this._checkBarFootClicked();
			} else if (elt instanceof IndicatorCellElement) {
				this._indicatorCellClicked(elt.index().itemIndex());
			} else if (elt instanceof IndicatorHeadElement) {
				if (grid.filteringOptions().isEnabled()) {
				}
				this._indicatorCellClicked(-1);
			} else if (elt instanceof IndicatorFootElement) {
				this._indicatorCellClicked(-2);
			} else if (elt instanceof StateBarCellElement) {
				this._stateBarCellClicked(elt.index().itemIndex());
			} else if (elt instanceof StateBarHeadElement) {
				this._stateBarCellClicked(-1);
			} else if (elt instanceof StateBarFootElement) {
				this._stateBarCellClicked(-2);
			} else if (elt instanceof RowGroupHeadCellElement) {
				this._rowGroupHeadClicked();
			} else if (elt instanceof RowGroupFootCellElement) {
				this._rowGroupFootClicked();
			} else if (elt instanceof RowGroupHeaderCellElement) {
				var column = grid.columnByField(elt.item()._groupField);
				var index = CellIndex.temp(grid, elt.index().itemIndex(), column);
				this._rowGroupHeaderFooterClicked(-1, index);
			} else if (elt instanceof GroupFooterCellElement) {
				this._rowGroupHeaderFooterClicked(-2, elt.index());
			} else if (elt instanceof RowGroupBarCellElement) {
				this._rowGroupBarClicked(elt.level());
			} else if (elt instanceof RowGroupExpandHandle) {
				this._rowGroupBarClicked(-1);
			} else if (elt instanceof RowGroupExpanderElement) {
				this._rowGroupBarClicked(-2);
			} else if (elt instanceof GroupByView) {
				this._panelClicked(0);
			} else if (elt instanceof FooterCellElement) {
				this._footerCellClicked(elt.index().column());
			} else if (elt instanceof SummaryCellElement) {
				this._headerSummaryCellClicked(elt.index().column());
			} else if (elt && elt.isClickable()) {
				this.$_elementClicked(elt);
			}
		}
		this.setDragTracker(null);
	},
	_doMouseOutside: function () {
		if (this._hoveredCell) {
			this._hoveredCell.setMouseEntered(false);
			this._hoveredCell = null;
		}
		this._grid._validateScrollBars();
	},
	_doMouseWheel: function (x, y, deltaX, deltaY) {
		if (this._grid.displayOptions().isWheelEnabled()) {
			this._super(x, y, deltaX, deltaY);
            var top = this._grid.topIndex();
            var wheelScrollLines = Math.abs(this._grid.displayOptions().wheelScrollLines());
            wheelScrollLines = !!wheelScrollLines ? wheelScrollLines : 3;
            this._grid.setTopIndex(this._grid.topIndex() + (deltaY > 0 ? -wheelScrollLines : wheelScrollLines));
            return top != this._grid.topIndex(); 
		}
		return false;
	},
	_doMouseEnter: function (x, y) {
	},
	_doMouseLeave: function () {
		this._hideTooltip();
	},
	_doMouseOver: function (x, y) {
	},
	_doLayoutChanged: function (x, y) {
		this._resetFocusedView();
	},
	_doFocusedIndexChanging: function (newIndex) {
	},
	_doFocusedIndexChanged: function (oldIndex, newIndex) {
		this._resetFocusedView();
	},
	editButtonClicked: function (index) {
		var grid = this.grid();
        grid.makeCellVisible();
        if (grid.showEditor(index)) {
            grid.editorButtonClick(index);
        }
		this._super(index);
	},
	$_checkAppending: function (index, cancel, clickCell) {
		var grid = this.grid();
		if (index.I() == grid.itemCount() - 1 && ItemState.isInserting(index.item().itemState())) {
			var idx = index.I();
			if (!clickCell || clickCell.index().I() != idx) {
                try {
                    if (grid.commit(grid.editOptions().isForceAppend(), true)) {
                        index = index.clone();
                        index.itemIndex(idx);
                        if (!grid.isValid(index)) {
                            index.itemIndex(grid.getItemIndexOfRow(grid.dataSource().rowCount() - 1));
                        }
                        this.setFocused(index, true);
                    } else if (cancel) {
                        grid.cancel(true);
                    }
                } catch (err) {
                    if (err instanceof ValidationError) {
                    	err = grid._fireValidationFail(idx, err.column, err);
						err ? alert(grid._editOptions.isShowOnlyValidationMessage() && err.userMessage ? err.userMessage : err.toString()) : null;
                        return true;
                    }
                    if (err instanceof AbortError) {
                        return true;
                    }
                    throw err;
                }
				return true;
			}
		}
		return false;
	},
	$_checkReadOnly: function (index) {
		var column;
		var grid = this.grid();
		var readOnly = grid.isValid(index) && (column = index.dataColumn()) && !column.isWritable();
		if (!readOnly) {
			var row = ItemState.isInserting(index.item().itemState()) ? -1 : index.dataRow();
			var style = _cast(grid.itemSource().getCellStyle(row, index.dataField()), DataCellStyle);
			readOnly = style && !style.isWritable();
		}
		return readOnly;
	},
	checkReadOnly:function (index) {
		return this.$_checkReadOnly(index);
	},
	$_skipReadOnly: function (index, dx) {
		var moved = false;
		var grid = this.grid();
		if (grid.editOptions().isSkipReadOnly()) {
			var idx = this._skipIndex;
			idx.assign(index);
			moved = !this.$_checkReadOnly(idx);
			if (!moved) {
				if (dx > 0) {
					while (idx.next()) {
						if (!this.$_checkReadOnly(idx)) {
							index.assign(idx);
							moved = true;
							break;
						}
					}
				} else {
					while (idx.prev()) {
						if (!this.$_checkReadOnly(idx)) {
							index.assign(idx);
							moved = true;
							break;
						}
					}
				}
			}
		}
		return moved;
	},
	skipReadOnly: function(index, dx) {
		return this.$_skipReadOnly(index, dx);
	},
	$_skipReadOnlyCell : function (index, dx, limit) {
		var grid = this.grid();
		var col = index.column();
		var hasVertical = col.checkGroupExist(ColumnGroupOrientation.VERTICAL);
		var moved = !col.isWritable() && !hasVertical;
		if (!moved && grid.editOptions().isSkipReadOnlyCell()) {
			var idx = this._skipIndex;
			idx.assign(index);
			moved = !this.$_checkReadOnly(idx);
			if (!moved) {
				if (dx > 0) {
					while (idx.lower(grid.isItemEditing(idx.item()))) {
						if (idx.itemIndex == -1 || !this.$_checkReadOnly(idx)) {
							index.assign(idx);
							moved = true;
							break;
						}
						if (CellIndex.areEquals(idx, limit)) {
							moved = false;
							break;
						}
					}
				} else {
					while (idx.upper(grid.isItemEditing(idx.item()))) {
						if (idx.itemIndex == -1 || !this.$_checkReadOnly(idx)) {
							index.assign(idx);
							moved = true;
							break;
						}
						if (CellIndex.areEquals(idx, limit)) {
							moved = false;
							break;
						}
					}
				}
			}
		}
		return moved;
	},
	$_getGroupFooterView: function (element)/* RowGroupFooterElement */ {
		var p = element.parent();
		while (p) {
			if (p instanceof RowGroupFooterElement) {
				return p;
			}
			p = p.parent();
		}
		return null;
	},
	$_getMergedFooterView: function (element)/* MergedFooterElement */ {
		var p = element.parent();
		while (p) {
			if (p instanceof MergedFooterElement) {
				return p;
			}
			p = p.parent();
		}
		return null;
	},
	_getEditRequest: function (source, x, y, ctrlKey, shiftKey) {
		var request;
		var cell;
		var grid = this._grid;
		if (source instanceof ScrollThumb) {
			return new ScrollThumbRequest(source);
		}
		if (grid.visibleColumnCount() < 1) {
			return null;
		}
		if (!(source instanceof CellElement)) { 
			return null;
		}
		cell = source;
		request = this.$_getRowResizeRequest(cell, x, y);
		if (request) {
			return request;
		}
		if (grid.header().isResizable()) {
			request = this.$_getHeaderResizeRequest(x, y);
			if (request) {
				return request;
			}
		}
        if (grid.header().summary().isResizable()) {
            request = this.$_getHeaderSummaryResizeRequest(x, y);
            if (request) {
                return request;
            }
        }
		if (grid.footer().isResizable()) {
			request = this.$_getFooterResizeRequest(x, y);
			if (request) {
				return request;
			}
		}	
		var index;
		var column;
		var lm = grid.layoutManager();
		var mode = grid.selectOptions().mode();
		var style = grid.selectOptions().style();
		var p = cell.localToContainer(Point.EMPTY);
		p.x += cell.width();
		if (cell instanceof IndicatorCellElement) {
			if (grid.indicator().isSelectable() && mode != SelectionMode.NONE && style != SelectionStyle.NONE && style != SelectionStyle.SINGLE_ROW) {
				return new SelectRequest(grid.selections(), cell, SelectionStyle.ROWS);
			}
		} else if (cell instanceof HeaderCellElement) {
			if (ctrlKey) {
				if (mode != SelectionMode.NONE && style != SelectionStyle.NONE && style != SelectionStyle.SINGLE_COLUMN) {
					return new SelectRequest(grid.selections(), cell, SelectionStyle.COLUMNS);
				}
			} else {
				index = cell.index();
				column = index.column();
				if (grid.displayOptions().isColumnResizable() && column.isResizable() &&
					(grid.fixedOptions().isResizable() || (column.root().displayIndex() >= lm.fixedColCount() && column.root().displayIndex() < lm.rfixedStartCol()) )) {
					if (x >= p.x - 3 && x <= p.x + 3) {
						return new ColumnResizeRequest(cell);
					}
				}
				if (grid.displayOptions().isColumnMovable() && column.isMovable() &&
					(!column.isRoot() || grid.canMoveIndex(column.root().displayIndex()))) {
					return new ColumnMoveRequest(cell);
				}
			}
		} else if (cell instanceof RowGroupHeaderCellElement || this.$_getGroupFooterView(cell) || this.$_getMergedFooterView(cell)) {
			if (mode != SelectionMode.NONE && style != SelectionStyle.NONE && !SelectionStyle.isSingle(style)) {
				if (grid.selections().count() > 0 && shiftKey) {
					return new SelectRequest(grid.selections(), cell, grid.selections().itemStyle());
				} else if (style != SelectionStyle.NONE) {
					return new SelectRequest(grid.selections(), cell,  style);
				}
			}
		} else if (cell instanceof DataCellElement) {
			x = cell.mouseX();
			y = cell.mouseY();
			if (cell.ptInButton(x, y)) {
				var button = cell.getPtInButtonIndex(x,y);
				return new CellButtonRequest(cell, button);	
			}
			if (cell.ptInEditButton(x, y)) {
				return new EditButtonRequest(cell);
			}
            if (cell.ptInDataButton(x, y)) {
                return new DataButtonRequest(cell);
            }
            // 
			// grid.$_getSelectionRangeRect(lm, sItem, aa); 현재 selectView의 영역
			// grid._selections.contains(cell.index()) 선택된 셀이 selectionView의 영역안에 있는 가?
			if (mode != SelectionMode.NONE && style != SelectionStyle.NONE && !SelectionStyle.isSingle(style)) {
				if (grid.selections().count() > 0 && shiftKey) {
					return new SelectRequest(grid.selections(), cell,  grid.selections().itemStyle());
				} else if (style != SelectionStyle.NONE) {
					return new SelectRequest(grid.selections(), cell,  style);
				}
			}
		}
		return this._super(source, x, y, ctrlKey, shiftKey);
	},
	$_getHeaderResizeRequest: function (x, y) {
		var lm = this._grid.layoutManager();
		var w = lm.indicatorBounds().width;
		if (w <= 0) {
			w = lm.stateBarBounds().width;
		}
		if (w <= 0) {
			w = lm.checkBarBounds().width;
		}
		if (w <= 0 && (lm.fixedColCount() > 0 || lm.columnCount() > 0)) {
			w = 20;
		}
		if (w <= 0 || x >= w)
			return null;
		var r = lm.headerBounds();
		if (y > r.bottom() - 3 && y <= r.bottom()) {
			return new HeaderResizeRequest();
		}
		return null;
	},
    $_getHeaderSummaryResizeRequest: function (x, y) {
        var lm = this._grid.layoutManager();
        var w = lm.indicatorBounds().width;
        if (w <= 0) {
            w = lm.stateBarBounds().width;
        }
        if (w <= 0) {
            w = lm.checkBarBounds().width;
        }
        if (w <= 0 && (lm.fixedColCount() > 0 || lm.columnCount() > 0)) {
            w = 20;
        }
        if (w <= 0 || x >= w)
            return null;
        var r = lm.summaryBounds();
        if (y > r.bottom() - 3 && y <= r.bottom()) {
            return new HeaderSummaryResizeRequest();
        }
        return null;
    },
	$_getFooterResizeRequest: function (x, y) {
		var lm = this._grid.layoutManager();
		var w = lm.indicatorBounds().width;
		if (w <= 0) {
			w = lm.stateBarBounds().width;
		}
		if (w <= 0) {
			w = lm.checkBarBounds().width;
		}
		if (w <= 0 && (lm.fixedColCount() > 0 || lm.columnCount() > 0)) {
			w = 20;
		}
		if (w <= 0 || x >= w) {
			return null;
		}
		var r = lm.footerBounds();
		if (y >= r.y && y <= r.y + 3) {
			return new FooterResizeRequest();
		}
		return null;
	},
	$_getRowResizeRequest: function (cell, x, y) {
		var p, w, i, r, r2;
		var grid = this._grid;
		var lm = grid.layoutManager();
		var fixedItems = lm.fixedItemCount();
		var idx = -1;
		var eachRowResizable = grid.displayOptions().isEachRowResizable() && grid._rootColumn._dataLevel == 1;
		if (cell instanceof IndicatorCellElement) {
			idx = cell.index().I();
		} else if (cell instanceof  StateBarCellElement) {
			if (!grid.indicator().isVisible()) {
				idx = cell.index().I();
			}
		} else if (cell instanceof  CheckBarCellElement) {
			if (!grid.indicator().isVisible() && !grid.stateBar().isVisible()) {
				idx = cell.index().I();
			}
		} else if (cell instanceof DataCellElement) {
			if (!grid.indicator().isVisible() && !grid.stateBar().isVisible() && !grid.checkBar().isVisible() && x < 50) {
				idx = cell.index().I();
			}
		}
		if (idx < 0) {
			return null;
		}
		p = cell.localToContainer(Point.EMPTY);
		w = cell.width();
		if (w <= 0 || x < p.x || x >= p.x + w) {
			return null;
		}
		w = -1;
		if (grid.fixedOptions().isRowResizable()) {
			for (i = 0; i < fixedItems; i++) {
				if (grid.getItem(i).isResizable()) {
					if (idx == i || eachRowResizable) {
						r = lm.getItemRect(i);
						if (y >= r.bottom() - 2 && y <= r.bottom() + 2) {
							return new RowResizeRequest(i);
						} else {
							r2 = lm.footerBounds();
							if (r.bottom() >= r2.y && y >= r2.y - 2 && y <= r2.y + 2) {
								return new RowResizeRequest(i);
							}
						}
					} else {
						break;
					}
				}
			}
		}
		if (w >= 0) {
			return null;
		}
		if (grid.displayOptions().isRowResizable() || eachRowResizable) {
			if (lm.itemCount() == 0 && lm.fixedItemCount() > 0 || lm.itemCount() == 1 && lm.fullItemCount() == 0) {
				r = lm.getItemRect(0);
				r2 = lm.footerBounds();
				if (r.bottom() >= r2.y && y >= r2.y - 4 && y <= r2.y + 2) {
					return new RowResizeRequest(0);
				}
			}
			var itemCount = lm.itemCount();
			var topIndex = grid.topIndex();
			for (i = 0; i < itemCount; i++) {
				if (grid.getItem(i+fixedItems+topIndex).isResizable()) {
					if (idx - topIndex == i + fixedItems || eachRowResizable) {

						r = lm.getItemRect(i + fixedItems);
						if (y >= r.bottom() - 2 && y <= r.bottom() + 2) {
							return new RowResizeRequest(i + fixedItems);
						} else {
							r2 = lm.footerBounds();
							if (r.bottom() >= r2.y && y >= r2.y - 2 && y <= r2.y + 2) {
								return new RowResizeRequest(i + fixedItems);
							}
						}
					} else {
						break;
					}
				}
			}
		}
		return null;
	},
	_getDragTracker: function (request, x, y) {
		if (request instanceof ColumnResizeRequest) {
			return new ColumnResizeTracker(request, x, y);
		} else if (request instanceof ColumnMoveRequest) {
			if (this._grid.displayOptions().isParentChangable()) {
				return new ColumnMoveTracker3(request, x, y);
			} else {
				return new ColumnMoveTracker2(request, x, y);
			}
		} else if (request instanceof HeaderResizeRequest) {
			return new HeaderResizeTracker(this._grid, request, x, y);
        } else if (request instanceof HeaderSummaryResizeRequest) {
            return new HeaderSummaryResizeTracker(this._grid, request, x, y);
		} else if (request instanceof FooterResizeRequest) {
			return new FooterResizeTracker(this._grid, request, x, y);
		} else if (request instanceof RowResizeRequest) {
			return new RowResizeTracker(this._grid, request, x, y);
		} else if (request instanceof SelectRequest) {
            switch (request.selectStyle()) {
                case SelectionStyle.ROWS:
                    return new RowsSelectTracker(request, x, y);
                case SelectionStyle.COLUMNS:
                    return new ColumnsSelectTracker(request, x, y);
                case SelectionStyle.BLOCK:
                    return new BlockSelectTracker(request, x, y);
            }
        } else if (request instanceof DataButtonRequest) {
            return new DataButtonTracker(request);
		} else if (request instanceof EditButtonRequest) {
			return new EditButtonTracker(request);
		} else if (request instanceof CellButtonRequest) {
			return new CellButtonTracker(request);
		} else if (request instanceof ScrollThumbRequest) {
			return new ScrollThumbTracker(request, x, y);
		}
		return null;
	},
	editorActivated: function (editor) {
		this._resetFocusedView();
	},
	$_columnHeaderClicked: function (column, rightClicked, event) {
		rightClicked = arguments.length > 1 ? rightClicked : false;
		this.grid()._fireColumnHeaderClicked(column, rightClicked, event);
		this._doColumnHeaderClicked(column, rightClicked, event);
	},
	_doColumnHeaderClicked: function (column) {
	},
	_checkCellClicked: function (cell) {
		var grid = this.grid();
		if (grid.editOptions().isCheckable()) {
			var checkBar = grid.checkBar();
			var item = cell.item();
			if (item.isCheckable() && (checkBar.isShowGroup() || item.dataRow() >= 0)) {
                grid.makeItemVisible(item.index());
				grid.itemSource().checkItem(item, !item.isChecked(), checkBar.isExclusive(), true);
			}
		}
	},
	_checkAllClicked: function (cell) {
		var grid = this.grid();
		var checkBar = grid.checkBar();
		if (!grid.isEmpty() && grid.editOptions().isCheckable()) {
			if (checkBar.isShowAll() && !checkBar.isExclusive()) {
				cell.setChecked(!cell.isChecked());
				grid.itemSource().checkAll(cell.isChecked(), checkBar.isVisibleOnly(), checkBar.isCheckableOnly(), true);
			} else {
				this._checkBarHeadClicked();
			}
		}
	},
	_footerCellClicked: function (cell) {
		this.grid()._fireFooterCellClicked(cell);
	},
	_headerSummaryCellClicked: function (cell) {
		this.grid()._fireHeaderSummaryCellClicked(cell);
	},
	_checkBarHeadClicked: function () {
		this.grid()._fireCheckBarHeadClicked();
	},
	_checkBarFootClicked: function () {
		this.grid()._fireCheckBarFootClicked();
	},
	_indicatorCellClicked: function (index) {
		this.grid()._fireIndicatorCellClicked(index);
	},
	_stateBarCellClicked: function (index) {
		this.grid()._fireStateBarCellClicked(index);
	},
	_rowGroupHeadClicked: function () {
		this.grid()._fireRowGroupHeadClicked();
	},
	_rowGroupFootClicked: function () {
		this.grid()._fireRowGroupFootClicked();
	},
	_rowGroupHeaderFooterClicked: function (kind, index) {
		this.grid()._fireRowGroupHeaderFooterClicked(kind, index);
	},
	_rowGroupBarClicked: function (index) {
		this.grid()._fireRowGroupBarClicked(index);
	},
	_panelClicked: function () {
		this.grid()._firePanelClicked();
	},
	_rowGroupPanelClicked: function (cell) {
		this.grid()._fireRowGroupPanelClicked(cell);
	},
	$_elementClicked: function (element) {
		this._doElementClicked(element);
	},
	_doElementClicked: function (element) {
	},
	$_handleClicked: function (handle) {
		this._doHandleClicked(handle);
	},
	_doHandleClicked: function (handle) {
		var grid = this.grid();
		if (handle instanceof HeaderFilterHandle && grid.filteringOptions().isEnabled()) {
			grid.selectColumnFilters(handle.parent());
		}
	},
	_showTooltip: function (cellView, options) {
		var grid = this.grid();
		var tm = grid.toolTipManager();
		var lm = grid.layoutManager();
		var index = grid.pointToIndex(grid.mouseX(), grid.mouseY(),false);
		if (tm.isVisible() && this._tipCell == cellView && CellIndex.areEquals(index, this._tipIndex)) {
			return;
		}
		this._hideTooltip();
		if (cellView && options) {
			var bounds = cellView.boundsBy();
			var x = bounds.x, y =bounds.y;
			x = cellView._dataColumn && cellView._dataColumn.isFixed() ? x : Math.max(x, lm.nonfixedBounds().x);
			if (cellView instanceof MergedDataCellElement) {
				if (index) {
					var h = index.I() - Math.max(cellView.index().I(), grid.topIndex()) + 1;
					y += h * grid._layoutManager.$_calcItemHeight(grid, grid._delegate, index.I());
				} else {
					y = grid.mouseY()+8;
				}
			} else {
				y += cellView._height;
			}
			tm.show(options, x, y);
			this._tipCell = cellView;
			this._tipIndex = index.clone();
		}
	},
	_showTooltip2: function (cell) {
		var grid = this.grid();
		var index = cell.index().clone();
		var dcol = index.dataColumn();
		var dataId = index.dataId();
		var vCell = grid._validationManager._validateCellList[dataId] && grid._validationManager._validateCellList[dataId][dcol.dataIndex()];
        dcol && dcol.cursor() && grid.setCursor(dcol.cursor());
		if (grid.editOptions().isHintOnError() && (dcol && grid.isItemEditing(index.item()) && dcol.error()) || (vCell)) {
			if (vCell) {
				this._tipOptions.setMessage(vCell.message);
			} else {
				this._tipOptions.setMessage(dcol.error().message || dcol.error());
			}
			this._tipOptions.setStyles({
				background: "#eeffcc99"
			});
			this._showTooltip(cell, this._tipOptions);
		} else {
			var renderer = cell.renderer();
			if (renderer && cell instanceof MergedDataCellElement) {
				index = grid.pointToIndex(grid.mouseX(), grid.mouseY(), false);
			}
			if (renderer && !CellIndex.areEquals(index, this._tipIndex)) {
				var s = renderer.getTooltip(cell, index);
				if (s) {
					var opts = this._grid._fireShowTooltip(index, s);
					var defStyles = {
							background: "#eeffffff"
						};
					if (opts && typeof opts == "object") {
						this._tipOptions.setMessage(opts.message);
						this._tipOptions.setStyles(opts.styles ? opts.styles : defStyles);
					} else if (opts && typeof opts == "string") {
						this._tipOptions.setMessage(opts);
						this._tipOptions.setStyles(defStyles);
					} else {
						return;
					}
					this._showTooltip(cell, this._tipOptions);
				}
			}
		}
	},
	_showHeaderTooltip: function (headerCell, options) {
		var grid = this.grid();
		var tm = grid.toolTipManager();
		var lm = grid.layoutManager();
		if (tm.isVisible() && this._tipCell == headerCell) {
			return;
		}
		this._hideTooltip();
		if (headerCell && options) {
			var elt = headerCell;
			var grid = this.grid();
			if (headerCell instanceof ColumnView) {
				var x = grid.mouseX()+8, y = grid.mouseY();
			} else {
				var br = headerCell.boundsBy();
				var x = headerCell._column.isFixed() ? br.x : Math.max(br.x, lm.nonfixedBounds().x)
				var y = br.y + br.height;
			}
			tm.show(options, x, y);
			this._tipCell = headerCell;
		}
	},
	_showHeaderTooltip2:function(cell) {
		if (cell._grid.header().isShowTooltip() && this._tipCell != cell) {
			var headerCell = _cast(cell, HeaderCellElement);
			if (headerCell.isShowTooltip()) {
				var s = headerCell._tooltip || headerCell._text;
				if (s) {
					var opts = this._grid._fireShowHeaderTooltip(headerCell._column, s);
					var defStyles = {
							background: "#eeffffff"
						};
					if (opts && typeof opts == "object") {
						this._tipOptions.setMessage(opts.message);
						this._tipOptions.setStyles(opts.styles ? opts.styles : defStyles);
					} else if (opts && typeof opts == "string") {
						this._tipOptions.setMessage(opts);
						this._tipOptions.setStyles(defStyles);
					} else {
						return;
					}
					this._showHeaderTooltip(headerCell, opts);
				}
			}
		}
	},
	_hideTooltip: function () {
		this.grid().toolTipManager().close();
		this._tipCell = null;
		this._tipIndex = null;
	},
	_performRendererClick: function (index, cell, x, y, dblClick, immediate) {
		var grid = this.grid();
		if (!grid.isEditing() && index.isValid() && cell) {
			var column = index.dataColumn();
			if (column) {
				var renderer = cell.renderer(); // column.renderer;
				if (cell.ptInCell(cell.mouseX(), cell.mouseY())) {
					if (!grid.isReadOnly(index) && 
						(!dblClick && renderer.isEditable() || dblClick && renderer.isDblClickEditable()) && 
						(index.I() == (cell instanceof MergedDataCellElement ? cell.index().I()+cell.innerIndex() : cell.index().I())) && 
						(!immediate || renderer.isStartEditOnClick())) {
						var item = index.item();
						if ((grid.isItemEditing(item) || grid.canUpdate(item, index.dataField())) && grid.canWrite(index)) {
							if (grid.edit(index)) {
								renderer.performEdit(index);
							}
						}
					} else if (!dblClick && (index.I() == (cell instanceof MergedDataCellElement ? cell.index().I()+cell.innerIndex() : cell.index().I())) && renderer.isClickable(index)) {
						renderer.performClick(cell, x, y);
					}
				}
			}
		}
	}
});
var FocusView = defineClass("FocusView", LayerElement, {
	init: function (dom, options) {
		this._super(dom, "focusView");
		this._options = options;
		this._editing = false;
	},
    setEditing: function (editing, buttonWidth) {
        if (editing != this._editing) {
            this._editing = editing;
            this._buttonWidth = buttonWidth;
            this.invalidate();
        }
    },
	_doDraw: function (g) {
		var w = this.width() - (this._editing ? this._buttonWidth : 0);
        var d = this._editing ? 0 : 1;
		g.drawBoundsI(this._options._focusBackgroundBrush, this._editing ? this._options._focusActivePen : this._options._focusPen, -1, -1, w - d, this.height() - 1);
	},
	_doDrawHtml: function () {
		var w = this.width() - (this._editing ? this._buttonWidth : 0);
		var stroke = this._editing ? this._options._focusActivePen : this._options._focusPen;
		this._css.background = "";
		this._css.border = stroke.css();
	}
});

var RowFocusView = defineClass("RowFocusView", LayerElement, {
	init: function (dom, options) {
		this._super(dom, "rowFocusView");
		this._options = options;
		this._editing = false;
	},
	_doDraw: function (g) {
		g.drawBoundsI(this._options._rowFocusBackgroundBrush, null, -1, -1, this.width() , this.height() - 1);
	},
});

var InnerFocusView = defineClass("InnerFocusView", LayerElement, {
    init: function (dom, options) {
        this._super(dom, "innerFocusView");
        this._options = options;
        this._editing = false;
    },
    setEditing: function (editing, buttonWidth) {
            this._editing = editing;
            this._buttonWidth = buttonWidth;
            this.invalidate();
    },
    _doDraw: function (g) {
        var w = this.width() - (this._editing ? this._buttonWidth : 0);
        var d = this._editing ? 0 : 1;
        g.drawBoundsI(null, this._editing ? this._options._focusActivePen : this._options._innerFocusPen, -1, -1, w - d, this.height() - 1);
    },
    _doDrawHtml: function () {
        var w = this.width() - (this._editing ? this._buttonWidth : 0);
        var stroke = this._editing ? this._options._focusActivePen : this._options._innerFocusPen;
        this._css.background = "";
        this._css.border = stroke.css();
    }
});
var GridDragTracker = defineClass("GridDragTracker", DragTracker, {
	init: function(grid, name) {
		this._destroying = true;
		this._super(grid.container(), name);
		this._grid = grid;
	},
	destroy: function() {
		this._grid = null;
		this._super();
	},
	grid: function () {
		return this._grid;
	},
	isStartWhenCreated: function () {
		return false;
	},
	checkScrolling: function () {
		return this._grid.checkScrolling();
	},
	checkHScrolling: function () {
		return this._grid.checkHSCrolling();
	}
});