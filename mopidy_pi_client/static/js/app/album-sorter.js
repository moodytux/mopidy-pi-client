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

            if ((typeof(left.genre) === "undefined") && (typeof(right.genre) === "undefined")) {
                result = albumSorter.SortOrder.SAME;
            } else if (typeof(left.genre) === "undefined") {
                result = albumSorter.SortOrder.RIGHT_FIRST;
            } else if (typeof(right.genre) === "undefined") {
                result = albumSorter.SortOrder.LEFT_FIRST;
            } else {
                var leftName = left.genre.toLowerCase();
                var rightName = right.genre.toLowerCase();

                var result;
                if (leftName < rightName) {
                    result = albumSorter.SortOrder.LEFT_FIRST;
                } else if (leftName > rightName) {
                    result = albumSorter.SortOrder.RIGHT_FIRST;
                } else {
                    result = albumSorter.SortOrder.SAME;
                }
            }

            return result;
        },

        byArtist: function(left, right) {
            logger.log("Sorting album data by artist");

            if ((typeof(left.artists) === "undefined") && (typeof(right.artists) === "undefined")) {
                result = albumSorter.SortOrder.SAME;
            } else if (typeof(left.artists) === "undefined") {
                result = albumSorter.SortOrder.RIGHT_FIRST;
            } else if (typeof(right.artists) === "undefined") {
                result = albumSorter.SortOrder.LEFT_FIRST;
            } else {
                var leftName = left.artists[0].name.toLowerCase();
                var rightName = right.artists[0].name.toLowerCase();

                var result;
                if (leftName < rightName) {
                    result = albumSorter.SortOrder.LEFT_FIRST;
                } else if (leftName > rightName) {
                    result = albumSorter.SortOrder.RIGHT_FIRST;
                } else {
                    result = albumSorter.SortOrder.SAME;
                }
            }

            return result;
        }
    };
    return albumSorter;
});
