var requirejs = require('requirejs');
requirejs.config({
    baseUrl: __dirname + "/.."
});
requirejs.config(requirejs('test/requirejsconfig').generate(require));
module.exports = requirejs;
