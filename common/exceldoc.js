var $$_XML_HEAD = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n';
var _excelColCaption = function (col) {
	if (col >= 26) {
		col -= 26;
		return String.fromCharCode(_int(col / 26) + 65) + String.fromCharCode(_int(col % 26) + 65);
	} else {
		return String.fromCharCode(col + 65);
	}
};
var _formatIndentXml = function (xml) {
    var formatted = '';
    var reg = /(>)(<)(\/*)/g;
    xml = xml.replace(reg, '$1\r\n$2$3');
    var pad = 0;

    var nodes = xml.split('\r\n');
    for (var index = 0, len = nodes.length; index < len; index++) {
    	var node = nodes[index];
        var indent = 0;
        if (node.match( /.+<\/\w[^>]*>$/ )) {
            indent = 0;
        } else if (node.match( /^<\/\w/ )) {
            if (pad != 0) {
                pad -= 1;
            }
        } else if (node.match( /^<\w[^>]*[^\/]>.*$/ )) {
            indent = 1;
        } else {
            indent = 0;
        }

        var padding = '';
        for (var i = 0; i < pad; i++) {
            padding += '  ';
        }

        formatted += padding + node + '\r\n';
        pad += indent;
    };

    return formatted;
};

var ExcelStrings = defineClass("ExcelStrings", null, {
	init: function (workbook) {
		this._super();
		this._workbook = workbook;
		this._nextId = 0;
		this._count = 0;
		this._stringMap = {};
		this._strings = [];
	},
	count: function () { return this._count; },
	uniqueCount: function () { return this._nextId; },
	add: function (text) {
		this._count++;
		var id = this._stringMap[text];
		if (id === undefined) {
			id = this._nextId++;
			this._stringMap[text] = id;
			this._strings[id] = text;
		}
		return id;
	},
	getIndex: function (text) {
		return this._stringMap[text];
	},
	createPart: function () {
		var s = '<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"></sst>';
		var doc = _parseXml(s);
		var root = doc.documentElement;
		var spaceTest = /^\s|\s$/;
		root.setAttribute("count", this._count);
		root.setAttribute("uniqueCount", this._nextId);
		for (var i = 0, cnt = this._strings.length; i < cnt; i++) {
			var node = doc.createElement("si");
			root.appendChild(node);
			var child = doc.createElement("t");
			node.appendChild(child);
			var text = doc.createTextNode(this._strings[i]);
			child.appendChild(text);
			spaceTest.test(this._strings[i]) ? child.setAttribute("xml:space","preserve") : null;			
		}
		s = _xmlToStr(doc);
		// return _formatIndentXml($$_XML_HEAD + s);
		return $$_XML_HEAD + s; // sheetJS에서 formatting된 SharedString을 못읽는다.
	}
});
var ExcelFont = function () {
	this.id = undefined;
	this.name = "Tahoma";
	this.size = 10;
	this.color = "ff000000";
	this.bold = false;
	this.italic = false;
	this.scheme = undefined;
};
ExcelFont.prototype.serialize = function (doc, node) {
	_addChildWithAttr(doc, node, "sz", "val", this.size || 10);
	_addChildWithAttr(doc, node, "name", "val", this.name || "Calibri");
	_addChildWithAttr(doc, node, "color", "rgb", this.color || "ff000000");
	_addChildWithAttr(doc, node, "b", "val", this.bold ? "true" : "false");
	_addChildWithAttr(doc, node, "i", "val", this.italic ? "true" : "false");
};
var ExcelFill = function () {
	this.id = undefined;
	this.patternType = "none";
	this.color = undefined;
	this.gradient = undefined;
	this.color2 = undefined;
	this.degree = "90";
	this.tint = 0;
	this.serialize = function (doc, node) {
		var color;
		if (this.gradient == "linear") {
			var gradient = doc.createElement("gradientFill");
			node.appendChild(gradient);
			gradient.setAttribute("degree", this.degree);
			var stop = doc.createElement("stop");
			gradient.appendChild(stop);
			stop.setAttribute("position", "0");
			color = doc.createElement("color");
			stop.appendChild(color);
			color.setAttribute("rgb", this.color);
			color.setAttribute("tint", this.tint);
			stop = doc.createElement("stop");
			gradient.appendChild(stop);
			stop.setAttribute("position", "1");
			color = doc.createElement("color");
			stop.appendChild(color);
			color.setAttribute("rgb", this.color2);
			color.setAttribute("tint", this.tint);
		} else {
			var pattern = doc.createElement("patternFill");
			node.appendChild(pattern);
			pattern.setAttribute("patternType", this.patternType);
			if (this.patternType != "none") {
				color = doc.createElement("fgColor");
				pattern.appendChild(color);
				color.setAttribute("rgb", this.color);
				color.setAttribute("tint", this.tint);
				/*
				 color = doc.createElement("bgColor");
				 pattern.appendChild(color);
				 color.setAttribute("rgb", "ffffffff");
				 color.setAttribute("tint", "0");
				 */
			}
		}
	}
};
var ExcelBorder = function () {
	this.id = undefined;
	this.left = undefined;
	this.right = undefined;
	this.top = undefined;
	this.bottom = undefined;
};
ExcelBorder.prototype.serialize = function (doc, node) {
	this.serializeBorder(doc, node, "left");
	this.serializeBorder(doc, node, "right");
	this.serializeBorder(doc, node, "top");
	this.serializeBorder(doc, node, "bottom");
};
ExcelBorder.prototype.serializeBorder = function (doc, parent, border) {
	var node = doc.createElement(border);
	parent.appendChild(node);
	border = this[border];
	if (border) {
		node.setAttribute("style", "thin");
		var color = doc.createElement("color");
		node.appendChild(color);
		color.setAttribute("rgb", border._color.toColorHex());
	}
};
var ExcelStyle = function () {
	this.id = undefined;
	this.horzAlign = ExcelStyle.ALIGN_NEAR;
	this.vertAlign = ExcelStyle.VALIGN_CENTER;
	this.wrapText = false;
	this.formatId = 0;
	this.font = null;		// ExcelFont
	this.fill = null;		// ExcelFill
	this.border = null;		// ExcelBorder
	this.xfId = 0; 			// first cellStyleXf
};
ExcelStyle.ALIGN_NEAR = "left";
ExcelStyle.ALIGN_CENTER = "center"; // "centerContinuous"
ExcelStyle.ALIGN_FAR = "right";
ExcelStyle.VALIGN_NEAR = "top";
ExcelStyle.VALIGN_CENTER = "center"; // "center"
ExcelStyle.VALIGN_FAR = "bottom";
ExcelStyle.prototype.clone = function () {
	var es = new ExcelStyle();
	for (var p in this) {
		if (this.hasOwnProperty(p)) {
			es[p] = this[p];
		}
	}
	es.id = undefined;
	return es;
};
ExcelStyle.prototype.serialize = function (doc, node) {
	this.border && node.setAttribute("borderId", this.border ? this.border.id :"0");
	this.fill && node.setAttribute("fillId", this.fill ? this.fill.id : "0");
	this.font && node.setAttribute("fontId", this.font ? this.font.id : "0");
	node.setAttribute("numFmtId", this.formatId);
	node.setAttribute("xfId", "0");
	var align = doc.createElement("alignment");
	node.appendChild(align);
	align.setAttribute("horizontal", this.horzAlign);
	align.setAttribute("vertical", this.vertAlign);
	this.wrapText && align.setAttribute("wrapText", "1");
};
$$_EXCEL_NUMFMT_START = 200;
var ExcelStyles = defineClass("ExcelStyles", null, {
	init: function (workbook) {
		this._super();
		this._book = workbook;
		this._fonts = [];
		this._fills = [];
		this._borders = [];
		this._numFormats = [];
		this._xfs = [];
		var fill = new ExcelFill();
		this._fills.push(fill, fill);
		var border = new ExcelBorder();
		this._borders.push(border);
		var font = new ExcelFont();
		this._fonts.push(font);
		var style = new ExcelStyle();
		this._xfs.push(style);
	},
	addFont: function (font) {
		if (font) {
			this._fonts.push(font);
			return font.id = this._fonts.length - 1;
		}
		return 0;
	},
	addFill: function (fill) {
		if (fill) {
			this._fills.push(fill);
			return fill.id = this._fills.length - 1;
		}
		return 0;
	},
	addBorder: function (border) {
		if (border) {
			this._borders.push(border);
			return border.id = this._borders.length - 1;
		}
		return 0;
	},
	addNumberFormat: function (format) {
		var idx = this._numFormats.indexOf(format);
		if (idx < 0) {
			this._numFormats.push(format);
			idx = this._numFormats.length - 1;
		}
		return $$_EXCEL_NUMFMT_START + idx;
	},
	add: function (style) {
		if (style) {
			this._xfs.push(style);
			return style.id = this._xfs.length - 1;
		}
		return 0;
	},
	createPart: function () {
		var s = '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"></styleSheet>';
		var doc = _parseXml(s);
		var root = doc.documentElement;
		if (this._numFormats.length > 0) {
			var numFmts = doc.createElement("numFmts");
			root.appendChild(numFmts);
			this.$_createNumberFormats(doc, numFmts);
		}
		var fonts = doc.createElement("fonts");
		root.appendChild(fonts);
		this.$_createFonts(doc, fonts);
		var fills = doc.createElement("fills");
		root.appendChild(fills);
		this.$_createFills(doc, fills);
		var borders = doc.createElement("borders");
		root.appendChild(borders);
		this.$_createBorders(doc, borders);
		var defXfs = doc.createElement("cellStyleXfs");
		root.appendChild(defXfs);
		this.$_createDefXfs(doc, defXfs);
		var xfs = doc.createElement("cellXfs");
		root.appendChild(xfs);
		this.$_createXfs(doc, xfs);
		s = _xmlToStr(doc);
		// return _formatIndentXml($$_XML_HEAD + s);
		return $$_XML_HEAD + s;
	},
	$_createNumberFormats: function (doc, parent) {
		for (var i = 0, cnt = this._numFormats.length; i < cnt; i++) {
			var node = doc.createElement("numFmt");
			_setXmlAttr(node, 'formatCode', this._numFormats[i]);
			_setXmlAttr(node, 'numFmtId', $$_EXCEL_NUMFMT_START + i);
			parent.appendChild(node);
		}
	},
	$_createFonts: function (doc, parent) {
		if (this._fonts.length < 1) {
			var f = new ExcelFont();
			this._fonts.push(f);
		}
		for (var i = 0, cnt = this._fonts.length; i < cnt; i++) {
			var node = doc.createElement("font");
			this._fonts[i].serialize(doc, node);
			parent.appendChild(node);
		}
		parent.setAttribute("count", this._fonts.length);
	},
	$_createFills: function (doc, parent) {
		if (this._fills.length < 1) {
			var f = new ExcelFill();
			this._fills.push(f);
		}
		for (var i = 0, cnt = this._fills.length; i < cnt; i++) {
			var node = doc.createElement("fill");
			this._fills[i].serialize(doc, node);
			parent.appendChild(node);
		}
		parent.setAttribute("count", this._fills.length);
	},
	$_createBorders: function (doc, parent) {
		if (this._borders.length < 1) {
			var b = new ExcelBorder();
			this._borders.push(b);
		}
		for (var i = 0, cnt = this._borders.length; i < cnt; i++) {
			var node = doc.createElement("border");
			this._borders[i].serialize(doc, node);
			parent.appendChild(node);
		}
		parent.setAttribute("count", this._borders.length);
	},
	$_createDefXfs: function (doc, parent) {
		var node = doc.createElement("xf");
		parent.appendChild(node);
		node.setAttribute("borderId", 0);
		node.setAttribute("fillId", 0);
		node.setAttribute("fontId", 0);
		node.setAttribute("numFmtId", 0);
		parent.setAttribute("count", 1);
	},
	$_createXfs: function (doc, parent) {
		if (this._xfs.length < 1) {
			var f = new ExcelStyle();
			this._xfs.push(f);
		}
		for (var i = 0, cnt = this._xfs.length; i < cnt; i++) {
			var xf = this._xfs[i];
			var node = doc.createElement("xf");
			xf.serialize(doc, node);
			parent.appendChild(node);
		}
		parent.setAttribute("count", this._xfs.length);
	}
});
var ExcelColumn = function () {
	this.index = undefined;
	this.width = 10;
	this.style = null;	// ExcelStyle
	this.serialize = function (doc, node) {
		node.setAttribute("min", this.index);
		node.setAttribute("max", this.index);
		node.setAttribute("width", this.width);
		this.style && node.setAttribute("style", this.style.id);
	}
};
var ExcelSheet = defineClass("ExcelSheet", null, {
	init: function (workbook) {
		this._super();
		this._book = workbook;
		this._columns = null;
		this._doc = null;
		this._viewRoot = null;
		this._dataRoot = null;
		this._mergeRoot = null;
		this._rows = [];
		this._mergeCount = 0;
		this._outlineLevel = 0;
		this.$_preparePart();
		this._dateConverter = DatetimeConverter.Default;
	},
	colCount: function () {
		return this._columns.length;
	},
	rowCount: function () {
		return this._rows.length;
	},
	setColumns: function (columns) {
		this._columns = columns;
	},
	addRow: function (r, ht) {
		var row = this._rows[r];
		if (!row) {
			var row = this._doc.createElement("row");
			row.setAttribute("r", r + 1);
			this._rows[r] = row;
			this._dataRoot.appendChild(row);
		}
		if (row && ht && ht > -1) { 
			row.setAttribute("ht", ht);
		 	row.setAttribute("customHeight","1");
		 }
		return row;
	},
	setRowLevel: function (r, level) {
		if (level >= 0) {
			var row = this._rows[r];
			if (row) {
				row.setAttribute("outlineLevel", level);
				this._outlineLevel = Math.max(level, this._outlineLevel);
			}
		}
	},
	addBlank: function (r, c, s, ht) {
		var row = this.addRow(r, ht);
		var cell = this._doc.createElement("c");
		cell.setAttribute("r", _excelColCaption(c) + (r + 1));
		s && cell.setAttribute("s", s.id);
		row.appendChild(cell);
	},
	addMerge: function (r, c, rows, cols) {
		var range = _excelColCaption(c) + (r + 1) + ":" + _excelColCaption(c + cols - 1) + (r + rows);
		var cell = this._doc.createElement("mergeCell");
		cell.setAttribute("ref", range);
		this._mergeRoot.appendChild(cell);
		this._mergeCount++;
	},
	$_addCell: function (r, c, t, value, s, ht) {
		var row = this.addRow(r, ht);
		var cell = this._doc.createElement("c");
		cell.setAttribute("r", _excelColCaption(c) + (r + 1));
		cell.setAttribute("t", t);
		s && cell.setAttribute("s", s.id);
		row.appendChild(cell);
		var v = this._doc.createElement("v");
		v.appendChild(this._doc.createTextNode(value));
		cell.appendChild(v);
	},
	addText: function (r, c, value, style, ht) {
		var s = (value !== undefined && value !== null) ? value : "";
		s = this._book.addString(s);
		this.$_addCell(r, c, "s", s, style, ht);
	},
	addNumber: function (r, c, value, style, rowSpan, colSpan, ht) {
		var s = isNaN(value) ? "" : String(value);
		this.$_addCell(r, c, "n", s, style, ht);
	},
	addBool: function (r, c, value, style, rowSpan, colSpan, ht) {
		this.$_addCell(r, c, "b", value ? 1 : 0, style, ht);
	},
	addDate: function (r, c, value, style, rowSpan, colSpan, compatibility, ht) {
		if (value) {
			// if (compatibility) { //for excel 2007
				var n = this._dateConverter.toExcelDate(value);
				this.addNumber(r, c, n, style, rowSpan, colSpan, ht);
			// } else {
			// 	var d = this.$_dateToStr(value);
			// 	this.$_addCell(r, c, "d", d, style, ht);
			// }
		} else {
			this.$_addCell(r, c, "s", "", style, ht);
		}
	},
	createPart: function () {
		var doc = this._doc;
		var root = doc.documentElement;
		/*
		var views = doc.createElement("sheetViews");
		root.appendChild(views);
		var view = doc.createElement("sheetView");
		views.appendChild(view);
		view.setAttribute("tabSelected", "1");
		view.setAttribute("workbookViewId", "0");
		var pane = doc.createElement("pane");
		view.appendChild(pane);
		pane.setAttribute("state", "forzen");
		pane.setAttribute("activePane", "bottomLeft");
		pane.setAttribute("topLeftCell", "A2");
		pane.setAttribute("ySplit", "1");
		var sel = doc.createElement("selection");
		view.appendChild(sel);
		sel.setAttribute("pane", "bottomLeft");
		*/
		var ref = "A1:"+_excelColCaption(this._columns.length-1)+this._book._sheet._rows.length;
		var dim = doc.getElementsByTagName("dimension");
		dim && dim.length > 0 && dim[0].setAttribute("ref",ref);
		if (this._outlineLevel > 0) {
			var fmtPtr = doc.createElement("sheetFormatPtr");
			root.appendChild(fmtPtr);
			fmtPtr.setAttribute("outlineLevelRow", this._outlineLevel);
		}
		if (this._columns) {
			var cols = doc.createElement("cols");
			root.appendChild(cols);
			this.$_createCols(doc, cols);
		}
		root.appendChild(this._dataRoot);
		if (this._mergeCount > 0) {
			root.appendChild(this._mergeRoot);
			this._mergeRoot.setAttribute("count", this._mergeCount);
		}
		var s = _xmlToStr(doc);
		return _formatIndentXml($$_XML_HEAD + s);
	},
	$_preparePart: function () {
		var s = '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"></worksheet>';
		var doc = this._doc = _parseXml(s);
		var dim = doc.createElement("dimension");
		doc.documentElement.appendChild(dim);
		var views = doc.createElement("sheetViews");
		doc.documentElement.appendChild(views);
		var view = this._viewRoot = doc.createElement("sheetView");
		views.appendChild(view);
		view.setAttribute("workbookViewId", "0"); // required attr.
		view.setAttribute("tabSelected", "1");
		view.setAttribute("showOutlineSymbols", "true"); // 기본값이 true.
		this._dataRoot = doc.createElement("sheetData");
		this._mergeRoot = doc.createElement("mergeCells");
	},
	$_createCols: function (doc, elt) {
		var cols = this._columns;
		//elt.setAttribute("count", cols.length);
		for (var i = 0, cnt = cols.length; i < cnt; i++) {
			var col = cols[i];
			var node = doc.createElement("col");
			col.serialize(doc, node);
			elt.appendChild(node);
		}
	},
	$_dateToStr: function (d) {
		return _pad(d.getFullYear(),4) + _pad((d.getMonth() + 1), 2) + _pad(d.getDate(), 2) +
			"T" + _pad(d.getHours(),2) + _pad(d.getMinutes(), 2) + _pad(d.getSeconds(), 2);
	}
});
var ExcelWorkbook = defineClass("ExcelWorkbook", null, {
	init: function () {
		this._super();
		this._parts = {};
		this._sst = new ExcelStrings(this);
		this._styles = new ExcelStyles(this);
		this._sheet = new ExcelSheet(this);
		this.$_preapreTemplateParts();
	},
	parts: function () {
		return this._parts;
	},
	sheet: function () {
		return this._sheet;
	},
	addString: function (s) {
		return this._sst.add(s);
	},
	addNumberFormat: function (format) {
		return this._styles.addNumberFormat(format);
	},
	addFill: function (fill) {
		return this._styles.addFill(fill);
	},
	addBorder: function (border) { 
		return this._styles.addBorder(border);
	},
	addFont: function (font) {
		return this._styles.addFont(font);
	},
	addStyle: function (style) {
		return this._styles.add(style);
	},
	createParts: function () {
		var parts = this._parts;
		parts['xl/sharedStrings.xml'] = this._sst.createPart();
		parts['xl/styles.xml'] = this._styles.createPart();
		parts['xl/worksheets/sheet1.xml'] = this._sheet.createPart();
		return parts;
	},
	$_preapreTemplateParts: function () {
		var parts = this._parts;
		parts['[Content_Types].xml'] = $$_XML_HEAD + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>';
		parts['_rels/.rels'] = $$_XML_HEAD + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>';
		parts['docProps/app.xml'] = $$_XML_HEAD + '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>RealGridJS</Application><AppVersion>1.0</AppVersion></Properties>';
		parts['docProps/core.xml'] = $$_XML_HEAD + '<coreProperties xmlns="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dcterms:created xsi:type="dcterms:W3CDTF">2014-12-25T03:06:34Z</dcterms:created><dc:creator>Wooritech</dc:creator></coreProperties>';
		parts['xl/workbook.xml'] = $$_XML_HEAD + '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><workbookPr date1904="false"/><bookViews><workbookView activeTab="0"/></bookViews><sheets><sheet name="Sheet1" r:id="rId3" sheetId="1"/></sheets></workbook>';
		parts['xl/_rels/workbook.xml.rels'] = $$_XML_HEAD + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>';
	}
});