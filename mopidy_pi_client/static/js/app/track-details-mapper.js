define(["app/logger"], function(logger) {
    logger.log("In track-mapper.js");

    var trackDetailsMapper = {
        map: function(tlTrack, tlTrackCount) {
            logger.log("Mapping from tlTrack", tlTrack);
            var trackDetails = {
                isFirstTrack: trackDetailsMapper._isFirstTrack(tlTrack),
                isLastTrack: trackDetailsMapper._isLastTrack(tlTrack, tlTrackCount),
                trackNumber: trackDetailsMapper._getTrackNumber(tlTrack),
                totalTimeMs: trackDetailsMapper._getTotalTimeMs(tlTrack)
            };
            return trackDetails;
        },
        _isTrackValid: function(tlTrack) {
            return ((tlTrack != null) &&
                (tlTrack.tl_track != null) &&
                (tlTrack.tl_track.track != null));
        },
        _isFirstTrack: function(tlTrack) {
            var trackNo = null;
            var isFirstTrack = false;
            if (trackDetailsMapper._isTrackValid(tlTrack)) {
                trackNo = tlTrack.tl_track.track.track_no;
                if (trackNo == 1) {
                    isFirstTrack = true;
                }
            }
            return isFirstTrack;
        },
        _isLastTrack: function(tlTrack, tlTrackCount) {
            var trackNo = null;
            var isLastTrack = false;
            if (trackDetailsMapper._isTrackValid(tlTrack)) {
                trackNo = tlTrack.tl_track.track.track_no;
                if (trackNo == tlTrackCount) {
                    isLastTrack = true;
                }
            }
            return isLastTrack;
        },
        _getTrackNumber: function(tlTrack) {
            var trackNo = null;
            if (trackDetailsMapper._isTrackValid(tlTrack)) {
                trackNo = tlTrack.tl_track.track.track_no;
            }
            return trackNo;
        },
        _getTotalTimeMs: function(tlTrack) {
            var totalTimeMs = null;
            if (trackDetailsMapper._isTrackValid(tlTrack)) {
                totalTimeMs = tlTrack.tl_track.track.length;
            }
            return totalTimeMs;
        }
    };
    return trackDetailsMapper;
});
