var requirejs = require('../mopidy_pi_client/static/js/test/requirejs.js');
var helper = requirejs('test/helper');
var td = helper.td;
var squire = helper.squire;
var assert = helper.assert;

describe('album-validator.js', function() {
    var mocklogger;
    var albumValidator;
    before(function(done) {
        mocklogger = {};
        mocklogger.log = td.function('.log');
        squire.mock('app/logger', mocklogger);

        squire.require(['app/album-validator'], function(albumValidatorIn) {
            albumValidator = albumValidatorIn;
            done();
        });
    });
    beforeEach(function() {
        td.reset();
    });
    after(function() {
        squire.clean();
    });
    describe('isValid', function() {
        it('when an album has all fields, it is valid', function() {
            var album = {
                images: ["validimageurl"],
                artists: ["U2"],
                genre: "Rock"
            };
            assert.ok(albumValidator.isValid(album));
        });
        it('when an albums has no image, it is invalid', function() {
            var album = {
                images: undefined,
                artists: ["U2"],
                genre: "Rock"
            };
            assert.equal(albumValidator.isValid(album), false);
        });
        it('when an album has no artist, it is invalid', function() {
            var album = {
                images: ["validimageurl"],
                artists: undefined,
                genre: "Rock"
            };
            assert.equal(albumValidator.isValid(album), false);
        });
        it('when an album has no genre, it is invalid', function() {
            var album = {
                images: ["validimageurl"],
                artists: ["U2"],
                genre: undefined
            };
            assert.equal(albumValidator.isValid(album), false);
        });
    });
});
