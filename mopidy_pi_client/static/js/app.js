// Default path already defined to be js dir
requirejs.config({
    paths: {
        "mopidy": "../../mopidy/mopidy",
        "jquery": "lib/jquery-2.2.4.min",
        "jquery-ui": "lib/jquery-ui-1.12.1.custom/jquery-ui.min",
        "jquery-mobile": "lib/jquery.mobile-1.4.5.min",
        "bootstrap": "lib/bootstrap.min",
        "coverflowjs": "lib/coverflowjs-3.0.2.min"
    },
    shim: {
        "jquery-ui": ["jquery"],
        "jquery-mobile": ["jquery","jquery-ui"],
        "coverflowjs": ["jquery", "jquery-ui", "jquery-mobile"],
        "bootstrap": ["jquery"]
    }
});

requirejs(["jquery", "coverflowjs", "bootstrap", "mopidy", "app/logger", "app/album-sorter", "app/album-data", "app/controls", "app/album-validator"], function($, coverflowjs, bootstrap, Mopidy, logger, albumSorter, albumData, controls, albumValidator) {
    var ControlsState = {
      NOT_STARTED: "NOT_STARTED",
      PLAY_FINISHED: "PLAY_FINISHED",
      PLAYING: "PLAYING",
      PAUSED: "PAUSED",
    };

    /*
     * Controller related methods to show screens.
     */

    var showScreen = function(screenName, params) {
        if (screenName == 'loading') {
            logger.log("About to show the loading screen");
            $(".screen").hide();
            $("#loading").show();
        } else if (screenName == 'album-and-category-list') {
            logger.log("About to send the user to the album list screen");
            albumData.getAlbumList(renderAlbumAndCategoryList);

        } else if (screenName == "album-info") {
            logger.log("About to send the user to the album info screen, with URI", params.albumUri);
            albumData.getAlbumInfo(renderAlbumInfo, params.albumUri);
        }
    }

    /*
     * Render methods, to render HTML from data.
     */

    var renderAlbumInfo = function(tracks) {
        logger.log("About to render the following tracks", tracks);

        // Reinitialise the info screen.
        $('#album-info .track-list').empty();
        $("#album-info .album-image .play-album-control .icon").show();
        $("#album-info .album-image .play-album-control .circle").removeClass("disappear");

        if (tracks && (tracks.length > 0)) {
            $.each(tracks, function(index, track) {
                $("<a/>")
                    .addClass("list-group-item")
                    .addClass("track")
                    .addClass("track-" + track.track_no)
                    .click(function() {
                        controls.playTracks(tracks.slice(index));
                    })
                    .append("<div class='indicator' />")
                    .append("<div class='title'>" + track.track_no + ". " + track.name + "</div>")
                    .appendTo($('#album-info .track-list'));
            });

            // Set the album info.
            var album = tracks[0].album;
            if ((typeof album.images !== "undefined") && (album.images.length > 0)) {
                $("#album-info .album-image")
                    .css("background-image", "url(" + tracks[0].album.images[0] + ")");
            }
            $("#album-info .album-image .play-album-control").unbind("click").click(function() {
                $("#album-info .album-image .play-album-control .icon").fadeOut();
                controls.playTracks(tracks);
                $("#album-info .album-image .play-album-control .circle").addClass("disappear");
            });

            renderControls(ControlsState.NOT_STARTED, null, tracks);

            // Show our album-info screen, hide other screens.
            $(".screen").hide();
            $("#album-info").show();

            // Change our controls based on the playback state.
            mopidy.off("event:trackPlaybackStarted");
            mopidy.on("event:trackPlaybackStarted", function(tlTrack) {
                renderControls(ControlsState.PLAYING, tlTrack, tracks);
            });
            mopidy.off("event:trackPlaybackResumed");
            mopidy.on("event:trackPlaybackResumed", function(tlTrack) {
                renderControls(ControlsState.PLAYING, tlTrack, tracks);
            });
            mopidy.off("event:trackPlaybackPaused");
            mopidy.on("event:trackPlaybackPaused", function(tlTrack) {
                renderControls(ControlsState.PAUSED, tlTrack, tracks);
            });
            mopidy.off("event:trackPlaybackEnded");
            mopidy.on("event:trackPlaybackEnded", function(tlTrack) {
                renderControls(ControlsState.PLAY_FINISHED, tlTrack, tracks);
            });
        }
    }

    var renderAlbumAndCategoryList = function(albums) {
        logger.log("About to render the following albums along with their categories", albums);

        // Show our album list screen, hide other screens.
        $(".screen").hide();
        $("#album-and-category-list").show();

        // Fill our coverflow if we haven't done so already.
        if (typeof initialisedCoverflow === "undefined") {
            renderCoverList(albums);
            renderCategoryList(albums);

            initialisedCoverflow = true;
        }
    }

    var renderCoverList = function(albums) {
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
                                showScreen("album-info", {albumUri: album.uri } );
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
    }

    var renderCategoryList = function(albums) {
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

    var renderControls = function(state, tlTrack, tracks) {
        logger.log("About to render the controls with state " + state + " for track", tlTrack);

        if (typeof initialisedClickListeners === "undefined") {
            // Set up the controls click listeners.
            $("#album-info .controls .play").click(function() {
                if ($(this).hasClass("enabled")) {
                    controls.play();
                }
            });
            $("#album-info .controls .pause").click(function() {
                if ($(this).hasClass("enabled")) {
                    controls.pause();
                }
            });
            $("#album-info .controls .previous").click(function() {
                if ($(this).hasClass("enabled")) {
                    controls.playPrevious();
                }
            });
            $("#album-info .controls .next").click(function() {
                if ($(this).hasClass("enabled")) {
                    controls.playNext();
                }
            });
            $("#album-info .controls .back").click(function() {
                controls.stop();
                showScreen("album-and-category-list");
            });

            // Flag that we are all setup with click listeners.
            initialisedClickListeners = true;
        }

        var trackNo = null;
        var isFirstTrack = false;
        var isLastTrack = false;
        if ((tlTrack != null) && (tlTrack.tl_track != null) && (tlTrack.tl_track.track != null)) {
            trackNo = tlTrack.tl_track.track.track_no;
            if (trackNo == 1) {
                isFirstTrack = true;
            } else if (trackNo == tracks.length) {
                isLastTrack = true;
            }
        }

        // Reset the state to disabled.
        $("#album-info .controls .play").removeClass("enabled");
        $("#album-info .controls .pause").removeClass("enabled");
        $("#album-info .controls .previous").removeClass("enabled");
        $("#album-info .controls .next").removeClass("enabled");
        $("#album-info .track-list .track").removeClass("playing").removeClass("paused");

        if (state == ControlsState.NOT_STARTED) {
            $("#album-info .controls .play").show();
            $("#album-info .controls .pause").hide();
        } else if (state == ControlsState.PLAY_FINISHED) {
            $("#album-info .controls .play").show();
            $("#album-info .controls .pause").hide();
        } else if (state == ControlsState.PLAYING) {
            $("#album-info .controls .play").hide();
            $("#album-info .controls .pause").addClass("enabled").show();
            var previous = $("#album-info .controls .previous").removeClass("enabled");
            if (isFirstTrack == false) {
                previous.addClass("enabled");
            }
            var next = $("#album-info .controls .next").removeClass("enabled");
            if (isLastTrack == false) {
                next.addClass("enabled");
            }

            if (trackNo != null) {
                $("#album-info .track-list .track-" + trackNo).addClass("playing");
            }
        } else if (state == ControlsState.PAUSED) {
            $("#album-info .controls .play").addClass("enabled").show();
            $("#album-info .controls .pause").hide();
            var previous = $("#album-info .controls .previous").removeClass("enabled");
            if (isFirstTrack == false) {
                previous.addClass("enabled");
            }
            var next = $("#album-info .controls .next").removeClass("enabled");
            if (isLastTrack == false) {
                next.addClass("enabled");
            }

            if (trackNo != null) {
                $("#album-info .track-list .track-" + trackNo).addClass("paused");
            }
        }
    }

    /*
     * JQuery document ready, where things start.
     */
    $(function() {
        // Show the loading screen.
        showScreen("offline");

        mopidy = new Mopidy();

        // Log all events.
        mopidy.on(console.log.bind(console));

        // Setup our listener for when we are online.
        mopidy.on("state:online", function() {
            // Show the loading screen initially.
            showScreen("loading");

            // Show the album list which may take some time.
            showScreen("album-and-category-list");
        });
    })
});
