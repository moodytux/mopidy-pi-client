define(["jquery", "coverflowjs", "bootstrap", "app/logger"], function($, coverflowjs, bootstrap, logger) {
    logger.log("In album-list-screen.js")
    var albumListScreen = {
        navigateToAlbumCallback: null,
        setNavigateToAlbumCallback: function(navigateToAlbumCallbackIn) {
            navigateToAlbumCallback = navigateToAlbumCallbackIn;
        },
        render: function(albums) {
            logger.log("About to render the following albums along with their categories", albums);

            // Show our album list screen, hide other screens.
            $(".screen").hide();
            $("#album-and-category-list").show();

            // Fill our coverflow if we haven't done so already.
            if (typeof initialisedCoverflow === "undefined") {
                albumListScreen._renderCoverList(albums);
                albumListScreen._renderCategoryList(albums);

                initialisedCoverflow = true;
            }
        },
        _renderCoverList: function(albums) {
            // Reinitialise the list screen.
            $('#album-and-category-list div.coverflow').replaceWith($("<div/>").addClass("coverflow"));

            // Add the album covers to coverflow.
            if (albums != null) {
                albums.forEach(function(album, index) {
                    $("<div/>")
                        .css("background-image", "url(" + album.image + ")")
                        .addClass("cover disable-select")
                        .attr("data-piclient-albumname", album.name)
                        .attr("data-piclient-albumartist", album.artist)
                        .click(function() {
                            if ($(this).hasClass('ui-state-active')) {
                                navigateToAlbumCallback(album.uri);
                            }
                            if (typeof(album.category) !== "undefined") {
                                $('.categoryflow').coverflow('select', album.category.index);
                            }
                        })
                        .appendTo($("#album-and-category-list div.coverflow"));
                });
            }

            // Render as coverflow. Do this after showing the list section to fix an issue with coverflow so
            // the display none has been removed.
            $(".coverflow").coverflow();
        },
        _renderCategoryList: function(albums) {
            // Reinitialise the list screen.
            $('#album-and-category-list div.categoryflow').replaceWith($("<div/>").addClass("categoryflow"));

            // Add the album categories to category flow.
            if (albums != null) {
                albums.forEach(function(album, index) {
                    if (typeof(album.category.name) !== "undefined") {
                        logger.log("Adding category", album.category.name);
                        $("<div/>")
                            .addClass("category disable-select")
                            .text(album.category.name)
                            .click(function() {
                                $('.coverflow').coverflow('select', index);
                            })
                            .appendTo($("#album-and-category-list div.categoryflow"));
                    }
                });
            }

            // Render as coverflow. Do this after showing the list section to fix an issue with coverflow so
            // the display none has been removed.
            $(".categoryflow").coverflow({
                overlap: 0,
                angle: 0
            });
        }
    };
    return albumListScreen;
});
