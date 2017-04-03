var GridExcelExporter = defineClass("GridExcelExporter", null, {
    init: function () {
        this._super();
        this._runStyles = new VisualStyles();
        this._seriesCell = new SeriesCell();
    },
    /*
    exportZip: function (grid, options) {
        if (!grid) return;
        options = options instanceof GridExportOptions ? options : new GridExportOptions(options);
        var context = {
            grid: grid,
            book: new ExcelWorkbook(),
            options: options,
            indicator: options.isIndicatorVisible(grid) ? grid.indicator() : null,
            header: options.isHeaderVisible(grid) ? grid.header() : null,
            footer: options.isFooterVisible(grid) ? grid.footer() : null,
            colArr: new ColumnArray(grid, options.isLinear()),
            columnStyles: {},
            columnWrapStyles: {},
            allItems: null,
            indicatorHead: "No",
            indicatorFoot: "",
            rowGrouped: false,
            rowLevels: 0,
            indents: 0,
            indentWidth: 3,
            indentHeadStyle: undefined,
            indentFootStyle: undefined,
            columnMerged: false,
            mergeHeads: {}
        };
        if (grid instanceof TreeView) {
            if (options.isAllItems()) {
                context.allItems = grid.getAllItems();
            }
            this.$_buildTreeBook(context);
        } else {
            if (options.isAllItems() && grid.isRowGrouped()) {
                context.allItems = grid.getAllItems();
            }
            this.$_buildBook(context);
        }
        var parts = context.book.createParts();
        var data = [];
        for (var p in parts) {
            data.push({key: p, body: parts[p]});
        }
        this.$_exportZip(data, options);
    },*/
    "export": function (grid, options/*GridExportOptions*/) {
        function save(owner) {
            var t1 = getTimer();
            t = t1 - t;
            _trace("E X C E L: " + "buildBook " + t);
            t = t1;
            var parts = context.book.createParts();
            t1 = getTimer();
            t = t1 - t;
            _trace("E X C E L: " + "createParts " + t);
            t = t1;
            var data = [];
            for (var p in parts) {
                data.push({key: p, body: parts[p]});
            }
            owner.$_export(data, options);
            t1 = getTimer();
            t = t1 - t;
            _trace("E X C E L: " + "zip " + t);
            t = t1;
            options._done && typeof options._done == "function" && options._done();
        }
        if (!grid) return;
        options = options instanceof GridExportOptions ? options : new GridExportOptions(options);
        var context = {
            grid: grid,
            book: new ExcelWorkbook(),
            options: options,
            indicator: options.isIndicatorVisible(grid) ? grid.indicator() : null,
            header: options.isHeaderVisible(grid) ? grid.header() : null,
            headerSummary: options.isHeaderSummaryVisible(grid) ? grid.header().summary() : null,
            footer: options.isFooterVisible(grid) ? grid.footer() : null,
            colArr: new ColumnArray(grid, options.isLinear()),
            numberFormatId: 0,
            textFormatId:49,  // 일반 텍스트.
            dateFormatId: 14, //22, // 14 는 날짜만
            columnStyles: {},
            columnWrapStyles: {},
            fixedStyles:undefined,
            fixedWrapStyles:undefined,
            allItems: null,
            indicatorHead: grid.indicator().headText() || "No",
            indicatorFoot: grid.indicator().footText() || "",
            indicatorSummary: grid.indicator().summaryText(),
            compatibility: options.isCompatibility(),
            showLevelOutline: options.isShowLevelOutline(),
            rowGrouped: false,
            rowLevels: 0,
            indents: 0,
            indentWidth: 3,
            indicatorStyle: undefined,
            indentHeadStyle: undefined,
            indentHeadSummaryStyle: undefined,
            indentFootStyle: undefined,
            columnMerged: false,
            mergeHeads: {},
            showProgress: options.isShowProgress(),
            progressMessage:options.progressMessage() || "Exporting...",
            progressMax: 0,
            prepareProgress: 10,
            setProgress: function (pos) { grid.setExportProgress(this.progressMax, pos+this.prepareProgress, this.progressMessage); }
        };
        var t = getTimer();
        var self = this;
        if (grid instanceof TreeView) {
            if (options.isAllItems()) {
                context.allItems = grid.getAllItems();
            }
            this.$_buildTreeBook(context, function () {
                save(self);
            });
        } else {
            if (options.isAllItems() && grid.isRowGrouped()) {
                context.allItems = grid.getAllItems();
                var fixed = grid.layoutManager().fixedItemCount();
                if ( fixed> 0) {
                    for (var i=0; i<fixed; i++) {
                        context.allItems.splice(i,0,grid.getItem(i));
                    }
                }
            }
            this.$_buildBook(context, function () {
                save(self);
            });            
            /*
            grid.beginUpdate();
            var isRowGrouped = grid.isRowGrouped();
            var isAllItems = options.isAllItems();
            try {
                if (isAllItems && isRowGrouped) {
                    context.allItems = grid.getAllItems();
                    var expandMap = {};
                    var groupProvider = grid._items._groupedProvider;
                    var rootItem = groupProvider && groupProvider._rootItem;
                    if (groupProvider.isGrouped()) {
                        groupProvider._saveExpand(rootItem, expandMap);
                        for (var i = 0, cnt=rootItem._children.length; i < cnt ; i++) {
                            rootItem._children[i].setExpanded(true,true,true);
                        }
                    }
                    var fixed = grid.layoutManager().fixedItemCount();
                    if ( fixed> 0) {
                        for (var i=0; i<fixed; i++) {
                            context.allItems.splice(i,0,grid.getItem(i));
                        }
                    }
                }
                this.$_buildBook(context, function () {
                    if (isAllItems && isRowGrouped) {
                        groupProvider._restoreExpand2(rootItem, expandMap);
                    }
                    save(self);
                });
            } finally {
                grid.endUpdate();
            }
            */
        }
    },
    $_buildBook: function (ctx, done) {
        var grid = ctx.grid;
        ctx.rowGrouped = grid.isRowGrouped();
        ctx.mergedGrouped = grid.isMergedRowGrouped()
        if (ctx.rowGrouped && !grid.rowGroup().isMergeMode()) {
            ctx.rowLevels = grid.rowGroupLevels();
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

        this.$_prepareFormats(ctx);
        this.$_prepareStyles(ctx);
        this.$_buildColumns(ctx);

        var r = 0;
        var c = 0;

        r += this.$_buildDocumentTitle(ctx, r, c);
        r += ctx.header ? this.$_buildHeader(ctx, r, c) : 0;
        r += ctx.headerSummary ? this.$_buildHeaderSummary(ctx, r, c) : 0;

        if (ctx.showProgress) {
            grid.beginExportProgress(ctx.progressMessage);
            ctx.progressMax = rows + ctx.prepareProgress;
            ctx.progressStep = Math.max(_int(rows/10),1);
            ctx.setProgress(0);
            var self = this;
            r += this.$_buildItemsAsync(ctx, r, c, function () {
                r = ctx.row;
                if (ctx.footer) r += self.$_buildFooter(ctx, r, c);
                r += self.$_buildDocumentTail(ctx, r, c);
                grid.endExportProgress();
                done();
            });
        } else {
            r += this.$_buildItems(ctx, r, c);
            if (ctx.footer) r += this.$_buildFooter(ctx, r, c);
            r += this.$_buildDocumentTail(ctx, r, c);
            done();
        }
    },
    $_buildTreeBook: function (ctx, done) {
        var grid = ctx.grid;
        ctx.rowLevels = ctx.grid.getLevels();
        
        this.$_prepareFormats(ctx);
        this.$_prepareStyles(ctx);
        this.$_buildColumns(ctx);

        ctx.start = 0;
        ctx.last = ctx.allItems ? ctx.allItems.length : grid.itemCount();

        var r = 0;
        var c = 0;
        r += this.$_buildDocumentTitle(ctx, r, c);
        r += ctx.header ? this.$_buildTreeHeader(ctx, r, c) : 0;
        r += ctx.headerSummary ? this.$_buildTreeHeaderSummary(ctx, r, c) : 0;
        if (ctx.showProgress) {
            grid.beginExportProgress(ctx.progressMessage);
            ctx.progressMax = ctx.last + ctx.prepareProgress;
            ctx.progressStep = Math.max(_int(ctx.last/10),1);
            ctx.setProgress(0);
            var self = this;
            r += this.$_buildTreeItemsAsync(ctx, r, c, function () {
                r = ctx.row;
                if (ctx.footer) r += self.$_buildTreeFooter(ctx, r, c);
                r += self.$_buildDocumentTail(ctx, r, c);
                grid.endExportProgress();
                done();
            });
        } else {
            r += this.$_buildTreeItems(ctx, r, c);
            if (ctx.footer) r += this.$_buildTreeFooter(ctx, r, c);
            r += this.$_buildDocumentTail(ctx, r, c);
            done();
        }
    },
    $_prepareFormats: function (ctx) {
        var options = ctx.options;
        var book = ctx.book;
        var f = options.numberFormat();
        if (typeof f == "number" || _int(f) > 0)  {
            ctx.numberFormatId = _int(f);
        } else if (f) {
            ctx.numberFormatId = book.addNumberFormat(ExcelFormatConverter.convertNumberFormat(f));
        }
        f = options.datetimeFormat();
        if (typeof f == "number" || _int(f) > 0)  {
            ctx.dateFormatId = _int(f);
        } else if (f) {
            ctx.dateFormatId = book.addNumberFormat(f);
        }
    },
    $_createStyles: function (book, styles/*VisualStyles*/, borders, fonts,fills) {
        var numFmt;
        var formatCode;
        var numberFormat = styles.numberFormat();
        var datetimeFormat = styles.datetimeFormat();
        if (numberFormat && numberFormat.length > 0) {
            formatCode = ExcelFormatConverter.convertNumberFormat(numberFormat);
        } else if (datetimeFormat) {
            formatCode = ExcelFormatConverter.convertDateFormat(datetimeFormat);
        }
        
        if (formatCode) {
            var prefix = styles.prefix();
            if (prefix) {
                formatCode = "\"" + prefix + "\"" + formatCode;
            }
            var suffix = styles.suffix();
            if (suffix) {
                formatCode = formatCode + "\"" + suffix + "\"";          
            }
            var numFmtId = book.addNumberFormat(formatCode);
        }

        borders = arguments.length > 2 ? borders : true;
        fonts = arguments.length > 3 ? fonts : true;
        var fill;
        if (fills) {
            fill = new ExcelFill();
            var background = styles.background();
            if (background instanceof LinearGradient) {
                fill.gradient = "linear";
                fill.color = background._colors[0].toColorHex();
                fill.color2 = background._colors[1].toColorHex();
                fill.tint = 1 - background._colors[0]._a;
                switch (background._angle) {
                    case 90:
                        fill.degree = "90";
                        break;
                    case 45:
                        fill.degree = "45";
                        break;
                    default:
                        fill.degree = "0";
                        break;
                }
            } else {
                fill.patternType = "solid";
                fill.color = background._color.toColorHex();
                fill.tint = 1 - background._color._a;
            }
        }
        book.addFill(fill);
        var border = null;
        if (borders) {
            border = new ExcelBorder();
            border.right = styles.borderRight();
            border.bottom = styles.borderBottom();
            border.left = styles.borderLeft();
            border.top = styles.borderTop();
            book.addBorder(border);
        }
        var font = null;
        if (fonts) {
            font = new ExcelFont();
            font.name = styles.fontFamily();
            font.size = styles.fontSize() * 72 / 96;
            font.color = styles.foreground()._color.toColorHex();
            font.bold = styles.fontBold();
            font.italic = styles.fontItalic();
            book.addFont(font);
        }
        var es = new ExcelStyle();
        es.fill = fill;
        es.border = border;
        es.font = font;
        if (numFmtId)
            es.formatId = numFmtId;

        switch (styles.textAlignment()) {
            case Alignment.CENTER:
                es.horzAlign = ExcelStyle.ALIGN_CENTER;
                break;
            case Alignment.FAR:
                es.horzAlign = ExcelStyle.ALIGN_FAR;
                break;
            default:
                es.horzAlign = ExcelStyle.ALIGN_NEAR;
                break;
        }
        switch (styles.lineAlignment()) {
            case Alignment.CENTER:
                es.vertAlign = ExcelStyle.VALIGN_CENTER;
                break;
            case Alignment.FAR:
                es.vertAlign = ExcelStyle.VALIGN_FAR;
                break;
            default:
                es.vertAlign = ExcelStyle.VALIGN_NEAR;
                break;
        }
        return es;
    },
    $_addStyle: function (book, styles, borders, fonts, fills) {
        borders = arguments.length > 2 ? borders : true;
        fonts = arguments.length > 3 ? fonts : true;
        fills = arguments.length > 4 ? fills : true;
        var es = this.$_createStyles(book, styles, borders, fonts, fills);
        book.addStyle(es);
        return es;
    },
    $_prepareStyles: function (ctx) {
        function prepareColumn(es, column, ctx) {
            if (column instanceof DataColumn) {
                var fld = ds.getField(column.dataIndex());
                if (fld) {
                    var fmt = column.excelFormat();
                    if (typeof fmt == "number" || _int(fmt) > 0) {
                        es.formatId = fmt;
                    } else {
                        switch (fld.dataType()) {
                            case ValueType.TEXT:
                                es.formatId = fmt ? ctx.book.addNumberFormat(fmt) : es.formatId ? es.formatId : ctx.textFormatId;
                                break;
                            case ValueType.NUMBER:
                                es.formatId = fmt ? ctx.book.addNumberFormat(fmt) : es.formatId ? es.formatId : ctx.numberFormatId;
                                break;
                            case ValueType.DATETIME:
                                es.formatId = fmt ? ctx.book.addNumberFormat(fmt) : es.formatId ? es.formatId : ctx.dateFormatId;
                                break;
                        }
                    }
                }
            }
        }
        var colArr = ctx.colArr;
        var columnMerged = false;
        var cols = colArr.colCount();
        var columnStyles = ctx.columnStyles;
        var wrapStyles = ctx.columnWrapStyles;
        var grid = ctx.grid;
        var fixed = grid.layoutManager().fixedItemCount();
        var ds = grid.dataSource();
        var options = ctx.options;
        var book = ctx.book;
        for (var r = 0, rows = colArr.dataRowCount(); r < rows; r++) {
            for (var c = 0; c < cols; c++) {
                var item = colArr.getItem(r, c);
                if (item.colIndex == 0 && item.rowIndex == 0) {
                    var column = item.column;
                    if (column && !columnStyles[column.$_hash]) {
                        var runStyles = grid._body._runtimeStyles2;
                        runStyles.clearValues();
                        if (!grid._body._fixedIgnoreColumn || !column.isFixed()) {
                            runStyles.assign(column.styles());
                        }
                        if (column.isFixed() && !grid._body._fixedIgnoreColumn) {
                            runStyles.setParent(grid._body._fixedStyles, false);
                        }
                        runStyles._sysDefault = column.isFixed() ? grid._body._fixedStyles._sysDefault : grid._body._bodyStyles._sysDefault;                        
                        var es = this.$_addStyle(book, runStyles);
                        prepareColumn(es, column, ctx);
                        columnStyles[column.$_hash] = es;
                        es = this.$_addStyle(book, runStyles);
                        prepareColumn(es, column, ctx);
                        es.wrapText = true;
                        wrapStyles[column.$_hash] = es;
                        if (!options.isSeparateRows()) {
                            var merges/*ColumnMergeManager*/ = column.stateFor(ColumnMergeManager.MERGE_ROOMS);
                            if (merges) {
                                merges.refresh(fixed, grid.itemCount() - 1);
                                columnMerged = true;
                            }
                        }
                    }
                }
            }
        }
        ctx.columnMerged = columnMerged;
        ctx.fixedStyles = this.$_addStyle(book, grid.fixedOptions().styles());
        ctx.fixedWrapStyles = this.$_addStyle(book, grid.fixedOptions().styles());
        ctx.fixedWrapStyles.wrapText = true;
        if (grid instanceof GridView && grid.isRowGrouped()) {
            var rowGroup = grid.rowGroup();
            ctx.rowGroupHeadStyle = this.$_addStyle(book, rowGroup.headStyles());  // ??
            ctx.rowGroupFootStyle = this.$_addStyle(book, rowGroup.footStyles());  // 
            ctx.headerBarStyle = this.$_addStyle(book, rowGroup.headerBarStyles(), false);
            ctx.groupBarStyle = this.$_addStyle(book, rowGroup.headerStyles(), false);
            ctx.rowGroupHeaderStyle = this.$_addStyle(book, rowGroup.headerStyles(), false);
            ctx.rowGroupFooterStyle = this.$_addStyle(book, rowGroup.footerStyles(), true);
            ctx.rowGroupBarStyle = this.$_addStyle(book, rowGroup.barStyles());
            ctx.rowGroupHeaderStyles = [];
            ctx.rowGroupFooterStyles = [];
            ctx.rowGroupHeaderBarStyles = [];
            ctx.rowGroupFooterBarStyles = [];
            ctx.rowGroupBarStyles = [];
            var levels = rowGroup.levels();
            if (levels && _isArray(levels) && levels.length > 0) {
                for (var i = 0, cnt = ctx.rowLevels, levelCnt = levels.length-1; i < cnt; i++) {
                    // levels가 있는 경우 groupLevel보다 levels의 length가 작은 경우 levels의 마지막 style이 적용된다.
                    ctx.rowGroupHeaderStyles.push(this.$_addStyle(book, levels[Math.min(i, levelCnt)].headerStyles(), false));
                    ctx.rowGroupFooterStyles.push(this.$_addStyle(book, levels[Math.min(i, levelCnt)].footerStyles(), true));
                    ctx.rowGroupBarStyles.push(this.$_addStyle(book, levels[Math.min(i, levelCnt)].barStyles()));
                    ctx.rowGroupHeaderBarStyles.push(this.$_addStyle(book, levels[Math.min(i, levelCnt)].headerBarStyles(), false));
                    ctx.rowGroupFooterBarStyles.push(this.$_addStyle(book, levels[Math.min(i, levelCnt)].footerBarStyles(), true));
                }
            }
        }
    },
    $_buildColumns: function (ctx) {
        var i, es, ec, item, column;
        var grid = ctx.grid;
        var options = ctx.options;
        var book = ctx.book;
        var colArr = ctx.colArr;
        var index = 1; // 0이면 에러다.
        var columns = [];
        if (ctx.indicator) {
            es = ctx.indicatorStyle = this.$_addStyle(book, ctx.indicator.styles());
            ec = new ExcelColumn();
            ec.index = index++;
            ec.width = _round(grid.indicator().minWidth() / PIXELS_PER_CHAR);
            columns.push(ec);
        }
        if (options.isIndenting()) {
            if (ctx.rowGrouped && !ctx.mergedGrouped) {
                ctx.indents = ctx.rowLevels - (grid.rowGroup().expandedAdornments() === RowGroupAdornments.SUMMARY ? 0 : 1);
            } else if (grid instanceof TreeView) {
                ctx.indents = ctx.rowLevels - 1;
            }
            if (ctx.indents) {
                for (i = 0; i < ctx.indents; i++) {
                    ec = new ExcelColumn();
                    ec.width = Math.max(ctx.indentWidth, 1);
                    ec.index = index++;
                    columns.push(ec);
                }
                ctx.indentHeadStyle = this.$_addStyle(book, grid.header().styles());
                ctx.indentHeadSummaryStyle = this.$_addStyle(book, grid.header().summary().styles());
                ctx.indentFootStyle = this.$_addStyle(book, grid.footer().styles());
            }
        }
        /*
         if (grid instanceof TreeView) {
         for (i = 0; i < ctx.treeLevels; i++) {
         es = this.$_addStyle(book, grid.indicator().headStyles());
         ec = new ExcelColumn();
         ec.index = index++;
         ec.width = _round(21 / PIXELS_PER_CHAR);
         columns.push(ec);
         }
         } else {
         for (i = 0; i < ctx.groupLevels; i++) {
         es = this.$_addStyle(book, grid.rowGroup().headStyles());
         ec = new ExcelColumn();
         ec.index = index++;
         ec.width = _round(20 / PIXELS_PER_CHAR);
         columns.push(ec);
         }
         }
         */
        var cols = colArr.colCount();
        for (i = 0; i < cols; i++) {
            item = colArr.getItem(0, i);
            column = item.column;
            /*
            es = ctx.columnStyles[column.$_hash];
            if (!es) {
                es = this.$_addStyle(book, column.styles());
            }
            */
            ec = new ExcelColumn();
            ec.index = index++;
            ec.width = _round(column.groupWidth() / PIXELS_PER_CHAR);
            var ds = grid.dataSource();
            var fld = ds.getField(column.dataIndex());
            var fmt = column.excelFormat();
            if (fmt || options._applyDefaultColumnFormat) {
                es = this.$_addStyle(book, column.styles(), false,true,false);
                if (typeof fmt == "number" || _int(fmt) > 0)  {
                    es.formatId = fmt 
                } else {
                    switch( fld.dataType()) {
                        case ValueType.TEXT :
                            es.formatId = fmt ? ctx.book.addNumberFormat(fmt) : es.formatId ? es.formatId : ctx.textFormatId;
                            break;
                        case ValueType.NUMBER:
                            es.formatId = fmt ? ctx.book.addNumberFormat(fmt) : es.formatId ? es.formatId : ctx.numberFormatId;
                            break;
                        case ValueType.DATETIME:
                            es.formatId = fmt ? ctx.book.addNumberFormat(fmt) : es.formatId ? es.formatId : ctx.dateFormatId;
                            break;
                    }
                }
                ec.style = es;
            }
            columns.push(ec);
        }
        ctx.book.sheet().setColumns(columns);
    },
    $_buildDocumentTitle: function(ctx, startRow, col) {
        var grid = ctx.grid;
        var options = ctx.options;
        var book = ctx.book;
        var sheet = book.sheet();
        var es; 
        var colspan = sheet._columns.length;
        var title;
        var row = startRow;
        if ((title = options.documentTitle()) && title._visible) {
            row += title.spaceTop();
            var text = title.message();
            es = this.$_addStyle(book, title.styles());
            if (text && text.match($_linereg))
                es.wrapText = true;
            sheet.addText(row, col, text, es, title.height());
            sheet.addMerge(row, col, 1, colspan);
            for (var i = 1; i < colspan; i++) {
                sheet.addBlank(row, col + i, es);
            }
            row ++;
            row += title.spaceBottom();
        }
        if ((title = options.documentSubtitle()) && title._visible) {
            row += title.spaceTop();
            var text = title.message();
            es = this.$_addStyle(book, title.styles());
            if (text && text.match($_linereg))
                es.wrapText = true;
            sheet.addText(row, col, text, es, title.height());
            sheet.addMerge(row, col, 1, colspan);
            for (var i = 1; i < colspan; i++) {
                sheet.addBlank(row, col + i, es);
            }
            row ++;
            row += title.spaceBottom();
        }
        return row - startRow;
    },
    $_buildDocumentTail: function(ctx, startRow, col) {
        var grid = ctx.grid;
        var options = ctx.options;
        var book = ctx.book;
        var sheet = book.sheet();
        var es; 
        var colspan = sheet._columns.length;
        var tail;
        var row = startRow;
        if ((tail = options.documentTail()) && tail._visible) {
            row += tail.spaceTop();
            var text = tail.message();
            es = this.$_addStyle(book, tail.styles());
            if (text && text.match($_linereg))
                es.wrapText = true;
            sheet.addText(row, col, text, es, tail.height());
            sheet.addMerge(row, col, 1, colspan);
            for (var i = 1; i < colspan; i++) {
                sheet.addBlank(row, col + i, es);
            }
            row ++;
            row += tail.spaceBottom();
        }
        return row - startRow;
    },
    $_buildHeader: function (ctx, startRow, startCol) {
        var i, es, row, c; 
        var grid = ctx.grid;
        var book = ctx.book;
        var sheet = book.sheet();
        var colArr = ctx.colArr;
        var cols = colArr.colCount();
        var rows = colArr.headerRowCount();
        var indents = ctx.indents;
        if (ctx.indicator) {
            es = this.$_addStyle(book, grid.indicator().headStyles());
            sheet.addText(startRow, startCol, ctx.indicatorHead, es);
            if (rows > 1) {
                for (i = 1; i < rows; i++) {
                    sheet.addBlank(startRow + i, startCol, es);
                }
                sheet.addMerge(startRow, startCol, rows, 1);
            }
            startCol++;
        }
        if (indents > 0) {
            for (c = 0; c < indents; c++) {
                for (i = 0; i < rows; i++) {
                    sheet.addBlank(i + startRow, c + startCol, ctx.indentHeadStyle);
                }
                sheet.addMerge(startRow, c + startCol, rows, 1);
            }
            startCol += indents;
        }
        for (i = 0; i < rows; i++) {
            row = startRow + i;
            for (c = 0; c < cols; c++) {
                var item = colArr.getHeader(i, c);
                var column = item.column;
                var col = c + startCol;
                if (item.colIndex > 0 || item.rowIndex > 0) {
                    sheet.addBlank(row, col, es);
                } else {
                    var h = column.header();
                    es = this.$_addStyle(book, h.styles());
                    var text = h.displayText();
                    if (text && text.match($_linereg))
                        es.wrapText = true;
                    sheet.addText(row, col, text, es);
                    if (item.rowSpan > 1 || item.colSpan > 1) {
                        sheet.addMerge(row, col, item.rowSpan, item.colSpan);
                    }
                }
            }
        }
        return rows;
    },
    $_buildFooter: function (ctx, startRow, startCol) {
        function addFooterCell(row, col, column, footerIndex, es) {
            var cell = grid.footer().getCell(grid.getIndex(-1, column), footerIndex);
            var v = cell.value();
            if (!isNaN(v)) {
                sheet.addNumber(row, col, v, es);
            } else {
                if (v === undefined || typeof v == "number") {
                    sheet.addText(row, col, cell.displayText() || "", es);
                } else {
                    sheet.addText(row, col, v || "", es);
                }
            }         
        }
        var grid = ctx.grid;
        var mergeManager = grid.footerMergeManager();
        var book = ctx.book;
        var sheet = book.sheet();
        var colArr = ctx.colArr;
        var cols = colArr.colCount();
        var rows = colArr.dataRowCount();
        var indents = ctx.indents;
        var i, es, c, r;
        var footers = grid.footer().count();
        var mrows = footers * rows;
        if (ctx.indicator) {
            es = this.$_addStyle(book, grid.indicator().footStyles());
            sheet.addText(startRow, startCol, ctx.indicatorFoot, es);
            if (rows > 1 || footers > 1) {
                for (i = 1; i < mrows; i++) {
                    sheet.addBlank(startRow + i, startCol, es);
                }
                sheet.addMerge(startRow, startCol, mrows, 1);
            }
            startCol++;
        }
        if (indents > 0) {
            for (c = 0; c < indents; c++) {
                for (i = 0; i < mrows; i++) {
                    sheet.addBlank(i + startRow, c + startCol, ctx.indentFootStyle);
                }
                sheet.addMerge(startRow, c + startCol, mrows, 1);
            }
            startCol += indents;
        }
        var row = startRow;
        for (r = 0; r < footers; r++) {
            for (i = 0; i < rows; i++) {
                for (c = 0; c < cols; c++) {
                    var item = colArr.getItem(i, c);
                    var column = item.column;
                    var col = c + startCol;
                    if (item.colIndex > 0 || item.rowIndex > 0) {
                        sheet.addBlank(row, col, es);
                    } else {
                        var colIndex = column.displayIndex();
                        var room = null;
                        if (column.parent() instanceof RootColumn) {
                            room = mergeManager.findRoom(colIndex);
                            if (room && colIndex == room.start() && colIndex != room.base()) {
                                colItem = colArr.getItem(i, room.base()+colIndex-c);
                                column = colItem.column; 
                            }
                        }
                        var f = column.footer();
                        es = this.$_addStyle(book, f.styles());
                        if (room) {
                            if (room.start() == c) {
                                addFooterCell(row, col, column, r, es);
                                sheet.addMerge(row, col, item.rowSpan, room.count());
                            } else {
                                sheet.addBlank(row, col, es);
                            }
                        } else {
                            addFooterCell(row, col, column, r, es)
                            if (item.rowSpan > 1 || item.colSpan > 1) {
                                sheet.addMerge(row, col, item.rowSpan, item.colSpan);
                            }
                        }
                    }
                }
                row++;
            }
        }
        if (ctx.rowGrouped && !ctx.compatibility && ctx.showLevelOutline) {
            sheet.setRowLevel(row, 1);
        }
        return rows;
    },
    $_buildHeaderSummary: function (ctx, startRow, startCol) {
        function addHeaderSummaryCell(row, col, column, es) {
            var cell = grid.header().summary().getCell(grid.getIndex(-1, column));
            var v = cell.value();
            if (!isNaN(v)) {
                sheet.addNumber(row, col, v, es);
            } else {
                if (v === undefined || typeof v == "number") {
                    sheet.addText(row, col, cell.displayText() || "", es);
                } else {
                    sheet.addText(row, col, v || "", es);
                }
            }         
        }
        var grid = ctx.grid;
        var mergeManager = grid.headerSummaryMergeManager();
        var book = ctx.book;
        var sheet = book.sheet();
        var colArr = ctx.colArr;
        var cols = colArr.colCount();
        var rows = colArr.dataRowCount();
        var indents = ctx.indents;
        var i, es, c;
        if (ctx.indicator) {
            es = this.$_addStyle(book, grid.indicator().summaryStyles());
            sheet.addText(startRow, startCol, ctx.indicatorSummary, es);
            if (rows > 1) {
                for (i = 1; i < rows; i++) {
                    sheet.addBlank(startRow + i, startCol, es);
                }
                sheet.addMerge(startRow, startCol, rows, 1);
            }
            startCol++;
        }
        if (indents > 0) {
            for (c = 0; c < indents; c++) {
                for (i = 0; i < rows; i++) {
                    sheet.addBlank(i + startRow, c + startCol, ctx.indentHeadSummaryStyle);
                }
                sheet.addMerge(startRow, c + startCol, rows, 1);
            }
            startCol += indents;
        }
        for (i = 0; i < rows; i++) {
            var row = startRow + i;
            for (c = 0; c < cols; c++) {
                var item = colArr.getItem(i, c);
                var column = item.column;
                var col = c + startCol;
                if (item.colIndex > 0 || item.rowIndex > 0) {
                    sheet.addBlank(row, col, es);
                } else {
                    var room = mergeManager.findRoom(c);
                    if (room && c == room.start() && c != room.base()) {
                        colItem = colArr.getItem(i, room.base());
                        column = colItem.column; 
                    }
                    var hs = column.header().summary();
                    es = this.$_addStyle(book, hs.styles());
                    if (room) {
                        if (room.start() == c) {
                            addHeaderSummaryCell(row, col, column, es);
                            sheet.addMerge(row, col, item.rowSpan, room.count());
                        } else {
                            sheet.addBlank(row, col, es);
                        }
                    } else {
                        addHeaderSummaryCell(row, col, column, es)
                        if (item.rowSpan > 1 || item.colSpan > 1) {
                            sheet.addMerge(row, col, item.rowSpan, item.colSpan);
                        }
                    }
                }
            }
        } 
        if (ctx.rowGrouped && !ctx.compatibility && ctx.showLevelOutline) {
            sheet.setRowLevel(row, 1);
        }
        return rows;
    },
    $_buildIndicatorCell: function (ctx, no, startRow, startCol, rows, ht) {
        var grid = ctx.grid;
        var book = ctx.book;
        var sheet = book.sheet();
        var es = ctx.indicatorStyle ? ctx.indicatorStyle : this.$_addStyle(book, grid.indicator().styles());
        sheet.addNumber(startRow, startCol, no, es, undefined, undefined, ht);
        if (rows > 1) {
            for (var i = 1; i < rows; i++) {
                sheet.addBlank(startRow + i, startCol, es, ht);
            }
            sheet.addMerge(startRow, startCol, rows, 1);
        }
        return 1;
    },
    $_buildValueCell: function (ctx, row, col, item, column) {
        var grid = ctx.grid;
        var isFixedRow = item.index() >= 0 && item.index() < grid.fixedOptions().rowCount();
        var body = grid.body();
        var options = ctx.options;
        var sheet = ctx.book.sheet();
        var index = CellIndex.temp(grid, item.index(), column);
        var isDynamicStyles = false;
        var es = (column.isFixed() || isFixedRow) && grid.fixedOptions()._ignoreColumnStyles ? ctx.fixedStyles : ctx.columnStyles[column.$_hash];
        if ((options.isApplyDynamicStyles() && body.checkDynamicStyle(index, item)) ||(isFixedRow) ) {
            es = this.$_addStyle(ctx.book, body.getCell(index, false, item)._styles);
            isDynamicStyles = true;
        }
        if (column._blankWhenExport) {
            sheet.addText(row, col, "", es);
        } else if (column instanceof DataColumn) {
            var fld = column.dataIndex();
            var field = grid.dataSource().getField(fld);
            var v = item.getData(fld);
            if (field) {
                switch (field.dataType()) {
                    case "number":
                        if (isNaN(v)) {
                            sheet.addText(row, col, "", es);
                        } else if (options._numberCallback) {
                            v = options._numberCallback(item.index(), column.name(), v);
                            if (typeof v == "number") {
                                sheet.addNumber(row, col, v, es);
                            } else {
                                sheet.addText(row, col, v, es);
                            }
                        } else {
                            sheet.addNumber(row, col, v, es);
                        }
                        break;
                    case "datetime":
                    case "date":
                        if (v) {
                            if (options._datetimeCallback) {
                                v = options._datetimeCallback(item.index(), column.name(), v);
                                if (v instanceof Date) {
                                    sheet.addDate(row, col, v, es, undefined, undefined, ctx.compatibility);
                                } else {
                                    sheet.addText(row, col, v, es);
                                }
                            } else {
                                sheet.addDate(row, col, v, es, undefined, undefined, ctx.compatibility);
                            }
                        } else if (options._nullText) {
                            sheet.addText(row, col, options._nullText, es);
                        } else {
                            sheet.addText(row, col, "", es);
                        }
                        break;
                    case "boolean":
                        if (options._booleanCallback) {
                            v = options._booleanCallback(item.index(), column.name(), v);
                            sheet.addText(row, col, v, es);
                        } else if (options._booleanFormatter) {
                            v = options._booleanFormatter.formatValue(v);
                            sheet.addText(row, col, v, es);
                        } else {
                            sheet.addBool(row, col, v, es);
                        }
                        break;                                           
                    default:  
                        var gcell = body.getCellSimple(index);
                        if (options._lookupDisplay && (column.labelField() || column.isLookupDisplay())) {
                            v = gcell.getTextFromItem(item);
                            if (v && v.match($_linereg)) {
                                if (isDynamicStyles) {
                                    es.wrapText = true;
                                } else {
                                    es = ctx.columnWrapStyles[column.$_hash];
                                }
                            }
                            sheet.addText(row, col, v, es);
                        } else if (v) {
                            if (options.isCheckNumber()) {
                                v = Number(v);
                                if (!isNaN(v)) {
                                    sheet.addNumber(row, col, v, es);
                                } else {
                                    sheet.addText(row, col, "", es);
                                }
                            } else {
                                var exp, rep;
                                if ((exp = column.getDisplayRegExp()) && (rep = column.displayReplace())) {
                                    v = v.replace(exp, rep);
                                }
                                if (v.match($_linereg)) {
                                    if (isDynamicStyles) {
                                        es.wrapText = true;
                                    } else {
                                        es = (column.isFixed()||isFixedRow) && grid.fixedOptions()._ignoreColumnStyles ? ctx.fixedWrapStyles : ctx.columnWrapStyles[column.$_hash];
                                    }
                                }
                                sheet.addText(row, col, v, es);
                            }
                        } else {
                            sheet.addText(row, col, "", es);
                        }
                        break;
                }
            } else {
                sheet.addBlank(row, col, es);
            }
        } else if (column instanceof SeriesColumn) {
            this._seriesCell.setIndex(index);
            var vals = this._seriesCell.value();
            if (vals) {
                var s = SeriesCell.getText(vals);
                sheet.addText(row, col, s, es);
            } else {
                sheet.addBlank(row, col, es);
            }
        }
    },
    $_findPrevCellStyle: function(sheet, r, c) {
        var row = sheet._rows[r];
        var cols = row ? row.childNodes : null;
        if (!cols) return null;
        var ref = _excelColCaption(c)+(r+1);
        for (var i = 0, cnt=cols.length; i < cnt; i++) {
            if (cols.item(i).getAttribute("r") == ref) {
                var s = cols.item(i).getAttribute("s");
                return s ? {id:s} : null;
            }
        }
        return null;
    },
    $_buildRow: function (ctx, item, startRow, startCol, no) {
        var c;
        var grid = ctx.grid;
        var addi = grid.rowGroup().expandedAdornments() === RowGroupAdornments.SUMMARY ? 0 : 1;
        var book = ctx.book;
        var sheet = book.sheet();
        var colArr = ctx.colArr;
        var rows = colArr.dataRowCount();
        var cols = colArr.colCount();
        var colStyles = ctx.columnStyles;
        var groupBarStyles = ctx.rowGroupBarStyle;
        var lm = grid.layoutManager();
        var ht = item && item.dataId && lm._itemHeights[item.dataId()];
        var columnMerged = ctx.columnMerged;
        var mergeHeads = ctx.mergeHeads;
        var rowGroup = grid.rowGroup();
        var indents = ctx.indents;
        var level = item.level();
        if (ctx.indicator) {
            startCol += this.$_buildIndicatorCell(ctx, no, startRow, startCol, rows, ht);
        }
        for (var r = 0; r < rows; r++) {
            var row = startRow + r;
            var start = startCol;
            for (c = 0; c < indents; c++) {
                if (ctx.rowGroupBarStyles && ctx.rowGroupBarStyles.length > 0) {

                    sheet.addBlank(row, start, ctx.rowGroupBarStyles[Math.min(c+addi, ctx.rowGroupBarStyles.length-1)])
                } else {
                    sheet.addBlank(row, start, groupBarStyles);    
                }
                start++;
            }
            for (c = 0; c < cols; c++) {
                var col = c + start;
                var colItem = colArr.getItem(r, c);
                var column = colItem.column;
                var es = colStyles[column.$_hash];
                if (colItem.colIndex > 0 || colItem.rowIndex > 0) {
                    sheet.addBlank(row, col, es);
                } else {
                    var rowSpan = colItem.rowSpan;
                    var colSpan = colItem.colSpan;
                    var celled = false;
                    if (columnMerged) {
                        var index = CellIndex.temp(grid, item.index(), column);
                        var room = lm.getMergedCell(index);
                        if (room) {
                            if ((room.isHead(index) && r == 0) || (ctx.start > 0 && item.index() == ctx.start)) {
                                this.$_buildValueCell(ctx, row, col, item, column, ht);
                                mergeHeads[column.$_hash] = row;
                                celled = true;
                            } else {
                                var prevRow = row - 1 < 0 ? 0 : row - 1;
                                var tmpEs = this.$_findPrevCellStyle(sheet, prevRow, col);
                                sheet.addBlank(row, col, tmpEs ? tmpEs : es, ht);
                                if (room.isTail(index) || (ctx.last > 0 && item.index() == ctx.last - 1)) {
                                    rowSpan = (row - mergeHeads[column.$_hash]) + rows;
                                    sheet.addMerge(mergeHeads[column.$_hash], col, rowSpan, 1);
                                }
                                celled = true;
                            }
                        } else if (ctx.allItems && !item.isVisible()) {
                            if (!RowGroupAdornments.isHeader(rowGroup.expandedAdornments()) && item == item.parent().firstItem()) {
                                this.$_buildValueCell(ctx, row, col, item, column);
                                mergeHeads[column.$_hash] = row;
                                celled = true;
                            } else if (grid.isGroupedColumn(column)) {
                                sheet.addBlank(row, col, es);
                                if (!RowGroupAdornments.isFooter(rowGroup.expandedAdornments()) && item == item.parent().lastItem()) {
                                    rowSpan = (row - mergeHeads[column.$_hash]) + rows;
                                    sheet.addMerge(mergeHeads[column.$_hash], col, rowSpan, 1);
                                }
                                celled = true;
                            }
                        }
                    }
                    if (!celled) {
                        this.$_buildValueCell(ctx, row, col, item, column,ht);
                        if (rowSpan > 1 || colSpan > 1) {
                            sheet.addMerge(row, col, rowSpan, colSpan);
                        }
                    }
                }
            }
            if (ctx.rowGrouped && !ctx.compatibility && ctx.showLevelOutline) {
                sheet.setRowLevel(row, item.level());
            }
        }
        return rows;
    },
    $_buildGroupItem: function (ctx, item, startRow, startCol, no) {
        var grid = ctx.grid;
        var book = ctx.book;
        var sheet = book.sheet();
        var colArr = ctx.colArr;
        var cols = colArr.colCount();
        var level = item.level() - 1;
        var groupBarStyles = ctx.rowGroupBarStyle;
        if (ctx.indicator) {
            startCol += this.$_buildIndicatorCell(ctx, no, startRow, startCol, 1);
        }
        if (ctx.options.isIndenting()) {
            for (var c = 0; c < level; c++) {
                if (ctx.rowGroupBarStyles && ctx.rowGroupBarStyles.length > 0) {
                    sheet.addBlank(startRow, startCol, ctx.rowGroupBarStyles[Math.min(c+1, ctx.rowGroupBarStyles.length-1)]);
                } else {
                    sheet.addBlank(startRow, startCol, groupBarStyles);
                }
                startCol++;
            }
        }
        /*
         for (c = 0; c < level; c++) {
         var cell:ICell = m_doc.addBlank(r, c + startCol);
         cell.style = m_headerBarStyle;
         }
         cell = (m_allItems || item.expanded) ? m_doc.addBlank(r, c + startCol) : m_doc.addText(r, c + startCol, "+");
         cell.style = m_rowGroupHeaderStyle;
         c++;
         */
        //if (ctx.indents > 0) {
        //    startCol += item.level() - 1;
        //}
        var s = grid.rowGroup().getHeaderText(item);//.getHeadCell(level).displayText;
        if (ctx.rowGroupHeaderStyles && ctx.rowGroupHeaderStyles.length > 0) {
            sheet.addText(startRow, startCol, s, ctx.rowGroupHeaderStyles[level])
        } else {
            sheet.addText(startRow, startCol, s, ctx.rowGroupHeaderStyle);
        }
        if (ctx.indents > 0) {
            cols += ctx.indents - (item.level()-1);
        }
        for (var i = 1; i < cols; i++) {
            sheet.addBlank(startRow, i + startCol, ctx.rowGroupHeaderStyle);
        }
        sheet.addMerge(startRow, startCol, 1, cols);
        if (ctx.rowGrouped && !ctx.compatibility && ctx.showLevelOutline) {        
            sheet.setRowLevel(startRow, item.level());
        }
        return 1;
    },
    $_buildGroupFooter: function (ctx, item, startRow, startCol, no) {
        function addGroupFooterCell(row, col, column, es) {
            var v = RowGroupFooterCell.getValue(item, column);
            if (v instanceof Date) {
                if (ctx.options._datetimeCallback) {
                    v = ctx.options._datetimeCallback(item.index(), column.name(), v);
                    if (v instanceof Date) {
                        sheet.addDate(row, col, v, es, undefined, undefined, ctx.compatibility);
                    } else {
                        sheet.addText(row, col, v, es);
                    }
                } else {
                    sheet.addDate(row, col, v, es, undefined, undefined, ctx.compatibility);
                }
            } else if (typeof v == "string") {
                sheet.addText(row, col, v, es);
            } else if (isNaN(v)) {
                var itemId = item.index();
                var text = "";
                var groupText;
                if (itemId > -1) {
                    var index = CellIndex.temp(grid, itemId, column);
                    var cell = rowGroup.getFooterCell(index);
                    if (v === undefined || typeof v == "number") {
                        text = cell.displayText() || "";
                    } else {
                        text = v;
                    }
                } else if (groupText = column.footer().groupText()) {
                    text = groupText;
                }
                sheet.addText(row, col, text, es);
            } else {
                sheet.addNumber(row, col, v, es);
            }
        }
        var c, col, colItem, column, es;
        var grid = ctx.grid;
        var rowGroup = grid.rowGroup();
        var fixedRows = grid.fixedOptions().rowCount();
        var mergeManager = grid.groupFooterMergeManager();
        var book = ctx.book;
        var sheet = book.sheet();
        var colArr = ctx.colArr;
        var firstColumn = colArr.getItem(0, 0).column;
        var firstCell = CellIndex.temp(grid, item.index(), firstColumn);
        var rows = colArr.dataRowCount();
        var cols = colArr.colCount();
        var footerStyles = ctx.rowGroupFooterStyle;
        var groupBarStyles = ctx.rowGroupBarStyle;
        var indents = ctx.indents;
        var level = item.level();
        var groupLevels = grid.rowGroup().levels();
        var srcStyles = groupLevels.length > 0 ? groupLevels[Math.min(groupLevels.length-1, Math.max(level-2,0))].footerStyles() : grid.rowGroup().footerStyles();
        var isSummary = grid._rowGroup._expandedAdornments == RowGroupAdornments.SUMMARY;
        var lm = grid.layoutManager();
        if (ctx.indicator) {
            startCol += this.$_buildIndicatorCell(ctx, no, startRow, startCol, rows);
        }
        for (var r = 0; r < rows; r++) {
            var row = startRow + r;
            var start = startCol;
            if (indents > 0) {
                column = firstColumn;
                /*
                es = footerStyles[column.$_hash];
                if (!es) {
                    this._runStyles.assign(f.styles());
                    this._runStyles.assign(f.groupStyles());
                    this._runStyles.setParent(srcStyles);
                    es = this.$_addStyle(book, this._runStyles)
                    footerStyles[column.$_hash] = es;
                }
                */
                for (c = 0; c < indents; c++) {
                    if (ctx.rowGroupFooterBarStyles && ctx.rowGroupFooterBarStyles.length > 0) {
                        if (isSummary) {
                            if (c < level-2) {
                                sheet.addBlank(row, start, ctx.rowGroupBarStyles[c]);
                            } else if (c == level-2) {
                                sheet.addBlank(row, start, ctx.rowGroupFooterBarStyles[level-2]);
                            } else {
                                sheet.addBlank(row, start, ctx.rowGroupFooterStyles[level-2])
                            }
                        } else {
                            if (c < level-2) {
                                sheet.addBlank(row, start, ctx.rowGroupBarStyles[Math.min(c+1, ctx.rowGroupBarStyles.length-1)]);
                            } else {
                                sheet.addBlank(row, start, ctx.rowGroupFooterBarStyles[level-2]);
                            }
                        }
                    } else {
                        if (isSummary) {
                            if (c < level-2) {
                                sheet.addBlank(row, start, groupBarStyles);
                            } else {
                                sheet.addBlank(row, start, footerStyles);    
                            }
                            
                        } else {
                            sheet.addBlank(row, start, groupBarStyles);
                        }
                    }
                    if (r == 0 && rows > 1) {
                        sheet.addMerge(row, start, rows, 1);
                    }
                    start++;
                }
            }
            var rootCol = firstColumn.root();
            var rc = -1;
            for (var c = 0; c < cols; c++) {
                col = c + start;
                colItem = colArr.getItem(r, c);
                column = colItem.column;
                if (!column.group() || column.root() != rootCol) {
                    rootCol = column.root();
                    rc++;
                }
                var room = mergeManager.findRoom(level-1, rc);
                if (room && rc == room.start() && rc != room.base()) {
                    colItem = colArr.getItem(r, room.base()+(c-rc));
                    column = colItem.column;
                }
                if (ctx.rowGroupFooterStyles && ctx.rowGroupFooterStyles.length > 0) {
                    es = ctx.rowGroupFooterStyles[item.level()-2]
                } else {
                    es = null;
                }
                if (!es || column.footer().groupStyles()._values.length > 0) {
                    var fs = footerStyles[level] = footerStyles[level] ? footerStyles[level] : {};
                    es = fs[column.$_hash];
                    if (!es) {
                        var f = column.footer();
                        this._runStyles.assign(f.groupStyles());
                        this._runStyles.copy(f.styles());
                        this._runStyles.setParent(srcStyles);
                        es = this.$_addStyle(book, this._runStyles);
                        footerStyles[level][column.$_hash] = es;
                    }
                }
                if (colItem.colIndex > 0 || colItem.rowIndex > 0) {
                    sheet.addBlank(row, col, es);
                } else {
                    if (room) {  // room을 찾았으면 
                        if (room.start() == rc) {
                            addGroupFooterCell(row, col, column, es);
                            sheet.addMerge(row, col, colItem.rowSpan, room.count());
                        } else {
                            sheet.addBlank(row, col, es);
                        }
                    } else {
                        addGroupFooterCell(row, col, column, es);
                        if (colItem.rowSpan > 1 || colItem.colSpan > 1) {
                            sheet.addMerge(row, col, colItem.rowSpan, colItem.colSpan);
                        }
                    } 
                }
                /*
                 if (cell) {
                 var es:ExcelStyle = m_rowGroupFooterStyles[column];
                 if (!es) {
                 m_runStyles.assign(column.footer.styles);
                 m_runStyles.parent = m_grid.rowGroup.footerStyles;
                 es = addStyle(m_runStyles, false);
                 m_rowGroupFooterStyles[column] = es;
                 }
                 cell.style = es;
                 }
                 */
                if (ctx.rowGrouped && !ctx.compatibility && ctx.showLevelOutline) {
                    sheet.setRowLevel(row, item.level());
                }
            }
        }
        /*
         if (item.level() < ctx.rowLevels + 1) {
         es = m_rowGroupFooterStyles[m_colArr.getItem(0, 0).column];
         for (c = 1; c <= m_groupLevels + 1 - item.level; c++) {
         col = startCol - c;
         for (r = 0; r < rows; r++) {
         row = startRow + r;
         cell = m_doc.addBlank(row, col);
         cell.style = es;
         }
         m_doc.addMerge(startRow, col, startRow + rows - 1, col);
         }
         }
         */
        return rows;
    },
    $_buildMergedGroupHeader: function (ctx, item, startRow, startCol, no) {
        var grid = ctx.grid;
        var book = ctx.book;
        var sheet = book.sheet();
        var colArr = ctx.colArr;
        var cols = colArr.colCount();
        var level = item.level();
        if (ctx.indicator) {
            startCol += this.$_buildIndicatorCell(ctx, no, startRow, startCol, 1);
        }
        // addBlank 
        // startCol는 유동적이다.
        // level-1만큼만 돌아야 한다.
        for (var c=0;c<level-1;c++) {
            sheet.addBlank(startRow, startCol+c, this.$_findPrevCellStyle(sheet, startRow-1,startCol+c));
        }
        if (ctx.columnMerged) {
            var col = level - 1;
            var column = colArr.getItem(0, col).column;
            this.$_buildValueCell(ctx, startRow, startCol + col, item.firstItem(), column);
            ctx.mergeHeads[column.$_hash] = startRow;
        }
        var s = grid.rowGroup().getHeaderText(item);
        var c = startCol + level;
        sheet.addText(startRow, c++, s, ctx.rowGroupHeaderStyle);
        for (; c < cols + startCol; c++) {
            sheet.addBlank(startRow, c/* + startCol*/, ctx.rowGroupHeaderStyle);
        }
        sheet.addMerge(startRow, level + startCol, 1, cols - level);
        /*
         var column:Column = m_colArr.getItem(0, level - 1).column;
         c = header.level + startCol - 1;
         cell = createValueCell(r, c, header.firstItem, column);
         cell.style = m_columnStyles[column];
         if (m_columnMerged) {
         if (m_allItems || header.expanded) {
         m_mergeHeads[column] = startRow;
         }
         }
         */
        return 1;
    },
    $_buildMergedGroupFooter: function (ctx, item, startRow, startCol, no) {
        function addMergedGroupFooterCell(row, col, column, es) { 
            var v = RowGroupFooterCell.getValue(item, column);
            if (v instanceof Date) {
                if (ctx.options._datetimeCallback) {
                    v = ctx.options._datetimeCallback(item.index(), column.name(), v);
                    if (v instanceof Date) {
                        sheet.addDate(row, col, v, es, undefined, undefined, ctx.compatibility);
                    } else {
                        sheet.addText(row, col, v, es);
                    }
                } else {
                    sheet.addDate(row, col, v, es, undefined, undefined, ctx.compatibility);
                }
            } else if (isNaN(v)) {
                var itemId = item.index();
                var text = "";
                var groupText;
                if (itemId > -1) {
                    var index = CellIndex.temp(grid, itemId, column);
                    var cell = rowGroup.getFooterCell(index);
                    if (v === undefined || typeof v == "number") {
                        text = cell.displayText() || "";
                    } else {
                        text = v;
                    }
                } else if (groupText = column.footer().groupText()) {
                    text = groupText;
                }
                sheet.addText(row, col, text, es);
            } else {
                sheet.addNumber(row, col, v, es);
            }
        }

        var r, c, column, es, row, col, colItem;
        var grid = ctx.grid;
        var rowGroup = grid.rowGroup();
        var mergeManager = grid.groupFooterMergeManager();
        var book = ctx.book;
        var sheet = book.sheet();
        var colArr = ctx.colArr;
        var firstColumn = colArr.getItem(0, 0).column;
        var rows = colArr.dataRowCount();
        var cols = colArr.colCount();
        var srcStyles = grid.rowGroup().footerStyles();
        var footerStyles = ctx.rowGroupFooterStyle;
        var colStyles = ctx.columnStyles;
        var showRow = ctx.options.isIndicatorDataRow(grid);
        var level = item.level() - 1;
        var lm = grid.layoutManager();
        if (ctx.indicator) {
            startCol += this.$_buildIndicatorCell(ctx, no, startRow, startCol, rows);
        }
        for (c = 0; c < level; c++) {
            column = colArr.getItem(0, c).column;
            es = colStyles[column.$_hash];
            if (ctx.allItems || item.parent().isExpanded()) {
                for (r = 0; r < rows; r++) {
                    sheet.addBlank(startRow + r, startCol + c, es);
                }
            } else {
                for (r = 0; r < rows; r++) {
                    this.$_buildValueCell(ctx, startRow + r, startCol + c, item.parent().firstItem(), column);
                }
            }
        }
        if (ctx.columnMerged) {
            if (ctx.allItems || item.parent().isExpanded()) {
                r = ctx.mergeHeads[column.$_hash];
                sheet.addMerge(r, startCol + level - 1, startRow + rows - r, 1);
            }
        }
        for (r = 0; r < rows; r++) {
            row = startRow + r;
            var rootCol = firstColumn.root();
            var rc = 0;
            for (c = level; c < cols; c++) {
                col = c + startCol;
                colItem = colArr.getItem(r, c);
                column = colItem.column;
                if (!column.group() || column.root() != rootCol) {
                    rootCol = column.root();
                    rc++;
                }
                var room = mergeManager.findRoom(level, rc);
                if (room && rc == room.start() && rc != room.base()) {
                    colItem = colArr.getItem(r, room.base()+(c-rc));
                    column = colItem.column; 
                }
                es = footerStyles[column.$_hash];
                if (!es) {
                    var f = column.footer();
                    this._runStyles.assign(f.groupStyles());
                    this._runStyles.copy(f.styles());
                    this._runStyles.setParent(srcStyles);
                    es = this.$_addStyle(book, this._runStyles);
                    footerStyles[column.$_hash] = es;
                }
                if (colItem.colIndex > 0 || colItem.rowIndex > 0) {
                    sheet.addBlank(row, col, es);
                } else {
                    if (room) {
                        if (room.start() == rc) {
                            addMergedGroupFooterCell(row, col, column, es);
                            sheet.addMerge(row, col, 1, room.count());
                        } else {
                            sheet.addBlank(row, col, es);
                        }
                    } else {
                        addMergedGroupFooterCell(row, col, column, es);
                        if (colItem.rowSpan > 1 || colItem.colSpan > 1) {
                            sheet.addMerge(row, col, colItem.rowSpan, colItem.colSpan);
                        }
                    }
                }
                /*
                 if (cell) {
                 var es:ExcelStyle = m_rowGroupFooterStyles[column];
                 if (!es) {
                 m_runStyles.assign(column.footer.styles);
                 m_runStyles.parent = m_grid.rowGroup.footerStyles;
                 es = addStyle(m_runStyles, false);
                 m_rowGroupFooterStyles[column] = es;
                 }
                 cell.style = es;
                 }
                 */
                if (ctx.rowGrouped && !ctx.compatibility && ctx.showLevelOutline) {
                    sheet.setRowLevel(row, level);
                }
            }
        }
        return rows;
    },
    $_buildItems: function (ctx, startRow, startCol) {
        var grid = ctx.grid;
        var showRow = ctx.options.isIndicatorDataRow(grid);
        var allItems = ctx.allItems;

        var row = startRow;
        for (var i = ctx.start; i < ctx.last; i++) {
            var item = allItems ? allItems[i] : grid.getItem(i);

            if (item instanceof GridRow) {
                row += this.$_buildRow(ctx, item, row, startCol, showRow ? item.dataRow() : i + 1);
            } else if (item instanceof GroupItemImpl) {
                row += this.$_buildGroupItem(ctx, item, row, startCol, i + 1);
            } else if (item instanceof MergedGroupHeader) {
                row += this.$_buildMergedGroupHeader(ctx, item, row, startCol, i + 1);
            } else if (item instanceof MergedGroupFooter) {
                row += this.$_buildMergedGroupFooter(ctx, item, row, startCol, i + 1);
            } else if (item instanceof GroupFooter) {
                row += this.$_buildGroupFooter(ctx, item, row, startCol, i + 1);
            } else {
                throw "Unkown item type";
            }
        }

        return row - startRow;
    },
    $_buildItemsAsync: function (ctx, startRow, startCol, done) {
        var showRow = ctx.options.isIndicatorDataRow(ctx.grid);
        try {
            this.$_buildItemAsync(ctx, startRow, startCol, showRow, ctx.start, done);
        } catch (ex) {
            ctx.grid.endExportProgress();
            throw ex;
        }
    },
    $_buildItemAsync: function (ctx, row, startCol, showRow, index, done) {
        var stepLast = index + Math.min(ctx.progressStep, ctx.last-index);
        for (var i = index; i < stepLast; i++) {
            var item = ctx.allItems ? ctx.allItems[i] : ctx.grid.getItem(i);
            if (item instanceof GridRow) {
                row += this.$_buildRow(ctx, item, row, startCol, showRow ? item.dataRow() : i + 1);
            } else if (item instanceof GroupItemImpl) {
                row += this.$_buildGroupItem(ctx, item, row, startCol, i + 1);
            } else if (item instanceof MergedGroupHeader) {
                row += this.$_buildMergedGroupHeader(ctx, item, row, startCol, i + 1);
            } else if (item instanceof MergedGroupFooter) {
                row += this.$_buildMergedGroupFooter(ctx, item, row, startCol, i + 1);
            } else if (item instanceof GroupFooter) {
                row += this.$_buildGroupFooter(ctx, item, row, startCol, i + 1);
            } else {
                throw "Unkown item type";
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
                self.$_buildItemAsync(ctx, row, startCol, showRow, index, done);
            },0);
        }
    },
    $_buildTreeHeader: function (ctx, startRow, startCol) {
        var i, es, row;
        var grid = ctx.grid;
        var book = ctx.book;
        var sheet = book.sheet();
        var colArr = ctx.colArr;
        var cols = colArr.colCount();
        var rows = colArr.headerRowCount();
        var indents = ctx.indents;
        if (ctx.indicator) {
            es = this.$_addStyle(book, grid.indicator().headStyles());
            sheet.addText(startRow, startCol, ctx.indicatorHead, es);
            if (rows > 1) {
                for (i = 1; i < rows; i++) {
                    sheet.addBlank(startRow + i, startCol, es);
                }
                sheet.addMerge(startRow, startCol, rows, 1);
            }
            startCol++;
        }
        if (indents > 0) {
            for (c = 0; c < indents; c++) {
                for (i = 0; i < rows; i++) {
                    sheet.addBlank(i + startRow, c + startCol, ctx.indentHeadStyle);
                }
                sheet.addMerge(startRow, c + startCol, rows, 1);
            }
            startCol += indents;
        }
        for (i = 0; i < rows; i++) {
            row = startRow + i;
            for (var c = 0; c < cols; c++) {
                var item = colArr.getHeader(i, c);
                var column = item.column;
                var col = c + startCol;
                if (item.colIndex > 0 || item.rowIndex > 0) {
                    sheet.addBlank(row, col, es);
                } else {
                    var h = column.header();
                    es = this.$_addStyle(book, h.styles());
                    var text = h.displayText();
                    if (text && text.match($_linereg)) 
                        es.wrapText = true;
                    sheet.addText(row, col, text, es);
                    if (item.rowSpan > 1 || item.colSpan > 1) {
                        sheet.addMerge(row, col, item.rowSpan, item.colSpan);
                    }
                }
            }
        }
        return rows;
    },
    $_buildTreeHeaderSummary: function (ctx, startRow, startCol) {
        function addHeaderSummaryCell(row, col, column, es) {
            var cell = grid.header().summary().getCell(grid.getIndex(-1, column));
            var v = cell.value();

            if (!isNaN(v)) {
                sheet.addNumber(row, col, v, es);
            } else {
                sheet.addText(row, col, cell.displayText() || "", es);
            }
        }
        var i, es;
        var grid = ctx.grid;
        var mergeManager = grid.headerSummaryMergeManager();
        var book = ctx.book;
        var sheet = book.sheet();
        var colArr = ctx.colArr;
        var cols = colArr.colCount();
        var rows = colArr.dataRowCount();
        var indents = ctx.indents;
        if (ctx.indicator) {
            es = this.$_addStyle(book, grid.indicator().summaryStyles());
            sheet.addText(startRow, startCol, ctx.indicatorSummary, es);
            if (rows > 1) {
                for (i = 1; i < rows; i++) {
                    sheet.addBlank(startRow + i, startCol, es);
                }
                sheet.addMerge(startRow, startCol, rows, 1);
            }
            startCol++;
        }
        if (indents > 0) {
            for (c = 0; c < indents; c++) {
                for (i = 0; i < rows; i++) {
                    sheet.addBlank(i + startRow, c + startCol, ctx.indentHeadStyle);
                }
                sheet.addMerge(startRow, c + startCol, rows, 1);
            }
            startCol += indents;
        }
        for (i = 0; i < rows; i++) {
            var row = startRow + i;
            for (var c = 0; c < cols; c++) {
                var item = colArr.getItem(i, c);
                var column = item.column;
                var col = c + startCol;
                if (item.colIndex > 0 || item.rowIndex > 0) {
                    sheet.addBlank(row, col, es);
                } else {
                    var room = mergeManager.findRoom(c);
                    if (room && c == room.start() && c != room.base()) {
                        colItem = colArr.getItem(i, room.base());
                        column = colItem.column; 
                    }
                    var hs = column.header().summary();
                    es = this.$_addStyle(book, hs.styles());
                    if (room) {
                        if (room.start() == c) {
                            addHeaderSummaryCell(row, col, column, es);
                            sheet.addMerge(row, col, 1, room.count());
                        } else {
                            sheet.addBlank(row, col, es);
                        }
                    } else {
                        addHeaderSummaryCell(row, col, column, es)
                        if (item.rowSpan > 1 || item.colSpan > 1) {
                            sheet.addMerge(row, col, item.rowSpan, item.colSpan);
                        }
                    }
                }
            }
        }
        if (!ctx.compatibility && ctx.showLevelOutline)
            sheet.setRowLevel(startRow, 1);
        return rows;
    },
    $_buildTreeFooter: function (ctx, startRow, startCol) {
        function addFooterCell(row, col, column, footerIndex, es) {
            var cell = grid.footer().getCell(grid.getIndex(-1, column), footerIndex);
            var v = cell.value();

            if (!isNaN(v)) {
                sheet.addNumber(row, col, v, es);
            } else {
                sheet.addText(row, col, cell.displayText() || "", es);
            }
        }
        var i, r, c, es;
        var grid = ctx.grid;
        var mergeManager = grid.footerMergeManager();
        var book = ctx.book;
        var sheet = book.sheet();
        var colArr = ctx.colArr;
        var cols = colArr.colCount();
        var rows = colArr.dataRowCount();
        var indents = ctx.indents;
        var footers = grid.footer().count();
        var mrows = footers * rows;
        if (ctx.indicator) {
            es = this.$_addStyle(book, grid.indicator().footStyles());
            sheet.addText(startRow, startCol, ctx.indicatorFoot, es);
            if (rows > 1 || footers > 1) {
                for (i = 1; i < mrows; i++) {
                    sheet.addBlank(startRow + i, startCol, es);
                }
                sheet.addMerge(startRow, startCol, mrows, 1);
            }
            startCol++;
        }
        if (indents > 0) {
            for (c = 0; c < indents; c++) {
                for (i = 0; i < mrows; i++) {
                    sheet.addBlank(i + startRow, c + startCol, ctx.indentFootStyle);
                }
                sheet.addMerge(startRow, c + startCol, mrows, 1);
            }
            startCol += indents;
        }
        var row = startRow;
        for (r = 0; r < footers; r++) {
            for (i = 0; i < rows; i++) {
                for (var c = 0; c < cols; c++) {
                    var item = colArr.getItem(i, c);
                    var column = item.column;
                    var col = c + startCol;
                    if (item.colIndex > 0 || item.rowIndex > 0) {
                        sheet.addBlank(row, col, es);
                    } else {
                        var room = mergeManager.findRoom(c);
                        if (room && c == room.start() && c != room.base()) {
                            colItem = colArr.getItem(i, room.base());
                            column = colItem.column; 
                        }
                        var f = column.footer();
                        es = this.$_addStyle(book, f.styles());
                        if (room) {
                            if (room.start() == c) {
                                addFooterCell(row, col, column, r, es);
                                sheet.addMerge(row, col, 1, room.count());
                            } else {
                                sheet.addBlank(row, col, es);
                            }
                        } else {
                            addFooterCell(row, col, column, r, es)
                            if (item.rowSpan > 1 || item.colSpan > 1) {
                                sheet.addMerge(row, col, item.rowSpan, item.colSpan);
                            }
                        }
                    }
                }
                row++;
            }
        }
        if (!ctx.compatibility && ctx.showLevelOutline)
            sheet.setRowLevel(startRow, 1);
        return rows;
    },
    $_buildTreeItems: function (ctx, startRow, startCol) {
        var grid = ctx.grid;
        var showRow = ctx.options.isIndicatorDataRow(grid);
        var row = startRow;
        for (var i = 0; i < ctx.last; i++) {
            var item = ctx.allItems ? ctx.allItems[i] : grid.getItem(i);
            if (item instanceof TreeItem) {
                row += this.$_buildTreeItem(ctx, item, showRow ? item.dataRow() : i + 1, row, startCol);
            } else {
                throw "Unkonw tree item type";
            }
        }
        return row - startRow;
    },
    $_buildTreeItemsAsync: function (ctx, startRow, startCol, done) {
        var showRow = ctx.options.isIndicatorDataRow(ctx.grid);
        this.$_buildTreeItemAsync(ctx, startRow, startCol, showRow, 0, done);
    },
    $_buildTreeItemAsync: function (ctx, row, startCol, showRow, index, done) {
        var stepLast = index + Math.min(ctx.progressStep, ctx.last-index);
        for (var i = index; i < stepLast; i++) { 
            var item = ctx.allItems ? ctx.allItems[i] : ctx.grid.getItem(i);
            if (item instanceof TreeItem) {
                row += this.$_buildTreeItem(ctx, item, showRow ? item.dataRow() : i + 1, row, startCol);
            } else {
                throw "Unkonw tree item type";
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
    $_buildTreeItem: function (ctx, item, no, startRow, startCol) {
        var c;
        var grid = ctx.grid;
        var book = ctx.book;
        var sheet = book.sheet();
        var colArr = ctx.colArr;
        var rows = colArr.dataRowCount();
        var cols = colArr.colCount();
        var colStyles = ctx.columnStyles;
        var indents = ctx.indents;
        var level = item.level();
        if (ctx.indicator) {
            startCol += this.$_buildIndicatorCell(ctx, no, startRow, startCol, rows);
        }
        for (var r = 0; r < rows; r++) {
            var row = startRow + r;
            var start = indents > 0 ? startCol + level - 1 : startCol;
            var colItem = colArr.getItem(r, 0);
            var column = colItem.column;
            var es = colStyles[column.$_hash];
            var ind = indents > 0 ? indents - level + 1 : 0;
            if (colItem.colIndex > 0 || colItem.rowIndex > 0) {
                sheet.addBlank(row, start, es);
                for (c = 0; c < ind; c++) {
                    sheet.addBlank(row, 1 + c + start, es);
                }
            } else {
                this.$_buildValueCell(ctx, row, start, item, column);
                for (c = 0; c < ind; c++) {
                    sheet.addBlank(row, 1 + c + start, es);
                }
                sheet.addMerge(row, start, colItem.rowSpan, colItem.colSpan + ind);
            }
            if (indents > 0) {
                start = startCol + indents;
            } else {
                start = startCol;
            }
            for (c = 1; c < cols; c++) {
                var col = c + start;
                colItem = colArr.getItem(r, c);
                column = colItem.column;
                es = colStyles[column.$_hash];
                if (colItem.colIndex > 0 || colItem.rowIndex > 0) {
                    sheet.addBlank(row, col, es);
                } else {
                    this.$_buildValueCell(ctx, row, col, item, column);
                    if (colItem.rowSpan > 1 || colItem.colSpan > 1) {
                        sheet.addMerge(row, col, colItem.rowSpan, colItem.colSpan);
                    }
                }
            }
            if (!ctx.compatibility && ctx.showLevelOutline)
                sheet.setRowLevel(startRow, item.level());
        }
        return rows;
    },/*
    $_exportZip: function (parts, options) {
        function writeHandler(writer) {
            var data = parts;
            var idx = 0;
            next(data[idx]);
            function next(item) {
                writer.add(item.key, new zip.TextReader(item.body), function () {
                    _log('success');
                    idx++;
                    if (idx == data.length) {
                        writer.close(closeHandler);
                    } else {
                        next(data[idx]);
                    }
                }, function (current, total) {
                    _log(current + '/' + total);
                });
            }
        }
        function closeHandler(blob) {
            var local = options.target() == "local";
            if (local) {
                var a = document.createElement("a");
                document.body.appendChild(a);
                var url = URL.createObjectURL(blob);
                a.href = url;
                a.download = 'realgrid.xlsx';
                a.click();
            } else {
                var reader = new window.FileReader();
                reader.onloadend = function () {
                    var url = options.url();
                    var formtag = '<form name="tempForm" action="' + url + '" method="post">';
                    var s = reader.result;
                    var i = s.indexOf(',');
                    s = s.substr(i + 1);
                    s = s.replace(/xmlns=""/g, '');
                    formtag += '<input type="hidden" name="fileName" value = "realgrid.xlsx"/>';
                    formtag += '<input type="hidden" name="data" value = "' + s + '"/>';
                    formtag += '<input id="submitBtn" type="submit"/>';
                    formtag += '</form>';
                    var div = document.createElement('div');
                    div.innerHTML = formtag;
                    document.body.appendChild(div);
                    document.getElementById("submitBtn").click();
                };
                reader.readAsDataURL(blob);
            }
        }
        zip.useWebWorkers = false;
        var writer = new zip.BlobWriter("application/zip");
        zip.createWriter(writer, writeHandler, function (err) {
            _log("##### ZIP WRITE ERROR: " + err);
        })
    },*/
    $_export: function (parts, options) {
        function saveLocal(blob) {
                if(window.navigator.msSaveOrOpenBlob) { //navigator.appVersion.toString().indexOf('.NET') > 0
                    window.navigator.msSaveOrOpenBlob(blob, filename);
                } else if (window.navigator.msSaveBlob) {
                    window.navigator.msSaveBlob(blob, filename);
                } else {
                    var a = document.createElement("a");
                    document.body.appendChild(a);
                    var url = URL.createObjectURL(blob);
                    a.href = url;
                    a.download = filename;
                    a.click();
                    document.body.removeChild(a);
                }
        }
        function saveServer(base64) {
                var url = options.url();
                var formtag = '<form name="tempForm" action="' + url + '" method="post">';
                formtag += '<input type="hidden" name="fileName" value = "' + filename + '"/>';
                formtag += '<input type="hidden" name="data" value = "' + base64 + '"/>';
                formtag += '<input id="submitBtn" type="submit"/>';
                formtag += '</form>';
                var div = document.createElement('div');
                div.innerHTML = formtag;
                document.body.appendChild(div);
                document.getElementById("submitBtn").click();
                document.body.removeChild(div);
        }
        var filename = options.fileName() || "realgrid.xlsx";
        var local = options.target() == "local";
        if (JSZip.support.blob || !local) {
            var chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1 && navigator.userAgent.toLowerCase().indexOf('edge/') < 0 ;
            var zip = new JSZip();
            for (var i = 0; i < parts.length; i++) {
                var s = parts[i].body;
                if (!chrome) {
                    s = s.replace(/ xmlns=""/g, '').replace(/xmlns=""/g, '');
                }
                zip.file(parts[i].key, s);
            }
            if (local) {
                if (zip.generateAsync) {
                    zip.generateAsync({type: "blob", compression: "DEFLATE"})
                    .then(function(blob) {
                        saveLocal(blob);
                    });
                } else {
                    saveLocal(zip.generate({type: "blob", compression: "DEFLATE"}));
                }
                
            } else {
                if (zip.generateAsync) {
                    zip.generateAsync({type: "base64", compression: "DEFLATE"})
                    .then(function(base64) {
                        saveServer(base64);
                    });
                } else {
                    saveServer(zip.generate({type: "base64", compression: "DEFLATE"}));
                }
            }
        } else {
            alert("not supported on this browser");
        }
    }
});