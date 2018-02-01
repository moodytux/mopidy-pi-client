define(["jquery", "coverflowjs", "bootstrap", "app/logger", "app/album-sorter", "app/album-validator"], function($, coverflowjs, bootstrap, logger, albumSorter, albumValidator) {
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
                albumListScreen.renderCoverList(albums);
                albumListScreen.renderCategoryList(albums);

                initialisedCoverflow = true;
            }
        },
        renderCoverList: function(albums) {
            // Reinitialise the list screen.
            $('#album-and-category-list div.coverflow').replaceWith($("<div/>").addClass("coverflow"));

            // Sort the album data by artist and add to coverflow.
            albums.sort(albumSorter.byArtist);
            if (albums != null) {
                $.each(albums, function(index, album) {
                    if (albumValidator.isValid(album)) {
                        $("<div/>")
                            .css("background-image", "url(" + album.images[0] + ")")
                            .addClass("cover")
                            .attr("data-piclient-albumname", album.name)
                            .attr("data-piclient-albumartist", album.artists[0].name)
                            .click(function() {
                                if($(this).hasClass('ui-state-active')) {
                                    navigateToAlbumCallback(album.uri);
                                }
                            })
                            .appendTo($("#album-and-category-list div.coverflow"));
                    }
                });
            }

            // Render as coverflow. Do this after showing the list section to fix an issue with coverflow so
            // the display none has been removed.
            $(".coverflow").coverflow({
                select: function(event, ui) {
                    console.log(ui);
                }
            });
        },
        renderCategoryList: function(albums) {
            // Reinitialise the list screen.
            $('#album-and-category-list div.categoryflow').replaceWith($("<div/>").addClass("categoryflow"));

            // Sort the album data by genre and add to category flow.
            albums.sort(albumSorter.byGenre);
            if (albums != null) {
                $.each(albums, function(index, album) {
                    if (albumValidator.isValid(album)) {
                        // If this is the first category, setup our list.
                        if (typeof categorySeenList === "undefined") {
                            categorySeenList = [];
                        }

                        // If this is the first time we've seen this category, add it to our seen list and
                        // all to the category flow.
                        if (categorySeenList.indexOf(album.genre) == -1) {
                            categorySeenList.push(album.genre);

                            logger.log("Adding genre", album.genre);
                            $("<div/>")
                                .addClass("category")
                                .text(album.genre)
                                .click(function() {
                                    if($(this).hasClass('ui-state-active')) {
                                        console.log("Just clicked " + album.genre);
                                    }
                                })
                                .appendTo($("#album-and-category-list div.categoryflow"));
                        }
                    }
                });
            }

            // Render as coverflow. Do this after showing the list section to fix an issue with coverflow so
            // the display none has been removed.
            $(".categoryflow").coverflow({
                select: function(event, ui) {
                    console.log(ui);
                }
            });
        }
    };
    return albumListScreen;
});
