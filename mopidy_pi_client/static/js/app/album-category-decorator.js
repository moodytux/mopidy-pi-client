define(["app/logger", "app/album-sorter"], function(logger, albumSorter) {
    logger.log("In album-category-decorator.js");
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
                    album.category = {};
                    var category = albumToCategoryMapper(album);

                    // If this is the first album we've seen of this category, put the category
                    // name in this first album and add it to our seen list.
                    if (categorySeenList.indexOf(category) == -1) {
                        album.category.name = category;
                        categorySeenList.push(category);
                    }

                    // Store the common category index.
                    album.category.index = categorySeenList.length - 1;
                });
            }
            return albums;
        }
    };
    return decorator;
});
