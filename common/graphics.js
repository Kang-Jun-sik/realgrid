var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                            window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
window.requestAnimationFrame = requestAnimationFrame || function (render) { setTimeout(render, 10); };
var DEF_FONT_FAMILY = "Tahoma";
var DEF_FONT_SIZE = 12;
var DEF_FONT = DEF_FONT_SIZE + "px " + DEF_FONT_FAMILY;
var Graphics = function (context) {
	var ctx = context;
	!("imageSmoothingEnabled" in ctx) && (ctx.webkitImageSmoothingEnabled = true);
	ctx.mozImageSmoothingEnabled = true;
	ctx.oImageSmoothingEnabled = true;
    ctx.imageSmoothingEnabled = true;
	ctx.setLineDash = ctx.setLineDash || function(){};
    this.LINES_REG = new RegExp('\\n|\\r\\n?');
	this.save = function () {
		ctx.save();
	};
	this.restore = function() {
		ctx.restore();
	};
	this.setCompositionOp = function (op) {
		ctx.globalCompositeOperation = op;
	};
	this.translate = function(dx, dy) {
		ctx.translate(dx, dy);
	};
	this.scale = function (sw, sh) {
		ctx.scale(sw, sh);
	};
	this.rotate = function(angle) {
		ctx.rotate(angle);
	};
	this.clear = function (x, y, w, h) {
		ctx.clearRect(x, y, w, h);
	};
	this.clip = function () {
		ctx.clip();
	};
	this.clipRect = function (r) {
		ctx.beginPath();
		ctx.rect(r.x, r.y, r.width, r.height);
		ctx.clip();
	};
	this.clipRectEx = function (r) {
		ctx.beginPath();
		ctx.rect(r.x, r.y, r.width + 1, r.height + 1);
		ctx.clip();
	};
	this.clipBounds = function (x, y, w, h) {
		ctx.beginPath();
		ctx.rect(x, y, w, h);
		ctx.clip();
	};
	this.clipBoundsEx = function (x, y, w, h) {
		ctx.beginPath();
		ctx.rect(x, y, w + 1, h + 1);
		ctx.clip();
	};
	this.containsPoint = function (x, y) {
		return ctx.isPointInPath(x, y);
	};
	/*
	this.copy = function (x, y, width, height) {
		octx.clearRect(x, y, width, height);
		octx.drawImage(ctx.canvas, x, y, width, height, 0, 0, width, height);
	};
	this.paste = function (x, y, width, height) {
		ctx.drawImage(octx.canvas, 0, 0, width, height, x, y, width, height);
	};
	*/
	this.setAlpha = function (alpha) {
		ctx.globalAlpha = alpha;
	};
	this.setFill = function (fill) {
		ctx.fillStyle = fill;
	};
	this.setStroke = function (stroke, width, dash) {
		ctx.strokeStyle = stroke;
		ctx.lineWidth = width;
		ctx.setLineDash(dash || []);
	};
	this.setShadow = function (color, blur, offset) {
		ctx.shadowColor = color;
		ctx.shadowBlur = blur;
		ctx.shadowOffsetX = ctx.shadowOffsetY = offset;
	};
	this.clearShadow = function () {
		ctx.shadowColor = "transparent";
	};
	this.createLinearGradient = function (x, y, w, h) {
		if (isNaN(w) || isNaN(h)) {
			if ($_debug) debugger;
		}
		return ctx.createLinearGradient(x, y, w, h);
	};
	this.createRadialGradient = function (x, y, w, h) { //, cx, cy) {
		var cx = w / 2;
		var cy = h / 2;
		var rd = Math.min(cx, cy);
		return ctx.createRadialGradient(cx, cy, 0, cx, cy, rd);
	};
	this.drawBounds = function(fill, stroke, x, y, w, h) {
		ctx.beginPath();
		ctx.rect(x, y, w, h);
		if (fill) {
			fill.applyTo(this, x, y, w, h);
			ctx.fill();
		}
		if (stroke) {
			stroke.applyTo(this);
			ctx.stroke();
		}
	};
	this.drawBoundsI = function(fill, stroke, x, y, w, h) {
		var stroked = stroke && stroke.applyTo(this);
		if (!fill && !stroked) return;
		var d = stroked ? (stroke.width() % 2) / 2 : 0;
		x += d;
		y += d;
		ctx.beginPath();
		ctx.rect(x, y, w, h);
		fill && fill.applyTo(this, x, y, w, h) && ctx.fill();
		stroked && ctx.stroke();
	};
	this.drawRect = function(fill, stroke, r) {
		ctx.beginPath();
		ctx.rect(r.x, r.y, r.width, r.height);
		if (fill) {
			fill.applyTo(this, r.x, r.y, r.width, r.height);
			ctx.fill();
		}
		if (stroke) {
			stroke.applyTo(this);
			ctx.stroke();
		}
	};
	this.drawStrokeRect = function(stroke, r) {
		ctx.beginPath();
		ctx.strokeRect(r.x, r.y, r.width, r.height);
		if (stroke) {
			stroke.applyTo(this);
			ctx.stroke();
		}
	};
	this.fillAndClear = function () {
		ctx.fill();
		ctx.shadowColor = "transparent";
	};
	this.drawRectI = function(fill, stroke, r) {
		var stroked = stroke && stroke.applyTo(this);
		if (!fill && !stroked) return;
		var d = stroked ? (stroke.width() % 2) / 2 : 0;
		var x = r.x + d;
		var y = r.y + d;
		ctx.beginPath();
		ctx.rect(x, y, r.width, r.height);
		fill && fill.applyTo(this, x, y, r.width, r.height) && this.fillAndClear();
		stroked && ctx.stroke();
	};
	this.drawRoundRectI = function (fill, stroke, r, topLeft, topRight, bottomLeft, bottomRight, edge) {
		var stroked = stroke && stroke.applyTo(this);
		if (!fill && !stroked) return;
		var d = stroked ? (stroke.width() % 2) / 2 : 0;
		var x = r.x + d;
		var y = r.y + d;
		var x2 = r.right() + d + (edge || 0);
		var y2 = r.bottom() + d + (edge || 0);
		ctx.beginPath();
		ctx.moveTo(x + topLeft, y);
		ctx.lineTo(x2 - topRight, y);
		ctx.quadraticCurveTo(x2, y, x2, y + topRight);
		ctx.lineTo(x2, y2 - bottomRight);
		ctx.quadraticCurveTo(x2, y2, x2 - bottomRight, y2);
		ctx.lineTo(x + bottomRight, y2);
		ctx.quadraticCurveTo(x, y2, x, y2 - bottomRight);
		ctx.lineTo(x, y + topLeft);
		ctx.quadraticCurveTo(x, y, x + topLeft, y);
		ctx.closePath();
		fill && fill.applyTo(this, x, y, r.width, r.height) && this.fillAndClear();
		stroked && ctx.stroke();
	};
	this.drawRoundRectIWith = function (fill, stroke, r, borders, edge) {
		this.drawRoundRectI(fill, stroke, r, borders.topLeft, borders.topRight,
				borders.bottomLeft, borders.bottomRight, edge);
	};
	this.drawCircle = function (fill, stroke, x, y, radius) {
		var stroked = stroke && stroke.applyTo(this);
		if (!fill && !stroked) return;
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, Math.PI * 2);
		fill && fill.applyTo(this, x - radius, y - radius, radius * 2, radius * 2) && ctx.fill();
		stroked && ctx.stroke();
	};
	this.drawCircleBounds = function (fill, stroke, x, y, w, h) {
		var stroked = stroke && stroke.applyTo(this);
		if (!fill && !stroked) return;
		var cx = x + w / 2;
		var cy = y + h / 2;
		var rd = Math.min(w, h) / 2;
		ctx.beginPath();
		ctx.arc(cx, cy, rd, 0, Math.PI * 2);
		fill && fill.applyTo(this, x - rd, y - rd, rd * 2, rd * 2) && ctx.fill();
		stroked && ctx.stroke();
	};
	this.drawCircleRect = function (fill, stroke, r) {
		this.drawCircleBounds(fill, stroke, r.x, r.y, r.width, r.height);
	};
	this.drawEllipse = function (fill, stroke, x, y, w, h) {
		var stroked = stroke && stroke.applyTo(this);
		if (!fill && !stroked) return;
		var kappa = .5522848,
	      ox = (w / 2) * kappa, // control point offset horizontal
	      oy = (h / 2) * kappa, // control point offset vertical
	      xe = x + w,           // x-end
	      ye = y + h,           // y-end
	      xm = x + w / 2,       // x-middle
	      ym = y + h / 2;       // y-middle
		ctx.beginPath();
		ctx.moveTo(x, ym);
		ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
		ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
		ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
		ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
		ctx.closePath();
		fill && fill.applyTo(this, x, y, w, h) && ctx.fill();
		stroked && ctx.stroke();
	};
	this.drawTriangle = function (fill, stroke, r) {
		var stroked = stroke && stroke.applyTo(this);
		if (!fill && !stroked) return;
		var cx = r.x + r.width / 2;
		ctx.beginPath();
		ctx.moveTo(cx, r.y);
		ctx.lineTo(r.right(), r.bottom());
		ctx.lineTo(r.x, r.bottom());
		ctx.closePath();
		fill && fill.applyTo(this, r.x, r.y, r.width, r.height) && ctx.fill();
		stroked && ctx.stroke();
	};
	this.drawDiamond = function (fill, stroke, r) {
		var stroked = stroke && stroke.applyTo(this);
		if (!fill && !stroked) return;
		var cx = r.x + r.width / 2;
		var cy = r.y + r.height / 2;
		ctx.beginPath();
		ctx.moveTo(cx, r.y);
		ctx.lineTo(r.right(), cy);
		ctx.lineTo(cx, r.bottom());
		ctx.lineTo(r.x, cy);
		ctx.closePath();
		fill && fill.applyTo(this, r.x, r.y, r.width, r.height) && ctx.fill();
		stroked && ctx.stroke();
	};
	this.drawCross = function (fill, stroke, r) {
		var stroked = stroke && stroke.applyTo(this);
		if (!fill && !stroked) return;
		var cx = r.x + r.width / 2;
		var cy = r.y + r.height / 2;
		var w = Math.max(1.5, r.width / 5);
		var h = Math.max(1.5, r.height / 5);
		ctx.beginPath();
		ctx.moveTo(cx - w, r.y);
		ctx.lineTo(cx + w, r.y);
		ctx.lineTo(cx + w, cy - h);
		ctx.lineTo(r.right(), cy - h);
		ctx.lineTo(r.right(), cy + h);
		ctx.lineTo(cx + w, cy + h);
		ctx.lineTo(cx + w, r.bottom());
		ctx.lineTo(cx - w, r.bottom());
		ctx.lineTo(cx - w, cy + h);
		ctx.lineTo(r.x, cy + h);
		ctx.lineTo(r.x, cy - h);
		ctx.lineTo(cx - w, cy - h);
		ctx.closePath();
		fill && fill.applyTo(this, r.x, r.y, r.width, r.height) && ctx.fill();
		stroked && ctx.stroke();
	};
	this.drawDounut = function (fill, stroke, x, y, radius, width) {
		var stroked = stroke && stroke.applyTo(this);
		if (!fill && !stroked) return;
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, Math.PI * 2, true);
		ctx.arc(x, y, radius - width, 0, Math.PI * 2, false);
		ctx.closePath();
		fill && fill.applyTo(this, x - radius, y - radius, radius * 2, radius * 2) && ctx.fill();
		stroked && ctx.stroke();
	};
	this.drawArcSector = function (fill, stroke, x, y, radiusX, radiusY, startAngle, angle, orgAngle, clockwise) {
		var stroked = stroke && stroke.applyTo(this);
		if (!fill && !stroked) return;
		startAngle += Math.PI * 3 / 2;// orgAngle;
		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.arc(x, y, radiusX, startAngle, startAngle + angle);
		ctx.lineTo(x, y);
		ctx.closePath();
		fill && fill.applyTo(this, x - radiusX, y - radiusY, radiusX * 2, radiusY * 2) && ctx.fill();
		stroked && ctx.stroke();
	};
	this.drawArcSector2 = function (fill, stroke, x, y, innerRadiusX, innerRadiusY, radiusX, radiusY, startAngle, angle, orgAngle, clockwise) {
		var stroked = stroke && stroke.applyTo(this);
		if (!fill && !stroked) return;
		startAngle += Math.PI * 3 / 2;// orgAngle;
		ctx.beginPath();
		ctx.arc(x, y, innerRadiusX, startAngle, startAngle + angle);
		ctx.arc(x, y, radiusX, startAngle + angle, startAngle, true);
		ctx.closePath();
		fill && fill.applyTo(this, x - radiusX, y - radiusY, radiusX * 2, radiusY * 2) && ctx.fill();
		stroked && ctx.stroke();
	};
	this.drawLine = function (stroke, x1, y1, x2, y2) {
		if (stroke && stroke.applyTo(this)) {
			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y2);
			ctx.stroke();
		}
	};
	this.drawLineI = function (stroke, x1, y1, x2, y2) {
		if (stroke && stroke.applyTo(this)) {
			var d = (stroke.width() % 2) / 2;
			ctx.beginPath();
			if (x1 == x2) {
				ctx.moveTo(x1 + d, y1);
				ctx.lineTo(x2 + d, y2);
			} else if (y1 == y2) {
				ctx.moveTo(x1, y1 + d);
				ctx.lineTo(x2, y2 + d);
			}
			ctx.stroke();
		}
	};
	this.drawHorzLine = function (stroke, x1, x2, y) {
		if (stroke && stroke.applyTo(this)) {
			ctx.beginPath();
			ctx.moveTo(x1, y);
			ctx.lineTo(x2, y);
			ctx.stroke();
		}
	};
	this.drawHorzLineI = function (stroke, x1, x2, y) {
		if (stroke && stroke.applyTo(this)) {
			y += (stroke.width() % 2) / 2;
			ctx.beginPath();
			ctx.moveTo(x1, y);
			ctx.lineTo(x2, y);
			ctx.stroke();
		}
	};
	this.drawHLine = function (stroke, y, x1, x2) {
		if (stroke && stroke.applyTo(this)) {
			ctx.beginPath();
			ctx.moveTo(x1, y);
			ctx.lineTo(x2, y);
			ctx.stroke();
		}
	};
	this.drawHLineI = function (stroke, y, x1, x2) {
		if (stroke && stroke.applyTo(this)) {
			y += (stroke.width() % 2) / 2;
			ctx.beginPath();
			ctx.moveTo(x1, y);
			ctx.lineTo(x2, y);
			ctx.stroke();
		}
	};
	this.drawVertLine = function (stroke, y1, y2, x) {
		if (stroke && stroke.applyTo(this)) {
			ctx.beginPath();
			ctx.moveTo(x, y1);
			ctx.lineTo(x, y2);
			ctx.stroke();
		}
	};
	this.drawVertLineI = function (stroke, y1, y2, x) {
		if (stroke && stroke.applyTo(this)) {
			x += (stroke.width() % 2) / 2;
			ctx.beginPath();
			ctx.moveTo(x, y1);
			ctx.lineTo(x, y2);
			ctx.stroke();
		}
	};
	this.drawVLine = function (stroke, x, y1, y2) {
		if (stroke && stroke.applyTo(this)) {
			ctx.beginPath();
			ctx.moveTo(x, y1);
			ctx.lineTo(x, y2);
			ctx.stroke();
		}
	};
	this.drawVLineI = function (stroke, x, y1, y2) {
		if (stroke && stroke.applyTo(this)) {
			x += (stroke.width() % 2) / 2;
			ctx.beginPath();
			ctx.moveTo(x, y1);
			ctx.lineTo(x, y2);
			ctx.stroke();
		}
	};
	this.drawLines = function (stroke, pts) {
		if (stroke && stroke.applyTo(this)) {
			var rendered = false;
			if (isArray(pts) && pts.length >= 2) {
				ctx.beginPath();
				ctx.moveTo(pts[0].x, pts[0].y);
				for (var i = 1; i < pts.length; i++) {
					ctx.lineTo(pts[i].x, pts[i].y);
				}
				rendered = true;
			} else if (arguments.length >= 5) {
				ctx.beginPath();
				ctx.moveTo(arguments[1], arguments[2]);
				for (var i = 3; i < arguments.length - 1; i += 2) {
					ctx.lineTo(arguments[i], arguments[i + 1]);
				}
				rendered = true;
			}
			if (rendered) {
				ctx.stroke();
			}
		}
	};
	this.drawLinesI = function (stroke, pts) {
		if (stroke && stroke.applyTo(this)) {
			var d = (stroke.width() % 2) / 2;
			var i, len;
			var rendered = false;
			if (isArray(pts) && pts.length >= 2) {
				ctx.beginPath();
                ctx.moveTo(pts[0].x, pts[0].y);
				for (i = 1; i < pts.length; i++) {
					ctx.lineTo(pts[i].x, pts[i].y);
				}
				rendered = true;
			} else if (arguments.length >= 5) {
				var pts2 = [];
				for (i = 1, len = arguments.length; i < len; i++) {
					pts2[i] = arguments[i] + d;
				}
				ctx.beginPath();
				ctx.moveTo(pts2[1], pts2[2]);
				for (i = 3; i < len - 1; i += 2) {
					ctx.lineTo(pts2[i], pts2[i + 1]);
				}
				rendered = true;
			}
			if (rendered) {
				ctx.stroke();
			}
		}
	};
    this.drawLinesArray = function (stroke, pts) {
        if (stroke && pts && pts.length >= 4 && stroke.applyTo(this)) {
            ctx.beginPath();
            ctx.moveTo(pts[0], pts[1]);
            for (var i = 1; i < pts.length / 2; i++) {
                ctx.lineTo(pts[i * 2], pts[i * 2 + 1]);
            }
            ctx.stroke();
        }
    };
    this.drawLinesArrayI = function (stroke, pts) {
        if (stroke && pts && pts.length >= 4 && stroke.applyTo(this)) {
            var d = (stroke.width() % 2) / 2;
            ctx.beginPath();
            ctx.moveTo(pts[0], pts[1]);
            for (var i = 1; i < pts.length / 2; i++) {
                ctx.lineTo(pts[i * 2] + d, pts[i * 2 + 1] + d);
            }
            ctx.stroke();
        }
    };
	this.drawCurve = function (stroke, pts) {
		if (stroke && stroke.applyTo(this)) {
			ctx.beginPath();
			drawCurvedLines(ctx, pts, 0, pts.length - 1);
			ctx.stroke();
		}
	};
	this.drawPolygon = function (fill, stroke, points) {
		var i, cnt, r;
		if (points && (cnt = points.length) > 1) {
			var stroked = stroke && stroke.applyTo(this);
			if (!fill && !stroked) return;
			ctx.beginPath();
			ctx.moveTo(points[0].x, points[0].y);
			for (i = 1; i < cnt; i++) {
				ctx.lineTo(points[i].x, points[i].y);
			}
			ctx.closePath();
			if (fill) {
				r = getPointsRect(points);
				fill.applyTo(this, r.x, r.y, r.width, r.height) && ctx.fill();
			}
			stroked && ctx.stroke();
		}
	};
	this.drawPolygonArray = function (fill, stroke, points) {
		var i, cnt, r;
		if (points && (cnt = points.length) > 2) {
			var stroked = stroke && stroke.applyTo(this);
			if (!fill && !stroked) return;
			ctx.beginPath();
			ctx.moveTo(points[0], points[1]);
			cnt /= 2;
			for (i = 1; i < cnt; i++) {
				ctx.lineTo(points[i * 2], points[i * 2 + 1]);
			}
			ctx.closePath();
			if (fill) {
				r = getPointArrayRect(points);
				fill.applyTo(this, r.x, r.y, r.width, r.height) && ctx.fill();
			}
			stroked && ctx.stroke();
		}
	};
	this.drawRange = function (fill, stroke, points1, points2) {
		if (points1 && points1.length > 1 && points2 && points2.length > 1) {
			var stroked = stroke && stroke.applyTo(this);
			if (!fill && !stroked) return;
			ctx.beginPath();
			ctx.moveTo(points1[0].x, points1[0].y);
			for (var i = 1, cnt = points1.length; i < cnt; i++) {
				ctx.lineTo(points1[i].x, points1[i].y);
			}
			for (var i = points2.length - 1; i >= 0; i--) {
				ctx.lineTo(points2[i].x, points2[i].y);
			}
			ctx.closePath();
			if (fill) {
				var r = getPointsRect(points1.concat(points2));
				fill.applyTo(this, r.x, r.y, r.width, r.height) && ctx.fill();
			}
			stroked && ctx.stroke();
		}
	};
	this.drawCurvedRange = function (fill, stroke, points1, points2) {
		if (points1 && points1.length > 1 && points2 && points2.length > 1) {
			var stroked = stroke && stroke.applyTo(this);
			if (!fill && !stroked) return;
			ctx.beginPath();
			drawCurvedLines(ctx, points1, 0, points1.length - 1, true);
			var p = points2[points2.length - 1];
			ctx.lineTo(p.x, p.y);
			drawCurvedLines(ctx, points2, points2.length - 1, 0, false);
			p = points1[0];
			ctx.lineTo(p.x, p.y);
			if (fill) {
				var r = getPointsRect(points1.concat(points2));
				fill.applyTo(this, r.x, r.y, r.width, r.height) && ctx.fill();
			}
			stroked && ctx.stroke();
		}
	};
	this.drawCurvedStraightRange = function (fill, stroke, points1, points2) {
		if (points1 && points1.length > 1 && points2 && points2.length > 1) {
			var stroked = stroke && stroke.applyTo(this);
			if (!fill && !stroked) return;
			ctx.beginPath();
			drawCurvedLines(ctx, points1, 0, points1.length - 1, true);
			var p = points2[points2.length - 1];
			ctx.lineTo(p.x, p.y);
			for (var i = points2.length - 2; i >= 0; i--) {
				ctx.lineTo(points2[i].x, points2[i].y);
			}
			p = points1[0];
			ctx.lineTo(p.x, p.y);
			if (fill) {
				var r = getPointsRect(points1.concat(points2));
				fill.applyTo(this, r.x, r.y, r.width, r.height) && ctx.fill();
			}
			stroked && ctx.stroke();
		}
	};
	this.drawStraightCurvedRange = function (fill, stroke, points1, points2) {
		if (points1 && points1.length > 1 && points2 && points2.length > 1) {
			var stroked = stroke && stroke.applyTo(this);
			if (!fill && !stroked) return;
			ctx.beginPath();
			for (var i = 0; i < points1.length; i++) {
				ctx.lineTo(points1[i].x, points1[i].y);
			}
			var p = points2[points2.length - 1];
			ctx.lineTo(p.x, p.y);
			drawCurvedLines(ctx, points2, points2.length - 1, 0, false);
			p = points1[0];
			ctx.lineTo(p.x, p.y);
			if (fill) {
				var r = getPointsRect(points1.concat(points2));
				fill.applyTo(this, r.x, r.y, r.width, r.height) && ctx.fill();
			}
			stroked && ctx.stroke();
		}
	};
	this.drawText = function(font, fill, text, x, y, align, layout) {
		if (fill && fill.applyTo(this)) {
			ctx.beginPath();
			ctx.font = font ? font.font : DEF_FONT;
			ctx.textAlign = (align == TextAlign.CENTER) ? "center" : (align == TextAlign.RIGHT) ? "end" : "start";
			ctx.textBaseline = layout ? layout : "top";
			ctx.fillText(text, x, y);
		}
	};
	this.drawTextRect = function(font, fill, text, r, align, layout) {
		this.drawTextBounds(font, fill, text, r.x, r.y, r.width, r.height, align, layout);
	};
	this.drawTextBounds = function (font, fill, text, x, y, w, h, align, layout) {
		if (text && fill && fill.applyTo(this)) {
			var xSave = x;
			var ySave = y;
			var sz = DEF_FONT_SIZE;
			ctx.beginPath();
			if (font) {
				ctx.font = font.font;
				sz = font.size;
			} else {
				ctx.font = DEF_FONT;
			}
			var ta = "start";
			if (align === TextAlign.CENTER) {
				x += w / 2;
				ta = "center";
			} else if (align === TextAlign.RIGHT) {
				x = x + w;
				ta = "end";
			}
			/*
			switch (layout) {
			case "top":
				break;
			case "bottom":
				y = r.bottom(); 
				break;
			default:
				y += r.height  / 2;
				break;
			}
			y = _floor(y);
			x = _floor(x);
			ctx.textAlign = ta;
			ctx.textBaseline = layout ? layout : "middle";
			ctx.fillText(text, x, y);
			*/
			if (h != sz) {
				switch (layout) {
				case "top":
					break;
				case "bottom":
					y = y + h - sz;
					break;
				case "middle":
				default:
					y += (h - sz) / 2;
					break;
				}
			} 
			y = y + sz / 2;
			ctx.textAlign = ta;
			ctx.textBaseline = "middle";
			ctx.fillText(text, x, y);
			if (font && font.underline) {
				ctx.beginPath();
				this.setStroke(fill._color.value(), 1)
				w = _int(ctx.measureText(text).width);
				y = _int(y + sz / 2 + 1) + 0.5;
				if (align === TextAlign.CENTER) {
					x -= _int(w / 2);
				} else if (align === TextAlign.RIGHT) {
					x -= w;
				}
				ctx.moveTo(x, y);
				ctx.lineTo(x + w, y);
				ctx.stroke();
			}
			/*
			var t = _getTimer();
			var len = 0;
			for (var i = 0; i < 1000; i++) {
				len += ctx.measureText("text" + i + text).width;
			}
			t = _getTimer() - t;
			_trace(t);
			*/
			/*
			 var t = _getTimer();
			 var len = 0;
			 for (var i = 0; i < 1000; i++) {
			 	len += ("text" + i + text).indexOf("\n");
			 }
			 t = _getTimer() - t;
			 _trace(t);
			debugger;
			 */
		}
	};
    this.getTextRect = function(font, text, x, y, w, h, align, layout, r) {
        if (r) {
            r.width = r.height = 0;
        } else {
            r = new Rectangle();
        }
        if (text) {
            var sz = DEF_FONT_SIZE;
            if (font) {
                ctx.font = font.font;
                sz = font.size;
            } else {
                ctx.font = DEF_FONT;
            }
            r.width = ctx.measureText(text).width;
            r.height = sz;
            r.x = x;
            r.y = y;
            if (align === TextAlign.CENTER) {
                r.x += (w - r.width) / 2;
            } else if (align === TextAlign.RIGHT) {
                r.x += w - r.width;
            }
            switch (layout) {
                case "top":
                    break;
                case "bottom":
                    r.y = r.bottom() - sz;
                    break;
                case "middle":
                default:
                    r.y += (h - sz) / 2;
                    break;
            }
        }
        return r;
    };
	this.drawTextRectExplicit = function(font, fill, text, r, align, layout) {
		this.drawTextBoundsExplicit(font, fill, text, r.x, r.y, r.width, r.height, align, layout);
	};
	this.drawTextBoundsExplicit = function (font, fill, text, x, y, w, h, align, layout) {
		if (!text || !fill) {
			return;
		}
		var wh = w * h, cw, cx, cy;
		if (isNaN(wh) || wh <= 0) {
			return;
		}
		var lines = typeof text == "string" ? text.split(/\n|\r\n?/) : text;
		if (lines.length <= 1) {
			this.drawTextBounds(font, fill, lines[0], x, y, w, h, align, layout);
			return;
		}
        if (fill.applyTo(this)) {
			var hline = DEF_FONT_SIZE;
			ctx.beginPath();
			if (font) {
				ctx.font = font.font;
				hline = font.size;
				if (font.underline) 
					ctx.font = "underline " + ctx.font;
			} else {
				ctx.font = DEF_FONT;
			}
			var hline2 = hline + 1;
			ctx.textBaseline = "middle";
			var i, ta, x2, y2;
			var htotal = hline2 * lines.length;
			var cnt = Math.min(lines.length, Math.ceil(h / hline2));
			if (layout == "top" || htotal >= h) {
			} else {
				switch (layout) {
					case "bottom":
						y = y + h - htotal;
						break;
					case "middle":
					default:
						y += (h - htotal) / 2;
						break;
				}
			}

			for (i = 0; i < cnt; i++) {
				ta = "start";
				if (align === TextAlign.CENTER) {
					x2 = x + w / 2;
					ta = "center";
				} else if (align === TextAlign.RIGHT) {
					x2 = x + w;
					ta = "end";
				} else {
					x2 = x;
				}
				y2 = y + hline2 * i;
				y2 = y2 + hline / 2;
				ctx.textAlign = ta;
	
				// linkable cell hovering
				if (font && font.underline) {
					cw = ctx.measureText(lines[i]).width;
					cx = x2;
					cy = y;
					
					cy = _int(y2 + hline / 2 + 1) + 0.5;
					if (align === TextAlign.CENTER) {
						cx -= _int(cw / 2);
					} else if (align === TextAlign.RIGHT) {
						cx -= cw;
					}
					ctx.moveTo(cx, cy);
					ctx.lineTo(cx + cw, cy);
				}

				ctx.fillText(lines[i], x2, y2);
			}
			ctx.stroke();
			
		}
	};
    this.getExplicitTextRect = function (font, text, x, y, w, h, align, layout, r) {
        if (r) {
            r.width = r.height = 0;
        } else {
            r = new Rectangle(x, y, 0, 0);
        }
        if (!text) {
            return r;
        }
        var lines = typeof text == "string" ? text.split(this.LINES_REG) : text;
        if (lines.length == 1) {
            return this.getTextRect(font, lines[0], x, y, w, h, align, layout, r);
        }
        var hline = DEF_FONT_SIZE;
        if (font) {
            ctx.font = font.font;
            hline = font.size;
        } else {
            ctx.font = DEF_FONT;
        }
        var hline2 = hline + 1;
        ctx.textBaseline = "middle";
        var htotal = hline2 * lines.length;
        var cnt = Math.min(lines.length, Math.ceil(h / hline2));
        var i, s, x2, y2, cw;
        if (layout == "top" || htotal >= h) {
        } else {
            switch (layout) {
                case "bottom":
                    y = y + h - htotal;
                    break;
                case "middle":
                default:
                    y += (h - htotal) / 2;
                    break;
            }
        }
        r.y = y;
        r.height = hline2 * cnt;
        for (i = 0; i < cnt; i++) {
            s = lines[i];
            cw = ctx.measureText(s).width;
            if (align === TextAlign.CENTER) {
                x2 = x + (w - cw) / 2;
            } else if (align === TextAlign.RIGHT) {
                x2 = x + w - cw;
            } else {
                x2 = x;
            }
            if (r.width == 0) {
                r.x = x2;
                r.width = cw;
            } else {
                r.setLeft(Math.min(r.x, x2));
                r.setRight(Math.max(r.right(), x2 + cw));
            }
        }
        return r;
    };
	this.drawTextRectWrap = function(font, fill, text, r, align, layout) {
		this.drawTextBoundsWrap(font, fill, text, r.x, r.y, r.width, r.height, align, layout);
	};
	this.drawTextBoundsWrap = function (font, fill, text, x, y, w, h, align, layout) {
		if (!text || !fill) {
			return;
		}
		var wh = w * h;
		if (isNaN(wh) || wh <= 0) {
			return;
		}
		var hline = DEF_FONT_SIZE;
		if (font) {
			ctx.font = font.font;
			hline = font.size;
		} else {
			ctx.font = DEF_FONT;
		}
        var texts = typeof text == "string" ? text.split(this.LINES_REG) : text;
		if (texts.length <= 1 && ctx.measureText(texts[0]).width <= w) {
			this.drawTextBounds(font, fill, texts[0], x, y, w, h, align, layout);
			return;
		}
		if (fill.applyTo(this)) {
			var i, j, k, words, x2, s, s2, line, w2, ta, y2, cnt;
			var cw, cx, cy;
			var hline2 = hline + 1;
			var nLine = Math.min(texts.length, Math.ceil(h / hline2));
			var lines = [];
			var htotal = 0;
			var first = true;
			for (i = 0; i < nLine && htotal <= h; i++) {
				x2 = 0;
				line = "";
				words = texts[i].split(/(\s+)/);
				for (j = 0; j < words.length && htotal <= h;) {
					s = words[j];
					if (first) {
						first = false;
						s = s.trim();
						if (!s) {
							if ((w2 = ctx.measureText(s).width) > w) {
								htotal += hline2;
								lines.push(s);
							} else {
								line = s;
								x2 = w2;
							}
							s = words[++j];
						}
					}
					if (x2 + (w2 = ctx.measureText(s).width) <= w) {
						line += s;
						x2 += w2;
					} else {
						s = s.trim();
						if (s)  {
							if (line) {
								lines.push(line);
								htotal += hline2;
								line = "";
							}
							if (w2 > w) {
								while (s && htotal <= h) {
									for (k = 2; k <= s.length; k++) {
										s2 = s.substr(0, k);
										if (ctx.measureText(s2).width > w) {
											lines.push(s.substr(0, k - 1));
											htotal += hline2;
											s = s.substr(k - 1);
											break;
										}
									}
									if (!s || s.length == 1 || ctx.measureText(s).width <= w) {
										lines.push(s);
										htotal += hline2;
										break;
									}
								}
							} else {
								line = s;
								x2 = 0;
							}
						}
					}
					j++;
				}
				if (line) {
					lines.push(line);
					htotal += hline2;
				}
			}
			cnt = Math.min(lines.length, Math.ceil(h / hline2));
			htotal = lines.length * hline2;
			ctx.beginPath();
			ctx.textBaseline = "middle";
			if (layout == "top" || htotal >= h) {
			} else {
				switch (layout) {
					case "bottom":
						y = y + h - htotal;
						break;
					case "middle":
					default:
						y += (h - htotal) / 2;
						break;
				}
			}
			for (i = 0; i < cnt; i++) {
				ta = "start";
				x2 = x;
				if (align === TextAlign.CENTER) {
					x2 += w / 2;
					ta = "center";
				} else if (align === TextAlign.RIGHT) {
					x2 = x + w;
					ta = "end";
				}
				y2 = y + hline2 * i;
				y2 = y2 + hline / 2;
				ctx.textAlign = ta;

				// linkable cell hovering
				if (font && font.underline) {
					cw = ctx.measureText(lines[i]).width;
					cx = x2;
					cy = y;
					
					cy = _int(y2 + hline / 2 + 1) + 0.5;
					if (align === TextAlign.CENTER) {
						cx -= _int(cw / 2);
					} else if (align === TextAlign.RIGHT) {
						cx -= cw;
					}
					ctx.moveTo(cx, cy);
					ctx.lineTo(cx + cw, cy);
				}

				ctx.fillText(lines[i], x2, y2);
			}

			ctx.stroke();
		}
	};
    this.getWrapTextRect = function (font, text, x, y, w, h, align, layout, r) {
        if (r) {
            r.width = r.height = 0;
        } else {
            r = new Rectangle(x, y, 0, 0);
        }
        if (!text) {
            return r;
        }
        var hline = DEF_FONT_SIZE;
        if (font) {
            ctx.font = font.font;
            hline = font.size;
        } else {
            ctx.font = DEF_FONT;
        }
        var texts = typeof text == "string" ? text.split(/\n|\r\n?/) : text;
        if (texts.length == 1 && ctx.measureText(texts[0]).width <= w) {
            return this.getTextRect(font, texts[0], x, y, w, h, align, layout, r);
        }
        var hline2 = hline + 1;
        var nLine = Math.min(texts.length, Math.ceil(h / hline2));
        var lines = [];
        var htotal = 0;
        var first = true;
        var i, j, k, words, x2, s, s2, line, w2, y2, cnt;
        for (i = 0; i < nLine && htotal <= h; i++) {
            x2 = 0;
            line = "";
            words = texts[i].split(/(\s+)/);
            for (j = 0; j < words.length && htotal <= h;) {
                s = words[j];
                if (first) {
                    first = false;
                    s = s.trim();
                    if (!s) {
                        if ((w2 = ctx.measureText(s).width) > w) {
                            htotal += hline2;
                            lines.push(s);
                        } else {
                            line = s;
                            x2 = w2;
                        }
                        s = words[++j];
                    }
                }
                if (x2 + (w2 = ctx.measureText(s).width) <= w) {
                    line += s;
                    x2 += w2;
                } else {
                    s = s.trim();
                    if (s)  {
                        if (line) {
                            lines.push(line);
                            htotal += hline2;
                            line = "";
                        }
                        if (w2 > w) {
                            while (s && htotal <= h) {
                                for (k = 2; k <= s.length; k++) {
                                    s2 = s.substr(0, k);
                                    if ((w2 = ctx.measureText(s2).width) > w) {
                                        lines.push(s.substr(0, k - 1));
                                        htotal += hline2;
                                        s = s.substr(k - 1);
                                        break;
                                    }
                                }
                                if (!s || s.length == 1 || (w2 = ctx.measureText(s).width) <= w) {
                                    lines.push(s);
                                    htotal += hline2;
                                    break;
                                }
                            }
                        } else {
                            line = s;
                            x2 = 0;
                        }
                    }
                }
                j++;
            }
            if (line) {
                lines.push(line);
                htotal += hline2;
            }
        }
        cnt = Math.min(lines.length, Math.ceil(h / hline2));
        htotal = lines.length * hline2;
        if (layout == "top" || htotal >= h) {
        } else {
            switch (layout) {
                case "bottom":
                    y = y + h - htotal;
                    break;
                case "middle":
                default:
                    y += (h - htotal) / 2;
                    break;
            }
        }
        r.y = y;
        r.height = htotal;
        for (i = 0; i < cnt; i++) {
            var cw = ctx.measureText(lines[i]).width;
            if (align === TextAlign.CENTER) {
                x2 = x + (w - cw) / 2;
            } else if (align === TextAlign.RIGHT) {
                x2 = x + w - cw;
            } else {
                x2 = x;
            }
            if (r.width == 0) {
                r.x = x2;
                r.width = cw;
            } else {
                r.setLeft(Math.min(r.x, x2));
                r.setRight(Math.max(r.right(), x2 + cw));
            }
        }
        return r;
    };
	this.drawTextRectA = function(font, fill, text, r, angle) {
		this.drawTextBoundsA(font, fill, text, r.x, r.y, r.width, r.height, angle);
	};
	this.drawTextBoundsA = function(font, fill, text, x, y, w, h, angle) {
		if (fill && fill.applyTo(this)) {
			ctx.beginPath();
			if (font) {
				ctx.font = font.font;
			} else {
				ctx.font = DEF_FONT;
			}
			ctx.save();
			ctx.translate(x + w / 2, y + h / 2);
			ctx.rotate(angle);
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText(text, 0, 0); // (0, 0)에서 그리도록 해야한다!
			ctx.restore();
		}
	};
	this.getTextWidth = function (font, text) {
		if (text) {
			ctx.font = font ? font.font : DEF_FONT;
			return ctx.measureText(text).width;
		}
		return 0;
	};
    this.getLinesWidth = function (font, text) {
        ctx.font = font ? font.font : DEF_FONT;
        var texts = text.split(/\n|\r\n?/);
        var len = texts.length;
        if (len <= 1) {
            return ctx.measureText(text).width;
        } else {
            var w = ctx.measureText(texts[0]).width;
            for (var i = 1; i < len; i++) {
                w = Math.max(ctx.measureText(texts[0]).width);
            }
            return w;
        }
    };
	this.drawImage = function (image, sx, sy, sw, sh, dx, dy, dw, dh) {
		try {
			ctx.drawImage.apply(ctx, arguments);
		} catch (err) {
		}
	};
    this.drawImageI = function (image, sx, sy, sw, sh, dx, dy, dw, dh) {
        arguments[1] = Math.floor(arguments[1]);
        arguments[2] = Math.floor(arguments[2]);
        try {
            ctx.drawImage.apply(ctx, arguments);
        } catch (err) {
        }
    };
	this.aL = function (image, sx, sy, sw, sh, dx, dy, dw, dh) {
		try {
			ctx.drawImage.apply(ctx, arguments);
		} catch (err) {
		}
	};
};
function getPointsRect(pts) {
	var x1 = pts[0].x;
	var y1 = pts[0].y;
	var x2 = x1;
	var y2 = y1;
	for (var i = 1, cnt = pts.length; i < cnt; i++) {
		var p = pts[i];
		x1 = Math.min(x1, p.x);
		y1 = Math.min(y1, p.y);
		x2 = Math.max(x2, p.y);
		y2 = Math.max(y2, p.y);
	}
	return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
}
function getPointArrayRect(pts) {
	var i, x, y;
	var cnt = pts.length / 2;
	var x1 = pts[0];
	var y1 = pts[1];
	var x2 = x1;
	var y2 = y1;
	for (i = 1; i < cnt; i++) {
		x = pts[i * 2];
		y = pts[i * 2 + 1];
		x1 = Math.min(x1, x);
		y1 = Math.min(y1, y);
		x2 = Math.max(x2, x);
		y2 = Math.max(y2, y);
	}
	return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
}
function drawCurvedLines(ctx, pts, start, end, moving) {
	if (start == end) return;
	var reverse = start > end;
	var delta = reverse ? -1 : 1;
	var p = start;
	if (moving || moving === undefined) {
		ctx.moveTo(pts[p].x, pts[p].y);
	}
	if (Math.abs(end - start) == 2) {
		ctx.lineTo(pts[p + delta].x, pts[p + delta].y);
		return;
	}
	var tension = 0.25;
	var tanLeft = { x: 0, y: 0 };
	var tanRight = { x: 0, y: 0 };
	var v1 = { x: 0, y: 0 };
	var v2 = { x: pts[p + delta].x - pts[p].x, y: pts[p + delta].y - pts[p].y };
	var tan = { x: 0, y: 0 };
	var p1 = { x: 0, y: 0 };
	var p2 = { x: 0, y: 0 };
	var mp = { x: 0, y: 0 };
	var len = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
	v2.x /= len;
	v2.y /= len;
	var tanLenFactor = pts[p + delta].x - pts[p].x;
	var prevX = pts[p].x;
	var prevY = pts[p].y;
	for (p += delta; p != end; p += delta) {
		v1.x = -v2.x;
		v1.y = -v2.y;
		v2.x = pts[p + delta].x - pts[p].x;
		v2.y = pts[p + delta].y - pts[p].y;
		len = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
		v2.x /= len;
		v2.y /= len;
		if (v2.x < v1.x) {
			tan.x = v1.x - v2.x;
			tan.y = v1.y - v2.y;
		} else {
			tan.x = v2.x - v1.x;
			tan.y = v2.y - v1.y;
		}
		var tanlen = Math.sqrt(tan.x * tan.x + tan.y * tan.y);
		tan.x /= tanlen;
		tan.y /= tanlen;
		if (v1.y * v2.y >= 0)
			tan = { x: 1, y: 0 };
		tanLeft.x = -tan.x * tanLenFactor * tension;
		tanLeft.y = -tan.y * tanLenFactor * tension;
		if (p == (delta + start)) {
			ctx.quadraticCurveTo(pts[p].x + tanLeft.x, pts[p].y + tanLeft.y, pts[p].x, pts[p].y);
		} else {
			p1.x = prevX + tanRight.x;
			p1.y = prevY + tanRight.y;
			p2.x = pts[p].x + tanLeft.x;
			p2.y = pts[p].y + tanLeft.y;
			mp.x = (p1.x + p2.x) / 2;
			mp.y = (p1.y + p2.y) / 2;
			ctx.quadraticCurveTo(p1.x, p1.y, mp.x, mp.y);
			ctx.quadraticCurveTo(p2.x, p2.y, pts[p].x, pts[p].y);
		}
		tanLenFactor = pts[p + delta].x - pts[p].x;
		tanRight.x = tan.x * tanLenFactor * tension;
		tanRight.y = tan.y * tanLenFactor * tension;
		prevX = pts[p].x;
		prevY = pts[p].y;
	}		
	ctx.quadraticCurveTo(prevX + tanRight.x, prevY + tanRight.y, pts[p].x, pts[p].y);
};
Graphics.getEllipsePoint = function (x, y, radiusX, radiusY, angle, orgAngle, clockwise) {
	angle = angle + orgAngle;
	var dir = clockwise ? -1 : 1;
	var p = {};
	p.x = x + Math.cos(angle * dir) * radiusX;
	p.y = y + Math.sin(-angle * dir) * radiusY;
	return p;
};
Graphics.getArcPoint = function (x, y, radiusX, radiusY, startAngle, angle, orgAngle, clockwise, rate) {
	if (Math.abs(angle) > 2 * Math.PI) {
		angle = 2 * Math.PI;
	}
	if (rate === UNDEFINED) {
		rate = 0.5;
	}
	startAngle += Math.PI * 3 / 2;// orgAngle;
	var dir = clockwise ? -1 : 1;
	angle = startAngle - angle * dir * rate;
	var p = {};
	p.x = x + Math.cos(angle * dir) * radiusX;
	p.y = y + Math.sin(-angle * dir) * radiusY;
	return p;
};
var Drawings = function () {
	var _g = null;
	var _funcs = [];
	var _args = [];
	this._render = function () {
		for (var i = 0, cnt = _funcs.length; i < cnt; i++) {
			_funcs[i].apply(_g, _args[i]);
		}
	};
	this.clear = function (graphics) {
		_g = graphics;
		_funcs = [];
		_args = [];
	};
	this.clipRect = function (r) {
		_funcs.push(_g.clipBounds);
		_args.push([r.x, r.y, r.width, r.height]);
	};
	this.clipRectEx = function (r) {
		_funcs.push(_g.clipBoundsEx);
		_args.push([r.x, r.y, r.width, r.height]);
	};
	this.setAlpha = function (alpha) {
		_funcs.push(_g.setAlpha);
		_args.push([alpha]);
	};
	this.drawBounds = function (fill, stroke, x, y, w, h) {
		_funcs.push(_g.drawBounds);
		_args.push([fill, stroke, x, y, w, h]);
	};
	this.drawBoundsI = function (fill, stroke, x, y, w, h) {
		_funcs.push(_g.drawBoundsI);
		_args.push([fill, stroke, x, y, w, h]);
	};
	this.drawRect = function (fill, stroke, r) {
		_funcs.push(_g.drawBounds);
		_args.push([fill, stroke, r.x, r.y, r.width, r.height]);
	};
	this.drawStrokeRect = function (stroke, r) {
		_funcs.push(_g.drawStrokeRect);
		_args.push([stroke, r.x, r.y, r.width, r.height]);
	};
	this.drawRectI = function (fill, stroke, r) {
		_funcs.push(_g.drawBoundsI);
		_args.push([fill, stroke, r.x, r.y, r.width, r.height]);
	};
	this.drawRoundRectI = function (fill, stroke, r, topLeft, topRight, bottomLeft, bottomRight, edge) {
		_funcs.push(_g.drawRoundRectI);
		_args.push([fill, stroke, r.clone(), topLeft, topRight, bottomLeft, bottomRight, edge]);
	};
	this.drawRoundRectIWith = function (fill, stroke, r, borders, edge) {
		_funcs.push(_g.drawRoundRectIWith);
		_args.push([fill, stroke, r.clone(), borders, edge]);
	};
	this.drawCircle = function (fill, stroke, x, y, radius) {
		_funcs.push(_g.drawCircle);
		_args.push([fill, stroke, x, y, radius]);
	};
	this.drawEllipse = function (fill, stroke, x, y, w, h) {
		_funcs.push(_g.drawEllipse);
		_args.push([fill, stroke, x, y, w, h]);
	};
	this.drawCircleRect = function (fill, stroke, r) {
		_funcs.push(_g.drawCircleRect);
		_args.push([fill, stroke, r.clone()]);
	};
	this.drawTriangle = function (fill, stroke, r) {
		_funcs.push(_g.drawTriangle);
		_args.push([fill, stroke, r.clone()]);
	};
	this.drawDiamond = function (fill, stroke, r) {
		_funcs.push(_g.drawDiamond);
		_args.push([fill, stroke, r.clone()]);
	};
	this.drawArcSector = function (fill, stroke, x, y, radiusX, radiusY, startAngle, angle, orgAngle, clockwise) {
		_funcs.push(_g.drawArcSector);
		_args.push([fill, stroke, x, y, radiusX, radiusY, startAngle, angle, orgAngle, clockwise]);
	};
	this.drawArcSector2 = function (fill, stroke, x, y, innerRadiusX, innerRadiusY, radiusX, radiusY, startAngle, angle, orgAngle, clockwise) {
		_funcs.push(_g.drawArcSector2);
		_args.push([fill, stroke, x, y, innerRadiusX, innerRadiusY, radiusX, radiusY, startAngle, angle, orgAngle, clockwise]);
	};
	this.drawLine = function (stroke, x1, y1, x2, y2) {
		_funcs.push(_g.drawLine);
		_args.push([stroke, x1, y1, x2, y2]);
	};
	this.drawLineI = function (stroke, x1, y1, x2, y2) {
		_funcs.push(_g.drawLineI);
		_args.push([stroke, x1, y1, x2, y2]);
	};
	this.drawHorzLine = function (stroke, x1, x2, y) {
		_funcs.push(_g.drawHorzLine);
		_args.push([stroke, x1, x2, y]);
	};
	this.drawHorzLineI = function (stroke, x1, x2, y) {
		_funcs.push(_g.drawHorzLineI);
		_args.push([stroke, x1, x2, y]);
	};
	this.drawVertLine = function (stroke, y1, y2, x) {
		_funcs.push(_g.drawVertLine);
		_args.push([stroke, y1, y2, x]);
	};
	this.drawVertLineI = function (stroke, y1, y2, x) {
		_funcs.push(_g.drawVertLineI);
		_args.push([stroke, y1, y2, x]);
	};
	this.drawLines = function (stroke, pts) {
		_funcs.push(_g.drawLines);
		_args.push([stroke, pts]);
	};
	this.drawLinesI = function (stroke, pts) {
		_funcs.push(_g.drawLinesI);
		_args.push([stroke, pts]);
	};
	this.drawCurve = function (stroke, pts) {
		_funcs.push(_g.drawCurve);
		_args.push([stroke, pts]);
	};
	this.drawPolygon = function (fill, stroke, points) {
		_funcs.push(_g.drawPolygon);
		_args.push([fill, stroke, points]);
	};
	this.drawPolygonArray = function (fill, stroke, points) {
		_funcs.push(_g.drawPolygonArray);
		_args.push([fill, stroke, points]);
	};
	this.drawText = function(font, fill, text, x, y, align, layout) {
		_funcs.push(_g.drawText);
		_args.push([font, fill, text, x, y, align, layout]);
	};
	this.drawTextBounds = function (font, fill, text, x, y, w, h, align, layout) {
		_funcs.push(_g.drawTextBounds);
		_args.push([font, fill, text, x, y, w, h, align, layout]);
	};
	this.drawTextRect = function(font, fill, text, r, align, layout) {
		_funcs.push(_g.drawTextBounds);
		_args.push([font, fill, text, r.x, r.y, r.width, r.height, align, layout]);
	};
	this.drawTextRectA = function(font, fill, text, r, angle) {
		_funcs.push(_g.drawTextBoundsA);
		_args.push([font, fill, text, r.x, r.y, r.width, r.height, angle]);
	};
	this.drawImage = function (image, sx, sy, sw, sh, dx, dy, dw, dh) {
		_funcs.push(_g.drawImage);
		_args.push([image, sx, sy, sw, sh, dx, dy, dw, dh]);
	};
	this.getTextWidth = function (font, text) {
		return _graphics.gtTextWidth(font, text);
	};
};