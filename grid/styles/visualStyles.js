var $$_FONT_REG = new RegExp("\\s*,\\s*");
var VisualStyles = defineClass("VisualStyles", EventAware, {
	init: function (owner, name, source, fireEvents) {
		this._super(true);
		this._owner = owner;
		this._name = name;
		this._parent = null;
		this._sysDefault = null;
		this._values = [];
		this._updateLock = 0;
		this._font = null;
		if (fireEvents !== UNDEFINED) {
			this._fireEvents = fireEvents;
		}
		source && this.extend(source);
	},
	destroy: function() {
		return false;
	},
	assign: function(source) {
		this._super(source);
		var attrs = VisualStyles.STYLE_NAMES;
		var attrNames = Object.keys(attrs);
		for(var i = 0, cnt = attrNames.length; i < cnt; i++) {
			var attrname = "_"+attrNames[i];
			this[attrname] = source[attrname];
		}
		this._values = source._values.slice();
	},
	copy: function(source) {
		var attrs = VisualStyles.STYLE_NAMES;
		var attrNames = Object.keys(attrs);
		for(var i = 0, cnt = attrNames.length; i < cnt; i++) {
			var attrname = "_"+attrNames[i];
			if (!this[attrname] && source[attrname]) {
				this[attrname] = source[attrname]
				this._values[attrs[attrNames[i]]] = true;
			}
		}
	},
	noProxy: function () {},
	name: null,
	parent: null,
	sysDefault: null,
	fireEvents: true,
	setParent: function (value, fireEvent) {
		if (value !== this._parent) {
			this._parent = value;
			if ((fireEvent === UNDEFINED || fireEvent) && this._fireEvents) {
				this.changed(VisualStyles.STYLE_ALL);
			}
		}
        return this;
	},
	setSysDefault: function (value, fireEvent) {
		if (value !== this._sysDefault) {
			this._sysDefault = value;
			if ((fireEvent === UNDEFINED || fireEvent) && this._fireEvents) {
				this.changed(VisualStyles.STYLE_ALL);
			}
		}
	},
	setParentAndDefault: function (parent, sysDefault) {
		this._parent = parent,
		this._sysDefault = sysDefault;
	},
	background: function (value) {
		if (arguments.length > 0) {
			if (value !== UNDEFINED) {
				value = this.getFill(value);
				if (!this._values[VisualStyles.BACKGROUND] || value !== this._background) {
					this._background = value;
					this._values[VisualStyles.BACKGROUND] = true;
					if (this._fireEvents) this.changed(VisualStyles.BACKGROUND);
				}
			} else if (this._values[VisualStyles.BACKGROUND]) {
				delete this._background;
				this._values[VisualStyles.BACKGROUND] = false;
				if (this._fireEvents) this.changed(VisualStyles.BACKGROUND);
			}
		} else {
			return this.searchStyles(VisualStyles.BACKGROUND)._background;
		}
	},
	selectedBackground: function (value) {
		if (arguments.length > 0) {
			if (value !== UNDEFINED) {
				value = this.getFill(value);
				if (!this._values[VisualStyles.SELECTED_BACKGROUND] || value !== this._selectedBackground) {
					this._selectedBackground = value;
					this._values[VisualStyles.SELECTED_BACKGROUND] = true;
					if (this._fireEvents) this.changed(VisualStyles.SELECTED_BACKGROUND);
				}
			} else if (this._values[VisualStyles.SELECTED_BACKGROUND]) {
				delete this._selectedBackground;
				this._values[VisualStyles.SELECTED_BACKGROUND] = false;
				if (this._fireEvents) this.changed(VisualStyles.SELECTED_BACKGROUND);
			}
		} else {
			return this.searchStyles(VisualStyles.SELECTED_BACKGROUND)._selectedBackground;
		}
	},
	inactiveBackground: function (value) {
		if (arguments.length > 0) {
			if (value !== UNDEFINED) {
				value = this.getFill(value);
				if (!this._values[VisualStyles.INACTIVE_BACKGROUND] || value !== this._inactiveBackground) {
					this._inactiveBackground = value;
					this._values[VisualStyles.INACTIVE_BACKGROUND] = true;
					if (this._fireEvents) this.changed(VisualStyles.INACTIVE_BACKGROUND);
				}
			} else if (this._values[VisualStyles.INACTIVE_BACKGROUND]) {
				delete this._inactiveBackground;
				this._values[VisualStyles.INACTIVE_BACKGROUND] = false;
				if (this._fireEvents) this.changed(VisualStyles.INACTIVE_BACKGROUND);
			}
		} else {
			return this.searchStyles(VisualStyles.INACTIVE_BACKGROUND)._inactiveBackground;
		}
	},
	border: function (value) {
		if (arguments.length > 0) {
			if (value !== UNDEFINED) {
				value = this.getStroke(value);
				if (!this._values[VisualStyles.BORDER] || value !== this._border) {
					this._border = value;
					this._values[VisualStyles.BORDER] = true;
					if (this._fireEvents) this.changed(VisualStyles.BORDER);
				}
			} else if (this._values[VisualStyles.BORDER]) {
				delete this._border;
				this._values[VisualStyles.BORDER] = false;
				if (this._fireEvents) this.changed(VisualStyles.BORDER);
			}
		} else {
			return this.searchStyles(VisualStyles.BORDER)._border;
		}
	},
	borderLeft: function (value) {
		if (arguments.length > 0) {
			if (value !== UNDEFINED) {
				value = this.getStroke(value);
				if (!this._values[VisualStyles.BORDER_LEFT] || value !== this._borderLeft) {
					this._borderLeft = value;
					this._values[VisualStyles.BORDER_LEFT] = true;
					if (this._fireEvents) this.changed(VisualStyles.BORDER_LEFT);
				}
			} else if (this._values[VisualStyles.BORDER_LEFT]) {
				delete this._borderLeft;
				this._values[VisualStyles.BORDER_LEFT] = false;
				if (this._fireEvents) this.changed(VisualStyles.BORDER_LEFT);
			}
		} else {
			return this.searchStyles(VisualStyles.BORDER_LEFT)._borderLeft;
		}
	},
	borderLeftWidth: function (value) {
		var stroke = this.borderLeft();
		return stroke ? stroke.width() : 0;
	},
	borderRight: function (value) {
		if (arguments.length > 0) {
			if (value !== UNDEFINED) {
				value = this.getStroke(value);
				if (!this._values[VisualStyles.BORDER_RIGHT] || value !== this._borderRight) {
					this._borderRight = value;
					this._values[VisualStyles.BORDER_RIGHT] = true;
					if (this._fireEvents) this.changed(VisualStyles.BORDER_RIGHT);
				}
			} else if (this._values[VisualStyles.BORDER_RIGHT]) {
				delete this._borderRight;
				this._values[VisualStyles.BORDER_RIGHT] = false;
				if (this._fireEvents) this.changed(VisualStyles.BORDER_RIGHT);
			}
		} else {
			return this.searchStyles(VisualStyles.BORDER_RIGHT)._borderRight;
		}
	},
	borderRightWidth: function (value) {
		var stroke = this.borderRight();
		return stroke ? stroke.width() : 0;
	},
	borderTop: function (value) {
		if (arguments.length > 0) {
			if (value !== UNDEFINED) {
				value = this.getStroke(value);
				if (!this._values[VisualStyles.BORDER_TOP] || value !== this._borderTop) {
					this._borderTop = value;
					this._values[VisualStyles.BORDER_TOP] = true;
					if (this._fireEvents) this.changed(VisualStyles.BORDER_TOP);
				}
			} else if (this._values[VisualStyles.BORDER_TOP]) {
				delete this._borderTop;
				this._values[VisualStyles.BORDER_TOP] = false;
				if (this._fireEvents) this.changed(VisualStyles.BORDER_TOP);
			}
		} else {
			return this.searchStyles(VisualStyles.BORDER_TOP)._borderTop;
		}
	},
	borderTopWidth: function (value) {
		var stroke = this.borderTop();
		return stroke ? stroke.width() : 0;
	},
	borderBottom: function (value) {
		if (arguments.length > 0) {
			if (value !== UNDEFINED) {
				value = this.getStroke(value);
				if (!this._values[VisualStyles.BORDER_BOTTOM] || value !== this._borderBottom) {
					this._borderBottom = value;
					this._values[VisualStyles.BORDER_BOTTOM] = true;
					if (this._fireEvents) this.changed(VisualStyles.BORDER_BOTTOM);
				}
			} else if (this._values[VisualStyles.BORDER_BOTTOM]) {
				delete this._borderBottom;
				this._values[VisualStyles.BORDER_BOTTOM] = false;
				if (this._fireEvents) this.changed(VisualStyles.BORDER_BOTTOM);
			}
		} else {
			return this.searchStyles(VisualStyles.BORDER_BOTTOM)._borderBottom;
		}
	},
	borderBottomWidth: function (value) {
		var stroke = this.borderBottom();
		return stroke ? stroke.width() : 0;
	},
	line: function (value) {
		if (arguments.length > 0) {
			if (value !== UNDEFINED) {
				value = this.getStroke(value);
				if (!this._values[VisualStyles.LINE] || value !== this._line) {
					this._line = value;
					this._values[VisualStyles.LINE] = true;
					if (this._fireEvents) this.changed(VisualStyles.LINE);
				}
			} else if (this._values[VisualStyles.LINE]) {
				delete this._line;
				this._values[VisualStyles.LINE] = false;
				if (this._fireEvents) this.changed(VisualStyles.LINE);
			}
		} else {
			return this.searchStyles(VisualStyles.LINE)._line;
		}
	},
	renderer: function (value) {
		if (arguments.length > 0) {
			if (value !== UNDEFINED) {
				if (!this._values[VisualStyles.RENDERER] || value !== this._renderer) {
					this._renderer = value;
					this._values[VisualStyles.RENDERER] = true;
					if (this._fireEvents) this.changed(VisualStyles.RENDERER);
				}
			} else if (this._values[VisualStyles.RENDERER]) {
				delete this._renderer;
				this._values[VisualStyles.RENDERER] = false;
				if (this._fireEvents) this.changed(VisualStyles.RENDERER);
			}
		} else {
			return this.searchStyles(VisualStyles.RENDERER)._renderer;
		}
	},
    fontName: function (value) {
        if (arguments.length > 0) {
            if (value !== UNDEFINED) {
                if (!this._values[VisualStyles.FONT_FAMILY] || value !== this._fontFamily) {
                    this._fontFamily = value;
                    this._values[VisualStyles.FONT_FAMILY] = true;
                    if (this._fireEvents) this.changed(VisualStyles.FONT_FAMILY);
                }
            } else if (this._values[VisualStyles.FONT_FAMILY]) {
                delete this._fontFamily;
                this._values[VisualStyles.FONT_FAMILY] = false;
                if (this._fireEvents) this.changed(VisualStyles.FONT_FAMILY);
            }
        } else {
            return this.searchStyles(VisualStyles.FONT_FAMILY)._fontFamily;
        }
    },
	fontFamily: function (value) {
		if (arguments.length > 0) {
			if (value !== UNDEFINED) {
				if (!this._values[VisualStyles.FONT_FAMILY] || value !== this._fontFamily) {
					this._fontFamily = value;
					this._values[VisualStyles.FONT_FAMILY] = true;
					if (this._fireEvents) this.changed(VisualStyles.FONT_FAMILY);
				}
			} else if (this._values[VisualStyles.FONT_FAMILY]) {
				delete this._fontFamily;
				this._values[VisualStyles.FONT_FAMILY] = false;
				if (this._fireEvents) this.changed(VisualStyles.FONT_FAMILY);
			}
		} else {
			return this.searchStyles(VisualStyles.FONT_FAMILY)._fontFamily;
		}
	},
	fontSize: function (value) {
		if (arguments.length > 0) {
			if (value !== UNDEFINED) {
				value = parseInt(value);
				if (!this._values[VisualStyles.FONT_SIZE] || value !== this._fontSize) {
					this._fontSize = value;
					this._values[VisualStyles.FONT_SIZE] = true;
					if (this._fireEvents) this.changed(VisualStyles.FONT_SIZE);
				}
			} else if (this._values[VisualStyles.FONT_SIZE]) {
				delete this._fontSize;
				this._values[VisualStyles.FONT_SIZE] = false;
				if (this._fireEvents) this.changed(VisualStyles.FONT_SIZE);
			}
		} else {
			return this.searchStyles(VisualStyles.FONT_SIZE)._fontSize;
		}
	},
	fontBold: function (value) {
		if (arguments.length > 0) {
			if (value !== UNDEFINED) {
				value = value && value !== "false";
				if (!this._values[VisualStyles.FONT_BOLD] || value !== this._fontBold) {
					this._fontBold = value;
					this._values[VisualStyles.FONT_BOLD] = true;
					if (this._fireEvents) this.changed(VisualStyles.FONT_BOLD);
				}
			} else if (this._values[VisualStyles.FONT_BOLD]) {
				delete this._fontBold;
				this._values[VisualStyles.FONT_BOLD] = false;
				if (this._fireEvents) this.changed(VisualStyles.FONT_BOLD);
			}
		} else {
			return this.searchStyles(VisualStyles.FONT_BOLD)._fontBold;
		}
	},
	fontItalic: function (value) {
		if (arguments.length > 0) {
			if (value !== UNDEFINED) {
				value = value && value !== "false";
				if (!this._values[VisualStyles.FONT_ITALIC] || value !== this._fontItalic) {
					this._fontItalic = value;
					this._values[VisualStyles.FONT_ITALIC] = true;
					if (this._fireEvents) this.changed(VisualStyles.FONT_ITALIC);
				}
			} else if (this._values[VisualStyles.FONT_ITALIC]) {
				delete this._fontItalic;
				this._values[VisualStyles.FONT_ITALIC] = false;
				if (this._fireEvents) this.changed(VisualStyles.FONT_ITALIC);
			}
		} else {
			return this.searchStyles(VisualStyles.FONT_ITALIC)._fontItalic;
		}
	},
	fontUnderline: function (value) {
		if (arguments.length > 0) {
			if (value !== UNDEFINED) {
				value = value && value !== "false";
				if (!this._values[VisualStyles.FONT_UNDERLINE] || value !== this._fontUnderline) {
					this._fontUnderline = value;
					this._values[VisualStyles.FONT_UNDERLINE] = true;
					if (this._fireEvents) this.changed(VisualStyles.FONT_UNDERLINE);
				}
			} else if (this._values[VisualStyles.FONT_UNDERLINE]) {
				delete this._fontUnderline;
				this._values[VisualStyles.FONT_UNDERLINE] = false;
				if (this._fireEvents) this.changed(VisualStyles.FONT_UNDERLINE);
			}
		} else {
			return this.searchStyles(VisualStyles.FONT_UNDERLINE)._fontUnderline;
		}
	},
	fontLinethrough: function (value) {
		if (arguments.length > 0) {
			if (value !== UNDEFINED) {
				value = value && value !== "false";
				if (!this._values[VisualStyles.FONT_LINETHROUGH] || value !== this._fontLinethrough) {
					this._fontLinethrough = value;
					this._values[VisualStyles.FONT_LINETHROUGH] = true;
					if (this._fireEvents) this.changed(VisualStyles.FONT_LINETHROUGH);
				}
			} else if (this._values[VisualStyles.FONT_LINETHROUGH]) {
				delete this._fontLinethrough;
				this._values[VisualStyles.FONT_LINETHROUGH] = false;
				if (this._fireEvents) this.changed(VisualStyles.FONT_LINETHROUGH);
			}
		} else {
			return this.searchStyles(VisualStyles.FONT_LINETHROUGH)._fontLinethrough;
		}
	},
	textWrap: function (value) {
		if (arguments.length > 0) {
			if (value !== UNDEFINED) {
				if (!this._values[VisualStyles.TEXT_WRAP] || value !== this._textWrap) {
					this._textWrap = value;
					this._values[VisualStyles.TEXT_WRAP] = true;
					if (this._fireEvents) this.changed(VisualStyles.TEXT_WRAP);
				}
			} else if (this._values[VisualStyles.TEXT_WRAP]) {
				delete this._textWrap;
				this._values[VisualStyles.TEXT_WRAP] = false;
				if (this._fireEvents) this.changed(VisualStyles.TEXT_WRAP);
			}
		} else {
			return this.searchStyles(VisualStyles.TEXT_WRAP)._textWrap;
		}
	},
	foreground: function (value) {
		if (arguments.length > 0) {
			if (value !== UNDEFINED) {
				value = this.getFill(value);
				if (!this._values[VisualStyles.FOREGROUND] || value !== this._foreground) {
					this._foreground = value;
					this._values[VisualStyles.FOREGROUND] = true;
					if (this._fireEvents) this.changed(VisualStyles.FOREGROUND);
				}
			} else if (this._values[VisualStyles.FOREGROUND]) {
				delete this._foreground;
				this._values[VisualStyles.FOREGROUND] = false;
				if (this._fireEvents) this.changed(VisualStyles.FOREGROUND);
			}
		} else {
			return this.searchStyles(VisualStyles.FOREGROUND)._foreground;
		}
	},
	selectedForeground: function (value) {
		if (arguments.length > 0) {
			if (value !== UNDEFINED) {
				value = this.getFill(value);
				if (!this._values[VisualStyles.SELECTED_FOREGROUND] || value !== this._selectedForeground) {
					this._selectedForeground = value;
					this._values[VisualStyles.SELECTED_FOREGROUND] = true;
					if (this._fireEvents) this.changed(VisualStyles.SELECTED_FOREGROUND);
				}
			} else if (this._values[VisualStyles.SELECTED_FOREGROUND]) {
				delete this._selectedForeground;
				this._values[VisualStyles.SELECTED_FOREGROUND] = false;
				if (this._fireEvents) this.changed(VisualStyles.SELECTED_FOREGROUND);
			}
		} else {
			return this.searchStyles(VisualStyles.SELECTED_FOREGROUND)._selectedForeground;
		}
	},
	inactiveForeground: function (value) {
		if (arguments.length > 0) {
			if (value !== UNDEFINED) {
				value = this.getFill(value);
				if (!this._values[VisualStyles.INACTIVE_FOREGROUND] || value !== this._inactiveForeground) {
					this._inactiveForeground = value;
					this._values[VisualStyles.INACTIVE_FOREGROUND] = true;
					if (this._fireEvents) this.changed(VisualStyles.INACTIVE_FOREGROUND);
				}
			} else if (this._values[VisualStyles.INACTIVE_FOREGROUND]) {
				delete this._inactiveForeground;
				this._values[VisualStyles.INACTIVE_FOREGROUND] = false;
				if (this._fireEvents) this.changed(VisualStyles.INACTIVE_FOREGROUND);
			}
		} else {
			return this.searchStyles(VisualStyles.INACTIVE_FOREGROUND)._inactiveForeground;
		}
	},
	textAlignment: function (value) {
		if (arguments.length > 0) {
			if (value !== UNDEFINED) {
				if (!this._values[VisualStyles.TEXT_ALIGNMENT] || value !== this._textAlignment) {
					this._textAlignment = value;
					this._values[VisualStyles.TEXT_ALIGNMENT] = true;
					if (this._fireEvents) this.changed(VisualStyles.TEXT_ALIGNMENT);
				}
			} else if (this._values[VisualStyles.TEXT_ALIGNMENT]) {
				delete this._textAlignment;
				this._values[VisualStyles.TEXT_ALIGNMENT] = false;
				if (this._fireEvents) this.changed(VisualStyles.TEXT_ALIGNMENT);
			}
		} else {
			return this.searchStyles(VisualStyles.TEXT_ALIGNMENT)._textAlignment;
		}
	},
	lineAlignment: function (value) {
		if (arguments.length > 0) {
			if (value !== UNDEFINED) {
				if (!this._values[VisualStyles.LINE_ALIGNMENT] || value !== this._lineAlignment) {
					this._lineAlignment = value;
					this._values[VisualStyles.LINE_ALIGNMENT] = true;
					if (this._fireEvents) this.changed(VisualStyles.LINE_ALIGNMENT);
				}
			} else if (this._values[VisualStyles.LINE_ALIGNMENT]) {
				delete this._lineAlignment;
				this._values[VisualStyles.LINE_ALIGNMENT] = false;
				if (this._fireEvents) this.changed(VisualStyles.LINE_ALIGNMENT);
			}
		} else {
			return this.searchStyles(VisualStyles.LINE_ALIGNMENT)._lineAlignment;
		}
	},
	numberFormat: function (value) {
		if (arguments.length > 0) {
			if (value !== UNDEFINED) {
				if (!this._values[VisualStyles.NUMBER_FORMAT] || value !== this._numberFormat) {
					this._numberFormat = value;
					this._values[VisualStyles.NUMBER_FORMAT] = true;
					if (this._fireEvents) this.changed(VisualStyles.NUMBER_FORMAT);
				}
			} else if (this._values[VisualStyles.NUMBER_FORMAT]) {
				delete this._numberFormat;
				this._values[VisualStyles.NUMBER_FORMAT] = false;
				if (this._fireEvents) this.changed(VisualStyles.NUMBER_FORMAT);
			}
		} else {
			return this.searchStyles(VisualStyles.NUMBER_FORMAT)._numberFormat;
		}
	},
	datetimeFormat: function (value) {
		if (arguments.length > 0) {
			if (value !== UNDEFINED) {
				if (!this._values[VisualStyles.DATETIME_FORMAT] || value !== this._datetimeFormat) {
					this._datetimeFormat = value;
					this._values[VisualStyles.DATETIME_FORMAT] = true;
					if (this._fireEvents) this.changed(VisualStyles.DATETIME_FORMAT);
				}
			} else if (this._values[VisualStyles.DATETIME_FORMAT]) {
				delete this._datetimeFormat;
				this._values[VisualStyles.DATETIME_FORMAT] = false;
				if (this._fireEvents) this.changed(VisualStyles.DATETIME_FORMAT);
			}
		} else {
			return this.searchStyles(VisualStyles.DATETIME_FORMAT)._datetimeFormat;
		}
	},
	booleanFormat: function (value) {
		if (arguments.length > 0) {
			if (value !== UNDEFINED) {
				if (!this._values[VisualStyles.BOOLEAN_FORMAT] || value !== this._booleanFormat) {
					this._booleanFormat = value;
					this._values[VisualStyles.BOOLEAN_FORMAT] = true;
					if (this._fireEvents) this.changed(VisualStyles.BOOLEAN_FORMAT);
				}
			} else if (this._values[VisualStyles.BOOLEAN_FORMAT]) {
				delete this._booleanFormat;
				this._values[VisualStyles.BOOLEAN_FORMAT] = false;
				if (this._fireEvents) this.changed(VisualStyles.BOOLEAN_FORMAT);
			}
		} else {
			return this.searchStyles(VisualStyles.BOOLEAN_FORMAT)._booleanFormat;
		}
	},
	prefix: function (value) {
		if (arguments.length > 0) {
			if (value !== UNDEFINED) {
				if (!this._values[VisualStyles.PREFIX] || value !== this._prefix) {
					this._prefix = value;
					this._values[VisualStyles.PREFIX] = true;
					if (this._fireEvents) this.changed(VisualStyles.PREFIX);
				}
			} else if (this._values[VisualStyles.PREFIX]) {
				delete this._prefix;
				this._values[VisualStyles.PREFIX] = false;
				if (this._fireEvents) this.changed(VisualStyles.PREFIX);
			}
		} else {
			return this.searchStyles(VisualStyles.PREFIX)._prefix;
		}
	},
	suffix: function (value) {
		if (arguments.length > 0) {
			if (value !== UNDEFINED) {
				if (!this._values[VisualStyles.SUFFIX] || value !== this._suffix) {
					this._suffix = value;
					this._values[VisualStyles.SUFFIX] = true;
					if (this._fireEvents) this.changed(VisualStyles.SUFFIX);
				}
			} else if (this._values[VisualStyles.SUFFIX]) {
				delete this._suffix;
				this._values[VisualStyles.SUFFIX] = false;
				if (this._fireEvents) this.changed(VisualStyles.SUFFIX);
			}
		} else {
			return this.searchStyles(VisualStyles.SUFFIX)._suffix;
		}
	},
	paddingLeft: function (value) {
		if (arguments.length > 0) {
			if (value !== UNDEFINED) {
				value = parseInt(value);
				if (!this._values[VisualStyles.PADDING_LEFT] || value !== this._paddingLeft) {
					this._paddingLeft = value;
					this._values[VisualStyles.PADDING_LEFT] = true;
					if (this._fireEvents) this.changed(VisualStyles.PADDING_LEFT);
				}
			} else if (this._values[VisualStyles.PADDING_LEFT]) {
				delete this._paddingLeft;
				this._values[VisualStyles.PADDING_LEFT] = false;
				if (this._fireEvents) this.changed(VisualStyles.PADDING_LEFT);
			}
		} else {
			return this.searchStyles(VisualStyles.PADDING_LEFT)._paddingLeft;
		}
	},
	paddingRight: function (value) {
		if (arguments.length > 0) {
			if (value !== UNDEFINED) {
				if (!this._values[VisualStyles.PADDING_RIGHT] || value !== this._paddingRight) {
					value = parseInt(value);
					this._paddingRight = value;
					this._values[VisualStyles.PADDING_RIGHT] = true;
					if (this._fireEvents) this.changed(VisualStyles.PADDING_RIGHT);
				}
			} else if (this._values[VisualStyles.PADDING_RIGHT]) {
				delete this._paddingRight;
				this._values[VisualStyles.PADDING_RIGHT] = false;
				if (this._fireEvents) this.changed(VisualStyles.PADDING_RIGHT);
			}
		} else {
			return this.searchStyles(VisualStyles.PADDING_RIGHT)._paddingRight;
		}
	},
	paddingTop: function (value) {
		if (arguments.length > 0) {
			if (value !== UNDEFINED) {
				value = parseInt(value);
				if (!this._values[VisualStyles.PADDING_TOP] || value !== this._paddingTop) {
					this._paddingTop = value;
					this._values[VisualStyles.PADDING_TOP] = true;
					if (this._fireEvents) this.changed(VisualStyles.PADDING_TOP);
				}
			} else if (this._values[VisualStyles.PADDING_TOP]) {
				delete this._paddingTop;
				this._values[VisualStyles.PADDING_TOP] = false;
				if (this._fireEvents) this.changed(VisualStyles.PADDING_TOP);
			}
		} else {
			return this.searchStyles(VisualStyles.PADDING_TOP)._paddingTop;
		}
	},
	paddingBottom: function (value) {
		if (arguments.length > 0) {
			if (value !== UNDEFINED) {
				value = parseInt(value);
				if (!this._values[VisualStyles.PADDING_BOTTOM] || value !== this._paddingBottom) {
					this._paddingBottom = value;
					this._values[VisualStyles.PADDING_BOTTOM] = true;
					if (this._fireEvents) this.changed(VisualStyles.PADDING_BOTTOM);
				}
			} else if (this._values[VisualStyles.PADDING_BOTTOM]) {
				delete this._paddingBottom;
				this._values[VisualStyles.PADDING_BOTTOM] = false;
				if (this._fireEvents) this.changed(VisualStyles.PADDING_BOTTOM);
			}
		} else {
			return this.searchStyles(VisualStyles.PADDING_BOTTOM)._paddingBottom;
		}
	},
	paddingHorz: function (value) {
		return this.paddingLeft() + this.paddingRight();
	},
	paddingVert: function (value) {
		return this.paddingTop() + this.paddingBottom();
	},
	iconIndex: function (value) {
		if (arguments.length > 0) {
			if (value !== UNDEFINED) {
				if (!this._values[VisualStyles.ICON_INDEX] || value !== this._iconIndex) {
					this._iconIndex = value;
					this._values[VisualStyles.ICON_INDEX] = true;
					if (this._fireEvents) this.changed(VisualStyles.ICON_INDEX);
				}
			} else if (this._values[VisualStyles.ICON_INDEX]) {
				delete this._iconIndex;
				this._values[VisualStyles.ICON_INDEX] = false;
				if (this._fireEvents) this.changed(VisualStyles.ICON_INDEX);
			}
		} else {
			return this.searchStyles(VisualStyles.ICON_INDEX)._iconIndex;
		}
	},
	iconLocation: function (value) {
		if (arguments.length > 0) {
			if (value !== UNDEFINED) {
				if (!this._values[VisualStyles.ICON_LOCATION] || value !== this._iconLocation) {
					this._iconLocation = value;
					this._values[VisualStyles.ICON_LOCATION] = true;
					if (this._fireEvents) this.changed(VisualStyles.ICON_LOCATION);
				}
			} else if (this._values[VisualStyles.ICON_LOCATION]) {
				delete this._iconLocation;
				this._values[VisualStyles.ICON_LOCATION] = false;
				if (this._fireEvents) this.changed(VisualStyles.ICON_LOCATION);
			}
		} else {
			return this.searchStyles(VisualStyles.ICON_LOCATION)._iconLocation;
		}
	},
	iconAlignment: function (value) {
		if (arguments.length > 0) {
			if (value !== UNDEFINED) {
				if (!this._values[VisualStyles.ICON_ALIGNMENT] || value !== this._iconAlignment) {
					this._iconAlignment = value;
					this._values[VisualStyles.ICON_ALIGNMENT] = true;
					if (this._fireEvents) this.changed(VisualStyles.ICON_ALIGNMENT);
				}
			} else if (this._values[VisualStyles.ICON_ALIGNMENT]) {
				delete this._iconAlignment;
				this._values[VisualStyles.ICON_ALIGNMENT] = false;
				if (this._fireEvents) this.changed(VisualStyles.ICON_ALIGNMENT);
			}
		} else {
			return this.searchStyles(VisualStyles.ICON_ALIGNMENT)._iconAlignment;
		}
	},
	iconOffset: function (value) {
		if (arguments.length > 0) {
			if (value !== UNDEFINED) {
				value = parseInt(value);
				if (!this._values[VisualStyles.ICON_OFFSET] || value !== this._iconOffset) {
					this._iconOffset = value;
					this._values[VisualStyles.ICON_OFFSET] = true;
					if (this._fireEvents) this.changed(VisualStyles.ICON_OFFSET);
				}
			} else if (this._values[VisualStyles.ICON_OFFSET]) {
				delete this._iconOffset;
				this._values[VisualStyles.ICON_OFFSET] = false;
				if (this._fireEvents) this.changed(VisualStyles.ICON_OFFSET);
			}
		} else {
			return this.searchStyles(VisualStyles.ICON_OFFSET)._iconOffset;
		}
	},
	iconPadding: function (value) {
		if (arguments.length > 0) {
			if (value !== UNDEFINED) {
				value = parseInt(value);
				if (!this._values[VisualStyles.ICON_PADDING] || value !== this._iconPadding) {
					this._iconPadding = value;
					this._values[VisualStyles.ICON_PADDING] = true;
					if (this._fireEvents) this.changed(VisualStyles.ICON_PADDING);
				}
			} else if (this._values[VisualStyles.ICON_PADDING]) {
				delete this._iconPadding;
				this._values[VisualStyles.ICON_PADDING] = false;
				if (this._fireEvents) this.changed(VisualStyles.ICON_PADDING);
			}
		} else {
			return this.searchStyles(VisualStyles.ICON_PADDING)._iconPadding;
		}
	},
	contentFit: function (value) {
		if (arguments.length > 0) {
			if (value !== UNDEFINED) {
				if (!this._values[VisualStyles.CONTENT_FIT] || value !== this._contentFit) {
					this._contentFit = value;
					this._values[VisualStyles.CONTENT_FIT] = true;
					if (this._fireEvents) this.changed(VisualStyles.CONTENT_FIT);
				}
			} else if (this._values[VisualStyles.CONTENT_FIT]) {
				delete this._contentFit;
				this._values[VisualStyles.CONTENT_FIT] = false;
				if (this._fireEvents) this.changed(VisualStyles.CONTENT_FIT);
			}
		} else {
			return this.searchStyles(VisualStyles.CONTENT_FIT)._contentFit;
		}
	},
	selectionDisplay: function (value) {
		if (arguments.length > 0) {
			if (value !== UNDEFINED) {
				if (!this._values[VisualStyles.SELECTION_DISPLAY] || value !== this._selectionDisplay) {
					this._selectionDisplay = value;
					this._values[VisualStyles.SELECTION_DISPLAY] = true;
					if (this._fireEvents) this.changed(VisualStyles.SELECTION_DISPLAY);
				}
			} else if (this._values[VisualStyles.SELECTION_DISPLAY]) {
				delete this._selectionDisplay;
				this._values[VisualStyles.SELECTION_DISPLAY] = false;
				if (this._fireEvents) this.changed(VisualStyles.SELECTION_DISPLAY);
			}
		} else {
			return this.searchStyles(VisualStyles.SELECTION_DISPLAY)._selectionDisplay;
		}
	},
	hoveredMaskBackground: function (value) {
		if (arguments.length > 0) {
			if (value !== UNDEFINED) {
				value = this.getFill(value);
				if (!this._values[VisualStyles.HOVERED_MASK_BACKGROUND] || value !== this._hoveredMaskBackground) {
					this._hoveredMaskBackground = value;
					this._values[VisualStyles.HOVERED_MASK_BACKGROUND] = true;
					if (this._fireEvents) this.changed(VisualStyles.HOVERED_MASK_BACKGROUND);
				}
			} else if (this._values[VisualStyles.HOVERED_MASK_BACKGROUND]) {
				delete this._hoveredMaskBackground;
				this._values[VisualStyles.HOVERED_MASK_BACKGROUND] = false;
				if (this._fireEvents) this.changed(VisualStyles.HOVERED_MASK_BACKGROUND);
			}
		} else {
			return this.searchStyles(VisualStyles.HOVERED_MASK_BACKGROUND)._hoveredMaskBackground;
		}
	},
	hoveredMaskBorder: function (value) {
		if (arguments.length > 0) {
			if (value !== UNDEFINED) {
				value = this.getStroke(value);
				if (!this._values[VisualStyles.HOVERED_MASK_BORDER] || value !== this._hoveredMaskBorder) {
					this._hoveredMaskBorder = value;
					this._values[VisualStyles.HOVERED_MASK_BORDER] = true;
					if (this._fireEvents) this.changed(VisualStyles.HOVERED_MASK_BORDER);
				}
			} else if (this._values[VisualStyles.HOVERED_MASK_BORDER]) {
				delete this._hoveredMaskBorder;
				this._values[VisualStyles.HOVERED_MASK_BORDER] = false;
				if (this._fireEvents) this.changed(VisualStyles.HOVERED_MASK_BORDER);
			}
		} else {
			return this.searchStyles(VisualStyles.HOVERED_MASK_BORDER)._hoveredMaskBorder;
		}
	},
	hoveredBackground: function (value) {
		if (arguments.length > 0) {
			if (value !== UNDEFINED) {
				value = this.getFill(value);
				if (!this._values[VisualStyles.HOVERED_BACKGROUND] || value !== this._hoveredBackground) {
					this._hoveredBackground = value;
					this._values[VisualStyles.HOVERED_BACKGROUND] = true;
					if (this._fireEvents) this.changed(VisualStyles.HOVERED_BACKGROUND);
				}
			} else if (this._values[VisualStyles.HOVERED_BACKGROUND]) {
				delete this._hoveredBackground;
				this._values[VisualStyles.HOVERED_BACKGROUND] = false;
				if (this._fireEvents) this.changed(VisualStyles.HOVERED_BACKGROUND);
			}
		} else {
			return this.searchStyles(VisualStyles.HOVERED_BACKGROUND)._hoveredBackground;
		}
	},
	hoveredForeground: function (value) {
		if (arguments.length > 0) {
			if (value !== UNDEFINED) {
				value = this.getFill(value);
				if (!this._values[VisualStyles.HOVERED_FOREGROUND] || value !== this._hoveredForeground) {
					this._hoveredForeground = value;
					this._values[VisualStyles.HOVERED_FOREGROUND] = true;
					if (this._fireEvents) this.changed(VisualStyles.HOVERED_FOREGROUND);
				}
			} else if (this._values[VisualStyles.HOVERED_FOREGROUND]) {
				delete this._hoveredForeground;
				this._values[VisualStyles.HOVERED_FOREGROUND] = false;
				if (this._fireEvents) this.changed(VisualStyles.HOVERED_FOREGROUND);
			}
		} else {
			return this.searchStyles(VisualStyles.HOVERED_FOREGROUND)._hoveredForeground;
		}
	},
	figureBackground: function (value) {
		if (arguments.length > 0) {
			if (value !== UNDEFINED) {
				value = this.getFill(value);
				if (!this._values[VisualStyles.FIGURE_BACKGROUND] || value !== this._figureBackground) {
					this._figureBackground = value;
					this._values[VisualStyles.FIGURE_BACKGROUND] = true;
					if (this._fireEvents) this.changed(VisualStyles.FIGURE_BACKGROUND);
				}
			} else if (this._values[VisualStyles.FIGURE_BACKGROUND]) {
				delete this._figureBackground;
				this._values[VisualStyles.FIGURE_BACKGROUND] = false;
				if (this._fireEvents) this.changed(VisualStyles.FIGURE_BACKGROUND);
			}
		} else {
			return this.searchStyles(VisualStyles.FIGURE_BACKGROUND)._figureBackground;
		}
	},
	figureInactiveBackground: function (value) {
		if (arguments.length > 0) {
			if (value !== UNDEFINED) {
				value = this.getFill(value);
				if (!this._values[VisualStyles.FIGURE_INACTIVE_BACKGROUND] || value !== this._figureInactiveBackground) {
					this._figureInactiveBackground = value;
					this._values[VisualStyles.FIGURE_INACTIVE_BACKGROUND] = true;
					if (this._fireEvents) this.changed(VisualStyles.FIGURE_INACTIVE_BACKGROUND);
				}
			} else if (this._values[VisualStyles.FIGURE_INACTIVE_BACKGROUND]) {
				delete this._figureInactiveBackground;
				this._values[VisualStyles.FIGURE_INACTIVE_BACKGROUND] = false;
				if (this._fireEvents) this.changed(VisualStyles.FIGURE_INACTIVE_BACKGROUND);
			}
		} else {
			return this.searchStyles(VisualStyles.FIGURE_INACTIVE_BACKGROUND)._figureInactiveBackground;
		}
	},
	figureBorder: function (value) {
		if (arguments.length > 0) {
			if (value !== UNDEFINED) {
				value = this.getStroke(value);
				if (!this._values[VisualStyles.FIGURE_BORDER] || value !== this._figureBorder) {
					this._figureBorder = value;
					this._values[VisualStyles.FIGURE_BORDER] = true;
					if (this._fireEvents) this.changed(VisualStyles.FIGURE_BORDER);
				}
			} else if (this._values[VisualStyles.FIGURE_BORDER]) {
				delete this._figureBorder;
				this._values[VisualStyles.FIGURE_BORDER] = false;
				if (this._fireEvents) this.changed(VisualStyles.FIGURE_BORDER);
			}
		} else {
			return this.searchStyles(VisualStyles.FIGURE_BORDER)._figureBorder;
		}
	},
	figureSize: function (value) {
		if (arguments.length > 0) {
			if (value !== UNDEFINED) {
				if (!this._values[VisualStyles.FIGURE_SIZE] || value !== this._figureSize) {
					this._figureSize = VisualStyles.getDimension(value);
					this._values[VisualStyles.FIGURE_SIZE] = true;
					if (this._fireEvents) this.changed(VisualStyles.FIGURE_SIZE);
				}
			} else if (this._values[VisualStyles.FIGURE_SIZE]) {
				delete this._figureSize;
				this._values[VisualStyles.FIGURE_SIZE] = false;
				if (this._fireEvents) this.changed(VisualStyles.FIGURE_SIZE);
			}
		} else {
			return this.searchStyles(VisualStyles.FIGURE_SIZE)._figureSize;
		}
	},
	figureName: function (value) {
		if (arguments.length > 0) {
			if (value !== UNDEFINED) {
				if (!this._values[VisualStyles.FIGURE_NAME] || value !== this._figureName) {
					this._figureName = value;
					this._values[VisualStyles.FIGURE_NAME] = true;
					if (this._fireEvents) this.changed(VisualStyles.FIGURE_NAME);
				}
			} else if (this._values[VisualStyles.FIGURE_NAME]) {
				delete this._figureName;
				this._values[VisualStyles.FIGURE_NAME] = false;
				if (this._fireEvents) this.changed(VisualStyles.FIGURE_NAME);
			}
		} else {
			return this.searchStyles(VisualStyles.FIGURE_NAME)._figureName;
		}
	},
	figureState: function (value) {
		if (arguments.length > 0) {
			if (value !== UNDEFINED) {
				if (!this._values[VisualStyles.FIGURE_STATE] || value !== this._figureState) {
					this._figureState = value;
					this._values[VisualStyles.FIGURE_STATE] = true;
					if (this._fireEvents) this.changed(VisualStyles.FIGURE_STATE);
				}
			} else if (this._values[VisualStyles.FIGURE_STATE]) {
				delete this._figureState;
				this._values[VisualStyles.FIGURE_STATE] = false;
				if (this._fireEvents) this.changed(VisualStyles.FIGURE_STATE);
			}
		} else {
			return this.searchStyles(VisualStyles.FIGURE_STATE)._figureState;
		}
	},
	font: function (value) {
		if (arguments.length > 0) {
			value = value && value.trim();
			if (value) {
				var arr = value.split($$_FONT_REG);
				var len = arr.length;
				if (len > 0 && arr[0]) {
					this.fontFamily(arr[0]);
				}
				if (len > 1 && arr[1]) {
					this.fontSize(arr[1]);
				}
				var i;
				var s;
				for (i = 2; i < len; i++) {
					s = arr[i];
					if (s) {
						s = s.toLowerCase();
						switch (s) {
							case "bold":
								this.fontBold(true);
								break;
							case "italic":
								this.fontItalic(true);
								break;
							case "underline":
								this.fontUnderline(true);
								break;
							case "linethrough":
							case "line-through":
								this.fontLinethrough(true);
								break;
						}
					}
				}
			}
		} else {
			var font = [];
			var sz = this.fontSize();
			if (this.fontItalic()) {
				font.push("italic");
			}
			if (this.fontBold()) {
				font.push("bold");
			}
			font.push(sz + "px");
			var family;
			if (family = this.fontFamily()) {
				font.push(family);
			}
			s = font.join(" ");
			return { font: s, size: sz, underline: this.fontUnderline() };
		}
	},
	beginUpdate: function () {
		this._updateLock++;
	},
	endUpdate: function (fireEvent) {
		fireEvent = arguments.length > 0 ? fireEvent : true;
		this._updateLock--;
		if (this._updateLock == 0 && this._fireEvents) {
			this.changed(VisualStyles.STYLE_ALL, fireEvent);
		}
	},
	hasValue: function (entry) {
		return typeof entry === "string" ? this._values[VisualStyles.STYLE_NAMES[entry]] : this._values[entry];
	},
    getValue: function (entry) {
        return this["_" + entry];
    },
	clearValues: function () {
		this._values = [];
	},
	extend: function (source, fireEvent) {
		fireEvent = arguments.length > 1 ? fireEvent : true;
		this.beginUpdate();
		try {
			if (source instanceof VisualStyles) {
				var values = source._values;
				if (values[VisualStyles.BACKGROUND]) {
					this.background(source._background);
				}
				if (values[VisualStyles.SELECTED_BACKGROUND]) {
					this.selectedBackground(source._selectedBackground);
				}
				if (values[VisualStyles.INACTIVE_BACKGROUND]) {
					this.inactiveBackground(source._inactiveBackground);
				}
				if (values[VisualStyles.BORDER]) {
					this.border(source._border);
				}
				if (values[VisualStyles.BORDER_LEFT]) {
					this.borderLeft(source._borderLeft);
				}
				if (values[VisualStyles.BORDER_RIGHT]) {
					this.borderRight(source._borderRight);
				}
				if (values[VisualStyles.BORDER_TOP]) {
					this.borderTop(source._borderTop);
				}
				if (values[VisualStyles.BORDER_BOTTOM]) {
					this.borderBottom(source._borderBottom);
				}
				if (values[VisualStyles.LINE]) {
					this.line(source._line);
				}
				if (values[VisualStyles.RENDERER]) {
					this.renderer(source._renderer);
				}
				if (values[VisualStyles.FONT_FAMILY]) {
					this.fontFamily(source._fontFamily);
				}
				if (values[VisualStyles.FONT_SIZE]) {
					this.fontSize(source._fontSize);
				}
				if (values[VisualStyles.FONT_BOLD]) {
					this.fontBold(source._fontBold);
				}
				if (values[VisualStyles.FONT_ITALIC]) {
					this.fontItalic(source._fontItalic);
				}
				if (values[VisualStyles.FONT_UNDERLINE]) {
					this.fontUnderline(source._fontUnderline);
				}
				if (values[VisualStyles.FONT_LINETHROUGH]) {
					this.fontLinethrough(source._fontLinethrough);
				}
				if (values[VisualStyles.TEXT_WRAP]) {
					this.textWrap(source._textWrap);
				}
				if (values[VisualStyles.FOREGROUND]) {
					this.foreground(source._foreground);
				}
				if (values[VisualStyles.SELECTED_FOREGROUND]) {
					this.selectedForeground(source._selectedForeground);
				}
				if (values[VisualStyles.INACTIVE_FOREGROUND]) {
					this.inactiveForeground(source._inactiveForeground);
				}
				if (values[VisualStyles.TEXT_ALIGNMENT]) {
					this.textAlignment(source._textAlignment);
				}
				if (values[VisualStyles.LINE_ALIGNMENT]) {
					this.lineAlignment(source._lineAlignment);
				}
				if (values[VisualStyles.NUMBER_FORMAT]) {
					this.numberFormat(source._numberFormat);
				}
				if (values[VisualStyles.DATETIME_FORMAT]) {
					this.datetimeFormat(source._datetimeFormat);
				}
				if (values[VisualStyles.BOOLEAN_FORMAT]) {
					this.booleanFormat(source._booleanFormat);
				}
				if (values[VisualStyles.PREFIX]) {
					this.prefix(source._prefix);
				}
				if (values[VisualStyles.SUFFIX]) {
					this.suffix(source._suffix);
				}
				if (values[VisualStyles.PADDING_LEFT]) {
					this.paddingLeft(source._paddingLeft);
				}
				if (values[VisualStyles.PADDING_RIGHT]) {
					this.paddingRight(source._paddingRight);
				}
				if (values[VisualStyles.PADDING_TOP]) {
					this.paddingTop(source._paddingTop);
				}
				if (values[VisualStyles.PADDING_BOTTOM]) {
					this.paddingBottom(source._paddingBottom);
				}
				if (values[VisualStyles.ICON_INDEX]) {
					this.iconIndex(source._iconIndex);
				}
				if (values[VisualStyles.ICON_LOCATION]) {
					this.iconLocation(source._iconLocation);
				}
				if (values[VisualStyles.ICON_ALIGNMENT]) {
					this.iconAlignment(source._iconAlignment);
				}
				if (values[VisualStyles.ICON_OFFSET]) {
					this.iconOffset(source._iconOffset);
				}
				if (values[VisualStyles.ICON_PADDING]) {
					this.iconPadding(source._iconPadding);
				}
				if (values[VisualStyles.CONTENT_FIT]) {
					this.contentFit(source._contentFit);
				}
				if (values[VisualStyles.SELECTION_DISPLAY]) {
					this.selectionDisplay(source._selectionDisplay);
				}
				if (values[VisualStyles.HOVERED_MASK_BACKGROUND]) {
					this.hoveredMaskBackground(source._hoveredMaskBackground);
				}
				if (values[VisualStyles.HOVERED_MASK_BORDER]) {
					this.hoveredMaskBorder(source._hoveredMaskBorder);
				}
				if (values[VisualStyles.HOVERED_BACKGROUND]) {
					this.hoveredBackground(source._hoveredBackground);
				}
				if (values[VisualStyles.HOVERED_FOREGROUND]) {
					this.hoveredForeground(source._hoveredForeground);
				}
				if (values[VisualStyles.FIGURE_BACKGROUND]) {
					this.figureBackground(source._figureBackground);
				}
				if (values[VisualStyles.FIGURE_INACTIVE_BACKGROUND]) {
					this.figureInactiveBackground(source._figureInactiveBackground);
				}
				if (values[VisualStyles.FIGURE_BORDER]) {
					this.figureBorder(source._figureBorder);
				}
				if (values[VisualStyles.FIGURE_SIZE]) {
					this.figureSize(source._figureSize);
				}
				if (values[VisualStyles.FIGURE_NAME]) {
					this.figureName(source._figureName);
				}
				if (values[VisualStyles.FIGURE_STATE]) {
					this.figureState(source._figureState);
				}
			} else if (source) {
				var v = source.padding;
				if (v !== undefined) {
					this.paddingLeft(v);
					this.paddingRight(v);
					this.paddingTop(v);
					this.paddingBottom(v);
				}
				for (var p in source) {
					var setter = this[p];
					if (setter instanceof Function) {
						setter.call(this, source[p]);
					}
				}
			}
		} finally {
			this.endUpdate(fireEvent);
		}
	},
    toProxy: function () {
        return {
            name: this._name,
            background: VisualStyles.getFillText(this.background()),
            selectedBackground: VisualStyles.getFillText(this.selectedBackground()),
            inactiveBackground: VisualStyles.getFillText(this.inactiveBackground()),
            border: VisualStyles.getStrokeText(this.border()),
            borderLeft: VisualStyles.getStrokeText(this.borderLeft()),
            borderRight: VisualStyles.getStrokeText(this.borderRight()),
            borderTop: VisualStyles.getStrokeText(this.borderTop()),
            borderBottom: VisualStyles.getStrokeText(this.borderBottom()),
            line: VisualStyles.getStrokeText(this.line()),
            renderer: this.renderer(),
            fontFamily: this.fontFamily(),
            fontSize: this.fontSize(),
            fontBold: this.fontBold(),
            fontItalic: this.fontItalic(),
            fontUnderline: this.fontUnderline(),
            fontLinethrough: this.fontLinethrough(),
            textWrap: this.textWrap(),
            foreground: VisualStyles.getFillText(this.foreground()),
            selectedForeground: VisualStyles.getFillText(this.selectedForeground()),
            inactiveForeground: VisualStyles.getFillText(this.inactiveForeground()),
            textAlignment: this.textAlignment(),
            lineAlignment: this.lineAlignment(),
            numberFormat: this.numberFormat(),
            datetimeFormat: this.datetimeFormat(),
            booleanFormat: this.booleanFormat(),
            prefix: this.prefix(),
            suffix: this.suffix(),
            paddingLeft: this.paddingLeft(),
            paddingRight: this.paddingRight(),
            paddingTop: this.paddingTop(),
            paddingBottom: this.paddingBottom(),
            iconIndex: this.iconIndex(),
            iconLocation: this.iconLocation(),
            iconAlignment: this.iconAlignment(),
            iconOffset: this.iconOffset(),
            iconPadding: this.iconPadding(),
            contentFit: this.contentFit(),
            selectionDisplay: this.selectionDisplay(),
            hoveredMaskBackground: VisualStyles.getFillText(this.hoveredMaskBackground()),
            hoveredMaskBorder: VisualStyles.getStrokeText(this.hoveredMaskBorder()),
            hoveredForeground: VisualStyles.getFillText(this.hoveredForeground()),
            figureBackground: VisualStyles.getFillText(this.figureBackground()),
            figureInactiveBackground: VisualStyles.getFillText(this.figureInactiveBackground()),
            figureBorder: VisualStyles.getStrokeText(this.figureBorder()),
            figureSize: VisualStyles.getDimensionText(this.figureSize()),
            figureName: this.figureName(),
            figureState: this.figureState()
        };
    },
	applyPaddings: function (r) {
		var v;
		r.x += (v = this.paddingLeft());
		r.width -= v + this.paddingRight();
		r.y += (v = this.paddingTop());
		r.height -= v + this.paddingBottom();
		return r;
	},
	searchStyles: function (entry) {
		if (this._values[entry]) {
			return this;
		}
		var p = this._parent;
		while (p) {
			if (p._values[entry]) {
				return p;
			}
			p = p._parent;
		}
		if (this._sysDefault && this._sysDefault._values[entry]) {
			return this._sysDefault;
		}
		var p = this._parent;
		while (p) {
			if (p._sysDefault && p._sysDefault._values[entry]) {
				return p._sysDefault;
			}
			p = p._parent;
		}
		return VisualStyles.Default;
	},
	changed: function (entry, fireEvent) {
		fireEvent = arguments.length > 1 ? fireEvent : true;
		if (this._updateLock == 0 && fireEvent) {
			if (this._owner && this._owner.stylesChanged) {
				this._owner.stylesChanged(entry);
			} else {
				this.fireEvent(VisualStyles.CHANGED, entry);
			}
		}
	},
	getFill: function (value) {
		return VisualStyles.getFill(value);
	},
	getStroke: function (value) {
		return VisualStyles.getStroke(value);
	}
}, {
	STYLE_ALL: -1,
	VISIBILITY: 0,
	BACKGROUND: 1,
	SELECTED_BACKGROUND: 2,
	INACTIVE_BACKGROUND: 3,
	FOREGROUND: 4,
	SELECTED_FOREGROUND: 5,
	INACTIVE_FOREGROUND: 6,
	BORDER: 10,
	BORDER_LEFT: 11,
	BORDER_RIGHT: 12,
	BORDER_TOP: 13,
	BORDER_BOTTOM: 14,
	LINE: 15,
	RENDERER: 16,
	TEXT_ALIGNMENT: 20,
	LINE_ALIGNMENT: 21,
	NUMBER_FORMAT: 22,
	DATETIME_FORMAT: 23,
	BOOLEAN_FORMAT: 24,
	PREFIX: 25,
	SUFFIX: 26,
	FONT: 30,
	FONT_FAMILY: 31,
	FONT_SIZE: 32,
	FONT_BOLD: 33,
	FONT_ITALIC: 34,
	FONT_UNDERLINE: 35,
	FONT_LINETHROUGH: 36,
	TEXT_WRAP: 37,
	PADDING_LEFT: 40,
	PADDING_RIGHT: 41,
	PADDING_TOP: 42,
	PADDING_BOTTOM: 43,
	ICON_INDEX: 44,
	ICON_LOCATION: 45,
	ICON_ALIGNMENT: 46,
	ICON_OFFSET: 47,
	ICON_PADDING: 48,
	CONTENT_FIT: 49,
	SELECTION_DISPLAY: 50,
	HOVERED_MASK_BACKGROUND: 51,
	HOVERED_MASK_BORDER: 52,
	HOVERED_BACKGROUND: 53,
	HOVERED_FOREGROUND: 54,
	FIGURE_BACKGROUND: 55,
	FIGURE_INACTIVE_BACKGROUND: 56,
	FIGURE_BORDER: 57,
	FIGURE_SIZE: 58,
	FIGURE_NAME: 59,
	FIGURE_STATE: 60,
	getFill: function (value) {
		if (typeof value === "string") {
			var s = value.trim().toLowerCase();
			if (s.indexOf("linear") == 0) {
				value = new LinearGradient(s);
			} else if (s.indexOf("radial") == 0) {
				value = new RadialGradient(s);
			} else if (s.indexOf("glass") == 0) {
				value = new GlassGradient(s);
			} else {
				value = new SolidBrush(s);
			}
		} 
		return value;
	},
    getFillText: function (fill) {
        return fill ? fill.toText() : null;
    },
	getStroke: function (value) {
		if (typeof value === "string") {
			var arr = value.trim().split(",");
			value = new SolidPen(arr[0], arr[1]);
		} 
		return value;
	},
    getStrokeText: function (stroke) {
        return stroke ? stroke.toText() : null;
    },
	getFont: function (value) {
		var font = [];
		var s = String(value);
		var arr, len;
		var sz = DEF_FONT_SIZE;
		if (s) {
			arr = s.toLowerCase().split($$_FONT_REG);
			len = arr.length;
			var family = null;
			var bold = false;
			var italic = false;
			if (len > 0 && arr[0]) {
				family = arr[0];
			}
			if (len > 1 && arr[1]) {
				sz = Number(arr[1]);
			}
			for (var i = 2; i < len; i++) {
				s = arr[i];
				if (s) {
					s = s.toLowerCase();
					switch (s) {
						case "bold":
							bold = true;
							break;
						case "italic":
							italic = true;
							break;
						default:
							break;
					}
				}
			}
			if (italic) {
				font.push("italic");
			}
			if (bold) {
				font.push("bold");
			}
			font.push(sz + "px");
			family && font.push(family);
		}
		s = font.join(" ");
		return { font: s, size: sz };
	},
	getDimension: function (value) {
		if (!(value instanceof Dimension)) {
			value = new Dimension(value);
		} 
		return value;
	},
    getDimensionText: function (dim) {
        return dim ? dim.toString() : null;
    }
}, function (f) {
	f.Default = new f(null, "defaultStyles");
	initStyles(f.Default);
	function initStyles(s) {
		s._background = SolidBrush.WHITE;
		s._selectedBackground = SolidBrush.DKGRAY;
		s._inactiveBackground = SolidBrush.LTGRAY;
		s._border = null;
		s._borderLeft = null;
		s._borderRight = null;
		s._borderTop = null;
		s._borderBottom = null;
		s._line = null;
		s._fontFamily = "Tahoma";
		s._fontSize = 12;
		s._fontBold = false;
		s._fontItalic = false;
		s._fontUnderline = false;
		s._fontLinethrough = false;
		s._textWrap = TextWrapMode.NONE;
		s._foreground = SolidBrush.BLACK;
		s._selectedForeground = SolidBrush.WHITE;
		s._inactiveForeground = SolidBrush.GRAY;
		s._textAlignment = Alignment.CENTER;
		s._lineAlignment = Alignment.CENTER;
		s._numberFormat = null;
		s._datetimeFormat = null;
		s._booleanFormat = null;
		s._prefix = null;
		s._suffix = null;
		s._paddingLeft = 0;
		s._paddingRight = 0;
		s._paddingTop = 0;
		s._paddingBottom = 0;
		s._iconIndex = 0;
		s._iconLocation = IconLocation.LEFT;
		s._iconAlignment = Alignment.CENTER;
		s._iconOffset = 0;
		s._iconPadding = 2;
		s._contentFit = ContentFit.AUTO;
		s._selectionDisplay = SelectionDisplay.MASK;
		s._hoveredMaskBackground = new SolidBrush(0x1F5292F7);
		s._hoveredMaskBorder = new SolidPen(0x335292F7);
		s._hoveredBackground = null;
		s._hoveredForeground = null;
		s._figureBackground = new SolidBrush(0xff008800);
		s._figureInactiveBackground = SolidBrush.LTGRAY;
		s._figureBorder = null;
		s._figureSize = null;
		s._figureName = null;
		s._figureState = null;
	}
	f.STYLE_NAMES = {
		background: f.BACKGROUND,
		selectedBackground: f.SELECTED_BACKGROUND,
		inactiveBackground: f.INACTIVE_BACKGROUND,
		border: f.BORDER,
		borderLeft: f.BORDER_LEFT,
		borderRight: f.BORDER_RIGHT,
		borderTop: f.BORDER_TOP,
		borderBottom: f.BORDER_BOTTOM,
		line: f.LINE,
		renderer: f.RENDERER,
		fontFamily: f.FONT_FAMILY,
		fontSize: f.FONT_SIZE,
		fontBold: f.FONT_BOLD,
		fontItalic: f.FONT_ITALIC,
		fontUnderline: f.FONT_UNDERLINE,
		fontLinethrough: f.FONT_LINETHROUGH,
		textWrap: f.TEXT_WRAP,
		foreground: f.FOREGROUND,
		selectedForeground: f.SELECTED_FOREGROUND,
		inactiveForeground: f.INACTIVE_FOREGROUND,
		textAlignment: f.TEXT_ALIGNMENT,
		lineAlignment: f.LINE_ALIGNMENT,
		numberFormat: f.NUMBER_FORMAT,
		datetimeFormat: f.DATETIME_FORMAT,
		booleanFormat: f.BOOLEAN_FORMAT,
		prefix: f.PREFIX,
		suffix: f.SUFFIX,
		paddingLeft: f.PADDING_LEFT,
		paddingRight: f.PADDING_RIGHT,
		paddingTop: f.PADDING_TOP,
		paddingBottom: f.PADDING_BOTTOM,
		iconIndex: f.ICON_INDEX,
		iconLocation: f.ICON_LOCATION,
		iconAlignment: f.ICON_ALIGNMENT,
		iconOffset: f.ICON_OFFSET,
		iconPadding: f.ICON_PADDING,
		contentFit: f.CONTENT_FIT,
		selectionDisplay: f.SELECTION_DISPLAY,
		hoveredMaskBackground: f.HOVERED_MASK_BACKGROUND,
		hoveredMaskBorder: f.HOVERED_MASK_BORDER,
		hoveredBackground: f.HOVERED_BACKGROUND,
		hoveredForeground: f.HOVERED_FOREGROUND,
		figureBackground: f.FIGURE_BACKGROUND,
		figureInactiveBackground: f.FIGURE_INACTIVE_BACKGROUND,
		figureBorder: f.FIGURE_BORDER,
		figureSize: f.FIGURE_SIZE,
		figureName: f.FIGURE_NAME,
		figureState: f.FIGURE_STATE
	};
});
VisualStyles.CHANGED = "onVisualStylesChanged";
var GridStyleSheet = defineClass("GridStyleSheet", null, {
	init : function() {
		this._super();
		this._grid = new VisualStyles(null, GridStyleSheet.DEFAULT, null, false);
		this._panel = new VisualStyles(null, GridStyleSheet.PANEL, null, false);
		this._body = new VisualStyles(null, GridStyleSheet.BODY, null, false);
		this._bodyEmpty = new VisualStyles(null, GridStyleSheet.BODY_EMPTY, null, false);
		this._fixed = new VisualStyles(null, GridStyleSheet.FIXED, null, false);
		this._fixedColBar = new VisualStyles(null, GridStyleSheet.FIXED_COLBAR, null, false);
		this._fixedRowBar = new VisualStyles(null, GridStyleSheet.FIXED_ROWBAR, null, false);
		this._header = new VisualStyles(null, GridStyleSheet.HEADER, null, false);
		this._headerGroup = new VisualStyles(null, GridStyleSheet.HEADER_GROUP, null, false);
        this._headerSub = new VisualStyles(null, GridStyleSheet.HEADER_SUB, null, false);
        this._headerSummary = new VisualStyles(null, GridStyleSheet.HEADER_SUMMARY, null, false);
		this._footer = new VisualStyles(null, GridStyleSheet.FOOTER, null, false);
		this._footerGroup = new VisualStyles(null, GridStyleSheet.FOOTER_GROUP, null, false);
		this._rowGroupHead = new VisualStyles(null, GridStyleSheet.ROWGROUP_HEAD, null, false);
		this._rowGroupFoot = new VisualStyles(null, GridStyleSheet.ROWGROUP_FOOT, null, false);
		this._rowGroupSummary = new VisualStyles(null, GridStyleSheet.ROWGROUP_SUMMARY, null, false);
		this._rowGroupHeader = new VisualStyles(null, GridStyleSheet.ROWGROUP_HEADER, null, false);
		this._rowGroupFooter = new VisualStyles(null, GridStyleSheet.ROWGROUP_FOOTER, null, false);
		this._rowGroupPanel = new VisualStyles(null, GridStyleSheet.ROWGROUP_PANEL, null, false);
		this._rowGroupBar = new VisualStyles(null, GridStyleSheet.ROWGROUP_BAR, null, false);
		this._rowGroupHeaderBar = new VisualStyles(null, GridStyleSheet.ROWGROUP_HEADER_BAR, null, false);
		this._rowGroupFooterBar = new VisualStyles(null, GridStyleSheet.ROWGROUP_FOOTER_BAR, null, false);
		this._indicator = new VisualStyles(null, GridStyleSheet.INDICATOR, null, false);
		this._indicatorHead = new VisualStyles(null, GridStyleSheet.INDICATOR_HEAD, null, false);
		this._indicatorFoot = new VisualStyles(null, GridStyleSheet.INDICATOR_FOOT, null, false);
        this._indicatorSum = new VisualStyles(null, GridStyleSheet.INDICATOR_SUM, null, false);
		this._checkBar = new VisualStyles(null, GridStyleSheet.CHECKBAR, null, false);
		this._checkBarHead = new VisualStyles(null, GridStyleSheet.CHECKBAR_HEAD, null, false);
		this._checkBarFoot = new VisualStyles(null, GridStyleSheet.CHECKBAR_FOOT, null, false);
        this._checkBarSum = new VisualStyles(null, GridStyleSheet.CHECKBAR_SUM, null, false);
		this._stateBar = new VisualStyles(null, GridStyleSheet.STATEBAR, null, false);
		this._stateBarHead = new VisualStyles(null, GridStyleSheet.STATEBAR_HEAD, null, false);
		this._stateBarFoot = new VisualStyles(null, GridStyleSheet.STATEBAR_FOOT, null, false);
        this._stateBarSum = new VisualStyles(null, GridStyleSheet.STATEBAR_SUM, null, false);
		this._selection = new VisualStyles(null, GridStyleSheet.SELECTION, null, false);
		this._treeExpander = new VisualStyles(null, GridStyleSheet.TREE_EXPANDER, null, false);
		this._fixedTreeExpander = new VisualStyles(null, GridStyleSheet.FIXED_TREE_EXPANDER, null, false);
	},
	destroy: function() {
		return false;
	},
	getGrid: function () { return this._grid; },
	getPanel: function () { return this._panel; },
	getBody: function () { return this._body; },
	getBodyEmpty: function () { return this._bodyEmpty; },
	getFixed: function () { return this._fixed; },
	getFixedColBar: function () { return this._fixedColBar; },
	getFixedRowBar: function () { return this._fixedRowBar; },
	getHeader: function () { return this._header; },
	getHeaderGroup: function () { return this._headerGroup; },
    getHeaderSub: function () { return this._headerSub; },
    getHeaderSummary: function () { return this._headerSummary; },
	getFooter: function () { return this._footer; },
	getFooterGroup: function () { return this._footerGroup; },
	getRowGroupHead: function () { return this._rowGroupHead; },
	getRowGroupFoot: function () { return this._rowGroupFoot; },
	getRowGroupSummary: function () { return this._rowGroupSummary; },
	getRowGroupHeader: function () { return this._rowGroupHeader; },
	getRowGroupFooter: function () { return this._rowGroupFooter; },
	getRowGroupPanel: function () { return this._rowGroupPanel; },
	getRowGroupBar: function () { return this._rowGroupBar; },
	getRowGroupHeaderBar: function () { return this._rowGroupHeaderBar; },
	getRowGroupFooterBar: function () { return this._rowGroupFooterBar; },
	getIndicator: function () { return this._indicator; },
	getIndicatorHead: function () { return this._indicatorHead; },
	getIndicatorFoot: function () { return this._indicatorFoot; },
    getIndicatorSum: function () { return this._indicatorSum; },
	getCheckBar: function () { return this._checkBar; },
	getCheckBarHead: function () { return this._checkBarHead; },
	getCheckBarFoot: function () { return this._checkBarFoot; },
    getCheckBarSum: function () { return this._checkBarSum; },
	getStateBar: function () { return this._stateBar; },
	getStateBarHead: function () { return this._stateBarHead; },
	getStateBarFoot: function () { return this._stateBarFoot; },
    getStateBarSum: function () { return this._stateBarSum; },
	getSelection: function () { return this._selection; },
	getTreeExpander: function () { return this._treeExpander; },
	getFixedTreeExpander: function () { return this._fixedTreeExpander; },
	grid: function () { return this._grid; },
	panel: function () { return this._panel; },
	body: function () { return this._body; },
	bodyEmpty: function () { return this._bodyEmpty; },
	fixed: function () { return this._fixed; },
	fixedColBar: function () { return this._fixedColBar; },
	fixedRowBar: function () { return this._fixedRowBar; },
	header: function () { return this._header; },
	headerGroup: function () { return this._headerGroup; },
    headerSub: function () { return this._headerSub; },
    headerSummary: function () { return this._headerSummary; },
	footer: function () { return this._footer; },
	footerGroup: function () { return this._footerGroup; },
	rowGroupHead: function () { return this._rowGroupHead; },
	rowGroupFoot: function () { return this._rowGroupFoot; },
	rowGroupSummary: function () { return this._rowGroupSummary; },
	rowGroupHeader: function () { return this._rowGroupHeader; },
	rowGroupFooter: function () { return this._rowGroupFooter; },
	rowGroupPanel: function () { return this._rowGroupPanel; },
	rowGroupBar: function () { return this._rowGroupBar; },
	rowGroupHeaderBar: function () { return this._rowGroupHeaderBar; },
	rowGroupFooterBar: function () { return this._rowGroupFooterBar; },
	indicator: function () { return this._indicator; },
	indicatorHead: function () { return this._indicatorHead; },
	indicatorFoot: function () { return this._indicatorFoot; },
    indicatorSum: function () { return this._indicatorSum; },
	checkBar: function () { return this._checkBar; },
	checkBarHead: function () { return this._checkBarHead; },
	checkBarFoot: function () { return this._checkBarFoot; },
    checkBarSum: function () { return this._checkBarSum; },
	stateBar: function () { return this._stateBar; },
	stateBarHead: function () { return this._stateBarHead; },
	stateBarFoot: function () { return this._stateBarFoot; },
    stateBarSum: function () { return this._stateBarSum; },
	selection: function () { return this._selection; },
	treeExpander: function () { return this._treeExpander; },
	fixedTreeExpander: function () { return this._fixedTreeExpander; }
}, {
	DEFAULT: "default",
    GRID: "grid",
	PANEL: "panel",
	BODY: "body",
	BODY_EMPTY: "body.empty",
	FIXED: "fixed",
	FIXED_COLBAR: "fixed.colBar",
	FIXED_ROWBAR: "fixed.rowBar",
	HEADER: "header",
	HEADER_GROUP: "header.group",
    HEADER_SUB: "header.sub",
    HEADER_SUMMARY: "header.summary",
	FOOTER: "footer",
	FOOTER_GROUP: "footer.group",
	ROWGROUP_HEADER: "rowGroup.header",
	ROWGROUP_FOOTER: "rowGroup.footer",
	ROWGROUP_HEAD: "rowGroup.head",
	ROWGROUP_FOOT: "rowGroup.foot",
	ROWGROUP_SUMMARY: "rowGroup.summary",
	ROWGROUP_BAR: "rowGroup.bar",
	ROWGROUP_HEADER_BAR: "rowGroup.headerBar",
	ROWGROUP_FOOTER_BAR: "rowGroup.footerBar",
	ROWGROUP_PANEL: "rowGroup.panel",
	ROWGROUP_LEVELS: "rowGroup.levels",
	INDICATOR: "indicator",
	INDICATOR_HEAD: "indicator.head",
	INDICATOR_FOOT: "indicator.foot",
    INDICATOR_SUMMARY: "indicator.summary",
	CHECKBAR: "checkBar",
	CHECKBAR_HEAD: "checkBar.head",
	CHECKBAR_FOOT: "checkBar.foot",
    CHECKBAR_SUMMARY: "checkBar.summary",
	STATEBAR: "stateBar",
	STATEBAR_HEAD: "stateBar.head",
	STATEBAR_FOOT: "stateBar.foot",
    STATEBAR_SUMMARY: "stateBar.summary",
	SELECTION: "selection",
	TREE_EXPANDER: "tree.expander",
	FIXED_TREE_EXPANDER: "fixed.tree.expander",
	clearStyles: function (grid) {
		grid.beginUpdate();
		try {
			grid.styles().clearValues();
			grid.panel().styles().clearValues();
			grid.body()().styles()().clearValues();
			grid.body().emptyStyles().clearValues();
			grid.fixedOptions().styles().clearValues();
			grid.fixedOptions().colBarStyles().clearValues();
			grid.fixedOptions().rowBarStyles().clearValues();
			grid.header().styles().clearValues();
			grid.header().groupStyles().clearValues();
            grid.header().subStyles().clearValues();
            grid.header().summary().styles().clearValues();
			grid.footer().styles().clearValues();
			grid.footer().groupStyles().clearValues();
			grid.rowGroup().headStyles().clearValues();
			grid.rowGroup().footStyles().clearValues();
			grid.rowGroup().summaryStyles().clearValues();
			grid.rowGroup().headerStyles().clearValues();
			grid.rowGroup().footerStyles().clearValues();
			grid.rowGroup().panelStyles().clearValues();
			grid.rowGroup().barStyles().clearValues();
			grid.rowGroup().headerBarStyles().clearValues();
			grid.rowGroup().footerBarStyles().clearValues();
			grid.indicator().styles().clearValues();
			grid.indicator().headStyles().clearValues();
			grid.indicator().footStyles().clearValues();
            grid.indicator().summaryStyles().clearValues();
			grid.checkBar().styles().clearValues();
			grid.checkBar().headStyles().clearValues();
			grid.checkBar().footStyles().clearValues();
            grid.checkBar().summaryStyles().clearValues();
			grid.stateBar().styles().clearValues();
			grid.stateBar().headStyles().clearValues();
			grid.stateBar().footStyles().clearValues();
            grid.stateBar().summaryStyles().clearValues();
			grid.selectOptions().maskStyles().clearValues();
			if (grid instanceof TreeView) {
				grid.treeOptions().expanderStyles().clearValues();
			}
		} finally {
			grid.endUpdate();
		}
	}
});
GridStyleSheet.Default = (function () {
	var t = getTimer();
	var sheet = new GridStyleSheet();
	var s = sheet._grid;
	s.background(SolidBrush.WHITE);
	s.foreground(SolidBrush.BLACK);
	s.border(new SolidPen(0xffaaaaaa));
	s.borderLeft(null);
	s.borderTop(null);
	s.borderRight(null);
	s.borderBottom(null);
	s.inactiveBackground(SolidBrush.LTGRAY);
	s.fontFamily("Tahoma");
	s.fontSize(12);
	s.paddingTop(2);
	s.paddingBottom(2);
	s.paddingLeft(2);
	s.paddingRight(2);
	s.textAlignment(Alignment.NEAR);
	s.lineAlignment(Alignment.CENTER);
	s.iconLocation(IconLocation.LEFT);
	s.iconAlignment(Alignment.CENTER);
	s.iconPadding(2);
	s.contentFit(ContentFit.AUTO);
	s.figureBackground(SolidBrush.BLACK);
	s = sheet._panel;
	s.background(new SolidBrush(0xffcccccc));
	s.foreground(SolidBrush.BLACK);
	s.borderRight(new SolidPen(0xff777777));
	s.borderBottom(new SolidPen(0xff777777));
	s.paddingLeft(8);
	s.paddingTop(4);
	s.paddingBottom(5);
	s.paddingRight(2);
	s.textAlignment(Alignment.NEAR);
	s.lineAlignment(Alignment.CENTER);
	s = sheet._body;
	s.background(SolidBrush.WHITE);
	s.foreground(SolidBrush.BLACK);
	s.borderLeft(null);
	s.borderTop(null);
	s.borderRight(new SolidPen(0xffcccccc));
	s.borderBottom(s.borderRight());
	s.line(SolidPen.DKGRAY); 
	s.paddingTop(2);
	s.paddingBottom(2);
	s.paddingLeft(2);
	s.paddingRight(2);
	s.textAlignment(Alignment.NEAR);
	s.lineAlignment(Alignment.CENTER);
	s.iconLocation(IconLocation.LEFT);
	s.iconAlignment(Alignment.CENTER);
	s.iconPadding(2);
	s.contentFit(ContentFit.AUTO);
	s.figureInactiveBackground(SolidBrush.LTGRAY);
	s = sheet._bodyEmpty;
	s.background(new SolidBrush(0xfff8f8f8));
	s.foreground(SolidBrush.BLACK);
	s.borderLeft(null);
	s.borderTop(null);
	s.borderRight(new SolidPen(0xff999999));
	s.borderBottom(s.borderRight());
	s.paddingTop(2);
	s.paddingBottom(2);
	s.paddingLeft(2);
	s.paddingRight(2);
	s.fontSize(14);
	s.textAlignment(Alignment.NEAR);
	s.lineAlignment(Alignment.NEAR);
	s = sheet._fixed;
	s.background(SolidBrush.LTGRAY);
	s.foreground(SolidBrush.BLACK);
	s.borderLeft(null);
	s.borderTop(null);
	s.borderRight(new SolidPen(0xff999999));
	s.borderBottom(s.borderRight());
	s.paddingTop(2);
	s.paddingBottom(2);
	s.paddingLeft(2);
	s.paddingRight(2);
	s.textAlignment(Alignment.NEAR);
	s.lineAlignment(Alignment.CENTER);
	s.figureInactiveBackground(SolidBrush.LTGRAY);
	s = sheet._fixedColBar;
	s.background(SolidBrush.LTGRAY);
	s.borderRight(new SolidPen(0xff999999));
	s.borderBottom(s.borderRight());
	s = sheet._fixedRowBar;
	s.background(SolidBrush.LTGRAY);
	s.borderRight(new SolidPen(0xff999999));
	s.borderBottom(s.borderRight());
	s = sheet._header;
	s.background(new LinearGradient("linear #ffffff #cccccc 90"));
	s.foreground(SolidBrush.BLACK);
	s.borderLeft(null);
	s.borderTop(null);
	s.borderRight(SolidPen.GRAY);
	s.borderBottom(SolidPen.GRAY);
	s.paddingTop(2);
	s.paddingBottom(2);
	s.paddingLeft(2);
	s.paddingRight(2);
	s.textAlignment(Alignment.CENTER);
	s.lineAlignment(Alignment.CENTER);
	s.textWrap(TextWrapMode.NORMAL);
	s.hoveredBackground(SolidBrush.LTGRAY);
	s = sheet._headerGroup;
	s.background(new LinearGradient("linear #ffffff #aaaaaa 90"));
	s.foreground(SolidBrush.BLACK);
	s.borderLeft(null);
	s.borderTop(null);
	s.borderRight(SolidPen.GRAY);
	s.borderBottom(SolidPen.GRAY);
	s.paddingTop(2);
	s.paddingBottom(2);
	s.paddingLeft(2);
	s.paddingRight(2);
	s.textAlignment(Alignment.CENTER);
	s.lineAlignment(Alignment.CENTER);
	s.textWrap(TextWrapMode.NORMAL);
    s = sheet._headerSub;
    s.foreground(SolidBrush.BLACK);
    s.textAlignment(Alignment.CENTER);
    s.lineAlignment(Alignment.CENTER);
    s.textWrap(TextWrapMode.NORMAL);
    s = sheet._headerSummary;
    s.background(new SolidBrush(0xffeeeeee));
    s.foreground(SolidBrush.BLACK);
    s.borderLeft(null);
    s.borderTop(null);
    s.borderRight(SolidPen.GRAY);
    s.borderBottom(SolidPen.GRAY);
    s.paddingLeft(2);
    s.paddingRight(2);
    s.paddingTop(1);
    s.paddingBottom(2);
    s.textAlignment(Alignment.FAR);
    s.lineAlignment(Alignment.CENTER);
	s = sheet._footer;
	s.background(new SolidBrush(0xffeeeeee));
	s.foreground(SolidBrush.BLACK);
	s.borderLeft(null);
	s.borderBottom(null);
	s.borderRight(SolidPen.GRAY);
	s.borderTop(SolidPen.GRAY);
	s.paddingLeft(2);
	s.paddingRight(2);
	s.paddingTop(2);
	s.paddingBottom(1);
	s.textAlignment(Alignment.FAR);
	s.lineAlignment(Alignment.CENTER);
	s = sheet._footerGroup;
	s.background(new SolidBrush(0xffeeeeee));
	s.foreground(SolidBrush.BLACK);
	s.borderLeft(null);
	s.borderBottom(null);
	s.borderRight(SolidPen.GRAY);
	s.borderTop(SolidPen.GRAY);
	s.paddingTop(2);
	s.paddingBottom(1);
	s.paddingLeft(2);
	s.paddingRight(2);
	s.textAlignment(Alignment.FAR);
	s.lineAlignment(Alignment.CENTER);
	s = sheet._rowGroupHeader;
	s.background(SolidBrush.GRAY);
	s.foreground(SolidBrush.WHITE);
	s.borderLeft(null);
	s.borderTop(null);
	s.borderRight(SolidPen.DKGRAY);
	s.borderBottom(SolidPen.DKGRAY);
	s.paddingTop(2);
	s.paddingBottom(2);
	s.paddingLeft(2);
	s.paddingRight(2);
	s.textAlignment(Alignment.NEAR);
	s.lineAlignment(Alignment.CENTER);
	s.figureBackground(SolidBrush.WHITE);
	s = sheet._rowGroupFooter;
	s.background(new SolidBrush(0xffdddddd));
	s.foreground(SolidBrush.BLACK);
	s.borderLeft(null);
	s.borderTop(null);
	s.borderRight(SolidPen.GRAY);
	s.borderBottom(SolidPen.GRAY);
	s.paddingLeft(2);
	s.paddingRight(2);
	s.paddingTop(2);
	s.paddingBottom(2);
	s.textAlignment(Alignment.FAR);
	s.lineAlignment(Alignment.CENTER);
	s.figureBackground(SolidBrush.GRAY);
	s = sheet._rowGroupPanel;
	s.background(new LinearGradient("linear #ffffff #cccccc 90"));
	s.foreground(SolidBrush.BLACK);
	s.border(SolidPen.DKGRAY);
	s.line(new SolidPen(0xff333333, 1));
	s.paddingLeft(1);
	s.paddingRight(1);
	s.paddingTop(1);
	s.paddingBottom(1);
	s.textAlignment(Alignment.CENTER);
	s.lineAlignment(Alignment.CENTER);
	s = sheet._rowGroupBar;
	s.borderLeft(null);
	s.borderRight(SolidPen.DKGRAY);
	s.borderTop(null);
	s.borderBottom(null);
	s = sheet._rowGroupHeaderBar;
	s.borderLeft(null);
	s.borderRight(null);
	s.borderTop(null);
	s.borderBottom(null);
	s = sheet._rowGroupFooterBar;
	s.borderLeft(null);
	s.borderRight(null);
	s.borderTop(null);
	s.borderBottom(SolidPen.GRAY);
	s = sheet._indicator;
	s.background(new LinearGradient("linear #e5e5e5 #ffffff 180"));
	s.foreground(SolidBrush.BLACK);
	s.borderLeft(null);
	s.borderTop(null);
	s.borderRight(SolidPen.GRAY);
	s.borderBottom(SolidPen.GRAY);
	s.paddingLeft(2);
	s.paddingRight(2);
	s.paddingTop(2);
	s.paddingBottom(2);
	s.textAlignment(Alignment.CENTER);
	s.lineAlignment(Alignment.CENTER);
	s.hoveredBackground(SolidBrush.LTGRAY);
	s.selectedBackground(SolidBrush.LTGRAY);
	s.selectedForeground(SolidBrush.RED);
	s.figureBackground(SolidBrush.BLACK);
	s = sheet._checkBar;
	s.background(SolidBrush.WHITE);
	s.borderLeft(null);
	s.borderTop(null);
	s.borderRight(SolidPen.GRAY);
	s.borderBottom(SolidPen.GRAY);
	s.paddingLeft(2);
	s.paddingRight(2);
	s.paddingTop(2);
	s.paddingBottom(2);
	s.textAlignment(Alignment.CENTER);
	s.lineAlignment(Alignment.CENTER);
	s.figureBackground(new SolidBrush(0xff555555));
	s.figureSize(new Dimension(12));
	s =sheet._checkBarHead;
	s.figureBackground(new SolidBrush(0xff555555));
	s.figureInactiveBackground(SolidBrush.LTGRAY);
	s.figureSize(new Dimension(12));
	s = sheet._stateBar;
	s.background(SolidBrush.WHITE);
	s.foreground(SolidBrush.BLACK);
	s.borderLeft(null);
	s.borderTop(null);
	s.borderRight(SolidPen.GRAY);
	s.borderBottom(SolidPen.GRAY);
	s.paddingLeft(2);
	s.paddingRight(2);
	s.paddingTop(2);
	s.paddingBottom(2);
	s.textAlignment(Alignment.CENTER);
	s.lineAlignment(Alignment.CENTER);
	s = sheet._selection;
	s.background(new SolidBrush(0x2F1E90FF));
	s.border(new SolidPen(0x5F1E90FF, 2));
	s = sheet._treeExpander;
	s.foreground(SolidBrush.BLACK);
	s.borderLeft(null);
	s.borderTop(null);
	s.borderRight(null);
	s.borderBottom(new SolidPen(0xffcccccc));
	s.paddingTop(0);
	s.paddingBottom(0);
	s.paddingLeft(0);
	s.paddingRight(2);
	s.figureBackground(SolidBrush.GRAY);
	s.figureSize(new Dimension(9));
	s.line(SolidPen.GRAY);
	t = getTimer() - t;
	// trace("init default style sheet: " + t + " msecs.");
	return sheet;
})();
var GRID_STYLES = "grid";
var PANEL_STYLES = "panel";
var BODY_STYLES = "body";
var FIXED_STYLES = "fixed";
var SORTING_STYLES = "sorting"
var HEADER_STYLES = "header";
var FOOTER_STYLES = "footer";
var ROW_GROUP_STYLES = "rowGroup";
var INDICATOR_STYLES = "indicator";
var ROW_HEADER_STYLES = "rowHeader";
var CHECKBAR_STYLES = "checkBar";
var STATUSBAR_STYLES = "statusBar";
var STATEBAR_STYLES = "stateBar";
var SELECTION_STYLES = "selection";
var MOBILE_SELECTION_STYLES = "mobileSelection";
var TREE_STYLES = "tree";
var COLUMNS_STYLES = "columns";
var /* abstract */ StylesArchiver = defineClass("StylesArchiver", null, {
	init: function() {
		this._super();
	},
	loadGridStyles: function(source, grid) {
		this._loadGrid(source, grid);
	},
	loadGrid: function (source, grid) {
	},
	saveGrid: function (grid) {
	},
	loadStyles: function (source, styles) {
	},
	saveStyles: function (styles) {
	}
}, {
	applyStyles: function (source, styles, fireEvents) {
		fireEvents = arguments.length > 2 ? fireEvents : true;
		if (source && styles) {
			styles.extend(source, fireEvents);
		}
	},
	deserialize: function (source, grid) {
		function setStyles(styleName, styles) {
			if (styles && source && source.hasOwnProperty(styleName)) {
				var obj = source[styleName];
				if (obj) {
					styles.extend(obj);
					return true;
				}
			}
			return false;
		}
		function setChildStyles(parentStyle, styleName, styles) {
			var obj = source[parentStyle][styleName];
			if (obj) {
				styles.extend(obj);
				return true;
			}
			return false;
		}
		var owner;
		var styles;
		var s;
		var scase;
		var style;
		var obj;
		var i;
		setStyles(GRID_STYLES, grid.styles());
		setStyles(PANEL_STYLES, grid.panel().styles());
		var body = grid.body();
		if (setStyles(BODY_STYLES, body.styles())) {
			setChildStyles(BODY_STYLES, "empty", body.emptyStyles());
			obj = source[BODY_STYLES].dynamicStyles;
			if (obj) {
				owner = grid.body().dynamicStyles().owner();
				styles = [];
				for (i = 0; i < obj.length; i++) {
					s = obj[i];
					if (_isArray(s.criteria)) {
						scase = new DynamicStyleCase(owner);
						scase.setCriteria(s.criteria);
						if (_isArray(s.styles)) {
							scase.setStyles(s.styles);
						} else {
							scase.setStyles([s.styles]);
						}
						styles.push(scase);
					} else {
						style = new DynamicStyleImpl(owner);
						style.setCriteria(s.criteria);
						style.setStyles(s.styles);
						styles.push(style);
					}
				}
				body.setDynamicStyles(styles);
			}
			obj = source[BODY_STYLES].cellDynamicStyles;
			if (obj) {
				owner = body.cellDynamicStyles().owner();
				styles = [];
				for (i = 0; i < obj.length; i++) {
					s = obj[i];
					if (_isArray(s.criteria)) {
						scase = new DynamicStyleCase(owner);
						scase.setCriteria(s.criteria);
						if (_isArray(s.styles)) {
							scase.setStyles(s.styles);
						} else {
							scase.setStyles([s.styles]);
						}
						styles.push(scase);
					} else {
						style = new DynamicStyleImpl(owner);
						style.setCriteria(s.criteria);
						style.setStyles(s.styles);
						styles.push(style);
					}
				}
				body.setCellDynamicStyles(styles);
			}
		}
		var fixedOptions = grid.fixedOptions();
		if (setStyles(FIXED_STYLES, fixedOptions.styles())) {
			setChildStyles(FIXED_STYLES, "colBar", fixedOptions.colBarStyles());
			setChildStyles(FIXED_STYLES, "rowBar", fixedOptions.rowBarStyles());
		}
		var sortingOptions = grid.sortingOptions();
		if (setStyles(SORTING_STYLES, sortingOptions.sortOrderStyles())) {
		}
		var header = grid.header();
		if (setStyles(HEADER_STYLES, header.styles())) {
			setChildStyles(HEADER_STYLES, "group", header.groupStyles());
            setChildStyles(HEADER_STYLES, "sub", header.subStyles());
            setChildStyles(HEADER_STYLES, "summary", header.summary().styles());
		}
		var footer = grid.footer();
		if (setStyles(FOOTER_STYLES, footer.styles())) {
			setChildStyles(FOOTER_STYLES, "group", footer.groupStyles());
		}
		if (source && source.hasOwnProperty(ROW_GROUP_STYLES)) {
			var rowGroup = grid.rowGroup();
			setChildStyles(ROW_GROUP_STYLES, "header", rowGroup.headerStyles());
			setChildStyles(ROW_GROUP_STYLES, "footer", rowGroup.footerStyles());
			setChildStyles(ROW_GROUP_STYLES, "head", rowGroup.headStyles());
			setChildStyles(ROW_GROUP_STYLES, "foot", rowGroup.footStyles());
			setChildStyles(ROW_GROUP_STYLES, "summary", rowGroup.summaryStyles());
			setChildStyles(ROW_GROUP_STYLES, "headerBar", rowGroup.headerBarStyles());
			setChildStyles(ROW_GROUP_STYLES, "footerBar", rowGroup.footerBarStyles());
			setChildStyles(ROW_GROUP_STYLES, "bar", rowGroup.barStyles());
			setChildStyles(ROW_GROUP_STYLES, "panel", rowGroup.panelStyles());
			var levels = source[ROW_GROUP_STYLES].rowGroupLevels;
			if (levels) {
				for (i = 0; i < Math.min(levels.length, rowGroup.levelCount); i++) {
					obj = levels[i];
					var glevel = rowGroup.getLevel(i);
					if (obj.header) {
						glevel.headerStyles().extend(obj.header);
					}
					if (obj.footer) {
						glevel.footerStyles().extend(obj.footer);
					}
					if (obj.headerBar) {
						glevel.headerBarStyles().extend(obj.headerBar);
					}
					if (obj.footerBar) {
						glevel.footerBarStyles().extend(obj.footerBar);
					}
					if (obj.bar) {
						glevel.barStyles().extend(obj.bar);
					}
				}
			}
		}
		var indicator = grid.indicator();
        if (setStyles(ROW_HEADER_STYLES, indicator.styles())) {
            setChildStyles(ROW_HEADER_STYLES, "head", indicator.headStyles());
            setChildStyles(ROW_HEADER_STYLES, "foot", indicator.footStyles());
            setChildStyles(ROW_HEADER_STYLES, "summary", indicator.summaryStyles());
        } else if (setStyles(INDICATOR_STYLES, indicator.styles())) {
			setChildStyles(INDICATOR_STYLES, "head", indicator.headStyles());
			setChildStyles(INDICATOR_STYLES, "foot", indicator.footStyles());
            setChildStyles(INDICATOR_STYLES, "summary", indicator.summaryStyles());
		}
		var checkBar = grid.checkBar();
		if (setStyles(CHECKBAR_STYLES, checkBar.styles())) {
			setChildStyles(CHECKBAR_STYLES, "head", checkBar.headStyles());
			setChildStyles(CHECKBAR_STYLES, "foot", checkBar.footStyles());
            setChildStyles(CHECKBAR_STYLES, "summary", checkBar.summaryStyles());
		}
		var stateBar = grid.stateBar();
		if (setStyles(STATUSBAR_STYLES, stateBar.styles())) {
			setChildStyles(STATUSBAR_STYLES, "head", stateBar.headStyles());
			setChildStyles(STATUSBAR_STYLES, "foot", stateBar.footStyles());
            setChildStyles(STATUSBAR_STYLES, "summary", stateBar.summaryStyles());
		}
		if (setStyles(STATEBAR_STYLES, stateBar.styles())) {
			setChildStyles(STATEBAR_STYLES, "head", stateBar.headStyles());
			setChildStyles(STATEBAR_STYLES, "foot", stateBar.footStyles());
            setChildStyles(STATEBAR_STYLES, "summary", stateBar.summaryStyles());
		}
		if (_isMobile()) {
			setStyles(MOBILE_SELECTION_STYLES, grid.selectOptions().mobileStyles());
		} else {
			setStyles(SELECTION_STYLES, grid.selectOptions().maskStyles());
		}
        if (TreeView) {
            var tree = _cast(grid, TreeView);
            if (tree) {
                if (source && source.hasOwnProperty(TREE_STYLES)) {
                    setChildStyles(TREE_STYLES, "expander", tree.treeOptions().expanderStyles());
                }
            }
        }
	}
});
var DynamicStyleOwner = defineClass("DynamicStyleOwner", null, {
	init: function (config) {
		this._super();
		if (config) {
			if (config.hasOwnProperty("capitalIndexers")) {
				var indexers = config.capitalIndexers;
				if (indexers) {
					this._capitalIndexers = indexers.concat();
				}
			}
		}
	},
	capitalIndexers: function () {
		return this._capitalIndexers;
	},
	parseValue: function (prop, value) {
	}
});
var /* abstract */ DynamicStyle = defineClass("DynamicStyle", null, {
	init: function (owner) {
		this._super();
		_assert(owner != null, "owner is null");
		this._owner = owner; // capitalIndexers() 구현체.
		this._body = true;
		this._fixed = true;
	},
	owner: function () {
		return this._owner;
	},
	apply: function (runtime, target/* VisualStyles */) {
	},
	_setOwner: function (owner) {
		this._owner = owner;
	},
	_changed: function () {
	}
}); 
var DynamicStyleImpl = defineClass("DynamicStyleImpl", DynamicStyle, {
	init: function(owner, source) {
		this._super(owner);
		this._exprNode = null;
		this._styleMap = {};
		if (source) {
			if (source.hasOwnProperty("criteria")) {
				this.setCriteria(source.criteria);
			}
			if (source.hasOwnProperty("styles")) {
				this.setStyles(source.styles);
			}
		}
	},
	criteria: null,
	styles: null,
	setCriteria: function (value) {
		var s = value ? value.toString() : null;
		if (s != this._criteria) {
			this._criteria = s;
			this.$_buildExpression();
			this._changed();
		}
	},
	setStyles: function (value) {
		if (value != this._styles) {
			this._styles = value;
			this.$_buildStyles();
			this._changed();
		}
	},
	check: function(runtime) {
		return this._exprNode && this._exprNode.evaluate(runtime)
	},
	apply: function (runtime, target) {
		if (this._exprNode && this._exprNode.evaluate(runtime)) {
			var setter;
			for (var style in this._styleMap) {
				setter = target[style];
				if (setter) { 
					setter.call(target, this._styleMap[style]);
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
		this._styleMap = {};
		if (typeof this._styles === "string") {
			var items = this._styles.split(";");
			for (var i = 0, cnt = items.length; i < cnt; i++) {
				var item = items[i];
				var arr = item.split("=");
				if (arr.length > 1) {
					this._styleMap[arr[0]] = arr[1];
				} else {
					this._styleMap[arr[0]] = UNDEFINED;
				}
			}
		} else if (this._styles) {
			for (var p in this._styles) {
				this._styleMap[p] = this._styles[p];
			}
		}
	}
});
var DynamicStyleCase = defineClass("DynamicStyleCase", DynamicStyle, {
	init : function(owner, config) {
		this._super(owner);
		this._exprNodes = [];
		this._stylesMap = [];
		if (config) {
			if (config.hasOwnProperty("criteria")) {
				this.setCriteria(config.criteria);
			}
			if (config.hasOwnProperty("styles")) {
				this.setStyles(config.styles);
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
		if (value != this._styles) {
			this._styles = value;
			this.$_buildStyles();
			this._changed();
		}
	},
	check: function(runtime) {
		for (var i = 0, len = this._exprNodes.length; i < len; i++) {
			var expr = this._exprNodes[i];
			if (expr && expr.evaluate(runtime)) {
				return true;
			}
		}		
		return false;
	},
	apply: function(runtime, target/* VisualStyles */) {
		for (var i = 0, len = this._exprNodes.length; i < len; i++) {
			var expr = this._exprNodes[i];
			if (expr && expr.evaluate(runtime)) {
				var styleMap = this._stylesMap[i];
				for (var style in styleMap) {
					var v = styleMap[style];
					if (v !== UNDEFINED) {
						target[style](v);
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
		if (_isArray(this._criteria) && (cnt = this._criteria.length) > 0) {
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
		this._stylesMap = [];
		if (_isArray(this._styles)) {
			for (var i = 0, cnt = this._exprNodes.length; i < cnt; i++) {
				var styles = this._styles.length > i ? this._styles[i] : this._styles[cnt - 1];
				var items = styles.split(";");
				var map = {};
				this._stylesMap.push(map);
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
	}
}); 
var DynamicStyleCollection = defineClass("DynamicStyleCollection", null, {
	init: function (owner) {
		this._super();
		this._owner = owner; // DynamicStyleOwner
		this._items = []; // of DynamicStyle
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
		var style = this.$_createStyle(item);
		if (style && this._items.indexOf(style) < 0) {
			this._items.push(style);
		}
	},
	setItems: function (items) {
		this._items = [];
		if (items) {
			if (items instanceof DynamicStyleCollection) {
				items = items.toArray();
			}
			if (!_isArray(items)) {
				return;
			}
			var i;
			var style;
			var cnt = items.length;
			for (i = 0; i < cnt; i++) {
				style = this.$_createStyle(items[i]);
				style && this._items.push(style);
			}
		}
	},
	prepare: function () {
	},
	checkStyle: function (runtime) {
        for (var i = 0, cnt = this._items.length; i < cnt; i++) {
            var style = this._items[i];
            if (style.check(runtime)) {
            	return true;
            }
        }		
        return false;
	},
	applyCheck: function (runtime, styles, targets) {
		if (runtime && styles && targets) {
			this.applyInternalNormal(runtime, styles, targets);
		}
	},
	applyInternalNormal: function (runtime, styles, targets) {
        for (var i = 0, cnt = this._items.length; i < cnt; i++) {
            var style = this._items[i];
            style.apply(runtime, styles);
        }
	},
    applyInternalUserMode: function (runtime, styles, targets) {
        try {
            for (var i = 0, cnt = this._items.length; i < cnt; i++) {
                var style = this._items[i];
                style.apply(runtime, styles);
            }
        } catch (err) {
        }
    },
	toArray: function () {
		return this._items.concat(); 
	},
	$_createStyle: function (source) {
		var s = null;
		if (source instanceof DynamicStyle) {
			source._owner = this._owner;
			s = source;
		} else if (_isArray(source.criteria)) {
			var cstyle;
			if (_isArray(source.styles)) {
				cstyle = new DynamicStyleCase(this._owner);
				cstyle.setCriteria(source.criteria);
				cstyle.setStyles(source.styles);
				s = cstyle;
			} else {
				cstyle = new DynamicStyleCase(this._owner);
				cstyle.setCriteria(source.criteria);
				cstyle.setStyles([source.styles]);
				s = cstyle;
			}
		} else if (source && source.criteria) {
			var style = new DynamicStyleImpl(this._owner);
			style.setCriteria(source.criteria);
			style.setStyles(source.styles);
			s = style;
		}
		return s;
	}
}); 