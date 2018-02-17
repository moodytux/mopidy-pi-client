var requirejs = require('../mopidy_pi_client/static/js/test/requirejs.js');
var helper = requirejs('test/helper');
var td = helper.td;
var squire = helper.squire;
var assert = helper.assert;

describe('album-category-decorator.js', function() {
    var mockLogger;
    before(function() {
        mockLogger = {};
        mockLogger.log = td.function('.log');
        squire.mock('app/logger', mockLogger);
        mockAlbumSorter = {};
        mockAlbumSorter.byArtist = td.function('.byArtist');
        squire.mock('app/album-sorter', mockAlbumSorter);
    });
    beforeEach(function() {
        td.reset();
    });
    after(function() {
        squire.clean();
    });
    describe('decorateByArtist', function() {
        it('when given no albums, return empty list', squire.run(['app/album-category-decorator'], function(albumCategoryDecorator) {
            var albums = [];
            var result = albumCategoryDecorator.decorateByArtist(albums);
            assert.equal(result, albums);
        }));
        it('when given albums with no artist, returns albums with one empty category name', squire.run(['app/album-category-decorator'], function(albumCategoryDecorator) {
            var albums = [{
                artist: ""
            }, {
                artist: ""
            }, {
                artist: ""
            }];

            var result = albumCategoryDecorator.decorateByArtist(albums);

            assert.equal(result[0].category.name, "");
            assert.equal(result[0].category.index, 0);
            assert.equal(result[1].category.name, undefined);
            assert.equal(result[1].category.index, 0);
            assert.equal(result[2].category.name, undefined);
            assert.equal(result[1].category.index, 0);
        }));
        it('when given albums, at minimum same data should be returned and sort called', squire.run(['app/album-category-decorator'], function(albumCategoryDecorator) {
            var albums = [{
                artist: "U2"
            }, {
                artist: "Foo Fighters"
            }, {
                artist: "Weezer"
            }];
            albums.sort = td.function('.sort');

            var result = albumCategoryDecorator.decorateByArtist(albums);

            td.verify(albums.sort(mockAlbumSorter.byArtist));
            assert.equal(result[0].artist, albums[0].artist);
            assert.equal(result[1].artist, albums[1].artist);
            assert.equal(result[2].artist, albums[2].artist);
        }));
        it('when given albums of same artist, return with single category name on first album', squire.run(['app/album-category-decorator'], function(albumCategoryDecorator) {
            var albums = [{
                artist: "U2"
            }, {
                artist: "U2"
            }, {
                artist: "U2"
            }];

            var result = albumCategoryDecorator.decorateByArtist(albums);

            assert.equal(result[0].category.name, "U");
            assert.equal(result[0].category.index, 0);
            assert.equal(result[1].category.name, undefined);
            assert.equal(result[1].category.index, 0);
            assert.equal(result[2].category.name, undefined);
            assert.equal(result[2].category.index, 0);
        }));
        it('when given albums of different artists, return with category name on first seen album', squire.run(['app/album-category-decorator'], function(albumCategoryDecorator) {
            var albums = [{
                artist: "Foo Fighters"
            }, {
                artist: "Foo Fighters"
            }, {
                artist: "Foo Fighters"
            }, {
                artist: "U2"
            }, {
                artist: "U2"
            }, {
                artist: "Weezer"
            }, {
                artist: "Weezer"
            }, {
                artist: "Weezer"
            }, {
                artist: "Weezer"
            }];

            var result = albumCategoryDecorator.decorateByArtist(albums);

            assert.equal(result[0].category.name, "F");
            assert.equal(result[0].category.index, 0);
            assert.equal(result[1].category.name, undefined);
            assert.equal(result[1].category.index, 0);
            assert.equal(result[2].category.name, undefined);
            assert.equal(result[2].category.index, 0);

            assert.equal(result[3].category.name, "U");
            assert.equal(result[3].category.index, 1);
            assert.equal(result[4].category.name, undefined);
            assert.equal(result[4].category.index, 1);

            assert.equal(result[5].category.name, "W");
            assert.equal(result[5].category.index, 2);
            assert.equal(result[6].category.name, undefined);
            assert.equal(result[6].category.index, 2);
            assert.equal(result[7].category.name, undefined);
            assert.equal(result[7].category.index, 2);
            assert.equal(result[8].category.name, undefined);
            assert.equal(result[8].category.index, 2);
        }));
    });
});
