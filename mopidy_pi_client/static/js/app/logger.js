define(["app/console"], function(console) {
    var logger = {};
    logger.log = function(message, obj) {
        if (typeof obj !== 'undefined') {
            console.log("pi-client: " + message + " " + JSON.stringify(obj, null, 2));
        } else {
            console.log("pi-client: " + message);
        }
    };
	return logger;
});
