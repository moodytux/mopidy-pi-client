define(["jquery", "coverflowjs", "bootstrap", "app/logger"], function($, coverflowjs, bootstrap, logger) {
    logger.log("In album-list-screen.js")
    var albumListScreen = {
        _navigateToAlbumCallback: null,
        _initialisedCoverflow: false,
        setNavigateToAlbumCallback: function(navigateToAlbumCallbackIn) {
            _navigateToAlbumCallback = navigateToAlbumCallbackIn;
        },
        render: function(albums) {
            logger.log("About to render the following albums along with their categories", albums);

            // Show our album list screen, hide other screens.
            $(".screen").hide();
            $("#album-and-category-list").show();

            // Fill our coverflow if we haven't done so already.
            if (!albumListScreen._initialisedCoverflow) {
                albumListScreen._renderCoverList(albums);
                albumListScreen._renderCategoryList(albums);

                albumListScreen._initialisedCoverflow = true;
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
                        .attr("data-piclient-album-category-index", album.category.index)
                        .click(function() {
                            if ($(this).hasClass('ui-state-active')) {
                                _navigateToAlbumCallback(album);
                            }
                        })
                        .appendTo($("#album-and-category-list div.coverflow"));
                });
            }

            // Render as coverflow. Do this after showing the list section to fix an issue with coverflow so
            // the display none has been removed.
            $(".coverflow").coverflow({
                select: function(event, ui) {
                    var newlySelectedCategoryIndex = ui.active[0].dataset.piclientAlbumCategoryIndex;
                    if (albumListScreen._initialisedCoverflow &&
                        !albumListScreen._isCurrentCategory(newlySelectedCategoryIndex)) {
                        logger.log("Selecting category in categoryflow");
                        $('.categoryflow').coverflow('select', newlySelectedCategoryIndex);
                    }
                }
            });
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
                            .attr("data-piclient-album-index", index)
                            .attr("data-piclient-album-category-index", album.category.index)
                            .text(album.category.name)
                            .appendTo($("#album-and-category-list div.categoryflow"));
                    }
                });
            }

            // Render as coverflow. Do this after showing the list section to fix an issue with coverflow so
            // the display none has been removed.
            $(".categoryflow").coverflow({
                overlap: 0,
                angle: 0,
                select: function(event, ui) {
                    var newlySelectedCategoryIndex = ui.active[0].dataset.piclientAlbumCategoryIndex;
                    if (albumListScreen._initialisedCoverflow &&
                        !albumListScreen._isCurrentCoverInCategory(newlySelectedCategoryIndex)) {
                        var firstAlbumForCategoryIndex = ui.active[0].dataset.piclientAlbumIndex;
                        logger.log("Selecting first album in coverflow for category");
                        $('.coverflow').coverflow('select', firstAlbumForCategoryIndex);
                    }
                }
            });
        },
        _isCurrentCoverInCategory: function(categoryIndexToTest) {
            var inCategory = false;
            var currentCoverCategoryIndex = $("div.cover.ui-state-active")[0].dataset.piclientAlbumCategoryIndex;
            if (currentCoverCategoryIndex == categoryIndexToTest) {
                inCategory = true;
            }
            return inCategory;
        },
        _isCurrentCategory: function(categoryIndexToTest) {
            var isCurrentCategory = false;
            var currentCategoryIndex = $("div.category.ui-state-active")[0].dataset.piclientAlbumCategoryIndex;
            if (currentCategoryIndex == categoryIndexToTest) {
                isCurrentCategory = true;
            }
            return isCurrentCategory;
        }
    };
    return albumListScreen;
});
