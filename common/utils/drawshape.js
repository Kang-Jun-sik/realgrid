var $$_drawPlusBox = function (g, r, size, fillBox, fillSign) {
	var x = _round(r.x + (r.width - size) / 2);
	var y = _round(r.y + (r.height - size) / 2);
	var s = _round(size / 9.0);
	var pts = [
		x + s * 0, y + s * 0,
		x + s * 0, y + s * 9,
		x + s * 9, y + s * 9,
		x + s * 9, y + s * 0,
	];
	var pts2 = [
	    x + s * 4, y + s * 2,
		x + s * 4, y + s * 4,
		x + s * 2, y + s * 4,
		x + s * 2, y + s * 5,
		x + s * 4, y + s * 5,
		x + s * 4, y + s * 7,
		x + s * 5, y + s * 7,
		x + s * 5, y + s * 5,
		x + s * 7, y + s * 5,
		x + s * 7, y + s * 4,
		x + s * 5, y + s * 4,
		x + s * 5, y + s * 2,
	];
	g.drawPolygonArray(fillBox, null, pts);
	g.drawPolygonArray(fillSign, null, pts2);
};
var $$_drawMinusBox = function (g, r, size, fillBox, fillSign) {
	var x = _round(r.x + (r.width - size) / 2);
	var y = _round(r.y + (r.height - size) / 2);
	var s = _round(size / 9.0);
	var pts = [
		x + s * 0, y + s * 0,
		x + s * 0, y + s * 9,
		x + s * 9, y + s * 9,
		x + s * 9, y + s * 0,
	];
	var pts2 = [
		x + s * 2, y + s * 4,
		x + s * 2, y + s * 5,
		x + s * 7, y + s * 5,
		x + s * 7, y + s * 4,
	];
	g.drawPolygonArray(fillBox, null, pts);
	g.drawPolygonArray(fillSign, null, pts2);
};
var $$_drawCheckMark = function (g, fill, r, checkSize) {
	var x = r.x + (r.width - checkSize) / 2;
	var y = r.y + (r.height - checkSize) / 2 - checkSize / 6.0;
	var s = checkSize / 10.0;
	var pts = [
		x + s * 0, y + s * 6.573,
		x + s * 4.3915, y + s * 10,
		x + s * 10.1, y + s * 0.91,
		x + s * 8.205, y + s * 0,
		x + s * 3.684, y + s * 6.9425,
		x + s * 1.2, y + s * 5,
	];
	g.drawPolygonArray(fill, null, pts);
};
var $$_drawRightArrow = function (g, r, size, fill) {
	var x = r.x + (r.width - size) / 2;
	var y = r.y + (r.height - size) / 2;
	var s = size / 9.0;
	var pts = [
		x + s * 1.75, y + s * 1,
		x + s * 5.25, y + s * 4.5,
		x + s * 1.75, y + s * 8,
		x + s * 2.75, y + s * 9,
		x + s * 7.25, y + s * 4.5,
		x + s * 2.75, y + s * 0,
	];
	g.drawPolygonArray(fill, null, pts);
};
var $$_drawDownArrow = function (g, r, size, fill) {
	var x = r.x + (r.width - size) / 2;
	var y = r.y + (r.height - size) / 2;
	var s = size / 9.0;
	var pts = [
		x + s * 0, y + s * 2.75,
		x + s * 4.5, y + s * 7.25,
		x + s * 9, y + s * 2.75,
		x + s * 8, y + s * 1.75,
		x + s * 4.5, y + s * 5.25,
		x + s * 1, y + s * 1.75,
	];
	g.drawPolygonArray(fill, null, pts);
};