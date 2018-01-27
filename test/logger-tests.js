var requirejs = require('../mopidy_pi_client/static/js/test/requirejs.js');
var helper = requirejs('test/helper');

describe('logger.js', function() {
    var mockconsole;
    before(function() {
        mockconsole = {}
        mockconsole.log = helper.td.function('.log');
        helper.squire.mock('app/console', mockconsole);
    });
    beforeEach(function() {
        helper.td.reset();
    });
    after(function() {
        helper.squire.clean();
    });
    describe('log', function() {
        it('when just a string is given we should log it', helper.squire.run(['app/logger'], function(logger) {
            logger.log("Log foo");
            helper.td.verify(mockconsole.log("pi-client: Log foo"));
        }));
        it('when a string and object is given we should log both', helper.squire.run(['app/logger'], function(logger) {
            var obj = {};
            obj.a = "123";

            logger.log("Log bar", obj);
            helper.td.verify(mockconsole.log("pi-client: Log bar {\n  \"a\": \"123\"\n}"));
        }));
    });
});
