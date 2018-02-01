define(["app/logger", "mopidy"], function(logger, Mopidy) {
    logger.log("In mopidy.js")
    var mopidyContainer = {
        _mopidy: null,
        _mopidyOnline: false,
        _markOnline: function() {
            _mopidyOnline = true;
        },
        getInstance: function() {
            if (mopidyContainer._mopidy === null) {
                logger.log("Creating real mopidy instance")
                mopidyContainer._mopidy = new Mopidy();

                mopidyContainer._mopidy.on("state:online", mopidyContainer._markOnline);

                // Log all events.
                mopidyContainer._mopidy.on(console.log.bind(console));
            }
            return mopidyContainer._mopidy;
        },
        isOnline: function() {
            return _mopidyOnline;
        }
    };
    return mopidyContainer;
});
