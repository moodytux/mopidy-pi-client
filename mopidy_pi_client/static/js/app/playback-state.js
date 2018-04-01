define(["app/logger", "app/mopidy-container", "mopidy"], function(logger, mopidyContainer, Mopidy) {
    logger.log("In playback-state.js");

    var playbackState = {
        EventName: {
            NOT_STARTED: "NOT_STARTED",
            PLAY_FINISHED: "PLAY_FINISHED",
            PLAY_STARTED: "PLAY_STARTED",
            PLAY_RESUMED: "PLAY_RESUMED",
            PAUSED: "PAUSED",
        },
        _mopidy: null,
        _controlsRenderer: null,
        _trackListRenderer: null,
        _tracks: null,
        _currentTrack: null,
        _latestEvent: null,
        _currentTrackDetailsUpdateTimerId: null,
        associateWithMopidyEvents: function() {
            // Guard against setters not being called prior to event association call.
            if ((playbackState._controlsRenderer == null) ||
                (playbackState._trackListRenderer == null) ||
                (playbackState._tracks == null)) {
                return;
            }

            if (playbackState._mopidy == null) {
                playbackState._mopidy = mopidyContainer.getInstance();
            }
            playbackState._mopidy.off("event:trackPlaybackStarted");
            playbackState._mopidy.on("event:trackPlaybackStarted", function(tlTrack) {
                playbackState._currentTrack = tlTrack;
                playbackState.updateState(playbackState.EventName.PLAY_STARTED);
            });
            playbackState._mopidy.off("event:trackPlaybackResumed");
            playbackState._mopidy.on("event:trackPlaybackResumed", function(tlTrack) {
                playbackState._currentTrack = tlTrack;
                playbackState.updateState(playbackState.EventName.PLAY_RESUMED);
            });
            playbackState._mopidy.off("event:trackPlaybackPaused");
            playbackState._mopidy.on("event:trackPlaybackPaused", function(tlTrack) {
                playbackState._currentTrack = tlTrack;
                playbackState.updateState(playbackState.EventName.PAUSED);
            });
            playbackState._mopidy.off("event:trackPlaybackEnded");
            playbackState._mopidy.on("event:trackPlaybackEnded", function(tlTrack) {
                playbackState._currentTrack = tlTrack;
                playbackState.updateState(playbackState.EventName.PLAY_FINISHED);
            });
        },
        setTracks: function(tracks) {
            playbackState._tracks = tracks;
        },
        setControlsRenderer: function(controlsRenderer) {
            playbackState._controlsRenderer = controlsRenderer;
        },
        setTrackListRenderer: function(trackListRenderer) {
            playbackState._trackListRenderer = trackListRenderer;
        },
        updateState: function(eventName) {
            playbackState._latestEvent = eventName;

            playbackState._determineControlsState()
                .done(playbackState._controlsRenderer);

            playbackState._determineCurrentTrackDetails()
                .done(playbackState._trackListRenderer);

            playbackState._setupCurrentTrackDetailsRefreshTimer();
        },
        _determineControlsState: function() {
            return Mopidy.when().then(function() {
                var controlsState = {};
                switch (playbackState._latestEvent) {
                    case playbackState.EventName.NOT_STARTED:
                    case playbackState.EventName.PLAY_FINISHED:
                        controlsState.canPlay = false;
                        controlsState.canPause = false;
                        controlsState.canSkipBack = false;
                        controlsState.canSkipForward = false;
                        break;
                    case playbackState.EventName.PLAY_STARTED:
                    case playbackState.EventName.PLAY_RESUMED:
                        controlsState.canPlay = false;
                        controlsState.canPause = true;
                        controlsState.canSkipBack = !playbackState._isFirstTrack();
                        controlsState.canSkipForward = !playbackState._isLastTrack();
                        break;
                    case playbackState.EventName.PAUSED:
                        controlsState.canPlay = true;
                        controlsState.canPause = false;
                        controlsState.canSkipBack = !playbackState._isFirstTrack();
                        controlsState.canSkipForward = !playbackState._isLastTrack();
                        break;
                }
                return controlsState;
            });
        },
        _determineCurrentTrackDetails: function() {
            if (playbackState._mopidy == null) {
                playbackState._mopidy = mopidyContainer.getInstance();
            }

            var currentTrackDetails = {};
            switch (playbackState._latestEvent) {
                case playbackState.EventName.NOT_STARTED:
                case playbackState.EventName.PLAY_FINISHED:
                    currentTrackDetails.trackNumber = null;
                    currentTrackDetails.isPlaying = false;
                    currentTrackDetails.isPaused = false;
                    currentTrackDetails.elapsedTimeMs = 0;
                    break;
                case playbackState.EventName.PLAY_STARTED:
                case playbackState.EventName.PLAY_RESUMED:
                    currentTrackDetails.trackNumber = playbackState._getTrackNumber();
                    currentTrackDetails.isPlaying = true;
                    currentTrackDetails.isPaused = false;
                    currentTrackDetails.elapsedTimeMs = null;
                    break;
                case playbackState.EventName.PAUSED:
                    currentTrackDetails.trackNumber = playbackState._getTrackNumber();
                    currentTrackDetails.isPlaying = false;
                    currentTrackDetails.isPaused = true;
                    currentTrackDetails.elapsedTimeMs = null;
                    break;
                default:
                    currentTrackDetails.trackNumber = null;
                    currentTrackDetails.isPlaying = false;
                    currentTrackDetails.isPaused = false;
                    currentTrackDetails.elapsedTimeMs = 0;
            }

            // If needed, chain the get elapsed time call. Return a promise either way.
            if (currentTrackDetails.elapsedTimeMs === null) {
                return playbackState._mopidy.playback.getTimePosition()
                    .then(function(positionMs) {
                        currentTrackDetails.elapsedTimeMs = positionMs;
                        return currentTrackDetails;
                    });
            } else {
                return Mopidy.when(currentTrackDetails);
            }
        },
        _setupCurrentTrackDetailsRefreshTimer: function() {
            switch (playbackState._latestEvent) {
                case playbackState.EventName.PLAY_STARTED:
                case playbackState.EventName.PLAY_RESUMED:
                    playbackState._startCurrentTrackDetailsRefreshTimer();
                    break;
                case playbackState.EventName.NOT_STARTED:
                case playbackState.EventName.PLAY_FINISHED:
                default:
                    playbackState._stopCurrentTrackDetailsRefreshTimer();
            }
        },
        _startCurrentTrackDetailsRefreshTimer: function() {
            var intervalMs = 1000 * 3;
            playbackState._currentTrackDetailsUpdateTimerId =
                setInterval(playbackState._refreshCurrentTrackDetails, intervalMs);
        },
        _stopCurrentTrackDetailsRefreshTimer: function() {
            clearInterval(playbackState._currentTrackDetailsUpdateTimerId);
        },
        _refreshCurrentTrackDetails: function() {
            logger.log("In playback-state.js, refreshing the current track details");

            playbackState._determineCurrentTrackDetails()
                .done(playbackState._trackListRenderer);
        },
        _isFirstTrack: function() {
            var trackNo = null;
            var isFirstTrack = false;
            if (playbackState._isTrackNumberValid()) {
                trackNo = playbackState._currentTrack.tl_track.track.track_no;
                if (trackNo == 1) {
                    isFirstTrack = true;
                }
            }
            return isFirstTrack;
        },
        _isLastTrack: function() {
            var trackNo = null;
            var isLastTrack = false;
            if (playbackState._isTrackNumberValid()) {
                trackNo = playbackState._currentTrack.tl_track.track.track_no;
                if (trackNo == playbackState._tracks.length) {
                    isLastTrack = true;
                }
            }
            return isLastTrack;
        },
        _getTrackNumber: function() {
            var trackNo = null;
            if (playbackState._isTrackNumberValid()) {
                trackNo = playbackState._currentTrack.tl_track.track.track_no;
            }
            return trackNo;
        },
        _isTrackNumberValid: function() {
            return ((playbackState._currentTrack != null) &&
                (playbackState._currentTrack.tl_track != null) &&
                (playbackState._currentTrack.tl_track.track != null));
        }
    };
    return playbackState;
});
