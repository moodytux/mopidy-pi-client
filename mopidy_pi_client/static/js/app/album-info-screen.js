define(["jquery", "app/logger", "app/controls", "app/playback-state"], function($, logger, controls, playbackState) {
    logger.log("In album-info-screen.js")
    var albumInfoScreen = {
        currentControlsState: null,
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
                        .addClass("disable-select")
                        .addClass("track")
                        .addClass("track-" + track.track_no)
                        .click(function() {
                            controls.playTracks(tracks, index);
                        })
                        .append("<div class='progress'></div>")
                        .append("<div class='indicator'><div class='indicator-shape' /></div>")
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
                    controls.playTracks(tracks, 0);
                    $("#album-info .album-image .play-album-control .circle").addClass("disappear");
                });

                // Set the tracks and renderers so our state can update the view.
                playbackState.setTracks(tracks);
                playbackState.setControlsRenderer(albumInfoScreen.renderControls);
                playbackState.setTrackListRenderer(albumInfoScreen.renderCurrentTrackDetails);

                // Set the initial state to be not started.
                playbackState.updateState(playbackState.EventName.NOT_STARTED);

                // Hook in the mopidy events to our playback state so it is kept updated.
                playbackState.associateWithMopidyEvents();

                // Show our album-info screen, hide other screens.
                $(".screen").hide();
                $("#album-info").show();
            }
        },
        renderControls: function(controlsState) {
            logger.log("About to render the controls with state ", controlsState);

            currentControlsState = controlsState;
            if (typeof initialisedClickListeners === "undefined") {
                // Set up the controls click listeners.
                $("#album-info .controls .play").click(function() {
                    if (currentControlsState.canPlay) {
                        controls.play();
                    }
                });
                $("#album-info .controls .pause").click(function() {
                    if (currentControlsState.canPause) {
                        controls.pause();
                    }
                });
                $("#album-info .controls .previous").click(function() {
                    if (currentControlsState.canSkipBack) {
                        controls.playPrevious();
                    }
                });
                $("#album-info .controls .next").click(function() {
                    if (currentControlsState.canSkipForward) {
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

            // Show the play pause button for inactive, play, and pause.
            $("#album-info .controls .play").removeClass("enabled");
            $("#album-info .controls .pause").removeClass("enabled");
            if (!currentControlsState.canPlay && !currentControlsState.canPause) {
                $("#album-info .controls .play").addClass("enabled").show();
                $("#album-info .controls .pause").hide();
            } else if (currentControlsState.canPlay) {
                $("#album-info .controls .play").addClass("enabled").show();
                $("#album-info .controls .pause").hide();
            } else if (currentControlsState.canPause) {
                $("#album-info .controls .pause").addClass("enabled").show();
                $("#album-info .controls .play").hide();
            }

            // Show the skip buttons according to the flags.
            $("#album-info .controls .previous").removeClass("enabled");
            $("#album-info .controls .next").removeClass("enabled");
            if (currentControlsState.canSkipBack) {
                $("#album-info .controls .previous").addClass("enabled");
            }
            if (currentControlsState.canSkipForward) {
                $("#album-info .controls .next").addClass("enabled");
            }
        },
        renderCurrentTrackDetails: function(currentTrackDetails) {
            logger.log("About to render current track details with state ", currentTrackDetails);

            var currentTrackDiv = $("#album-info .track-list .track-" + currentTrackDetails.trackNumber);

            // Remove all indicators, then render the current tracks play or paused icon.
            $(".indicator").removeClass("playing").removeClass("paused");
            if (currentTrackDetails.isPlaying) {
                $(".indicator", currentTrackDiv).addClass("playing");
            } else if (currentTrackDetails.isPaused) {
                $(".indicator", currentTrackDiv).addClass("paused");
            }

            // Remove all progress bars, then render the current tracks the progress bar.
            $(".progress").width("0%");
            if (currentTrackDetails.elapsedTimeMs && currentTrackDetails.totalTimeMs) {
                var progressDiv = (currentTrackDetails.elapsedTimeMs / currentTrackDetails.totalTimeMs) * 100;
                $(".progress", currentTrackDiv).width(progressDiv + "%");
            }
        }
    };
    return albumInfoScreen;
});
