define(['testdouble', 'assert', 'squirejs', 'when', 'amdefine/intercept'], function(td, assert, Squire, when) {
    td.config({
        promiseConstructor: when
    });

    var helper = {};
    helper.squire = new Squire();
    helper.td = td;
    helper.assert = assert;
    helper.when = when;
    helper.mockpromise = function() {
        return {
            args: "",
            then: function(callback) {
                this.args = callback(this.args);
                return this;
            },
            done: function(callback) {
                callback(this.args);
            }
        };
    };
    return helper;
});
