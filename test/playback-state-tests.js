var requirejs = require('../mopidy_pi_client/static/js/test/requirejs.js');
var helper = requirejs('test/helper');
var td = helper.td;
var squire = helper.squire;
var assert = helper.assert;

describe('playback-state.js', function() {
    var playbackState;
    var tracks;
    var validFirstTrackDetails;
    var validLastTrackDetails;
    var controlsRenderer;
    var currentTrackDetailsRenderer;
    var mockMopidy;
    var mockMopidyContainer;
    var mockLogger;
    var mockTrackDetailsMapper;
    before(function(done) {
        tracks = {
            length: 10
        }
        validFirstTrackDetails = {
            isFirstTrack: true,
            isLastTrack: false,
            trackNumber: 1,
            totalTimeMs: 100000
        };
        validLastTrackDetails = {
            isFirstTrack: false,
            isLastTrack: true,
            trackNumber: 10,
            totalTimeMs: 110000
        };
        controlsRenderer = function() {};
        currentTrackDetailsRenderer = function() {};

        mockMopidy = {};
        mockMopidy.on = td.function('.on');
        mockMopidy.off = td.function('.off');
        mockMopidy.playback = {};

        mockMopidyContainer = {}
        mockMopidyContainer.getInstance = function() {
            return mockMopidy;
        };
        squire.mock('app/mopidy-container', mockMopidyContainer);

        mockLogger = {};
        mockLogger.log = td.function('.log');
        squire.mock('app/logger', mockLogger);

        squire.mock('mopidy', helper.mockPromise());

        mockTrackDetailsMapper = {};
        mockTrackDetailsMapper.map = td.function('.map');
        squire.mock('app/track-details-mapper', mockTrackDetailsMapper);

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
        it('when not started playing, return correct controls state', function(done) {
            playbackState._currentTrackDetails = validFirstTrackDetails;
            playbackState._latestEvent = playbackState.EventName.NOT_STARTED;

            playbackState._determineControlsState()
                .done((result) => {
                    assert.equal(result.canPlay, false);
                    assert.equal(result.canPause, false);
                    assert.equal(result.canSkipBack, false);
                    assert.equal(result.canSkipForward, false);
                })
                .finally(done);
        });
        it('when playing finished, return correct controls state', function(done) {
            playbackState._currentTrackDetails = validFirstTrackDetails;
            playbackState._latestEvent = playbackState.EventName.PLAY_FINISHED;

            playbackState._determineControlsState()
                .done((result) => {
                    assert.equal(result.canPlay, false);
                    assert.equal(result.canPause, false);
                    assert.equal(result.canSkipBack, false);
                    assert.equal(result.canSkipForward, false);
                })
                .finally(done);
        });
        it('when playing started, return correct controls state', function(done) {
            playbackState._currentTrackDetails = validFirstTrackDetails;
            playbackState._latestEvent = playbackState.EventName.PLAY_STARTED;

            playbackState._determineControlsState()
                .done((result) => {
                    assert.equal(result.canPlay, false);
                    assert.equal(result.canPause, true);
                    assert.equal(result.canSkipBack, false);
                    assert.equal(result.canSkipForward, true);
                })
                .finally(done);
        });
        it('when playing resumed, return correct controls state', function(done) {
            playbackState._currentTrackDetails = validLastTrackDetails;
            playbackState._latestEvent = playbackState.EventName.PLAY_RESUMED;

            playbackState._determineControlsState()
                .done((result) => {
                    assert.equal(result.canPlay, false);
                    assert.equal(result.canPause, true);
                    assert.equal(result.canSkipBack, true);
                    assert.equal(result.canSkipForward, false);
                })
                .finally(done);
        });
        it('when playing paused, return correct controls state', function(done) {
            playbackState._currentTrackDetails = validLastTrackDetails;
            playbackState._latestEvent = playbackState.EventName.PAUSED;

            playbackState._determineControlsState()
                .done((result) => {
                    assert.equal(result.canPlay, true);
                    assert.equal(result.canPause, false);
                    assert.equal(result.canSkipBack, true);
                    assert.equal(result.canSkipForward, false);
                })
                .finally(done);
        });
    });
    describe('_determineCurrentTrackState', function() {
        it('when not started playing, return correct current track state', function(done) {
            var elapsedTime = 0;

            playbackState._currentTrackDetails = validLastTrackDetails;
            playbackState._latestEvent = playbackState.EventName.NOT_STARTED;

            playbackState._determineCurrentTrackState()
                .done((result) => {
                    assert.equal(result.trackNumber, null);
                    assert.equal(result.isPlaying, false);
                    assert.equal(result.isPaused, false);
                    assert.equal(result.elapsedTimeMs, elapsedTime);
                    assert.equal(result.totalTimeMs, validLastTrackDetails.totalTimeMs);
                })
                .finally(done);
        });
        it('when playing finished, return correct current track state', function(done) {
            var elapsedTime = 0;

            playbackState._currentTrackDetails = validLastTrackDetails;
            playbackState._latestEvent = playbackState.EventName.PLAY_FINISHED;

            playbackState._determineCurrentTrackState()
                .done((result) => {
                    assert.equal(result.trackNumber, null);
                    assert.equal(result.isPlaying, false);
                    assert.equal(result.isPaused, false);
                    assert.equal(result.elapsedTimeMs, elapsedTime);
                    assert.equal(result.totalTimeMs, validLastTrackDetails.totalTimeMs);
                })
                .finally(done);
        });
        it('when playing started, return correct current track state', function(done) {
            var elapsedTime = 1500;
            mockMopidy.playback.getTimePosition = () => helper.mockPromise(elapsedTime);

            playbackState._currentTrackDetails = validLastTrackDetails;
            playbackState._latestEvent = playbackState.EventName.PLAY_STARTED;

            playbackState._determineCurrentTrackState()
                .done((result) => {
                    assert.equal(result.trackNumber, 10);
                    assert.equal(result.isPlaying, true);
                    assert.equal(result.isPaused, false);
                    assert.equal(result.elapsedTimeMs, elapsedTime);
                    assert.equal(result.totalTimeMs, validLastTrackDetails.totalTimeMs);
                })
                .finally(done);
        });
        it('when playing resumed, return correct current track state', function(done) {
            var elapsedTime = 2500;
            mockMopidy.playback.getTimePosition = () => helper.mockPromise(elapsedTime);

            playbackState._currentTrackDetails = validFirstTrackDetails;
            playbackState._latestEvent = playbackState.EventName.PLAY_RESUMED;

            playbackState._determineCurrentTrackState()
                .done((result) => {
                    assert.equal(result.trackNumber, 1);
                    assert.equal(result.isPlaying, true);
                    assert.equal(result.isPaused, false);
                    assert.equal(result.elapsedTimeMs, elapsedTime);
                    assert.equal(result.totalTimeMs, validFirstTrackDetails.totalTimeMs);
                })
                .finally(done);
        });
        it('when playing paused, return correct current track state', function(done) {
            var elapsedTime = 2500;
            mockMopidy.playback.getTimePosition = () => helper.mockPromise(elapsedTime);

            playbackState._currentTrackDetails = validFirstTrackDetails;
            playbackState._latestEvent = playbackState.EventName.PAUSED;

            playbackState._determineCurrentTrackState()
                .done((result) => {
                    assert.equal(result.trackNumber, 1);
                    assert.equal(result.isPlaying, false);
                    assert.equal(result.isPaused, true);
                    assert.equal(result.elapsedTimeMs, elapsedTime);
                    assert.equal(result.totalTimeMs, validFirstTrackDetails.totalTimeMs);
                })
                .finally(done);
        });
    });
});
