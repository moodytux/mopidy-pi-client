var requirejs = require('../mopidy_pi_client/static/js/test/requirejs.js');
var helper = requirejs('test/helper');
var td = helper.td;
var squire = helper.squire;
var assert = helper.assert;

describe('album-sorter.js', function() {
    var mocklogger;
    var albumSorter;
    before(function(done) {
        mocklogger = {};
        mocklogger.log = td.function('.log');
        squire.mock('app/logger', mocklogger);

        squire.require(['app/album-sorter'], function(albumSorterIn) {
            albumSorter = albumSorterIn;
            done();
        });
    });
    beforeEach(function() {
        td.reset();
    });
    after(function() {
        squire.clean();
    });
    describe('byGenre', function() {
        it('when two tracks are provided, out of genre order, order is reversed', function() {
            assertRightFirst(albumSorter.byGenre, {
                genre: "Rock"
            }, {
                genre: "Indie"
            });
        });
        it('when two tracks are provided, genre in order, order is maintained', function() {
            assertLeftFirst(albumSorter.byGenre, {
                genre: "Rave"
            }, {
                genre: "Rock"
            });
        });
        it('when two tracks are provided with the same genre, we report they are the same', function() {
            assertSame(albumSorter.byGenre, {
                genre: "Rave"
            }, {
                genre: "RAVE"
            });
        });
        it('when the first track is provided, this comes first', function() {
            assertLeftFirst(albumSorter.byGenre, {
                genre: "Rave"
            }, {
                genre: undefined
            });
        });
        it('when the second track is provided, this comes first', function() {
            assertRightFirst(albumSorter.byGenre, {
                genre: undefined
            }, {
                genre: "Rave"
            });
        });
        it('when no tracks are provided, they should be reported as the same', function() {
            assertSame(albumSorter.byGenre, {
                genre: undefined
            }, {
                genre: undefined
            });
        });
    });
    describe('byArtist', function() {
        it('when two tracks are provided, out of artist order, order is reversed', function() {
            assertRightFirst(albumSorter.byArtist, {
                artist: "U2"
            }, {
                artist: "Ash"
            });
        });
        it('when two tracks are provided, artist in order, order is maintained', function() {
            assertLeftFirst(albumSorter.byArtist, {
                artist: "Ash"
            }, {
                artist: "U2"
            });
        });
        it('when two tracks are provided with the same artist, we report they are the same', function() {
            assertSame(albumSorter.byArtist, {
                artist: "U2"
            }, {
                artist: "u2"
            });
        });
        it('when the first track is provided, this comes first', function() {
            assertLeftFirst(albumSorter.byArtist, {
                artist: "U2"
            }, {
                artist: undefined
            });
        });
        it('when the second track is provided, this comes first', function() {
            assertRightFirst(albumSorter.byArtist, {
                artist: undefined
            }, {
                artist: "Ash"
            });
        });
        it('when no tracks are provided, they should be reported as the same', function() {
            assertSame(albumSorter.byArtist, {
                artist: undefined
            }, {
                artist: undefined
            });
        });
    });

    var assertSame = function(algorithm, left, right) {
        var result = algorithm(left, right);

        assert.equal(result, albumSorter.SortOrder.SAME);
    };
    var assertLeftFirst = function(algorithm, left, right) {
        var result = algorithm(left, right);

        assert.equal(result, albumSorter.SortOrder.LEFT_FIRST);
    };
    var assertRightFirst = function(algorithm, left, right) {
        var result = algorithm(left, right);

        assert.equal(result, albumSorter.SortOrder.RIGHT_FIRST);
    };
});