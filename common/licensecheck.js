
	function $_equalServer(multi, single) {
		if (multi == single) {
			return true;
		} else if (multi.indexOf("*") === 0) {
			multi = multi.substr(1, multi.length-1); // * remove
			return (single.substr(single.indexOf(multi), multi.length) == multi);
		}
		
		return false;
	};

	function $_checkIncludeDomain(licServer, urlServer) {
		var servers = [];
		servers = licServer.split(",");

		for (var i = 0, cnt = servers.length; i < cnt; i++) {
			if ($_equalServer(servers[i], urlServer))
				return true;
		}
		return false;
	};

	function $_getLDKey(keys) {
		var mkey = "";
		for(var i = 0, cnt = keys.length; i < cnt; i++) { 
			mkey += String.fromCharCode(keys[i] >> 1);
		};
		return mkey;
	};

	function $_decryptLic(licEncode) {
		var decoded = blowfish.decrypt(licEncode, _gk+$_getLDKey([202,218,204,100]), {outputType:0, cipherMode: 0});
		var decObj = {};
		var decArr = decoded.split(";");
		for (var i = 0, cnt = decArr.length; i < cnt; i++) {
			var kv = decArr[i].split("=");
			var key = kv[0];
			var value = kv[1];
			if (value && value.length > 0)
				decObj[key] = value;
		}
		return decObj;
	};

	var __lck = function () {
		
		var server = location.hostname;

		var lic;
		try {
			lic = realGridJsLic;
		} catch(e) {
			//alert(__ls[0]);
			return false;
		}
		if (!lic) {
			//alert(__ls[0]);
			return false;
		}
		var licInfo = $_decryptLic(lic);
		
		if (licInfo.name != AppInfo.PRODUCT) {
			//alert(AppInfo.PRODUCT + __ls[1]);
			return false;
		}
		
		var licVender = licInfo.vender ? licInfo.vender : null;
		var appVender = AppInfo.VENDOR ? AppInfo.VENDOR : null;
		
		if (licVender != appVender) {
			return false;
		}
		
		var licServer = licInfo.server.toLowerCase();

		if (AppInfo.TYPE != "Developer" && !$_checkIncludeDomain(licServer, server.toLowerCase())) {
			return false;
		}

		
		var licType = licInfo.lic.toLowerCase();
		
		if (licType != "limited" && licInfo.lic != AppInfo.TYPE) {
			return false;
		}
						
		if (licType == "evaluation" || licType == "asp" || licType == "limited") {
			var arr = licInfo.expire.split(".");
			var d = new Date(arr[0], arr[1], arr[2], 23, 59, 59, 999);
			
			if (new Date() > d) {
				return false;
			}
		}

		return true;
	};

