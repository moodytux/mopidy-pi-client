var requirejs = require('../mopidy_pi_client/static/js/test/requirejs.js');
var helper = requirejs('test/helper');
var td = helper.td;
var squire = helper.squire;
var assert = helper.assert;

describe('track-details-mapper.js', function() {
    var trackDetailsMapper;
    var tracksCount;
    var validFirstTrack;
    var validLastTrack;
    var validMiddleTrack;
    var invalidTrackNoInnerObject;
    var mockLogger;
    before(function(done) {
        tracksCount = 10;
        validFirstTrack = {
            tl_track: {
                track: {
                    track_no: 1,
                    length: 100000
                }
            }
        };
        validLastTrack = {
            tl_track: {
                track: {
                    track_no: tracksCount,
                    length: 120000
                }
            }
        };
        validMiddleTrack = {
            tl_track: {
                track: {
                    track_no: 4,
                    length: 110000
                }
            }
        };
        invalidTrackNoInnerObject = {
            tl_track: {
                track: null
            }
        };

        mockLogger = {};
        mockLogger.log = td.function('.log');
        squire.mock('app/logger', mockLogger);

        squire.require(['app/track-details-mapper'], function(trackDetailsMapperIn) {
            trackDetailsMapper = trackDetailsMapperIn;
            done();
        });
    });
    beforeEach(function() {
        td.reset();
    });
    after(function() {
        squire.clean();
    });
    describe('map', function() {
        it('when track is null, its not the first or last track and its a null track number', function() {
            var result = trackDetailsMapper.map(null, tracksCount);

            assert.equal(result.isFirstTrack, false);
            assert.equal(result.isLastTrack, false);
            assert.equal(result.trackNumber, null);
            assert.equal(result.totalTimeMs, null);
        });
        it('when track inner object is null, its not the first or last track and its a null track number', function() {
            var result = trackDetailsMapper.map(invalidTrackNoInnerObject, tracksCount);

            assert.equal(result.isFirstTrack, false);
            assert.equal(result.isLastTrack, false);
            assert.equal(result.trackNumber, null);
            assert.equal(result.totalTimeMs, null);
        });
        it('when track is first track, its the first track not the last and the track number is 1', function() {
            var result = trackDetailsMapper.map(validFirstTrack, tracksCount);

            assert.equal(result.isFirstTrack, true);
            assert.equal(result.isLastTrack, false);
            assert.equal(result.trackNumber, 1);
            assert.equal(result.totalTimeMs, 100000);
        });
        it('when track is last track, its not the first but is the last, and the track number equals the number of tracks', function() {
            var result = trackDetailsMapper.map(validLastTrack, tracksCount);

            assert.equal(result.isFirstTrack, false);
            assert.equal(result.isLastTrack, true);
            assert.equal(result.trackNumber, tracksCount);
            assert.equal(result.totalTimeMs, 120000);
        });
        it('when track is middle track, its not the first or last and the track number should match up', function() {
            var result = trackDetailsMapper.map(validMiddleTrack, tracksCount);

            assert.equal(result.isFirstTrack, false);
            assert.equal(result.isLastTrack, false);
            assert.equal(result.trackNumber, 4);
            assert.equal(result.totalTimeMs, 110000);
        });
        it('when track is last track but track count is null, its not the first or last track but has the last track number', function() {
            var result = trackDetailsMapper.map(validLastTrack, null);

            assert.equal(result.isFirstTrack, false);
            assert.equal(result.isLastTrack, false);
            assert.equal(result.trackNumber, tracksCount);
            assert.equal(result.totalTimeMs, 120000);
        });
    });
});
