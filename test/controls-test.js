var requirejs = require('../mopidy_pi_client/static/js/test/requirejs.js');
var helper = requirejs('test/helper');
var td = helper.td;
var squire = helper.squire;

describe('controls.js', function() {
    var mockMopidy;
    var mockMopidyContainer;
    var mockLogger;
    before(function() {
        mockMopidy = {};
        mockMopidy.tracklist = {};
        mockMopidy.tracklist.clear = td.function('.clear');
        mockMopidy.tracklist.add = td.function('.add');
        mockMopidy.playback = {};
        mockMopidy.playback.play = td.function('.play');
        mockMopidy.playback.previous = td.function('.previous');
        mockMopidy.playback.next = td.function('.next');
        mockMopidy.playback.pause = td.function('.pause');
        mockMopidy.playback.stop = td.function('.stop');

        mockMopidyContainer = {}
        mockMopidyContainer.getInstance = function() {
            return mockMopidy;
        };
        squire.mock('app/mopidy-container', mockMopidyContainer);

        mockLogger = {};
        mockLogger.log = td.function('.log');
        squire.mock('app/logger', mockLogger);
    });
    beforeEach(function() {
        td.reset();
    });
    after(function() {
        squire.clean();
    });
    describe('playTracks', function() {
        it('when we have some tracks, we should clear tracklist, add tracks, and play first track', squire.run(['app/controls'], function(controls) {
            var tracks = ['track1', 'track2'];

            td.when(mockMopidy.tracklist.clear()).thenReturn(helper.mockPromise());
            td.when(mockMopidy.tracklist.add(tracks)).thenReturn(tracks);

            controls.playTracks(tracks);

            td.verify(mockMopidy.tracklist.add(tracks));
            td.verify(mockMopidy.playback.play(tracks[0]));
        }));
        it('when we have no tracks, we should clear tracklist, but not add or play tracks', squire.run(['app/controls'], function(controls) {
            var tracks = [];

            td.when(mockMopidy.tracklist.clear()).thenReturn(helper.mockPromise());

            controls.playTracks(tracks);

            td.verify(mockMopidy.tracklist.add(td.matchers.anything()), {
                times: 0
            });
            td.verify(mockMopidy.playback.play(td.matchers.anything()), {
                times: 0
            });
        }));
    });
    describe('playPrevious', function() {
        it('should delegate call to previous', squire.run(['app/controls'], function(controls) {
            controls.playPrevious();
            td.verify(mockMopidy.playback.previous());
        }));
    });
    describe('playNext', function() {
        it('should delegate call to next', squire.run(['app/controls'], function(controls) {
            controls.playNext();
            td.verify(mockMopidy.playback.next());
        }));
    });
    describe('play', function() {
        it('should delegate call to play', squire.run(['app/controls'], function(controls) {
            controls.play();
            td.verify(mockMopidy.playback.play());
        }));
    });
    describe('pause', function() {
        it('should delegate call to pause', squire.run(['app/controls'], function(controls) {
            controls.pause();
            td.verify(mockMopidy.playback.pause());
        }));
    });
    describe('stop', function() {
        it('should delegate call to stop and clear tracklist', squire.run(['app/controls'], function(controls) {
            controls.stop();
            td.verify(mockMopidy.playback.stop());
            td.verify(mockMopidy.tracklist.clear());
        }));
    });
});
