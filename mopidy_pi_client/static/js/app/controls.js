define(["app/logger", "app/mopidy"], function(logger, mopidy) {
    var controls = {};

    controls.playTracks = function(tracks) {
        logger.log("About to add tracks to playlist and play first", tracks);
        mopidy.tracklist.clear()
            .then(function() {
                if (tracks && (tracks.length > 0)) {
                    return mopidy.tracklist.add(tracks);
                }
            })
            .done(function(tlTracks) {
                if (tlTracks && (tlTracks.length > 0)) {
                    mopidy.playback.play(tlTracks[0]);
                }
            });
    }

    controls.playPrevious = function() {
        logger.log("Play previous track");
        mopidy.playback.previous();
    }

    controls.playNext = function() {
        logger.log("Play next track");
        mopidy.playback.next();
    }

    controls.play = function() {
        mopidy.playback.play();
    }

    controls.pause = function() {
        logger.log("Pausing current track");
        mopidy.playback.pause();
    }

    controls.stop = function() {
        logger.log("Stopping playback");
        mopidy.playback.stop();
        mopidy.tracklist.clear();
    }

    return controls;
});
