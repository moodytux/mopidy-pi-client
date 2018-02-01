define(["mopidy", "app/logger", "app/mopidy-container"], function(Mopidy, logger, mopidyContainer) {
    logger.log("In album-data.js")
    var mopidy = mopidyContainer.getInstance();

    // Returns a promise with albumTrackData.
    var getAlbumTrackData = function() {
        // If we need to, first fetch the album track data.
        if (typeof albumTrackData === 'undefined') {
            logger.log("Fetching album track data");
            albumTrackData = [];

            return getAlbumUris()
                .then(lookupAlbumUris)
                .then(function(data) {
                    albumTrackData = data;
                    return albumTrackData;
                });
        } else {
            // Return a promise with the data.
            logger.log("Already got data");
            return Mopidy.when(albumTrackData);
        }
    }

    // Returns a promise with album URIs.
    var getAlbumUris = function() {
        // If we need to, fetch the album refs.
        if (typeof albumUris === 'undefined') {
            albumUris = [];
            return mopidy.library.browse("local:directory?type=album")
                .then(function(albumRefs) {
                    if (albumRefs) {
                        // Loop through the album refs, storing the uri for each.
                        $.each(albumRefs, function(index, albumRef) {
                            albumUris.push(albumRef.uri);
                        });
                    }
                    return albumUris;
                });
        } else {
            // Return a promise with the data.
            logger.log("Already got album URIs");
            return Mopidy.when(albumUris);
        }
    }

    var lookupAlbumUris = function(albumUris) {
        logger.log("About to lookup album URIs", albumUris);

        // Request info on all the albums. Unfortunately the API only gives us access to album info through tracks :(
        return mopidy.library.lookup(null, albumUris);
    }

    var parseAlbumData = function(albumTrackData) {
        logger.log("Parsing album data from albumTrackData", albumTrackData);
        var albumData = [];
        if (albumTrackData) {
            $.each(albumTrackData, function(index, trackObjs) {
                if (trackObjs.length > 0) {
                    var album = trackObjs[0].album;
                    album.genre = trackObjs[0].genre;//todo fix me (manipulating the album here doesnt end well)
                    albumData.push(album);
                }
            });
        }

        return albumData;
    }

    var albumData = {};
    albumData.getAlbumList = function(callback) {
        getAlbumTrackData()
            .then(parseAlbumData)
            .done(callback);
    };

    albumData.getAlbumInfo = function(callback, albumUri) {
        getAlbumTrackData()
            .then(function(albumTrackData) {
                return albumTrackData[albumUri];
            })
            .done(callback);
    };
    return albumData;
});
