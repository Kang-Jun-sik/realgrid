var $$_dc_empty_styles = new VisualStyles();
var $$_dc_edit_props = ["readOnly", "editable", "button", "popupMenu"];
var DataCellStyle = defineClass("DataCellStyle", null, {
	init: function (id, source) {
		this._super();
		this._id = id;
		this._styles = $$_dc_empty_styles;
		this._props = null;
		this.assign(source);
	},
	id: function () {
		return this._id;
	},
	isEditable: function () {
		return this._props ? this._props.editable : undefined;
	},
	isReadOnly: function () {
		return this._props ? this._props.readOnly : undefined;
	},
    isWritable: function () {
        if (this._props) {
            var v = this._props.editable;
            if (v !== undefined && !v) {
                return false;
            }
            v = this._props.readOnly;
            if (v) {
                return false;
            }
        }
        return true;
    },
    button: function () {
        return this._props && this._props.button;
    },
    popupMenu: function () {
        return this._props && this._props.popupMenu;
    },
	setStyles: function (value) {
		if (value != this._styles) {
			if (value) {
				if (this._styles === $$_dc_empty_styles) {
					this._styles = new VisualStyles(null, null, false);
				}
				this._styles.clearValues();
				this._styles.extend(value, false, false);
			} else {
				this._styles = $$_dc_empty_styles;
			}
		}
	},
	assignTo: function (styles) {
		styles && styles.extend(this._styles, false, false);
	},
    calcWritable: function (editable, readOnly) {
        var props = this._props;
        if (props) {
            if (props.editable !== undefined) {
                editable = props.editable;
                if (!editable) return false;
            }
            if (props.readOnly !== undefined) {
                readOnly = props.readOnly;
                if (readOnly) return false;
            }
        }
        return editable && !readOnly;
    },
    assign: function (source) {
        if (source) {
            this.setStyles(source instanceof DataCellStyle ? source._styles : source);
            this.$_assignProps(source, $$_dc_edit_props);
        }
    },
	$_assignProps: function (source, props) {
		for (var i = 0, cnt = props.length; i < cnt; i++) {
			var p = props[i];
			if (source[p] !== undefined) {
				this._props = this._props || {};
				this._props[p] = source[p];
			}
		}
	}
});
var DataCellStyleCollection = defineClass("DataCellStyleCollection", EventAware, {
	/**
	 * owner = {
	 * 		function dataCellStyleAdded(id, needUpdate);
	 * 		function dataCellStyleChanged(id, needUpdate);
	 * 		function dataCellStyleRemoved(id, style, needUpdate);
	 * 		function dataCellStylesCleared(needUpdate);
	 * }
	 */
	init: function (owner) {
		this._super();
		this._owner = owner;
		this._styles = {};
		this._dirtyLock = 0;
	},
	getStyle: function (id) {
		return this._styles[id];
	},
	get: function (id) {
		return this._styles[id];
	},
	clear: function () {
		this._styles = {};
		if (this._dirtyLock <= 0 && this._owner) {
			this._owner.dataCellStylesCleared();
		}
	},
	add: function (id, style) {
		if (id && style && !this._styles[id]) {
			this._styles[id] = new DataCellStyle(id, style);
			this._owner && this._owner.dataCellStyleAdded(id, this._dirtyLock <= 0);
		}
	},
	set: function (id, style) {
		if (id) {
			var oldStyle = this._styles[id];
			if (style) {
				if (oldStyle) {
					oldStyle.assign(style);
					this._owner && this._owner.dataCellStyleChanged(id, this._dirtyLock <= 0);
				} else {
					this._styles[id] = new DataCellStyle(id, style);
					this._owner && this._owner.dataCellStyleAdded(id, this._dirtyLock <= 0);
				}
			} else if (oldStyle) {
				delete this._styles[id];
				this._owner && this._owner.dataCellStyleRemoved(id, oldStyle, this._dirtyLock <= 0);
			}
		}
	},
	beginUpdate: function () {
		this._dirtyLock++;
	},
	endUpdate: function (updateOwner) {
		if (this._dirtyLock > 0) {
			this._dirtyLock = Math.max(this._dirtyLock - 1, 0);
			if (this._dirtyLock == 0 && updateOwner && this._owner) {
				this._owner.dataCellStyleChanged(null, true);
			}
		}
	},
	load: function (source) {
	}
});