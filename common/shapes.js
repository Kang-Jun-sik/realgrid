var ShapeDrawing = defineClass("ShapeCellRenderer", null, {
	init: function() {
		this._super();
	},
	draw: function (g, r, fill, stroke) {
		if (fill || stroke) {
			this._doDraw(g, r, fill, stroke);
		}
	},
	_doDraw: function (g, r, fill, stroke) {
	}
});
var PolygonShape = defineClass("PolygonShape", ShapeDrawing, {
	init: function(shape) {
		this._super();
		this.setShape(shape);
	},
	shape: null,
	setShape: function (value) {
		this._shape = value ? (value === "inverted_triangle" ? PolygonShape.INVERTED_TRIANLGE : value.toLowerCase()) : null;
	},
	_doDraw: function (g, r, fill, stroke) {
		var pts, points, i, cnt,
			shape = this._shape;
		if ($$_polygonShapes.hasOwnProperty(shape)) {
		 	pts = $$_polygonShapes[shape];
			if (pts) {
				pts = pts.slice();
				for (i = 0, cnt = pts.length / 2; i < cnt; i++) {
					pts[i * 2] = r.x + pts[i * 2] * r.width;
					pts[i * 2 + 1] = r.y + pts[i * 2 + 1] * r.height;
				}
				pts.push(pts[0], pts[1]);
				g.drawPolygonArray(fill, stroke, pts);
			}
		} else if ($$_pairShapes.hasOwnProperty(shape)) {
			points = $$_pairShapes[shape];
			if (points) {
				pts = points[0];
				pts = pts.slice();
				for (i = 0, cnt = pts.length / 2; i < cnt; i++) {
					pts[i * 2] = r.x + pts[i * 2] * r.width;
					pts[i * 2 + 1] = r.y + pts[i * 2 + 1] * r.height;
				}
				pts.push(pts[0], pts[1]);
				g.drawPolygonArray(fill, stroke, pts);
				pts = points[1];
				pts = pts.slice();
				for (i = 0, cnt = pts.length / 2; i < cnt; i++) {
					pts[i * 2] = r.x + pts[i * 2] * r.width;
					pts[i * 2 + 1] = r.y + pts[i * 2 + 1] * r.height;
				}
				pts.push(pts[0], pts[1]);
				g.drawPolygonArray(fill, stroke, pts);
			}
		}
	}
});
PolygonShape.RECTANGLE = "rectangle";
PolygonShape.TRIANLGE = "triangle";
PolygonShape.INVERTED_TRIANLGE = "itriangle";
PolygonShape.DIAMOND = "diamond";
PolygonShape.UP_ARROW = "uparrow";
PolygonShape.DOWN_ARROW = "downarrow";
PolygonShape.LEFT_ARROW = "leftarrow";
PolygonShape.RIGHT_ARROW = "rightarrow";
PolygonShape.PLUS = "plus";
PolygonShape.MINUS = "minus";
PolygonShape.EQUAL = "equal";
PolygonShape.STAR = "star";
var $$_polygonShapes = {
	rectangle: [0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0],
	triangle: [0.5, 0.0, 0.0, 1.0, 1.0, 1.0],
	itriangle: [0.0, 0.0, 0.5, 1.0, 1.0, 0.0],
	diamond: [0.5, 0.0, 0.0, 0.5, 0.5, 1.0, 1.0, 0.5],
	uparrow: [0.5, 0.0, 0.0, 0.5, 0.3, 0.5, 0.3, 1.0, 0.7, 1.0, 0.7, 0.5, 1.0, 0.5],
	downarrow: [0.3, 0.0, 0.3, 0.5, 0.0, 0.5, 0.5, 1.0, 1.0, 0.5, 0.7, 0.5, 0.7, 0.0],
	leftarrow: [0.0, 0.5, 0.5, 1.0, 0.5, 0.7, 1.0, 0.7, 1.0, 0.3, 0.5, 0.3, 0.5, 0.0],
	rightarrow: [0.0, 0.3, 0.0, 0.7, 0.5, 0.7, 0.5, 1.0, 1.0, 0.5, 0.5, 0.0, 0.5, 0.3],
	plus: [0.3, 0.0, 0.3, 0.3, 0.0, 0.3, 0.0, 0.7, 0.3, 0.7, 0.3, 1.0, 0.7, 1.0, 0.7, 0.7, 1.0, 0.7, 1.0, 0.3, 0.7, 0.3, 0.7, 0.0],
	minus: [0.0, 0.3, 0.0, 0.7, 1.0, 0.7, 1.0, 0.3],
	/*for (var i = 0; i <= 2 * 5; ++i) {
        var a = i * Math.PI / 5 - Math.PI / 2;
        var r = i % 2 == 0 ? 0.5 : 0.191;
        context.lineTo(0.5 + r * Math.cos(a), 0.5 + r * Math.sin(a));
    }*/
	star: [0.5, 0, 0.6122, 0.3454, 0.9755, 0.3454, 0.6816, 0.5590, 0.7938, 0.9045, 0.5, 0.6910, 0.2061, 0.9045, 0.3183, 0.5590, 0.02447, 0.3454, 0.3877, 0.3454]
};
var $$_pairShapes = {
	equal: [[0.0, 0.2, 0.0, 0.4, 1.0, 0.4, 1.0, 0.2], [0.0, 0.6, 0.0, 0.8, 1.0, 0.8, 1.0, 0.6]]
};
var EllipseShape = defineClass("EllipseShape", ShapeDrawing, {
	init: function(shape) {
		this._super();
	},
	_doDraw: function (g, r, fill, stroke) {
		g.drawEllipse(fill, stroke, r.x , r.y, r.width, r.height);
	}
});
var NullShape = defineClass("NullShape", ShapeDrawing, {
	init: function() {
		this._super();
	},
	destroy: function() {
		return false; //
	},
	_doDraw: function (g, r, fill, stroke) {
	}
}, null, function (f) {
	f.Default = new f();
});