var MockItem = defineClass("MockItem", GridRow, {
	init: function (index) {
		this._super();
		this._index = index;
	},
	getDataRow: function () {
		return this._index;
	},
	getData: function (field) {
		return "data(" + this._index + "," + field + ")";
	}
});
var MockItemSource = defineClass("MockItemSource", ItemProvider, {
	init: function (count) {
		this._super();
		this.setCount(count);
	},
	count: 0,
	setCount: function (value) {
		value = Math.max(0, value);
		if (value != this._count) {
			this._count = value;
			this._items = new Array(value);
			for (var i = 0; i < value; i++) {
				this._items[i] = new MockItem(i);
			}
		}
	},
	getDataSource: function () {
		return null;
	},
	setDataSource: function (value) {
	},
	getItem: function (index) {
		return this._items[index];
	},
	getItemCount: function () {
		return this._items.length;
	}
});