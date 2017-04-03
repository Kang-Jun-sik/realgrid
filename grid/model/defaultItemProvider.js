var DefaultItemProvider = defineClass("DefaultItemProvider", ItemProvider, {
    init: function (indexing) {
        this._super(indexing);
        this._dataSource = null;
        this._rows = [];
        this._filteredItems = [];
        this._pageItems = [];
        this._sortedItems = [];
        this._pubItems = this._items = this._rows;
        this._distinctRows = [];
        this._cellStyles = new CellStyleMap(this);
        this._fixedCount = 0;
        this._fixedSorting = false;
        this._maxItemCount = 0;
        this._itemCount = 0;
        this._pubCount = 0;
        this._filtered = false;
        this._hideDeleted = false;
        this._filters = [];
        this._filterRuntime = new ColumnFilterRuntime();
        this._filterLock = 0;
        this._fixedFiltering = false;
        this._sorted = false;
        this._sortFields = [];
        this._sortDirections = [];
        this._sortCases = [];
        this._sorter = null;
        this._paging = false;
        this._pagingSource = PagingSource.ROWS;
        this._pageSize = 10;
        this._pageCount = -1;
        this._pageStartIndex = -1;
        this._currPage = 0;
        this._pageStart = 0;
        //this._sortMode = SortMode.AUTO;
        //this._filterMode = FilterMode.AUTO;
        this._summaryMode = SummaryMode.AGGREGATE;
        this._summaryMap = null;
        this._checkableExpression = null;
        this._checkableTag = null;
    },
    destroy: function() {
        this._destroying = true;
        this.setDataSource(null);
        this._rows = null;
        this._pubItems = null;
        this._items = null;
        this._filteredItems = null;
        this._pageItems = null;
        this._sortedItems = null;
        this._distinctRows = null;
        this._filters = null;
        this._sortFields = null;
        this._sortDirections = null;
        this._sortCases = null;
        this._summaryMap = null;
        this._super();
    },
    hideDeleted: false,
    setHideDeleted: function (value) {
        if (value != this._hideDeleted) {
            this._hideDeleted = value;
            this.$_buildItems();
            this._fireRefresh();
        }
    },
    isFiltered: function () {
        return this._filtered;
    },
    isSorted: function () {
        return this._sorted;
    },
    isPaging: function () {
        return this._paging;
    },
    pageStartIndex: function () {
        return this._pageStart;
    },
    sorter: function () {
        return this._sorter || this._defSorter;
    },
    setSorter: function (value) {
        this._sorter = value;
    },
    setSummaryMode: function (value) {
        if (value != this._summaryMode) {
            this._summaryMode = value;
            this.$_resetSummary();
            this.$_buildItems();
            this._fireRefresh();
        }
    },
    sortMode: SortMode.AUTO,
    filterMode : FilterMode.AUTO,
    checkableExpression: function () {
        return this._checkableExpression;
    },
    setCheckableExpression: function (value) {
        if (value != this._checkableExpression) {
            this._checkableExpression = value;
            if (this._checkableTag) {
                this._checkableTag.disconnect();
                this._checkableTag = null;
            }
            if (value) {
                this._checkableTag = new ItemCheckableTag(this, value);
                if (this._dataSource) {
                    this._checkableTag.connect(this._dataSource);
                }
            }
        }
    },
    getFieldDomain: function (field) {
        var rows = this._rows,
            i,
            cnt = rows.length,
            values = [],
            curr = UNDEFINED,
            prev = UNDEFINED;
        for (i = 0; i < cnt; i++) {
            curr = this._dataSource.getValue(i, field);
            if (curr != prev && values.indexOf(curr) < 0) {
                values.push(curr);
            }
            prev = curr;
        }
        return values;
    },
    beginFilter: function () {
        this._filterLock++;
    },
    endFilter: function (apply) {
        apply = arguments.length > 0 ? apply : true;
        if (this._filterLock > 0) {
            this._filterLock = Math.max(0, this._filterLock - 1);
            if (this._filterLock == 0 && apply) {
                this.applyFilters();
            }
        }
    },
    hasFilter: function (field) {
        var filters = this._filters[field];
        return filters && filters.length > 0;
    },
    addFilter: function (field, criteria) {
        if (field >= 0) {
            this._fireFilterAdded(field, criteria);
            var filters = this._filters[field];
            if (!filters) {
                filters = [];
                this._filters[field] = filters;
            }
            var filter = new ColumnFilterRun(criteria);
            filters.push(filter);
            this.applyFilters();
            return filter;
        }
    },
    removeFilter: function (field, filter) {
        if (this._filtered && this._filters[field]) {
            this._fireFilterRemoved(field, filter);
            var filters = this._filters[field];
            var i = filters.indexOf(filter);
            if (i >= 0) {
                filters.splice(i, 1);
                this.applyFilters();
            }
        }
    },
    clearFilters: function (field) {
        if (this._filtered && this._filters[field]) {
            this._fireFilterCleared(field);
            var filters = this._filters[field];
            if (filters.length > 0) {
                filters.length = 0;
                delete this._filters[field];
                this.applyFilters();
            }
        }
    },
    clearAllFilters: function () {
        if (this._filtered) {
            this._fireFilterAllCleared();
            this._filters = [];
            this.applyFilters();
        }
    },
    hasFilters: function () {
        var i,
            filters,
            cnt = this._filters.length;
        for (i = 0; i < cnt; i++) {
            filters = this._filters[i];
            if (filters && filters.length > 0) {
                return true;
            }
        }
        return false;
    },
    applyFilters: function (fireEvent) {
        fireEvent = arguments.length > 0 ? fireEvent : true;
        if (this._filterLock > 0) {
            return;
        }
        this.$_buildItems();
        try {
            if (fireEvent) {
                this._fireRefresh();
            }
        } finally {
            this._fireFiltered();
        }
    },
    orderBy: function (fields, directions, cases, fireEvent) {
        fireEvent = arguments.length > 3 ? fireEvent : true;
        this._fireSort(fields, directions, cases);
        this._sortFields = [];
        this._sortDirections = [];
        this._sortCases = [];
        var cnt = fields ? fields.length : 0;
        var len = directions ? directions.length : 0;
        var clen = cases ? cases.length : 0;
        for (var i = 0; i < cnt; i++) {
            this._sortFields.push(fields[i]);
            if (len > i) {
                this._sortDirections.push(directions[i]);
            } else if (len > 0) {
                this._sortDirections.push(directions[len - 1]);
            } else {
                this._sortDirections.push(SortDirection.ASCENDING);
            }
            if (clen > i) {
                this._sortCases.push(cases[i]);
            } else if (clen > 0) {
                this._sortCases.push(cases[clen - 1]);
            } else {
                this._sortCases.push(SortCase.SENSITIVE);
            }
        }
        this._sorted = this.$_checkSorted();
        this.$_buildItems();
        try {
            if (fireEvent) {
                this._fireRefresh();
            }
        } finally {
            this._fireSorted();
        }
    },
    getSortFields: function () {
        return this._sortFields.slice();
    },
    getSortDirections: function () {
        return this._sortDirections.slice();
    },
    getSortCases: function () {
        return this._sortCases.concat();
    },
    setPaging: function (paging, pageSize, pageCount, source) {
        pageSize = arguments.length > 1 ? pageSize : 10;
        pageCount = arguments.length > 2 ? pageCount : -1;
        pageSize = Math.max(pageSize, 1);
        pageCount = Math.max(pageCount, -1);
        if (paging != this._paging || pageSize != this._pageSize || pageCount != this._pageCount || source != this._pagingSource) {
            this._currPage = 0;
            this._paging = paging;
            this._pagingSource = source;
            this._pageSize = pageSize;
            this._pageCount = pageCount;
            this.$_buildItems();
            this._fireRefresh();
        }
    },
    getPage: function () {
        return this._paging ? this._currPage : -1;
    },
    page: function () {
        return this._paging ? this._currPage : -1;
    },
    setPage: function (newPage, startIndex) {
        newPage = isNaN(newPage) ? 0 : newPage;
        startIndex = arguments.length > 0 ? startIndex : -1;
        if (this._paging) {
            newPage = Math.max(0, Math.min(this.pageCount() - 1, newPage));
            startIndex = Math.max(-1, startIndex);
            if (newPage != this._currPage || startIndex != this._pageStartIndex) {
                this._currPage = newPage;
                this._pageStartIndex = startIndex;
                this.$_buildPage();
                this._fireRefresh();
            }
        }
    },
    pageCount: function () {
        if (this._paging) {
            if (this._pageCount >= 0) {
                return this._pageCount;
            } else {
                return _int((this._dataSource.rowCount() + this._pageSize - 1) / this._pageSize);
            }
        } else {
            return 0;
        }
    },
    setPageCount: function (value) {
        if (this._paging) {
            value = Math.max(-1, value);
            if (value != this._pageCount) {
                this._pageCount = value;
                this.$_buildPage();
                this._fireRefresh();
            }
        }
    },
    getCheckedRows: function () {
        var i;
        var item;
        var cnt = this.itemCount();
        var rows = [];
        for (i = 0; i < cnt; i++) {
            item = this._pubItems[i];
            if (item.isChecked()) {
                rows.push(item.dataRow());
            }
        }
        return rows;
    },
    resetCheckables: function () {
        for (var i = this._rows.length; i--;) {
            this._rows[i].$_setCheckable(true);
        }
        this._fireRefresh();
    },
    applyCheckables: function () {
        if (this._checkableTag) {
            this._checkableTag.setRows();
        } else {
            ItemCheckableTag.clearCheckables(this);
        }
        this._fireRefresh();
    },
    dataSource: function () {
        return this._dataSource;
    },
    setDataSource: function (value) {
        if (value !== this._dataSource) {
            this.$_clearRows();
            if (this._dataSource) {
                this._dataSource.removeTag(this._cellStyles);
                this._checkableTag && this._checkableTag.disconnect();
                this._dataSource.removeListener(this);
            }
            this._dataSource = value;
            if (this._dataSource) {
                this._checkableTag && this._checkableTag.connect(this._dataSource);
                this.$_buildRows();
                this._dataSource.addListener(this);
                this._dataSource.addTag(this._cellStyles);
            }
            if (!this._destroying) {
                this.$_resetSummary();
                this._fireReset();
            }
        }
    },
    itemCount: function () {
        return this._pubCount;
    },
    fixedCount: function () {
        return this._fixedCount;
    },
    maxItemCount: function () {
        return this._maxItemCount;
    },
    setMaxItemCount: function (value) {
        value = Math.max(0, value);
        if (value != this._maxItemCount) {
            this._maxItemCount = value;
            this.refreshItems();
        }
    },
    hideDeleted: function () {
        return this._hideDeleted;
    },
    setHideDeleted: function (value) {
        if (value != this._hideDeleted) {
            this._hideDeleted = value;
            this.$_buildItems();
            this._fireRefresh();
        }
    },
    getItem: function (index) {
        if (index < 0 || index >= this._pubCount) {
            return null;
        }
        return this._pubItems[index];
    },
    getItems: function (index, count) {
        return this._pubItems.slice(index, index + count);
    },
    getIndexOfRow: function (dataRow) {
        if (dataRow >= 0 && dataRow < this._rows.length) {
            return this._rows[dataRow]._index;
        }
        return -1;
    },
    getItemOfRow: function (dataRow) {
        if (dataRow >= 0 && dataRow < this._rows.length) {
            var item = this._rows[dataRow];
            return item._index >= 0 ? item : null;
        }
        return null;
    },
    refreshItems: function () {
        this.$_clearRows();
        this.$_buildRows();
        this._fireRefresh();
    },
    setFixed: function (count, sorting, filtering) {
        count = Math.max(0, count);
        if (count != this._fixedCount || sorting != this._fixedSorting || filtering != this._filtering) {
            this._fixedCount = count;
            this._fixedSorting = sorting;
            this._fixedFiltering = filtering;
            this.$_buildItems();
            this._fireRefresh();
        }
    },
    exchange: function (index1, index2) {
        if (index1 == index2) {
            return;
        }
        if (!this._sorted && !this._filtered) {
            if (index1 < 0 || index1 >= this._rows.length) {
                throw new Error("index1 is out of bounds: " + index1);
            }
            if (index2 < 0 || index2 >= this._rows.length) {
                throw new Error("index2 is out of bounds: " + index1);
            }
            var t = this._rows[index1];
            this._rows[index1] = this._rows[index2];
            this._rows[index2] = t;
        }
    },
    clearDisplayLevels: function () {
        var i;
        var rows = this._rows;
        var cnt = rows.length;
        for (i = 0; i < cnt; i++) {
            rows[i]._displayLevel = -1;
        }
    },
    getAllItems: function () {
        return this._pubItems.slice();
    },
    hasCellStyle: function () {
        return !this._cellStyles.isEmpty();
    },
    setCellStyle: function (row, field, style) {
        this._cellStyles.setCellStyle(row, field, style);
    },
    setCellStyles: function (provider, rows, fieldMap) {
        this._cellStyles.setCellStyles(provider, rows, fieldMap);
    },
    removeCellStyle: function (style) {
        this._cellStyles.removeCellStyle(style);
    },
    clearCellStyles: function () {
        this._cellStyles.clearCellStyles();
    },
    checkCellStyle: function (dataRow, field) {
        return this._cellStyles.checkCellStyle(dataRow, field);
    },
    getCellStyle: function (dataRow, field) {
        return this._cellStyles.getCellStyle(dataRow, field);
    },
    getNumber: function (field) {
        var fs = this.$_getSummary(field);
        return fs ? fs.count : this.itemCount();
    },
    getSum: function (field) {
        var fs = this.$_getSummary(field);
        return fs ? fs.sum : NaN;
    },
    getMax: function (field) {
        var fs = this.$_getSummary(field);
        return fs ? fs.max : NaN;
    },
    getMin: function (field) {
        var fs = this.$_getSummary(field);
        return fs ? fs.min : NaN;
    },
    getAvg: function (field) {
        var fs = this.$_getSummary(field);
        return fs ? fs.avg : NaN;
    },
    getVar: function (field) {
        var fs = this.$_getSummary(field);
        return fs ? fs.vars : NaN;
    },
    getVarp: function (field) {
        var fs = this.$_getSummary(field);
        return fs ? fs.varsp : NaN;
    },
    getStdev: function (field) {
        var fs = this.$_getSummary(field);
        return fs ? Math.sqrt(fs.vars) : NaN;
    },
    getStdevp: function (field) {
        var fs = this.$_getSummary(field);
        return fs ? Math.sqrt(fs.varsp) : NaN;
    },
    $_clearRows: function () {
        this._rows.length = 0;
        this._filteredItems.length = 0;
        this._filtered = false;
        this._sorted = false;
        this._sortedItems = null;
        this._pubItems = this._rows;
        this.$_clearDistincts();
    },
    $_clearIndicies: function () {
        for (var i = this._rows.length; i--;) {
            this._rows[i]._index = -1;
        }
    },
    $_clearDistincts: function () {
        for (var i = this._distinctRows.length; i--;) {
            this._distinctRows[i] = null;
        }
        this._distinctRows.length = 0;
    },
    $_checkFiltered: function () {
        if (this._dataSource) {
            this._filters.length = this._dataSource.fieldCount();
            return this.hasFilters() || (this._hideDeleted && this._dataSource.deletedCount() > 0);
        }
        return false;
    },
    $_select: function (filters, item, field) {
        var cnt = filters.length;
        for (var i = 0; i < cnt; i++) {
            if (filters[i].select(this._filterRuntime, item, field)) {
                return true;
            }
        }
        return false;
    },
    $_checkSorted: function () {
        for (var i = this._sortFields.length - 1; i >= 0; i--) {
            if (this._sortFields[i] > this._dataSource.fieldCount()) {
                this._sortFields.splice(i, 1);
                this._sortDirections.splice(i, 1);
                this._sortCases.splice(i, 1);
            }
        }
        return this._sortFields && this._sortFields.length > 0;
    },
    $_buildRows: function () {
        var ds = this._dataSource;
        if (!ds) {
            return;
        }
        var t = getTimer();
        _trace(">>>>>> B U I L D I T E M S... " + t);
        this._filtered = this.$_checkFiltered();
        this._sorted = this.$_checkSorted();
        this._rowCount = ds.rowCount();
        if (!this._filtered && !this._paging && this.maxItemCount() > 0) {
            this._rowCount = Math.min(this._rowCount, this.maxItemCount());
        }
        this._rows = new Array(this._rowCount);
        for (var i = 0, cnt = this._rows.length; i < cnt; i++) {
            this._rows[i] = this.$_createRow(i);
        }
        this.$_buildItems();
        this._checkableTag && this._checkableTag.setRows();
        _trace("####### B U I L D I T E M S: " + (getTimer() - t));
    },
    $_resetCounts: function () {
        if (this._filtered) {
            this._pubCount = this._itemCount = this._items.length;
        } else {
            this._pubCount = this._itemCount = this._rowCount = this._rows.length;
        }
    },
    $_buildItems: function (noFilter, noSort) {
        var maxCount = this.maxItemCount() > 0 ? this.maxItemCount() : this._rows.length;
        var i, cnt, row, state;
        this._rowCount = this._rows.length;
        this._pubItems = this._items = this._rows;
        this._pubCount = this._itemCount = this._rows.length;
        this._filtered = this.$_checkFiltered();
        this._sorted = this.$_checkSorted();
        if (this._filtered || this._paging) {
            this.$_clearIndicies();
        }
        if (this._filtered) {
            this._filteredItems.length = 0;
            if (this._hideDeleted) {
                for (i = 0; i < this._rowCount; i++) {
                    row = this._rows[i];
                    state = this._dataSource.getRowState(this._rows[i]._dataRow);
                    if (RowState.isDeleted(state)) {
                        row._index = -1;
                    } else {
                        row._index = 0;
                    }
                }
            } else {
                for (i = 0; i < this._rowCount; i++) {
                    this._rows[i]._index = 0;
                }
            }
            var filters, c;
            var fixedCount = this.fixedCount();
            var exceptFiltering = (fixedCount > 0) && !this._fixedFiltering;
            var nMax = this._rows.length;
            if (!noFilter) {
                for (var i = 0, len = this._filters.length; i < len; i++) {
                    filters = this._filters[i];
                    if (filters) {
                        for (c = 0; c < filters.length; c++) {
                            filters[c].prepare(this._filterRuntime, this._dataSource);
                        }
                    }
                }
            }
            if (!this._paging) {
                nMax = Math.min(nMax, maxCount);
            }
            cnt = 0;
            for (i = 0; i < this._rowCount && cnt < nMax; i++) {
                row = this._rows[i];
                if (row._index >= 0) {
                    if (noFilter || exceptFiltering && cnt < fixedCount) {
                        this._filteredItems.push(row);
                        cnt++;
                    } else {
                        var selected = true;
                        for (var y = 0, len = this._filters.length; y < len; y++) {
                            filters = this._filters[y];
                            if (filters && !this.$_select(filters, row, y)) {
                                selected = false;
                                break;
                            }
                        }
                        if (selected) {
                            this._filteredItems.push(row);
                            cnt++;
                        }
                    }
                }
            }
            this._pubItems = this._items = this._filteredItems;
            this._pubCount = this._itemCount = this._items.length;
        }
        if (this._sorted) {
            if (noSort) {
                var items = this._sortedItems;
                for (i = items.length; i--;) {
                    if (items[i]._index < 0) {
                        items.splice(i, 1);
                    }
                }
            } else {
                this.$_sortRows();
            }
            this._pubItems = this._sortedItems;
        }
        if (this._paging) {
            this.$_buildPageItems();
        }
        this.$_clearSummary();
        this._resetItemIndicies(0);
    },
    $_buildPageItems: function () {
        var items = this._sorted ? this._sortedItems : this._filtered ? this._filteredItems : this._items;
        this._pageItems.length = 0;
        var i = this._pageStart = this._pageStartIndex >= 0 ? this._pageStartIndex : this._currPage * this._pageSize;
        var itemCount = items.length;
        var maxCount = this.maxItemCount() > 0 ? this.maxItemCount() : itemCount;
        var cnt = Math.min(this._pageSize, maxCount);
        for (; i < itemCount && cnt > 0; i++, cnt--) {
            this._pageItems.push(items[i]);
        }
        this._pubItems = this._pageItems;
        this._pubCount = this._pubItems.length;
    },
    $_buildPage: function () {
        this.$_clearIndicies();
        this.$_buildPageItems();
        this._resetItemIndicies(0);
    },
    $_sortRows: function () {
        var rows = this._items.length;
        this._sortedItems = this._items.concat();
        if (this._fixedCount > 0 && !this._fixedSorting) {
            this.$_sort(0, this._fixedCount, rows - 1);
        } else {
            this.$_sort(0, 0, rows - 1);
        }
    },
    $_sort: function (level, startIndex, endIndex) {
        var t = _getTimer();
        this.$_sortLevel(level, startIndex, endIndex);
        t = _getTimer() - t;
        trace("### DefaultItemProvider.sort in " + t + " ms.");
    },
    $_sortLevel: function (level, startIndex, endIndex) {
        if (startIndex >= endIndex) {
            return;
        }
        var ds = this._dataSource;
        var fld = this._sortFields[level];
        var field = ds.getField(fld);
        if (field) {
            var ascending = this._sortDirections[level] != SortDirection.DESCENDING;
            var ignoreCase = this._sortCases[level] == SortCase.INSENSITIVE;
            var t = field.dataType();
            var equalFunc;
            var compFunc = field._comparer ? field._comparer : ds.getDataComparer(field.index());
            if (!compFunc) {
                switch (t) {
                    case ValueType.DATETIME:
                    case ValueType.NUMBER:
                        compFunc = ds.compareNumbers.bind(ds);
                        break;
                    case ValueType.BOOLEAN:
                        compFunc = ds.compareBools.bind(ds);
                        break;
                    default:
                        compFunc = ignoreCase ? ds.compareTexts.bind(ds) : ds.compareValues.bind(ds);
                        break;
                }
            }
            if (t == ValueType.TEXT && ignoreCase) {
                equalFunc = ds.equalTexts.bind(ds);
            } else {
                equalFunc = ds.equalValues.bind(ds);
            }
            this.$_sortRange(fld, ascending, ignoreCase, compFunc, startIndex, endIndex, level + 1 == this._sortFields.length);
            if (level + 1 < this._sortFields.length) {
                var i = startIndex,
                    pi = i,
                    items = this._sortedItems;
                while (i < endIndex) {
                    i++;
                    if (!equalFunc(fld, items[i]._dataRow, items[i - 1]._dataRow)) {
                        this.$_sortLevel(level + 1, pi, i - 1);
                        pi = i;
                    }
                }
                if (pi < endIndex) {
                    this.$_sortLevel(level + 1, pi, endIndex);
                }
            }
        }
    },
    $_sortRange: function (field, ascending, ignoreCase, compFunc, left, right, checkRow) {
        var i, j, row, m, r, v;
        var items = this._sortedItems;
        do {
            i = left;
            j = right;
            row = _floor((left + right) / 2);
            m = items[row]._dataRow;
            do {
                if (ascending) {
                    while (i <= j) {
                        r = items[i]._dataRow;
                        v = compFunc(field, m, r);
                        if (v == 0 && checkRow) v = m - r;
                        if (v <= 0)
                            break;
                        i++;
                    }
                    while (i <= j) {
                        r = items[j]._dataRow;
                        v = compFunc(field, m, r);
                        if (v == 0 && checkRow) v = m - r;
                        if (v >= 0)
                            break;
                        j--;
                    }
                } else {
                    while (i <= j) {
                        r = items[i]._dataRow;
                        v = compFunc(field, m, r);
                        if (v == 0 && checkRow) v = r - m;
                        if (v >= 0)
                            break;
                        i++;
                    }
                    while (i <= j) {
                        r = items[j]._dataRow;
                        v = compFunc(field, m, r);
                        if (v == 0 && checkRow) v = r - m;
                        if (v <= 0)
                            break;
                        j--;
                    }
                }
                if (i <= j) {
                    if (i != j) {
                        var t = items[i];
                        items[i] = items[j];
                        items[j] = t;
                    }
                    i++;
                    j--;
                }
            } while (i <= j);
            if (left < j) {
                this.$_sortRange(field, ascending, ignoreCase, compFunc, left, j, checkRow);
            }
            left = i;
        } while (left < right);
    },
    $_createRow: function (row) {
        var item = new GridRow(row);
        this.attachItem(item);
        return item;
    },
    $_createAllRow: function () {
        for (var i = 0; i < this._rowCount; i++) {
            if (!this._rows[i]) {
                this._rows[i] = this.$_createRow(i);
            }
        }
    },
    $_resetSummary: function () {
        this._summaryMap = [];
    },
    $_clearSummary: function () {
        if (this._summaryMap) {
            for (var i = this._summaryMap.length - 1; i >= 0; i--) {
                this._summaryMap[i] && this._summaryMap[i].clear();
            }
        }
    },
    $_getSummary: function (field) {
        var fs = this._summaryMap[field];
        if (!fs) {
            var ds = this._dataSource;
            if (ds && ds.canSummarize(field)) {
                fs = new FieldSummary(field);
                this._summaryMap[field] = fs;
            }
        }
        if (fs && fs.count == 0 && this.itemCount() > 0) {
            this.$_summarize(fs);
        }
        return fs;
    },
    $_summarize: function (fld) {
        var ds = this._dataSource;
        if (ds) {
            if (this._filtered) {
                var cnt = this._items.length;
                var rows = new Array(cnt);
                for (var i = 0; i < cnt; i++) {
                    rows[i] = this._pubItems[i]._dataRow;
                }
                ds.summarizeRange(fld, rows, this._summaryMode == SummaryMode.STATISTICAL);
            } else {
                ds.summarize(fld, this._summaryMode == SummaryMode.STATISTICAL);
            }
        }
    },
    $_needSort: function () {
        return this._sorted && this._sortMode == SortMode.AUTO;
    },
    $_needFilter: function () {
        return this._filtered && this._filterMode == FilterMode.AUTO;
    },
    onDataProviderDisposed: function (provider) {
        provider.removeTag(this._cellStyles);
        this._checkableTag && this._checkableTag.disconnect();
        this.$_clearRows();
        this.$_resetSummary();
        this._fireReset();
        this.setDataSource(null);
    },
    onDataProviderReset: function (provider) {
        this.$_clearRows();
        this.$_buildRows();
        this.$_resetSummary();
        this._fireReset();
    },
    onDataProviderRefresh: function (provider) {
        this.refreshItems();
    },
    onDataProviderRefreshClient: function (provider) {
        this._fireRefreshClient();
    },
    onDataProviderRowCountChanged: function (provider, newCount) {
        this._fireRefreshClient();
    },
    onDataProviderRowInserting: function (provider, row, values) {
        return true;
    },
    onDataProviderRowInserted: function (provider, row) {
        var rows = this._rows;
        var posRow = row < rows.length ? rows[row] : null;
        var item, items;
        item = this.$_createRow(row);
        rows.splice(row, 0, item);
        for (var i = row, cnt = rows.length; i < cnt; i++) {
            rows[i]._dataRow = i;
        }
        if (this.$_needFilter() || this.$_needSort() || this._paging) {
            this.$_buildItems();
        } else {
            if (this._filtered) {
                items = this._filteredItems;
                row = Math.max(0, posRow ? items.indexOf(posRow) : items.length);
                items.splice(row, 0, item);
            }
            if (this._sorted) {
                items = this._sortedItems;
                row = Math.max(0, posRow ? items.indexOf(posRow) : items.length);
                items.splice(row, 0, item);
            }
            this.$_clearSummary();
            this.$_resetCounts();
            this._resetItemIndicies(this._sorted ? 0 : row);
        }
        this._checkableTag && this._checkableTag.insertRow(item);
        this._fireItemInserted(item);
    },
    onDataProviderRowsInserted: function (provider, row, count) {
        if (count < 0) {
            return;
        }
        var rows = this._rows;
        var posRow = row < rows.length ? rows[row] : null;
        var list = [];
        var i, item, items;
        for (i = 0; i < count; i++) {
            list.push(item = this.$_createRow(row + i));
            rows.splice(row + i, 0, item);
        }
        var cnt = rows.length;
        for (i = row; i < cnt; i++) {
            rows[i]._dataRow = i;
        }
        if (this.$_needFilter() || this.$_needSort() || this._paging) {
            this.$_buildItems();
        } else {
            if (this._filtered) {
                items = this._filteredItems;
                row = Math.max(0, posRow ? items.indexOf(posRow) : items.length);
                for (i = 0; i < list.length; i++) {
                    items.splice(row + i, 0, list[i]);
                }
            }
            if (this._sorted) {
                items = this._sortedItems;
                row = Math.max(0, posRow ? items.indexOf(posRow) : items.length);
                for (i = 0; i < list.length; i++) {
                    items.splice(row + i, 0, list[i]);
                }
            }
            this.$_clearSummary();
            this.$_resetCounts();
            this._resetItemIndicies(row);
        }
        this._checkableTag && this._checkableTag.insertRows(row, count);
        this._fireRefresh();
    },
    onDataProviderRowRemoving: function (provider, row) {
        return true;
    },
    $_silentRemoveRow: function (item) {
        var items, r;
        if (this._filtered) {
            items = this._filteredItems;
            r = items.indexOf(item);
            r >= 0 && items.splice(r, 1);
        }
        if (this._sorted) {
            items = this._sortedItems;
            r = items.indexOf(item);
            r >= 0 && items.splice(r, 1);
        }
        this.$_clearSummary();
        this.$_resetCounts();
        this._resetItemIndicies(0);
    },
    onDataProviderRowRemoved: function (provider, rowIndex) {
        var rows = this._rows;
        var item = rows[rowIndex];
        rows.splice(rowIndex, 1);
        for (var i = rows.length - 1; i >= rowIndex; i--) {
            rows[i]._dataRow = i;
        }
        if (this.$_needFilter() || this.$_needSort() || this._paging) {
            this.$_buildItems();
        } else {
            this.$_silentRemoveRow(item);
        }
        this._fireItemDeleted(item);
    },
    onDataProviderRowsRemoving: function (provider, rows) {
        return true;
    },
    $_silentRemoveRows: function (list) {
        var i, items, item, row;
        if (this._filtered) {
            items = this._filteredItems;
            for (i = 0; i < list.length; i++) {
                item = list[i];
                row = items.indexOf(item);
                row >= 0 && items.splice(row, 1);
            }
        }
        if (this._sorted) {
            items = this._sortedItems;
            for (i = 0; i < list.length; i++) {
                item = list[i];
                row = items.indexOf(item);
                row >= 0 && items.splice(row, 1);
            }
        }
        this.$_clearSummary();
        this.$_resetCounts();
        this._resetItemIndicies(0);
    },
    onDataProviderRowsRemoved: function (provider, rows) {
        if (!rows || rows.length < 1) {
            return;
        }
        if (rows.length > 1) {
            rows.sort(function (v1, v2) {
                return v1 - v2;
            });
        }
        var items = this._rows;
        var row = rows[0];
        var list = [];
        var i;
        for (i = rows.length - 1; i >= 0; i--) {
            list.push(items[rows[i]]);
            items.splice(rows[i], 1);
        }
        for (i = this._rows.length - 1; i >= row; i--) {
            items[i]._dataRow = i;
        }
        if (this.$_needFilter() || this.$_needSort() || this._paging) {
            this.$_buildItems();
        } else {
            this.$_silentRemoveRows(list);
        }
        this._fireRefresh();
    },
    onDataProviderRowUpdating: function (provider, row, values) {
        return true;
    },
    onDataProviderRowUpdated: function (provider, row) {
        if (this.$_needFilter() || this.$_needSort() || this._paging) {
            this.$_buildItems();
        } else {
            this.$_clearSummary();
        }
        this._checkableTag && this._checkableTag.updateRow(this._rows[row]);
        this._rows[row] && this._fireItemUpdated(this._rows[row]);
    },
    onDataProviderRowsUpdated: function (provider, row, count) {
        if (this.$_needFilter() || this.$_needSort() || this._paging) {
            this.$_buildItems();
        } else {
            this.$_clearSummary();
        }
        this._checkableTag && this._checkableTag.updateRows(row, count);
        this._fireRefresh();
    },
    onDataProviderValueChanging: function (provider, row, field, value) {
        return true;
    },
    onDataProviderValueChanged: function (provider, row, field) {
        if (this.$_needFilter() || this.$_needSort() || this._paging) {
            this.$_buildItems();
        } else {
            this.$_clearSummary();
        }
        this._checkableTag && this._checkableTag.updateRow(this._rows[row]);
        this._rows[row] && this._fireItemUpdated(this._rows[row]);
    },
    onDataProviderRowMoving: function (provider, row, newRow) {
        return true;
    },
    onDataProviderRowMoved: function (provider, row, newRow) {
        var rows = this._rows;
        var len = rows.length;
        row = Math.min(row, newRow);
        for (var i = row; i < len; i++) {
            rows[i]._dataRow = i;
        }
        if (this._sorted || this._paging || this._hideDeleted) {
            this.$_buildItems();
            this._resetItemIndicies(0);
        }
        this._fireRefresh();
    },
    onDataProviderRowsMoving: function (provider, row, count, newRow) {
        return true;
    },
    onDataProviderRowsMoved: function (provider, row, count, newRow) {
        this.refreshItems();
    },
    onDataProviderStateChanged: function (provider, row) {
        if (this._hideDeleted) {
            var item = this._rows[row];
            if (RowState.isDeleted(item.rowState())) {
                 if (this.$_needFilter() || this.$_needSort() || this._paging) {
                     this.$_buildItems();
                 } else {
                     this.$_buildItems(true, true);
                 }
                 this._fireRefresh();
            }
        }
        this._checkableTag && this._checkableTag.updateRow(this._rows[row]);
        this._fireRowStateChanged(this._rows[row]);
    },
    onDataProviderStatesChanged: function (provider, rows) {
        if (this._hideDeleted) {
            var deleted = false;
            var i, cnt, r;
            for (i = 0, cnt = rows.length; i < cnt; i++) {
                r = rows[i];
                r = this._rows[r];
                if (RowState.isDeleted(r.rowState())) {
                    deleted = true;
                    break;
                }
            }
            if (deleted) {
                if (this.$_needFilter() || this.$_needSort() || this._paging) {
                    this.$_buildItems();
                } else {
                    this.$_buildItems(true, true);
                }
                this._fireRefresh();
            }
        }
        this._checkableTag && this._checkableTag.changeStates(rows);
        this._fireRowStatesChanged(this.getItemsByRows(rows));
    },
    onDataProviderRestoreRows: function(provider, rows) {
        if (this.$_needFilter() || this.$_needSort() || this._paging) {
            this.$_buildItems();
        } else {
            this.$_clearSummary();
        }
        this._checkableTag && this._checkableTag.changeStates(rows);
        this._fireRowStatesChanged(this.getItemsByRows(rows));
        this._fireRefresh();
    },
    onDataProviderStatesCleared: function (provider) {
        this._fireRowStatesCleared();
    }
});