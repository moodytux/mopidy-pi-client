define(["app/logger"], function(logger) {
    logger.log("In spotify-album-mapper.js")

    var spotifyAlbumMapper = {
        mapSearchResultToAlbumArray: function(searchResult, requiredArtist) {
            var requiredArtistUri = spotifyAlbumMapper._findArtistUriWithExactMatch(searchResult.artists, requiredArtist);
            var albumModels = spotifyAlbumMapper._findAlbumsWithArtistUri(searchResult.albums, requiredArtistUri);
            return spotifyAlbumMapper._mapAlbumModelToAlbum(albumModels, requiredArtist);
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
        _mapAlbumModelToAlbum: function(albumModelArray, requiredArtist) {
            if (albumModelArray != null) {
                return albumModelArray.map(albumModel => {
                    return {
                        name: albumModel.name,
                        artist: requiredArtist,
                        image: '/pi-client/images/spotify.png',
                        genre: '',
                        uri: albumModel.uri,
                        isLocal: false
                    };
                });
            }
            return [];
        }
    };

    return spotifyAlbumMapper;
});
