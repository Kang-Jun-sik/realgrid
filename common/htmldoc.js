var HtmlSheet = defineClass("HtmlSheet", null, {
    init : function () {
        this._headrow = -1;
        this._bodyrow = -1;
        this._footrow = -1;
        this._headrows = [];
        this._bodyrows = [];
        this._footrows = [];
        this._selfClasses = {};
    
        this._numberFormatter = null;
        this._datetimeWriter = null;
        this._boolFormatter = null;
        this._lineExp = new RegExp("\r\n|\r|\n", "gi");
    },
    addHeadRow: function () {
        this._headrows[++this._headrow] = [];
        return this._headrow;
    },
    addBodyRow: function () {
        this._bodyrows[++this._bodyrow] = [];
        return this._bodyrow;
    },
    addFootRow: function () {
        this._footrows[++this._footrow] = [];
        return this._footrow;
    },
    addHeader: function (column, text, styles, rowspan, colspan) {
        var html = "<th";
        if (rowspan > 1) {
            html += " rowspan=" + rowspan;
        }
        if (colspan > 1) {
            html += " colspan=" + colspan;
        }
        
        html += " class='" + this.$_getCssClasses(column, "rg-header");
        //html += " style='";
        //html += this.$_makeCellStyleToHtml(styles);
        html += "'>";

        html += this.$_makeInnerCellToHtml(column, "rg-header", text, styles, true);
        html += "</th>";
        this._headrows[this._headrow].push(html);
    },
    addFooterText: function (column, text, styles, rowspan, colspan) {
        if (text === null || text === UNDEFINED) {
            text = "";
        }
        if (text) {
            var f;
            if ((f = styles.prefix()) != null) {
                text = f + text;
            }
            if ((f = styles.suffix()) != null) {
                text += f;
            }
        }

        var html = "<th";
        if (rowspan > 1) {
            html += " rowspan=" + rowspan;
        }
        if (colspan > 1) {
            html += " colspan=" + colspan;
        }
        html += " class='" + this.$_getCssClasses(column, "rg-footer") + "'>";

        html += this.$_makeInnerCellToHtml(column, "rg-footer", text, styles, false);
        html += "</td>";
        this._footrows[this._footrow].push(html);
    },
    addFooterNumber: function (column, value, styles, rowspan, colspan) {
        var text = value + "";
        var f;
        if (value && typeof value == "number") {
            if (f = styles.numberFormat()) {
                this.$_setNumberFormat(f);
                text = this._numberFormatter.format(value);
            }
        }
        this.addFooterText(column, text, styles, rowspan, colspan);
    },

    addBlank: function (column, styles, rowspan, colspan) {
        if (this._domMode) {
            var cell = this._doc.createElement("td");
            if (rowspan > 1) {
                cell.setAttribute("rowspan", rowspan);
            }
            if (colspan > 1) {
                cell.setAttribute("colspan", colspan);
            }
            this.$_buildCellStyle(cell, styles);
            this._row.appendChild(cell);
        } else {
            var html = "<td ";
            html += " class='" + this.$_getCssClasses(column, "rg-body");
            html += ">&nbsp;</td>"
            this._bodyrows[this._bodyrow].push(html);
        }
    },
    addText: function (column, text, styles, rowspan, colspan, affixed) {
        affixed = arguments.length > 7 ? affixed : true;

        if (text === null || text === UNDEFINED) {
            text = "";
        }
        if (affixed) {
            var f;
            if ((f = styles.prefix()) != null) {
                text = f + text;
            }
            if ((f = styles.suffix()) != null) {
                text += f;
            }
        }

        var html = "<td";
        if (rowspan > 1) {
            html += " rowspan=" + rowspan;
        }
        if (colspan > 1) {
            html += " colspan=" + colspan;
        }
        html += " class='" + this.$_getCssClasses(column, "rg-body") + "'>";

        html += this.$_makeInnerCellToHtml(column, "rg-body", text, styles, false, rowspan);
        html += "</td>";
        this._bodyrows[this._bodyrow].push(html);
    },
    addNumber: function (column, value, styles, rowspan, colspan) {
        var text = value + "";
        var f;
        if (value && typeof value == "number") {
            if (f = styles.numberFormat()) {
                this.$_setNumberFormat(f);
                text = this._numberFormatter.format(value);
            }
        }
        this.addText(column, text, styles, rowspan, colspan);
    },
    addDate: function (column, value, styles, rowspan, colspan) {
        var text = "";
        var f;
        if (value && value instanceof Date) {
            if (f = styles.datetimeFormat()) {
                this.$_setDatetimeFormat(f);
                text = this._datetimeWriter.getText(value);
            } else {
                var defaultWriter = DateTimeWriter.Default;
                text = defaultWriter.getText(value);
            }
        }
        this.addText(column, text, styles, rowspan, colspan);
    },
    addBool: function (column, value, styles, rowspan, colspan) {
        var text = "";
        var f;
        if (typeof value == "boolean") {
            if (f = styles.booleanFormat()) {
                this.$_setBooleanFormat(f);
                text = this._boolFormatter.formatValue(value);
            } else {
                text = value.toString();
            }
        }
        this.addText(column, text, styles, rowspan, colspan);
    },
    serialize: function () {
        var i, j;
        
        var html = "<style type='text/css'>";
        for (var selfcls in this._selfClasses) {
            html += this._selfClasses[selfcls] + " ";
        }
        html += "</style><table class='rg-html-table' style='border-spacing:0px'>";
        if (this._headrows.length > 0) {
            html += "<thead>";
            for (i = 0; i < this._headrows.length; i++) {
                html += "<tr>";
                html += this._headrows[i].join("");
                html += "</tr>"
            }
            html += "</thead>";
        }
        if (this._bodyrows.length > 0) {
            html += "<tbody>";
            for (i = 0; i < this._bodyrows.length; i++) {
                html += "<tr>";
                html += this._bodyrows[i].join("");
                html += "</tr>"
            }
            html += "</tbody>";       
        }
        if (this._footrows.length > 0) {
            html += "<tfoot>";
            for (i = 0; i < this._footrows.length; i++) {
                html += "<tr>";
                html += this._footrows[i].join("");
                html += "</tr>"
            }
            html += "</tfoot>";
        }
        html += "</html>";
        return html;
    },
    $_setNumberFormat: function (value) {
        if (value != this._numberFormat) {
            this._numberFormat = value;
            if (value) {
                this._numberFormatter = new DecimalFormatter(value);
            } else {
                this._numberFormatter = null;
            }
        }
    },
    $_setDatetimeFormat: function (value) {
        if (value != this._datetimeFormat) {
            this._datetimeFormat = value;
            if (value) {
                this._datetimeWriter = new DateTimeWriter(value);
            } else {
                this._datetimeWriter = null;
            }
        }
    },
    $_setBooleanFormat: function (value) {
        if (value != this._booleanFormat) {
            this._booleanFormat = value;
            if (value) {
                this._boolFormatter = new BooleanFormatter(value);
            } else {
                this._boolFormatter = null;
            }
        }
    },
    $_makeInnerCellToHtml: function (column, rootClass, text, styles, autoWrap) {
        if (!styles.textAlignment) debugger;
        var halign = styles.textAlignment();
        var valign = styles.lineAlignment();

        var html = "<div class='" + this.$_getCssClasses(column, rootClass + "-layout");
        var selfclass = this.$_getSelfCssClasses(column, rootClass + "-layout", styles);
        if (selfclass) {
            html += " " + selfclass;
        }            

        if (rootClass == "rg-body") {
            html += " " + (halign == Alignment.FAR ? "rg-right"  : halign == Alignment.NEAR ? "rg-left" : "rg-center");
            html += " " + (valign == Alignment.FAR ? "rg-bottom" : valign == Alignment.NEAR ? "rg-top"  : "rg-middle");
            if (!autoWrap && styles.textWrap() != TextWrapMode.NORMAL) {
                html += " rg-nowrap";
            }
        }
        html += "'>"
        html += "<div class='" + this.$_getCssClasses(column, rootClass + "-text");
        text = this.$_htmlEscape(text);
        if (text && styles.textWrap() != TextWrapMode.NONE && text.match(this._lineExp)) {
            text = text.replace(this._lineExp, "<br/>");
        }
        html += "'>" + text + "</div></div>";
        return html;
    },
    $_getCssClasses: function (column, pclass) {
        var classes = pclass;
        var partcls = pclass; 
        if (!(column instanceof ValueColumn)) {
            partcls += "-" + (column instanceof Indicator ? "indicator" : column instanceof CheckBar ? "checkbar" : "group");
            classes += " " + partcls;
        }
        var name;
        if (column instanceof Column) {
            var namecls;
            if (name = column.name()) {
                namecls = partcls + "-" + name.replace(" ", "_"); 
                classes += " " + namecls;
            }           
        }
        return classes;
    },
    $_getSelfCssClasses: function (column, pclass, styles) {
        if (column instanceof Column) {
            var borderLeft = styles.borderLeft() ? styles.borderLeft()._width : 0;
            var borderRight = styles.borderRight() ? styles.borderRight()._width : 0;
            var borderTop = styles.borderTop() ? styles.borderTop()._width : 0;
            var borderBottom = styles.borderBottom() ? styles.borderBottom()._width : 0;
            var paddingLeft = styles.paddingLeft();
            var paddingRight = styles.paddingRight()
            var paddingTop = styles.paddingTop();
            var paddingBottom = styles.paddingBottom();
            var spaceWidth = borderLeft + borderRight + paddingLeft + paddingRight;
            var spaceHeight = borderTop + borderBottom + paddingTop + paddingBottom;

            var hash = column.$_hash;
            var sclass = pclass + "-self-" + hash;

            if (!this._selfClasses[sclass]) {
                this._selfClasses[sclass] = "div." + sclass + 
                    "{ width: " + (column.displayWidth()-spaceWidth-1) + 
                    "px; height:" + (column.measuredHeight()-spaceHeight) + 
                    "px; padding-left:" + paddingLeft + 
                    "px; padding-top:" + paddingTop +
                    "px; padding-right:" + paddingRight +
                    "px; padding-bottom:" + paddingBottom + "px }";
            }
            return sclass; 
        }
        return null;
    },
    $_headCount: function() {
        return this._head.children.length;
    },
    $_bodyCount: function() {
        return this._body.children.length;
    },  
    $_colCount: function() {
        return this._row.children.length;
    },
    $_htmlEscape: function (text) {
        if (text && typeof text == "string") {
            return text
                .replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        } else {
            return text;
        }
    }
});
