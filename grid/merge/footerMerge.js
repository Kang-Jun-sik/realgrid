var FooterMergeRoom = defineClass("FooterMergeRoom", null, {
	init: function(name, base, start, count) {
		this._super();
		this._name = name;
		this._base = base;
		this._start = start;
		this._count = count;
	},
	name: null,
	base: -1,
	start: -1,
	count: 0,
	last: function () {
		return this._start + this._count - 1;
	}
});

var RowGroupFooterMergeRoom = defineClass("RowGroupFooterMergeRoom", FooterMergeRoom, {
	init: function(level, name, base, start, count) {
		this._super(name, base, start, count);
		this._groupLevel = level;
	},
	groupLevel: -1
});

var FooterMergeManager = defineClass("FooterMergeRoom", null, {
	init: function () {
		this.clearRooms();
	},
	clearRooms: function () {
		this._footerRooms = {};
		this._length = 0;
	},
	count: function () {
		return this._length;
	},
	getRoom: function(name) {
		return this._footerRooms[name];
	},
	getRoomNames: function () {
		return Object.keys(this._footerRooms);
	},
	findRoom: function (colIndex) {
		for (var r in this._footerRooms) {
			var room = this._footerRooms[r];
			if (colIndex >= room.start() && colIndex <= room.last()) {
				return room;
			}
		}
		return null;
	},
	addRoom: function (name, base, start, count) {
		this._footerRooms[name] = new FooterMergeRoom(name, base, start, count);
		this._length++;
	},
	setRoom: function (name, base, start, count) {
		var room = this._footerRooms[name];
		if (room) {
			room._base = base;
			room._start = start;
			room._count = count;
		} else {
			this.addFooter(name, base, start, count);
		}
	}, 
	buildRooms: function (grid, cells) {
		this.clearRooms();
		var fixedCount = grid.fixedOptions().colCount();
		if (cells) {
			for (var i = 0, len = cells.length; i < len; i++) {
				var baseCol = grid.columnByName(cells[i][0]);
				if (!baseCol || baseCol.group() || baseCol instanceof ColumnGroup) break;

				var base = baseCol.displayIndex();
				var indexes = [];
				indexes.push(base);
				for (var j = 1, len2 = cells[i].length; j < len2; j++) {
					var col = grid.columnByName(cells[i][j]);
					if (col && !col.group() && col instanceof ValueColumn) {
						var index = col.displayIndex();
						if (fixedCount < 1 || (base >= fixedCount && index >= fixedCount) ||
								              (base < fixedCount && index < fixedCount)) {
							indexes.push(index);
						}
					}
				}
				if (indexes.length > 1) {
					var min = base;
					var max = base;
					indexes.sort(); 
					var baseIndex = indexes.indexOf(base);
					for (var j = baseIndex-1; j >= 0; j--) {
						if (indexes[j] == indexes[j+1]-1) {
                            min = indexes[j];
                        } else {
                        	break;
                        }
                    }
					for (var j = baseIndex+1; j < indexes.length; j++) {
						if (indexes[j] == indexes[j-1]+1) {
							max = indexes[j];
						} else {
							break;
						}
					}
					if (max > min)
						this.addRoom(cells[i][0], base, min, max-min+1);
				}

			}
		}
	}
});

var RowGroupFooterMergeManager = defineClass("RowGroupFooterMergeManager", null, {
	init: function () {
		this.clearRooms();
	},
	destroy: function() {
		this._groupFooterRooms = null;
		this._super();
	},
	clearRooms: function () {
		this._groupFooterRooms = [];
	},
	count: function () {
		return this._groupFooterRooms.length;
	},
	getRoom: function (level, name) {
		return this._groupFooterRooms[level] ? this._groupFooterRooms[level][name] : null;
	},
	getRoomNames: function (level) {
		return this._groupFooterRooms[level] ? Object.keys(this._groupFooterRooms[level]) : [];
	},
	findRoom: function (level, colIndex) {
		if (this._groupFooterRooms[level]) {
			for (var r in this._groupFooterRooms[level]) {
				var room = this._groupFooterRooms[level][r];
				if (colIndex >= room.start() && colIndex <= room.last()) {
					return room;
				}				
			}
		}
		return null;
	},
	addRoom: function (level, name, base, start, count) {
		if (!this._groupFooterRooms[level])
			this._groupFooterRooms[level] = {};
		this._groupFooterRooms[level][name] = new RowGroupFooterMergeRoom(level, name, base, start, count);
	},
	setRoom: function  (level, name, base, start, count) {
		var room = this._groupFooterRooms[level][base];
		if (room) {
			room._start = start;
			room._count = count;			
		} else {
			this.addGroupFooter(level, name, base, start, count);
		}
	},
	buildRooms: function (grid) {
		var rowGroup = grid.rowGroup();
		var fixedCount = grid.fixedOptions().colCount();
		var level;

		this.clearRooms();

		if (rowGroup && rowGroup.isFooterCellMerge()) {
			var mergeMode = rowGroup.isMergeMode();
			var flds = grid.getGroupByFields();
			var ds = grid.dataSource();
			var grpFields;
			if (flds && ds) {
				grpFields = [];
				for (var i = 0; i < flds.length; i++) {
					grpFields.push(ds.getOrgFieldName(flds[i]));
				}
			}

			var baseCol = mergeMode ? 1 : 0
			var startCol = 0;
			var groups = [];
			if (grpFields) {
				for (var i = 0, cnt = grid.getVisibleColumnCount(); i < cnt; i++) {
					var col = grid.getVisibleColumn(i);
					var fieldName = col.fieldName && col.fieldName();
					if (fieldName && (level = grpFields.indexOf(fieldName)) > -1) {
						if (groups.length == 0)
							startCol = i;
						groups.push({name: fieldName, col: i, level: level+1});
					} else if (groups.length > 0) {
						break;
					}
				}
			}
			startCol += baseCol;

			for (var i = 0; i < groups.length; i++) {
				var start = mergeMode ? startCol + i : startCol;
				var count = mergeMode ? groups.length - i - 1 : groups.length;
				if (fixedCount > start)
					count = Math.min(fixedCount-start,count);
				if (count > 1 && groups[i].col + baseCol < start + count)
					this.addRoom(groups[i].level, groups[i].name, groups[i].col + baseCol, start, count);
			}
		}
	}
});
