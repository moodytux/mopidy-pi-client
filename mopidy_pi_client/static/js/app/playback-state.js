define(["app/logger", "app/mopidy-container"], function(logger, mopidyContainer) {
    logger.log("In playback-state.js");

    var playbackState = {
        EventName: {
            NOT_STARTED: "NOT_STARTED",
            PLAY_FINISHED: "PLAY_FINISHED",
            PLAY_STARTED: "PLAY_STARTED",
            PLAY_RESUMED: "PLAY_RESUMED",
            PAUSED: "PAUSED",
        },
        _controlsRenderer: null,
        _trackListRenderer: null,
        _tracks: null,
        _currentTrack: null,
        _latestEvent: null,
        associateWithMopidyEvents: function() {
            // Guard against setters not being called prior to event association call.
            if ((playbackState._controlsRenderer == null) ||
                (playbackState._trackListRenderer == null) ||
                (playbackState._tracks == null)) {
                return;
            }

            var mopidy = mopidyContainer.getInstance();
            mopidy.off("event:trackPlaybackStarted");
            mopidy.on("event:trackPlaybackStarted", function(tlTrack) {
                playbackState._currentTrack = tlTrack;
                playbackState.updateState(playbackState.EventName.PLAY_STARTED);
            });
            mopidy.off("event:trackPlaybackResumed");
            mopidy.on("event:trackPlaybackResumed", function(tlTrack) {
                playbackState._currentTrack = tlTrack;
                playbackState.updateState(playbackState.EventName.PLAY_RESUMED);
            });
            mopidy.off("event:trackPlaybackPaused");
            mopidy.on("event:trackPlaybackPaused", function(tlTrack) {
                playbackState._currentTrack = tlTrack;
                playbackState.updateState(playbackState.EventName.PAUSED);
            });
            mopidy.off("event:trackPlaybackEnded");
            mopidy.on("event:trackPlaybackEnded", function(tlTrack) {
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

            var controlsState = playbackState._determineControlsState();
            playbackState._controlsRenderer(controlsState);

            var currentTrackDetails = playbackState._determineCurrentTrackDetails();
            playbackState._trackListRenderer(currentTrackDetails);
        },
        _determineControlsState: function() {
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
        },
        _determineCurrentTrackDetails: function() {
            var currentTrackDetails = {};
            switch (playbackState._latestEvent) {
                case playbackState.EventName.NOT_STARTED:
                case playbackState.EventName.PLAY_FINISHED:
                    currentTrackDetails.trackNumber = null;
                    currentTrackDetails.isPlaying = false;
                    currentTrackDetails.isPaused = false;
                    break;
                case playbackState.EventName.PLAY_STARTED:
                case playbackState.EventName.PLAY_RESUMED:
                    currentTrackDetails.trackNumber = playbackState._getTrackNumber();
                    currentTrackDetails.isPlaying = true;
                    currentTrackDetails.isPaused = false;
                    break;
                case playbackState.EventName.PAUSED:
                    currentTrackDetails.trackNumber = playbackState._getTrackNumber();
                    currentTrackDetails.isPlaying = false;
                    currentTrackDetails.isPaused = true;
                    break;
            }
            return currentTrackDetails;
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
