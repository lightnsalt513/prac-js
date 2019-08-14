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
            this.itemCount = 0; // for adding file/folder
            this.selectedItem = null;
            this.contentEditing = null;
            this.layoutLevelCount = 0;
            this.levelDepth = '';
            this.initialLayout = [];
        },
        initAjax : function () {
            var _this = this;
            $.ajax({
                url : _this.opts.dataSrc,
                contentType : 'application/json',
                dataType : 'json',
                success : function (result) {
                    if (!result.data.length) return;
                    _this.createNodes(result.data);
                    _this.afterAjax();
                }
            });
        },
        createNodes : function (data) {
            this.dataArray = data.slice(0); // data cloning
            if (this.opts.startCreate == null) {
                this.initialLayout.push('<div class="cm-tree__wrap"><ul class="cm-tree__root">');
                this.createNodesFunc(this.dataArray);
                this.initialLayout.push('</ul></div>');
                this.obj.append(this.initialLayout.join(''));
                this.opts.startCreate = 'started';
            }
        },
        createNodesFunc : function (data, depth) {
            var levelDepth = depth || '';
            for (var i = 0; i < data.length; i++) {
                var isFolder = (data[i].hasOwnProperty('children')) ? true : false;
                if (!isFolder) {
                    this.initialLayout.push('<li class="cm-tree__file"><div class="cm-tree__content"><button type="button" class="cm-tree-btn" data-level="' + levelDepth + i + '">' + data[i]['name'] + '</button></div></li>');
                } else {
                    this.initialLayout.push('<li class="cm-tree__folder"><div class="cm-tree__content"><button type="button" class="cm-tree-btn" data-level="' + levelDepth + i + '">' + data[i]['name'] + '</button></div>');
                    if (data[i].children.length) {
                        var newDepth = levelDepth + i + '_';
                        this.initialLayout.push('<ul class="cm-tree__folder-children">');
                        this.createNodesFunc(data[i].children, newDepth);
                        this.initialLayout.push('</ul>');
                    }
                    this.initialLayout.push('</li>');
                }
            }
        },
        afterAjax : function () {
            this.setElements();
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
                // this.obj.on(this.changeEvents('changeName'), $.proxy(this.changeNameFunc, this));
                this.obj.on(this.changeEvents('deleteItem'), $.proxy(this.deleteItemFunc, this));
                // this.obj.on(this.changeEvents('addFileAbove'), $.proxy(this.addFileFunc, this));
                // this.obj.on(this.changeEvents('addFileBelow'), $.proxy(this.addFileFunc, this));
            } else {
                this.btn.off(this.changeEvents('click'));
                // this.obj.off(this.changeEvents('changeName'));
                this.obj.off(this.changeEvents('deleteItem'));
                // this.obj.off(this.changeEvents('addFileAbove'));
                // this.obj.off(this.changeEvents('addFileBelow'));
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
        // changeNameFunc : function () {
        //     if (this.selectedItem == null) return;
        //     var target = this.selectedItem,
        //         targetId = target.attr('data-item-id'),
        //         targetKey = 'id',
        //         _this = this,
        //         originalContent,
        //         newContent;
        //     target[0].contentEditable = true;
        //     target.on(this.changeEvents('focus'), function () {
        //         originalContent = target.html();
        //     });
        //     target.on(this.changeEvents('focusout'), function () {
        //         newContent = target.html();
        //         if (originalContent !== newContent) {
        //             _this.changeNameRecursiveFunc(_this.dataArray, targetKey, targetId, newContent);
        //             console.log(_this.dataArray);
        //         }
        //         target[0].contentEditable = false;
        //     });
        //     target.focus();
        // },
        // changeNameRecursiveFunc : function (array, targetKey, targetVal, contentVal) {
        //     for (var i = 0; i < array.length; i++) {
        //         if (array[i][targetKey] === targetVal) {
        //             array[i]['name'] = contentVal;
        //             console.log('before break');
        //             break; // loop 여기서 끝나도록 다시 개발 필요 (break? return?)
        //         } else if (array[i]['children'] !== undefined && array[i]['children'].length > 0) {
        //             console.log('looping');
        //             this.changeNameRecursiveFunc(array[i].children, targetKey, targetVal, contentVal);
        //         }
        //     }
        // },
        deleteItemFunc : function () {
            if (this.selectedItem == null) return;
            var target = this.selectedItem, 
                targetData = target.attr('data-level'),
                targetLevelArray = targetData.split('_'),
                targetIndex = null,
                indexGroupArray = [],
                indexGroup = '';
                
            // for (var i = 0; i < targetLevelArray.length - 1; i++) {
            //     indexGroupArray.push('[' + targetLevelArray[i] + ']');
            //     if (i === targetLevelArray.length - 1) {
            //         targetIndex = i;
            //     }
            // }
            // indexGroup = '1';
            // var testing = Function(' return this.dataArray[indexGroup] ');
            // // testing();
            // console.log(testing());
            // eval((this.dataArray + indexGroup)).splice(targetIndex, 1)

            function recursiveFunc (targetLevelArray, ) {
                
            };
            

            // check how many depths
            // find out all depth and index
            // remove from original array
            

            // this.selectedItem.closest('li').remove();
            // this.afterAjax();
            // console.log(this.dataArray);
        },
        // deleteArrRecursiveFunc : function (array, targetKey, targetVal) {
        //     for (var i = 0; i < array.length; i++) {
        //         if (array[i][targetKey] === targetVal) {
        //             array.splice(i, 1);
        //             break; // loop 여기서 끝나도록 다시 개발 필요 (break? return?)
        //         } else if (array[i]['children'] !== undefined && array[i]['children'].length > 0) {
        //             this.deleteArrRecursiveFunc(array[i].children, targetKey, targetVal);
        //         }
        //     }
        // },
        // addFileFunc : function (e) {
        //     if (this.selectedItem == null) return;
        //     var baseTarget = this.selectedItem,
        //         baseTargetId = baseTarget.attr('data-item-id'),
        //         baseTargetKey = 'id',
        //         position = (function() {
        //             if (e.type === 'addFileAbove') {
        //                 return 'above';
        //             } else if (e.type === 'addFileBelow') {
        //                 return'below';
        //             }
        //         })(),
        //         layout = [];

        //     this.itemCount++;
        //     this.addFileRecursiveFunc(this.dataArray, baseTargetKey, baseTargetId, position); // above / below
        //     layout.push('<li class="cm-tree__file"><div class="cm-tree__content"><button type="button" class="cm-tree-btn" data-item-id="item_' + this.itemCount + '">' + 'NEW FILE' + '</button></div></li>');
        //     if (position === 'above') {
        //         this.selectedItem.closest('li').before(layout.join(''));
        //     } else if (position === 'below') {
        //         this.selectedItem.closest('li').after(layout.join(''));
        //     }
        //     this.afterAjax();
        //     console.log(this.dataArray);
        // },
        // addFileRecursiveFunc : function (array, targetKey, targetVal, position) {
        //     for (var i = 0; i < array.length; i++) {
        //         if (array[i][targetKey] === targetVal) {
        //             var newItem = {
        //                 "name" : "NEW FILE",
        //                 "id" : "item_" + this.itemCount,
        //                 "type" : "file"
        //             };
        //             if (position === 'above') {
        //                 array.splice(i, 0, newItem);
        //             } else if (position === 'below') {
        //                 array.splice(i+1, 0, newItem);
        //             }
        //             return; // loop 여기서 끝나도록 다시 개발 필요 (break? return?)
        //         } else {
        //             if (array[i]['children'] !== undefined && array[i]['children'].length > 0) {
        //                 this.addFileRecursiveFunc(array[i].children, targetKey, targetVal, position);
        //             }
        //         }
        //     }
        // }
    };

    $(function () {
        var testing = new COMPONENT[pluginName];
    });
})(window, window.document, window.jQuery);