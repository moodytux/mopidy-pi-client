define(["app/logger", "app/mopidy-container", "mopidy", "app/track-details-mapper"], function(logger, mopidyContainer, Mopidy, trackDetailsMapper) {
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
        _currentTrackDetails: {},
        _latestEvent: null,
        _currentTrackStateUpdateTimerId: null,
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
                playbackState._currentTrackDetails =
                    trackDetailsMapper.map(tlTrack, playbackState._tracks.length);
                playbackState.updateState(playbackState.EventName.PLAY_STARTED);
            });
            playbackState._mopidy.off("event:trackPlaybackResumed");
            playbackState._mopidy.on("event:trackPlaybackResumed", function(tlTrack) {
                playbackState._currentTrackDetails =
                    trackDetailsMapper.map(tlTrack, playbackState._tracks.length);
                playbackState.updateState(playbackState.EventName.PLAY_RESUMED);
            });
            playbackState._mopidy.off("event:trackPlaybackPaused");
            playbackState._mopidy.on("event:trackPlaybackPaused", function(tlTrack) {
                playbackState._currentTrackDetails =
                    trackDetailsMapper.map(tlTrack, playbackState._tracks.length);
                playbackState.updateState(playbackState.EventName.PAUSED);
            });
            playbackState._mopidy.off("event:trackPlaybackEnded");
            playbackState._mopidy.on("event:trackPlaybackEnded", function(tlTrack) {
                playbackState._currentTrackDetails =
                    trackDetailsMapper.map(tlTrack, playbackState._tracks.length);
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

            playbackState._determineCurrentTrackState()
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
                        controlsState.canSkipBack = !playbackState._currentTrackDetails.isFirstTrack;
                        controlsState.canSkipForward = !playbackState._currentTrackDetails.isLastTrack;
                        break;
                    case playbackState.EventName.PAUSED:
                        controlsState.canPlay = true;
                        controlsState.canPause = false;
                        controlsState.canSkipBack = !playbackState._currentTrackDetails.isFirstTrack;
                        controlsState.canSkipForward = !playbackState._currentTrackDetails.isLastTrack;
                        break;
                }
                return controlsState;
            });
        },
        _determineCurrentTrackState: function() {
            if (playbackState._mopidy == null) {
                playbackState._mopidy = mopidyContainer.getInstance();
            }

            var currentTrackState = {};
            currentTrackState.totalTimeMs =
                playbackState._currentTrackDetails.totalTimeMs;
            switch (playbackState._latestEvent) {
                case playbackState.EventName.NOT_STARTED:
                case playbackState.EventName.PLAY_FINISHED:
                    currentTrackState.trackNumber = null;
                    currentTrackState.isPlaying = false;
                    currentTrackState.isPaused = false;
                    currentTrackState.elapsedTimeMs = 0;
                    break;
                case playbackState.EventName.PLAY_STARTED:
                case playbackState.EventName.PLAY_RESUMED:
                    currentTrackState.trackNumber =
                        playbackState._currentTrackDetails.trackNumber;
                    currentTrackState.isPlaying = true;
                    currentTrackState.isPaused = false;
                    currentTrackState.elapsedTimeMs = null;
                    break;
                case playbackState.EventName.PAUSED:
                    currentTrackState.trackNumber =
                        playbackState._currentTrackDetails.trackNumber;
                    currentTrackState.isPlaying = false;
                    currentTrackState.isPaused = true;
                    currentTrackState.elapsedTimeMs = null;
                    break;
                default:
                    currentTrackState.trackNumber = null;
                    currentTrackState.isPlaying = false;
                    currentTrackState.isPaused = false;
                    currentTrackState.elapsedTimeMs = 0;
            }

            // If needed, chain the get elapsed time call. Return a promise either way.
            if (currentTrackState.elapsedTimeMs === null) {
                return playbackState._mopidy.playback.getTimePosition()
                    .then(function(positionMs) {
                        currentTrackState.elapsedTimeMs = positionMs;
                        return currentTrackState;
                    });
            } else {
                return Mopidy.when(currentTrackState);
            }
        },
        _setupCurrentTrackDetailsRefreshTimer: function() {
            switch (playbackState._latestEvent) {
                case playbackState.EventName.PLAY_STARTED:
                case playbackState.EventName.PLAY_RESUMED:
                    playbackState._startCurrentTrackStateRefreshTimer();
                    break;
                case playbackState.EventName.NOT_STARTED:
                case playbackState.EventName.PLAY_FINISHED:
                default:
                    playbackState._stopCurrentTrackStateRefreshTimer();
            }
        },
        _startCurrentTrackStateRefreshTimer: function() {
            var intervalMs = 1000 * 3;
            playbackState._currentTrackStateUpdateTimerId =
                setInterval(playbackState._refreshCurrentTrackDetails, intervalMs);
        },
        _stopCurrentTrackStateRefreshTimer: function() {
            clearInterval(playbackState._currentTrackStateUpdateTimerId);
        },
        _refreshCurrentTrackDetails: function() {
            logger.log("In playback-state.js, refreshing the current track details");

            playbackState._determineCurrentTrackState()
                .done(playbackState._trackListRenderer);
        },
    };
    return playbackState;
});
