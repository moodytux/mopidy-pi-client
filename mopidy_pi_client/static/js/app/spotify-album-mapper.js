define(["app/logger"], function(logger) {
    logger.log("In spotify-album-mapper.js")

    var spotifyAlbumMapper = {
        mapSearchResultToAlbumArray: function(searchResult, requiredArtist) {
            var requiredArtistUri = spotifyAlbumMapper._findArtistUriWithExactMatch(searchResult.artists, requiredArtist);
            var albumModels = spotifyAlbumMapper._findAlbumsWithArtistUri(searchResult.albums, requiredArtistUri);
            return spotifyAlbumMapper._mapAlbumModelToAlbum(albumModels);
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
        _mapAlbumModelToAlbum: function(albumModelArray) {
            if (albumModelArray != null) {
                return albumModelArray.map(albumModel => {
                    return {
                        name: albumModel.name,
                        artist: albumModel.artists[0].name,
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
