var requirejs = require('../mopidy_pi_client/static/js/test/requirejs.js');
var helper = requirejs('test/helper');
var td = helper.td;
var squire = helper.squire;

describe('controls.js', function() {
    var mockmopidy;
    var mocklogger;
    before(function() {
        mockmopidy = {}
        mockmopidy.tracklist = {};
        mockmopidy.tracklist.clear = td.function('.clear');
        mockmopidy.tracklist.add = td.function('.add');
        mockmopidy.playback = {};
        mockmopidy.playback.play = td.function('.play');
        mockmopidy.playback.previous = td.function('.previous');
        mockmopidy.playback.next = td.function('.next');
        mockmopidy.playback.pause = td.function('.pause');
        mockmopidy.playback.stop = td.function('.stop');
        squire.mock('app/mopidy', mockmopidy);

        mocklogger = {};
        mocklogger.log = td.function('.log');
        squire.mock('app/logger', mocklogger);
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

            td.when(mockmopidy.tracklist.clear()).thenReturn(helper.mockpromise());
            td.when(mockmopidy.tracklist.add(tracks)).thenReturn(tracks);

            controls.playTracks(tracks);

            td.verify(mockmopidy.tracklist.add(tracks));
            td.verify(mockmopidy.playback.play(tracks[0]));
        }));
        it('when we have no tracks, we should clear tracklist, but not add or play tracks', squire.run(['app/controls'], function(controls) {
            var tracks = [];

            td.when(mockmopidy.tracklist.clear()).thenReturn(helper.mockpromise());

            controls.playTracks(tracks);

            td.verify(mockmopidy.tracklist.add(td.matchers.anything()), { times: 0 });
            td.verify(mockmopidy.playback.play(td.matchers.anything()), { times: 0 });
        }));
    });
    describe('playPrevious', function() {
        it('should delegate call to previous', squire.run(['app/controls'], function(controls) {
            controls.playPrevious();
            td.verify(mockmopidy.playback.previous());
        }));
    });
    describe('playNext', function() {
        it('should delegate call to next', squire.run(['app/controls'], function(controls) {
            controls.playNext();
            td.verify(mockmopidy.playback.next());
        }));
    });
    describe('play', function() {
        it('should delegate call to play', squire.run(['app/controls'], function(controls) {
            controls.play();
            td.verify(mockmopidy.playback.play());
        }));
    });
    describe('pause', function() {
        it('should delegate call to pause', squire.run(['app/controls'], function(controls) {
            controls.pause();
            td.verify(mockmopidy.playback.pause());
        }));
    });
    describe('stop', function() {
        it('should delegate call to stop and clear tracklist', squire.run(['app/controls'], function(controls) {
            controls.stop();
            td.verify(mockmopidy.playback.stop());
            td.verify(mockmopidy.tracklist.clear());
        }));
    });
});
