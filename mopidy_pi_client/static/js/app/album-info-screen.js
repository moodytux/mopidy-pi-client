define(["jquery", "app/logger", "app/controls", "app/mopidy-container"], function($, logger, controls, mopidyContainer) {
    logger.log("In album-info-screen.js")
    var albumInfoScreen = {
        ControlsState: {
            NOT_STARTED: "NOT_STARTED",
            PLAY_FINISHED: "PLAY_FINISHED",
            PLAYING: "PLAYING",
            PAUSED: "PAUSED",
        },
        navigateBackCallback: null,
        setNavigateBackCallback: function(navigateBackCallbackIn) {
            navigateBackCallback = navigateBackCallbackIn;
        },
        render: function(tracks) {
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
                        .addClass("disable-select")
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

                albumInfoScreen.renderControls(albumInfoScreen.ControlsState.NOT_STARTED, null, tracks);

                // Show our album-info screen, hide other screens.
                $(".screen").hide();
                $("#album-info").show();

                // Change our controls based on the playback state.
                var mopidy = mopidyContainer.getInstance();
                mopidy.off("event:trackPlaybackStarted");
                mopidy.on("event:trackPlaybackStarted", function(tlTrack) {
                    albumInfoScreen.renderControls(albumInfoScreen.ControlsState.PLAYING, tlTrack, tracks);
                });
                mopidy.off("event:trackPlaybackResumed");
                mopidy.on("event:trackPlaybackResumed", function(tlTrack) {
                    albumInfoScreen.renderControls(albumInfoScreen.ControlsState.PLAYING, tlTrack, tracks);
                });
                mopidy.off("event:trackPlaybackPaused");
                mopidy.on("event:trackPlaybackPaused", function(tlTrack) {
                    albumInfoScreen.renderControls(albumInfoScreen.ControlsState.PAUSED, tlTrack, tracks);
                });
                mopidy.off("event:trackPlaybackEnded");
                mopidy.on("event:trackPlaybackEnded", function(tlTrack) {
                    albumInfoScreen.renderControls(albumInfoScreen.ControlsState.PLAY_FINISHED, tlTrack, tracks);
                });
            }
        },
        renderControls: function(state, tlTrack, tracks) {
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
                    navigateBackCallback();
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

            if (state == albumInfoScreen.ControlsState.NOT_STARTED) {
                $("#album-info .controls .play").show();
                $("#album-info .controls .pause").hide();
            } else if (state == albumInfoScreen.ControlsState.PLAY_FINISHED) {
                $("#album-info .controls .play").show();
                $("#album-info .controls .pause").hide();
            } else if (state == albumInfoScreen.ControlsState.PLAYING) {
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
            } else if (state == albumInfoScreen.ControlsState.PAUSED) {
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
    };
    return albumInfoScreen;
});
