var requirejs = require('../mopidy_pi_client/static/js/test/requirejs.js');
var helper = requirejs('test/helper');
var td = helper.td;
var squire = helper.squire;
var assert = helper.assert;

describe('album-mapper.js', function() {
    var mocklogger;
    var albumMapper;
    before(function(done) {
        mocklogger = {};
        mocklogger.log = td.function('.log');
        squire.mock('app/logger', mocklogger);

        squire.require(['app/album-mapper'], function(albumMapperIn) {
            albumMapper = albumMapperIn;
            done();
        });
    });
    beforeEach(function() {
        td.reset();
    });
    after(function() {
        squire.clean();
    });
    describe('trackListToAlbum', function() {
        it('when a track array is valid, we dont return null', function() {
            var tracks = [{
                album: {
                    images: ["validimageurl"],
                    artists: [{
                        name: "U2"
                    }]
                },
                genre: "Rock"
            }];
            assert.ok(albumMapper.trackListToAlbum(tracks));
        });
        it('when a track array is invalid, we return null', function() {
            var tracks = [];
            assert.equal(albumMapper.trackListToAlbum(tracks), null);
        });
    });
    describe('_isValid', function() {
        it('when a track has all fields, it is valid', function() {
            var tracks = [{
                album: {
                    images: ["validimageurl"],
                    artists: [{
                        name: "U2"
                    }]
                },
                genre: "Rock"
            }];
            assert.ok(albumMapper._isValid(tracks));
        });
        it('when we have been given undefined tracks, it is invalid', function() {
            var tracks = undefined;
            assert.equal(albumMapper._isValid(tracks), false);
        });
        it('when we have been given zero tracks, it is invalid', function() {
            var tracks = [];
            assert.equal(albumMapper._isValid(tracks), false);
        });
        it('when a tracks album has an undefined image field, it is invalid', function() {
            var tracks = [{
                album: {
                    images: undefined,
                    artists: [{
                        name: "U2"
                    }]
                },
                genre: "Rock"
            }];
            assert.equal(albumMapper._isValid(tracks), false);
        });
        it('when a tracks album has no image, it is invalid', function() {
            var tracks = [{
                album: {
                    images: [],
                    artists: [{
                        name: "U2"
                    }]
                },
                genre: "Rock"
            }];
            assert.equal(albumMapper._isValid(tracks), false);
        });
        it('when a tracks album has an undefined artist field, it is invalid', function() {
            var tracks = [{
                album: {
                    images: ["validimageurl"],
                    artists: undefined
                },
                genre: "Rock"
            }];
            assert.equal(albumMapper._isValid(tracks), false);
        });
        it('when a tracks album has no artist, it is invalid', function() {
            var tracks = [{
                album: {
                    images: ["validimageurl"],
                    artists: []
                },
                genre: "Rock"
            }];
            assert.equal(albumMapper._isValid(tracks), false);
        });
        it('when a track has no genre, it is invalid', function() {
            var tracks = [{
                album: {
                    images: ["validimageurl"],
                    artists: [{
                        name: "U2"
                    }]
                },
                genre: undefined
            }];
            assert.equal(albumMapper._isValid(tracks), false);
        });
    });
    describe('_map', function() {
        it('when map a track array to an album successfully', function() {
            var albumName = "The Best Of 1980-1990";
            var albumUri = "validuri";
            var albumImage = "validimageurl";
            var albumArtist = "U2";
            var albumGenre = "Rock";

            var tracks = [{
                album: {
                    name: albumName,
                    uri: albumUri,
                    images: [albumImage],
                    artists: [{
                        name: albumArtist
                    }]
                },
                genre: albumGenre
            }];

            var expectedAlbum = {
                name: albumName,
                artist: albumArtist,
                image: albumImage,
                genre: albumGenre,
                uri: albumUri
            };

            assert.deepEqual(albumMapper._map(tracks), expectedAlbum);
        });
    });
    describe('_normaliseGenre', function() {
        it('when we normalise a various artists album, the genre should be set to various', function() {
            var album = {
                artist: "Various artists",
                genre: "Rock"
            };
            albumMapper._normaliseGenre(album);
            assert.equal(album.genre, "Various");
        });
        it('when we normalise an album that isnt a various artists album, the 1st letter of each word in the genre should be uppercased', function() {
            var album = {
                artist: "U2",
                genre: " alternAtive ROCK "
            };
            albumMapper._normaliseGenre(album);
            assert.equal(album.genre, "Alternative Rock");
        });
    });
});
