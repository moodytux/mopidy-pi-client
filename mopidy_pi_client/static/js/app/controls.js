define(["app/logger", "app/mopidy-container"], function(logger, mopidyContainer) {
    logger.log("In controls.js");

    var mopidy = mopidyContainer.getInstance();
    var controls = {
        playTracks: function(tracks, trackIndex) {
            logger.log("About to play index " + trackIndex + " after adding playlist tracks", tracks);
            var saneTrackIndex = controls._getSaneTrackIndex(tracks, trackIndex);
            mopidy.tracklist.clear()
                .then(function() {
                    if (tracks && (tracks.length > 0)) {
                        return mopidy.tracklist.add(tracks);
                    }
                })
                .done(function(tlTracks) {
                    if (tlTracks && (tlTracks.length > 0)) {
                        mopidy.playback.play(tlTracks[saneTrackIndex]);
                    }
                });
        },
        playPrevious: function() {
            logger.log("Play previous track");
            mopidy.playback.previous();
        },
        playNext: function() {
            logger.log("Play next track");
            mopidy.playback.next();
        },
        play: function() {
            mopidy.playback.play();
        },
        pause: function() {
            logger.log("Pausing current track");
            mopidy.playback.pause();
        },
        stop: function() {
            logger.log("Stopping playback");
            mopidy.playback.stop();
            mopidy.tracklist.clear();
        },
        _getSaneTrackIndex(tracks, trackIndex) {
            var newTrackIndex = trackIndex;
            if ((typeof(trackIndex) === "undefined") ||
                (trackIndex < 0) ||
                (trackIndex > (tracks.length - 1))) {
                newTrackIndex = 0;
            }
            return newTrackIndex;
        }
    };

    return controls;
});
