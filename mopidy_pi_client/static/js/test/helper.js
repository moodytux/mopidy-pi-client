define(['testdouble', 'assert', 'squirejs', 'when', 'amdefine/intercept'], function(td, assert, Squire, when) {
    td.config({
        promiseConstructor: when
    });

    var helper = {};
    helper.squire = new Squire();
    helper.td = td;
    helper.assert = assert;
    helper.when = when;
    helper.mockPromise = function(value) {
        var promise = {
            args: "",
            when: function(value) {
                this.args = value;
                return this;
            },
            then: function(callback) {
                this.args = callback(this.args);
                return this;
            },
            done: function(callback) {
                callback(this.args);
                return this;
            },
            finally: function(callback) {
                callback();
            }
        };
        if (value != null) {
            promise.args = value;
        }
        return promise;
    };
    return helper;
});
