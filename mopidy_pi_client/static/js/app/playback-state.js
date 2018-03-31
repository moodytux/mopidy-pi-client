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
        controlsRenderer: null,
        trackListRenderer: null,
        tracks: null,
        associateWithMopidyEvents: function() {
            // Guard against setters not being called prior to event association call.
            if ((playbackState.controlsRenderer == null) ||
                (playbackState.trackListRenderer == null) ||
                (playbackState.tracks == null)) {
                return;
            }

            var mopidy = mopidyContainer.getInstance();
            mopidy.off("event:trackPlaybackStarted");
            mopidy.on("event:trackPlaybackStarted", function(tlTrack) {
                playbackState.updateState(playbackState.EventName.PLAY_STARTED, tlTrack, playbackState.tracks);
            });
            mopidy.off("event:trackPlaybackResumed");
            mopidy.on("event:trackPlaybackResumed", function(tlTrack) {
                playbackState.updateState(playbackState.EventName.PLAY_RESUMED, tlTrack, playbackState.tracks);
            });
            mopidy.off("event:trackPlaybackPaused");
            mopidy.on("event:trackPlaybackPaused", function(tlTrack) {
                playbackState.updateState(playbackState.EventName.PAUSED, tlTrack, playbackState.tracks);
            });
            mopidy.off("event:trackPlaybackEnded");
            mopidy.on("event:trackPlaybackEnded", function(tlTrack) {
                playbackState.updateState(playbackState.EventName.PLAY_FINISHED, tlTrack, playbackState.tracks);
            });
        },
        setTracks: function(tracks) {
            playbackState.tracks = tracks;
        },
        setControlsRenderer: function(controlsRenderer) {
            playbackState.controlsRenderer = controlsRenderer;
        },
        setTrackListRenderer: function(trackListRenderer) {
            playbackState.trackListRenderer = trackListRenderer;
        },
        updateState: function(eventName, currentTrack, tracks) {
            var controlsState = playbackState._determineControlsState(eventName, currentTrack, tracks);
            playbackState.controlsRenderer(controlsState);

            var currentTrackDetails = playbackState._determineCurrentTrackDetails(eventName, currentTrack, tracks);
            playbackState.trackListRenderer(currentTrackDetails);
        },
        _determineControlsState: function(eventName, currentTrack, tracks) {
            var controlsState = {};
            switch (eventName) {
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
                    controlsState.canSkipBack = !playbackState._isFirstTrack(currentTrack);
                    controlsState.canSkipForward = !playbackState._isLastTrack(currentTrack, tracks);
                    break;
                case playbackState.EventName.PAUSED:
                    controlsState.canPlay = true;
                    controlsState.canPause = false;
                    controlsState.canSkipBack = !playbackState._isFirstTrack(currentTrack);
                    controlsState.canSkipForward = !playbackState._isLastTrack(currentTrack, tracks);
                    break;
            }
            return controlsState;
        },
        _determineCurrentTrackDetails: function(eventName, currentTrack, tracks) {
            var currentTrackDetails = {};
            switch (eventName) {
                case playbackState.EventName.NOT_STARTED:
                case playbackState.EventName.PLAY_FINISHED:
                    currentTrackDetails.trackNumber = null;
                    currentTrackDetails.isPlaying = false;
                    currentTrackDetails.isPaused = false;
                    break;
                case playbackState.EventName.PLAY_STARTED:
                case playbackState.EventName.PLAY_RESUMED:
                    currentTrackDetails.trackNumber = playbackState._getTrackNumber(currentTrack);
                    currentTrackDetails.isPlaying = true;
                    currentTrackDetails.isPaused = false;
                    break;
                case playbackState.EventName.PAUSED:
                    currentTrackDetails.trackNumber = playbackState._getTrackNumber(currentTrack);
                    currentTrackDetails.isPlaying = false;
                    currentTrackDetails.isPaused = true;
                    break;
            }
            return currentTrackDetails;
        },
        _isFirstTrack: function(tlTrack) {
            var trackNo = null;
            var isFirstTrack = false;
            if (playbackState._isTrackNumberValid(tlTrack)) {
                trackNo = tlTrack.tl_track.track.track_no;
                if (trackNo == 1) {
                    isFirstTrack = true;
                }
            }
            return isFirstTrack;
        },
        _isLastTrack: function(tlTrack, tracks) {
            var trackNo = null;
            var isLastTrack = false;
            if (playbackState._isTrackNumberValid(tlTrack)) {
                trackNo = tlTrack.tl_track.track.track_no;
                if (trackNo == tracks.length) {
                    isLastTrack = true;
                }
            }
            return isLastTrack;
        },
        _getTrackNumber: function(tlTrack) {
            var trackNo = null;
            if (playbackState._isTrackNumberValid(tlTrack)) {
                trackNo = tlTrack.tl_track.track.track_no;
            }
            return trackNo;
        },
        _isTrackNumberValid: function(track) {
            return ((track != null) && (track.tl_track != null) && (track.tl_track.track != null));
        }
    };
    return playbackState;
});
