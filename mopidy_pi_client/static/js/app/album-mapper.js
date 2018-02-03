define(["app/logger"], function(logger) {
    logger.log("In album-mapper.js")

    var albumMapper = {
        trackListToAlbum: function(trackArray) {
            if (albumMapper._isValid(trackArray)) {
                return albumMapper._map(trackArray);
            } else {
                return null;
            }
        },
        _isValid: function(trackArray) {
            var isValid = true;

            if ((typeof(trackArray) === "undefined") || (trackArray.length < 1)) {
                logger.log("Album has no tracks", trackArray);
                isValid = false;
            } else {
                var album = trackArray[0].album;
                var genre = trackArray[0].genre;

                if ((typeof(album.images) === "undefined") || (album.images.length < 1)) {
                    logger.log("Missing album image for album", album);
                    isValid = false;
                }

                if ((typeof(album.artists) === "undefined") || (album.artists.length < 1)) {
                    logger.log("Missing artists for album", album);
                    isValid = false;
                }

                if (typeof(genre) === "undefined") {
                    logger.log("Missing genre for first track of album", trackArray);
                    isValid = false;
                }
            }

            return isValid;
        },
        _map: function(trackArray) {
            var trackAlbum = trackArray[0].album;
            return {
                name: trackAlbum.name,
                artist: trackAlbum.artists[0].name,
                image: trackAlbum.images[0],
                genre: trackArray[0].genre,
                uri: trackAlbum.uri
            };
        }
    };
    return albumMapper;
});
