var GridHtmlExporter = defineClass("GridHtmlExporter", null, {
    init: function () {
        this._super();
        this._runStyles = new VisualStyles();
        this._seriesCell = new SeriesCell();
    },
    "export": function (grid, options/*GridExportOptions*/) {
        if (!grid) return;
        options = options instanceof GridExportOptions ? options : new GridExportOptions(options);
        var context = {
            grid: grid,
            options: options,
            indicator: options.isIndicatorVisible(grid) ? grid.indicator() : null,
            checkBar: options.isCheckBarVisible(grid) ? grid.checkBar() : null,
            checkMark: options.checkMark(),
            header: options.isHeaderVisible(grid) ? grid.header() : null,
            headerSummary: options.isHeaderSummaryVisible(grid) ? grid.header().summary() : null,
            footer: options.isFooterVisible(grid) ? grid.footer() : null,
            colArr: new ColumnArray(grid, options.isLinear()),
            allItems: null,
            indicatorHead: grid.indicator().headText() || "",
            indicatorFoot: grid.indicator().footText() || "",
            checkBarHead: grid.checkBar().headText() || "",
            checkBarFoot: grid.checkBar().footText() || "",
            indicatorSummary: grid.indicator().summaryText(),
            rowGrouped: false,
            rowLevels: 0,
            indents: 0,
            indentWidth: 3,
            columnMerged: false,
            mergeHeads: {},
            showProgress: options.isShowProgress(),
            progressMessage:options.progressMessage() || "Exporting...",
            progressMax: 0,
            prepareProgress: 10,
            setProgress: function (pos) { grid.setExportProgress(this.progressMax, pos+this.prepareProgress, this.progressMessage); }
        };
        context.sheet = new HtmlSheet();
        var t = getTimer();
        var self = this;
        var finalize = function () {
            var result;
            var html = context.sheet.serialize();
            var done = options.done();
            done && done(html);
        }
        
        if (grid instanceof TreeView) {
            throw new Error("Tree는 Html Export기능이 지원되지 않습니다.");
            
            if (options.isAllItems()) {
                context.allItems = grid.getAllItems();
            }
            this.$_buildTreeDocument(context, finalize);
        } else {
            if (grid.isRowGrouped()) {
                throw new Error("RowGrouping상태에서는 Html Export기능이 지원되지 않습니다.");
            }
            if (options.isAllItems() && grid.isRowGrouped()) {
                context.allItems = grid.getAllItems();
                var fixed = grid.layoutManager().fixedItemCount();
                if ( fixed > 0) {
                    for (var i=0; i<fixed; i++) {
                        context.allItems.splice(i,0,grid.getItem(i));
                    }
                }
            }
            this.$_buildDocument(context, finalize);
        }

        var t1 = getTimer();
        t = t1 - t;
        _trace("H T M L: " + "buildBook " + t);
    },
    $_buildDocument: function (ctx, done) {
        var t = getTimer();

        var grid = ctx.grid;
        ctx.rowGrouped = grid.isRowGrouped();
        ctx.mergedGrouped = grid.isMergedRowGrouped()
        if (ctx.rowGrouped && !grid.rowGroup().isMergeMode()) {
            ctx.rowLevels += grid.rowGroupLevels();
        }
        ctx.start = 0;
        var allItems = ctx.allItems;
        var rows = allItems ? allItems.length : grid.itemCount();
        if (!grid.isRowGrouped()) {
            ctx.start = ctx.options.start() > 0 ? ctx.options.start() : 0;
            var count = ctx.options.count();
            rows = count > 0 ? (ctx.start+count > rows ? rows - ctx.start : count) : rows - ctx.start;
        }
        ctx.last = ctx.start + rows;

        this.$_prepare(ctx);
        //this.$_buildColumns(ctx);

        this.$_buildDocumentTitle(ctx);
        ctx.header && this.$_buildHeader(ctx);
        ctx.headerSummary && this.$_buildHeaderSummary(ctx);

        if (ctx.showProgress) {
            grid.beginExportProgress(ctx.progressMessage);
            ctx.progressMax = rows + ctx.prepareProgress;
            ctx.progressStep = Math.max(_int(rows/10),1);
            ctx.setProgress(0);
            var self = this;
            this.$_buildItemsAsync(ctx, function () {
                r = ctx.row;
                if (ctx.footer) self.$_buildFooter(ctx);
                self.$_buildDocumentTail(ctx);
                grid.endExportProgress();
                done && done();
            });
        } else {
            this.$_buildItems(ctx);
            if (ctx.footer) this.$_buildFooter(ctx);
            this.$_buildDocumentTail(ctx);
            done && done();
        }
    },
    $_buildTreeDocument: function (ctx, done) {
        var grid = ctx.grid;
        ctx.rowLevels = ctx.grid.getLevels();
        
        this.$_prepare(ctx);

        ctx.start = 0;
        ctx.last = ctx.allItems ? ctx.allItems.length : grid.itemCount();

        this.$_buildDocumentTitle(ctx);
        ctx.header && this.$_buildTreeHeader(ctx);
        ctx.headerSummary && this.$_buildTreeHeaderSummary(ctx);
        if (ctx.showProgress) {
            grid.beginExportProgress(ctx.progressMessage);
            ctx.progressMax = ctx.last + ctx.prepareProgress;
            ctx.progressStep = Math.max(_int(ctx.last/10),1);
            ctx.setProgress(0);
            var self = this;
            this.$_buildTreeItemsAsync(ctx, function () {
                r = ctx.row;
                if (ctx.footer) r += self.$_buildTreeFooter(ctx);
                r += self.$_buildDocumentTail(ctx);
                grid.endExportProgress();
                done && done();
            });
        } else {
            r += this.$_buildTreeItems(ctx);
            if (ctx.footer) r += this.$_buildTreeFooter(ctx);
            r += this.$_buildDocumentTail(ctx);
            done && done();
        }
    },
    $_prepare: function (ctx) {
        var grid = ctx.grid;
        var fixed = grid.layoutManager().fixedItemCount();
        var cols = grid.visibleColumnCount();
        var options = ctx.options;
        for (var c = 0; c < cols; c++) {
            var column = grid.getVisibleColumn(c);
            if (!options.isSeparateRows()) {
                var merges/*ColumnMergeManager*/ = column.stateFor(ColumnMergeManager.MERGE_ROOMS);
                if (merges) {
                    merges.refresh(fixed, grid.itemCount() - 1);
                    ctx.columnMerged = true;
                }
            }
        }
    },
    /*
    $_buildColumns: function (ctx) {
        var sheet = ctx.sheet;
        var colArr = ctx.colArr;
        var cols = colArr.colCount();
        var rows = colArr.dataRowCount();
        var heads = colArr.headerRowCount();
        var r, c;
        sheet.setHeadRows(heads);
        for (r = 0; r < heads; r++) {
            if (ctx.indicator && r == 0) {
                sheet.addHeadColumn(r, ctx.indicator.realWidth());
            } 
            for (c = 0; c < cols; c++) {
                var item = colArr.getHeader(r, c);
                if (item.colIndex == 0 && item.rowIndex == 0) {
                    var column = item.column;
                    sheet.addHeadColumn(r, column.displayWidth());
                }
            }
        }
        sheet.setBodyRows(rows);
        for (r = 0; r < rows; r++) {
            if (ctx.indicator && r == 0) {
                sheet.addColumn(r, ctx.indicator.realWidth());
            } 
            for (c = 0; c < cols; c++) {
                var item = colArr.getItem(rows-1, c);
                if (item.colIndex == 0 && item.rowIndex == 0) {
                    var column = item.column;
                    sheet.addColumn(r, column.displayWidth());
                }
            }
        }
    },
    */
    $_buildDocumentTitle: function(ctx) {
    },
    $_buildDocumentTail: function(ctx) {
    },
    $_buildHeader: function (ctx) {
        var i, row, c; 
        var grid = ctx.grid;
        var sheet = ctx.sheet;
        var colArr = ctx.colArr;
        var cols = colArr.colCount();
        var rows = colArr.headerRowCount();
        var indents = ctx.indents;

        for (i = 0; i < rows; i++) {
            sheet.addHeadRow();
            if (ctx.indicator && i == 0) {
                sheet.addHeader(ctx.indicator, ctx.indicatorHead, ctx.indicator.headStyles(), rows, 1);
            }
            if (ctx.checkBar && i == 0) {
                sheet.addHeader(ctx.checkBar, ctx.checkBarHead, ctx.checkBar.headStyles(), rows, 1);
            }

            for (c = 0; c < cols; c++) {
                var item = colArr.getHeader(i, c);
                var column = item.column;
                if (item.colIndex == 0 && item.rowIndex == 0) {
                    w = column.displayWidth();
                    var header = column.header();
                    sheet.addHeader(column, header.displayText(), header.styles(), item.rowSpan, item.colSpan);
                }
            }
        }
    },
    $_buildFooter: function (ctx) {
        function addFooterCell(column, cell, styles, rowspan, colspan) {
            var v = cell.value();
            var v1 = Number(v);
            if (!isNaN(v1) && styles.numberFormat()) {
                sheet.addFooterNumber(column, v1, styles, rowspan, colspan);
            } else if (v) {
                sheet.addFooterText(column, v, styles, rowspan, colspan);
            } else {
                sheet.addFooterText(column, cell.displayText(), styles, rowspan, colspan);
            }

        }
        var i, row, c; 
        var grid = ctx.grid;
        var sheet = ctx.sheet;
        var colArr = ctx.colArr;
        var cols = colArr.colCount();
        var rows = colArr.dataRowCount();
        var indents = ctx.indents;
        var mergeManager = grid.footerMergeManager();
        var lm = grid.layoutManager();
        for (i = 0; i < rows; i++) {
            sheet.addFootRow();
            if (ctx.indicator && i == 0) {
                sheet.addFooterText(ctx.indicator, ctx.indicatorFoot, ctx.indicator.footStyles(), rows, 1);
            }
            if (ctx.checkBar && i == 0) {
                sheet.addFooterText(ctx.checkBar, ctx.checkBarFoot, ctx.checkBar.footStyles(), rows, 1);
            }
            
            for (c = 0; c < cols; c++) {
                var item = colArr.getItem(i, c);
                var column = item.column;
                
                if (item.colIndex == 0 && item.rowIndex == 0) {
                    var colIndex = column.displayIndex();
                    var room = null;
                    if (column.parent() instanceof RootColumn) {
                        room = mergeManager.findRoom(colIndex);
                        if (room && colIndex == room.start() && colIndex != room.base()) {
                            colItem = colArr.getItem(i, room.base()+colIndex-c);
                            column = colItem.column; 
                        }
                    }
                    var cell = grid.footer().getCell(grid.getIndex(-1, column));
                    var f = column.footer();

                    if (room) {
                        if (room.start() == colIndex) {
                            var sr = lm.getColumnBounds(room.start());
                            var er = lm.getColumnBounds(room.last());
                            addFooterCell(column, cell, f.styles(), item.rowSpan, room.count());
                        }
                    } else {
                        addFooterCell(column, cell, f.styles(), item.rowSpan, item.colSpan);
                    }
                }
            }
        }
    },
    $_buildHeaderSummary: function (ctx) {
    },
    $_buildValueCell: function (ctx, item, column, rowspan, colspan) {
        var grid = ctx.grid;
        var body = grid.body();
        var options = ctx.options;
        var sheet = ctx.sheet;
        var index = CellIndex.temp(grid, item.index(), column);

        var cell = body.getCell(index);
        var cellStyle = cell._styles;

        if (column._blankWhenExport) {
            return sheet.addBlank(column, cellStyle, rowspan, colspan, width, height);
        } else if (column instanceof DataColumn) {
            var fld = column.dataIndex();
            var field = grid.dataSource().getField(fld);
            var v = item.getData(fld);
            if (field) {
                switch (field.dataType()) {
                    case "number":
                        if (isNaN(v)) {
                            return sheet.addText(column, column.nanText(), cellStyle, rowspan, colspan);
                        } else if (cellStyle.numberFormat()) {
                            return sheet.addNumber(column, v, cellStyle, rowspan, colspan);
                        } else if (item.isVisible()) {
                            return sheet.addText(column, cell.displayText(), cellStyle, rowspan, colspan);
                        } else {
                            return sheet.addNumber(column, v, cellStyle, rowspan, colspan);
                        }
                    case "datetime":
                    case "date":
                        if (v && v instanceof Date) {
                            return sheet.addDate(column, v, cellStyle, rowspan, colspan);
                        } else if (item.isVisible()) {
                            return sheet.addText(column, cell.displayText(), cellStyle, rowspan, colspan);
                        } else {
                            return sheet.addText(column, "", cellStyle, rowspan, colspan);
                        }
                    case "boolean":
                        if (typeof v == "boolean" && cellStyle.booleanFormat()) {
                            return sheet.addBool(column, v, cellStyle, rowspan, colspan);
                        } else if (item.isVisible()) {
                            return sheet.addText(column, cell.displayText(), cellStyle, rowspan, colspan);
                        } else {
                            return sheet.addBool(column, v, cellStyle, rowspan, colspan);
                        }
                    default:  
                        if (options._lookupDisplay && (column.labelField() || column.isLookupDisplay())) {
                            v = cell.getTextFromItem(item);
                        } else if (v) {
                            if (options.isCheckNumber()) {
                                var v1 = Number(v);
                                if (!isNaN(v1)) {
                                    return sheet.addNumber(v1, cellStyle, rowspan, colspan, width, height);
                                }
                            } else {
                                var exp, rep;
                                if ((exp = column.getDisplayRegExp()) && (rep = column.displayReplace())) {
                                    v = v.replace(exp, rep);
                                    return sheet.addText(column, v, cellStyle, rowspan, colspan, false);
                                }
                            }
                        }
                        if (item.isVisible()) {
                            return sheet.addText(column, cell.displayText(), cellStyle, rowspan, colspan);
                        } else { 
                            return sheet.addText(column, v, cellStyle, rowspan, colspan);
                        }
                }
            } else {
                return sheet.addBlank(column, cellStylet, rowspan, colspan);
            }
        } else if (column instanceof SeriesColumn) {
            this._seriesCell.setIndex(index);
            var vals = this._seriesCell.value();
            if (vals) {
                var s = SeriesCell.getText(vals);
                return sheet.addText(column, s, cellStyle, rowspan, colspan);
            } else {
                return sheet.addBlank(column, cellStyle, rowspan, colspan);
            }
        }
    },
    $_buildRow: function (ctx, item, no) {
        var grid = ctx.grid;
        var body = grid.body();
        var sheet = ctx.sheet;
        var colArr = ctx.colArr;
        var rows = colArr.dataRowCount();
        var cols = colArr.colCount();
        var groupBarStyles = ctx.rowGroupBarStyles;
        var lm = grid.layoutManager();
        var columnMerged = ctx.columnMerged;
        var mergeHeads = ctx.mergeHeads;
        var rowGroup = grid.rowGroup();
        var indents = ctx.indents;
        var level = item.level();
        var row, col;
        for (var r = 0; r < rows; r++) {
            row = sheet.addBodyRow();

            if (ctx.indicator && r == 0) {
                w = ctx.indicator.realWidth();
                sheet.addText(ctx.indicator, no+"", ctx.indicator.styles(), rows, 1);
            }
            if (ctx.checkBar && r == 0) {
                w = ctx.checkBar.width();
                sheet.addText(ctx.checkBar, item.isChecked() ? ctx.checkMark : "", ctx.checkBar.styles(), rows, 1);
            }

            for (c = 0; c < cols; c++) {
                var colItem = colArr.getItem(r, c);
                if (colItem.colIndex == 0 && colItem.rowIndex == 0) {
                    var column = colItem.column;
                    var index = CellIndex.temp(grid, item.index(), column);
                    var rowspan = colItem.rowSpan;
                    var colspan = colItem.colSpan;
                    var celled = false;
                    w = column.displayWidth();
                    if (columnMerged) {
                        var index = CellIndex.temp(grid, item.index(), column);
                        var room = lm.getMergedCell(index);
                        if (room) {
                            if ((room.isHead(index) && r == 0) || (ctx.start > 0 && item.index() == ctx.start)) {
                                var tail = ctx.last > 0 ? Math.min(room.tail(), ctx.last) : room.tail();
                                rowspan = rowspan * (tail - item.index() + 1);
                                this.$_buildValueCell(ctx, item, column, rowspan, colspan);
                            }
                            celled = true;
                        }
                    }

                    if (!celled) {
                        this.$_buildValueCell(ctx, item, column, rowspan, colspan);
                    }
                }
            }
        }
    },
    $_buildGroupItem: function (ctx, item, no) {
    },
    $_buildGroupFooter: function (ctx, item, no) {
    },
    $_buildMergedGroupHeader: function (ctx, item, no) {
    },
    $_buildMergedGroupFooter: function (ctx, item, no) {
    },
    $_buildItems: function (ctx) {
        var grid = ctx.grid;
        var showRow = ctx.options.isIndicatorDataRow(grid);
        var allItems = ctx.allItems;
        var zeroBase = ctx.indicator.isZeroBase();
        for (var i = ctx.start; i < ctx.last; i++) {
            var item = allItems ? allItems[i] : grid.getItem(i);
            var no = zeroBase ? i : i + 1;
            if (item instanceof GridRow) {
                this.$_buildRow(ctx, item, showRow ? item.dataRow() : no);
            } else if (item instanceof GroupItemImpl) {
                this.$_buildGroupItem(ctx, item, no);
            } else if (item instanceof MergedGroupHeader) {
                this.$_buildMergedGroupHeader(ctx, item, no);
            } else if (item instanceof MergedGroupFooter) {
                this.$_buildMergedGroupFooter(ctx, item, no);
            } else if (item instanceof GroupFooter) {
                this.$_buildGroupFooter(ctx, item, no);
            } else {
                throw "Unkown item type";
            }
        }
    },
    $_buildItemsAsync: function (ctx, done) {
        var showRow = ctx.options.isIndicatorDataRow(ctx.grid);
        try {
            this.$_buildItemAsync(ctx, showRow, ctx.start, done);
        } catch (ex) {
            ctx.grid.endExportProgress();
            throw ex;
        }
    },
    $_buildItemAsync: function (ctx, showRow, index, done) {
        var stepLast = index + Math.min(ctx.progressStep, ctx.last-index);
        var zeroBase = ctx.indicator.isZeroBase();
        for (var i = index; i < stepLast; i++) {
            var item = ctx.allItems ? ctx.allItems[i] : ctx.grid.getItem(i);
            var no = zeroBase ? i : i + 1;
            if (item instanceof GridRow) {
                this.$_buildRow(ctx, item, showRow ? item.dataRow() : no);
            } else if (item instanceof GroupItemImpl) {
                this.$_buildGroupItem(ctx, item, no);
            } else if (item instanceof MergedGroupHeader) {
                this.$_buildMergedGroupHeader(ctx, item, no);
            } else if (item instanceof MergedGroupFooter) {
                this.$_buildMergedGroupFooter(ctx, item, no);
            } else if (item instanceof GroupFooter) {
                this.$_buildGroupFooter(ctx, item, no);
            } else {
                throw "Unkown item type";
            }
        }
        ctx.setProgress(stepLast-ctx.start);
        index = stepLast;
        if (index >= ctx.last) {
            done();
        } else {
            var self = this;
            setTimeout(function() {
                self.$_buildItemAsync(ctx, showRow, index, done);
            },0);
        }
    },
    $_buildTreeHeader: function (ctx) {
    },
    $_buildTreeHeaderSummary: function (ctx) {
    },
    $_buildTreeFooter: function (ctx) {
    },
    $_buildTreeItems: function (ctx) {
        var grid = ctx.grid;
        var showRow = ctx.options.isIndicatorDataRow(grid);
        var zeroBase = ctx.indicator.isZeroBase();
        for (var i = 0; i < ctx.last; i++) {
            var item = ctx.allItems ? ctx.allItems[i] : grid.getItem(i);
            if (item instanceof TreeItem) {
                row += this.$_buildTreeItem(ctx, item, showRow ? item.dataRow() : zeroBase ? i : i + 1, row, startCol);
            } else {
                throw "Unknown tree item type";
            }
        }
    },
    $_buildTreeItemsAsync: function (ctx, done) {
        var showRow = ctx.options.isIndicatorDataRow(ctx.grid);
        this.$_buildTreeItemAsync(ctx, showRow, 0, done);
    },
    $_buildTreeItemAsync: function (ctx, showRow, index, done) {
        var item = ctx.allItems ? ctx.allItems[index] : ctx.grid.getItem(index);
        var stepLast = index + Math.min(ctx.progressStep, ctx.last-index);
        var zeroBase = ctx.indicator.isZeroBase();
        var indexOffset = ctx.indicator.indexOffset();
        for (var i = index; i < stepLast; i++) { 
            if (item instanceof TreeItem) {
                row += this.$_buildTreeItem(ctx, item, showRow ? item.dataRow() : zeroBase ? i : i + 1);
            } else {
                throw "Unknown tree item type";
            }
        }

        ctx.row = row;
        ctx.setProgress(stepLast-ctx.start);
        index = stepLast;
        if (index >= ctx.last) {
            done();
        } else {
            var self = this;
            setTimeout(function() {
                self.$_buildTreeItemAsync(ctx, row, startCol, showRow, index, done);
            },0);
        }
    },
    $_buildTreeItem: function (ctx, item, no) {
    }
});