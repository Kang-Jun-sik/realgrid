var SeriesTextCellRenderer = defineClass("SeriesTextCellRenderer", TextCellRenderer, {
	init: function () {
		this._super();
	},
	_getText: function (cell) {
		var vals = cell.value();
		return SeriesCell.getText(vals);
	}
});
SeriesTextCellRenderer.Default = new SeriesTextCellRenderer();
var /* abstract */ SeriesCellRenderer = defineClass("SeriesCellRenderer", DataCellRenderer, {
	init: function () {
		this._super();
		this.setMinWidth(100);
	},
	_getValues: function (cell) {
		return cell.value() || [];
	}
}); 
var /* abstract */ SparkChartRenderer = defineClass("SparkChartRenderer", SeriesCellRenderer, {
	init: function() {
		this._super();
	},
	baseValue: NaN,
	firstFill: null,
	lastFill: null,
	highFill: null,
	lowFill: null,
	belowFill: null,
	pointFill: null,
	setFirstFill: function (value) {
		if (value != this._firstFill) {
			this._firstFill = VisualStyles.getFill(value);
			this._changed();
		}
	},
	setLastFill: function (value) {
		if (value != this._lastFill) {
			this._lastFill = VisualStyles.getFill(value);
			this._changed();
		}
	},
	setPointFill: function (value) {
		if (value != this._PointFill) {
			this._pointFill = VisualStyles.getFill(value);
			this._changed();
		}
	},
	setHighFill: function (value) {
		if (value != this._highFill) {
			this._highFill = VisualStyles.getFill(value);
			this._changed();
		}
	},
	setLowFill: function (value) {
		if (value != this._lowFill) {
			this._lowFill = VisualStyles.getFill(value);
			this._changed();
		}
	},
	setBelowFill: function (value) {
		if (value != this._belowFill) {
			this._belowFill = VisualStyles.getFill(value);
			this._changed();
		}
	},
	render: function (cell, g, r) {
		var values = this._getValues(cell);
		if (values && values.length) {
			var i, v, base,
				cnt = values.length,
				min = values[0],
				max = values[0];
			i = 1;
			while (isNaN(min) && i < cnt) {
				max = min = values[i++];
			}
			for (; i < cnt; i++) {
				v = Number(values[i]);
				if (!isNaN(v)) {
					if (v < min) min = v;
					if (v > max) max = v;
				}
			}
			base = isNaN(this._baseValue) ? min : this._baseValue;
			if (!isNaN(min)) {
				this._renderChart(cell, g, r, values, min, max, base);
			}
		}
	},
	_renderChart: function(cell, g, r, values, minimum, maximum, base) {
	},
	_getPoints: function (cell, r, values, minimum, maximum) {
		var i, x, y, v,
			cnt = values.length,
			pts = [],
			sx = r.x + cell.paddingLeft(),
			w = r.width - cell.paddingHorz(),
			sy = r.y + cell.paddingTop(),
			h = r.height - cell.paddingVert(),
			len = maximum - minimum;
		for (i = 0; i < cnt; i++) {
			v = Number(values[i]);
			x = sx + i / (cnt - 1) * w;
			y = sy + (isNaN(v) ? h : (1 - (v - minimum) / len) * h);
			pts.push(x, y);
		}
		return pts;
	},
	_getBasePoint: function (cell, r, minimum, maximum, base) {
		var h = r.height - cell.paddingVert();
		var sy = r.y + cell.paddingTop();
		var len = maximum - minimum;
		var y = sy + (isNaN(base) ? h : (1 - (base - minimum) / len) * h);
		return y;
	}
}); 
var SparkLineRenderer = defineClass("SparkLineRenderer", SparkChartRenderer, {
	init : function() {
		this._super();
	},
	curved: false,
	_renderChart: function(cell, g, r, values, minimum, maximum, base) {
		var stroke = cell.line();
		if (!stroke) {
			return;
		}
		var max = isNaN(base) ? maximum : Math.max(maximum, base);
		var min = isNaN(base) ? minimum : Math.min(minimum, base);
		var pts = this._getPoints(cell, r, values, min, max);
		var i, x, y, fill;
		var cnt = values.length;
		for (i = 0; i < cnt - 1; i++) {
			g.drawLine(stroke, pts[i * 2], pts[i * 2 + 1], pts[(i + 1) * 2], pts[(i + 1) * 2 + 1]);
			if (fill = this.pointFill()) {
				x = pts[i * 2];
				y = pts[i * 2 + 1];
				g.drawCircle(fill, null, x, y, 2);	
			}
		}
		if (fill = this.firstFill()) {
			x = pts[0];
			y = pts[1];
			g.drawCircle(fill, null, x, y, 2);
		}
		if (fill = this.lastFill()) {
			x = pts[(cnt - 1) * 2];
			y = pts[(cnt - 1) * 2 + 1];
			g.drawCircle(fill, null, x, y, 2);
		}
		if (fill = this.highFill()) {
			for (i = 0; i < cnt; i++) {
				if (values[i] >= maximum) {
					x = pts[i * 2];
					y = pts[i * 2 + 1];
					g.drawCircle(fill, null, x, y, 2);
				}
			}
		}
		if (fill = this.lowFill()) {
			for (i = 0; i < cnt; i++) {
				if (values[i] <= minimum) {
					x = pts[i * 2];
					y = pts[i * 2 + 1];
					g.drawCircle(fill, null, x, y, 2);
				}
			}
		}
	}
}); 
var SparkColumnRenderer = defineClass("SparkColumnRenderer", SparkChartRenderer, {
	init: function() {
		this._super();
	},
	barWidth: 0.8,
	_renderChart: function(cell, g, r, values, minimum, maximum, base) {
		var fill = cell.figureBackground();
		if (!fill) {
			return;
		}
		var max = isNaN(base) ? maximum : Math.max(maximum, base);
		var min = isNaN(base) ? minimum : Math.min(minimum, base);
		if (min == base) {
			min = base -= (max - min) * 0.2;
		}
		var i, v, f, y;
		var cnt = values.length;
		var p = _int(this._getBasePoint(cell, r, min, max, base));
		var w = (r.width - cell.paddingHorz()) / cnt;
		var h = r.height - cell.paddingVert();
		var x = r.x + cell.paddingLeft() + w / 2;
		var len = max - min;
		var cw = _int(w * this._barWidth);
		for (i = 0; i < cnt; i++) {
			v = values[i];
			if (!isNaN(v)) {
				if (v <= minimum && this._lowFill) {
					f = this._lowFill;
				} else if (v >= maximum && this._highFill) {
					f = this._highFill;
				} else if (v < base && this._belowFill) {
					f = this._belowFill;
				} else {
					f = fill;
				}
				y = _int((v - min) * h / len);
				g.drawBoundsI(f, null, _int(x - cw / 2), p, cw, -y); 
			}
			x += w;
		}
	}
}); 
var SparkWinLossRenderer = defineClass("SparkWinLossRenderer", SparkChartRenderer, {
	init: function() {
		this._super();
		this.setBaseValue(0);
	},
	barWidth: 0.8,
	belowHeight: 0.4,
	_renderChart: function(cell, g, r, values, minimum, maximum, base) {
		var fill = cell.figureBackground();
		if (!fill) {
			return;
		}
		var i, v, f, y;
		var cnt = values.length;
		var w = (r.width - cell.paddingHorz()) / cnt;
		var h = r.height - cell.paddingVert();
		var x = r.x + cell.paddingLeft() + w / 2;
		var sy = r.y + cell.paddingTop();
		var cw = w * this._barWidth;
		var p = sy + h * (1 - this._belowHeight);
		for (i = 0; i < cnt; i++) {
			v = values[i];
			if (!isNaN(v) && v != base) {
				f = fill;
				if (v < base && this._belowFill) {
					f = this._belowFill;
				}
				y = (v < base) ? (sy + h) : sy;
				g.drawBoundsI(f, null, _int(x - cw / 2), _int(y), _int(cw), _int(p - y));
			}
			x += w;
		}
	}
}); 
var /* abstract */ TargetActualRenderer = defineClass("TargetActualRenderer", SeriesCellRenderer, {
	init: function() {
		this._super();
		this.setMinWidth(100);
	},
	minValue: 0,
	maxValue: 100,
	render: function (cell, g, r) {
		var values = this._getValues(cell);
		if (values.length >= 2) {
			this._doRender(cell, g, r, values[0], values[1]);
		}
	},
	_getValueRate: function (value) {
		return (value - this._minValue) / (this._maxValue - this._minValue);
	},
	_doRender: function (cell, g, r, targetValue, actualValue) {
	}
}); 
var ActualTargetBulletRenderer = defineClass("ActualTargetBulletRenderer", TargetActualRenderer, {
	init: function() {
		this._super();
		this.setMinWidth(100);
	},
	maximumBackground: null,
	setMaximumBackground: function (value) {
		if (value != this._maximumBackground) {
			this._maximumBackground = VisualStyles.getFill(value);
			this._changed();
		}
	},
	_doRender: function(cell, g, r, targetValue, actualValue) {
		var x = cell.paddingLeft();
		var y = cell.paddingTop();
		var w = r.width - x - cell.paddingRight();
		var h = r.height - y - cell.paddingBottom();
		var fill = this._maximumBackground;
		if (fill) {
			g.drawBounds(fill, null, x, y, w, h);
		}
		fill = cell.figureBackground();
		if (fill) {
			var h2 = h;
			var sz;
			if (sz = cell.figureSize()) {
				h2 = sz.getDimension(h);
			}
			var w2 = w * this._getValueRate(actualValue); 
			var stroke = cell.figureBorder();
			g.drawBoundsI(fill, stroke, x, y + (h - h2) / 2, w2, h2);
		}
		var x2 = x + w * this._getValueRate(targetValue);
		stroke = cell.line();
		if (!stroke) {
			stroke = SolidPen.DKGRAY;
		}
		g.drawLine(stroke, x2, y, x2, y + h);
	}
}); 
var ActualTargetTextRenderer = defineClass("ActualTargetTextRenderer", SeriesCellRenderer, {
	init: function() {
		this._super();
		this._actualForeground = SolidBrush.BLACK;
		this._targetForeground = SolidBrush.BLACK;
	},
	separator: " / ",
	actualForeground: null,
	actualFont: null,
	targetForeground: null,
	targetFont: null,
	setActualForeground: function(value) {
		if (value != this._actualForeground) {
			this._actualForeground = VisualStyles.getFill(value) || SolidBrush.BLACK;
			this._changed();
		}
	},
	setActualFont: function (value) {
		if (value != this._actualFont) {
			this._actualFont = VisualStyles.getFont(value);
		}
	},
	setTargetForeground: function(value) {
		if (value != this._targetForeground) {
			this._targetForeground = VisualStyles.getFill(value) || SolidBrush.BLACK;
			this._changed();
		}
	},
	setTargetFont: function (value) {
		if (value != this._targetFont) {
			this._targetFont = VisualStyles.getFont(value);
		}
	},
	_readOption: function (prop, value) {
		switch (prop) {
			case "actualForeground":
			case "targetForeground":
				if (value) return VisualStyles.getFill(value);
				break;
			case "actualFont":
			case "targetFont":
				if (value) return VisualStyles.getFont(value);
				break;
		}
		return value;
	},
	render: function(cell, g, r) {
		var actualFont = this._getOption("actualFont");
		var targetFont = this._getOption("targetFont");
		var values = this._getValues(cell);
		var target = String(values[0]);
		var actual = String(values[1]);
		var wSep = g.getTextWidth(cell.font(), this._separator);
		var wActual = g.getTextWidth(this._actualFont, actual);
		var wTarget = g.getTextWidth(this._targetFont, target);
		var w = wSep + wActual + wTarget;
		var x = r.x + cell.paddingLeft();
		var y = r.y;
		switch (cell.textAlignment()) {
		case Alignment.CENTER:
			x = r.x + (r.width - cell.paddingHorz() - w) / 2;
			break;
		case Alignment.FAR:
			x = r.right() - cell.paddingRight() - w;
			break;
		}
		g.drawTextBounds(actualFont, this._getOption("actualForeground"), actual, x, y, wActual, r.height);
		x += wActual;
		g.drawTextBounds(cell.font(), cell.foreground(), this._separator, x, y, wSep, r.height);
		x += wSep;
		g.drawTextBounds(targetFont, this._getOption("targetForeground"), target, x, y, wTarget, r.height);
	}
}); 