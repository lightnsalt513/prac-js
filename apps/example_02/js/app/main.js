(function(win, doc, $) {
    'use strict';
    win.cmui = win.cmui || {};
    win.cmui.components = win.cmui.components || {};
    win.cmui.components.common = win.cmui.components.common || {};
    win.cmui.components['commonTableUi'] = win.cmui.components['commonTableUi'] || {};

    var COMPONENT = win.cmui.components['commonTableUi'],
        UTIL = win.cmui.components.common.util,
        dataUrl = '/apps/example_01/json/directory-data.json',
        pluginName = 'component',
        pluginCallName = 'componentCall';
    
    COMPONENT[pluginName] = function (container, args) {
        var defParams = {
            container : container || '.cm-table-ui'
            
        };
        this.opts = UTIL.def(defParams, (args || {}));
        if (!(this.obj = $(this.opts.container)).length) return;
        this.init();
    };
    COMPONENT[pluginName].prototype = {
        init : function () {
            this.initOpts();
        },
        initOpts : function () {
            console.log(1);
        }

        // sort data and create table
        // 
    };

    $(function () {
        var testing = new COMPONENT[pluginName];
    });
})(window, window.document, window.jQuery);