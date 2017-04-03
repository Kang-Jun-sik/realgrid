var TreeDataTag = defineClass("TreeDataTag", null, {
	init: function() {
		this._super();
	},
	connect: function (provider) {
	},
	disconnect: function () {
	},
	clearRows: function () {
	},
	setRows: function () {
	},
	addRow: function (row) {
	},
	addRows: function (rows) {
	},
	removeRow: function (row) {
	},
	removeRows: function (rows) {
	},
	updateRow: function () {
	}
});
var TreeDataTagCollection = defineClass("TreeDataTagCollection", null, {
	init: function(owner) {
		this._super();
		this._owner = owner;
		this._items = null;
		this._tag = null;
	},
	add: function (tag) {
		if (tag) {
			if (this._items == null && this._tag == null) {
				this._tag = tag;
			} else if (tag !== this._tag) {
				this._items = [];
				this._items.push(this._tag, tag);
				this._tag = null;
			} else if (this._items.indexOf(tag) < 0) {
				this._items.push(tag);
			}
			tag.connect(this._owner);
		}
	},
	remove: function (tag) {
		if (!tag) {
			return;
		}
		if (tag == this._tag) {
			this._tag = null;
			tag.disconnect();
		} else {
			var idx = this._items.indexOf(tag);
			if (idx >= 0) {
				this._items.splice(idx, 1);
				if (this._items.length == 1) {
					this._tag = this._items[0];
					this._items.length = 0;
					this._items = null;
				}
				tag.disconnect();
			}
		}
	},
	clearRows: function () {
		if (this._tag) {
			this._tag.clearRows();
		} else if (this._items) {
			var i, 
			    items = this._items;
			for (i = items.length - 1; i >= 0; i--) {
				items[i].clearRows();
			}
		}
	},
	setRows: function () {
		if (this._tag) {
			this._tag.setRows();
		} else if (this._items) {
			var i, 
			    items = this._items;
			for (i = items.length - 1; i >= 0; i--) {
				items[i].setRows();
			}
		}
	},
	addRow: function (row) {
		if (this._tag) {
			this._tag.addRow(row);
		} else if (this._items) {
			var i, 
			    items = this._items;
			for (i = items.length - 1; i >= 0; i--) {
				items[i].addRow(row);
			}
		}
	},
	addRows: function (rows) {
		if (this._tag) {
			this._tag.addRows(rows);
		} else if (this._items) {
			var i, 
			    items = this._items;
			for (i = items.length - 1; i >= 0; i--) {
				items[i].addRows(rows);
			}
		}
	},
	removeRow: function (row) {
		if (this._tag) {
			this._tag.removeRow(row);
		} else if (this._items) {
			var i, 
			    items = this._items;
			for (i = items.length - 1; i >= 0; i--) {
				items[i].removeRow(row);
			}
		}
	},
	removeRows: function (rows) {
		if (this._tag) {
			this._tag.removeRows(rows);
		} else if (this._items) {
			var i, 
			    items = this._items;
			for (i = items.length - 1; i >= 0; i--) {
				items[i].removeRows(rows);
			}
		}
	},
	updateRow: function (row) {
		if (this._tag) {
			this._tag.updateRow(row);
		} else if (this._items) {
			var i, 
			    items = this._items;
			for (i = items.length - 1; i >= 0; i--) {
				items[i].updateRow(row);
			}
		}
	}
});