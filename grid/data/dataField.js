var DataField = defineClass("DataField", EventAware, {
	init: function (fieldName, dataType, length) {
		this._super();
		this._owner = null;
		this._index = -1;
		this._orgFieldName = null;
		this._orgAttrName = null;
		this._orgBaseField = null;
		this._boolParser = null;
		this._dateParser = null;
		this._ownerBoolParser = null;
		this._ownerDateParser = null;
		if (fieldName) {
			this.setFieldName(fieldName);
		}
		if (dataType !== undefined) {
			this._dataType = dataType == "numeric" ? ValueType.NUMBER : dataType == "date" ? ValueType.DATETIME : dataType;
		}
		if (length != undefined) {
            var len = parseInt(length);
			this._length = isNaN(len) ? 0 : len;
		}
		this._runType = undefined;
		this._ranged = false;
		this._runSet = null;
		this._runMax = undefined;
		this._runMin = undefined;
		this._typeLock = false;
        this.equalValues = null;
        this.sameValues = null;
		this.readValue = null;
		this.nullValue = undefined;
		this._calculated = false;
	},
	fieldName: null,
	dataType: ValueType.TEXT,
	subTypeEnabled: true,
	subType: null,
	subtypeEnabled: true,
	subtype: null,
	length: 0,
	set: null,
	header: null,
	minimum: undefined,
	maximum: undefined,
	required: false,
    updatable: true,
	defaultValue: undefined,
	baseField: null,
	booleanFormat: null,
	dateFormat: null,
	datetimeFormat: null,
	amText: null,
	pmText: null,
	baseYear: NaN,
	calculateExpression: null,
	calculateCallback: null,
	comparer:null,
	hash: function () {
		return this._fieldName;
	},
	index: function () {
		return this._index;
	},
	$_setIndex: function (value) {
		this._index = value;
	},
	setFieldName: function (value) {
		value = value && value.trim();
		if (!value) {
			throw new Error("Field name must be exists.");
		}
		if (value != this._orgFieldName) {
			this._orgFieldName = value;
			this._orgAttrName = "@" + value;
			this._fieldName = value.toUpperCase();
			this._changed();
		}
	},
	orgFieldName: function () {
		return this._orgFieldName;
	},
	orgAttrName: function () {
		return this._orgAttrName;
	},
	setDataType: function (value) {
		if (value == "numeric") {
			value = ValueType.NUMBER;
		} else if (value == "date") {
			value = ValueType.DATETIME;
		}
		if (value != this._dataType) {
			this._dataType = value;
			this._resetTypes();
			this._changed();
		}
	},
	runType: function () {
		return this._runType;
	},
	setSubType: function (value) {
		value = value || null;
		if (value != this._subType) {
			this._subType = value;
			this._resetTypes();
			this._changed();
		}
	},
	setSubTypeEnabled: function (value) {
		if (value != this._subTypeEnabled) {
			this._subTypeEnabled = value;
			this._resetTypes();
			this._changed();
		}
	},
	getSubtype_: function () {
		return this._subType;
	},
	setSubtype: function (value) {
		this.setSubType(value);
	},
	isSubtypeEnabled: function () {
		return this._subtypeEnabled;
	},
	setSubtypeEnabled: function (value) {
		this.setSubTypeEnabled(value);
	},
	setLength: function (value) {
		if (value != this._length) {
			this._length = value;
			this._resetTypes();
			this._changed();
		}
	},
	setSet: function (value) {
		if (value !== this._set && _isArray(value)) {
			this._set = value;
			this._resetTypes();
			this._changed();
		}
	},
	setMinimum: function (value) {
		if (value != this._minimum) {
			this._minimum = value;
			this._resetTypes();
			this._changed();
		}
	},
	setMaximum: function (value) {
		if (value != this._maximum) {
			this._maximum = value;
			this._resetTypes();
			this._changed();
		}
	},
	setRequired: function (value) {
		if (value != this._required) {
			this._required = value;
			this._changed();
		}
	},
	setHeader: function (value) {
		if (value != this._header) {
			this._header = value;
			this._changed();
		}
	},
	setDefaultValue: function (value) {
		if (value != this._defaultValue) {
			this._defaultValue = value;
		}
	},
	setBaseField: function (value) {
		if (value != this._orgBaseField) {
			this._orgBaseField = value;
			this._baseField = value && value.toUpperCase();
			this._changed();
		}
	},
	booleanFormat_: function () {
		return this._boolFormat;
	},
	setBooleanFormat: function (value) {
		this.setBoolFormat(value);
	},
	setBoolFormat: function (value) {
		if (value != this._boolFormat) {
			this._boolFormat = value;
			if (value) {
				this._boolParser = new BooleanConverter(value);
			} else {
				this._boolParser = null;	
			}
			this._changed();
		}
	},
	datetimeFormat_: function () {
		return this._dateFormat;
	},
	setDatetimeFormat: function (value) {
		this.setDateFormat(value);
	},
	setDateFormat: function (value) {
		if (value != this._dateFormat) {
			this._dateFormat = value;
			if (value) {
				this._dateParser = new DateTimeReader(value);
				this._dateParser.setAmText(this._amText);
				this._dateParser.setPmText(this._pmText);
				this._dateParser.setBaseYear(this._baseYear);
			} else {
				this._dateParser = null;	
			}
			this._changed();
		}
	},
	setAmText: function (value) {
		if (value != this._amText) {
			this._amText = value;
			if (this._dateParser) {
				this._dateParser.setAmText(value);
			}
			this._changed();
		}
	},
	setPmText: function (value) {
		if (value != this._pmText) {
			this._pmText = value;
			if (this._dateParser) {
				this._dateParser.setPmText(value);
			}
			this._changed();
		}
	},
	setBaseYear: function (value) {
		if (value != this._baseYear) {
			this._baseYear = value;
			if (this._dateParser) {
				this._dateParser.setBaseYear(value);
			}
			this._changed();
		}
	},
	isEmpty: function (value) {
		var v = value === undefined || value === null || value == "";
		if (!v && this._dataType == ValueType.NUMBER) {
			v = isNaN(value);
		}
		return v;
	},
	getBool: function (parser, value) {
		if (typeof value === "boolean") {
			return value;
		} else {
			return this._boolParser ? this._boolParser.toBool(value) : parser.toBool(value);
		}
	},
	getDate: function (parser, value) {
		if (value instanceof Date) {
			return new Date(value);
		} else {
			return this._dateParser ? this._dateParser.toDate(value) : parser.toDate(value);
		}
	},
	setCalculateExpression: function (value) {
		if (value != this._calculateExpression) {
			this._calculateExpression = value;
			this._updatable = (this._calculateExpression || this._calculateCallback) ? false : this._updatable;
		}
	},
	setCalculateCallback: function (value) {
		if (value != this._calculateCallback) {
			this._calculateCallback = value;
			this._updatable = (this._calculateExpression || this._calculateCallback) ? false : this._updatable;
		}
	},

	isCalculated: function () {
		return this._calculateCallback || this._calculateExpression;
	},
    /*
	equalValues: function (v1, v2) {
		if (v1 === undefined) {
			return v2 === undefined;
		}
		if (v2 === undefined) {
			return false;
		}
		switch (this._dataType) {
			case ValueType.TEXT:
				return v1 == v2;
			case ValueType.NUMBER:
				if (isNaN(v1)) {
					return isNaN(v2);
				}
				if (isNaN(v2)) {
					return false;
				}
				return v1 == v2;
			case ValueType.DATETIME:
				if (!(v1 instanceof Date)) {
					return !(v2 instanceof Date);
				}
				if (!(v2 instanceof Date)) {
					return false;
				}
				return v1.getTime() == v2.getTime();
			case ValueType.BOOLEAN:
				return Boolean(v1) == Boolean(v2);
			default:
				return v1 == v2;
		}
	},
	*/
	isNull: function (value) {
		if (value === undefined || value === null) {
			return true;
		}
		switch (this._runType) {
			case ValueType.TEXT:
			case ValueType.CHAR:
				if (String(value).length == 0) {
					return true;
				}
				break;
			case ValueType.NUMBER:
			case ValueType.UNUM:
			case ValueType.INT:
			case ValueType.UINT:
				if (isNaN(value)) {
					return true;
				}
				break;
		}
		return false;
	},
	propertyChanged: function (prop, newValue) {
		this._changed();
	},
	clone: function () {
		var obj = this._super();
		obj._orgFieldName = this._orgFieldName;
		obj._orgAttrName = this._orgAttrName;
		obj._boolParser = this._boolParser;
		obj._dateParser = this._dateParser;
		return obj;
	},
	/*
	clone: function () {
		var fld = new DataField();
	fieldName: null,
	dataType: ValueType.TEXT,
	length: 0,
	header: null,
	minimum: undefined,
	maximum: undefined,
	required: false,
	defaultValue: UNDEFINED,
	baseField: null,
	boolFormat: null,
	dateFormat: null,
	amText: null,
	pmText: null,
	baseYear: NaN,
		fld._orgFieldName = this._orgFieldName;
		fld._fieldName = this._fieldName;
		fld._dataType = this._dataType;
		fld._length = this._length;
		fld._header = this._header;
		fld._required = this._required;
		fld._defaultValue = this._defaultValue;
		fld._baseField = this._baseField;
		fld._boolFormat = this._boolFormat;
		fld._dateFormat = this._dateFormat;
		fld._amText = this._amText;
		fld._pmText = this._pmText;
		fld._baseYear = this._baseYear;
		return fld;
	},
	*/
	_prepare: function (owner) {
		this._owner = owner;
	},
	_changed: function () {
		if (this._owner) {
		}
	},
	_resetTypes: function (provider) {
		if (this._typeLock) {
			return;
		}
		if (provider) {
			this._ownerBoolParser = provider._boolParser;
			this._ownerDateParser = provider._dateParser;
		}
		var i, d;
		var type = this._dataType;
		var stype = this._subType;
		this._runType = type;
		this._ranged = false;
		if ((!this._owner || this._owner.isSubTypeEnabled()) && this._subTypeEnabled) {
			if (stype) {
				switch (type) {
					case ValueType.TEXT:
						if (stype == ValueType.CHAR && this._length > 0) {
							type = stype;
						}
						break;
					case ValueType.NUMBER:
						if (stype == ValueType.UNUM || stype == ValueType.INT || stype == ValueType.UINT) {
							type = stype;
						}
						break;
					case ValueType.DATETIME:
						if (stype == ValueType.DATE/* || stype == GridValueType.TIME*/) {
							type = stype;
						}
						break;
				}
			}
			this._runType = type;
			this._runSet = null;
			if (this._set && this._set.length) {
				if (this._runType == ValueType.DATETIME) {
					this._runSet = [];
					for (i = 0; i < this._set.length; i++) {
						d = this.getDate(this._ownerDateParser, this._set[i]);
						if (d) {
							this._runSet.push(d.getTime())
						}
					}
					if (this._runSet.length < 1) {
						this._runSet = null;
					}
				} else if (this._runType == ValueType.DATE) {
					this._runSet = [];
					for (i = 0; i < this._set.length; i++) {
						d = this.getDate(this._ownerDateParser, this._set[i]);
						if (d) {
							var d2 = new Date(d);
							this._runSet.push(d2.setHours(0, 0, 0, 0));
						}
					}
					if (this._runSet.length < 1) {
						this._runSet = null;
					}
				} else {
					this._runSet = this._set;
				}
				this._ranged = true;
			}
			if (!this._ranged) {
				switch (this._dataType) {
					case ValueType.NUMBER:
						this._runMin = Number(this._minimum);
						this._runMax = Number(this._maximum);
						if (!isNaN(this._runMin) && !isNaN(this._runMax)) {
							this._ranged = this._runMin <= this._runMax;
						} else {
							this._ranged = !isNaN(this._runMin) || !isNaN(this._runMax);
						}
						break;
					case ValueType.DATETIME:
						this._runMin = this.getDate(this._ownerDateParser, this._minimum);
						this._runMax = this.getDate(this._ownerDateParser, this._maximum);
						if (this._runMin && this._runMax) {
							this._ranged = this._runMin.getTime() <= this._runMax.getTime();
						} else {
							this._ranged = this._runMin || this._runMax;
						}
						break;
				}
			}
			switch (this._runType) {
				case ValueType.TEXT:
                    this.equalValues = this._equalTextValues;
                    this.sameValues = this._sameTextValues;
					this.readValue = this._readTextValue;
					this.nullValue = null;
					break;
				case ValueType.CHAR:
                    this.equalValues = this._equalTextValues;
                    this.sameValues = this._sameTextValues;
					this.readValue = this._readCharValue;
					this.nullValue = null;
					break;
				case ValueType.NUMBER:
                    this.equalValues = this._equalNumberValues;
                    this.sameValues = this._sameNumberValues;
					this.readValue = this._readNumberValue;
					this.nullValue = NaN;
					break;
				case ValueType.UNUM:
                    this.equalValues = this._equalNumberValues;
                    this.sameValues = this._sameNumberValues;
					this.readValue = this._readUnumValue;
					this.nullValue = NaN;
					break;
				case ValueType.INT:
                    this.equalValues = this._equalNumberValues;
                    this.sameValues = this._sameNumberValues;
					this.readValue = this._readIntValue;
					this.nullValue = NaN;
					break;
				case ValueType.UINT:
                    this.equalValues = this._equalNumberValues;
                    this.sameValues = this._sameNumberValues;
					this.readValue = this._readUintValue;
					this.nullValue = NaN;
					break;
				case ValueType.DATETIME:
                    this.equalValues = this._equalDateValues;
                    this.sameValues = this._sameDateValues;
					this.readValue = this._readDatetimeValue;
					this.nullValue = null;
					break;
				case ValueType.DATE:
                    this.equalValues = this._equalDateValues;
                    this.sameValues = this._sameDateValues;
					this.readValue = this._readDateValue;
					this.nullValue = null;
					break;
				case ValueType.BOOLEAN:
                    this.equalValues = this._equalBoolValues;
                    this.sameValues = this._sameBoolValues;
					this.readValue = this._readBooleanValue;
					this.nullValue = false;
					break;
				default:
                    this.equalValues = this._equalDummyValues;
                    this.sameValues = this._sameDummyValues;
					this.readValue = this._readDummyValue;
					this.nullValue = undefined;
					break;
			}
		}
	},
	_refreshFormats: function (owner) {
		this._owner = owner;
		if (this._dateParser) {
			if (!this._dateParser.baseYear) {
				this._dateParser.setBaseYear(owner.baseYear());
			}
			if (!this._dateParser.amText) {
				this._dateParser.setAmText(owner.amText());
			}
			if (!this._dateParser.pmText) {
				this._dateParser.setPmText(owner.pmText());
			}
		}
		this._ownerBoolParser = owner._boolParser;
		this._ownerDateParser = owner._dateParser;
	},
    _equalDummyValues: function (v1, v2) {
        if (v1 === undefined) {
            return v2 === undefined;
        }
        if (v2 === undefined) {
            return false;
        }
        return v1 == v2;
    },
    _sameDummyValues: function (v1, v2) {
        if (v1 === undefined || v1 === null) {
            return v2 === undefined || v2 === null;
        }
        if (v2 === undefined || v2 === null) {
            return false;
        }
        return v1 == v2;
    },
    _equalTextValues: function (v1, v2) {
        if (v1 === undefined) {
            return v2 === undefined;
        }
        if (v2 === undefined) {
            return false;
        }
        return v1 == v2;
    },
    _sameTextValues: function (v1, v2) {
        if (v1 === undefined || v1 === null || v1 == "") {
            return v2 === undefined || v2 === null || v2 == "";
        }
        if (v2 === undefined || v2 === null || v2 == "") {
            return false;
        }
        return v1 == v2;
    },
    _equalNumberValues: function (v1, v2) {
        if (v1 === undefined) {
            return v2 === undefined;
        }
        if (v2 === undefined) {
            return false;
        }
        if (isNaN(v1)) {
            return isNaN(v2);
        }
        if (isNaN(v2)) {
            return false;
        }
        return v1 == v2;
    },
    _sameNumberValues: function (v1, v2) {
        if (isNaN(v1)) {
            return isNaN(v2);
        }
        if (isNaN(v2)) {
            return false;
        }
        return v1 == v2;
    },
    _equalDateValues: function (v1, v2) {
        if (v1 === undefined) {
            return v2 === undefined;
        }
        if (v2 === undefined) {
            return false;
        }
        if (!(v1 instanceof Date)) {
            return !(v2 instanceof Date);
        }
        if (!(v2 instanceof Date)) {
            return false;
        }
        return v1.getTime() == v2.getTime();
    },
    _sameDateValues: function (v1, v2) {
        if (!(v1 instanceof Date)) {
            return !(v2 instanceof Date);
        }
        if (!(v2 instanceof Date)) {
            return false;
        }
        return v1.getTime() == v2.getTime();
    },
    _equalBoolValues: function (v1, v2) {
        if (v1 === undefined) {
            return v2 === undefined;
        }
        if (v2 === undefined) {
            return false;
        }
        return Boolean(v1) == Boolean(v2);
    },
    _sameBoolValues: function (v1, v2) {
        if (v1 === undefined) {
            return v2 === undefined;
        }
        if (v2 === undefined) {
            return false;
        }
        return Boolean(v1) == Boolean(v2);
    },
	_readDummyValue: function (v) {
		return v;
	},
	_readTextValue: function (v) {
		if (v === undefined) {
			return v;
		}
		var s = (v === null) ? null : String(v);
		if (this._ranged && this._runSet) {
			if (this._runSet.indexOf(s) < 0) {
				return undefined;
			}
		}
		return s;
	},
	_readCharValue: function (v) {
		if (v === undefined) {
			return v;
		}
		var s = (v === null) ? null : String(v);
		if (s) {
			s = s.substr(0, this._length);
		}
		if (this._ranged && this._runSet) {
			if (this._runSet.indexOf(s) < 0) {
				return undefined;
			}
		}
		return s;
	},
	_readNumberValue: function (v) {
		if (v === undefined || v === null || v === "") {
			return undefined;
		}
		var n = Number(v);
		if (this._ranged) {
			if (this._runSet) {
				if (this._runSet.indexOf(n) < 0) {
					return undefined;
				}
			} else {
				if (!isNaN(this._runMin)) {
					n = Math.max(this._runMin, n);
				}
				if (!isNaN(this._runMax)) {
					n = Math.min(this._runMax, n);
				}
			}
		}
		return n;
	},
	_readUnumValue: function (v) {
		if (v === undefined || v === null || v === "") {
			return undefined;
		}
		var n = Math.max(0, Number(v));
		if (this._ranged) {
			if (this._runSet) {
				if (this._runSet.indexOf(n) < 0) {
					return undefined;
				}
			} else {
				if (!isNaN(this._runMin)) {
					n = Math.max(this._runMin, n);
				}
				if (!isNaN(this._runMax)) {
					n = Math.min(this._runMax, n);
				}
			}
			n = Math.max(0, n);
		}
		return n;
	},
	_readIntValue: function (v) {
		if (v === undefined || v === null || v === "") {
			return undefined;
		}
		var n = v >= 0 ? Math.floor(v) : Math.ceil(v);
		if (this._ranged) {
			if (this._runSet) {
				if (this._runSet.indexOf(n) < 0) {
					return undefined;
				}
			} else {
				if (!isNaN(this._runMin)) {
					n = Math.max(this._runMin, n);
				}
				if (!isNaN(this._runMax)) {
					n = Math.min(this._runMax, n);
				}
			}
			n = n >= 0 ? Math.floor(n) : Math.ceil(n);
		}
		return n;
	},
	_readUintValue: function (v) {
		if (v === undefined || v === null || v === "") {
			return undefined;
		}
		var n = Math.max(0, Math.floor(Math.floor(v)));
		if (this._ranged) {
			if (this._runSet) {
				if (this._runSet.indexOf(n) < 0) {
					return undefined;
				}
			} else {
				if (!isNaN(this._runMin)) {
					n = Math.max(this._runMin, n);
				}
				if (!isNaN(this._runMax)) {
					n = Math.min(this._runMax, n);
				}
			}
			n = Math.max(0, Math.floor(Math.floor(n)));
		}
		return n;
	},
	_readDatetimeValue: function (v) {
		if (v === undefined) {
			return undefined;
		}
		if (v === null) {
			return this.nullValue;
		}
		var d = this.getDate(this._ownerDateParser, v);
		if (d && this._ranged) {
			if (this._runSet) {
				var found = false;
				for (var i = this._runSet.length; i--;) {
					if (d.getTime() == this._runSet[i]) {
						found = true;
						break;
					}
				}
				if (!found) {
					return undefined;
				}
			} else {
				if (this._runMin) {
					if (d.getTime() < this._runMin.getTime()) {
						d = new Date(this._runMin);
					}
				}
				if (this._runMax) {
					if (d.getTime() > this._runMax.getTime()) {
						d = new Date(this._runMax);
					}
				}
			}
		}
		return d;
	},
	_readDateValue: function (v) {
		if (v === undefined) {
			return undefined;
		}
		if (v === null) {
			return this.nullValue;
		}
		var d = this.getDate(this._ownerDateParser, v);
		if (d) {
			d.setHours(0, 0, 0, 0);
			if (this._ranged) {
				if (this._runSet) {
					var found = false;
					for (var i = this._runSet.length; i--;) {
						if (d.getTime() == this._runSet[i]) {
							found = true;
							break;
						}
					}
					if (!found) {
						return undefined;
					}
				} else {
					if (this._runMin) {
						if (d.getTime() < this._runMin.getTime()) {
							d = new Date(this._runMin);
						}
					}
					if (this._runMax) {
						if (d.getTime() > this._runMax.getTime()) {
							d = new Date(this._runMax);
						}
					}
				}
			}
		}
		return d;
	},
	_readBooleanValue: function (v) {
		if (v === undefined) {
			return v;
		}
		if (v === null) {
			return false;
		}
		var b = this.getBool(this._ownerBoolParser, v);
		return b;
	},
	_calculateValue: function (runtime, rowId, fieldName, fields, orgFields, values) {
		if (this._calculateCallback) {
			return this._calculateCallback(rowId, fieldName, orgFields, values);
		} else if (this._calculateExpression) {
			if (!this._exprNode)
				this._exprNode = ExpressionParser.Default.parse(this._calculateExpression, DataField.CAPITAL_INDEXERS);
			runtime.setValues(values, fields);
			return this._exprNode.evaluate(runtime);
		}
		return undefined;
	},
	proxy: function() {
		return $$_getFieldProxy(this);
	}
}, {
	CAPITAL_INDEXERS: ["value", "values"]
});