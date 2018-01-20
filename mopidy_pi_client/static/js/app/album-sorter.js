define(["app/logger"], function(logger) {
    var albumSorter = {};
    var SortOrder = {
        LEFT_FIRST: -1,
        RIGHT_FIRST: 1,
        SAME: 0,
    };

    albumSorter.byGenre = function(left, right) {
        logger.log("Sorting album data by genre");

        if (typeof(left.genre) === "undefined") {
            result = SortOrder.RIGHT_FIRST;
        } else if (typeof(right.genre) === "undefined") {
            result = SortOrder.LEFT_FIRST;
        } else {
            var leftName = left.genre.toLowerCase();
            var rightName = right.genre.toLowerCase();

            var result;
            if (leftName < rightName) {
                result = SortOrder.LEFT_FIRST;
            } else if (leftName > rightName) {
                result = SortOrder.RIGHT_FIRST;
            } else {
                result = SortOrder.SAME;
            }
        }

        return result;
    }

    albumSorter.byArtist = function(left, right) {
        logger.log("Sorting album data by artist");

        if (typeof(left.artists) === "undefined") {
            result = SortOrder.RIGHT_FIRST;
        } else if (typeof(right.artists) === "undefined") {
            result = SortOrder.LEFT_FIRST;
        } else {
            var leftName = left.artists[0].name.toLowerCase();
            var rightName = right.artists[0].name.toLowerCase();

            var result;
            if (leftName < rightName) {
                result = SortOrder.LEFT_FIRST;
            } else if (leftName > rightName) {
                result = SortOrder.RIGHT_FIRST;
            } else {
                result = SortOrder.SAME;
            }
        }

        return result;
    }

    return albumSorter;
});
