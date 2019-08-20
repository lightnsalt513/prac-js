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
            activeClass : 'is-active',
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
            this.initOpts();
        },
        initOpts : function () {
            this.selectedItem = null;
            this.contentEditing = null;
        },
        initAjax : function () {
            var _this = this;
            $.ajax({
                url : _this.opts.dataSrc,
                contentType : 'application/json',
                dataType : 'json',
                success : function (result) {
                    if (!result.data.length) return;
                    _this.initialLayoutFunc(result.data);
                    _this.afterAjax();
                }
            });
        },
        initialLayoutFunc : function (data) {
            this.dataArray = data.slice(0); // data cloning
            if (this.opts.startCreate == null) {
                var initialLayout = this.createNodesFunc([], this.dataArray);
                initialLayout.unshift('<div class="cm-tree__wrap"><ul class="cm-tree__root">');
                initialLayout.push('</ul></div>');
                this.obj.append(initialLayout.join(''));
                this.opts.startCreate = 'started';
            }
        },
        createNodesFunc : function (aHtml, datas) {
            for (var i = 0, max = datas.length; i < max; i++) {
                var data = datas[i],
                    isChildrenType = data.hasOwnProperty('children'),
                    childrenTypeClass = (isChildrenType) ? 'cm-tree__folder' : 'cm-tree__file';
                aHtml.push('<li class="' + childrenTypeClass + '">');
                aHtml.push('<div class="cm-tree__content"><button type="button" class="cm-tree-btn">' + data['name'] + '</button></div>');
                if (isChildrenType && data['children'].length) {
                    aHtml.push('<ul class="cm-tree__folder-children">');
                    this.createNodesFunc(aHtml, data['children']);
                    aHtml.push('</ul>');
                }
                aHtml.push('</li>');
            }
            return aHtml;
        },
        afterAjax : function () {
            this.setElements();
            this.controlDataNum(this.rootElement.children());
            this.bindEvents(false);
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
        controlDataNum : function (elements, parentLevel) {
            for (var i = 0, max = elements.length; i < max; i++) {
                var element = elements.eq(i),
                    isChildrenUl = element.find('>ul'),
                    dataLevel = (typeof parentLevel != 'undefined') ? parentLevel + '_' + i : i;
                element.attr('data-level', dataLevel);
                if (isChildrenUl.length && isChildrenUl.children().length) {
                    this.controlDataNum(isChildrenUl.children(), dataLevel);
                }
            }
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
                this.btn.on(this.changeEvents('click'), $.proxy(this.onClickBtn, this));
                this.obj.on(this.changeEvents('changeName'), $.proxy(this.changeNameFunc, this));
                this.obj.on(this.changeEvents('deleteItem'), $.proxy(this.deleteItemFunc, this));
                this.obj.on(this.changeEvents('addFileAbove addFileBelow addFolderAbove addFolderBelow'), $.proxy(this.addElementFunc, this));
            } else {
                this.btn.off(this.changeEvents('click'));
                this.obj.off(this.changeEvents('changeName'));
                this.obj.off(this.changeEvents('deleteItem'));
                this.obj.off(this.changeEvents('addFileAbove addFileBelow addFolderAbove addFolderBelow'));
            }
        },
        onClickBtn : function (e) {
            var target = $(e.currentTarget);
            e.preventDefault();
            if (this.selectedItem != null) {
                this.selectedItem.removeClass(this.opts.activeClass);
            }
            target.addClass(this.opts.activeClass);
            this.selectedItem = target;
        },
        findTargetArrayFunc : function (type) {
            var target = this.selectedItem.closest('li'), 
                targetData = target.attr('data-level'),
                targetLevelArray = targetData.split('_'),
                finalIndex = targetLevelArray.pop(),
                targetArr = this.dataArray;
            for (var i = 0, max = targetLevelArray.length; i < max; i++) {
                var index = targetLevelArray[i];
                targetArr = targetArr[index].children;                
            };
            if (type === 'array') {
                return targetArr;
            } else if (type === 'targetIndex') {
                return finalIndex;
            }
        },
        deleteItemFunc : function () {
            if (this.selectedItem == null) return;
            var targetArr = this.findTargetArrayFunc('array'),
                finalIndex = this.findTargetArrayFunc('targetIndex');
            targetArr.splice(finalIndex, 1);
            this.selectedItem.closest('li').remove();
            this.afterAjax();
            console.log(this.dataArray);
        },
        addElementFunc : function (e) {
            if (this.selectedItem == null) return;
            var isChildrenType =  (e.type === 'addFolderAbove' || e.type === 'addFolderBelow'),
                newContent = !isChildrenType ? {"name" : "NEW FILE"}
                                             : {"name" : "NEW FOLDER", "children" : []}, 
                newLayout = this.createNodesFunc([], [newContent]),
                targetArr = this.findTargetArrayFunc('array'),
                finalIndex = this.findTargetArrayFunc('targetIndex');
            if (e.type === 'addFileAbove' || e.type === 'addFolderAbove') {
                targetArr.splice(finalIndex, 0, newContent);
                this.selectedItem.closest('li').before(newLayout.join(''));
            } else if (e.type === 'addFileBelow' || e.type === 'addFolderBelow') {
                targetArr.splice(finalIndex - 1, 0, newContent);
                this.selectedItem.closest('li').after(newLayout.join(''));
            }
            this.afterAjax();
            console.log(this.dataArray);
        },
        changeNameFunc : function () {
            if (this.selectedItem == null) return;
            var target = this.selectedItem,
                targetArr = this.findTargetArrayFunc('array'),
                finalIndex = this.findTargetArrayFunc('targetIndex'),
                originalContent = '';
            target[0].contentEditable = true;
            target.on(this.changeEvents('focus'), function () {
                originalContent = target.html();
            });
            target.on(this.changeEvents('focusout'), function () {
                var newContent = target.html();
                if (originalContent !== newContent) {
                    targetArr[finalIndex]['name'] = newContent;
                }
                console.log(targetArr);            
                target[0].contentEditable = false;
            });
            target.focus();
        }
    };

    $(function () {
        var testing = new COMPONENT[pluginName];
    });
})(window, window.document, window.jQuery);