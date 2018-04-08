define(["app/requirejsconfig"], function(requireJSConfig) {
    var config = {};
    config.requireJSConfig = requireJSConfig;
    config.generate = function(require) {
        return Object.assign(config.requireJSConfig, {
            packages: [{
                name: "squirejs",
                location: "/usr/lib/node_modules/squirejs",
                main: "src/Squire"
            }],
            nodeRequire: require
        });
    };
    return config;
});
