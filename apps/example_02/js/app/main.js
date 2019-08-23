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
            searchResetBtn : '.cm-table-ui__search-reset-btn',
            customEvent : '.' + pluginName + (new Date()).getTime(),
            requiredField : {
                '_id' : 'ID',
                'productName' : 'Product Name',
                'company' : 'Company Name'
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
            this.startedSearch = false;
            this.colSpan = null;
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
                filteredData = [],
                colSpan = 0;
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
            this.dataObj = filteredData,
            this.colSpan = Object.keys(requiredField).length; // IE9 부터 지원
        },
        drawTableFunc : function () {
            var initLayout = [];
            initLayout.push('<table><tbody><tr>');
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
            initLayout.push('</tbody></table>');
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
            this.searchResetBtn = this.searchArea.find(this.opts.searchResetBtn);
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
                this.searchBtn.on(this.changeEvents('click'), $.proxy(this.searchFunc, this));
                this.obj.on(this.changeEvents('searchReset'), $.proxy(this.searchResetFunc, this));
            } else {
                this.sortBtn.off(this.changeEvents('click'));
                this.searchBtn.off(this.changeEvents('click'));
                this.obj.off(this.changeEvents('searchReset'));
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
            if (targetAnchor.hasClass(this.opts.ascendClass)) {
                targetAnchor.removeClass(this.opts.ascendClass);
                targetAnchor.addClass(this.opts.descendClass);
                sortType = 'descend';
            } else if (targetAnchor.hasClass(this.opts.descendClass)) { 
                targetAnchor.removeClass(this.opts.descendClass);
                targetAnchor.addClass(this.opts.ascendClass);
                sortType = 'ascend';
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
            var targetInput = this.searchInput, 
                searchVal = targetInput.val().toLowerCase(),
                rows = this.rowElem,
                matchingRow = 0;
            if (!targetInput.val().length) {
                if (!this.startedSearch) return;
                this.startedSearch = false;
                this.tableElem.find('tr.no-result').remove();
            } else {
                this.startedSearch = true;
                this.tableElem.find('tr.no-result').remove();
                for (var i = 1, iMax = rows.length; i < iMax; i++) {
                    var tds = rows[i].childNodes;
                    for (var j = 0, jMax = tds.length; j < jMax; j++) {
                        var tdText = tds[j].innerText;
                        if (tdText.toLowerCase().indexOf(searchVal) > -1) {
                            rows[i].style.display = '';
                            matchingRow++;
                            break;
                        } else {
                            rows[i].style.display = 'none';
                        }
                    }
                }
                if (matchingRow === 0) {
                    var messageLayout = '<tr class="no-result"><td style="text-align:center" colspan="' + this.colSpan + '">No Search Results</td></tr>'
                    this.tableElem.find('tbody').append(messageLayout);
                }
            }
        },
        searchResetFunc : function () {
            // if (!this.startedSearch && !this.searchInput.val().length) return;
            this.startedSearch = false;
            this.searchInput.val('');
            this.tableElem.find('tr.no-result').remove();
            this.rowElem.show();
        }
    };

    $(function () {
        var sample = new COMPONENT[pluginName](undefined, {
            requiredField : {
                '_id' : 'ID',
                'productName' : 'Product Name',
                'company' : 'Company Name',
                'countryOrigin' : 'Country of Origin',
                'inventory' : 'Inventory',
                'price' : 'Unit Price'
            }
        });
    });
})(window, window.document, window.jQuery);