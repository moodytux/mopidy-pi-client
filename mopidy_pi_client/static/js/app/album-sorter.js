define(["app/logger"], function(logger) {
    logger.log("In album-sorter.js")

    var albumSorter = {
        SortOrder: {
            LEFT_FIRST: -1,
            RIGHT_FIRST: 1,
            SAME: 0,
        },

        byGenre: function(left, right) {
            logger.log("Sorting album data by genre");

            var result;
            if ((left == null) && (right == null)) {
                result = albumSorter.SortOrder.SAME;
            } else if (left == null) {
                result = albumSorter.SortOrder.RIGHT_FIRST;
            } else if (right == null) {
                result = albumSorter.SortOrder.LEFT_FIRST;
            } else {
                result = albumSorter._byGenrePrimaryGenreSort(left, right);
            }

            return result;
        },
        _byGenrePrimaryGenreSort: function(left, right) {
            var leftName = left.genre.toLowerCase();
            var rightName = right.genre.toLowerCase();

            var result;
            if (leftName < rightName) {
                result = albumSorter.SortOrder.LEFT_FIRST;
            } else if (leftName > rightName) {
                result = albumSorter.SortOrder.RIGHT_FIRST;
            } else {
                result = albumSorter.byArtist(left, right);
            }
            return result;
        },
        byArtist: function(left, right) {
            logger.log("Sorting album data by artist");

            var result;
            if ((left == null) && (right == null)) {
                result = albumSorter.SortOrder.SAME;
            } else if (left == null) {
                result = albumSorter.SortOrder.RIGHT_FIRST;
            } else if (right == null) {
                result = albumSorter.SortOrder.LEFT_FIRST;
            } else {
                result = albumSorter._byArtistPrimaryArtistSort(left, right);
            }

            return result;
        },
        _byArtistPrimaryArtistSort: function(left, right) {
            var leftArtist = left.artist.toLowerCase();
            var rightArtist = right.artist.toLowerCase();

            var result;
            if (leftArtist < rightArtist) {
                result = albumSorter.SortOrder.LEFT_FIRST;
            } else if (leftArtist > rightArtist) {
                result = albumSorter.SortOrder.RIGHT_FIRST;
            } else {
                result = albumSorter._byArtistSecondaryIsLocalSort(left, right);
            }
            return result;
        },
        _byArtistSecondaryIsLocalSort: function(left, right) {
            var result;
            if (!left.isLocal && right.isLocal) {
                result = albumSorter.SortOrder.LEFT_FIRST;
            } else if (left.isLocal && !right.isLocal) {
                result = albumSorter.SortOrder.RIGHT_FIRST;
            } else {
                result = albumSorter._byArtistTertiaryTitleSort(left, right);
            }
            return result;
        },
        _byArtistTertiaryTitleSort: function(left, right) {
            var leftTitle = left.name.toLowerCase();
            var rightTitle = right.name.toLowerCase();

            var result;
            if (leftTitle < rightTitle) {
                result = albumSorter.SortOrder.LEFT_FIRST;
            } else if (leftTitle > rightTitle) {
                result = albumSorter.SortOrder.RIGHT_FIRST;
            } else {
                result = albumSorter.SortOrder.SAME;
            }
            return result;
        }
    };
    return albumSorter;
});
