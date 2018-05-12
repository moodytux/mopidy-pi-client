define(["mopidy", "app/logger", "app/mopidy-container", "app/spotify-album-mapper"], function(Mopidy, logger, mopidyContainer, spotifyAlbumMapper) {
    logger.log("In online-album-decorator.js")
    var mopidy = mopidyContainer.getInstance();

    var onlineAlbumDecorator = {
        insertOnlineAlbums: function(albumList) {
            // If we need to, fetch the online album list.
            if (typeof albumListIncludingOnline === 'undefined') {
                // Get the albums by artist.
                var albumsByArtist = onlineAlbumDecorator._getAlbumsByArtists(albumList);

                // Get a list of artists, excluding various artists.
                var artists = Object.keys(albumsByArtist).filter(item => item !== "Various Artists");

                // Go through each artist and get an online album for it. Create an aggregating promise which
                // appends the albums to the album array.
                return Mopidy.when.all(artists.map(artist => onlineAlbumDecorator._getOnlineAlbumForArtist(artist, albumsByArtist)))
                    .then(function(onlineAlbumList) {
                        albumListIncludingOnline = albumList.concat(onlineAlbumList);
                        return albumListIncludingOnline;
                    });
            } else {
                logger.log("Already got album list including online");
                return Mopidy.when(albumListIncludingOnline);
            }
        },
        _getAlbumsByArtists: function(albumList) {
            var albumsByArtist = {};
            if (albumList != null) {
                albumList.forEach((album, index) => {
                    albumsByArtist[album.artist] = albumsByArtist[album.artist] || [];
                    albumsByArtist[album.artist].push(album);
                });
            }
            return albumsByArtist;
        },
        _searchSpotifyForArtist: function(requiredArtist) {
            return mopidy.library.search({
                'artist': [requiredArtist]
            }, uris = ['spotify:'], true);
        },
        _filterDuplicateLocalAlbums: function(onlineAlbums, localAlbumsByArtist) {
            if (onlineAlbums == null) {
                return [];
            } else if (localAlbumsByArtist == null) {
                return onlineAlbums;
            } else {
                return onlineAlbums.filter(onlineAlbum =>
                    !localAlbumsByArtist[onlineAlbum.artist].map(localAlbum => localAlbum.name).includes(onlineAlbum.name))
            }
        },
        _pickRandomAlbum: function(albums) {
            if (albums != null) {
                var randomIndex = Math.floor(Math.random() * albums.length);
                return albums[randomIndex];
            } else {
                return null;
            }
        },
        _getOnlineAlbumForArtist: function(artist, localAlbumsByArtist) {
            // Lookup online albums, filtering out local duplicates, and pick one at random.
            return onlineAlbumDecorator._searchSpotifyForArtist(artist)
                .then(searchResults => spotifyAlbumMapper.mapSearchResultToAlbumArray(searchResults[0], artist))
                .then(onlineAlbums => onlineAlbumDecorator._filterDuplicateLocalAlbums(onlineAlbums, localAlbumsByArtist))
                .then(onlineAlbumDecorator._pickRandomAlbum);
        }
    };

    return onlineAlbumDecorator;
});
