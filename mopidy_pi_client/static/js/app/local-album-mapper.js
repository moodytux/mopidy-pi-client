define(["app/logger", "app/word-helper"], function(logger, wordHelper) {
    logger.log("In local-album-mapper.js")

    var localAlbumMapper = {
        trackListToAlbum: function(trackArray) {
            if (localAlbumMapper._isValid(trackArray)) {
                var album = localAlbumMapper._map(trackArray);
                localAlbumMapper._normaliseGenre(album);
                return album;
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
                uri: trackAlbum.uri,
                isLocal: true
            };
        },
        _normaliseGenre: function(album) {
            if (album.artist.toLowerCase() == "various artists") {
                album.genre = "Various";
            } else {
                album.genre = wordHelper.uppercaseFirstLetterPerWord(album.genre);
            }
        }
    };
    return localAlbumMapper;
});
