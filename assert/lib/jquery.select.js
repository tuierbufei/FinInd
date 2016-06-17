;(function ($) {

    var skullSelect = {

        init: function (opts, $obj, selectId, container) {
            var $skullList;
            var self = this;
            self._$obj = $obj;
            self._selectId = selectId;
            self._opts = opts;
            self._$container = container;
            self.disabledSelect();
            self._popup = $skullList = self.createSelect(container);
            self.setPosition();
            $obj.parent().on("click", function () {
                self.show($(this).attr("skull"));
            });


            $skullList.on("click","li",function () {
                if($(this).hasClass("checked")) {
                    self.hideAll();
                    return;
                }
                $(this).siblings("li").removeClass("checked");
                $(this).addClass("checked");

                // select change value
                var index = $(this).index();
                self.hideAll();
                self.changeSelectValue(index);
            });

            $("#skull_mask").on("click", function () {
                self.hideAll();
            });

            $(window).resize(function () {
                self.setPosition();
            });
        },

        // disabled select drop-down
        disabledSelect: function () {
            var self = this,
                $wrapper,
                $obj = self._$obj,
                selectId = self._selectId;

            $obj.wrap('<div class="skull_select" skull="' + selectId + '"></div>');
            $wrapper = $obj.parent();
            $mask = $('<div class="skull_select_mask"></div>');
            $wrapper.append($mask);
            $mask.text($($obj).val());
        },

        // create popup html
        createSelect: function (container) {
            var self = this,
                html,
                $obj = self._$obj,
                selectId = self._selectId;

            var $skullList = $('<div id="skullList' + selectId
                + '" class="list radio_block skull_list"></div>');
            html = '<ul>';
            $obj.find('option').each(function (i, opt) {
                opt = $(opt);
                var text = opt.prop('selected') ? ' class="checked"' : '';
                html += '<li' + text + '>'
                    + '<label>' + (opt.text()) + '<i class="icon icon_radio"></i></label>'
                    + '</li>';

            });
            html += '</ul>';
            $skullList.hide();
            $skullList.append(html);
            container.append($skullList);

            return $skullList;
        },

        updateOption: function(){
            var self = this,
                $obj = self._$obj,
                selectId = self._selectId,
                container = self._$container;
                //opts = self._opts;

            var $skullList = $('#skullList' + selectId);
            $skullList.remove();

            self._popup = $skullList = self.createSelect(container);
            $($obj.parent().find('.skull_select_mask')[0]).text($($obj).val());
            self.setPosition();
            $obj.parent().on("click", function () {
                self.show($(this).attr("skull"));
            });


            $skullList.on("click","li",function () {
                if($(this).hasClass("checked")) {
                    self.hideAll();
                    return;
                }
                $(this).siblings("li").removeClass("checked");
                $(this).addClass("checked");

                // select change value
                var index = $(this).index();
                self.hideAll();
                self.changeSelectValue(index);
            });

            $("#skull_mask").on("click", function () {
                self.hideAll();
            });

            $(window).resize(function () {
                self.setPosition();
            });
        },

        show: function () {
            var self = this;
            $("#skull_mask").show();
            $(".skull_list").hide();
            $("#skullList" + self._selectId).show();

        },

        changeSelectValue: function (index) {
            var self = this;
            var $select = $(".skull_select[skull=" + self._selectId + "]").find("select");
            $select.find('option').eq(index).prop('selected', true);
            
            var $mask = $(".skull_select[skull=" + self._selectId + "]").find(".skull_select_mask");
            $mask.text($select.val());
            
            $select.trigger("change");
        },
        
        selectedValue: function(value) {
            var self = this;
            var item = self._popup.find('ul li > label').filter(function() {
                return $(this).text() == value;
            });
            if(item[0] != undefined) {
                $(item[0]).parent().trigger('click');
            }
        },

        hideAll: function () {
            $("#skull_mask").hide();
            $(".skull_list").hide();
        },

        fixed: function () {

            // maybe should do something here

            return true;
        },

        setPosition: function () {
            var self = this;
            var position = self._opts.position;

            switch (position) {
                case "center":
                    self.setCenter();
                    break;
                case "bottom":
                    self.setBottom();
                    break;
                default:
                    self.setCenter();
            }

        },
        setCenter: function () {
            var self = this;
            var $window = $(window);
            var $document = $(document);
            var popup = self._popup;
            var fixed = this.fixed;
            var dl = fixed ? 0 : $document.scrollLeft();
            var dt = fixed ? 0 : $document.scrollTop();
            var ww = $window.width();
            var wh = $window.height();
            var ow = popup.width();
            var oh = popup.height();
            var left = (ww - ow) / 2 + dl;
            var top = (wh - oh) * 382 / 1000 + dt;// golden section ratio
            //var style = popup[0].style;
            left = Math.max(parseInt(left), dl);
            var maxHeight = wh - 200;
            if (oh > maxHeight) {
                popup.css("maxHeight", maxHeight);
            }

            if(top > 0) {
                top = Math.max(parseInt(top), dt);
            } else {
                top = (wh - maxHeight) * 382 / 1000 + dt;
            }

            top = top + 25;

            popup.css({
                left: left,
                top: top
            });

        },
        setBottom: function () {
            var self = this;
            var popup = self._popup;
            var height = 200;
            var oh = popup.height();
            height = Math.min(oh, height);
            var bottom = 0;
            var left = 0;
            popup.css({
                width: "100%",
                height: height,
                bottom: bottom,
                left: left
            });
        }
    };

    $.fn.select = function (container, options) {

        var opts = $.extend({}, $.fn.select.defaults, options);

        if ($.isPlainObject(opts)) {
            var _count = 0;
            var _expando = new Date() - 0; // Date.now()

            return this.each(function () {
                var selectId, $obj;

                if (_count == 0) {
                    container.append('<div id="skull_mask" style="display: none"></div>');
                }
                $obj = $(this);
                _count++;
                selectId = opts.id || _expando + _count;

                var selectObj = Object.create(skullSelect);
                selectObj.init(opts, $obj, selectId, container);
                $(this).data('selectObj', selectObj);
            });
        }
    }


    $.fn.select.defaults = {"position": "center"};


})(jQuery);
