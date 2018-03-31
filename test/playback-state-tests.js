var requirejs = require('../mopidy_pi_client/static/js/test/requirejs.js');
var helper = requirejs('test/helper');
var td = helper.td;
var squire = helper.squire;
var assert = helper.assert;

describe('playback-state.js', function() {
    var playbackState;
    var tracks;
    var validFirstTrack;
    var validLastTrack;
    var invalidTrackNoInnerObject;
    var controlsRenderer;
    var currentTrackDetailsRenderer;
    var mockMopidy;
    var mockMopidyContainer;
    var mockLogger;
    before(function(done) {
        tracks = {
            length: 10
        }
        validFirstTrack = {
            tl_track: {
                track: {
                    track_no: 1
                }
            }
        };
        validLastTrack = {
            tl_track: {
                track: {
                    track_no: 10
                }
            }
        };
        invalidTrackNoInnerObject = {
            tl_track: {
                track: null
            }
        };
        controlsRenderer = function() {};
        currentTrackDetailsRenderer = function() {};

        mockMopidy = {};
        mockMopidy.on = td.function('.on');
        mockMopidy.off = td.function('.off');

        mockMopidyContainer = {}
        mockMopidyContainer.getInstance = function() {
            return mockMopidy;
        };
        squire.mock('app/mopidy-container', mockMopidyContainer);

        mockLogger = {};
        mockLogger.log = td.function('.log');
        squire.mock('app/logger', mockLogger);

        squire.require(['app/playback-state'], function(playbackStateIn) {
            playbackState = playbackStateIn;
            done();
        });
    });
    beforeEach(function() {
        td.reset();
    });
    after(function() {
        squire.clean();
    });
    describe('associateWithMopidyEvents', function() {
        it('when we have not set a controls renderer, no interactions should occur', function() {
            playbackState.setTracks(tracks);
            playbackState.setControlsRenderer(null);
            playbackState.setTrackListRenderer(currentTrackDetailsRenderer);

            playbackState.associateWithMopidyEvents();

            td.verify(mockMopidy.on(td.matchers.anything(), td.matchers.anything()), {
                times: 0
            });
            td.verify(mockMopidy.off(td.matchers.anything()), {
                times: 0
            });
        });
        it('when we have not set a current track details renderer, no interactions should occur', function() {
            playbackState.setTracks(tracks);
            playbackState.setControlsRenderer(controlsRenderer);
            playbackState.setTrackListRenderer(null);

            playbackState.associateWithMopidyEvents();

            td.verify(mockMopidy.on(td.matchers.anything(), td.matchers.anything()), {
                times: 0
            });
            td.verify(mockMopidy.off(td.matchers.anything()), {
                times: 0
            });
        });
        it('when we have not set any tracks, no interactions should occur', function() {
            playbackState.setTracks(null);
            playbackState.setControlsRenderer(controlsRenderer);
            playbackState.setTrackListRenderer(currentTrackDetailsRenderer);

            playbackState.associateWithMopidyEvents();

            td.verify(mockMopidy.on(td.matchers.anything(), td.matchers.anything()), {
                times: 0
            });
            td.verify(mockMopidy.off(td.matchers.anything()), {
                times: 0
            });
        });
        it('when we have set tracks, controls renderer, and current track details renderer, ensure mopidy events are hooked', function() {
            playbackState.setTracks(tracks);
            playbackState.setControlsRenderer(controlsRenderer);
            playbackState.setTrackListRenderer(currentTrackDetailsRenderer);

            playbackState.associateWithMopidyEvents();

            td.verify(mockMopidy.on("event:trackPlaybackStarted", td.matchers.anything()));
            td.verify(mockMopidy.off("event:trackPlaybackStarted"));

            td.verify(mockMopidy.on("event:trackPlaybackResumed", td.matchers.anything()));
            td.verify(mockMopidy.off("event:trackPlaybackResumed"));

            td.verify(mockMopidy.on("event:trackPlaybackPaused", td.matchers.anything()));
            td.verify(mockMopidy.off("event:trackPlaybackPaused"));

            td.verify(mockMopidy.on("event:trackPlaybackEnded", td.matchers.anything()));
            td.verify(mockMopidy.off("event:trackPlaybackEnded"));
        });
    });
    describe('_determineControlsState', function() {
        it('when not started playing, return correct controls state', function() {
            var eventName = playbackState.EventName.NOT_STARTED;

            var result = playbackState._determineControlsState(eventName, validFirstTrack, tracks);

            assert.equal(result.canPlay, false);
            assert.equal(result.canPause, false);
            assert.equal(result.canSkipBack, false);
            assert.equal(result.canSkipForward, false);
        });
        it('when playing finished, return correct controls state', function() {
            var eventName = playbackState.EventName.PLAY_FINISHED;

            var result = playbackState._determineControlsState(eventName, validFirstTrack, tracks);

            assert.equal(result.canPlay, false);
            assert.equal(result.canPause, false);
            assert.equal(result.canSkipBack, false);
            assert.equal(result.canSkipForward, false);
        });
        it('when playing started, return correct controls state', function() {
            var eventName = playbackState.EventName.PLAY_STARTED;

            var result = playbackState._determineControlsState(eventName, validFirstTrack, tracks);

            assert.equal(result.canPlay, false);
            assert.equal(result.canPause, true);
            assert.equal(result.canSkipBack, false);
            assert.equal(result.canSkipForward, true);
        });
        it('when playing resumed, return correct controls state', function() {
            var eventName = playbackState.EventName.PLAY_RESUMED;

            var result = playbackState._determineControlsState(eventName, validLastTrack, tracks);

            assert.equal(result.canPlay, false);
            assert.equal(result.canPause, true);
            assert.equal(result.canSkipBack, true);
            assert.equal(result.canSkipForward, false);
        });
        it('when playing paused, return correct controls state', function() {
            var eventName = playbackState.EventName.PAUSED;

            var result = playbackState._determineControlsState(eventName, validLastTrack, tracks);

            assert.equal(result.canPlay, true);
            assert.equal(result.canPause, false);
            assert.equal(result.canSkipBack, true);
            assert.equal(result.canSkipForward, false);
        });
    });
    describe('_determineCurrentTrackDetails', function() {
        it('when not started playing, return correct current track details', function() {
            var eventName = playbackState.EventName.NOT_STARTED;

            var result = playbackState._determineCurrentTrackDetails(eventName, validLastTrack, tracks);

            assert.equal(result.trackNumber, null);
            assert.equal(result.isPlaying, false);
            assert.equal(result.isPaused, false);
        });
        it('when playing finished, return correct current track details', function() {
            var eventName = playbackState.EventName.PLAY_FINISHED;

            var result = playbackState._determineCurrentTrackDetails(eventName, validLastTrack, tracks);

            assert.equal(result.trackNumber, null);
            assert.equal(result.isPlaying, false);
            assert.equal(result.isPaused, false);
        });
        it('when playing started, return correct current track details', function() {
            var eventName = playbackState.EventName.PLAY_STARTED;

            var result = playbackState._determineCurrentTrackDetails(eventName, validLastTrack, tracks);

            assert.equal(result.trackNumber, 10);
            assert.equal(result.isPlaying, true);
            assert.equal(result.isPaused, false);
        });
        it('when playing resumed, return correct current track details', function() {
            var eventName = playbackState.EventName.PLAY_RESUMED;

            var result = playbackState._determineCurrentTrackDetails(eventName, validFirstTrack, tracks);

            assert.equal(result.trackNumber, 1);
            assert.equal(result.isPlaying, true);
            assert.equal(result.isPaused, false);
        });
        it('when playing paused, return correct current track details', function() {
            var eventName = playbackState.EventName.PAUSED;

            var result = playbackState._determineCurrentTrackDetails(eventName, validFirstTrack, tracks);

            assert.equal(result.trackNumber, 1);
            assert.equal(result.isPlaying, false);
            assert.equal(result.isPaused, true);
        });
    });
    describe('_isFirstTrack', function() {
        it('when track is null, return false', function() {
            var track = null;
            assert.equal(playbackState._isFirstTrack(track), false);
        });
        it('when track inner object is null, return false', function() {
            assert.equal(playbackState._isFirstTrack(invalidTrackNoInnerObject), false);
        });
        it('when track is first track, return true', function() {
            assert.ok(playbackState._isFirstTrack(validFirstTrack));
        });
        it('when track is not first track, return false', function() {
            assert.equal(playbackState._isFirstTrack(validLastTrack), false);
        });
    });
    describe('_isLastTrack', function() {
        it('when track is null, return false', function() {
            var track = null;
            assert.equal(playbackState._isLastTrack(track, tracks), false);
        });
        it('when track inner object is null, return false', function() {
            assert.equal(playbackState._isLastTrack(invalidTrackNoInnerObject, tracks), false);
        });
        it('when track is first track, return false', function() {
            assert.equal(playbackState._isLastTrack(validFirstTrack, tracks), false);
        });
        it('when track is last track, return true', function() {
            assert.ok(playbackState._isLastTrack(validLastTrack, tracks));
        });
        it('when track is middle track, return false', function() {
            var track = {
                tl_track: {
                    track: {
                        track_no: 4
                    }
                }
            };
            assert.equal(playbackState._isLastTrack(track, tracks), false);
        });
    });
    describe('_getTrackNumber', function() {
        it('when track is null, return null', function() {
            assert.equal(playbackState._getTrackNumber(null), null);
        });
        it('when track inner object is null, return null', function() {
            assert.equal(playbackState._getTrackNumber(invalidTrackNoInnerObject), null);
        });
        it('when track number is present, return it', function() {
            assert.equal(playbackState._getTrackNumber(validLastTrack), 10);
        });
    });
});
