define(["mopidy", "app/logger", "app/mopidy-container", "app/spotify-album-mapper"], function(Mopidy, logger, mopidyContainer, spotifyAlbumMapper) {
    logger.log("In online-album-decorator.js")
    var mopidy = mopidyContainer.getInstance();

    var onlineAlbumDecorator = {
        _albumsByArtist: [],
        insertOnlineAlbumPlaceholders: function(albumList) {
            // If we need to, fetch the online album list.
            if (typeof albumListIncludingOnline === 'undefined') {
                // Get the online album list and appends them to the album array, and store.
                return onlineAlbumDecorator._getOnlineAlbumPlaceholders(albumList)
                    .then(function(onlineAlbumList) {
                        albumListIncludingOnline = albumList.concat(onlineAlbumList);
                        return albumListIncludingOnline;
                    });
            } else {
                logger.log("Already got album list including online");
                return Mopidy.when(albumListIncludingOnline);
            }
        },
        populateAlbumPlaceholder: function(album) {
            // Lookup online albums, filtering out local duplicates, and pick one at random.
            return onlineAlbumDecorator._searchSpotifyForArtist(album.artist)
                .then(searchResults => spotifyAlbumMapper.mapSearchResultToAlbumArray(searchResults[0], album.artist))
                .then(onlineAlbums => onlineAlbumDecorator._filterDuplicateLocalAlbums(onlineAlbums, _albumsByArtist))
                .then(onlineAlbumDecorator._pickRandomAlbum);
        },
        _getOnlineAlbumPlaceholders: function(albumList) {
            // Get the albums by artist.
            _albumsByArtist = onlineAlbumDecorator._getAlbumsByArtists(albumList);

            // Get a list of artists, excluding various artists.
            var artists = Object.keys(_albumsByArtist).filter(item => item !== "Various Artists");

            // Get the online album placeholder for each artist we have locally.
            var onlineAlbums = artists.map(artist => onlineAlbumDecorator._getAlbumPlaceholder(artist));

            // Create an aggregating promise of retrieving all of the online albums.
            return Mopidy.when.all(onlineAlbums)
                .then(function(onlineAlbums) {
                    return onlineAlbums.filter(onlineAlbum => onlineAlbum);
                });
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
                    !localAlbumsByArtist[onlineAlbum.artist].map(localAlbum => localAlbum.name)
                    .includes(onlineAlbum.name)
                );
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
        _getAlbumPlaceholder: function(artist) {
            return {
                name: '',
                artist: artist,
                image: '/pi-client/images/spotify-noimage.png',
                genre: '',
                uri: '',
                isLocal: false,
                providerIconUrl: '/pi-client/images/spotify-icon.png'
            };
        }
    };

    return onlineAlbumDecorator;
});
