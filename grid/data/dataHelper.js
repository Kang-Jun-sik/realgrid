var /* @internal */ DataHelper = {
	csvToArray: function (provider, source, start, count, quoted, delimiter) {
		start = arguments.length > 2 ? start : 0;
		count = arguments.length > 3 ? count : -1;
		delimiter = arguments.length > 5 ? delimiter : ",";
		var rows = null;
		if (source) {
			var i;
			var s;
			var len;
			var lines = source.split("\r\n");// source.split(/(\r\n|\n|\r)/);
			if (lines.length == 1) {
				lines = source.split("\n");
			}
			if (lines.length == 1) {
				lines = source.split("\r");
			}
			for (i = lines.length - 1; i >= 0; i--) {
				s = lines[i];
				s = s ? s.trim() : null;
				if (s && s.length > 0) {
					break;
				}
				lines.pop();
			}
			len = lines.length;
			if (len > 0) {
				start = Math.max(0, start);
				if (count < 0) {
					count = len;
				}
				count = Math.min(len - start, count);
				if (count > 0) {
					var r;
					var line;
					var vals;
					var flds = provider.getFields();
					var fieldCount = flds.length;
					var hasFlds = fieldCount > 0;
					rows = new Array(count);
					if (quoted) {
						for (r = 0; r < count; r++) {
							line = lines[r + start];
							vals = $_parseCSV(line, delimiter);
							if (hasFlds && vals.length > fieldCount) {
								vals.splice(vals.length, fieldCount - vals.length);
							}
							for (var i = 0; i < fieldCount; i++) {
								vals[i] = flds[i].readValue(vals[i]);
							}
							rows[r] = vals;
						}
					} else {
						for (r = 0; r < count; r++) {
							line = lines[r + start];
							vals = line.split(delimiter);
							if (hasFlds && vals.length > fieldCount) {
								vals.splice(vals.length, fieldCount - vals.length);
							}
							for (var i = 0; i < fieldCount; i++) {
								vals[i] = flds[i].readValue(vals[i]);
							}
							rows[r] = vals;
						}
					}
				}
			}
		}
		return rows;
	},
	xmlToRow: function (xml, fields, fieldNames) {
		var nodes = xml.childNodes;
		var fldCnt = fields.length;
		var vals = new Array(fldCnt);
		var j, len;
		for (j = 0, len = nodes.length; j < len; j++) {
			var node = nodes[j];
			var c;
			if ((c = fieldNames.indexOf(node.tagName)) >= 0) {
				vals[c] = fields[c].readValue(node.nodeValue || (node.hasChildNodes() && node.childNodes[0].nodeType === 3 && node.childNodes[0].nodeValue));
			}
		}
		for (j= 0; j < fldCnt; j++) {
			if (vals[j] === undefined) {
				vals[j] = fields[j].readValue(_getXmlAttr(xml, fieldNames[j]));
			}
		}
		return vals;
	},
	xmlToArray: function (provider, xmlList, start, count) {
		start = arguments.length > 2 ? start : 0;
		count = arguments.length > 3 ? count : -1;
		var rows = null;
		var xmlToRow = DataHelper.xmlToRow;
		var cnt = xmlList ? xmlList.length : 0;
		if (cnt) {
			start = Math.max(0, start);
			if (count < 0) {
				count = cnt;
			}
			count = Math.min(cnt - start, count);
			if (count) {
				var flds = provider.getFields();
				var fldNames = provider.getOrgFieldNames();
				var fldCnt = flds.length;
				rows = new Array(count);
				for (var i = 0; i < count; i++) {
					var xml = xmlList[i + start];
					var vals = xmlToRow(xml, flds, fldNames);
					rows[i] = vals;
				}
			}
		}
		return rows;
	}
};
var $_parseCSV = function (line, delimiter) {
	var words = [];
	if (line && line.length > 0) {
		var c;
		var d;
		var prev = 0;
		var q1 = -1;
		var q2 = -1;
		var q = false;
		var qq = false;
		var len = line.length;
		var w = null;
		for (var i = 0; i < len; i++) {
			c = line.charAt(i);
			if (c == delimiter) {
				if (!q) {
					d = i - prev;
					if (d <= 0) {
						w = "";
					} else if (q2 == i - 1 && q1 == prev) {
						w = line.substring(q1 + 1, q2);
						if (qq) {
							w = w.replace('""', '"');
						}
					} else {
						w = line.substring(prev, i);
					}
					words.push(w);
					q = qq = false;
					prev = i + 1;
				}
			} else if (c == '"') {
				if (!q) {
					q1 = i;
					q2 = -1;
					q = true;
				} else if (q2 < 0) {
					q2 = i;
					q = false;
				} else if (q2 == i - 1) {
					qq = true;
					q = true;
					q2 = -1;
				}
			} /*else {
				w += c;
			}*/
		}
		if (prev < len) {
			if (q2 == len - 1 && q1 == prev) {
				w = line.substring(q1 + 1, q2);
				if (qq) {
					w = w.replace('""', '"');
				}
			} else {
				w = line.substring(prev, len);
			}
			words.push(w);
		}
	}
	return words;
};