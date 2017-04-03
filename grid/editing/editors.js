var $$_EDITOR_THRESHOLD = _isSafari ? 1 : 0;
var $$_EMPTY_TEXT_VALUE = '***1-da*&23%^1//+)(lu%v\\3d!#~`{``~er';
var $$_EDITOR_FONT_NAME = 'Tahoma';
var $$_EDITOR_FONT_SIZE = '10pt';
var CellEditor = defineClass("CellEditor", EventAware, {
	init: function (grid, parentElement/* <body> */) {
		this._super();
		this._grid = grid;
		this._options = grid.editorOptions();
		this._displayOptions = grid.displayOptions();
		this._editorBorder = "2px solid rgb(82, 146, 247)";
		this._editorShadow = "rgba(0, 0, 0, 0.4) 1px 2px 5px";
		this._parentElement = parentElement;
		this._editor = this._createEditor(parentElement);
		this._editor.$_owner = this;
		this._editIndex = new CellIndex();
		this._controller = null;
		this._started = false;
		this._oldValue = undefined;
		this._dateConverter =  DatetimeConverter.Default;
		this._saveDateConverter = null;
		this._boolConverter = BooleanConverter.Default;
		this._saveBoolConverter = null;
		this._cellBounds = new Rectangle();
		if (this._editor) {
			if (this._editor.addEventListener) {
				this._editor.addEventListener("focus", function (e) {
					this._grid.$_setEditFocused(true,e);
				}.bind(this));
				this._editor.addEventListener("focusin", function (e) {
					this._grid.$_setEditFocused(true,e);
				}.bind(this));
				this._editor.addEventListener("blur", function (e) {
					this._grid.$_setEditFocused(false,e);
				}.bind(this));
				this._editor.addEventListener("focusout", function (e) {
					this._grid.$_setEditFocused(false,e);
				}.bind(this));
			} else {
				this._editor.attachEvent("onfocus", function (e) {
					this._grid.$_setEditFocused(true,e);
				}.bind(this));
				this._editor.attachEvent("onfocusin", function (e) {
					this._grid.$_setEditFocused(true,e);
				}.bind(this));
				this._editor.attachEvent("onblur", function (e) {
					this._grid.$_setEditFocused(false,e);
				}.bind(this));
				this._editor.attachEvent("onfocusout", function (e) {
					this._grid.$_setEditFocused(false,e);
				}.bind(this));
			}
		}
		this.setVisible(false, true);
		this.setEditorId(this._editor);
	},
	destroy: function() {
		this._destroying = true;
		if (this._editor) {
			if (this._editor.addEventListener) {
				this._editor.removeEventListener("focus",function (e) {
					this._grid.$_setEditFocused(true,e)});
				this._editor.removeEventListener("focusin", function (e) {
					this._grid.$_setEditFocused(true,e)});
				this._editor.removeEventListener("blur", function (e) {
					this._grid.$_setEditFocused(false,e)});
				this._editor.removeEventListener("focusout", function (e) {
					this._grid.$_setEditFocused(false,e)});
			}
			this._editor._inputHandlerStock = null;
		}
		this._defMaxLength = null;
		this._editorShadow = null;
		this._editorBorder = null;
		Dom.clearElements(this._container);
		if (this._container.parentNode) {
			this._container.parentNode.removeChild(this._container);
		};
		this._editor = null;
		this._container = null;
		this._grid = null;
		this._oldValue = null;
		this._super();
	},
	emptyValue: undefined,
	textCase: TextInputCase.DEFAULT,
	fontFamily: null,
	fontSize: null,
	datetimeFormat: null,
	todayChar: null,
	nowChar: null,
	booleanFormat: null,
    visible: false,
	setDatetimeFormat: function (value) {
		if (value != this._datetimeFormat) {
			this._datetimeFormat = value;
			if (value) {
				if (!this._saveDateConverter) {
					this._saveDateConverter = new DatetimeConverter(value);
				}
				this._saveDateConverter.setFormatString(value);
				this._dateConverter = this._saveDateConverter;
			} else {
				this._dateConverter = DatetimeConverter.Default;
			}
		}
	},
	setBooleanFormat: function (value) {
		if (value != this._booleanFormat) {
			this._booleanFormat = value;
			if (value) {
				if (!this._saveBoolConverter) {
					this._saveBoolConverter = new BooleanConverter(value);
				}
				this._saveBoolConverter.setFormat(value);
				this._boolConverter = this._saveBoolConverter;
			} else {
				this._boolConverter = BooleanConverter.Default;
			}
		}
	},
	editor: function () {
		return this._editor;
	},
	visible_: function () {
		return parseInt(this._container.style.width) > $$_EDITOR_THRESHOLD && parseInt(this._container.style.height) > $$_EDITOR_THRESHOLD;
	},
	setVisible: function (value, force) {
		if (value) {
			var v;
			if (this._fontFamily) {
				v = this._fontFamily;
			} else {
				v = $$_EDITOR_FONT_NAME;
			}
			if (v != this._editor.style.fontFamily) {
				this._editor.style.fontFamily = v;
			}
			if (this._fontSize) {
				v = this._fontSize;
			} else {
				v = $$_EDITOR_FONT_SIZE;
			}
			if (v != this._editor.style.fontSize) {
				this._editor.style.fontSize = v;
			}
		}
        if (value && this._editor.value == $$_EMPTY_TEXT_VALUE) {
            this._editor.value = "";
        } else if (!value && (this._editor.value == null || this._editor.value == undefined || this._editor.value == "")) {
            this._editor.value = $$_EMPTY_TEXT_VALUE;
            if (this._grid.$_editFocused) {
                this.selectAll();
            }
        }
		if (!value) {
            Dom.setSize(this._container, $$_EDITOR_THRESHOLD, $$_EDITOR_THRESHOLD);
        }
	},
	isEditing: function () {
		return this._started;
	},
	editIndex: function () {
		return this._editIndex;
	},
	hasButton: function () {
		return false;
	},
	initOptions: function () {
		this._emptyValue = undefined;
		this._booleanFormat = null;
		this._todayChar = null;
		this._nowChar = null;
		this._datetimeFormat = null;
		this._textCase = TextInputCase.DEFAULT;
		this._fontFamily = null;
		this._fontSize = null;
		this._checkHangeul = false;
	},
	applyOptions: function (options) {
		options && this.assign(options);
	},
    setController: function (value) {
        this._controller = value;
    },
	beginEdit: function (clear, select) {
		if (!this._started) {
			this._started = this._doBeginEdit();
            clear && this.clear();
            select && this.selectAll();
		}
	},
	endEdit: function () {
		if (!this._start) {
			this._doEndEdit();
			this._started = false;
		}
	},
    caretToLast: function () {
    },
	commit: function () {
		this._doCommit();
	},
	setEditIndex: function (index) {
		this._editIndex.assign(index);
	},
	setReadOnly: function (value) {
	},
	getEditValue: function (throwError) {
		return undefined;
	},
	setEditValue: function (value) {
		this._oldValue = value;
	},
	getEditText: function () {
		return "";
	},
	clear: function () {
		this._editor.value = "";
	},
	setFocus: function () {
            this._editor.focus();
	},
	selectAll: function () {
        if (this._grid.$_editFocused) {
            this._selectAll();
        }
	},
	setEditorTitle:function(index) {
		var grid = index.grid();
		var options = grid.editorOptions();
		if (this._editor && index && options && options._titleExprStatement) {
			this._editor.title = "";
			var runtime = options._titleExprRuntime;
			var cell = grid._body.getCell(index);
			var v = cell.value() instanceof Date ? this._dateConverter.getText(cell.value()) : cell.displayText();
			runtime.setCell(cell);
			runtime.setValue(v);
			var title = options._titleExprStatement.evaluate(options._titleExprRuntime)			
			this._editor.title = title;
		}
	},
	setEditorId: function(editor) {
		if (editor && editor instanceof HTMLElement) {
			var id = "_"+ (this.$name && this.$name.indexOf("CellEditor") > 0 ? this.$name.substr(0,this.$name.indexOf("CellEditor")) : "input");
			editor.id = this._grid._container._containerDiv.id+id.toLowerCase();
		}
	},
	setBounds: function (x, y, w, h) {
	},
	setCellBounds: function (x, y, w, h) {
		this._cellBounds.set(x, y, w, h);
	},
	closeList: function (accept) {
	},
	dropDownList: function(force) {
	},
	buttonClicked: function (index) {
	},
	_createEditor: function (parent) {
		return null;
	},
    _selectAll: function () {
    },
	_editField: function () {
		return this._grid.dataSource() ? this._grid.dataSource().getField(this._editIndex.dataField()) : null;
	},
    _isDateEditor: function () {
        return false;
    },
	_doBeginEdit: function () {
		return true;
	},
	_doEndEdit: function () {
	},
	_requestStart: function () {
		if (!this._started) {
			this.selectAll();
			return this._controller.onEditorStart(this);
		}
		return this._started;
	},
	$_valToStr: function (value) {
		var index = this.editIndex();
		var s = "";
		try {
			if (value !== UNDEFINED || this._mask) {
				var fld = index.grid().dataSource().getField(index.dataField());
				if (fld) {
					switch (fld.dataType()) {
						case ValueType.DATETIME:
							if (value) {
								s = this._dateConverter.getText(value);
							}
							if (this._mask) {
								s = this._mask.writeBuffer(s);
							}
							break;
						case ValueType.BOOLEAN:
							s = this._boolConverter.toText(value);
							break;
						case ValueType.NUMBER:
							if (!isNaN(value)) {
								s = _toStr(value);
							}
							break;
						default:
							s = this._mask ? this._mask.writeBuffer(value) : value;
							break;
					}
				} else {
					s = value;
				}
			}
		} catch (err) {
			_throwDebug(err);
			s = value;
		}
		return s === null ? "" : s;
	},
	$_strToVal: function (s) {
		s = _toStr(s);
		var index = this._editIndex;
		var tcase = index.dataColumn() && this._textCase == TextInputCase.DEFAULT ? index.dataColumn().textInputCase() : this._textCase;
		try {
			var fld = index.grid().dataSource().getField(index.dataField());
			if (fld) {
                var t = fld.dataType();
				if (t == ValueType.DATETIME || (s && this._isDateEditor() && t == ValueType.TEXT)) {
                    var dateFld = t == ValueType.DATETIME;
                    var d = null;
					if (s && s == this._nowChar) {
						d = new Date();
					}
					if (!d && s && s == this._todayChar) {
						d = new Date();
						d.setHours(0, 0, 0, 0);
					}
                    if (!d) {
                    	this._mask && (s = this._mask.getStripValue(s));
                        d = this._dateConverter.getDate(s);
                    }
					return dateFld ? (isNaN(d.getFullYear()) ? null : d) : this._dateConverter.getText(d);
				} else if (t == ValueType.BOOLEAN) {
					return this._boolConverter.toBoolEx(s);
				} else if (t == ValueType.NUMBER) {
                    return parseFloat(s);
                } else if (t == ValueType.TEXT) {
                   	this._mask && (s = this._mask.getStripValue(s));
                }
			}
			if (tcase === TextInputCase.UPPER) {
				return s ? s.toLocaleUpperCase() : s;
			} else if (tcase === TextInputCase.LOWER) {
				return s ? s.toLocaleLowerCase() : s;
			} else {
				return s;
			}
		} catch (err) {
			_throwDebug(err);
			return undefined;
		} 
	},
	_dispatchKeyDown: function (keyCode, ctrl, shift, alt) {
        if (!this._controller) debugger;
		return this._controller.onEditorKeyDown(this, keyCode, ctrl, shift, alt);
	},
	_dispatchKeyPress: function (keyCode) {
        if (!this._controller) debugger;
		return this._controller.onEditorKeyPress(this, keyCode);
	},
	_dispatchKeyUp: function (keyCode, ctrl, shift, alt) {
        if (!this._controller) debugger;
		return this._controller.onEditorKeyUp(this, keyCode, ctrl, shift, alt);
	},
	_dispatchChange: function () {
		this._controller.onEditorChange(this);
	},
	_dispatchSearch: function (text) {
		this._controller.onEditorSearch(this, text);
	},
	_dispatchSearchCellButtonClick: function(text) {
		return this._controller.onSearchCellButtonClick(this, text);
	},
    _dispatchCommit: function () {
        this._controller.onEditorCommit(this);
    },
	_sendToParent: function (e, flag, nohandle) {
        try {
            var ctrl = _isMac && e.metaKey || !_isMac && e.ctrlKey;
            if (flag == 2) { // key press
	            if (this._dispatchKeyPress(e.keyCode || e.which)) {
	                if (e.preventDefault) {
	                    e.preventDefault();
	                }
	                return true;
	            }
            } else if (flag == 3) { // key up
	            if (this._dispatchKeyUp(e.keyCode, ctrl, e.shiftKey, e.altKey)) {
	                if (e.preventDefault) {
	                    e.preventDefault();
	                }
	                return true;
	            };
                // maxLength를 체크해서 maxLength가 입력되었으면 다음 셀로 넘어간다.
				try {
					var grid = this._controller._grid;
					var options = grid.editOptions();
					var moveNextCell = options.isMaxLengthToNextCell();
					if (!!moveNextCell) {
						var skip = options.isSkipReadOnly();
						var activeTool = grid.activeTool && grid.activeTool();
						var maxLength = this.maxLength && this.maxLength();
						var idx = this.editIndex().clone();
						var isSpecialKey = _included(e.keyCode, Keys.UP, Keys.PAGEUP, Keys.DOWN, Keys.PAGEDOWN, Keys.F2, Keys.TAB, Keys.ENTER);
						if (!this._checkHangeul && !isSpecialKey && !ctrl && !e.altKey && grid && grid.isEditing(idx) && maxLength > 0 && !this._composing && e.keyCode > 47) {
							var len = this._editor.value.length;
							if (len >= maxLength) {
								idx.right();
								if (skip && activeTool.checkReadOnly(idx)) {
									if (!activeTool.skipReadOnly(idx, 1)) {
										idx = this.editIndex().clone();
									}
								}
								if (!CellIndex.areEquals(idx, this.editIndex())) {
									activeTool.setFocused(idx, true);
								}
								return true;
							}
						}
					}
				} catch (err) {
					if (err instanceof ValidationError) {
						throw err;
					}
					return true;
					// 오류가 나도. 정상처리하도록 한다.
	            }
            } else { // key down
	            if (this._dispatchKeyDown(e.keyCode, ctrl, e.shiftKey, e.altKey)) {
	                if (e.preventDefault) {
	                    e.preventDefault();
	                }
	                return true;
	            }
	        }
            return false;
        } finally {

        }
	}
}, {
	Unselected: {},
	InvalidFormat: {}
});

var DefaultDefinitions = function () {
	return {
        "9": new RegExp("[0-9 ]"),
        "0": new RegExp("[0-9]"),
        "a": new RegExp("[A-Za-z]"),
        "*": new RegExp("[A-Za-z0-9]")
	}
}

var EditMask = defineClass("EditMask", null, {
	init: function(editor, options) {
		this._super();
		this._definitions = new DefaultDefinitions();
		this._tests = [];
		this._placeHolder = undefined;
		this._buffer = undefined;
		this._defBuffer = undefined;
		this._editMask = undefined;
		this._editor = editor;
		this._caretTimer = undefined;
		this._showInvalidFormatMessage = true,
		this._overWrite = false;
		// this._literals = [];
		// this._includedLiteral = false;
		this.setOptions(options);
	},
	// includedLiteral: false,
	includedFormat: false,
	placeHolder:undefined,
	editMask:undefined,
	definitions:undefined,
	invalidFormatMessage: undefined,
	showInvalidFormatMessage:true,
	overWrite:false,
	destroy: function() {
		this._destroying = true;
		this._definitions = null;
		this._tests = null;
		// this._literals = null;
		this._super();
	},
	clearBuffer: function (begin, end) {
		begin = typeof begin == "number" ? begin : 0, end=typeof end == "number" ? end : this._editor.value.length;
		for (var i = begin; i < end; i++) {
			this._buffer[i] = this.$_getPlaceHolder(i);
		}
	},
	writeBuffer: function(value, isPaste) {
		var ret = "";
		if (value && this._tests && this._tests.length > 0) {
			for (var i = 0, j = 0, cnt = this._tests.length; i < cnt ; i++) {
				if ( (this._tests[i] && value[j] ) /*|| (this._includedLiteral && this.$_isLiteral(value[j]))*/|| this.isIncludedFormat() || (isPaste && value[j] === this.$_getPlaceHolder(j))) {
					this._buffer[i] = value[j];
					j++;
				}
			}
		} else {

		}
		return this._buffer && this._buffer.join("");
	},
	getStripValue: function() {
		var ret = [];
		var buf = [];
		if (this.isIncludedFormat()) {
			for (var i = 0, cnt = this._buffer.length; i < cnt ; i++) {
				ret.push( (this._buffer[i] == this.$_getPlaceHolder(i)) && (this._definitions[this._buffer[i]]) ? " ": this._buffer[i] );
			}
		} else {
			for (var i = 0, cnt = this._buffer.length; i < cnt ; i++) {
				if (this._tests[i] && this._tests[i] instanceof RegExp && this._tests[i].test(this._buffer[i])) {
					buf.length > 0 && (ret = ret.concat(buf), buf = []);
					ret.push(this._buffer[i]);
				} else if (this._tests[i] && typeof this._tests[i] == "function") {
					buf.length > 0 && (ret = ret.concat(buf), buf = []);
					ret.push(this._buffer[i]);
				} else if (this.isIncludedLiteral && this.$_isLiteral(this._buffer[i])) {
					buf.length > 0 && (ret = ret.concat(buf), buf = []);
					ret.push(this._buffer[i]);
				} else {
					// buf.push(" ");// 입력되지 않은 경우 공백으로 처리할수 있는지 확인해 보아야 한다. 
				}
			}
		}
		return ret.join("");
	},
	setOptions: function(options) {
		if (typeof options == "string") {  // mask:"9999-99-99"등과 같이 문자열로 입력한 경우 사용한다.
			this.$_parseMask(options);
		} else {
			// 순서가 문제가 되는 경우가 있어서 하나씩 지정한다. (defineClass로 만들지 않음.)
			options.definitions && this.$_parseDefinitions(options.definitions);
			options.placeHolder && (this._placeHolder = options.placeHolder);
			options.editMask && this.$_parseMask(options.editMask);
			// options.includedLiteral && (this._includedLiteral = options.includedLiteral);
			options.includedFormat && (this._includedFormat = options.includedFormat);
			options.invalidFormatMessage && (this._invalidFormatMessage = options.invalidFormatMessage);
			options.showInvlidFormatMessage && (this._showInvalidFormatMessage = options.showInvalidFormatMessage);
			options.overWrite != null && (this._overWrite = !!options.overWrite);
			// options.literals && this.$_mergeLiteral(options.literals);
		}
	},
	$_setCaret: function(start, end) {
		var editor = this._editor._editor;
		// clearTimeout(this._caretTimer);
		// this._caretTimer = setTimeout(function() {
			editor.setSelectionRange(start ,end);
		// }, 0);
	},
	checkValid: function(s) {
		// 공백을 입력할수 있는 곳을 제외한 나머지에 입력이 안되어있으면 오류처리한다. 
		for (var i = 0, cnt = this._tests.length; i < cnt ; i++) {
			var c = this._buffer[i] == this.$_getPlaceHolder(i) ? " ": this._buffer[i];
			if (this._tests[i] && !this._tests[i].test(c)) {
				return false;
			}
		}
		return true;
	},
	/* 사용자가 지정한 format */
	$_parseDefinitions: function (defs) {
		for (def in defs) {
			typeof defs[def] === "string" && (this._definitions[def] = new RegExp(defs[def]));
		}
		// this._tests.push(new RegExp("[0-9]"));
	},
	$_parseMask: function(mask) {
		var tests = this._tests = [];
		var defs = this._definitions;
		var am = mask.split("");
		this._editMask = mask;
		this._buffer = [];
		for (var i =0, cnt = am.length; i < cnt; i++) {
			tests.push(defs[am[i]]);
			this._buffer.push(defs[am[i]] ? this.$_getPlaceHolder(i) : am[i])
		}
	},
	$_getPlaceHolder: function (n) {
		if (this._placeHolder && this._placeHolder.length > n) {
			return this._placeHolder[n]
		}
		return this._tests[n] ? "_" : (this._editMask && this._editMask.length > n ? this._editMask[n] : "_");
	},
	// $_isLiteral: function(c) {
	// 	return this._literals.indexOf(c) >= 0;
	// },
	// $_mergeLiteral: function(lits) {
	// 	this._literals = !this._literals ? lits : this._literals.concat(lits);
	// },
	$_seekPrev: function(pos) {
		for (;--pos >= 0 && !this._tests[pos]; ) ;
		return pos;
	},
	$_seekNext: function(pos) {
		for (;++pos < this._editMask.length && !this._tests[pos];);
		return pos;
	},
	$_shiftL: function(begin, end) {
		var i, j;
		var len = this._editMask.length;
		var buffer = this._buffer;
		if ( begin >= 0) {
			for (i = begin, j=this.$_seekNext(end); len > i ; i++) {
				if (this._tests[i]) {
					if (!(len > j && this._tests[i].test(buffer[j]))) break;
					buffer[i] = buffer[j], buffer[j] = this.$_getPlaceHolder(j), j = this.$_seekNext(j);
				}
			}
		}
	},
	$_shiftR: function(begin) {
		var i, c, j, t;
		var len = this._editMask.length;
		var buffer = this._buffer;
		for (i = begin, c = this.$_getPlaceHolder(begin); len > i; i++)
			if (this._tests[i]) {
				if (j = this.$_seekNext(i), t = buffer[i], buffer[i] = c, !(len > j && this._tests[j].test(t)))
					break;
				c = t;
			}
	},
	keydown: function(e) {
		var editor = this._editor._editor;
		var k = e.which || e.keyCode;
		var start = editor.selectionStart, end = editor.selectionEnd;
		if (k === 46 || k === 8) {
			if (start == end) {
				start = k !== 46 ? this.$_seekPrev(start) : end = this.$_seekNext(start-1);
				end = k === 46 ? this.$_seekNext(end) : end;
			}
			this.clearBuffer(start, end);
			!this._overWrite && this.$_shiftL(start, end-1);
			editor.value = this.writeBuffer();
			this.$_setCaret(start, start);
		}
	},
	keyPress: function(e) {
		var editor = this._editor._editor;
		var pStart = editor.selectionStart, pEnd = editor.selectionEnd, k = e.which || e.keyCode;
		this.clearBuffer(pStart, pEnd);
		pStart !== pEnd && this.$_shiftL(pStart, pEnd-1);
		var p = this.$_seekNext(pStart-1);
		if (this._editMask && this._editMask.length > p && this._tests[p] && this._tests[p].test(c=String.fromCharCode(k))) {
			!this._overWrite && this.$_shiftR(pStart);
			this._buffer[p] = c;
			editor.value = this.writeBuffer();
			p = this.$_seekNext(p);
			this.$_setCaret(p, p)
		}
	}
});

var TextCellEditor = defineClass("TextCellEditor", CellEditor, {
	init: function (grid, parentElement) {
		this._super(grid, parentElement);
		this._borderable = true;
		this._modified = false;
		this._inputValue = undefined;
		this._mask = undefined;
	},
	readOnly: false,
	maxLength: 0,
	mask : null,
	setMask: function(options) {
		this._mask = null;
		if (options)
			this._mask = new EditMask(this, options);
	},

	text: function () {
		return this._editor.value;
	},
	setAlignment: function (align) {
		this._container.style.textAlign = "left";
	},
	setText: function (value) {
		if (this._editor && value != this._editor.value) {
			this._editor.value = value;
			this._doChanged();
		}
	},
	initOptions: function () {
		this._super();
		this._editor.readOnly = this._readOnly = false;
		this._maxLength = 0;
		this._mask = null;
	},
	setReadOnly: function (value) {
		this._editor.readOnly = this._readOnly = value;
	},
	_selectAll: function () {
        this._editor.select();
	},
	_doBeginEdit: function (clear, select) {
		this._modified = false;
        if (this.isVisible()) { // 당연히 visible이어야 한다.
            if (!this._editor.value) {
                this._editor.setSelectionRange(0, 0);
            }
        }
		return true;
	},
	_doEndEdit: function () {
		this._modified = false;
	},
    caretToLast: function () {
        var len = _toStr(this._editor.value).length;
        this._editor.setSelectionRange(len, len);
    },
	_doCommit: function () {
	},
	setEditIndex: function (index) {
		this._super(index);
		var grid = index && index.grid();
		if (grid) {
			/*
			 m_editor.useArrowKeys = grid.editOptions.useArrowKeys;
			 if (index.dataField >= 0 && grid.dataSource.getValueType(index.dataField) == GridValueType.Datetime) {
			 }
			 m_editor.tabConsumer = grid;
			 */
		}
		/*
		 m_editor.editable = !readOnly;
		 m_editor.maxChars = maxLength;
		 m_editor.textCase = textCase == TextInputCase.Default ? index.dataColumn.textInputCase : textCase;
		 setEditFont(grid, m_editor);
		 */
		var vcolumn = index.valueColumn();
		if (vcolumn) {
			var tcase = this._textCase == TextInputCase.DEFAULT ? vcolumn.textInputCase() : this._textCase;
			switch (tcase) {
				case TextInputCase.LOWER:
					this._editor.style.textTransform = "lowercase";
					break;
				case TextInputCase.UPPER:
					this._editor.style.textTransform = "uppercase";
					break;
				default:
					this._editor.style.textTransform = "none";
					break;
			}
			this._editor.maxLength = this._maxLength > 0 ? this._maxLength : this._defMaxLength;
		}
	},
	setEditValue: function (value) {
		this._super(value);
		this._editor.value = this.$_valToStr(value);
	},
	getEditValue: function (throwError) {
		throwError = arguments.length > 0 ? throwError : true;
		var fld = this._editField();
		var v = this._emptyValue;
		try {
			var t = fld.dataType();
			var s = this._editor.value;
			if (t == ValueType.TEXT) {
				if (!s && this._emptyValue !== undefined) {
					s = this._emptyValue;
				}
				v = this.$_strToVal(s);
                if (v === undefined) {
                    v = "";
                }
			} else {
				if (!_isWhiteSpace(s)) {
					v = this.$_strToVal(s);
				} else if (this._emptyValue !== undefined) {
					v = this.$_strToVal(this._emptyValue);
				} else {
					switch (t) {
						case ValueType.NUMBER:
							if (isNaN(this._oldValue)) {
								v = NaN;
							}
							break;
						case ValueType.DATETIME:
							if (this._oldValue === null) {
								v = null;
							}
							break;
						case ValueType.BOOLEAN:
							break;
					}
				}
			}
			if (v === CellEditor.InvalidFormat) 
				return v;
			v = fld.readValue(v);
		} catch (e) {
			if (throwError) throw e;
			v = this._emptyValue;
		}
		return v;
	},
	getEditText: function () {
		return this._editor.value;
	},
	isEdited: function () {
		return this._modified;
	},
	setVisible: function (value, force) {
		this._super(value, force);
		if (value && this._borderable) {
			var editorBorder = this._displayOptions ? this._displayOptions._focusActivePen.css() : this._editorBorder;
			this._container.style["border"] = editorBorder;
			this._container.style["box-shadow"] = this._editorShadow;
		} else {
			this._container.style["border"] = "none";
			this._container.style["box-shadow"] = "none";
		}
		if (_isWinSafari) {
			try {
				this._editor.style["width"] = this._container.getBoundingClientRect().width+"px";
				this._container.style.cssText = this._container.style.cssText.replace(/border-width: initial; border-color: initial; /g,"");			
			} catch(err) {}
			setTimeout(function() {this._editor.style["width"] = "100%";}.bind(this), 0);
		}
	},
	_createContainer2: function () {
		var elt = document.createElement("div");
		elt["spellCheck"] = false;
		elt["aria-hidden"] = false;
		elt.style["position"] = "absolute";
		elt.style["z-index"] = 2000;
		elt.style["resize"] = "none";
		elt.style["border"] = "none";
		elt.style["outline"] = "none";
		elt.style["aria-hidden"] = false;
		elt.style["font-family"] = "Tahoma";
		elt.style["font-style"] = "normal";
		elt.style["font-variant"] = "normal";
		elt.style["font-weight"] = "normal";
		elt.style["font-size"] = "13px";
		elt.style["line-height"] = "normal";
		elt.style["text-align"] = "left";
		elt.style["padding"] = "1px 2px";
		elt.style["margin"] = "0px";
		elt.style["max-width"] = "none";
		elt.style["max-height"] = "none";
		elt.style["overflow"] = "hidden";
		elt.style["background-color"] = "rgb(255, 255, 255)";
		elt.style["box-shadow"] = "none";
		elt.style["color"] = "rgb(68, 84, 106)";
		elt.style["word-wrap"] = "break-word";
		return elt;
	},
	_createEditor2: function (parent) {
		this._container = this._createContainer2();
		parent.appendChild(this._container);
		var elt = document.createElement("div");
		elt["contenteditable"] = true;
		elt.style["width"] = "100%";
		elt.style["height"] = "100%";
		elt.style["margin"] = 0;
		elt.style["outline"] = "none";
		elt.style["cursor"] = "text";
		elt.style["-webkit-user-modify"] = "read-write-plaintext-only";
		elt.style["white-space"] = "pre-wrap";
		elt.style["-webkit-transform"] = "translateZ(0)";
		this._container.appendChild(elt);
		return elt;
	},
	_createContainer: function () {
		var elt = document.createElement("div");
		elt.spellcheck = false;
		elt["aria-hidden"] = false;
		elt.style["outline"] = "none";
		elt.style["aria-hidden"] = false;
		elt.style["position"] = "absolute";
		elt.style["z-index"] = 2000;
		elt.style.boxSizing = "border-box";
		elt.style["overflow"] = "hidden";
		elt.style["border"] = "none";
		elt.style["width"] = "0px";
		elt.style["height"] = "0px";
		elt.style["padding"] = "0px";
		elt.style["margin"] = "0px";
		elt.style.border = this._editorBorder;
		elt.style.boxShadow = this._editorShadow;
		elt.style.resize = "none";
		/*
		elt["spellCheck"] = false;
		elt["aria-hidden"] = false;
		elt.style["outline"] = "none";
		elt.style["aria-hidden"] = false;
		elt.style["max-width"] = "none";
		elt.style["max-height"] = "none";
		elt.style["background-color"] = "rgb(255, 255, 255)";
		elt.style["box-shadow"] = "rgba(0, 0, 0, 0.4) 1px 2px 5px";
		elt.style["color"] = "rgb(68, 84, 106)";
		elt.style["word-wrap"] = "break-word";
		*/
		return elt;
	},
	_createEditor: function (parent) {
		this._container = this._createContainer();
		parent.appendChild(this._container);
		var elt = document.createElement("input");
		elt.autoComplete = "off";
		elt.style.position = "absolute";
		elt.style.margin = "0px";
		elt.style.padding = "0px";
		elt.style.fontFamily = $$_EDITOR_FONT_NAME;
		elt.style.fontStyle = "normal";
		elt.style.fontVariant = "normal";
		elt.style.fontWeight = "normal";
		elt.style.fontSize = $$_EDITOR_FONT_SIZE;
		elt.style.lineHeight = "normal";
		elt.style.wordWrap = "normal";
		elt.style.overflow = "hidden";
		elt.style.resize = "none";
		elt.style.border = "none";
		elt.style.outline = "none";
		elt.style.textAlign = "left";
		elt.style.color = "rgb(68, 84, 106)";
		elt.style.left = "0px";
		elt.style.top = "0px";
		elt.style.width = "100%";
		elt.style.height = "100%";
		elt.style.imeMode = "auto";
		elt.style.cursor = "text";
		elt.style["-webkit-user-modify"] = "read-write-plaintext-only";
		elt.style["white-space"] = "pre-wrap";
		elt.style["-webkit-transform"] = "translateZ(0)";
		elt.onkeydown = this._keyDownHandler.bind(this);
		elt.onkeyup = this._keyUpHandler.bind(this);
		elt.onkeypress = this._keyPressHandler.bind(this);
		elt.onchange = this._changeHandler.bind(this);
		elt.oninput = this._inputHandlerStock = this._inputHandler.bind(this);
		elt.onpaste = this._pasteHandler.bind(this);
		elt.oncopy = this._copyHandler.bind(this);
		if (elt.addEventListener) {
			elt.addEventListener("compositionstart", this._compositionstartHandler.bind(this));
			elt.addEventListener("compositionupdate", this._compositionupdateHandler.bind(this));
			elt.addEventListener("compositionend", this._compositionendHandler.bind(this));
			elt.addEventListener("text", this._textHandler.bind(this));
			// elt.addEventListener("selectionchange", function (ev) {
			// 	_log("########################### S E L C H");
			// });
		} else {
			elt.attachEvent("oncompositionstart", this._compositionstartHandler.bind(this));
			elt.attachEvent("oncompositionupdate", this._compositionupdateHandler.bind(this));
			elt.attachEvent("oncompositionend", this._compositionendHandler.bind(this));
			elt.attachEvent("ontext", this._textHandler.bind(this));
			// elt.attachEvent("onselectionchange", function (ev) {
			// 	_log("########################### S E L C H");
			// });
		}
		this._container.appendChild(elt);
		this._defMaxLength = elt.maxLength > 0 ? elt.maxLength : 1000000; // ff에서는 기본값이 -1
		return elt;
	},
	_focusHandler: function () {
		if ($_debug) debugger;
	},
	_keyDownHandler: function (e) {
		var editor = this._editor;
        var k = e.keyCode;
        if ((_isIE || _isEdge) && !this.isVisible() && e.ctrlKey && k == Keys.Z) {
            return false;
        }
        this._inputValue = editor.value;
		switch (k) {
		case Keys.BACK:
		case Keys.DELETE:
			if (!this._sendToParent(e)) {
				if (!this.isVisible() && this._requestStart()) {
                    if (!this._editor.readOnly && this._editor.value) {
						if (this._mask) {
			                e.preventDefault();
			                e.stopImmediatePropagation();
							this._mask.keydown(e);
							this._doChanged(); // 일반 editor에서는 _inputHandler 에서 doChanged가 발생된다.
						} else {                 	
                        	this.setText("");
                        }
                    }
				} else if (this._mask) {
	                e.preventDefault();
	                e.stopImmediatePropagation();
					this._mask.keydown(e);
					this._doChanged(); // 일반 editor에서는 _inputHandler 에서 doChanged가 발생된다.
				}
			}
			break;
		case Keys.TAB:
			return !this._sendToParent(e);
		case Keys.LEFT:
			if (!this.isVisible() || (editor.selectionEnd == 0 && editor.selectionEnd == editor.selectionStart)) {
				return !this._sendToParent(e);
			}
			if (this._editor.readOnly && _isChrome) {
				return !this._sendToParent(e);
			}
			break;
		case Keys.RIGHT:
			if (!this.isVisible() || (editor.selectionEnd == editor.value.length && editor.selectionEnd == editor.selectionStart)) {
				return !this._sendToParent(e);
			}
			if (this._editor.readOnly && _isChrome) {
				return !this._sendToParent(e);
			}
			break;
		case Keys.HOME:
			if (!this.isVisible()) {
				return !this._sendToParent(e);
			}
			e.stopImmediatePropagation();
			break;
		case Keys.END:
			if (!this.isVisible()) {
				return !this._sendToParent(e);
			}
			e.stopImmediatePropagation();
			break;
		case Keys.SPACE:
			if (!this.isVisible()) {
				return !this._sendToParent(e);
			}
			break;
		case Keys.UP:
		case Keys.DOWN:
		case Keys.PAGEUP:
		case Keys.PAGEDOWN:
		case Keys.ENTER:
		case Keys.ESCAPE:
		case Keys.F2:
        case Keys.INSERT:
			e.preventDefault(); // 이걸 먼저 하지 않으면 ff 등에서 input 이벤트로 발생된다.
			e.stopImmediatePropagation();
			return !this._sendToParent(e);
		case 229: // ime 변환 키 등...
			this._sendToParent(e);
			break;
		default: 
			return !this._sendToParent(e, null, true);
		}

		if (_isFirefox) {
			if (!e.ctrlKey && !e.altKey && (k == 0 || k >= 32) && (k < 0x70 || k > 0x82)) {
				this._requestStart();
			}
		}
		else if (_isIE) {
			if (k == 229) {
			}
		}
		return true; // false를 return하면 chrome에서는 key 입력이 진행되지 않는다.
	},
	_keyUpHandler: function (e) {
		var key = e.keyCode;
		if (key == Keys.BACK || key == Keys.DELETE) {
			if (_ieOld && this.isVisible() && !this._editor.readOnly && this._editor.value != this._inputValue) {
				this._doChanged();
			}
		}
		switch (e.keyCode) {
			case Keys.LEFT:
			case Keys.RIGHT:
			case Keys.HOME:
			case Keys.END:
			case Keys.SPACE:
				if (!this.isVisible()) {
					this._sendToParent(e,3);
				}
				break;
			default:
				this._sendToParent(e,3);
				break;			
		}
	},
	_keyPressHandler: function (e) {
        var k = e.which || e.keyCode;
		this._sendToParent(e,2);
        if (_isFirefox) {
            if (!e.ctrlKey && !e.altKey && (k == 0 || k >= 32) && (e.charCode && !e.keyCode)) {
            	if (!this._requestStart()) {
					e.preventDefault()
            	} else if (this._mask){
					this._mask.keyPress(e);
					this._doChanged();
					e.preventDefault();
            	};
            }
        } else if (k >= 32) {
        	if (!this._requestStart()) {
        		e.preventDefault();
        	} else {
        		if (this._mask) {
					this._mask.keyPress(e);
					this._doChanged();
					e.preventDefault();
        		}
        	}
			// !this._requestStart() ? e.preventDefault() : null; 
		}
	},
    _textHandler: function () {
        this._requestStart();
    },
    _compositionstartHandler: function () {
        this._composing = true;
        this._requestStart();
        if (this._started && !this._editor.readOnly) {
            this._modified = true;
            this._dispatchChange();
            this._checkHangeul = true;
        }
    },
    _compositionupdateHandler: function () {
        this._composing = true;
    },
    _compositionendHandler: function (e) {
        this._composing = false;
    },
	/*
	  키 입력 외에 값이 변겨됐을 때 모두 호출되므로 피해야 한다.
	_changeHandler: function (e) {
		if (this.isVisible() && !this._editor.readOnly) {
			this._doChanged();
		}
	},
     */
    _changeHandler: function (e) {
        /*
        if (this.isVisible() && !this._editor.readOnly) {
            console.log("### EDITOR.VALUE = " + this._editor.value);
        }
        */
    },
	_inputHandler: function (e) {
		/* IE 10에서는 placeholder가 있는 경우 oninput event가 focusin, focusout시점에 발생한다. 입력된 값을 확인해서 입력이 아니면 return*/
		if (_ieTen) {
			if (this._editor.value == $$_EMPTY_TEXT_VALUE) {
				return;
			}
			if (((this._inputValue == undefined || this._inputValue == null) ? "" : this._inputValue) === this._editor.value) {
				return;
			};
		}
		this._doChanged();
	},
	_pasteHandler: function (e) {
		function getClipText(e) {
			var clp = (e.originalEvent || e).clipboardData;
			if (clp) {
				return clp.getData('text/plain');
			} else {
				return window.clipboardData.getData("text");
			}
		};
		var text = getClipText(e);
		var data = new ClipboardSource(text);
		var mask = this._mask;
		if (this.isVisible()) {
			if (mask) {
				e.preventDefault();
				text =  data.get(0)[0];
				var editText = this._editor.value;
				var startPos = this._editor.selectionStart;
				var endPos = this._editor.selectionEnd;
				editText = editText.substr(0, startPos) + text + editText.substr(endPos);
				this._editor.value = mask.writeBuffer(editText, true);
			}
			this._doChanged();
			return;
		}
		e.preventDefault();
		try {
			if (mask) {
				if (data.isSingle() && this._requestStart()) {
					this._editor.value = mask.writeBuffer(data.get(0)[0],true);
					this._doChanged();
					return;
				}
			}
			if (text != null) {
				this._grid.pasteFromClipboard(text);
			}
		} catch (err) {
			if (err instanceof ValidationError) {
				throw err;
			} else if (err instanceof AbortError) {
				alert(err.message);
			} else if (err) {
				throw err;
			}
		}
	},
	_copyHandler: function (e) {
		if (!this.isEditing()) {
			var data = this._grid.copyToClipboard();
			if (data != null) {
				if (_win.clipboardData) {
					_win.clipboardData.setData("Text", data);
				} else {
					e.clipboardData.setData('text/plain', data);
				}
			}
			return e.preventDefault();
		}
	},
	_doChanged: function () {
		this._requestStart();
		if (this._started && !this._editor.readOnly) {
			this._modified = true;
			this._dispatchChange();
		}
	},
	setBounds: function (x, y, w, h) {
		Dom.setBounds(this._container, x, y, w, h);
	},
	
});
var LineCellEditor = defineClass("LineCellEditor", TextCellEditor, {
	init: function (grid, parentElement) {
		this._super(grid, parentElement);
	}
});
var MultiLineCellEditor = defineClass("MultiLineCellEditor", CellEditor, {
	init: function (grid, parentElement) {
		this._super(grid, parentElement);
		this._modified = false;
	},
	readOnly: false,
	maxLength: 0,
	minHeight: 0,
	text: function () {
		return this._editor.value;
	},
	setAlignment: function (align) {
		this._container.style.textAlign = "left";
	},
	initOptions: function () {
		this._super();
		this._editor.readOnly = this._readOnly = false;
		this._maxLength = 0;
		this._minHeight = 0;
	},
	setReadOnly: function (value) {
		this._editor.readOnly = this._readOnly = value;
	},
	_selectAll: function () {
		this._editor.select();
	},
	_doBeginEdit: function (clear, select) {
		this._modified = false;
        if (this.isVisible()) { // 당연히 visible이어야 한다.
            if (!this._editor.value) {
                this._editor.setSelectionRange(0, 0);
            }
        }
		return true;
	},
	_doEndEdit: function () {
		this._modified = false;
	},
	_doCommit: function () {
	},
	setEditIndex: function (index) {
		this._super(index);
		var grid = index && index.grid();
		if (grid) {
			/*
			 m_editor.useArrowKeys = grid.editOptions.useArrowKeys;
			 if (index.dataField >= 0 && grid.dataSource.getValueType(index.dataField) == GridValueType.Datetime) {
			 }
			 m_editor.tabConsumer = grid;
			 */
		}
		/*
		 m_editor.editable = !readOnly;
		 m_editor.maxChars = maxLength;
		 m_editor.textCase = textCase == TextInputCase.Default ? index.dataColumn.textInputCase : textCase;
		 setEditFont(grid, m_editor);
		 */
		var tcase = this._textCase == TextInputCase.DEFAULT ? index.dataColumn().textInputCase : this._textCase;
		switch (tcase) {
			case TextInputCase.LOWER:
				this._editor.style.textTransform = "lowercase";
				break;
			case TextInputCase.UPPER:
				this._editor.style.textTransform = "uppercase";
				break;
			default:
				this._editor.style.textTransform = "none";
				break;
		}
		this._editor.maxLength = this._maxLength > 0 ? this._maxLength : 2000000000;
	},
	setEditValue: function (value) {
		this._super(value);
		this._editor.value = this.$_valToStr(value);
	},
	getEditValue: function (throwError) {
		throwError = arguments.length > 0 ? throwError : true;
		var fld = this._editField();
		var v = fld.nullValue;
		try {
			var t = fld.dataType();
			var s = this._editor.value;
			if (t == ValueType.TEXT) {
				if (!s && this._emptyValue !== undefined) {
					s = this._emptyValue;
				}
				v = this.$_strToVal(s);
                if (v === undefined) {
                    v = "";
                }
			} else {
				if (!_isWhiteSpace(s)) {
					v = this.$_strToVal(s);
				} else if (this._emptyValue !== undefined) {
					v = this.$_strToVal(this._emptyValue);
				} else {
					switch (t) {
						case ValueType.NUMBER:
							if (isNaN(this._oldValue)) {
								v = NaN;
							}
							break;
						case ValueType.DATETIME:
							if (this._oldValue === null) {
								v = null;
							}
							break;
						case ValueType.BOOLEAN:
							break;
					}
				}
			}
			v = fld.readValue(v);
		} catch (e) {
			if (throwError) throw e;
		}
		return v;
	},
	getEditText: function () {
		return this._editor.value;
	},
	isEdited: function () {
		return this._modified;
	},
	setVisible: function (value, force) {
		this._super(value, force);
		if (value) {
			var editorBorder = this._displayOptions ? this._displayOptions._focusActivePen.css() : this._editorBorder;
			this._container.style["border"] = editorBorder;
			this._container.style["box-shadow"] = this._editorShadow;
		} else {
			this._container.style["border"] = "none";
			this._container.style["box-shadow"] = "none";
		}
		if (_isWinSafari) {
			try {
				this._editor.style["width"] = this._container.getBoundingClientRect().width+"px";
				this._container.style.cssText = this._container.style.cssText.replace(/border-width: initial; border-color: initial; /g,"");			
			} catch(err) {}
			setTimeout(function() {this._editor.style["width"] = "100%";}.bind(this), 0);
		}
	},
	_createContainer: function () {
		var elt = document.createElement("div");
		elt.spellcheck = false;
		elt.style["position"] = "absolute";
		elt.style["z-index"] = 2000;
		elt.style.boxSizing = "border-box";
		elt.style["overflow"] = "hidden";
		elt.style["border"] = "none";
		elt.style["width"] = "0px";
		elt.style["height"] = "0px";
		elt.style["padding"] = "0px";
		elt.style["margin"] = "0px";
		elt.style.backgroundColor = "#fff";
		elt.style.border = "none";
		elt.style.boxShadow = "rgba(0, 0, 0, 0.4) 1px 2px 5px";
		elt.style.resize = "none";
		/*
		 elt["spellCheck"] = false;
		 elt["aria-hidden"] = false;
		 elt.style["outline"] = "none";
		 elt.style["aria-hidden"] = false;
		 elt.style["max-width"] = "none";
		 elt.style["max-height"] = "none";
		 elt.style["background-color"] = "rgb(255, 255, 255)";
		 elt.style["box-shadow"] = "rgba(0, 0, 0, 0.4) 1px 2px 5px";
		 elt.style["color"] = "rgb(68, 84, 106)";
		 elt.style["word-wrap"] = "break-word";
		 */
		return elt;
	},
	_createEditor: function (parent) {
		this._container = this._createContainer();
		parent.appendChild(this._container);
		var elt = document.createElement("textarea");
		elt.autoComplete = "off";
		elt.style.tabIndex = -1;
		elt.style.position = "absolute";
		elt.style.margin = "0px";
		elt.style.padding = "0px";
		elt.style.fontFamily = $$_EDITOR_FONT_NAME;
		elt.style.fontStyle = "normal";
		elt.style.fontVariant = "normal";
		elt.style.fontWeight = "normal";
		elt.style.fontSize = $$_EDITOR_FONT_SIZE;
		elt.style.lineHeight = "normal";
		elt.style.wordWrap = "normal";
		elt.style.overflow = "hidden";
		elt.style.resize = "none";
		elt.style.border = "none";
		elt.style.outline = "none";
		elt.style.textAlign = "left";
		elt.style.color = "rgb(68, 84, 106)";
		elt.style.left = "0px";
		elt.style.top = "0px";
		elt.style.width = "100%";
		elt.style.height = "100%";
		elt.style.imeMode = "auto";
		elt.style.cursor = "text";
		elt.style["-webkit-user-modify"] = "read-write-plaintext-only";
		elt.style["white-space"] = "pre";
		elt.style["-webkit-transform"] = "translateZ(0)";
		elt.onkeydown = this._keyDownHandler.bind(this);
		elt.onkeyup = this._keyUpHandler.bind(this);
		elt.onkeypress = this._keyPressHandler.bind(this);
		elt.oninput = this._inputHandler.bind(this);
		elt.onpaste = this._pasteHandler.bind(this);
		elt.oncopy = this._copyHandler.bind(this);
		if (elt.addEventListener) {
			elt.addEventListener("compositionstart", this._compositionstartHandler.bind(this));
			elt.addEventListener("compositionupdate", this._compositionupdateHandler.bind(this));
			elt.addEventListener("compositionend", this._compositionendHandler.bind(this));

			elt.addEventListener("text", this._textHandler.bind(this));
		} else {
			elt.attachEvent("oncompositionstart", this._compositionstartHandler.bind(this));
			elt.attachEvent("oncompositionupdate", this._compositionupdateHandler.bind(this));
			elt.attachEvent("oncompositionend", this._compositionendHandler.bind(this));
			elt.attachEvent("ontext", this._textHandler.bind(this));
		}
		this._container.appendChild(elt);
		return elt;
	},
	_textHandler: function () {
		this._requestStart();
	},
	_compositionstartHandler: function () {
		trace("########## COMPOSITION START: ");
        this._composing = true;
		this._requestStart();
	},
	_compositionendHandler: function () {
        this._composing = false;
	},
	_compositionupdateHandler: function() {
        this._composing = true;
	},
	_keyDownHandler: function (e) {
        trace("########## EDITOR KEYDOWN: " + e.keyCode);
		var editor = this._editor;
        var k = e.keyCode;
        if ( (_isIE || _isEdge) && !this.isVisible() && e.ctrlKey && k == Keys.Z) {
            return false;
        }
        switch (k) {
			case Keys.BACK:
			case Keys.DELETE:
				if (!this._sendToParent(e)) {
					if (!this.isVisible() && this._requestStart()) {
						e.preventDefault();
						e.stopImmediatePropagation();
                        if (!this._editor.readOnly && this._editor.value) {
                            this._editor.value = ""; // null이라고 하면 "NULL"이라 쓰는 브라우저가 있더라...
                            this._modified = true;
                            this._dispatchChange();
                        }
					}
				}
				break;
			case Keys.TAB:
				return !this._sendToParent(e);
			case Keys.LEFT:
				if (!this.isVisible() || (editor.selectionEnd == 0 && editor.selectionEnd == editor.selectionStart)) {
					return !this._sendToParent(e);
				}
				break;
			case Keys.RIGHT:
				if (!this.isVisible() || (editor.selectionEnd == editor.value.length && editor.selectionEnd == editor.selectionStart)) {
					return !this._sendToParent(e);
				}
				break;
			case Keys.HOME:
				if (!this.isVisible()) {
					return !this._sendToParent(e);
				}
				e.stopImmediatePropagation();
				break;
			case Keys.END:
				if (!this.isVisible()) {
					return !this._sendToParent(e);
				}
				e.stopImmediatePropagation();
				break;
			case Keys.UP:
			case Keys.PAGEUP:
				if (!this.isVisible()) {
					return !this._sendToParent(e);
				}
				e.stopImmediatePropagation();
				break;
			case Keys.DOWN:
			case Keys.PAGEDOWN:
				if (!this.isVisible()) {
					return !this._sendToParent(e);
				}
				e.stopImmediatePropagation();
				break;
			case Keys.SPACE:
				if (!this.isVisible()) {
					return !this._sendToParent(e);
				}
				break;
			case Keys.ENTER:
				if (!e.ctrlKey && !e.shiftKey) {
					return !this._sendToParent(e);
				}
				if (e.ctrlKey && !e.shiftKey) {
					e.stopImmediatePropagation();
					var s = editor.value;
					if (s) {
						var i = editor.selectionEnd;
						s = s.substring(0, i) + "\r\n" + s.substring(i);
						editor.value = s;
						editor.setSelectionRange(i + 1, i + 1);
						this._doChanged();
					}
				}
				break;
			case Keys.ESCAPE:
			case Keys.F2:
			case Keys.INSERT:
				e.preventDefault();
				e.stopImmediatePropagation();
				return !this._sendToParent(e);
			case 229: // ime 변환 키 등...
				break;
			default: 
				this._sendToParent(e, null, true);
				return true;
		}
		if (e.keyCode == 0) {
		}
		return true;
	},
	_keyUpHandler: function (e) {
		var key = e.keyCode;
		if (key == Keys.BACK || key == Keys.DELETE) {
			if (_ieOld && this.isVisible() && !this._editor.readOnly && this._editor.value != this._inputValue) {
				this._doChanged();
			}
		}
		switch (e.keyCode) {
			case Keys.LEFT:
			case Keys.RIGHT:
			case Keys.HOME:
			case Keys.END:
			case Keys.SPACE:
				if (!this.isVisible()) {
					this._sendToParent(e,3);
				}
				break;
			default:
				this._sendToParent(e,3);
				break;			
		}
	},
	_keyPressHandler: function (e) {
		if (e.keyCode >= 32) {
			!this._requestStart() ? e.preventDefault() : null;
		}
	},
	_inputHandler: function (e) {
		this._doChanged();
	},
	_pasteHandler: function (e) {
		if (this.isVisible()) {
			this._doChanged();
			return;
		}
		e.preventDefault();
		try {
			var text;
			var clp = (e.originalEvent || e).clipboardData;
			if (clp) {
				text = clp.getData('text/plain');
			} else {
				text = window.clipboardData.getData("text");
			}
			if (text != null) {
				this._grid.pasteFromClipboard(text);
			}
		} catch (err) {
			if (err instanceof ValidationError) {
				throw err;
			} else if (err instanceof AbortError) {
				alert(err.message);
			} else if (err) {
				throw err;
			}
		}
	},
	_copyHandler: function (e) {
		if (!this.isEditing()) {
			var data = this._grid.copyToClipboard();
			if (data != null) {
				if (_win.clipboardData) {
					_win.clipboardData.setData ("Text", data);
				} else {
					e.clipboardData.setData('text/plain', data);
				}
			}
			return e.preventDefault();
		}
	},
	setBounds: function (x, y, w, h) {
		Dom.setBounds(this._container, x, y, w, h);
		if (x > $_INVISIBLE_EDIT_BOUNDS.x)
			this.$_resetBounds();
	},
	_doChanged: function () {
		this._requestStart();
		if (this._started && !this._editor.readOnly) {
			this._modified = true;
			this._dispatchChange();
			this.$_resetBounds();
		}
	},
	$_resetBounds: function () {
		var r = Dom.getBounds(this._container);
		var x = r.cx;
		var y = r.cy;
		var w = r.width;// Math.max(r.width, this._editor.scrollWidth + 4);
		var h = Math.round(r.height); //Math.max(r.height, this._editor.scrollHeight + 4);
		var empty = this._editor.value == $$_EMPTY_TEXT_VALUE;
		if (!empty && this._editor.scrollWidth > w) {
			w = this._editor.scrollWidth + 6;
		}
		if (!empty && this._editor.scrollHeight > h) {
			h = this._editor.scrollHeight + 6;
		}
		var minHeight = isNaN(parseInt(this._minHeight)) ? 0 : parseInt(this._minHeight);
		if ( minHeight > 0 ) {
			h = Math.max(h, minHeight);
		}
		r = Dom.getBounds(this._parentElement);
		w = Math.min(r.width, w);
		h = Math.min(r.height, h);
		if (x + w > r.width) {
			x = r.width - w;
		}
		if (y + h > r.height) {
			y = r.height - h;
		}
		Dom.setBounds(this._container, Math.max(x, 0), Math.max(y, 0), w, h);
	}
});
var MultiLineCellEditor2 = defineClass("MultiLineCellEditor2", CellEditor, {
	init: function (grid, parentElement) {
		this._super(grid, parentElement);
		this._modified = false;
	},
	readOnly: false,
	maxLength: 0,
	text: function () {
	},
	setText: function () {
	},
	setAlignment: function (align) {
		this._container.style.textAlign = "left";
	},
	initOptions: function () {
		this._super();
		this._editor.readOnly = this._readOnly = false;
		this._maxLength = 0;
	},
	setReadOnly: function (value) {
		this._editor.readOnly = this._readOnly = value;
	},
	_selectAll: function () {
		this._editor.select();
	},
	_doBeginEdit: function (clear, select) {
		this._modified = false;
        if (this.isVisible()) { // 당연히 visible이어야 한다.
            if (!this._editor.value) {
                this._editor.setSelectionRange(0, 0);
            }
        }
		return true;
	},
	_doEndEdit: function () {
		this._modified = false;
	},
	_doCommit: function () {
	},
	setEditIndex: function (index) {
		this._super(index);
		var grid = index && index.grid();
		if (grid) {
			/*
			 m_editor.useArrowKeys = grid.editOptions.useArrowKeys;
			 if (index.dataField >= 0 && grid.dataSource.getValueType(index.dataField) == GridValueType.Datetime) {
			 }
			 m_editor.tabConsumer = grid;
			 */
		}
		/*
		 m_editor.editable = !readOnly;
		 m_editor.maxChars = maxLength;
		 m_editor.textCase = textCase == TextInputCase.Default ? index.dataColumn.textInputCase : textCase;
		 setEditFont(grid, m_editor);
		 */
		var tcase = this._textCase == TextInputCase.DEFAULT ? index.dataColumn().textInputCase : this._textCase;
		switch (tcase) {
			case TextInputCase.LOWER:
				this._editor.style.textTransform = "lowercase";
				break;
			case TextInputCase.UPPER:
				this._editor.style.textTransform = "uppercase";
				break;
			default:
				this._editor.style.textTransform = "none";
				break;
		}
		this._editor.maxLength = this._maxLength > 0 ? this._maxLength : 2000000000;
	},
	setEditValue: function (value) {
		this._super(value);
		this._editor.value = this.$_valToStr(value);
	},
	getEditValue: function (throwError) {
		throwError = arguments.length > 0 ? throwError : true;
		var fld = this._editField();
		var v = fld.nullValue;
		try {
			var t = fld.dataType();
			var s = this._editor.value;
			if (t == ValueType.TEXT) {
				if (!s && this._emptyValue !== undefined) {
					s = this._emptyValue;
				}
				v = this.$_strToVal(s);
                if (v === undefined) {
                    v = "";
                }
			} else {
				if (!_isWhiteSpace(s)) {
					v = this.$_strToVal(s);
				} else if (this._emptyValue !== undefined) {
					v = this.$_strToVal(this._emptyValue);
				} else {
					switch (t) {
						case ValueType.NUMBER:
							if (isNaN(this._oldValue)) {
								v = NaN;
							}
							break;
						case ValueType.DATETIME:
							if (this._oldValue === null) {
								v = null;
							}
							break;
						case ValueType.BOOLEAN:
							break;
					}
				}
			}
			v = fld.readValue(v);
		} catch (e) {
			if (throwError) throw e;
		}
		return v;
	},
	getEditText: function () {
		return this._editor.value;
	},
	isEdited: function () {
		return this._modified;
	},
	_selectAll: function () {
		if (document.selection) {
			var range = document.body.createTextRange();
			range.moveToElementText(this._editor);
			range.select();
		} else if (window.getSelection) {
			var range = document.createRange();
			range.selectNode(this._editor);
			window.getSelection().addRange(range);
		}
	},
	_createContainer: function () {
		var elt = document.createElement("div");
		elt.spellcheck = false;
		elt.style["position"] = "absolute";
		elt.style["z-index"] = 2000;
		elt.style.boxSizing = "border-box";
		elt.style["overflow"] = "hidden";
		elt.style["border"] = "none";
		elt.style["width"] = "0px";
		elt.style["height"] = "0px";
		elt.style["padding"] = "1px";
		elt.style["margin"] = "0px";
		elt.style.backgroundColor = "#fff";
		elt.style.border = "2px solid rgb(82, 146, 247)";
		elt.style.boxShadow = "rgba(0, 0, 0, 0.4) 1px 2px 5px";
		elt.style.resize = "none";
		/*
		 elt["spellCheck"] = false;
		 elt["aria-hidden"] = false;
		 elt.style["outline"] = "none";
		 elt.style["aria-hidden"] = false;
		 elt.style["max-width"] = "none";
		 elt.style["max-height"] = "none";
		 elt.style["background-color"] = "rgb(255, 255, 255)";
		 elt.style["box-shadow"] = "rgba(0, 0, 0, 0.4) 1px 2px 5px";
		 elt.style["color"] = "rgb(68, 84, 106)";
		 elt.style["word-wrap"] = "break-word";
		 */
		return elt;
	},
	_createEditor: function (parent) {
		this._container = this._createContainer();
		parent.appendChild(this._container);
		 var elt = document.createElement("div");
		 elt["contenteditable"] = true;
		 elt.contentEditable = true;
		 elt.style["width"] = "100%";
		 elt.style["height"] = "100%";
		 elt.style["margin"] = 0;
		 elt.style["outline"] = "none";
		 elt.style["cursor"] = "text";
		 elt.style["-webkit-user-modify"] = "read-write-plaintext-only";
		 elt.style["white-space"] = "pre-wrap";
		 elt.style["-webkit-transform"] = "translateZ(0)";
		/*
		var elt = document.createElement("textarea");
		elt.autoComplete = "off";
		elt.style.tabIndex = -1;
		elt.style.margin = "0px";
		elt.style.padding = "0px";
		elt.style.fontFamily = "Tahoma";
		elt.style.fontStyle = "normal";
		elt.style.fontVariant = "normal";
		elt.style.fontWeight = "normal";
		elt.style.fontSize = "10pt";
		elt.style.lineHeight = "normal";
		elt.style.wordWrap = "normal";
		elt.style.overflow = "hidden";
		elt.style.resize = "none";
		elt.style.border = "none";
		elt.style.outline = "none";
		elt.style.textAlign = "left";
		elt.style.color = "rgb(68, 84, 106)";
		elt.style.width = "100%";
		elt.style.height = "100%";
		elt.style.imeMode = "auto";
		elt.style.cursor = "text";
		elt.style["-webkit-user-modify"] = "read-write-plaintext-only";
		elt.style["white-space"] = "pre";
		elt.style["-webkit-transform"] = "translateZ(0)";
		*/
		elt.onkeydown = this._keyDownHandler.bind(this);
		elt.onkeypress = this._keyPressHandler.bind(this);
		elt.oninput = this._inputHandler.bind(this);
		elt.onpaste = this._pasteHandler.bind(this);
		elt.oncopy = this._copyHandler.bind(this);
		if (elt.addEventListener) {
			elt.addEventListener("compositionstart", this._compositionstartHandler.bind(this));
			elt.addEventListener("text", this._textHandler.bind(this));
		} else {
			elt.attachEvent("oncompositionstart", this._compositionstartHandler.bind(this));
			elt.attachEvent("ontext", this._textHandler.bind(this));
		}
		this._container.appendChild(elt);
		return elt;
	},
	_textHandler: function () {
		this._requestStart();
	},
	_compositionstartHandler: function () {
		trace("########## COMPOSITION START: ");
		this._requestStart();
	},
	_keyDownHandler: function (e) {
		trace("########## EDITOR KEYDOWN: " + e.keyCode);
		var editor = this._editor;
		switch (e.keyCode) {
			case Keys.BACK:
                e.preventDefault();
                e.stopImmediatePropagation();
			case Keys.DELETE:
				if (!this._sendToParent(e)) {
					if (!this.isVisible() && this._requestStart()) {
						e.preventDefault();
						e.stopImmediatePropagation();
                        if (!this._editor.readOnly && this._editor.value) {
                            this._editor.value = ""; // null이라고 하면 "NULL"이라 쓰는 브라우저가 있더라...
                            this._modified = true;
                            this._dispatchChange();
                        }
					}
				}
				break;
			case Keys.TAB:
				return !this._sendToParent(e);
			case Keys.LEFT:
				if (!this.isVisible() || (editor.selectionEnd == 0 && editor.selectionEnd == editor.selectionStart)) {
					return !this._sendToParent(e);
				}
				break;
			case Keys.RIGHT:
				if (!this.isVisible() || (editor.selectionEnd == editor.value.length && editor.selectionEnd == editor.selectionStart)) {
					return !this._sendToParent(e);
				}
				break;
			case Keys.HOME:
				if (!this.isVisible()) {
					return !this._sendToParent(e);
				}
				e.stopImmediatePropagation();
				break;
			case Keys.END:
				if (!this.isVisible()) {
					return !this._sendToParent(e);
				}
				e.stopImmediatePropagation();
				break;
			case Keys.UP:
			case Keys.PAGEUP:
				if (!this.isVisible()) {
					return !this._sendToParent(e);
				}
				e.stopImmediatePropagation();
				break;
			case Keys.DOWN:
			case Keys.PAGEDOWN:
				if (!this.isVisible()) {
					return !this._sendToParent(e);
				}
				e.stopImmediatePropagation();
				break;
			case Keys.SPACE:
				if (!this.isVisible()) {
					return !this._sendToParent(e);
				}
				break;
			case Keys.ENTER:
				if (!e.ctrlKey && !e.shiftKey) {
					return !this._sendToParent(e);
				}
				if (e.ctrlKey && !e.shiftKey) {
					e.stopImmediatePropagation();
					var s = editor.value;
					if (s) {
						var i = editor.selectionEnd;
						s = s.substring(0, i) + "\r\n" + s.substring(i);
						editor.value = s;
						editor.setSelectionRange(i + 1, i + 1);
						this._doChanged();
					}
				}
				break;
			case Keys.ESCAPE:
			case Keys.F2:
			case Keys.INSERT:
				e.preventDefault();
				e.stopImmediatePropagation();
				return !this._sendToParent(e);
			case 229: // ime 변환 키 등...
				break;
		}
		if (e.keyCode == 0) {
		}
		return true;
	},
	_keyPressHandler: function (e) {
		if (e.keyCode >= 32) {
			this._requestStart();
		}
	},
	_inputHandler: function (e) {
		this._doChanged();
	},
	_pasteHandler: function (e) {
		if (this.isVisible()) {
			this._doChanged();
			return;
		}
		var text;
		var clp = (e.originalEvent || e).clipboardData;
		if (clp) {
			text = clp.getData('text/plain');
		} else {
			text = window.clipboardData.getData("text");
		}
		if (text) {
			this._grid.pasteFromClipboard(text);
		}
		return e.preventDefault();
	},
	_copyHandler: function (e) {
		if (!this.isEditing()) {
			var data = this._grid.copyToClipboard();
			if (data != null) {
				if (_win.clipboardData) {
					_win.clipboardData.setData ("Text", data);
				} else {
					e.clipboardData.setData('text/plain', data);
				}
			}
			return e.preventDefault();
		}
	},
	setBounds: function (x, y, w, h) {
		Dom.setBounds(this._container, x, y, w, h);
		this.$_resetBounds();
	},
	_doChanged: function () {
		this._requestStart();
		if (this._started && !this._editor.readOnly) {
			this._modified = true;
			this._dispatchChange();
			this.$_resetBounds();
		}
	},
	$_resetBounds: function () {
		var r = Dom.getBounds(this._container);
		var x = r.cx;
		var y = r.cy;
		var w = this._editor.scrollWidth + 6;
		var h = this._editor.scrollHeight + 6;
		r = Dom.getBounds(this._parentElement);
		if (x + w > r.width) {
			x = r.width - w;
		}
		if (y + h > r.height) {
			y = r.height - h;
		}
		Dom.setBounds(this._container, Math.max(x, 0), Math.max(y, 0), w, h);
	}
});
var DropDownPosition = _enum({
	BUTTON: "button",
	EDITOR: "editor"
});
var DropDownSortStyle = _enum({
	NONE: "none",
	ASCENDING: "ascending",
	DESCENDING: "descending"
});
var ItemSortStyle = DropDownSortStyle;
var DropDownCellEditor = defineClass("DropDownCellEditor", TextCellEditor, {
	init: function (grid, parentElement) {
		this._super(grid, parentElement);
		this._list = new DropDownList(grid._container, this._options && (this._options._useCssStyle || this._options._useCssStyleDropDownList));
		this._list.addListener(this);
		this._items = null; // listing items
		this._values = [];
		this._labeling = false;
		this._lookup = false;
		this._domain = null;
		this._closing = false;
		this._value = undefined;
		this._selectedIndex = -1;
		this._borderable = false;
		this._globalMouseHandler = function (e) {
			var p = e.target;
			while (p) {
				if (p == this._list._element) {
					return;
				}
				p = p.parentNode;
			}
			this.closeUp(true);
		}.bind(this);
	},
	destroy: function() {
		this._destroying = true;
		this._list && !this._list._destroying && this._list.destroy && this._list.destroy() && (this._list = null);
		this._globalMouseHandler = null;
		this._items = null;
		this._values = null;
		this._labels = null;
		this._value = null;
		return this._super();
	},
	values: null,
	items: null, // for realgrid+
	labels: null,
	displayLabels: true,
	domainOnly: false,
	textReadOnly: false,
	dropDownWidth: -1,
	dropDownPosition: DropDownPosition.BUTTON,
	dropDownCount: 8,
	itemSortStyle: ItemSortStyle.NONE,
	caseSensitive: false,
	partialMatch: false,
	commitOnSelect: true,
	dropDownWhenClick: false,
	setMask: function(options) {
		this._mask = null;
	},
	setValues: function (value) {
		this._values = value ? value.slice() : [];
	},
	setItems: function (value) {
		this.setValues(value);
	},
	items_: function () {
		return this._value;
	},
	setLabels: function (value) {
		this._labels = value ? value.slice() : [];
	},
	isListing: function () {
		return this._list.isListing();
	},
	dropDown: function (force) {
		if (!this.isReadOnly() && !this.isListing() && !this._closing) {
            this._refreshItems();
            if (force || this._items && this._items.length > 0) {
				this._list.setViewGridInside(this._options && this._options._viewGridInside);
                this._list.setItems(this._items);
                var r = Dom.getBounds(this._container);
				this._saveIndex = this._selectedIndex;
				this._saveText = this._editor.value;
                this._list.setCaseSensitive(this._caseSensitive);
                this._list.setPartialMatch(this._partialMatch);
                this._list.setDropDownCount(this._dropDownCount);
				this._list.setDropDownWidth(this._dropDownWidth);
				this._list.setDropDownPosition(this._dropDownPosition);
				this._list.setSortStyle(this._itemSortStyle);
                this._list.setValueIndex(this._selectedIndex);
                this._list.show(_doc.documentElement, r.cx - 1, r.cy + r.height, this._cellBounds.width, Dom.getBounds(this._editor));
                this._list.$_search(this._editor.value, true);
                $_evl ? _win.addEventListener("mousedown", this._globalMouseHandler) : _win.attachEvent("onmousedown", this._globalMouseHandler);
                return true;
            }
		}
		return false;
	},
	closeUp: function (accept) {
		if (this.isListing()) {
			this._closing = true;
			try {
				var idx;
				$_evl ? _win.removeEventListener("mousedown", this._globalMouseHandler) : _win.detachEvent("onmousedown", this._globalMouseHandler);
				this._list.hide();
				if (accept && this._list.isSelected() && (idx = this._list.itemIndex()) >= 0 && this._items && this._items.length > idx) {
					this._selectedIndex = this._list.valueIndex();
					this._editor.value = this._items[idx];
					if (this._selectedIndex != this._saveIndex || this._editor.value != this._saveText) {
						this._dispatchChange();
					}
                    if (this._commitOnSelect) {
                        this._dispatchCommit();
                    }
				} else {
					this._selectedIndex = -1;
				}
			} finally {
				this._closing = false;
			}
			return true;
		}
		return false;
	},
	hasButton: function () {
		return true;
	},
	initOptions: function () {
		this._super();
		this._values = [];
		this._labels = [];
		this._displayLabels = true;
		this._domainOnly = false;
		this._textReadOnly = false;
		this._dropDownWidth = -1;
		this._dropDownPosition = DropDownPosition.BUTTON;
		this._dropDownCount = 8;
		this._itemSortStyle = ItemSortStyle.NONE;
		this._caseSensitive = false;
		this._partialMatch = false;
		this._commitOnSelect = true;
		this._dropDownWhenClick = false;
		this._viewGridInside = false;
	},
	setEditIndex: function (index) {
		this._super(index);
		this._lookup = false;
		this._labeling = false;
		this._domain = null;
		this._items = null;
		/*
		m_editor.editable = !readOnly && !textReadOnly;
		m_editor.listable = !readOnly;
		m_editor.dropDownCount = dropDownCount;
		m_editor.sortStyle = itemSortStyle;
		m_editor.caseSensitive = caseSensitive;
		*/
		if (this._textReadOnly) {
			this._editor.readOnly = true;
		}
		this._refreshItems();
		/*
		var col = index.dataColumn();
		if (col) {
			this.setItems(col.lookupValues());
		}
		*/
	},
	setEditValue_2: function (value) {
		this._super(value);
		this._value = value;
		this._editor.value = this.$_valToStr(value);
	},
	setEditValue: function (value) {
		var i, cnt, v;
		var index = -1;
		this._value = value;
		if (this._lookup) {
			var domain = this._domain;
			if (domain) {
				i = index = domain.keys ? domain.keys.indexOf(value) : -1;
				v = (i >= 0 && domain.values && domain.values.length > i) ? domain.values[i] : value;
			} else {
				index = this._editIndex.dataColumn().getLookupIndex(value);
			}
			if (this._labeling) {
				if (domain) {
					v = (index >= 0 && domain.values && domain.values.length > index) ? domain.values[index] : value;
				} else {
					v = index >= 0 ? this._editIndex.dataColumn().getLookupLabel(value) : value;
				}
				this._super(v);
			} else {
				this._super(value);
			}
		} else if (this._values) {
			for (i = 0, cnt = this._values.length; i < cnt; i++) {
				if (value == this._values[i]) {
					index = i;
					break;
				}
			}
			if (this._labeling && this._labels && (index < 0 || this._labels.length > index)) {
				v = index >= 0 ? this._labels[i] : value;
				this._super(v);
			} else {
				this._super(value);
			}
		} else {
			this._super(value);
		}
		this._selectedIndex = index;
	},
	isEdited: function () {
		var modified = this._super();
		if (modified && this.isDomainOnly()) {
			modified = this.$_getEditValue(false) !== undefined;
		}
		return modified;
	},
	getEditValue: function (throwError) {
		if (!this.isEdited() && this._selectedIndex < 0) {
			return this._value;
		} else {
			return this.$_getEditValue(throwError);
		}
	},
	_createContainer: function () {
		var elt = this._super();
		elt.style.border = "none";
		elt.style.boxShadow = "none";
		return elt;
	},
	setBounds: function (x, y, w, h) {
		x += 2;
		y += 2;
		w -= 4;
		h -= 4;
		this._super(x, y, w, h);
	},
	_createEditor: function (parent) {
		var editor = this._super(parent);
		return editor;
	},
	_textHandler: function () {
		this._requestStart();
	},
	_compositionstartHandler: function (e) {
		this._super(e);
	},
	_keyDownHandler: function (e) {
		var list = this._list;
		switch (e.keyCode) {
			case Keys.ENTER:
				if (this.closeUp(true)) {
					return !this._sendToParent(e);
				}
				break;
			case Keys.ESCAPE:
				if (this.closeUp(false)) {
					e.preventDefault();
					return true;
				}
				break;
			case Keys.DOWN:
				if (e.altKey && !this.isListing()) {
					this._requestStart();
					e.preventDefault();
					return true;
				} else if (this.isListing()) {
					this._list.setItemIndex(Math.min(list.itemCount() - 1, list.itemIndex() + 1));
					e.preventDefault();
					return true;
				}
				break;
			case Keys.PAGEDOWN:
				if (this.isListing()) {
					this._list.setItemIndex(Math.min(list.itemCount() - 1, list.itemIndex() + list.dropDownCount()));
					e.preventDefault();
					return true;
				}
				break;
			case Keys.UP:
				if (e.altKey && this.isListing()) {
					this.closeUp(false);
					e.preventDefault();
					return true;
				} else if (this.isListing()) {
					this._list.setItemIndex(Math.max(0, list.itemIndex() - 1));
					e.preventDefault();
					return true;
				}
				break;
			case Keys.PAGEUP:
				if (this.isListing()) {
					this._list.setItemIndex(Math.max(0, list.itemIndex() - list.dropDownCount()));
					e.preventDefault();
					return true;
				}
				break;
		}
		return this._super(e);
	},
	_keyPressHandler: function (e) {
		this._super(e);
		e.keyCode && e.keyCode === Keys.SPACE && this.isTextReadOnly && this.isTextReadOnly() && e.preventDefault();
	},
	_inputHandler: function (e) {
		return this._super(e);
	},
	_pasteHandler: function (e) {
		return this._super(e);
	},
	_copyHandler: function (e) {
		return this._super(e);
	},
	_requestStart: function () {
		if (this._super()) {
			this.dropDown();
			return true;
		}
		return false;
	},
	_doChanged: function () {
		this._super();
		if (this.isListing()) {
			this._list.$_search(this._editor.value);
		}
	},
	dropDownList: function(force) {
		this.dropDown(force)
	},
	closeList: function (accept) {
		this.closeUp(accept);
	},
	buttonClicked: function (index) {
		this.isListing() ? this.closeUp(false) : this.dropDown();
	},
	_refreshItems: function (updateList, force) {
		var index = this.editIndex();
		var item = index.item();
		if (this._values && (this._values.length > 0 || force)) {
			if (this.isDisplayLabels() && this._labels && this._labels.length >= this._values.length) {
				this._items = this._labels;
				this._labeling = true;
			} else {
				this._items = this._values;
			}
		} else if (index.dataColumn() && index.item() && (index.dataRow() >= 0 || ItemState.isEditing(item.itemState()))) {
			var column = index.dataColumn();
			if (column.lookupSource()) {
				var flds = column.lookupKeyFieldIds();
				var keys = [];
				for (var i = 0; i < flds.length - 1; i++) {
					keys.push(item.getData(flds[i]));
				}
				var domain = column.lookupSource().getTextDomain(keys);
				if (domain && domain.values && domain.values.length > 0) {
					this._items = domain.values;
					this._labeling = true;
					this._lookup = true;
					this._domain = domain;
				}
			} else if (column.lookupValues() && column.lookupValues().length > 0) {
				if (this.isDisplayLabels() && column.lookupLabels() && column.lookupLabels().length >= column.lookupValues().length) {
					this._items = column.lookupLabels();
					this._labeling = true;
				} else {
					this._items = column.lookupValues();
				}
				this._lookup = true;
			}
		}
		if (updateList && this.isListing()) {
			this._list.setItems(this._items);
			var r = Dom.getBounds(this._container);
			this._list.$_resetItems(r.cx - 1, r.cy + r.height, this._cellBounds.width, Dom.getBounds(this._editor));
		}
	},
	$_getEditValue: function (throwError) {
		var i;
		var t = this.text();
		var org = TextCellEditor.prototype.getEditValue.call(this, throwError);
		var v = org;
		var col = this._editIndex.dataColumn();
		var index = this._selectedIndex;
		var selected = index >= 0;
		if (this._lookup) {
			if (this._domain) {
				if (this._labeling) {
					i = selected ? index : this._domain.values ? this._domain.values.indexOf(t) : -1;
					v = (i >= 0 && this._domain.keys && this._domain.keys.length > i) ? this._domain.keys[i] : v;
				}
				if (this.isDomainOnly()) {
					if (!this._domain.keys || this._domain.keys.indexOf(v) < 0) {
						return CellEditor.Unselected;
					}
				}
			} else {
				if (this._labeling) {
					if (selected) {
						v = col.getLookupValue(index);
					} else {
						v = col.getSourceValue(t);
					}
					if (v === undefined) {
						v = org;
					}
				}
				if (this.isDomainOnly()) {
					if (!col.lookupValues() || col.lookupValues().indexOf(v) < 0) {
						return CellEditor.Unselected;;
					}
				}
			}
		} else {
			if (this._labeling) {
				i = selected ? index : this._labels ? this._labels.indexOf(t) : -1;
				if (i >= 0 && i < this._values.length) {
					v = this._values[i];
				}
			}
			if (this.isDomainOnly()) {
				if (!this._values || this._values.indexOf(v) < 0) {
					return CellEditor.Unselected;;
				}
			}
		}
		return v;
	},
	onDropDownListCloseUp: function (list, accept) {
		this.closeUp(accept);
		this.setFocus();
	}
});
var /* internal */ DropDownList = defineClass("DropDownList", EventAware, {
	init: function (container, useCssStyle) {
		this._super();
		this._useCssStyle = useCssStyle;
		this._container = container; // grid container
		this._containerElement = null; // list parent element
		this._dom = new Dom(this._element = this.$_createList());
		this._firstChild = null;
		this._selected = false;
		this._mouseoverHandler = function (e) {
			var div = this._currDiv = e.currentTarget;
			if (Dom.getChildIndex(div) != this._itemIndex) {
				div.style.background = "rgba(0, 255, 0, 0.2)";
			}
		}.bind(this);
		this._mouseoutHandler = function (e) {
			var div = this._currDiv = e.currentTarget;
			if (Dom.getChildIndex(div) != this._itemIndex) {
				div.style.background = "";
			}
		}.bind(this);
		this._clickHandler = function (e) {
			var div = e.currentTarget;
			var idx = Dom.getChildIndex(div);
			if (idx >= 0) {
				this._itemIndex = idx;
				this.fireEvent(DropDownList.CLOSE_UP, true);
			}
		}.bind(this);
	},
	destroy: function() {
		this._destroying = true;
		this._container = null;
		this._containerElement = null;
		this._items = null;
		this._dom = null;

		Dom.clearElements(this._element);
		if (this._element.parentNode) {
			this._element.parentNode.removeChild(this._element);
		};
		this._element = null;

		return this._super();
	},
	minWidth: 0,
	maxWidth: 0,
	dropDownCount: 8,
	caseSensitive: false,
	partialMatch : false,
	sortStyle: ItemSortStyle.NONE,
	items: null,
	itemIndex: -1,
	dropDownPosition: DropDownPosition.BUTTON,
	dropDownWidth: -1, // -1: column width, 0: measured width, 0 < explicit width
	viewGridInside:false,
    isListing: function () {
        return this._containerElement && this._containerElement.contains(this._element);
    },
	setItems: function (value) {
		this._items = [];
		if (value) {
			for (var i = 0, cnt = value.length; i < cnt; i++) {
				this._items.push({ label: value[i], index: i });
			}
		}
	},
	setItemIndex: function (value, forceRefresh) {
		value = Math.max(-1, value);
		if (value < this._items.length && (forceRefresh || value != this._itemIndex)) {
			this._itemIndex = value;
			this.isListing() && this.$_refreshItems();
			this._selected = value >= 0;
		}
	},
	itemCount: function () {
		return this._items && this._items.length;
	},
	valueIndex: function () {
        var items = this._items;
        var i = this._itemIndex;
		return (items && i >= 0 && i < items.length) ? items[i].index : -1;
	},
	setValueIndex: function (value) {
		value = Math.max(-1, value);
			this._itemIndex = -1;
			if (value >= 0) {
				for (var i = 0, cnt = this._items.length; i < cnt; i++) {
					if (this._items[i].index == value) {
						this._itemIndex = value;
						break;
					}
				}
			}
			this.isListing() && this.$_refreshItems();
			this._selected = true;
	},
	isSelected: function () {
		return this._selected;
	},
	show: function (containerElement, x, y, cellWidth, editBounds) {
		this._containerElement = this._viewGridInside ? this._container._container : containerElement;
        (this._sortStyle != ItemSortStyle.NONE) && this.$_sortItems();
		this.$_show(x, y, cellWidth, editBounds);
	},
	hide: function () {
		this._dom.detach();
		this._containerElement = null;
	},
	$_createList: function () {
		var element = document.createElement("div");
		if (this._useCssStyle) {
			element.className = "rg-dropdownlist";	
		}
		element.onkeydown = function (e) {
			if (e.keyCode == 27) {
				this.fireEvent(DropDownList.CLOSE_UP, false);
			}
		}.bind(this);
		return element;
	},
	$_sortItems: function () {
		if (this._sortStyle == ItemSortStyle.ASCENDING) {
			this._items.sort(function (i1, i2) {
				return i1.label < i2.label ? -1 : i1.label > i2.label ? 1 : 0;
			});
		} else {
			this._items.sort(function (i1, i2) {
				return i1.label > i2.label ? -1 : i1.label < i2.label ? 1 : 0;
			});
		}
	},
	$_show: function (x, y, cellWidth, editBounds) {
		var elt = this._element;
		if (!elt) {
			return;
		}
		var elt = this._dom.element();
		this._dom.setStyles({
			position: "absolute",
			float: "none",
			clear: "both",
			boxSizing: "border-box",
			minWidth: "20px",
			minHeight: "10px",
			overflow: "auto",
			zIndex: 3000
		});
		!this._useCssStyle && this._dom.setStyles({
			background: "#fff",// "rgb(233, 233, 233)",
			border: "1px solid rgb(50, 50, 50)", //"1px solid rgb(200, 200, 200)",
			boxShadow: "rgba(0, 0, 0, 0.8) 1px 2px 5px",
			fontFamily: "Tahoma",
			fontStyle: "normal",
			fontVariant: "normal",
			fontWeight: "normal",
			fontSize: "10pt",
			padding: "0px",
			margin: "0px"
		});
        this._firstChild = null;
		this._dom.clearChildren();
		this._dom.disableSelection();
		this._containerElement.appendChild(elt);
        this.$_buildItems();
		this.$_resetHeight();
        this.$_resetWidth(cellWidth);
		this.$_resetPosition(x, y, cellWidth, editBounds);
		this._selected = false;
	},
	$_resetHeight: function () {
		var elt = this._dom.element();

		if (this._firstChild) {
			var cr = Dom.getBounds(this._firstChild);
			var style = this._firstChild.currentStyle || window.getComputedStyle(this._firstChild);
			var marginTop = parseInt(style.marginTop.replace("px",""));
			marginTop = isNaN(marginTop) ? 0 : marginTop;
			var marginBottom = parseInt(style.marginBottom.replace("px",""));
			marginBottom = isNaN(marginBottom) ? 0 : marginBottom;
            var h = (this._dropDownCount > 0) ? Math.min(this._dropDownCount, this._items.length) : this._items.length;
			elt.style.height = ((cr.height + marginTop) * h + 4 + marginBottom) + "px";
		} else {
			elt.style.height = "10px";			
		}
	},
    $_resetWidth: function (cellWidth) {
        var elt = this._dom.element();
		var r = Dom.getBounds(elt);
        var dw = this._dropDownWidth, w = this._dropDownWidth;
		if (w < 0) {
			w = cellWidth;
		} else if (w == 0) {
			w = 10; // Dom Size가 큰 상태에서는 줄어들지 않으므로 최소 크기(10)으로 설정 후 계산
		}
		elt.style.width = w + "px";

		var cw = 0;
		if (this._firstChild) {

			var style = this._firstChild.currentStyle || window.getComputedStyle(this._firstChild);
			var marginLeft = parseInt(style.marginLeft.replace("px",""));
			marginLeft = isNaN(marginLeft) ? 0 : marginLeft;
			var marginRight = parseInt(style.marginRight.replace("px",""));
			marginRight = isNaN(marginRight) ? 0 : marginRight;

			var childs = elt.childNodes;
			for (var i = 0; i < childs.length; i++) {
				cw = Math.max(cw, childs[i].scrollWidth);
			}
			cw += elt.offsetWidth - elt.clientWidth + marginLeft + marginRight;// + 4;
		}
		//r = Dom.getBounds(elt);
		//cw = Math.max(cw, r.width);
		if (dw < 0)
			cw = Math.max(cw,w);
		r = _getBrowserSize();// Dom.getBounds(this._containerElement);
		cw = Math.min(cw, r.width);
		w = cw;

		if (_ieOld && (dw >= 0 || cw > w)) // boxSizing: "border-box"일 때 IE 9에서 width가 text보다 작아지는 현상
			w += 20;
		if (w < r.width)
			elt.style.overflowX = "hidden";
		else 
			elt.style.overflowX = "auto";
		elt.style.width = w + "px";
    },
	$_resetPosition: function (x, y, cellWidth, editBounds) {
        var br = _getBrowserSize();
        var pr = Dom.getBounds(this._containerElement);
		var cr = Dom.getBounds(this._container._container);
		var w = br.width; // this._container.width(); // _container: grid container
		var h = br.height; //this._container.height();
		var r = this._dom.getBounds();
        var sx = window.pageXOffset || document.documentElement.scrollLeft;
        var sy = window.pageYOffset || document.documentElement.scrollTop;
        if (document.documentElement.scrollWidth > document.documentElement.clientWidth) {
            h -= 18;
        }
        if (document.documentElement.scrollHeight > document.documentElement.clientHeight) {
            w -= 18;
        }
        x += cr.left - pr.left;
        y += cr.top - pr.top;
		if (_ieTen || _ieOld || _ieLeg) {
			x += document.documentElement.scrollLeft;
			y += document.documentElement.scrollTop;
		}
		if (y + r.height > h + sy) {
			y = y - editBounds.height - r.height;
			if (y < 0) {
				y = h - r.height - 2;
			}
		}
		if (this._dropDownPosition != DropDownPosition.EDITOR) { // BUTTON 이거나 잘못된 값.
			x = Math.max(0, x + cellWidth - r.width);
		} else {
			if (x + r.width > w + sx) {
				x = w - r.width;
			}
		}
		if (this._viewGridInside) {
			y = editBounds.bottom - pr.top + 2;
			if ( (pr.bottom < editBounds.bottom+r.height) || (h+sy < editBounds.bottom+r.height)) {
				y = editBounds.top - r.height - pr.top - 2;
			}
		}
		this._dom.move(Math.max(0, x), Math.max(0, y));
	},
	$_resetItems: function (x, y, cellWidth, editBounds) {
		this._dom.clearChildren();
		this._firstChild = null;
		this.$_buildItems();
		this.$_resetHeight();
        this.$_resetWidth(cellWidth);
		this.$_resetPosition(x, y, cellWidth, editBounds);
	},
	$_buildItems: function () {
		var items = this._items;
		if (!items || items.length < 1) {
			return;
		}
		for (var i = 0, cnt = items.length; i < cnt; i++) {
			var item = items[i];
			var div = Dom.createElement("div", {
				position: "relative",
				float: "none",
				paddingTop: "1px",
				paddingBottom: "1px",
				paddingLeft: "2px",
				paddingRight: "2px",
				whiteSpace: "nowrap",
				cursor: "default",
			});
			!this._useCssStyle && (div.style.background = i == this._itemIndex ? "#333" : "");
			!this._useCssStyle && (div.style.color = i == this._itemIndex ? "#fff" : "");
			this._useCssStyle && (div.className = i == this._itemIndex ? "rg-dropdown-select" : "rg-dropdown-item");
			Dom.disableSelection(div);
			this._element.appendChild(div);
			if (i == 0) this._firstChild = div;
			div.onmouseover = !this._useCssStyle ? this._mouseoverHandler : null;
			div.onmouseout = !this._useCssStyle ? this._mouseoutHandler : null;
			div.onclick = this._clickHandler;
			var s = (item ? item.label.toString() : "").trim();
			var span = Dom.createElement("span");
			span.innerHTML = s ? Dom.htmlEncode(s) : "&nbsp;";
			span.tabIndex = -1;
			Dom.disableSelection(span);
			div.appendChild(span);
		}
	},
	$_refreshItems: function () {
		var item;
		var items = this._element.childNodes;
		for (var i = 0; i < items.length; i++) {
			item = items[i];
			if (this._useCssStyle) {
				item.className = i == this._itemIndex ? "rg-dropdown-select" : "rg-dropdown-item";
			} else {
				item.style.background = i == this._itemIndex ? "#333" : "";
				item.style.color = i == this._itemIndex ? "#fff" : "";
			}
		}
		var idx = this._itemIndex;
		if (idx >= 0 && idx < items.length) {
			item = items[idx];
			if (item.offsetTop < this._element.scrollTop) {
				this._element.scrollTop = item.offsetTop;
			} else {
				var y = item.offsetTop + Dom.getSize(item).height;
				if (y >= this._element.scrollTop + this._element.clientHeight) {
					this._element.scrollTop = y - this._element.clientHeight;
				}
			}
		}
	},
	hangulToChosungAll: function (str){
		var cho = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
		var result = "";
		for(i=0;i<str.length;i++) {
			var code = str.charCodeAt(i)-44032;
			if(code>-1 && code<11172) result += cho[Math.floor(code/588)];
			else result += str[i];
		}
		return result;
	},
	hangulToChosung: function (str){
		var result = {};
		if(/[ㄱ-힝]/.test(str)){
			var rCho = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
			var rJung = ["ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅘ", "ㅙ", "ㅚ", "ㅛ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ", "ㅢ", "ㅣ"];
			var rJong = ["", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ", "ㄺ", "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ", "ㅁ", "ㅂ", "ㅄ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
			var cho, jung, jong;
			var nTmp = str.charCodeAt(0) - 0xAC00;
			jong = nTmp % 28;
			jung = ( (nTmp-jong)/28 ) % 21;
			cho = ( ( (nTmp-jong)/28 ) - jung ) / 21;
			result.cho = rCho[cho] ? rCho[cho] : str;
			if(rJung[jung])
				result.org = str;
		}else {
			result.cho = str;
			result.org = str;
		}
		return result;
	},
	$_search: function (text, ignoreSelected) {
		try {
			if (this._items && text) {
                var items = this._items;
                var cnt = items.length;
				var t = this._caseSensitive ? text : text.toLowerCase();
                var list = [];
                var i, s, c, sc;
				for (i = 0; i < cnt; i++) {
					s = items[i].label.toString();
					if (s) {
						s = this._caseSensitive ? s : s.toLowerCase();
						if(this._partialMatch){
							sc = "";
							var htcS, htcT;
							for(var y = 0; y < s.length; y++){
								htcS = this.hangulToChosung(s[y]);
								htcT = this.hangulToChosung(t[y]);
								sc += htcT.org ? htcS.org : htcS.cho;
							}
							if(sc == t) {
								this.setItemIndex(i, ignoreSelected);
								return;
							}
						} else {
							if (s == t) {
								this.setItemIndex(i, ignoreSelected);
								return;
							}
						}
					}
					list.push(s);
				}
                for (i = 0; i < cnt; i++) {
                    s = list[i];
                    if(this._partialMatch){
						var match = false;
						for(var y = 0; y < t.length; y++){
							c = this.hangulToChosung(s[y]);
							if((c.org && c.org == t[y]) || (c.cho && c.cho == t[y])) 
								match = true;
							else {
								match = false;
								break;
							}
						}
						if(match) {
							this.setItemIndex(i, ignoreSelected);
							return;
						}
                    } else {
                    	if (s && s.indexOf(t) == 0) {
                    		this.setItemIndex(i, ignoreSelected);
                    		return;
                    	}
                    }
                }
                for (i = 0; i < cnt; i++) {
                    s = list[i];
                    if(this._partialMatch){
						var htcS, htcT, htcSA, htcTA;
						htcSA = this.hangulToChosungAll(s);
						htcTA = this.hangulToChosungAll(t);
						var idx = htcSA.indexOf(htcTA);
						sc = s.substr(0,idx);
						if(~idx){
							for(var y = 0, z = idx, len = t.length; y < len; y++, z++){
								htcS = this.hangulToChosung(s[z]);
								htcT = this.hangulToChosung(t[y]);
								sc += htcT.org ? htcS.org : htcS.cho;
							}
						}
						if(sc && sc.indexOf(t) > 0) {
							this.setItemIndex(i, ignoreSelected);
							return;
						}
					}else {
						if (s && s.indexOf(t) > 0) {
							this.setItemIndex(i, ignoreSelected);
							return;
						}
					}
                }
			}
			this.setItemIndex(-1);
		} finally {
			if (ignoreSelected) {
				this._selected = true;
			}
		}
	}
});
DropDownList.CLOSE_UP = "onDropDownListCloseUp";
var MultiCheckCellEditor = defineClass("MultiCheckCellEditor", DropDownCellEditor, {
	init: function (grid, parentElement) {
		TextCellEditor.prototype.init.apply(this, [grid, parentElement]);
		this._list = new MultiCheckList(grid._container, this._options && (this._options._useCssStyle || this._options._useCssStyleMultiCheck));
		this._list.addListener(this);
		this._items = null; // listing items
		this._values = [];
		this._labeling = false;
		this._lookup = false;
		this._domain = null;
		this._closing = false;
		this._value = undefined;
		this._selectedIndices = [];
		this._saveIndices = [];
		this._borderable = false;
		this._globalMouseHandler = function (e) {
			var p = e.target;
			while (p) {
				if (p == this._list._element) {
					return;
				}
				p = p.parentNode;
			}
			this.closeUp(true);
		}.bind(this);
	},
	destory: function() {
		this._destroying = true;
		this._globalMouseHandler = null;
		this._saveText = null;
		return this._super();
	},
	showButtons: true,
	acceptText: window.RG_CONST && window.RG_CONST.MULTICHECKACCEPT ? window.RG_CONST.MULTICHECKACCEPT : "accept",
	cancelText: window.RG_CONST && window.RG_CONST.MULTICHECKCANCEL ? window.RG_CONST.MULTICHECKCANCEL : "cancel",
	setMask: function(options) {
		this._mask = null;
	},
	dropDown: function (force) {
		if (!this.isReadOnly() && !this.isListing() && !this._closing) {
            this._refreshItems();
            if (force || this._items && this._items.length > 0) {
				this._list.setViewGridInside(this._options && this._options._viewGridInside);
                this._list.setItems(this._items);
                var r = Dom.getBounds(this._container);
				this._saveIndices = this._selectedIndices.slice();
				this._saveText = this._editor.value;
                this._list.setCaseSensitive(this._caseSensitive);
                this._list.setDropDownCount(this._dropDownCount);
				this._list.setDropDownWidth(this._dropDownWidth);
				this._list.setDropDownPosition(this._dropDownPosition);
				this._list.setButtonOptions(this._acceptText, this._cancelText, this._showButtons);
				this._list.setSortStyle(this._itemSortStyle);
                this._list.setValueIndices(this._selectedIndices);
                this._list.show(_doc.documentElement, r.cx - 1, r.cy + r.height, this._cellBounds.width, Dom.getBounds(this._editor));
                $_evl ? _win.addEventListener("mousedown", this._globalMouseHandler) : _win.attachEvent("onmousedown", this._globalMouseHandler);
                return true;
            }
		}
		return false;
	},
	getCheckValues: function (indices, items) {
		var ret = [];
		for (var i = 0, len =indices.length; i < len ; i++) {
			if (indices[i] >= 0 && indices[i] < items.length) {
				ret.push(items[indices[i]]);
			}
		}
		return ret;
	},
	closeUp: function (accept) {
		if (this.isListing()) {
			this._closing = true;
			try {
				var idx;
				var column = this.editIndex && this.editIndex().dataColumn();
				$_evl ? _win.removeEventListener("mousedown", this._globalMouseHandler) : _win.detachEvent("onmousedown", this._globalMouseHandler);
				this._list.hide();
				if (accept && this._list.isSelected()) {
					this._selectedIndices = this._list.valueIndices();
					this._editor.value = this.getCheckValues(this._selectedIndices, this._items).join(column.valueSeparator());
					if (!equalArrays(this._saveIndices,this._selectedIndices) || this._editor.value != this._saveText) {
						this._dispatchChange();
					}
                    if (this._commitOnSelect) {
                        this._dispatchCommit();
                    }
				} else {
					this._selectedIndices = this._saveIndices.slice();
				}
			} finally {
				this._closing = false;
			}
			return true;
		}
		return false;
	},	
	initOptions: function () {
		this._super();
		this._showButtons = true;
		this._acceptText = window.RG_CONST && window.RG_CONST.MULTICHECKACCEPT ? window.RG_CONST.MULTICHECKACCEPT : "accept";
		this._cancelText = window.RG_CONST && window.RG_CONST.MULTICHECKCANCEL ? window.RG_CONST.MULTICHECKCANCEL : "cancel";
	},
	setEditValue: function (value) {
		var v;
		var indices = [];
		var labels = [];
		var idx = -1;
		var values = _isArray(value) ? value : (value ? value.split(this._editIndex.dataColumn().valueSeparator()) : []);
		this._value = value;
		if (this._lookup) {
			var domain = this._domain;
			if (domain) {
				for (var i = 0, cnt = values.length ; i < cnt ; i++) {
					idx = domain.keys.indexOf(values[i]);
					if ( idx >= 0) {
						indices.push(idx);
						labels.push(idx < domain.values.length ? domain.values[idx] : values[i])
					}
				}
			} else {
				indices = this._editIndex.dataColumn().getLookupIndices(value);
			}
			if (this._labeling) {
				if (domain) {
					v = labels.join(this._editIndex.dataColumn().valueSeparator());
				} else {
					v = indices.length > 0 ? this._editIndex.dataColumn().getLookupLabel(value) : value;
				}
				this._super(v);
			} else {
				this._super(value);
			}
		} else if (this._values) {
			for (var i = 0, cnt = values.length; i < cnt; i++) {
				idx = this._values.indexOf(values[i]);
				if (idx >= 0) {
					indices.push(idx);
				 	labels.push(this._labels && idx >= 0 && this._labels.length > idx ? this._labels[idx] : values[i]);
				}
			}
			if (this._labeling && this._labels) {
				v = labels.join(this._editIndex.dataColumn().valueSeparator());
				this._super(v);
			} else {
				this._super(value);
			}
		} else {
			this._super(value);
		}
		this._selectedIndices = indices;
	},
	getEditValue: function (throwError) {
		if (!this.isEdited() && !this._list.isSelected()) {
			return this._value;
		} else {
			return this.$_getEditValue(throwError);
		}
	},
	_keyDownHandler: function (e) {
		var list = this._list;
		switch (e.keyCode) {
			case Keys.SPACE:
				if (this.isListing()) {
					this._list.changeCheckIndex(list.itemIndex());
					e.preventDefault();
					return true;
				}
		}
		return this._super(e);
	},
	$_getEditValue: function (throwError) {
		function getValues(self, value, lookupValues, lookupLabels, col) {
			var ret = [];
			var labels = value && value.split(col.valueSeparator());
			if (labels && labels.length > 0) {
				for (i = 0 , cnt = labels.length; i < cnt ; i++) {
					if (lookupLabels.indexOf(labels[i]) >= 0 && lookupLabels.indexOf(labels[i]) < lookupValues.length) {
						ret.push(lookupValues[i])
					} else if (lookupValues.indexOf(labels[i]) >= 0) {
						ret.push(lookupValues[i])
					} else if (!self.isDomainOnly()){
						ret.push(labels[i]);
					}
				}
			}
			return ret;
		};
		var i, cnt;
		var t = this.text();
		var org = TextCellEditor.prototype.getEditValue.call(this, throwError);
		var v = org;
		var col = this._editIndex.dataColumn();
		var indices = this._selectedIndices.slice();
		var values = [];
		var selected = this._list._selected;
		if (this._lookup) {
			if (this._domain) {
				if (this._labeling) {
					if (selected) {
						for (i = 0, cnt = indices.length; i < cnt ; i++) {
							indices[i] < this._domain.keys.length ? values.push(this._domain.keys[indices[i]]) : null;
						}
					} else {
						if (t) {
							values = getValues(this, t, this._domain.keys, this._domain.values, col);
						}
					}
					v = values.join(col.valueSeparator());
				}
			} else {
				if (this._labeling) {
					if (selected) {
						v = col.getLookupValues(indices);
					} else {
						v = col.getSourceValues(t);
					}
					if (v === undefined) {
						v = org;
					}
				}
				if (this.isDomainOnly()) {
					if (!col.lookupValues() || col.lookupValues().indexOf(v) < 0) {
						return CellEditor.Unselected;;
					}
				}
			}
		} else {
			if (this._labeling) {
				if (selected) {
					for (i = 0, cnt = indices.length; i < cnt ; i++) {
						indices[i] < this._values.length ? values.push(this._values[indices[i]]) : null;
					}
				} else {
					if (t) {
						values = getValues(this, t, this._values, this._labels, col);
					}
				}
				v = values.join(col.valueSeparator());
			}
			if (this.isDomainOnly()) {
				if (!this._values || this._values.indexOf(v) < 0) {
					return CellEditor.Unselected;;
				}
			}
		}
		return v;
	},
	onMultiCheckListCloseUp: function (list, accept) {
		this.closeUp(accept);
		this.setFocus();
	},
	onMultiCheckListCheckClick: function(list) {
		this._editor.value = this.getCheckValues(this._list._selectItemIndices, this._items).join(this.editIndex().dataColumn().valueSeparator());
		this._selectedIndices = this._list._selectItemIndices.slice();
		this._saveIndices = this._list._selectItemIndices.slice();
		this._modified = true;
		this._dispatchChange();
		this._editor.focus();
	},
	onMultiCheckListCancel: function() {
		this._controller.cancelEditor();
	}
});
var /* internal */ MultiCheckList = defineClass("MultiCheckList", DropDownList, {
	init: function (container, useCssStyle) {
		this._super();
		this._useCssStyle = useCssStyle;
		this._container = container; // grid container
		this._containerElement = null; // list parent element
		this._element = this.$_createList();
		this._dom = new Dom(this._listElement);
		this._firstChild = null;
		this._selected = false;
		this._selectItemIndices = [];
		this._acceptText = null;
		this._cancelText = null;
		this._showButtons = null;
		this._acceptClickHandler = function(e) {
			this.fireEvent(MultiCheckList.CLOSE_UP, true);
		}.bind(this);
		this._cancelClickHandler = function(e) {
			this.fireEvent(MultiCheckList.CANCEL, false);
		}.bind(this);
		this._acceptMouseoverHandler = function(e) {
			var label = e.currentTarget;
			label.style.background = "rgba(9, 211, 140, 0.5)";
		}.bind(this);
		this._acceptMouseoutHander = function(e) {
			var label = e.currentTarget;
			label.style.background = "";
		}.bind(this);
		this._cancelMouseoverHandler = function(e) {
			var label = e.currentTarget;
			label.style.background = "#888";
		}.bind(this);
		this._cancelMouseoutHandler = function(e) {
			var label = e.currentTarget;
			label.style.background = "";
		}.bind(this);
		this._mouseoverHandler = function (e) {
			var div = this._currDiv = e.currentTarget;
			var idx = Dom.getChildIndex(div);
			var index = idx >= 0 && idx < this._items.length ? this._items[idx].index : idx;
			if (this._selectItemIndices.indexOf(index) < 0) {
				div.style.background = "rgba(0, 255, 0, 0.2)";
				div.style.color = ""
			}
		}.bind(this);
		this._mouseoutHandler = function (e) {
			var div = this._currDiv = e.currentTarget;
			var idx = Dom.getChildIndex(div);
			var index = idx >= 0 && idx < this._items.length ? this._items[idx].index : idx;
			if (this._selectItemIndices.indexOf(index) < 0) {
				div.style.background = idx == this._itemIndex ? "#888" : "";
				div.style.color = idx == this._itemIndex ? "#fff" : "";
			}
		}.bind(this);
		this._clickHandler = function (e) {
			var div = e.currentTarget;
			if (e.eventPhase == 2) {// target
				var idx = Dom.getChildIndex(div);
				var check;
				var inputs = div.getElementsByTagName("input");
				for (var i = 0, cnt = inputs.length; i < cnt; i++) {
					if (inputs[i].type == "checkbox") {
						check = inputs[i];
						break;
					}
				}
				if (check) {
					check.checked = !check.checked;
				}
				this.$_changeCheckIndex(div, idx, check.checked);
			}
		}.bind(this);
		this._checkClickHandler = function(e) {
			e.stopImmediatePropagation();
			var div = e.currentTarget.parentNode;
			if (div) {
				var idx = Dom.getChildIndex(div);
				var checked = e.currentTarget.checked;
				this.$_changeCheckIndex(div, idx, checked);
			}
		}.bind(this);		
	},
	valueIndices: function() {
		return this._selectItemIndices.slice();
	},
	setValueIndices: function (value) {
		this._selectItemIndices = [];
		if (value == null) {
			return;
		}
		value = _isArray(value) ? value : [value];
		this._selectItemIndices = value.slice();
		this.isListing() && this.$_refreshItems();
		this._selected = false;
	},	
	show: function (containerElement, x, y, cellWidth, editBounds) {
		this._containerElement = this._viewGridInside ? this._container._container : containerElement;
        (this._sortStyle != ItemSortStyle.NONE) && this.$_sortItems();
        this._itemIndex = -1;
		this.$_show(x, y, cellWidth, editBounds);
	},
	hide: function () {
		this._element.parentNode && this._element.parentNode.removeChild(this._element);		
		this._containerElement = null;
	},
	changeCheckIndex:function(idx) {
		var item;
		var items = this._listElement.childNodes;
		if (idx >= 0 && idx < items.length) {
			var item = items[idx]; // div
			var inputs = item.getElementsByTagName("input");
			for (var i = 0, cnt = inputs.length; i < cnt; i++) {
				if (inputs[i].type == "checkbox") {
					check = inputs[i];
					break;
				}
			}
			if (check) {
				check.checked = !check.checked;
				this.$_changeCheckIndex(item, idx, check.checked);
			}
		}
	},
	$_changeCheckIndex: function (div, idx, checked) {
		var indices = this._selectItemIndices;
		if (idx < 0 || idx >= this._items.length) {
			return;
		}
		var index = this._items[idx].index;
		if (checked) {
			indices.indexOf(index) < 0 ? indices.push(index) : null;
		} else {
			indices.indexOf(index) >= 0 ? indices.splice(indices.indexOf(index), 1): null;
		}
		!this._useCssStyle && (div.style.background = checked ? "#aaa" : this._itemIndex == idx ? "#888": "");
		!this._useCssStyle && (div.style.color = (checked || this._itemIndex == idx) ? "#fff" : "");
		this._useCssStyle && (div.className = checked ? "rg-multicheck-select" : "rg-multicheck-item");
		this._selected = true;
		this.fireEvent(MultiCheckList.CHECK_CLICK, false)
	},
	$_createList: function () {
		var element = document.createElement("div");
		if (this._useCssStyle) {
			element.className = "rg-multicheck";	
		}
		var listDiv = document.createElement("div");
		this._useCssStyle ? (listDiv.className = "rg-multicheck-list") : null;
		this._listElement = listDiv;
		element.appendChild(listDiv);
		var buttonDiv = document.createElement("div");
		!this._useCssStyle && Dom.setStyles(buttonDiv, {
			textAlign :"center",
		});
		this._useCssStyle ? (buttonDiv.className = "rg-multicheck-button") : null;
		this._buttonElement = buttonDiv;
		element.appendChild(buttonDiv);
		Dom.setStyles(buttonDiv,{
			margin:"2px",
			padding:"2px",
		})
		Dom.disableSelection(buttonDiv);		
		element.onkeydown = function (e) {
			if (e.keyCode == 27) {
				this.fireEvent(MultiCheckList.CLOSE_UP, false);
			}
		}.bind(this);
		return element;
	},
	$_show: function (x, y, cellWidth, editBounds) {
		var elt = this._element;
		if (!elt) {
			return;
		}
		// var elt = this._dom.element();
		Dom.setStyles(elt,{
			position: "absolute",
			float: "none",
			clear: "both",
			boxSizing: "border-box",
			minWidth: "20px",
			minHeight: "10px",
			overflow: "visible",
			zIndex: 3000
		});
		!this._useCssStyle && Dom.setStyles(elt, {
			background: "#fff",// "rgb(233, 233, 233)",
			border: "1px solid rgb(50, 50, 50)", //"1px solid rgb(200, 200, 200)",
			boxShadow: "rgba(0, 0, 0, 0.8) 1px 2px 5px",
			fontFamily: "Tahoma",
			fontStyle: "normal",
			fontVariant: "normal",
			fontWeight: "normal",
			fontSize: "10pt",
			padding: "0px",
			margin: "0px"
		});

		this._dom.setStyles({
			position: "relative",
			float: "none",
			clear: "both",
			boxSizing: "border-box",
			minWidth: "20px",
			minHeight: "10px",
			overflow: "auto",
			zIndex: 3000
		});
		!this._useCssStyle && this._dom.setStyles({
			background: "#fff",// "rgb(233, 233, 233)",
			fontSize: "10pt",
			padding: "0px",
			margin: "0px"
		});
		Dom.setStyles(this._buttonElement,{
			position: "relative",
			float: "none",
			clear: "both",
			boxSizing: "border-box",
			marginLeft: "0px",
			marginRight: "0px",
		});
        this._firstChild = null;
		this._dom.clearChildren();
		this._dom.disableSelection();
		this._containerElement.appendChild(this._element);
        this.$_buildItems();
        this.$_buildButtons();
		this.$_resetHeight();
        this.$_resetWidth(cellWidth);
		this.$_resetPosition(x, y, cellWidth, editBounds);
		if (this._selectItemIndices.length > 0 && this._itemIndex < 0) {
			this.setItemIndex(this._selectItemIndices[0]);
		}
		this._selected = false;
	},
    $_resetWidth: function (cellWidth) {
        var elt = this._dom.element();
		var r = Dom.getBounds(elt);
        var dw = this._dropDownWidth, w = this._dropDownWidth;
		if (w < 0) {
			w = cellWidth;
		} else if (w == 0) {
			w = 10; // Dom Size가 큰 상태에서는 줄어들지 않으므로 최소 크기(10)으로 설정 후 계산
		}
		elt.style.width = w + "px";
		var cw = 0;
		if (this._firstChild) {
			var style = this._firstChild.currentStyle || window.getComputedStyle(this._firstChild);
			var marginLeft = parseInt(style.marginLeft.replace("px",""));
			marginLeft = isNaN(marginLeft) ? 0 : marginLeft;
			var marginRight = parseInt(style.marginRight.replace("px",""));
			marginRight = isNaN(marginRight) ? 0 : marginRight;

			var childs = elt.childNodes;
			for (var i = 0; i < childs.length; i++) {
				cw = Math.max(cw, childs[i].scrollWidth);
			}
			cw += elt.offsetWidth - elt.clientWidth + marginLeft + marginRight;// + 4;
		}
		//r = Dom.getBounds(elt);
		//cw = Math.max(cw, r.width);
		if (dw < 0)
			cw = Math.max(cw,w);
		r = _getBrowserSize();// Dom.getBounds(this._containerElement);
		cw = Math.min(cw, r.width);
		w = cw;

		if (_ieOld && (dw >= 0 || cw > w)) // boxSizing: "border-box"일 때 IE 9에서 width가 text보다 작아지는 현상
			w += 20;
		if (w < r.width)
			elt.style.overflowX = "hidden";
		else 
			elt.style.overflowX = "auto";

		cw = parseInt(this._buttonElement.getBoundingClientRect().width);
		if (!isNaN(cw)) {
			w = Math.max(w, cw);
		}
		elt.style.width = w + "px";
    },
	$_resetPosition: function (x, y, cellWidth, editBounds) {
        var br = _getBrowserSize();
        var pr = Dom.getBounds(this._containerElement);
		var cr = Dom.getBounds(this._container._container);
		var w = br.width; // this._container.width(); // _container: grid container
		var h = br.height; //this._container.height();
		// var r = this._dom.getBounds();
		var r = Dom.getBounds(this._element);
        var sx = window.pageXOffset || document.documentElement.scrollLeft;
        var sy = window.pageYOffset || document.documentElement.scrollTop;
        if (document.documentElement.scrollWidth > document.documentElement.clientWidth) {
            h -= 18;
        }
        if (document.documentElement.scrollHeight > document.documentElement.clientHeight) {
            w -= 18;
        }
        x += cr.left - pr.left;
        y += cr.top - pr.top;
		if (_ieTen || _ieOld || _ieLeg) {
			x += document.documentElement.scrollLeft;
			y += document.documentElement.scrollTop;
		}
		if (y + r.height > h + sy) {
			y = y - editBounds.height - r.height;
			if (y < 0) {
				y = h - r.height - 2;
			}
		}
		if (this._dropDownPosition != DropDownPosition.EDITOR) { // BUTTON 이거나 잘못된 값.
			x = Math.max(0, x + cellWidth - r.width);
		} else {
			if (x + r.width > w + sx) {
				x = w - r.width;
			}
		}
		if (this._viewGridInside) {
			y = editBounds.bottom - pr.top + 2;
			if ( (pr.bottom < editBounds.bottom+r.height) || (h+sy < editBounds.bottom+r.height)) {
				y = editBounds.top - r.height - pr.top - 2;
			}
		}
		// this._dom.move(Math.max(0, x), Math.max(0, y));
		Dom.move(this._element, Math.max(0, x), Math.max(0, y));
	},
	$_resetItems: function (x, y, cellWidth, editBounds) {
		this._dom.clearChildren();
		this._firstChild = null;
		this.$_buildItems();
		this.$_buildButtons();
		this.$_resetHeight();
        this.$_resetWidth(cellWidth);
		this.$_resetPosition(x, y, cellWidth, editBounds);
	},
	$_buildItems: function () {
		var items = this._items;
		if (!items || items.length < 1) {
			return;
		}
		for (var i = 0, cnt = items.length; i < cnt; i++) {
			var item = items[i];
			var div = Dom.createElement("div", {
				position: "relative",
				float: "none",
				paddingTop: "1px",
				paddingBottom: "1px",
				paddingLeft: "2px",
				paddingRight: "2px",
				whiteSpace: "nowrap",
				cursor: "default",
			});
			var isChecked = this._selectItemIndices.indexOf(items[i].index) >= 0;
			!this._useCssStyle && (div.style.background = isChecked ? "#aaa" : "");
			!this._useCssStyle && (div.style.color = isChecked ? "#fff" : "");
			this._useCssStyle && (div.className = isChecked ? "rg-multicheck-select" : "rg-multicheck-item");
			Dom.disableSelection(div);
			this._listElement.appendChild(div);
			if (i == 0) this._firstChild = div;
			div.onmouseover = !this._useCssStyle ? this._mouseoverHandler : null;
			div.onmouseout = !this._useCssStyle ? this._mouseoutHandler : null;
			div.onclick = this._clickHandler;
			var s = (item ? item.label.toString() : "").trim();
			var check = Dom.createElement("input");
			check.id = "$multiCheck_item_" + MultiCheckList.$_checkId++;
			check.type="checkBox";
			check.onclick = this._checkClickHandler;
			check.checked = isChecked;
			div.appendChild(check);
			var span = Dom.createElement("label");
			span.innerHTML = s ? Dom.htmlEncode(s) : "&nbsp;";
			span.htmlFor = check.id;
			span.tabIndex = -1;
			Dom.disableSelection(span);
			div.appendChild(span);
		}
	},
	setButtonOptions: function(acceptText, cancelText, showButtons) {
		this._acceptText = acceptText;
		this._cancelText = cancelText;
		this._showButtons = showButtons;
		this.$_buildButtons();
	},
	$_buildButtons: function() {
		if (!this._buttonElement) {
			return;
		}
		this._buttonElement.style.display = this._showButtons ? "" : "none";
		Dom.clearChildren(this._buttonElement);
		var button = document.createElement("label");
		button.innerHTML = this._acceptText;
		button.onclick = this._acceptClickHandler;
		button.onmouseover = !this._useCssStyle ? this._acceptMouseoverHandler : null;
		button.onmouseout = !this._useCssStyle ? this._acceptMouseoutHander : null;
		this._useCssStyle && (button.className = "rg-multicheck-accept");
		Dom.setStyles(button,{
			padding: "0px 3px",
			marginRight: "0px",
			marginLeft: "2px",
			cursor: "pointer",
		});
		!this._useCssStyle && Dom.setStyles(button,{
			border: "1px solid #0a3c59",
			borderRadius: "3px",
			color: "#06426c",
			borderWidth: "1px", 
		});
		Dom.disableSelection(button);		
		this._buttonElement.appendChild(button);
		var button = document.createElement("label");
		button.innerHTML = this._cancelText;
		button.onclick = this._cancelClickHandler;
		button.onmouseover = !this._useCssStyle ? this._cancelMouseoverHandler : null;
		button.onmouseout = !this._useCssStyle ? this._cancelMouseoutHandler : null;
		this._useCssStyle && (button.className = "rg-multicheck-cancel");
		Dom.setStyles(button,{
			padding: "0px 1px",
			marginRight: "0px",
			marginLeft: "2px",
			cursor: "pointer",
		});
		!this._useCssStyle && Dom.setStyles(button,{
			border: "1px solid #0a3c59",
			borderRadius: "3px",
			color: "#06426c",
			borderWidth: "1px", 
		});
		Dom.disableSelection(button);		
		this._buttonElement.appendChild(button);
	},
	$_refreshItems: function () {
		var item;
		var items = this._listElement.childNodes;
		var idx = -1;
		for (var i = 0; i < items.length; i++) {
			idx = i < this._items.length ? this._items[i].index : -1;
			item = items[i];
			if (i == this._itemIndex) {
				if (this._useCssStyle) {
					item.classList.add("rg-multicheck-selectitem")
				} else {
					item.style.background = "#888";
					item.style.color = "#fff";
				}
			} else {
				if (this._useCssStyle) {
					item.className = this._selectItemIndices.indexOf(idx) >= 0 ? "rg-multicheck-select" : "rg-multicheck-item";
				} else {
					item.style.background = this._selectItemIndices.indexOf(idx) >= 0 ? "#aaa" : "";
					item.style.color = this._selectItemIndices.indexOf(idx) >= 0 ? "#fff" : "";
				}
			}
		};
		var idx = this._itemIndex;
		if (idx >= 0 && idx < items.length) {
			item = items[idx];
			if (item.offsetTop < this._listElement.scrollTop) {
				this._listElement.scrollTop = item.offsetTop;
			} else {
				var y = item.offsetTop + Dom.getSize(item).height;
				if (y >= this._listElement.scrollTop + this._listElement.clientHeight) {
					this._listElement.scrollTop = y - this._listElement.clientHeight;
				}
			}
		}
	},
},{
	$_checkId:0
});
MultiCheckList.CLOSE_UP = "onMultiCheckListCloseUp";
MultiCheckList.CANCEL = "onMultiCheckListCancel";
MultiCheckList.CHECK_CLICK = "onMultiCheckListCheckClick";
var SearchCellEditor = defineClass("SearchCellEditor", DropDownCellEditor, {
	init: function (grid, parentElement) {
		this._super(grid, parentElement);
		this._searchKey = null;
		this._timer = undefined;
	},
	searchLength: 1,
	searchDelay: 1000,
    useCtrlEnterKey: false,
    useEnterKey: false,
	fillItems: function (key/*String*/, values/*[]*/, labels/*[]*/) {
		if (this.isListing() && key == this.getEditText()) {
			this.setValues(values);
			this.setLabels(labels);
			this._refreshItems(true, true);
			this._list.$_search(this._editor.value);
			return true;
		}
		return false;
	},
    _keyDownHandler: function (e) {
        var key = e.keyCode == Keys.ENTER;
        if (key) {
            if (e.ctrlKey) {
                key = this.isUseCtrlEnterKey();
            } else {
                key = this.isUseEnterKey() && (!this._items || this._items.length < 1);
            }
        }
        if (key && this.isEditing()) {
            e.preventDefault();
            e.stopImmediatePropagation();
            this.$_stopTimer();
            var s = this.getEditText();
            if (s && (s != this._searchKey)) {
                this._searchKey = s;
                this._dispatchSearch(s);
            }
            return true;
        }
        return this._super(e);
    },
    _keyUpHandler: function (e) {
        this._super(e);
        /**
         * 크롬에서 한글 입력 시, composing이 완료되는 시점에
         * editor.value값이 새로 추가된 문자를 제외시키고 있다.
         */
        if (_isChrome) {
            this.$_search();
        }
    },
	_inputHandler: function (e) {
		this._super(e);
        if (!_isChrome) {
            this.$_search();
        }
	},
	_doEndEdit: function () {
		this._super();
		this.$_stopTimer();
		this._searchKey = null;
	},
	dropDown: function () {
		this._super(true);
	},
	buttonClicked: function (index) {
		if (this.isListing()) {
			this.closeUp(false);
		} else {
			this.dropDown();
			var searchKey = this.getEditText();
			var ret = this._dispatchSearchCellButtonClick(searchKey);
			if (ret) {
				if ((typeof ret === "object") && ret.values) {
					this.fillItems(searchKey, ret.values, ret.labels);
				}
			}
		}
	},	
    $_search: function () {
        var s = this.getEditText();
        if (s && s.length >= this._searchLength) {
            this.$_startTimer();
        } else {
            /*
            if (this._values && this._values.length > 0) {
                this.fillItems(this.getEditText(), [], []);
                this._searchKey = null;
            }
            */
            this.$_stopTimer();
        }
    },
	$_startTimer: function () {
		this.$_stopTimer();
		this._timer = setInterval(function () {
			var s = this.getEditText();
			if (s && (s != this._searchKey)) {
				this._searchKey = s;
				this._dispatchSearch(s);
				this.$_stopTimer();
			}
		}.bind(this), this._searchDelay)
	},
	$_stopTimer: function () {
		this._timer && clearInterval(this._timer);
	}
});
SearchCellEditor.SEARCH = "onSearchCellEditorSearch";
var $$_HANGUL_REG = /[ㄱ-ㅎㅏ-ㅣ가-힝]/g;
var NumberCellEditor = defineClass("NumberCellEditor", TextCellEditor, {
	init: function (grid, parentElement) {
		this._super(grid, parentElement);
		this._regxAll = /[0-9]|,|\.|\-|\+|e|E/;
		this._regxPos = /[0-9]|,|\.|\+|e|E/;
		this._regxInt = /[0-9]|,|\+|\-/;
		this._regxPosInt = /[0-9]|,|\+/;
		this._regx = this._regxAll;
		this._editor.style.imeMode = "disabled";
		this._editor.style["-webkit-ime-mode"] = "disabled";
		this._editor.style["-moz-ime-mode"] = "disabled";
		this._editor.style["-ms-ime-mode"] = "disabled";
		this._decSep = $$$_DEC_SEP;
		this._groupSep = $$$_GRP_SEP;
		this._editFormat = undefined;
		this._decLen = undefined;
		this._decimalFormatter = undefined;
		this._numValue = undefined;
		this._multipleChar = null;
		this._addString = "000";
		this._isMultiple = false;
	},
	setMask: function(options) {
		this._mask = null;
	},
	positiveOnly: false,
	integerOnly: false,
	textAlignment: undefined,
	decSep:undefined,
	groupSep:undefined,
	editFormat:undefined,
	multipleChar:undefined,
	addString:undefined,
	setEditFormat: function (value) {
		if (this._editFormat != value) {
			this._editFormat = value;
			if (value) {
				var decFormatter = this._decimalFormatter = new DecimalFormatter(value);
				if (decFormatter) {
					this._decSep = decFormatter._seperator ? decFormatter._seperator : $$$_DEC_SEP;
					this._groupSep = decFormatter._groupSep ? decFormatter._groupSep : $$$_GRP_SEP;
					this._decLen = Math.max(decFormatter._minDigits, decFormatter._maxDigits);
				}

			} else {
				this._decimalFormatter = undefined;
				this._decSep = $$$_DEC_SEP;
				this._groupSep = $$$_GRP_SEP;
				this._decLen = undefined;
			}
		}
	},
	setPositiveOnly: function (value) {
		if (value != this._positiveOnly) {
			this._positiveOnly = value;
			this.$_resetRistrict();
		}
	},
	setIntegerOnly: function (value) {
		if (value != this._integerOnly) {
			this._integerOnly = value;
			this.$_resetRistrict();
		}
	},
	setTextAlignment: function (value) {
		if (value != this._textAlignment) {
			this._textAlignment = value;
			this.$_resetStyle();
		}
	},
	initOptions: function () {
		this._super();
		this._decSep = $$$_DEC_SEP;
		this._groupSep = $$$_GRP_SEP;
		this.setEditFormat(undefined);
		this.setPositiveOnly(false);
		this.setIntegerOnly(false);
	},
	_pasteHandler: function (e) {
		return this._super(e);
	},
	$_strToNum: function(numStr) {
		numStr = ""+numStr;
		var dpReg = new RegExp("\\"+this._decSep,"g");
		var tsReg = new RegExp("\\"+this._groupSep,"g");
		numStr = numStr.replace(tsReg,"").replace(dpReg,".");
		return isNaN(numStr) ? NaN : parseFloat(numStr);
	},
	$_formatNum: function(value,c){
		var n = value, 
	    	c = isNaN(c = Math.abs(c)) ? 2 : c, 
	    	s = n < 0 ? "-" : "", 
	    	i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", 
	    	j = (j = i.length) > 3 ? j % 3 : 0;
	   	return s + (j ? i.substr(0, j) + this._groupSep : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + this._groupSep) + (c ? this._decSep + Math.abs(n - i).toFixed(c).slice(2) : "");
	 },	
	_inputHandler: function(e) {
		if (this._editFormat) {
			var value = e.target.value;
			var isDecSep = value && value[value.length-1] == this._decSep;
			// var isMultipleChar = value && value[value.length-1] == this._multipleChar;
			value = this._isMultiple && this._addString ? value.replace(/\+/g,this._addString) : value;
			var ary = value.split(this._decSep);
			var fLen = 0;
			if (ary.length > 1) {
				ary[1] = ary[1].substr(0,this._decimalFormatter._maxDigits);
				fLen = ary[1].length;
				value = ary.join(this._decSep);
			};
			fLen = ary.length == 2 ? Math.min(ary[1].length, this._decLen != null ? this._decLen : 99 ) : 0;
			var num = this.$_strToNum(value);
			if (!isNaN(num)) {
				// num = isMultipleChar ? num * this._multiple : num;
				value = this.$_formatNum(num, fLen, this._decSep, this._groupSep);
				value = isDecSep && this._decLen && value.indexOf(this._decSep) < 0 ? value+this._decSep : value;
				e.target.value = value;
				if (e.keyCode == 113) {
					e.target.selectionStart = 0;
					e.target.selectionEnd = value.length;
				}
			}
		}
		this._super(e);
	},
	_keyPressHandler: function (e) {
        if (_isFirefox) {
            if (e.ctrlKey || e.charCode === 0) {
                this._super(e);
                return;
            }
        }
        var c = String.fromCharCode(e.keyCode || e.charCode);
		if (!this._regx.test(c) || (e.target.value && e.target.value.indexOf(this._decSep) >= 0 && c == this._decSep)) {
			if (!this._multipleChar || c !== this._multipleChar)
				e.preventDefault();
		}
		this._isMultiple = c == this._multipleChar;
		this._super(e);
	},
	$_resetValue: function () {
		if (this.isVisible()) {
			var s = this._editor.selectionStart;
			var p = this._editor.selectionEnd;
			var plen = this._editor.value ? this._editor.value.length : 0;
			this._editor.value = this._editor.value.replace($$_HANGUL_REG, '');
			var alen = this._editor.value ? this._editor.value.length : 0;
			alen == plen ? this._editor.setSelectionRange(s, p) : this._editor.setSelectionRange(p, p); 
		}
	},
	_dispatchChange: function () {
        if (this.isVisible()) {
            this.$_resetValue(); 
            this._super();
        }
	},
	setEditValue: function (value) {
		var v = parseFloat(value);
		if (isNaN(v)) {
			this._editor.value = "";
		} else if (this._editFormat && (typeof v == "number")) {
			var len = v.toString().length - v.toFixed().length;
			this._editor.value = len <= 0 ? this.$_formatNum(v, 0) : this.$_formatNum(v, len-1);
		} else {
			this._editor.value = v;
		}
	},
	getEditValue: function (throwError) {
		this.$_resetValue();
		var fld = this._editField();
		var v = fld.nullValue;
		try {
			var s = this._editor.value;
			s = s && s.trim();
			if (s) {
				var tsReg = new RegExp("\\"+this._groupSep,"g");
				var dpReg = new RegExp("[\\"+this._decSep+"]+","g");
				s = s.replace(tsReg, "");
				s = s.replace(dpReg, ".");
				s = s.replace(/\++/g, "+");
				s = s.replace(/\-+/g, "-");
				s = s.replace(/\+\-/g, "+");
				s = s.replace(/\-\+/g, "-");
			}
			v = s ? parseFloat(s) : undefined;
		} catch (e) {
			if (throwError) throw e;
		}
		return v;
	},
	$_resetRistrict: function () {
		if (this._positiveOnly && this._integerOnly) {
			this._regx = this._regxPosInt;
		} else if (this._positiveOnly) {
			this._regx = this._regxPos;
		} else if (this._integerOnly) {
			this._regx = this._regxInt;
		} else {
			this._regx = this._regxAll;
		}
	},
	$_resetStyle: function () {
		var align = "left";
		switch (this._textAlignment) {
			case Alignment.FAR :
				align = "right";
				break;
			case Alignment.CENTER :
				align = "center";
				break;
		}
		this._editor.style["text-align"] = align;
	}
}); 
var DateCellEditor = defineClass("DateCellEditor", TextCellEditor, {
	init: function (grid, parentElement) {
		this._super(grid, parentElement);
	    this._yearDisplayFormat = this._options.yearDisplayFormat();
	    this._monthDisplayFormat = this._options.monthDisplayFormat();
	    this._months = this._options.months();
	    this._weekDays = this._options.weekDays();
		this._list = new DatePicker(grid._container, this, this._options && (this._options._useCssStyle || this._options._useCssStyleDatePicker));
		this._list.addListener(this);
		this._closing = false;
		this._date = undefined;
		this._borderable = false;
        this._regx = /[0-9]|\.|\-|\/|a|A|p|P|m/;
		this._globalMouseHandler = function (e) {
			var p = e.target;
			while (p) {
				if (p === this._list._element) {
					this._list._monthPicker.hide();
					return;
				}
				if (p === this._list._monthPicker._dom._element) {
					return;
				}
				p = p.parentNode;
			}
			this.closeUp(true);
		}.bind(this);
	},
	destroy: function() {
		this._destroying = true;
		this._globalMouseHandler = null;
		return this._super();
	},
	editFormat: null,
	minDate: new Date(1970, 0, 1),
	maxDate: new Date(2100, 11, 31),
	yearNavigation: false,
	textReadOnly: false,
	dropDownPosition: DropDownPosition.BUTTON,
	dropDownWhenClick: false,
    showToday: true,
    yearDisplayFormat: "{Y}년",
    monthDisplayFormat: "{M}월",
    months: null,
    weekDays: null,
	editFormat_: function () {
		return this._datetimeFormat;
	},
	setEditFormat: function (value) {
		this.setDatetimeFormat(value);
	},
	isListing: function () {
		return this._list.isListing();
	},
	isMonthListing: function () {
		return this._list.isMonthListing();
	},
	dropDown: function () {
		if (!this.isReadOnly() && !this._controller._readOnly && !this.isListing() && !this._closing) {
			var list = this._list;
            var r = Dom.getBounds(this._container);
            list.setViewGridInside(this._options && this._options._viewGridInside);
			list.setYearNavigation(this._yearNavigation);
			list.setDropDownPosition(this._dropDownPosition);
            list.setShowToday(this._showToday);
            list.setYearDisplayFormat(this._yearDisplayFormat);
            list.setMonthDisplayFormat(this._monthDisplayFormat);
            list.setMonths(this._months);
            if (this._weekDays && this._weekDays.length > 0)
            	list.setWeekDays(this._weekDays);
			this.$_setListDate();
			list.show(this._parentElement, r.cx - 1, r.cy + r.height, this._cellBounds.width, Dom.getBounds(this._editor));
            list.show(_doc.documentElement, r.cx - 1, r.cy + r.height, this._cellBounds.width, Dom.getBounds(this._editor));
			$_evl ? _win.addEventListener("mousedown", this._globalMouseHandler) : _win.attachEvent("onmousedown", this._globalMouseHandler);
			return true;
		}
		return false;
	},
	closeUp: function (accept) {
		if (this.isListing()) {
			this._closing = true;
			try {
				$_evl ? _win.removeEventListener("mousedown", this._globalMouseHandler) : _win.detachEvent("onmousedown", this._globalMouseHandler);				
				this._list.hide();
				if (accept && this._list.isSelected()) {
					this.$_selectDate(this._list.date());
				}
			} finally {
				this._closing = false;
			}
			return true;
		}
		return false;
	},
	initOptions: function () {
		this._super();
		this._dropDownWhenClick = false;
		this._yearNavigation = false;
		this._textReadOnly = false;
        this._showToday = true;
	},
    _isDateEditor: function () {
        return true;
    },
	hasButton: function () {
		return true;
	},
	setEditIndex: function (index) {
		this._super(index);
		if (this._textReadOnly) {
			this._editor.readOnly = true;
		}
	},
	setEditValue: function (value) {
		this._super(value);
		this._date = value;
		this._editor.value = this.$_valToStr(value);
	},
	getEditValue: function (throwError) {
		return this._super(throwError);
	},
	_createContainer: function () {
		var elt = this._super();
		elt.style.border = "none";
		elt.style.boxShadow = "none";
		return elt;
	},
	_createEditor: function (parent) {
		var editor = this._super(parent);
		return editor;
	},
	_textHandler: function () {
		this._requestStart();
	},
	_compositionstartHandler: function (e) {
		this._requestStart(e);
	},
	_keyDownHandler: function (e) {
		var list = this._list;
		if (list.isMonthListing()) {
			if (e.keyCode == Keys.ESCAPE) {
				this.closeMonthList();
				e.preventDefault();
				e.stopImmediatePropagation();
				return true;
			}
			return false;
		}
		var listing = this.isListing();
		var focused = listing && list.isFocused();
		switch (e.keyCode) {
			case Keys.ENTER:
				if (this.closeUp(true)) {
					e.preventDefault();
					e.stopImmediatePropagation();
					return !this._sendToParent(e);
				}
				break;
			case Keys.ESCAPE:
				if (this.closeUp(false)) {
					e.preventDefault();
					e.stopImmediatePropagation();
					return true;
				}
				break;
			case Keys.HOME:
				if (focused) {
					e.preventDefault();
					e.stopImmediatePropagation();
					this.$_selectDate(list.firstDay());
					return true;
				}
				break;
			case Keys.END:
				if (focused) {
					e.preventDefault();
					e.stopImmediatePropagation();
					this.$_selectDate(list.lastDay());
					return true;
				}
				break;
			case Keys.LEFT:
				if (focused) {
					e.preventDefault();
					e.stopImmediatePropagation();
					this.$_selectDate(list.incDay(-1));
					return true;
				}
				break;
			case Keys.RIGHT:
				if (focused) {
					e.preventDefault();
					e.stopImmediatePropagation();
					this.$_selectDate(list.incDay(1));
					return true;
				}
				break;
			case Keys.PAGEUP:
				if (focused) {
					e.preventDefault();
					e.stopImmediatePropagation();
					this.$_selectDate(list.incMonth(-1));
					return true;
				}
				break;
			case Keys.PAGEDOWN:
				if (focused) {
					e.preventDefault();
					e.stopImmediatePropagation();
					this.$_selectDate(list.incMonth(1));
					return true;
				}
				break;
			case Keys.DOWN:
				if (e.altKey && !this.isListing()) {
					this._requestStart();
					e.preventDefault();
					e.stopImmediatePropagation();
					return true;
				} else if (this.isListing()) {
					e.preventDefault();
					e.stopImmediatePropagation();
					if (focused) {
						this.$_selectDate(list.incDay(7));
					} else {
						this._list.setFocused(true);
						this.$_setListDate();
					}
					return true;
				}
				break;
			case Keys.UP:
				if (e.altKey && this.isListing()) {
					this.closeUp(false);
					e.preventDefault();
					e.stopImmediatePropagation();
					return true;
				} else if (this.isListing()) {
					e.preventDefault();
					e.stopImmediatePropagation();
					if (focused) {
						var d = list.date();
						if (d.getDate() <= 7) {//} && d.getDay() + 1 >= d.getDate()) {
							this._list.setFocused(false);
						} else {
							this.$_selectDate(list.incDay(-7));
						}
					} else {
						this._list.setFocused(false);
					}
					return true;
				}
				break;
            case Keys.T:
                if ((e.altKey || e.altKey && e.ctrlKey) && this.isListing()) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    this._list.setDate(new Date());
					this.$_selectDate(this._list._date);
                }
                break;
		}
		return this._super(e);
	},
	_keyPressHandler: function (e) {
        var list = this._list;
        var c = String.fromCharCode(e.keyCode || e.charCode);
        if (c.toLocaleLowerCase() == this.todayChar()) {
            e.preventDefault();
            e.stopImmediatePropagation();
            if (this.isListing()) {
                list.setFocused(true);
                this.$_selectDate(list.today());
                return true;
            }
        } else {
	        if (_isFirefox && (e.ctrlKey || e.charCode === 0)) {
	                this._super(e);
	                return;
	        }
        	if (!this._regx.test(c)) {
                e.preventDefault();
                return;
            }
        }
		return this._super(e);
	},
    $_resetValue: function () {
		if (this.isVisible()) {
			var s = this._editor.selectionStart;
			var p = this._editor.selectionEnd;
			var plen = this._editor.value ? this._editor.value.length : 0;
			this._editor.value = this._editor.value.replace($$_HANGUL_REG, '');
			var alen = this._editor.value ? this._editor.value.length : 0;
			alen == plen ? this._editor.setSelectionRange(s, p) : this._editor.setSelectionRange(p, p); 
		}
    },
    _dispatchChange: function () {
        if (this.isVisible()) {
            this.$_resetValue();
            this._super();
        }
    },
	_changeHandler: function (e) {
		return this._super(e);
	},
	_pasteHandler: function (e) {
		return this._super(e);
	},
	_copyHandler: function (e) {
		return this._super(e);
	},
	_requestStart: function () {
		if (this._super()) {
			this.dropDown();
			return true;
		}
		return false;
	},
	setBounds: function (x, y, w, h) {
		x += 2;
		y += 2;
		w -= 4;
		h -= 4;
		this._super(x, y, w, h);
	},
	_doChanged: function () {
		this._requestStart();
		// date Editor에서 this._readOnly=false// this._controller._readOnly를 이용해서 처리해야 한다.
		// input element의 readOnly는 textReadOnly를 따라간다.
		if (this._started && !this._controller._readOnly && this._controller._editable) {
			this._modified = true;
			this._dispatchChange();
		}
	},
	dropDownList: function (force) {
		this.dropDown(force);
	},
	closeList: function (accept) {
		this.closeUp(accept);
	},
	closeMonthList: function () {
		this._list.closeMonth();
	},
	buttonClicked: function (index) {
		this.isListing() ? this.closeUp(false) : this.dropDown();
	},
	$_selectDate: function (d) {
		if (d && d != this._date) {
			this._date = d;
			var s = this._dateConverter.getText(this._date);
			this._editor.value = s;
			if (this._mask) 
				this._mask.writeBuffer(s)
			// this._dispatchChange();
			this._doChanged();
		}
	},
	$_setListDate: function (d) {
		var d = this._dateConverter.getDateNull(this._editor.value);
		if (d) {
			this._list.setDate(d);
		}
	},
	onDatePickerCloseUp: function (list, accept) {
		this.closeUp(accept);
		this.setFocus();
	}
});
var /* internal */ DatePicker = defineClass("DatePicker", EventAware, {
	init: function (container, editor, useCssStyle) {
		this._super();
		this._useCssStyle = useCssStyle;
		this._editor = editor;
		this._container = container;
		this._containerElement = null;
		this._headerElement = null;
		this._headElement = null;
        this._todayElement = null;

	    this._yearDisplayFormat = editor.yearDisplayFormat();
	    this._monthDisplayFormat = editor.monthDisplayFormat();
	    this._months = editor.months();
	    this._weekDays = $$_week_days;
		this._date = new Date();
		this._currDate = null;
		this._today = null;
		this._selected = false;
		this._cellBackground = "#f5f5f5";
		this._todayBackground = "#d5d5d5";
		this._focusedBackground = "rgba(255, 255, 0, 0.3)";
		this._hoveredBackground = "";// "rgba(0, 255, 0, 0.2)";
		this._cellBorder = "1px solid #eee";
		this._nullBorder = "1px solid #fff";
		this._focusedBorder = "1px solid #aaa";
		this._todayBorder = "1px solid #aaa";
		this._hoveredBorder = "1px solid #000";
		this._cellColor = "#333";
		this._nullColor = "#ccc";
        this._focused = true;
		this._mouseoverHandler = function (e) {
			var td = e.currentTarget;
			td.style.background = this._hoveredBackground;
			td.style.border = this._hoveredBorder;
		}.bind(this);
		this._mouseoutHandler = function (e) {
			var date = this._currDate;
			var y = date.getFullYear();
			var m = date.getMonth();
			var mdays = $$_month_days[_isLeapYear(y) ? 1 : 0][m];
			var td = e.currentTarget;
			var d = td.$_day;
			if (d < 0 || d >= mdays) {
				td.style.background = "";
				td.style.border = this._nullBorder;
				td.style.color = this._nullColor;
			} else if (this.$_isFocusedDay(this._currDate, d + 1)) {
				td.style.background = this._focusedBackground;
				td.style.border = this._focusedBorder;
				td.style.color = this._cellColor;
			} else if (this.$_isToday(this._currDate, d + 1)) {
				td.style.background = this._todayBackground;
				td.style.border = this._todayBorder;
				td.style.color = this._cellColor;
			} else {
				td.style.background = this._cellBackground;
				td.style.border = this._cellBorder;
				td.style.color = this._cellColor;
			}
		}.bind(this);
		this._clickHandler = function (e) {
			var d = e.currentTarget.$_day;
			this._date = new Date(this._currDate);
			this._date.setDate(d + 1);
			this._selected = true;
			this.fireEvent(DatePicker.CLOSE_UP, true);
		}.bind(this);
		this._dom = new Dom(this._element = this.$_createPicker());
		this._monthPicker = new MonthPicker(editor, this._element, this._useCssStyle);
		this._monthPicker.addListener({
			onMonthPickerCloseUp: function (picker, month) {
				var delta = month - this._currDate.getMonth();
				if (delta) {
					_incMonth(this._currDate, delta);
					this.$_buildCalendar();
				}
				this._editor.setFocus();
			}.bind(this)
		});
	},
	minWidth: 0,
	maxWidth: 0,
	yearNavigation: false,
	dropDownPosition: DropDownPosition.BUTTON,
    showToday: true,
    yearDisplayFormat: null,
    monthDisplayFormat: null,
    months: null,
    viewGridInside:false,
	date: function () {
		return this._date;
	},
	setDate: function (value) {
		if (value.getTime() != this._date.getTime()) {
			this._currDate = new Date(value);
			this._date = new Date(value);
			if (this.isListing()) {
                this.$_buildCalendar();
			}
		}
		return this._date;
	},
	setWeekDays: function (value) {
		if (value != this._weekDays) {
			if (_isArray(value) && value.length >= 7) {
				this._weekDays = value;
			} else {
				this._weekDays = $$_week_days;
			}
		}
	},
	isListing: function () {
		return this._containerElement && this._containerElement.contains(this._element);
	},
	isMonthListing: function () {
		return this._monthPicker.isListing();
	},
	closeMonth: function () {
		this._monthPicker.hide(0);
	},
	isSelected: function () {
		return this._selected;
	},
	isFocused: function () {
		return this._focused;
	},
    setFocused: function (value) {
        if (value != this._focused) {
			this._focused = value;
			this._element.style.border = value ? "1px solid rgba(50, 50, 50, 1)" : "1px solid rgba(50, 50, 50, 0.3)";
			this._element.style.boxShadow = value ? "rgba(0, 0, 0, 0.8) 1px 2px 5px" : "rgba(0, 0, 0, 0.5) 1px 2px 5px";
			this._headerElement.style.backgroundColor = value ? "rgba(0, 200, 200, 0.1)" : "#e8e8e8";
			this._headElement.style.opacity = value ? "1.0" : "0.5";
			if (this._useCssStyle) {

			} else {
				this._headerElement.style.backgroundColor = value ? "rgba(0, 200, 200, 0.1)" : "#e8e8e8";
			}
        }
    },
	show: function (containerElement, x, y, cellWidth, editBounds) {
		this._containerElement = this._viewGridInside ? this._container._container : containerElement;
		this.$_show(x, y, cellWidth, editBounds);
	},
	hide: function () {
		this.setFocused(false);
		this._monthPicker.hide();
		this._dom.detach();
		this._containerElement = null;
	},
    today: function () {
        return this.setDate(new Date());
    },
	incDay: function (delta) {
		var d;
		if (this._date.getMonth() == this._currDate.getMonth()) {
			d = new Date(this._date);
			this._date && d.setDate(this._date.getDate() + delta);
		} else {
			d = this._currDate;
			d = new Date(d.getFullYear(), d.getMonth(), 1);
		}
		return this.setDate(d);
	},
	incMonth: function (delta) {
		var d;
		if (this._date.getMonth() == this._currDate.getMonth()) {
			d = new Date(this._date);
			this._date && _incMonth(d, delta);
		} else {
			d = this._currDate;
			d = new Date(d.getFullYear(), d.getMonth(), 1);
		}
		return this.setDate(d);
	},
	firstDay: function () {
		var d = new Date(this._currDate);
        this._date && d.setDate(1);//this._date.getDate() - this._date.getDay());
		return this.setDate(d);
	},
	lastDay: function () {
		var d = new Date(this._currDate);
		if (this._date) {
            var y = d.getFullYear();
            var m = d.getMonth();
            var mdays = $$_month_days[_isLeapYear(y) ? 1 : 0][m];
            d.setDate(mdays);//this._date.getDate() + 6 - this._date.getDay());
        }
		return this.setDate(d);
	},
	$_createPicker: function () {
		var element = Dom.createElement("div", {
			position: "absolute",
			float: "none",
			clear: "both",
			boxSizing: "border-box",
			margin: "0px",
			overflow: "auto",
			zIndex: 3000,
		});
		if (this._useCssStyle) {
			element.className = "rg-calendar";
		} else {
			Dom.setStyles(element,{
				cursor: "default",
				fontFamily: "Verdana",
				fontSize: "11px",
				fontStyle: "normal",
				fontVariant: "normal",
				fontWeight: "normal",
				background: "#fff",// "rgb(233, 233, 233)",
				border: "1px solid rgba(50, 50, 50, 0.5)",
				boxShadow: "rgba(0, 0, 0, 0.5) 1px 2px 5px",
				padding: "0px"
			});
		}
		this._header = this.$_createHeader();
		element.appendChild(this._header);
		this._calendar = this.$_createCalendar();
		element.appendChild(this._calendar);
		element.addEventListener("keydown", function (e) {
			if (e.keyCode == 27) {
				if (this.isMonthLisiting()) {
					this.closeMonth();
				} else {
					this.fireEvent(DropDownList.CLOSE_UP, false);
				}
			}
		}.bind(this));
		element.addEventListener("mouseup", function (e) {
			this._editor.setFocus();
		}.bind(this));
		return element;
	},
	$_createHeader: function () {
        var list = this;
		var elt = this._headerElement = Dom.createElement("div", {
			position: "relative",
		});
		if (this._useCssStyle) {
			elt.className = "rg-cal-header"
		} else {
			Dom.setStyles(elt, {
				paddingLeft: "4px",
				paddingRight: "4px",
				paddingTop: "4px",
				paddingBottom: "0px",
				fontSize: "12px",
				backgroundColor: "#e8e8e8",
				margin: "0px"
			});
		}
		var prev = Dom.createElement("span", {
			position: "absolute",
			left: "4px",
			minWidth: "17px",
			minHeight: "17px",
			backgroundRepeat: "no-repeat",
			backgroundPosition: "center center"
		});
		if (this._useCssStyle) {
			prev.className = "rg-cal-prev-month";
		} else {
			Dom.setStyles(prev, {
				top: "3px",
				backgroundImage: _getAsset("cal_prev.png") }
			);
		}
		elt.appendChild(elt.$_prev = prev);
		prev.onclick = function (e) {
			!this._useCssStyle && Dom.setStyles(e.currentTarget, {
				backgroundImage: _getAsset("cal_prev_hover.png")
			});
            _incMonth(this._currDate, -1);
			this.$_buildCalendar();
		}.bind(this);
		prev.onmouseover = this._useCssStyle ? null : function (e) {
			Dom.setStyles(e.currentTarget, {
				backgroundImage: _getAsset("cal_prev_hover.png")
			});
		};
		prev.onmousedown =  this._useCssStyle ? null : function (e) {
			Dom.setStyles(e.currentTarget, {
				backgroundImage: _getAsset("cal_prev_active.png")
			});
		};
		prev.onmouseout =  this._useCssStyle ? null : function (e) {
			Dom.setStyles(e.currentTarget, {
				backgroundImage: _getAsset("cal_prev.png")
			});
		};
		var next = Dom.createElement("span", {
			position: "absolute",
			right: "4px",
			minWidth: "17px",
			minHeight: "17px",
			backgroundRepeat: "no-repeat",
			backgroundPosition: "center center"
		});
		if (this._useCssStyle) {
			next.className = "rg-cal-next-month";
		} else {
			Dom.setStyles(next,{
				top: "3px",
				backgroundImage: _getAsset("cal_next.png"),
			})
		}
		elt.appendChild(elt.$_next = next);
		next.onclick = function (e) {
			!this._useCssStyle && Dom.setStyles(e.currentTarget, {
				backgroundImage: _getAsset("cal_next_hover.png")
			});
            _incMonth(this._currDate, 1);
			this.$_buildCalendar();
		}.bind(this);
		next.onmouseover = this._useCssStyle ? null : function (e) {
			Dom.setStyles(e.currentTarget, {
				backgroundImage: _getAsset("cal_next_hover.png")
			});
		};
		next.onmousedown = this._useCssStyle ? null : function (e) {
			Dom.setStyles(e.currentTarget, {
				backgroundImage: _getAsset("cal_next_active.png")
			});
		};
		next.onmouseout = this._useCssStyle ? null : function (e) {
			Dom.setStyles(e.currentTarget, {
				backgroundImage: _getAsset("cal_next.png")
			});
		};
        var today = this._todayElement = Dom.createElement("span", {
            position: "absolute",
            right: "18px",
            top: "2px",
        });
        if (this._useCssStyle) {
        	today.className = "rg-cal-today-button";
        } else {
        	Dom.setStyles(today,{
	            padding: "2px",
	            fontSize: "10px",
	            border: "1px solid transparent",
	            borderRadius: "3px"
        	})
        }
        elt.appendChild(today);
        today.innerHTML = "Today";
        today.onclick = function (e) {
            list.setFocused(true);
            list.setDate(new Date());
			list._editor.$_selectDate(list._currDate);
        };
        today.onmouseover = this._useCssStyle ? null : function (e) {
            Dom.setStyles(e.currentTarget, {
                color: "#00f",
                border: "1px solid #aaa",
                backgroundColor: "#fff",
                textDecoration: "underline"
            });
        };
        today.onmouseup = this._useCssStyle ? null : function (e) {
            Dom.setStyles(e.currentTarget, {
                color: "#00f",
                border: "1px solid #aaa",
                backgroundColor: "#fff"
            });
        };
        today.onmousedown = this._useCssStyle ? null : function (e) {
            Dom.setStyles(e.currentTarget, {
                color: "#800",
                backgroundColor: "#eee"
            });
        };
        today.onmouseout = this._useCssStyle ? null : function (e) {
            Dom.setStyles(e.currentTarget, {
                color: "",
                border: "1px solid transparent",
                backgroundColor: "",
                textDecoration: ""
            });
        };
		var title = Dom.createElement("div", {
			position: "relative",
			textAlign: "center",
			marginLeft: "20px",
			marginRight: "50px"
		});
		elt.appendChild(elt.$_title = title);
		if (this._useCssStyle) {
			title.className = "rg-cal-yearmonth";
		}

		var year = Dom.createElement("span", {
			position: "relative",
			verticalAlign: "top",
			height: "16px"
		});
		if (this._useCssStyle) {
			year.className = "rg-cal-year";
		}
		title.appendChild(title.$_year = year);
		year.innerHTML = "2015년";
		year.onclick = function (e) {
		};
		var yearSpin = this.$_createYearSpin();
		title.appendChild(title.$_yearSpin = yearSpin);
		var month = Dom.createElement("span", {
			position: "relative",
			verticalAlign: "top"
		});
		if (this._useCssStyle) {
			month.className = "rg-cal-month";
		}
		title.appendChild(title.$_month = month);

		month.innerHTML = "1월";
		month.onmousedown = function (e) {
			e.preventDefault();
			e.stopImmediatePropagation();
			/*
			var r = Dom.getBounds(this._headerElement.$_title.$_month);
			var x = r.left + (window.pageXOffset || document.documentElement.scrollLeft);
			var y = r.top + (window.pageXOffset || document.documentElement.scrollLeft);
			this._monthPicker.show(this._containerElement, x, y);
			*/
			var p = Dom.getOffset(this._headerElement.$_title.$_month);
			this._monthPicker.show(this._containerElement, p.x, p.y, this._viewGridInside);
		}.bind(this);
		return elt;
	},
	$_createYearSpin: function () {
		var div = Dom.createElement("div", {
			display: "inline-block",
			visibility: "hidden",
			position: "relative",
			width: "15px",
			height: "16px",
			marginLeft: "-4px",
			marginRight: "2px"
		});
		var upper = Dom.createElement("span", {
			position: "absolute",
			top: "0px",
			left: "0px",
			width: "15px",
			height: "9px",
			backgroundRepeat: "no-repeat",
			backgroundPosition: "center center"
		});
		if (this._useCssStyle) {
			upper.className = "rg-cal-next-year"
		} else {
			Dom.setStyles(upper, {
				backgroundImage: _getAsset("cal_up.png")
			});
		}
		div.appendChild(upper);
		upper.onclick = function (e) {
			!this._useCssStyle && Dom.setStyles(e.currentTarget, {
				backgroundImage: _getAsset("cal_up_hover.png")
			});
			this._currDate.setFullYear(this._currDate.getFullYear() + 1);
			this.$_buildCalendar();
		}.bind(this);
		upper.onmouseover = this._useCssStyle ? null : function (e) {
			Dom.setStyles(e.currentTarget, {
				backgroundImage: _getAsset("cal_up_hover.png")
			});
		};
		upper.onmousedown = this._useCssStyle ? null : function (e) {
			Dom.setStyles(e.currentTarget, {
				backgroundImage: _getAsset("cal_up_active.png")
			});
		};
		upper.onmouseout = this._useCssStyle ? null : function (e) {
			Dom.setStyles(e.currentTarget, {
				backgroundImage: _getAsset("cal_up.png")
			});
		};
		var lower = Dom.createElement("span", {
			position: "absolute",
			top: "7px",
			left: "0px",
			width: "15px",
			height: "9px",
			backgroundRepeat: "no-repeat",
			backgroundPosition: "center center"
		});
		if (this._useCssStyle) {
			lower.className = "rg-cal-prev-year"
		} else {
			Dom.setStyles(lower, {
				backgroundImage: _getAsset("cal_down.png")
			});
		}
		div.appendChild(lower);
		lower.onclick = function (e) {
			!this._useCssStyle && Dom.setStyles(e.currentTarget, {
				backgroundImage: _getAsset("cal_down_hover.png")
			});
			this._currDate.setFullYear(this._currDate.getFullYear() - 1);
			this.$_buildCalendar();
		}.bind(this);
		lower.onmouseover = this._useCssStyle ? null : function (e) {
			Dom.setStyles(e.currentTarget, {
				backgroundImage: _getAsset("cal_down_hover.png")
			});
		};
		lower.onmousedown = this._useCssStyle ? null : function (e) {
			Dom.setStyles(e.currentTarget, {
				backgroundImage: _getAsset("cal_down_active.png")
			});
		};
		lower.onmouseout = this._useCssStyle ? null : function (e) {
			Dom.setStyles(e.currentTarget, {
				backgroundImage: _getAsset("cal_down.png")
			});
		};
		return div;
	},
	$_createCalendar: function () {
		var weeks = ["sun","mon","tue","wed","thu","fri","sat"];
		var elt = Dom.createElement("table", {
			margin: "2px"
		});
		elt.cellSpacing = 3;
		if (this._useCssStyle) {
			elt.className = "rg-cal-days-table";
		}
		var head = this._headElement = Dom.createElement("thead", {
		});
		if (this._useCssStyle) {
			head.className = "rg-cal-weeks";
		}
		elt.appendChild(elt.$_head = head);
		var i, cells, span;
		var tr = Dom.createElement("tr");
		head.appendChild(tr);
		cells = [];
		for (i = 0; i < 7; i++) {
			var th = Dom.createElement("th", {
				minWidth: "20px",
				textAlign: "center"
			});
			if (this._useCssStyle) {
				th.className = "rg-cal-week-"+weeks[i];
			}
			head.appendChild(th);
			var span = Dom.createElement("span", {
			});
			span.innerHTML = Dom.htmlEncode(this._weekDays[i]);
			th.appendChild(span);
			cells.push(span);
		}
		head.$_cells = cells;
		var body = Dom.createElement("tbody", {
		});
		if (this._useCssStyle) {
			body.className = "rg-cal-days";
		} else {
			Dom.setStyles(body,{
				fontSize:"10px"
			})
		}
		elt.appendChild(elt.$_body = body);
		var rows = body.$_rows = [];
		for (var r = 0; r < 6; r++) {
			var tr = Dom.createElement("tr", {
			});
			body.appendChild(tr);
			rows.push(tr);
			tr.$_cells = cells = [];
			for (i = 0; i < 7; i++) {
				var td = Dom.createElement("td", {
					padding: "1px",
				});
				if (this._useCssStyle) {
					td.className = "rg-cal-day rg-cal-week-"+weeks[i];
				} else {
					Dom.setStyles(td,{
						textAlign: "right",
						color: this._cellColor,
						background: "#f0f0f0",
						borderRadius: "1px"
					})
				}
				tr.appendChild(td);
				cells.push(td);
				td.onmouseover = this._useCssStyle ? null : this._mouseoverHandler;
				td.onmouseout = this._useCssStyle ? null : this._mouseoutHandler;
				td.onclick = this._clickHandler;
				span = Dom.createElement("span", {
				});
				td.appendChild(td.$_span = span);
			}
		}
		return elt;
	},
	$_show: function (x, y, cellWidth, editBounds) {
		this.setFocused(false);
		this._selected = false;
		this._header.$_title.$_yearSpin.style.visibility = this._yearNavigation ? "visible" : "hidden";
        this._todayElement.style.display = this._showToday ? "initial" : "none";
        this._header.$_title.style.marginRight = this._showToday ? "50px" : "20px";
		var d = this._date;
		if (!(d instanceof Date) || d == "Invalid Date") {
			d = null;
		}
		this._currDate = d ? new Date(d) : new Date();
		this._today = new Date();
		this.$_buildCalendar();
		this._dom.disableSelection();
		this._containerElement.appendChild(this._dom.element());
        var br = _getBrowserSize();
        var pr = Dom.getBounds(this._containerElement);
		var cr = Dom.getBounds(this._container._container);
        var w = br.width; // this._container.width(); // _container: grid container
        var h = br.height; //this._container.height();
		var r = this._dom.getBounds();
        var sx = window.pageXOffset || document.documentElement.scrollLeft;
        var sy = window.pageYOffset || document.documentElement.scrollTop;
        if (document.documentElement.scrollWidth > document.documentElement.clientWidth) {
            h -= 18;
        }
        if (document.documentElement.scrollHeight > document.documentElement.clientHeight) {
            w -= 18;
        }
        x += cr.left - pr.left;
        y += cr.top - pr.top;
		if (_ieTen || _ieOld || _ieLeg) {
			x += document.documentElement.scrollLeft;
			y += document.documentElement.scrollTop;
		}
		if (y + r.height > h + sy) {
			y = y - editBounds.height - r.height;
			if (y < 0) {
				y = h - r.height - 2;
			}
		}
		if (this._dropDownPosition != DropDownPosition.EDITOR) { // BUTTON 이거나 잘못된 값.
			x = Math.max(0, x + cellWidth - r.width);
		} else {
			if (x + r.width > w + sx) {
				x = w - r.width;
			}
		}
		if (this._viewGridInside) {
			y = editBounds.bottom - pr.top + 2;
			if ( (pr.bottom < editBounds.bottom+r.height) || (h+sy < editBounds.bottom+r.height)) {
				y = editBounds.top - r.height - pr.top - 2;
			}
		}
		this._dom.move(Math.max(0, x), Math.max(0, y));
	},
	$_isFocusedDay: function (date, day) {
		var t = _asDate(this._date);
		return t && date.getFullYear() == t.getFullYear() &&
				date.getMonth() == t.getMonth() &&
				day == t.getDate();
	},
	$_isToday: function (date, day) {
		var t = _asDate(this._today);
		return t && date.getFullYear() == t.getFullYear() &&
			date.getMonth() == t.getMonth() &&
			day == t.getDate();
	},
	$_buildCalendar: function () {
		var weeks = ["sun","mon","tue","wed","thu","fri","sat"];
		var i, cells;
		var header = this._header;
		var date = this._currDate;
		var prev = header.$_prev;
		var next = header.$_next;
		var title = header.$_title;
		var y = date.getFullYear();
		var m = date.getMonth();
		title.$_year.innerHTML = (this._yearDisplayFormat ? this._yearDisplayFormat.replace("{Y}", y) : y + "년") + "&nbsp;";
		if (this._months && this._months.length > 0)
			title.$_month.innerHTML = this._months[m];
		else
			title.$_month.innerHTML = this._monthDisplayFormat ? this._monthDisplayFormat.replace("{M}", m + 1) : (m + 1) + "월";

		if (m == 0) {
			prev.title = (y - 1) + "/12";
		} else {
			prev.title = y + "/" + _pad(m);
		}
		if (m == 11) {
			next.title = (y + 1) + "/01";
		} else {
			next.title = y + "/" + _pad(m + 2);
		}
		cells = this._calendar.$_head.$_cells;
		for (i = 0; i < 7; i++) {
			var elt = cells[i];
			elt.innerHTML = Dom.htmlEncode(this._weekDays[i]);
		}
		var body = this._calendar.$_body;
		var rows = body.$_rows;
		var mdays = $$_month_days[_isLeapYear(y) ? 1 : 0][m];
		var d = new Date(date);
		d.setDate(1);
		var dow = d.getDay();
		if (mdays == 30 && dow == 6 || mdays == 31 && dow >= 5) {
			Dom.addChild(body, rows[5]);
		} else {
			Dom.removeChild(body, rows[5]);
		}
		if (mdays == 28 && dow == 0) {
			Dom.removeChild(body, rows[4]);
		} else {
			Dom.addChild(body, rows[4]);
		}
		var c;
		var md = 0;
		cells = rows[0].$_cells;
		if (dow > 0) {
			var y2 = y;
			var m2 = m - 1;
			if (m2 < 0) {
				y2--;
				m2 = 11;
			}
			var mdays2 = $$_month_days[_isLeapYear(y2) ? 1 : 0][m2];
			for (i = 0; i < dow; i++) {
				c = cells[i];
				c.$_day = i - dow;
				c.$_span.innerHTML = (mdays2 - dow + i + 1);
				if (this._useCssStyle) {
					c.className = "rg-cal-day rg-cal-prev-day "+"rg-cal-week-"+weeks[i];
				} else {
					Dom.setStyles(c, {
						background: "",
						border: this._nullBorder,
						color: this._nullColor
					});
				}
			}
		}
		for (i = dow; i < 7; i++) {
			c = cells[i];
			c.$_day = md++;
			c.$_span.innerHTML = md;
			if (this.$_isFocusedDay(date, md)) {
				if (this._useCssStyle) {
					c.className = "rg-cal-day rg-cal-focusday "+"rg-cal-week-"+weeks[i];
				} else {
					Dom.setStyles(c, {
						background: this._focusedBackground,
						border: this._focusedBorder,
						color: this._cellColor
					});
				}
			} else if (this.$_isToday(date, md)) {
				if (this.useCssStyle) {
					c.className = "rg-cal-day rg-cal-today "+"rg-cal-week-"+weeks[i];
				} else {
					Dom.setStyles(c, {
						background: this._todayBackground,
						border: this._todayBorder,
						color: this._cellColor
					});
				}
			} else {
				if (this._useCssStyle) {
					c.className = "rg-cal-day "+"rg-cal-week-"+weeks[i];
				} else {
					Dom.setStyles(c, {
						background: this._cellBackground,
						border: this._cellBorder,
						color: this._cellColor
					});
				}
			}
		}
		for (var r = 1; r < 6 && md < mdays; r++) {
			cells = rows[r].$_cells;
			for (i = 0; i < 7; i++) {
				if (md < mdays) {
					c = cells[i];
					c.$_day = md++;
					c.$_span.innerHTML = md;
					if (this.$_isFocusedDay(date, md)) {
						if (this._useCssStyle) {
							c.className = "rg-cal-day rg-cal-focusday "+"rg-cal-week-"+weeks[i];
						} else {
							Dom.setStyles(c, {
								background: this._focusedBackground,
								border: this._focusedBorder,
								color: this._cellColor
							});
						}
					} else if (this.$_isToday(date, md)) {
						if (this._useCssStyle) {
							c.className = "rg-cal-day rg-cal-today "+"rg-cal-week-"+weeks[i];
						} else {
							Dom.setStyles(c, {
								background: this._todayBackground,
								border: this._todayBorder,
								color: this._cellColor
							});

						}
					} else {
						if (this._useCssStyle) {
							c.className = "rg-cal-day "+"rg-cal-week-"+weeks[i];
						} else {
							Dom.setStyles(c, {
								background: this._cellBackground,
								border: this._cellBorder,
								color: this._cellColor
							});
						}
					}
				} else {
					var j = 1;
					for (; i < 7; i++) {
						c = cells[i];
						c.$_day = md++;
						c.$_span.innerHTML = j++;
						if (this._useCssStyle) {
							c.className = "rg-cal-day rg-cal-next-day "+"rg-cal-week-"+weeks[i];
						} else {
							Dom.setStyles(c, {
								background: "",
								border: this._nullBorder,
								color: this._nullColor
							});
						}
					}
				}
			}
		}
	},
	$_refreshItems: function () {
	},
	$_search: function (text) {
	}
});
DatePicker.CLOSE_UP = "onDatePickerCloseUp";
var MonthPicker = defineClass("MonthPicker", EventAware, {
	init: function (editor,list, useCssStyle) {
		this._super();
		this._useCssStyle = useCssStyle;
		this._mouseoverHandler = function (e) {
			var div = e.currentTarget;
			div.style.background = "rgba(0, 0, 0, 0.9)";
			div.style.color = "#fff";
		}.bind(this);
		this._mouseoutHandler = function (e) {
			var div = e.currentTarget;
			div.style.background = "";
			div.style.color = "";
		}.bind(this);
		this._clickHandler = function (e) {
			e.preventDefault();
			e.stopImmediatePropagation();
			var div = e.currentTarget;
			var idx = Dom.getChildIndex(div);
			if (idx >= 0) {
				this._month = idx;
				this.fireEvent(MonthPicker.CLOSE_UP, this._month);
			}
			this.hide();
		}.bind(this);
		this._months = editor._months;
		this._dom = new Dom(this.$_createPicker());
		this._container = null;
		this._listElement = list;
	},
	month: -1,
	listElement:null,
	show: function (containerElement, x, y, innerDropDown) {
		this._container = containerElement;
		if (containerElement) {
			containerElement.appendChild(this._dom._element);
			var r = this._dom.getBounds();
			var s = Dom.getScrolled();
			if (innerDropDown && this._listElement) {
				var width = this._listElement.getBoundingClientRect().width;
				x = _int(this._listElement.style.left.replace("px","")) + width / 2;
				y = _int(this._listElement.style.top.replace("px",""));
			}
			x = Math.max(s.sx, x - r.width - 2);
			y = Math.max(s.sy, y - r.height / 2 + 13);
			this._dom.move(x, y);
		}
	},
	hide: function () {
		this._dom.detach();
		this._container = null;
	},
	isListing: function () {
		return this._container && this._container.contains(this._dom._element);
	},
	$_createPicker: function () {
		var element = Dom.createElement("div", {
			position: "absolute",
			float: "none",
			clear: "both",
			boxSizing: "border-box",
			zIndex: 3001,
		});
		if (this._useCssStyle) {
			element.className = "rg-cal-month-picker"
		} else {
			Dom.setStyles(element,{
				margin: "0px",
				cursor: "default",
				background: "#fff",
				border: "1px solid rgba(50, 50, 50, 0.5)",
				boxShadow: "rgba(0, 0, 0, 0.5) 1px 2px 5px",
				fontFamily: "Verdana",
				fontSize: "11px",
				fontStyle: "normal",
				fontVariant: "normal",
				fontWeight: "normal"
			});
		}
		element.onkeydown = function (e) {
			if (e.keyCode == 27) {
				this.hide();
			}
		}.bind(this);
		for (var i = 1; i <= 12; i++) {
			var div = Dom.createElement("div", {
				position: "relative",
				float: "none",
			});
			if (this._useCssStyle) {
				div.className = "rg-cal-month-picker-item";
			} else {
				Dom.setStyles(div,{
					paddingTop: "1px",
					paddingBottom: "1px",
					paddingLeft: "4px",
					paddingRight: "4px",
					fontFamily: "Verdana",
					fontSize: "11px",
					textAlign: "center",
					cursor: "default"
				})
			}
			Dom.disableSelection(div);
			element.appendChild(div);
			div.onclick = this._clickHandler;
			div.onmouseup = this._clickHandler;
			div.onmouseover = this._useCssStyle ? null : this._mouseoverHandler;
			div.onmouseout = this._useCssStyle ? null : this._mouseoutHandler;
			var span = Dom.createElement("span");
			span.innerHTML = Dom.htmlEncode((this._months ? this._months[i-1] : i) + " ");
			span.tabIndex = -1;
			Dom.disableSelection(span);
			div.appendChild(span);
		}
		return element;
	}
});
MonthPicker.CLOSE_UP = "onMonthPickerCloseUp";
