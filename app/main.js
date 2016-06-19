/**
 * Created by ThinkPad on 2016/6/2.
 */
requirejs(['jquery','domready', 'light7'], function($, domready) {
    var customIconNavTab = ['companyNav', 'industryNav'];
    domready(function () {
        var navs = $('#navTab').find('a');
        if(location.hash != undefined && location.hash != '') {
            $.each(navs, function(index, tab){
                if(tab.hash == location.hash && customIconNavTab.indexOf($(tab).attr('id')) != -1) {
                    var previous = $(tab).parent().find('.active')[0];
                    if(previous != undefined && customIconNavTab.indexOf(previous.id) != -1) {
                        var icon = $(previous).find('img')[0];
                        if(icon != undefined) {
                            icon.src = $(icon).attr('data-unselected');
                        }
                    }

                    var icon = $(tab).find('img')[0];
                    if(icon != undefined) {
                        icon.src = $(icon).attr('data-selected');
                    }

                    requirejs([location.hash.replace("#", '') + '/main']);

                    return false;
                }
            });
        } else {
            requirejs(['company/main']);
        }

        $.each(navs, function(index, tab){
            //navs.find('.active').
            $(tab).on('click', function(e){
                var previous = $(e.currentTarget).parent().find('.active')[0];
                if(previous != undefined && customIconNavTab.indexOf(previous.id) != -1) {
                    var icon = $(previous).find('img')[0];
                    if(icon != undefined) {
                        icon.src = $(icon).attr('data-unselected');
                    }
                }

                if(customIconNavTab.indexOf(e.currentTarget.id) != -1) {
                    var icon = $(e.currentTarget).find('img')[0];
                    if(icon != undefined) {
                        icon.src = $(icon).attr('data-selected');
                    }
                }

                if(e.currentTarget.hash == '#industry') {
                    requirejs(['industry/main']);
                } else if(e.currentTarget.hash == '#company'){
                    requirejs(['company/main']);
                }
            });

            var icon = $(tab).find('img')[0];
            if(icon != undefined && icon.src == '') {
                icon.src = $(icon).attr('data-unselected');
            }
        });
    });

    var loadPage = function (url, noAnimation, replace, reload) {

        var param = url;

        if (noAnimation === undefined) {
            noAnimation = !$.router.defaults.transition;
        }

        if (typeof url === typeof "a") {
            param = {
                url: url,
                noAnimation: noAnimation,
                replace: replace
            }
        }

        url = param.url;
        noAnimation = param.noAnimation;
        replace = param.replace;

        $.router.getPage(url, function (page, extra) {

            var currentPage = $.router.getCurrentPage();

            var pageid = currentPage[0].id;

            var action = "pushBack";
            if (replace) action = "replaceBack";
            if (reload) action = "reloadBack";
            $.router[action]({
                url: location.href,
                pageid: "#" + pageid,
                id: $.router.getCurrentStateID(),
                animation: !noAnimation
            });

            //remove all forward page
            var forward = JSON.parse($.router.state.getItem("forward") || "[]");
            var self = $.router;
            for (var i = 0; i < forward.length; i++) {
                $(forward[i].pageid).each(function () {
                    var $page = $($.router);
                    if ($page.data("page-remote")) {
                        var pageExtra = self.extras[$page[0].id];
                        pageExtra && pageExtra.remove();
                        self.extras[$page[0].id] = undefined;
                        $page.remove();
                    }
                });
            }
            $.router.state.setItem("forward", "[]");  //clearforward

            var duplicatePage = $("#" + $(page)[0].id);

            page.insertBefore($(".page")[0]);

            if (duplicatePage[0] !== page[0]) duplicatePage.remove(); //if inline mod, the duplicate page is current page

            if (extra) self.extras[page[0].id] = extra.appendTo(document.body);

            var id = $.router.genStateID();
            $.router.setCurrentStateID(id);

            $.router[replace || reload ? "replaceState" : "pushState"](url, id);

            $.router.forwardStack = [];  //clear forward stack

            // $.router.animatePages($.router.getCurrentPage(), page, null, noAnimation);
            $.router.animatePages(page, $.router.getCurrentPage(), true, noAnimation);  // leftToRight
        });
    }

    window.onpopstate = function () {

        // 修正因整合 requirejs 引起的无法前进后退的bug;
        var state = history.state;
        if (state) {
            var currentStateId = $.router.getCurrentStateID();
            if (state.id !== currentStateId) {
                var forward = state.id > currentStateId;
                var h, currentPage, newPage;
                if (forward) {
                    //$.router._forward();
                    h = $.router.popForward();
                    if (!h) window.location.href = window.location.href;  // 刷新页面后导致popBack为空，直接转到地址
                    currentPage = $.router.getCurrentPage();
                    newPage = $(h.pageid);
                    if (!newPage[0]) return;
                    $.router.pushBack({ url: h.url, pageid: "#" + currentPage[0].id, id: $.router.getCurrentStateID(), animation: h.animation });  // url: location.href 改为 h.url ， 估计这是个bug!
                    $.router.setCurrentStateID(h.id);
                    $.router.animatePages(currentPage, newPage, false, !h.animation);
                } else {
                    $.closeModal();  //关闭Model
                    $.closePanel();  //关闭侧栏
                    //$.router._back();
                    h = $.router.popBack();
                    if (!h) {
                        loadPage(location.href, false, false, true); //window.location.href = window.location.href;  // 刷新页面后或执行`$.router.stack.setItem('back', '[]');  // 后退时重新加载页面`导致popBack为空，直接转到地址
                    } else {
                        currentPage = $.router.getCurrentPage();
                        newPage = $(h.pageid);
                        if (!newPage[0]) return;
                        $.router.pushForward({ url: location.href, pageid: "#" + currentPage[0].id, id: $.router.getCurrentStateID(), animation: h.animation });
                        $.router.setCurrentStateID(h.id);
                        $.router.animatePages(newPage, currentPage, true, !h.animation);
                    }
                }
            }
        }
    };

    $(document).on("pageInit", "#company", function(e, id, $page) {
    });

    $(document).on("pageInit", "#industry", function(e, id, $page) {
    });

    $.init();
});
