define(["app/logger"], function(logger) {
    logger.log("In album-validator.js")

    var albumValidator = {
        isValid: function(album) {
            var isValid = true;

            if ((typeof(album.images) === "undefined") || (album.images.length < 1)) {
                logger.log("Missing album image for album", album);
                isValid = false;
            }

            if ((typeof(album.artists) === "undefined")) {
                logger.log("Missing artists for album", album);
                isValid = false;
            }

            if ((typeof(album.genre) === "undefined")) {
                logger.log("Missing genre for album", album);
                isValid = false;
            }

            return isValid;
        }
    };
    return albumValidator;
});
