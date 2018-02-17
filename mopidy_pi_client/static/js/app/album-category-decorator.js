define(["app/logger", "app/album-sorter"], function(logger, albumSorter) {
    var decorator = {
        decorateByArtist: function(albums) {
            return decorator._decorate(albums, albumSorter.byArtist, function(album) {
                if (album.artist.length > 0) {
                    return album.artist[0].toUpperCase();
                } else {
                    return "";
                }
            });
        },
        _decorate: function(albums, sortAlgorithm, albumToCategoryMapper) {
            albums.sort(sortAlgorithm);
            if (albums != null) {
                var categorySeenList = [];
                albums.forEach(function(album, index) {
                    // If this is the first album we've seen of this category, put the category
                    // in this first album and add it to our seen list.
                    var category = albumToCategoryMapper(album);
                    if (categorySeenList.indexOf(category) == -1) {
                        album.category = {
                            name: category,
                            index: categorySeenList.length
                        };
                        categorySeenList.push(category);
                    }
                });
            }
            return albums;
        }
    };
    return decorator;
});
