var DataTag = defineClass("DataTag", null, {
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
	setRowCount: function (newCount) {
	},
	insertRow: function (row) {
	},
	insertRows: function (row, count) {
	},
	removeRow: function (row) {
	},
	removeRows: function (rows) {
	},
	updateRow: function (row) {
	},
	updateRows: function (row, count) {
	},
	setValue: function (row, field) {
	},
	moveRow: function (row, newRow) {
	},
	moveRows: function (row, count, newRow) {
	}
});
var DataTagCollection = defineClass("DataTagCollection", null, {
	init: function(owner) {
		this._super();
		this._owner = owner;
		this._tags = null;
		this._tag = null;
	},
	add: function (tag) {
		if (tag) {
			if (!this._tag) {
				this._tag = tag;
			} else if (tag !== this._tag) {
				this._tags = [];
				this._tags.push(this._tag, tag);
				this._tag = null;
			} else if (this._tags.indexOf(tag) < 0) {
				this._tags.push(tag);
			}
			tag.connect(this._owner);
		}
	},
	remove: function (tag) {
		if (tag) {
            if (tag == this._tag) {
                this._tag = null;
                tag.disconnect();
            } else if (this._tags) {
                var idx = this._tags.indexOf(tag);
                if (idx >= 0) {
                    this._tags.splice(idx, 1);
                    if (this._tags.length == 1) {
                        this._tag = this._tags[0];
                        this._tags.length = 0;
                        this._tags = null;
                    }
                    tag.disconnect();
                }
            }
        }
	},
	clearRows: function () {
		if (this._tag) {
			this._tag.clearRows();
		} else if (this._tags) {
            var tags = this._tags;
			for (var i = tags.length - 1; i--;) {
				tags[i].clearRows();
			}
		}
	},
	setRows: function () {
		if (this._tag) {
			this._tag.setRows();
		} else if (this._tags) {
            var tags = this._tags;
            for (var i = tags.length - 1; i--;) {
                tags[i].setRows();
            }
		}
	},
	setRowCount: function (newCount) {
		if (this._tag) {
			this._tag.setRowCount(newCount);
		} else if (this._tags) {
            var tags = this._tags;
            for (var i = tags.length - 1; i--;) {
                tags[i].setRowCount(newCount);
            }
		}
	},
	insertRow: function (row) {
		if (this._tag) {
			this._tag.insertRow(row);
		} else if (this._tags) {
            var tags = this._tags;
            for (var i = tags.length - 1; i--;) {
                tags[i].insertRow(row);
            }
		}
	},
	insertRows: function (row, count) {
		if (this._tag) {
			this._tag.insertRows(row, count);
		} else if (this._tags) {
            var tags = this._tags;
            for (var i = tags.length - 1; i--;) {
                tags[i].insertRows(row, count);
            }
		}
	},
	removeRow: function (row) {
		if (this._tag) {
			this._tag.removeRow(row);
		} else if (this._tags) {
            var tags = this._tags;
            for (var i = tags.length - 1; i--;) {
                tags[i].removeRow(row);
            }
		}
	},
	removeRows: function (rows) {
		if (this._tag) {
			this._tag.removeRows(rows);
		} else if (this._tags) {
            var tags = this._tags;
            for (var i = tags.length - 1; i--;) {
                tags[i].removeRows(rows);
            }
		}
	},
	updateRow: function (row) {
		if (this._tag) {
			this._tag.updateRow(row);
		} else if (this._tags) {
            var tags = this._tags;
            for (var i = tags.length - 1; i--;) {
                tags[i].updateRow(row);
            }
		}
	},
	updateRows: function (row, count) {
		if (this._tag) {
			this._tag.updateRows(row, count);
		} else if (this._tags) {
            var tags = this._tags;
            for (var i = tags.length - 1; i--;) {
                tags[i].updateRows(row, count);
			}
		}
	},
	setValue: function (row, field) {
		if (this._tag) {
			this._tag.setValue(row, field);
		} else if (this._tags) {
            var tags = this._tags;
            for (var i = tags.length - 1; i--;) {
                tags[i].setValue(row, field);
			}
		}
	},
	moveRow: function (row, newRow) {
		if (this._tag) {
			this._tag.moveRow(row, newRow);
		} else if (this._tags) {
            var tags = this._tags;
            for (var i = tags.length - 1; i--;) {
                tags[i].moveRow(row, newRow);
			}
		}
	},
	moveRows: function (row, count, newRow) {
		if (this._tag) {
			this._tag.moveRows(row, count, newRow);
		} else if (this._tags) {
            var tags = this._tags;
            for (var i = tags.length - 1; i--;) {
                tags[i].moveRows(row, count, newRow);
			}
		}
	}
});