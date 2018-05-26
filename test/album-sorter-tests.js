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
    describe('byArtist', function() {
        it('when no albums are provided, they should be reported as the same', function() {
            assertSame(albumSorter.byArtist, null, null);
        });
        it('when the first album is provided, this comes first', function() {
            assertLeftFirst(albumSorter.byArtist, {
                artist: "U2"
            }, null);
        });
        it('when the second album is provided, this comes first', function() {
            assertRightFirst(albumSorter.byArtist, null, {
                artist: "Ash"
            });
        });
        it('when two albums are provided, out of artist order, order is reversed', function() {
            assertRightFirst(albumSorter.byArtist, {
                artist: "U2"
            }, {
                artist: "Ash"
            });
        });
        it('when two albums are provided, artist ordered, order is maintained', function() {
            assertLeftFirst(albumSorter.byArtist, {
                artist: "Ash"
            }, {
                artist: "u2"
            });
        });
        it('when two albums are provided, artist same but isLocal unordered, order is reversed', function() {
            assertRightFirst(albumSorter.byArtist, {
                artist: "U2",
                isLocal: true
            }, {
                artist: "u2",
                isLocal: false
            });
        });
        it('when two albums are provided, artist same and isLocal ordered, order is maintained', function() {
            assertLeftFirst(albumSorter.byArtist, {
                artist: "U2",
                isLocal: false
            }, {
                artist: "u2",
                isLocal: true
            });
        });
        it('when two albums are provided, artist same and isLocal same but title unordered, order is reversed', function() {
            assertRightFirst(albumSorter.byArtist, {
                artist: "U2",
                isLocal: true,
                title: "the best of 1990-2000"
            }, {
                artist: "u2",
                isLocal: true,
                title: "The Best of 1980-1990"
            });
        });
        it('when two albums are provided, artist same and isLocal same and title ordered, order is maintained', function() {
            assertLeftFirst(albumSorter.byArtist, {
                artist: "U2",
                isLocal: true,
                title: "The Best of 1980-1990"
            }, {
                artist: "u2",
                isLocal: true,
                title: "the Best of 1990-2000"
            });
        });
        it('when two albums are provided, artist same and isLocal same and title same, we report they are the same', function() {
            assertSame(albumSorter.byArtist, {
                artist: "U2",
                isLocal: true,
                title: "The best of 1990-2000"
            }, {
                artist: "u2",
                isLocal: true,
                title: "The Best of 1990-2000"
            });
        });
    });
    describe('byGenre', function() {
        it('when no albums are provided, they should be reported as the same', function() {
            assertSame(albumSorter.byGenre, null, null);
        });
        it('when the first album is provided, this comes first', function() {
            assertLeftFirst(albumSorter.byGenre, {
                genre: "Rave"
            }, null);
        });
        it('when the second album is provided, this comes first', function() {
            assertRightFirst(albumSorter.byGenre, null, {
                genre: "Rave"
            });
        });
        it('when two albums are provided, genre unordered, order is reversed', function() {
            assertRightFirst(albumSorter.byGenre, {
                genre: "Rock"
            }, {
                genre: "Indie"
            });
        });
        it('when two albums are provided, genre ordered, order is maintained', function() {
            assertLeftFirst(albumSorter.byGenre, {
                genre: "Rave"
            }, {
                genre: "Rock"
            });
        });
        it('when two albums are provided, genre same we should see a call to order by artist', squire.run(['app/album-sorter'], function(newAlbumSorter) {
            newAlbumSorter.byArtist = td.function('.byArtist');
            var left = {
                genre: "Rave"
            };
            var right = {
                genre: "RAVE"
            };

            newAlbumSorter.byGenre(left, right);

            td.verify(newAlbumSorter.byArtist(left, right));
        }));
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
