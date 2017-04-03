var /* @abstract */ ProxyItemProvider = defineClass("ProxyItemProvider", ItemProvider, {
	init: function (source, indexing) {
		this._super(indexing);
		this._initialize();
		this.setSource(source);
	},
    source: null,
	setSource: function (value) {
		if (value != this._source) {
			if (this._source) {
				this._source.removeListener(this);
			}
			this._clearItems();
			this._source = value;
			if (this._source) {
				this._populateItems();
				this._source.addListener(this);
			}
		}
	},
	dataSource: function () {
		return this._source ? this._source.dataSource() : null;
	},
	fixedCount: function () {
		return this._source ? this._source.fixedCount() : 0;
	},
	maxItemCount: function () {
		return this._source ? this._source.maxItemCount() : 0;
	},
	setMaxItemCount: function (value) {
		if (this._source) {
			this._source.setMaxItemCount(value);
		}
	},
	setFixed: function (count, sorting, filtering) {
		if (this._source) {
			this._source.setFixed(count, sorting, filtering);
		}
	},
	getIndexOfRow: function (dataRow) {
		return this._source ? this._source.getIndexOfRow(dataRow) : -1;
	},
	getItemOfRow: function (dataRow) {
		return this._source ? this._source.getItemOfRow(dataRow) : null;
	},
	refreshItems: function () {
		this._source &&	this._source.refreshItems();
	},
	_clearDisplayLevels: function () {
		this._source && this._source._clearDisplayLevels();
	},
	setCellStyle: function (row, field, style) {
		this._source && this._source.setCellStyle(row, field, style);
	},
	removeCellStyle: function (style) {
		this._source && this._source.removeCellStyle(style);
	},
	clearCellStyles: function () {
		this._source && this._source.clearCellStyles();
	},
	_initialize: function () {
	},
	_clearItems: function () {
	},
	_populateItems: function () {
		this._resetItemIndicies(0);
	},
	onItemProviderReset: function (itemProvider) {
		this._populateItems();
		this._fireReset();
	},
	onItemProviderRefresh: function (itemProvider) {
		this._populateItems();
		this._fireRefresh();
	},
	onItemProviderRefreshClient: function (itemProvider) {
		this._fireRefreshClient();
	},
	onItemProviderItemInserted: function (itemProvider, item) {
		this._resetItemIndicies(0);
		this._fireItemInserted(item);
	},
	onItemProviderItemDeleted: function (itemProvider, item) {
		this._resetItemIndicies(0);
		this._fireItemDeleted(item);
	},
	onItemProviderItemUpdated: function (itemProvider, item) {
		this._resetItemIndicies(0);
		this._fireItemUpdated(item);
	},
	onItemProviderCheckableChanged: function (itemProvider, item) {
		this._fireCheckableChanged(item);
	},
	onItemProviderItemChecked: function (itemProvider, item) {
		this._fireItemChecked(item);
	},
	onItemProviderItemsChecked: function (itemProvider, items, checked) {
		this._fireItemsChecked(items, checked);
	},
	onItemProviderItemAllChecked: function (itemProvider, checked) {
		this._fireItemAllChecked(checked);
	},
	onItemProviderRowStateChanged: function (itemProvider, item) {
		this._fireRowStateChanged(item);
	},
	onItemProviderRowStatesChanged: function (itemProvider, items) {
		this._fireRowStatesChanged(items);
	},
	onItemProviderRowStatesCleared: function (itemProvider) {
		this._fireRowStatesCleared();
	},
	onItemProviderFilterAdded: function (provider, field, criteria) {
	},
	onItemProviderFilterRemoved: function (provider, field, filter) {
	},
	onItemProviderFilterCleared: function (provider, field) {
	},
	onItemProviderFilterAllCleared: function (provider) {
	},
	onItemProviderFiltered: function (provider) {
	},
	onItemProviderSort: function (provider, fields, directions) {
	},	
	onItemProviderSorted: function (provider) {
	}
});
