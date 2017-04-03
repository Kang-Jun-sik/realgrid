var MobileContextMenu = defineClass("MobileContextMenu", null, {
    init: function () {
        this._super("focusView");
    },
    show: function (menu) {
    },
    close: function () {
    }
});
var MobileContextMenuView = defineClass("MobileContextMenuView", EventAware, {
    init: function (container/*VisualContainer*/) {
        this._super();
        this._container = container;
        this._dom = new Dom(this.$_createElement());
    },
    show: function (menu) {
    },
    close: function () {
    },
    $_createElement: function () {
    }
});