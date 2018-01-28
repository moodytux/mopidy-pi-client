var requirejs = require('../mopidy_pi_client/static/js/test/requirejs.js');
var helper = requirejs('test/helper');
var td = helper.td;
var squire = helper.squire;

describe('logger.js', function() {
    var mockconsole;
    before(function() {
        mockconsole = {}
        mockconsole.log = td.function('.log');
        squire.mock('app/console', mockconsole);
    });
    beforeEach(function() {
        td.reset();
    });
    after(function() {
        squire.clean();
    });
    describe('log', function() {
        it('when just a string is given we should log it', squire.run(['app/logger'], function(logger) {
            logger.log("Log foo");
            td.verify(mockconsole.log("pi-client: Log foo"));
        }));
        it('when a string and object is given we should log both', squire.run(['app/logger'], function(logger) {
            var obj = {};
            obj.a = "123";

            logger.log("Log bar", obj);
            td.verify(mockconsole.log("pi-client: Log bar {\n  \"a\": \"123\"\n}"));
        }));
    });
});
