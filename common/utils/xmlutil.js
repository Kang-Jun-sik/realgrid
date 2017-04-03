function _parseXml(source) {
	var doc = null;
	try {
		doc = new ActiveXObject("Microsoft.XMLDOM");
		doc.async = false;
		doc.loadXML(source);
	} catch (e) {
		if (doc) throw e;
		doc = new DOMParser().parseFromString(source, "text/xml");
	}
	return doc;
}
function _xmlToStr(doc) {
	if (doc) {
		try {
			return new XMLSerializer().serializeToString(doc);
		} catch (e) {
			return doc.xml;
		}
	}
}
function _getXmlList(xml, tagName) {
	var nodes = [];
	if (xml) {
		var list = xml.childNodes;
		if (list) {
			for (var i = 0, cnt = list.length; i < cnt; i++) {
				var node = list[i];
				if (node.tagName === tagName) {
					nodes.push(node);
				}
			}
		}
	}
	return nodes;
}
function _getNodeValue(xml) {
    return xml.firstChild.nodeValue;
}
function _getXmlAttr(xml, attr) {
	return xml && xml.getAttribute(attr);
}
function _setXmlAttr(xml, attr, value) {
	xml.setAttribute(attr, value);
}
function _addChildWithAttr(doc, parent, child, attr, value) {
	var node = doc.createElement(child);
	attr && node.setAttribute(attr, value);
	parent.appendChild(node);
	return node;
}