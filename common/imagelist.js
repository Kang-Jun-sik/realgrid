var ImageList = function (name, rootUrl) {
    var _name = name;
    var _rootUrl = rootUrl;
    var _urls = [];
    var _listeners = [];
    var _images = [];
    this.name = function () {
        return _name;
    };
    this.count = function () {
        return _urls.length;
    };
    this.addListener = function (listener) {
        if (listener && _listeners.indexOf(listener) < 0) {
            _listeners.push(listener);
        }
    };
    this.removeListener = function (listener) {
        var idx = _listeners.indexOf(listener);
        if (idx >= 0) {
            _listener.splice(idx, 1);
        }
    };
    this.addUrl = function (url) {
        if (url && _urls.indexOf(url) < 0) {
            _urls.push(url);
        }
    };
    this.addUrls = function (urls) {
        if (urls) {
            for (var i = 0; i < urls.length; i++) {
                this.addUrl(urls[i]);
            }
        }
    };
    this.getImage = function (index) {
        if (index >= 0 && index < _urls.length) {
            var image = _images[index];
            if (image) {
                return image;
            }
            image = new Image();
            image["index"] = index;
            image["owner"] = this;
            _images[index] = image;
            image.onload = function () {
                this.owner._fireLoaded(this.index);
            }.bind(image);
            image.src = _rootUrl + _urls[index];
        }
        return null;
    };
    this._fireLoaded = function (index) {
        for (var i = 0; i < _listeners.length; i++) {
            _listeners[i].onImageListImageLoaded(this, index);
        }
    };
};
var ImagePool = function () {
    var _listeners = [];
    var _images = {};
    this.addListener = function(listener) {
        if (listener && _listeners.indexOf(listener) < 0) {
            _listeners.push(listener);
        }
    };
    this.removeListener = function(listener) {
        var idx = _listeners.indexOf(listener);
        if (idx >= 0) {
            _listeners.splice(idx, 1);
        }
    };
    this.getImage = function(url) {
        if (url) {
            var image = _images[url];
            if (image) {
                return image;
            }
            image = new Image();
            image["owner"] = this;
            image["url"] = url;
            _images[url] = image;
            image.onload = function() {
                this.owner._fireLoaded(this.url);
            }.bind(image);
            image.src = url;
        }
        return null;
    };
    this._fireLoaded = function(url) {
        for (var i = 0; i < _listeners.length; i++) {
            _listeners[i].onImageLoaded(url);
        }
    };
};