define(["mopidy", "app/logger", "app/mopidy-container", "app/album-mapper"], function(Mopidy, logger, mopidyContainer, albumMapper) {
    logger.log("In album-data.js")
    var mopidy = mopidyContainer.getInstance();

    // Returns a promise with album URIs.
    var getAlbumUris = function() {
        logger.log("Fetching album URIs");
        var albumUris = [];
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
    }

    var lookupAlbumUris = function(albumUris) {
        logger.log("About to lookup album URIs", albumUris);

        // Request info on all the albums. Unfortunately the API only gives us access to album info through tracks :(
        return mopidy.library.lookup(null, albumUris);
    }

    var mapAlbumTrackArrayToAlbumArray = function(arrayOfAlbumTracks) {
        logger.log("Mapping array of album tracks to album array", arrayOfAlbumTracks);
        var albumArray = [];
        if (arrayOfAlbumTracks) {
            $.each(arrayOfAlbumTracks, function(index, trackArray) {
                var album = albumMapper.trackListToAlbum(trackArray);
                if (album !== null) {
                    albumArray.push(album);
                }
            });
        }

        return albumArray;
    }

    var albumData = {};
    albumData.getAlbumList = function() {
        // If we need to, fetch the album list.
        if (typeof albumList === 'undefined') {
            return getAlbumUris()
                .then(lookupAlbumUris)
                .then(mapAlbumTrackArrayToAlbumArray)
                .then(function(albumListIn) {
                    albumList = albumListIn;
                    return albumList;
                });
        } else {
            // Return a promise with the data.
            logger.log("Already got album list");
            return Mopidy.when(albumList);
        }
    };

    albumData.getAlbumInfo = function(albumUri) {
        return lookupAlbumUris([albumUri])
            .then(function(albums) {
                return albums[albumUri]
            });
    };
    return albumData;
});
