define(["app/logger"], function(logger) {
    logger.log("In word-helper.js");

    var helper = {
        uppercaseFirstLetterPerWord: function(mixedCaseString) {
            var correctCaseString = mixedCaseString.split(" ")
                .filter((token) => {
                    return token != "";
                })
                .map((nonWhitespaceToken) => {
                    return nonWhitespaceToken.substring(0, 1).toUpperCase() +
                        nonWhitespaceToken.substring(1).toLowerCase();
                })
                .join(" ");
            return correctCaseString;
        }
    };
    return helper;
});
