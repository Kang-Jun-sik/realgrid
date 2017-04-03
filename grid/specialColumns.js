var DerivedColumn = defineClass("DerivedColumn", ValueColumn, {
	init: function (config) {
		this._super(config);
	},
	_initColumn: function () {
		this._super();
	}
}); 
var SeriesColumn = defineClass("SeriesColumn", DerivedColumn, {
	init: function (config) {
		this._super(config);
	},
	_initColumn: function () {
		this._super();
		this._fieldArray = [];
		this._fields = null;
	},
	fieldNames: null,
	setFieldNames: function (value) {
		if (value != this._fieldNames) {
			this._fieldNames = value;
			this._fieldArray = value ? value.split(",") : [];
		}
	},
	fields: function () {
		return this._fields;
	},
	resetIndicies: function (dataSource) {
		this._fields = [];
		if (dataSource) {
			var i, fld, arr, first, last, f1, f2, j,
				cnt = this._fieldArray.length;
			for (i = 0; i < cnt; i++) {
				fld = this._fieldArray[i];
				arr = fld.split("..");
				if (arr.length > 1) {
					first = dataSource.getFieldIndex(arr[0]);
					last = dataSource.getFieldIndex(arr[1]);
					if (first >= 0 && last >= 0) {
						f1 = Math.min(first, last);
						f2 = Math.max(first, last);
						for (j = f1; j <= f2; j++) {
							this._fields.push(j);
						}
					}
				} else {
					j = dataSource.getFieldIndex(fld);
					if (j >= 0) {
						this._fields.push(j);
					}
				}
			}
		}
	},
	_defaultRenderer: function () {
		return SeriesTextCellRenderer.Default;
	}
}); 