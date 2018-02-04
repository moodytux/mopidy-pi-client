var requirejs = require('../mopidy_pi_client/static/js/test/requirejs.js');
var helper = requirejs('test/helper');
var td = helper.td;
var squire = helper.squire;
var assert = helper.assert;

describe('word-helper.js', function() {
    var mockLogger;
    before(function() {
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
    describe('uppercaseFirstLetterPerWord', function() {
        it('when mixed case string is given, all is lowercase except first letter of each word', squire.run(['app/word-helper'], function(wordHelper) {
            var mixedCaseString = " alternative rOck ";
            var correctCaseString = "Alternative Rock";
            var result = wordHelper.uppercaseFirstLetterPerWord(mixedCaseString);
            assert.equal(result, correctCaseString);
        }));
    });
});
