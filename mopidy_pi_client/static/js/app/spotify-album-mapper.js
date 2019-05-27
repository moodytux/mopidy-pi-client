define(["app/logger", "app/mopidy-container", "mopidy"], function(logger, mopidyContainer, Mopidy) {
    logger.log("In spotify-album-mapper.js")
    var mopidy = mopidyContainer.getInstance();

    var spotifyAlbumMapper = {
        mapSearchResultToAlbumArray: function(searchResult, requiredArtist) {
            if (searchResult != null) {
                var requiredArtistUri = spotifyAlbumMapper._findArtistUriWithExactMatch(searchResult.artists, requiredArtist);
                var albumModels = spotifyAlbumMapper._findAlbumsWithArtistUri(searchResult.albums, requiredArtistUri);
                return spotifyAlbumMapper._mapAlbumModelsToAlbums(albumModels, requiredArtist);
            } else {
                return [];
            }
        },
        _findArtistUriWithExactMatch: function(artistsArray, requiredArtist) {
            if (artistsArray != null) {
                return artistsArray.filter(artistModel => artistModel.name == requiredArtist)
                    .map(artistModel => artistModel.uri)[0];
            }
            return null;
        },
        _findAlbumsWithArtistUri: function(albumArray, requiredArtistUri) {
            if (albumArray != null) {
                return albumArray.filter(albumModel =>
                    albumModel.artists.filter(albumArtistModel => albumArtistModel.uri == requiredArtistUri).length > 0);
            }
            return [];
        },
        _mapAlbumModelsToAlbums: function(albumModelArray, requiredArtist) {
            if (albumModelArray != null) {
                return Mopidy.when.all(
                    albumModelArray.map(
                        albumModel => spotifyAlbumMapper._mapAlbumModelToAlbum(albumModel, requiredArtist)
                    )
                );
            }
            return [];
        },
        _mapAlbumModelToAlbum: function(albumModel, requiredArtist) {
            var newAlbumModel = {
                name: albumModel.name,
                artist: requiredArtist,
                image: '/pi-client/images/spotify-noimage.png',
                genre: '',
                uri: albumModel.uri,
                isLocal: false,
                providerIconUrl: ''
            };
            return mopidy.library.getImages([albumModel.uri])
                .then(imageUris => {
                    if (imageUris && imageUris[albumModel.uri] &&
                        imageUris[albumModel.uri][0] && imageUris[albumModel.uri][0].uri) {
                        newAlbumModel.image = imageUris[albumModel.uri][0].uri;
                        newAlbumModel.providerIconUrl = '/pi-client/images/spotify-icon.png';
                    }
                    return newAlbumModel;
                });
        }
    };

    return spotifyAlbumMapper;
});
