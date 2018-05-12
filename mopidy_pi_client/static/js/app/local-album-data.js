define(["mopidy", "app/logger", "app/mopidy-container", "app/local-album-mapper"], function(Mopidy, logger, mopidyContainer, localAlbumMapper) {
    logger.log("In local-album-data.js")
    var mopidy = mopidyContainer.getInstance();

    var localAlbumData = {
        getAlbumList: function() {
            // If we need to, fetch the album list.
            if (typeof albumList === 'undefined') {
                return localAlbumData._getAlbumUris()
                    .then(localAlbumData._lookupAlbumUris)
                    .then(localAlbumData._mapAlbumTrackArrayToAlbumArray)
                    .then(function(albumListIn) {
                        albumList = albumListIn;
                        return albumList;
                    });
            } else {
                // Return a promise with the data.
                logger.log("Already got album list");
                return Mopidy.when(albumList);
            }
        },
        getAlbumInfo: function(album) {
            return localAlbumData._lookupAlbumUris([album.uri])
                .then(function(albums) {
                    album.tracks = albums[album.uri];
                    return album;
                });
        },
        _getAlbumUris: function() {
            // Returns a promise with album URIs.
            logger.log("Fetching album URIs");
            return mopidy.library.browse("local:directory?type=album")
                .then(localAlbumData._mapAlbumRefsToAlbumUris);
        },
        _lookupAlbumUris: function(albumUris) {
            logger.log("About to lookup album URIs", albumUris);

            // Request info on all the albums. Unfortunately the API only gives us access to album info through tracks :(
            return mopidy.library.lookup(null, albumUris);
        },
        _mapAlbumTrackArrayToAlbumArray: function(arrayOfAlbumTracks) {
            logger.log("Mapping array of album tracks to album array", arrayOfAlbumTracks);
            var albumArray = [];
            if (arrayOfAlbumTracks) {
                Object.entries(arrayOfAlbumTracks).forEach(
                    ([index, trackArray]) => {
                        var album = localAlbumMapper.trackListToAlbum(trackArray);
                        if (album !== null) {
                            albumArray.push(album);
                        }
                    });
            }

            return albumArray;
        },
        _mapAlbumRefsToAlbumUris: function(albumRefs) {
            var albumUris = [];
            if (albumRefs) {
                // Loop through the album refs, storing the uri for each.
                Object.entries(albumRefs).forEach(
                    ([index, albumRef]) => {
                        albumUris.push(albumRef.uri);
                    }
                );
            }
            return albumUris;
        }
    };

    return localAlbumData;
});
