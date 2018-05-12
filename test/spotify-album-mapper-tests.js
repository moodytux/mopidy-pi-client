var requirejs = require('../mopidy_pi_client/static/js/test/requirejs.js');
var helper = requirejs('test/helper');
var td = helper.td;
var squire = helper.squire;
var assert = helper.assert;

describe('spotify-album-mapper.js', function() {
    var mocklogger;
    var spotifyAlbumMapper;
    var ashTrailerAlbumModel;
    var ash1977AlbumModel;
    var u2AlbumModel;
    before(function(done) {
        ashTrailerAlbumModel = {
            name: 'Trailer',
            uri: 'trailer-album-uri',
            artists: [{
                name: 'Ash',
                uri: 'ash-uri'
            }, {
                name: 'Ash Backers',
                uri: 'ash-backers-uri'
            }]
        };
        ash1977AlbumModel = {
            name: '1977',
            uri: '1977-album-uri',
            artists: [{
                name: 'Ash',
                uri: 'ash-uri'
            }, {
                name: 'Ash Backers',
                uri: 'ash-backers-uri'
            }]
        };
        u2AlbumModel = {
            name: 'The Best of 1990-2000',
            uri: 'bestofu2-album-uri',
            artists: [{
                name: 'U2',
                uri: 'u2-uri'
            }, {
                name: 'U2 Backers',
                uri: 'u2-backers-uri'
            }]
        };

        mocklogger = {};
        mocklogger.log = td.function('.log');
        squire.mock('app/logger', mocklogger);

        squire.require(['app/spotify-album-mapper'], function(spotifyAlbumMapperIn) {
            spotifyAlbumMapper = spotifyAlbumMapperIn;
            done();
        });
    });
    beforeEach(function() {
        td.reset();
    });
    after(function() {
        squire.clean();
    });
    describe('_findArtistUriWithExactMatch', function() {
        it('when no artists array is given, return null', function() {
            assert.equal(spotifyAlbumMapper._findArtistUriWithExactMatch(null, "Feeder"), null);
        });
        it('when no matching artist exists, return null', function() {
            var artistsArray = [{
                    name: "Ash Trubute",
                    uri: "ash-tribute-uri"
                }, {
                    name: "Ash",
                    uri: "ash-uri"
                },
                {
                    name: "U2",
                    uri: "u2-uri"
                }
            ];
            assert.equal(spotifyAlbumMapper._findArtistUriWithExactMatch(artistsArray, "Feeder"), null);
        });
        it('when an artist matches, return their uri', function() {
            var artistsArray = [{
                    name: "Ash Trubute",
                    uri: "ash-tribute-uri"
                }, {
                    name: "Ash",
                    uri: "ash-uri"
                },
                {
                    name: "U2",
                    uri: "u2-uri"
                }
            ];
            assert.equal(spotifyAlbumMapper._findArtistUriWithExactMatch(artistsArray, "Ash"), "ash-uri");
        });
        it('when multiple artists match, return the first artists uri', function() {
            var artistsArray = [{
                    name: "Ash",
                    uri: "ash-uri"
                },
                {
                    name: "Ash Trubute",
                    uri: "ash-tribute-uri"
                },
                {
                    name: "U2",
                    uri: "u2-uri"
                },
                {
                    name: "U2",
                    uri: "u2-2nd-uri"
                }
            ];
            assert.equal(spotifyAlbumMapper._findArtistUriWithExactMatch(artistsArray, "U2"), "u2-uri");
        });
    });
    describe('_findAlbumsWithArtistUri', function() {
        it('when no albums array is given, return empty array', function() {
            assert.deepEqual(spotifyAlbumMapper._findAlbumsWithArtistUri(null, "feeder-uri"), []);
        });
        it('when empty albums array is given, return empty array', function() {
            assert.deepEqual(spotifyAlbumMapper._findAlbumsWithArtistUri([], "feeder-uri"), []);
        });
        it('when no albums match the artist uri, return empty array', function() {
            var albumsModels = [u2AlbumModel, ashTrailerAlbumModel];
            assert.deepEqual(spotifyAlbumMapper._findAlbumsWithArtistUri(albumsModels, "feeder-uri"), []);
        });
        it('when one album match the artist uri, return it in an array', function() {
            var albumsModels = [ashTrailerAlbumModel, u2AlbumModel];
            assert.deepEqual(spotifyAlbumMapper._findAlbumsWithArtistUri(albumsModels, "ash-uri"), [ashTrailerAlbumModel]);
        });
        it('when two albums match the artist uri, return them in an array', function() {
            var albumsModels = [ashTrailerAlbumModel, u2AlbumModel, ash1977AlbumModel];
            assert.deepEqual(spotifyAlbumMapper._findAlbumsWithArtistUri(albumsModels, "ash-uri"), [ashTrailerAlbumModel, ash1977AlbumModel]);
        });
    });
    describe('_mapAlbumModelToAlbum', function() {
        it('when no album model array is given, return empty array', function() {
            assert.deepEqual(spotifyAlbumMapper._mapAlbumModelToAlbum(null), []);
        });
        it('when empty album model array is given, return empty array', function() {
            assert.deepEqual(spotifyAlbumMapper._mapAlbumModelToAlbum([]), []);
        });
        it('when have one album in model array, return mapped version in an array', function() {
            var albumModelArray = [ashTrailerAlbumModel];
            var expectedArray = [{
                name: 'Trailer',
                artist: 'Ash',
                image: '/pi-client/images/spotify.png',
                genre: '',
                uri: 'trailer-album-uri',
                isLocal: false
            }];
            assert.deepEqual(spotifyAlbumMapper._mapAlbumModelToAlbum(albumModelArray), expectedArray);
        });
        it('when have two albums in model array, return them mapped in an array', function() {
            var albumModelArray = [ashTrailerAlbumModel, u2AlbumModel];
            var expectedArray = [{
                name: 'Trailer',
                artist: 'Ash',
                image: '/pi-client/images/spotify.png',
                genre: '',
                uri: 'trailer-album-uri',
                isLocal: false
            },{
                name: 'The Best of 1990-2000',
                artist: 'U2',
                image: '/pi-client/images/spotify.png',
                genre: '',
                uri: 'bestofu2-album-uri',
                isLocal: false
            }];
            assert.deepEqual(spotifyAlbumMapper._mapAlbumModelToAlbum(albumModelArray), expectedArray);
        });
    });
});
