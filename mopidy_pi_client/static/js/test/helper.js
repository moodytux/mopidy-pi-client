define(['testdouble', 'assert', 'squirejs', 'amdefine/intercept'], function(td, assert, Squire) {
    var helper = {};
    helper.squire = new Squire();
    helper.td = td;
    helper.assert = assert;
    return helper;
});
