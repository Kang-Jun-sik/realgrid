function equalArrays(a, b) {
	if (a === b)
		return true;
	if (a == null || b == null)
		return false;
	var len = a.length;
	if (len != b.length)
		return false;
	for (var i = 0; i < len; ++i) {
		if (a[i] !== b[i])
			return false;
	}	
	return true;
}