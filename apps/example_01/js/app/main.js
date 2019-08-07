(function(win, doc, $) {
    'use strict';
    win.cmui = win.cmui || {};
    win.cmui.components = win.cmui.components || {};
    win.cmui.components.common = win.cmui.components.common || {};
    win.cmui.components['commonTreeUi'] = win.cmui.components['commonTreeUi'] || {};

    var COMPONENT = win.cmui.components['commonTreeUi'],
        UTIL = win.cmui.components.common.util,
        dataUrl = '/apps/example_01/json/directory-data.json',
        pluginName = 'component',
        pluginCallName = 'componentCall';
    
    COMPONENT[pluginName] = function (container, args) {
        var defParams = {
            container : container || '.cm-tree',
            rootElement : '.cm-tree__root',
            folderElement : '.cm-tree__folder',
            folderChildrenWrap : '.cm-tree__folder-children',
            folderChildren : '> li',
            fileElement : '.cm-tree__file',
            contentArea : '.cm-tree__content',
            btn : '.cm-tree-btn',
            // activeClass : 'is-active',
            customEvent : '.' + pluginName + (new Date()).getTime(),
            startCreate : null,
            dataSrc : dataUrl
        };
        this.opts = UTIL.def(defParams, (args || {}));
        if (!(this.obj = $(this.opts.container)).length) return;
        this.init();
    };
    COMPONENT[pluginName].prototype = {
        init : function () {
            this.initAjax();
        },
        initAjax : function () {
            var _this = this;
            $.ajax({
                url : _this.opts.dataSrc,
                contentType : 'application/json',
                dataType : 'json',
                success : function (result) {
                    if (!result.children.length) return;
                    _this.createContainer();
                    _this.createNodes(result.children);
                    _this.afterAjax();
                }
            });
        },
        createContainer : function () {
            var containerElement = [];
            containerElement.push('<div class="cm-tree__wrap"><ul class="cm-tree__root"></ul></div>');
            this.obj.append(containerElement.join(''));
            this.rootElement = this.obj.find(this.opts.rootElement);
        },
        createNodes : function (data) {
            if (this.opts.startCreate == null) {
                this.createNodesFunc(this.rootElement, data);
                this.opts.startCreate = 'started';
            }
        },
        createNodesFunc : function (parent, data) {
            var tempText = [],
                targetParentEl = parent;
            for (var i = 0; i < data.length; i++) {
                var isFolder = (data[i]['type'] === 'folder') ? true : false;
                if (!isFolder) {
                    tempText.push('<li class="cm-tree__file"><div class="cm-tree__content"><button type="button" class="cm-tree-btn">' + data[i]['name'] + '</button></div></li>');
                    targetParentEl.append(tempText.join(''));
                    tempText = [];
                } else {
                    var folderEl,
                        childrenWrapEl;
                    tempText.push('<li class="cm-tree__folder"><div class="cm-tree__content"><button type="button" class="cm-tree-btn">' + data[i]['name'] + '</button></div></li>');
                    targetParentEl.append(tempText.join(''));
                    folderEl = targetParentEl.children().eq(i);
                    tempText = [];

                    if (data[i].children.length) {
                        tempText.push('<ul class="cm-tree__folder-children"></ul>');
                        folderEl.append(tempText.join(''));
                        tempText = [];
    
                        childrenWrapEl = folderEl.find(this.opts.folderChildrenWrap);
                        this.createNodesFunc(childrenWrapEl, data[i].children);
                    }
                }
            }
        },
        afterAjax : function () {
            this.setElements();
            this.initOpts();
            this.bindEvents(true);
        },
        setElements : function () {
            this.rootElement = this.obj.find(this.opts.rootElement);
            this.folderElement = this.rootElement.find(this.opts.folderElement);
            this.folderChildrenWrap = this.folderElement.find(this.opts.folderChildrenWrap);
            this.folderChildren = this.folderChildrenWrap.find(this.opts.folderChildren);
            this.fileElement = this.rootElement.find(this.opts.fileElement);
            this.contentArea = this.rootElement.find(this.opts.contentArea);
            this.btn = this.rootElement.find(this.opts.btn);
        },
        initOpts : function () {
            this.selectedItem = null;
        },
        changeEvents : function (event) {
            var events = [],
                eventNames = event.split(' ');
            for (var key in eventNames) {
                events.push(eventNames[key] + this.opts.customEvent);
            }
            return events.join(' ');
        },
        bindEvents : function (type) {
            if (type) {
                this.btn.on(this.changeEvents('click focus'), $.proxy(this.onClickBtn, this));
                this.obj.on(this.changeEvents('deleteItem'), $.proxy(this.deleteItemFunc, this));
                this.obj.on(this.changeEvents('addItemAbove'), $.proxy(this.addItemAboveFunc, this));
            } else {
                this.btn.off(this.changeEvents('click focus'));
                this.obj.off(this.changeEvents('deleteItem'));
                this.obj.off(this.changeEvents('addItemAbove'));
            }
        },
        onClickBtn : function (e) {
            var target = $(e.currentTarget);
            if (this.selectedItem != null) {
                this.selectedItem.css('background', '');
            }
            target.css('background', 'lightblue');
            this.selectedItem = target;
        },
        deleteItemFunc : function () {
            if (this.selectedItem == null) return;
            this.selectedItem.closest('li').remove();
        },
        addItemAboveFunc : function () {
            if (this.selectedItem == null) return;
            this.selectedItem.closest('li').before();
        }
    };

    $(function () {
        var testing = new COMPONENT[pluginName];
    });
})(window, window.document, window.jQuery);