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
            listItems : '> li',
            contentArea : '.cm-tree__content',
            nameArea : '.cm-tree__name',
            foldBtn : '.cm-tree-fold-btn',
            folderClass : 'cm-tree__folder',
            fileClass : 'cm-tree__file',
            activeClass : 'is-active',
            collapseClass : 'is-collapse',
            dragOverClass : 'is-over',
            customEvent : '.' + pluginName + (new Date()).getTime(),
            startCreate : null,
            dataSrc : null
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
                aHtml.push('<li class="' + childrenTypeClass + '" draggable="true">');
                aHtml.push('<div class="cm-tree__content" tabindex="0">');
                if (isChildrenType && data['children'].length) {
                    aHtml.push('<button class="cm-tree-fold-btn" type="button"><span class="blind">Expand/Collapse</span></button>');
                }
                aHtml.push('<span class="cm-tree__name">' + data['name'] + '</span></div>')
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
            this.listItems = this.obj.find('ul' + this.opts.listItems);
            this.contentArea = this.listItems.find(this.opts.contentArea);
            this.foldBtn = this.listItems.find(this.opts.foldBtn);
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
                this.contentArea.on(this.changeEvents('click keydown'), $.proxy(this.onClickItem, this));
                this.foldBtn.on(this.changeEvents('click'), $.proxy(this.onClickFold, this));
                this.obj.on(this.changeEvents('changeName'), $.proxy(this.changeNameFunc, this));
                this.obj.on(this.changeEvents('deleteItem'), $.proxy(this.deleteItemFunc, this));
                this.obj.on(this.changeEvents('addFileAbove addFileBelow addFolderAbove addFolderBelow addFileWithin addFolderWithin'), $.proxy(this.addElementFunc, this));
                this.listItems.on(this.changeEvents('dragstart'), $.proxy(this.dragStartFunc, this));
                this.listItems.on(this.changeEvents('dragover'), $.proxy(this.dragOverFunc, this));
                this.listItems.on(this.changeEvents('dragleave'), $.proxy(this.dragLeaveFunc, this));
                this.listItems.on(this.changeEvents('drop'), $.proxy(this.dropFunc, this));
            } else {
                this.contentArea.off(this.changeEvents('click keydown'));
                this.foldBtn.off(this.changeEvents('click'));
                this.obj.off(this.changeEvents('changeName'));
                this.obj.off(this.changeEvents('deleteItem'));
                this.obj.off(this.changeEvents('addFileAbove addFileBelow addFolderAbove addFolderBelow addFileWithin addFolderWithin'));
                this.listItems.off(this.changeEvents('dragstart'));
                this.listItems.off(this.changeEvents('dragover'));
                this.listItems.off(this.changeEvents('dragleave'));
                this.listItems.off(this.changeEvents('drop'));
            }
        },
        onClickItem : function (e) {
            var target = $(e.currentTarget);
            if (e.type === 'keydown') {
                if (e.keyCode === 13) {
                    target.trigger('click');
                }
            } else if (e.type === 'click') {
                if (this.selectedItem != null) {
                    this.selectedItem.removeClass(this.opts.activeClass);
                }
                target.addClass(this.opts.activeClass);
                this.selectedItem = target;
            }
        },
        onClickFold : function (e) {
            e.preventDefault();
            e.stopPropagation();
            var target = $(e.currentTarget),
                targetChildren = target.closest('li').children('ul'),
                isCollapse = (target.hasClass(this.opts.collapseClass)) ? true : false;
            if (isCollapse) {
                target.removeClass(this.opts.collapseClass);
                targetChildren.show();
            } else {
                target.addClass(this.opts.collapseClass);
                targetChildren.hide();
            }
        },
        findTargetArrayFunc : function (item) {
            var target = item.closest('li'), 
                targetData = target.attr('data-level'),
                targetLevelArray = targetData.split('_'),
                finalIndex = targetLevelArray.pop(),
                targetArr = this.dataArray;
            for (var i = 0, max = targetLevelArray.length; i < max; i++) {
                var index = targetLevelArray[i];
                targetArr = targetArr[index].children;                
            };
            return {
                array : targetArr,
                targetIndex : finalIndex
            };
        },
        deleteItemFunc : function () {
            if (this.selectedItem == null) return;
            var targetArrInfo = this.findTargetArrayFunc(this.selectedItem),
                targetArr = targetArrInfo['array'],
                finalIndex = targetArrInfo['targetIndex'];
            targetArr.splice(finalIndex, 1);
            this.selectedItem.closest('li').remove();
            this.afterAjax();
            console.log(this.dataArray);
        },
        addElementFunc : function (e) {
            if (this.selectedItem == null) return;
            var isChildrenType =  (e.type === 'addFolderAbove' || e.type === 'addFolderBelow' || e.type === 'addFolderWithin'),
                newContent = !isChildrenType ? {"name" : "NEW FILE"}
                                             : {"name" : "NEW FOLDER", "children" : []}, 
                newLayout = this.createNodesFunc([], [newContent]),
                targetArrInfo = this.findTargetArrayFunc(this.selectedItem),
                targetArr = targetArrInfo['array'],
                finalIndex = targetArrInfo['targetIndex'],
                newNode;
            if (e.type === 'addFileAbove' || e.type === 'addFolderAbove') {
                targetArr.splice(finalIndex, 0, newContent);
                newNode = this.selectedItem.closest('li').before(newLayout.join('')).prev();
            } else if (e.type === 'addFileBelow' || e.type === 'addFolderBelow') {
                targetArr.splice(finalIndex - 1, 0, newContent);
                newNode = this.selectedItem.closest('li').after(newLayout.join('')).next();
            } else if (e.type === 'addFileWithin' || e.type === 'addFolderWithin') {
                if (!this.selectedItem.closest('li').hasClass(this.opts.folderClass)) return;
                if (!this.selectedItem.closest('li').find('.cm-tree__folder-children').length) {
                    targetArr[finalIndex].children = [];
                    this.selectedItem.closest('.cm-tree__content').append('<button class="cm-tree-fold-btn" type="button"><span class="blind">Expand/Collapse</span></button>');
                    this.selectedItem.closest('li').append('<ul class="cm-tree__folder-children"></ul>');
                    this.selectedItem.closest('li').find('.cm-tree__folder-children').prepend();
                }
                targetArr[finalIndex].children.splice(0, 0, newContent);
                newNode = this.selectedItem.closest('li').find('.cm-tree__folder-children').prepend(newLayout.join('')).children().eq(0);
            }
            this.afterAjax();
            newNode.find(this.opts.contentArea).trigger(this.changeEvents('click'));
            this.obj.trigger(this.changeEvents('changeName'));
            console.log(this.dataArray);
        },
        changeNameFunc : function () {
            if (this.selectedItem == null) return;
            var target = this.selectedItem.find(this.opts.nameArea),
                targetArrInfo = this.findTargetArrayFunc(this.selectedItem),
                targetArr = targetArrInfo['array'],
                finalIndex = targetArrInfo['targetIndex'],
                originalContent = '';
            target[0].contentEditable = true;
            target.on(this.changeEvents('focus'), function () {
                originalContent = target.text();
            });
            target.on(this.changeEvents('focusout keydown'), function (e) {
                var newContent = $.trim(target.text());
                if (e.type === 'keydown' && e.keyCode === 13) {
                    target.trigger('focusout');
                } else if (e.type === 'focusout') {
                    if (originalContent !== newContent) {
                        if (newContent == '') {
                            alert('File/folder name cannot be empty!');
                            target.html(originalContent);
                        } else {
                            targetArr[finalIndex]['name'] = newContent;
                        }
                    }
                    console.log(targetArr);            
                    target[0].contentEditable = false;
                }
            });
            target.focus();
        },
        dragStartFunc : function (e) {
            e.stopPropagation();
            var event = e.originalEvent;
            this.dragSrcEl = e.target;
            event.dataTransfer.setData('text', e.target.outerHTML);
            event.dataTransfer.effectAllowed = "move";
        },
        dragOverFunc : function (e) {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.classList.add('is-over');
            e.originalEvent.dataTransfer.dropEffect = 'move';
        },
        dragLeaveFunc : function (e) {
            e.stopPropagation();
            e.currentTarget.classList.remove('is-over');
        },
        dropFunc : function (e) {
            e.stopPropagation();
            if (this.dragSrcEl != e.currentTarget) {
                var dropHTML = e.originalEvent.dataTransfer.getData('text'),
                    srcTargetArrInfo = this.findTargetArrayFunc($(this.dragSrcEl)),
                    srcTargetArr = srcTargetArrInfo['array'],
                    srcTargetIndex = srcTargetArrInfo['targetIndex'],
                    dropTargetArrInfo = this.findTargetArrayFunc($(e.currentTarget)),
                    dropTargetArr = dropTargetArrInfo['array'],
                    dropTargetIndex = dropTargetArrInfo['targetIndex'],
                    srcContent = srcTargetArr.splice(srcTargetIndex, 1),
                    isSrcSelected = ($(this.dragSrcEl).find(this.opts.contentArea).hasClass(this.opts.activeClass)) ? true : false;
                dropTargetArr.splice(dropTargetIndex, 0, srcContent[0]);
                $(this.dragSrcEl).remove();
                e.currentTarget.insertAdjacentHTML('beforebegin', dropHTML);
                this.afterAjax();
                console.log(this.dataArray);
            }
            if (isSrcSelected) {
                this.selectedItem = $(e.currentTarget).prev().find(this.opts.contentArea);
            }
            e.currentTarget.classList.remove('is-over');
        }
    };

    $(function () {
        var sampleUi = new COMPONENT[pluginName](undefined, {
            dataSrc : dataUrl
        });
    });
})(window, window.document, window.jQuery);