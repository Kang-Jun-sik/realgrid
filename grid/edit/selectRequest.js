var SelectRequest = defineClass("SelectRequest", CellRequest, {
	init: function(manager, cell, style) {
		this._super(cell);
		this._manager = manager;
		this._style = style;
	},
	manager: function () {
		return this._manager;
	},
	selectStyle: function () {
		return this._style;
	}
});
