var /* internal */ TreeItemsSorter = function () {
	var _items, _dataSource, _parent, _field, _comparer;
	var $_comparer;
	var _userComparer = function (_field, leftItem, rightItem) {
		if ($_comparer) {
			return $_comparer(_field, leftItem._rowId, rightItem._rowId);
		}
	};
	var _sort = function (left, right, dir, checkRow) {
		var i, j, m, mi, mr, r, v;
		do {
			i = left;
			j = right;
			m = _floor((left + right) / 2);
			mi = _parent.getItem(m).dataRow();
			mr = _parent.getItem(m).row();
			do {
				if (dir == SortDirection.ASCENDING) {
					while (i <= j) {
						v = _comparer(_field, mr, _parent.getItem(i).row());
						if (v == 0 && checkRow) {
							v = mi - _parent.getItem(i).dataRow();
						}
						if (v <= 0) {	
							break;
						}
						i++;
					}
					while (i <= j) {
						v = _comparer(_field, mr, _parent.getItem(j).row());
						if (v == 0 && checkRow) {
							v = mi - _parent.getItem(j).dataRow();
						}
						if (v >= 0) {	
							break;
						}
						j--;
					}
				} else {
					while (i <= j) {
						v = _comparer(_field, mr, _parent.getItem(i).row());
						if (v == 0 && checkRow) {
							v = mi - _parent.getItem(i).dataRow();
						}
						if (v >= 0) { 
							break;
						}
						i++;
					}
					while (i <= j) {
						v = _comparer(_field, mr, _parent.getItem(j).row());
						if (v == 0 && checkRow) {
							v = mi - _parent.getItem(j).dataRow();
						}
						if (v <= 0) {	
							break;
						}
						j--;
					}
				}
				if (i <= j) {
					if (i != j) {
						_parent._exchangeItems(i, j);
					}
					i++;
					j--;
				}
			} while (i <= j);
			if (left < j) {
				_sort(left, j, dir, checkRow);
			}
			left = i;
		} while (left < right);
	};
	this.run = function (parent, field, dir, ignoreCase, left, right, checkRow) {
		_items = parent.provider();
		_dataSource = _items.dataSource();
		_parent = parent;
		_field = field;
		var fld = _dataSource.getField(field);
		$_comparer = fld._comparer ? fld._comparer : _dataSource._comparers[field] ? _dataSource._comparers[field] : null;
		if ($_comparer) {
			_comparer = _userComparer;
		} else {
			switch (fld.dataType()) {
			case ValueType.NUMBER:
				_comparer = _dataSource.compareNumbers;
				break;
			case ValueType.DATETIME:
				_comparer = _dataSource.compareNumbers;
				break;
			case ValueType.BOOLEAN:
				_comparer = _dataSource.compareBools;
				break;
			default:
				_comparer = ignoreCase ? _dataSource.compareTexts : _dataSource.compareValues;
				break;
			}
		}
		_sort(left, right, dir, checkRow);
	};
};