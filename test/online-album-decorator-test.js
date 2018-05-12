var requirejs = require('../mopidy_pi_client/static/js/test/requirejs.js');
var helper = requirejs('test/helper');
var td = helper.td;
var squire = helper.squire;
var assert = helper.assert;

describe('online-album-decorator.js', function() {
    var mockMopidy;
    var mockMopidyContainer;
    var mockLogger;
    var onlineAlbumDecorator;
    var albums;
    before(function(done) {
        albums = [{
                name: "Pinkerton",
                artist: "Weezer"
            },
            {
                name: "The Best Of 1980-1990",
                artist: "U2"
            },
            {
                name: "1977",
                artist: "Ash"
            },
            {
                name: "The Best Of 1990-2000",
                artist: "U2"
            },
            {
                name: "Nu-Clear Sounds",
                artist: "Ash"
            }
        ];

        squire.mock('mopidy', helper.mockPromise());

        mockMopidy = {};
        mockMopidyContainer = {}
        mockMopidyContainer.getInstance = function() {
            return mockMopidy;
        };
        squire.mock('app/mopidy-container', mockMopidyContainer);

        mockLogger = {};
        mockLogger.log = td.function('.log');
        squire.mock('app/logger', mockLogger);

        squire.require(['app/online-album-decorator'], function(onlineAlbumDecoratorIn) {
            onlineAlbumDecorator = onlineAlbumDecoratorIn;
            done();
        });
    });
    beforeEach(function() {
        td.reset();
    });
    after(function() {
        squire.clean();
    });
    describe('_getAlbumsByArtists', function() {
        it('when given null albums, no albums by artists results', function() {
            var result = onlineAlbumDecorator._getAlbumsByArtists(null);

            assert.deepEqual(result, {});
        });
        it('when given no albums, no albums by artists results', function() {
            var result = onlineAlbumDecorator._getAlbumsByArtists([]);

            assert.deepEqual(result, {});
        });
        it('when given one album, the one album indexed by artist is returned', function() {
            var result = onlineAlbumDecorator._getAlbumsByArtists([albums[0]]);

            var expected = {
                "Weezer": [albums[0]]
            };
            assert.deepEqual(result, expected);
        });
        it('when given many albums, the albums indexed by artist are returned', function() {
            var result = onlineAlbumDecorator._getAlbumsByArtists(albums);

            var expected = {
                "Ash": [albums[2], albums[4]],
                "U2": [albums[1], albums[3]],
                "Weezer": [albums[0]]
            };
            assert.deepEqual(result, expected);
        });
    });
    describe('_filterDuplicateLocalAlbums', function() {
        it('when given null online albums and null local albums, no albums are returned', function() {
            var result = onlineAlbumDecorator._filterDuplicateLocalAlbums(null, null);

            assert.deepEqual(result, []);
        });
        it('when given null online albums and some local albums, no albums are returned', function() {
            var localAlbumsByArtist = {
                'Ash': [albums[2], albums[4]],
                "U2": [albums[1], albums[3]],
                "Weezer": [albums[0]]
            };

            var result = onlineAlbumDecorator._filterDuplicateLocalAlbums(null, localAlbumsByArtist);

            assert.deepEqual(result, []);
        });
        it('when given some online albums and null local albums, the online albums are returned', function() {
            var onlineAlbums = [albums[2], albums[4]];

            var result = onlineAlbumDecorator._filterDuplicateLocalAlbums(onlineAlbums, null);

            assert.deepEqual(result, onlineAlbums);
        });
        it('when given some online albums and some local albums, the online albums without the local albums are returned', function() {
            var onlineAlbums = [albums[2], albums[4]];
            var localAlbumsByArtist = {
                'Ash': [albums[2]],
                "U2": [albums[1], albums[3]],
                "Weezer": [albums[0]]
            };

            var result = onlineAlbumDecorator._filterDuplicateLocalAlbums(onlineAlbums, localAlbumsByArtist);

            assert.deepEqual(result, [albums[4]]);
        });
    });
});
