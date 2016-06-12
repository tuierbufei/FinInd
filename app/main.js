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

        $(document).on("pageInit", "#company", function(e, id, $page) {


        });

        $(document).on("pageInit", "#industry", function(e, id, $page) {

        });

        $.init();
    });
});
