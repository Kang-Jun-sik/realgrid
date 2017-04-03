var PrintOptions = defineClass("PrintOptions", null, {
	init : function (options) {
		this._super();
		options && this.assign(options);
	}
});
var /* internal */ HtmlPrinter = defineClass("HtmlPrinter", null, {
	init : function () {
		this._super();
		this._options = null;
	},
	print: function (grid, options) {
		var iframe = Dom.createElement("iframe");
		iframe.id = "printFrame"
		iframe.onload = function () {
			var div = Dom.createElement("div");
			div.innerHTML = "Hello?";
			iframe.contentDocument.body.appendChild(div);
			iframe.focus();
			iframe.contentWindow.print();
			_doc.body.removeChild(iframe);
		}
		iframe.style.visibility = "hidden";
		_doc.body.appendChild(iframe);
	}
});
