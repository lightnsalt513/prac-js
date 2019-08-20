(function(win, doc, $) {
    'use strict';
    win.cmui = win.cmui || {};
    win.cmui.components = win.cmui.components || {};
    win.cmui.components.common = win.cmui.components.common || {};
    win.cmui.components['commonTableUi'] = win.cmui.components['commonTableUi'] || {};

    var COMPONENT = win.cmui.components['commonTableUi'],
        UTIL = win.cmui.components.common.util,
        dataUrl = '/apps/example_02/json/data.json',
        pluginName = 'component',
        pluginCallName = 'componentCall';
    
    COMPONENT[pluginName] = function (container, args) {
        var defParams = {
            container : container || '.cm-table-ui',
            tableElem : 'table',
            rowElem : 'tr',
            thElem : 'th',
            tdElem : 'td',
            sortBtn : '.cm-table-ui__btn-sort',
            ascendClass : 'is-ascend',
            descendClass : 'is-descend',
            searchArea : '.cm-table-ui__search',
            searchInput : '.cm-table-ui__search-input',
            searchBtn : '.cm-table-ui__search-btn',
            customEvent : '.' + pluginName + (new Date()).getTime(),
            requiredField : {
                '_id' : 'ID',
                'productName' : 'Product Name',
                'company' : 'Company Name',
                'countryOrigin' : 'Country of Origin',
                'inventory' : 'Inventory',
                'price' : 'Unit Price'
            },
            dataSrc : dataUrl
        };
        this.opts = UTIL.def(defParams, (args || {}));
        if (!(this.obj = $(this.opts.container)).length) return;
        this.init();
    };
    COMPONENT[pluginName].prototype = {
        init : function () {
            this.initOpts();
            this.initAjax();
        },
        initOpts : function () {
            this.dataObj = [];
        },
        initAjax : function () {
            var _this = this;
            $.ajax({
                url : _this.opts.dataSrc,
                contentType : 'application/json',
                dataType : 'json',
                success : function (result) {
                    if (!result.length) return;
                    _this.filterDataFunc(result, _this.opts.requiredField);
                    if (!_this.dataObj.length) return;
                    _this.drawTableFunc();
                    _this.afterAjax();
                }
            });
        },
        filterDataFunc : function (data, requiredField) {
            var cloneData = data.slice(0),
                filteredData = [];
            for (var i = 0, max = cloneData.length; i < max; i++) {
                var obj = cloneData[i];
                filteredData.push({});
                for (var prop in requiredField) {
                    if (obj.hasOwnProperty(prop)) {
                        var tableHead = requiredField[prop];
                        filteredData[i][tableHead] = obj[prop];
                    }
                }
            }
            this.dataObj = filteredData;
        },
        drawTableFunc : function () {
            var initLayout = [],
                startedLoop = null;
            initLayout.push('<table><tr>');
            for (var prop in this.dataObj[0]) {
                initLayout.push('<th>');
                initLayout.push('' + prop);
                initLayout.push('<button type="button" class="cm-table-ui__btn-sort fas fa-arrow-down"><span class="blind">Sort</span></button>');
                initLayout.push('</a>');       
            }
            initLayout.push('</tr>');
            for (var i = 0, max = this.dataObj.length; i < max; i++) {
                var obj = this.dataObj[i];
                initLayout.push('<tr>');
                for (var prop in obj) {
                    initLayout.push('<td>');                    
                    initLayout.push('' + obj[prop]);                
                    initLayout.push('</td>');                    
                }
                initLayout.push('</tr>');
            }
            initLayout.push('</table>');
            this.obj.append(initLayout.join(''));
        },
        afterAjax : function () {
            this.setElements();
            this.bindEvents(false);
            this.bindEvents(true);
        },
        setElements : function () {
            this.tableElem = this.obj.find(this.opts.tableElem);
            this.rowElem = this.tableElem.find(this.opts.rowElem);
            this.tdElem = this.tableElem.find(this.opts.tdElem);
            this.sortBtn = this.tableElem.find(this.opts.sortBtn);
            this.searchArea = this.obj.find(this.opts.searchArea);
            this.searchInput = this.searchArea.find(this.opts.searchInput);
            this.searchBtn = this.searchArea.find(this.opts.searchBtn);
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
                this.sortBtn.on(this.changeEvents('click'), $.proxy(this.sortFunc, this));
                this.searchInput.on(this.changeEvents('change'), $.proxy(this.searchFunc, this));
            } else {
                this.sortBtn.off(this.changeEvents('click'));
                this.searchInput.off(this.changeEvents('change'));
            }
        },
        sortFunc : function (e) {
            var targetAnchor =  $(e.currentTarget),
                target = targetAnchor.closest('th'),
                targetItems = target.closest('tr').children('th'),
                targetIndex = targetItems.index(target),
                switching = true,
                sortType = null,
                rows, i, iMax;
            if (targetAnchor.hasClass(this.opts.ascendClass) || targetAnchor.hasClass(this.opts.descendClass)) {
                if (targetAnchor.hasClass(this.opts.descendClass)) {
                    targetAnchor.removeClass(this.opts.descendClass);
                    targetAnchor.addClass(this.opts.ascendClass);
                    sortType = 'ascend';
                } else {
                    targetAnchor.removeClass(this.opts.ascendClass);
                    targetAnchor.addClass(this.opts.descendClass);
                    sortType = 'descend';
                }
            } else {
                targetItems.find(this.opts.sortBtn).removeClass(this.opts.descendClass + ' ' + this.opts.ascendClass);                
                targetAnchor.addClass(this.opts.descendClass);
                sortType = 'descend';
            }
            while (switching) {
                switching = false;
                rows = this.tableElem.find('tr');
                for (i = 1, iMax = (rows.length - 1); i < iMax; i++) {
                    var prevVal = rows[i].childNodes[targetIndex].innerHTML.toLowerCase(),
                        nextVal = rows[i + 1].childNodes[targetIndex].innerHTML.toLowerCase();
                    if ((sortType === 'descend' && prevVal > nextVal) || (sortType === 'ascend' && prevVal < nextVal)) {
                        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                        switching = true;
                        break;
                    }
                }
            }
        },
        searchFunc : function () {
            console.log(2);
        }
    };

    $(function () {
        var testing = new COMPONENT[pluginName];
    });
})(window, window.document, window.jQuery);