/**
 * Created by ThinkPad on 2016/6/9.
 */
define(['jquery', 'jqueryActual'], function($){
    return {
        init: function (table){
            var rows = table.find('tr');
            rows.each(function(){
                var td = $(this).children()[0];
                if(td != undefined) {
                    $(td).addClass('fixed-column');
                }
            });
            var column = table.find('.fixed-column');
            if(column != undefined){
                var tr = table.find("tr");

                column.each(function () {
                    $(this).css('position', 'absolute');
                });

                table.css('margin-left', $(column[0]).actual('outerWidth'));

                //tr.each(function () {
                //    var columns = $(this).children();
                //
                //    var column0 = $(columns[0]).children()[0] || columns[0];
                //    var column1 = columns[1];
                //
                //    var height0 = $(column0).actual('scrollHeight', { includeMargin : true, absolute : true }) + 2;
                //    var height1 = column1 ? $(column1).actual('scrollHeight', { includeMargin : true, absolute : true }) + 2 : 0;
                //
                //    var height = Math.max(height0, height1);
                //
                //    columns[0].style.height = height + "px";
                //    this.style.height = height + "px";
                //
                //    if (column1) {
                //        column1.style.height = height + "px";
                //    }
                //});
                tr.each(function () {
                    var columns = $(this).children();

                    var column0 = $(columns[0]).children()[0] || columns[0];
                    var column1 = columns[1];

                    var height0 = (column0).offsetHeight;
                    var height1 = column1 ? column1.offsetHeight : 0;

                    var height = Math.max(height0, height1);

                    columns[0].style.height = height + "px";
                    this.style.height = height + "px";

                    if (column1) {
                        column1.style.height = height + "px";
                    }

                });
            }
        },
        appendTo: function(container, table){
            var outer = $('<div class="table-outer-container"/>');
            var inner = $('<div class="table-inner-container"/>');
            inner.append(table);
            outer.append(inner);
            container.append(outer);
        }
    }
})