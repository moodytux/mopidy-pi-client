define(["app/logger", "app/word-helper"], function(logger, wordHelper) {
    logger.log("In local-album-mapper.js")

    var localAlbumMapper = {
        trackListToAlbum: function(trackArray, imageArray) {
            if (localAlbumMapper._isValid(trackArray, imageArray)) {
                var album = localAlbumMapper._map(trackArray, imageArray);
                localAlbumMapper._normaliseGenre(album);
                return album;
            } else {
                return null;
            }
        },
        _isValid: function(trackArray, imageArray) {
            var isValid = true;

            if ((typeof(trackArray) === "undefined") || (trackArray.length < 1)) {
                logger.log("Album has no tracks", trackArray);
                isValid = false;
            } else if ((typeof(imageArray) === "undefined") || (imageArray.length < 1)) {
                logger.log("Album has no images", imageArray);
                isValid = false;
            } else {
                var album = trackArray[0].album;
                var genre = trackArray[0].genre;

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
        _map: function(trackArray, imageArray) {
            var trackAlbum = trackArray[0].album;
            return {
                name: trackAlbum.name,
                artist: trackAlbum.artists[0].name,
                image: imageArray[0].uri,
                genre: trackArray[0].genre,
                uri: trackAlbum.uri,
                isLocal: true,
                providerIconUrl: ''
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
