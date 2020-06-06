define(["jquery", "app/logger", "app/local-album-data", "app/album-category-decorator", "app/album-list-screen", "app/album-info-screen", "app/online-album-decorator"], function($, logger, localAlbumData, albumCategoryDecorator, albumListScreen, albumInfoScreen, onlineAlbumDecorator) {
    logger.log("In navigator.js")
    var navigator = {
        showOfflineScreen: function() {
            logger.log("About to show the offline screen");
            navigator._showLoadingCursor();
            $(".screen").hide();
            $("#offline").show();
            navigator._hideLoadingCursor();
        },
        showLoadingScreen: function() {
            logger.log("About to show the loading screen");
            navigator._showLoadingCursor();
            $(".screen").hide();
            $("#loading").show();
            navigator._hideLoadingCursor();
        },
        showAlbumListScreen: function() {
            logger.log("About to send the user to the album list screen");
            navigator._showLoadingCursor();
            localAlbumData.getAlbumList()
                .then(onlineAlbumDecorator.insertOnlineAlbums, navigator._hideLoadingCursor)
                .then(albumCategoryDecorator.decorateByArtist, navigator._hideLoadingCursor)
                .then(albumListScreen.render, navigator._hideLoadingCursor)
                .done(navigator._hideLoadingCursor);
        },
        showAlbumInfoScreen: function(album) {
            logger.log("About to send the user to the album info screen, with album", album);
            navigator._showLoadingCursor();
            localAlbumData.getAlbumInfo(album)
                .then(albumInfoScreen.render, navigator._hideLoadingCursor)
                .done(navigator._hideLoadingCursor);
        },
        _showLoadingCursor: function() {
            $("html").css("cursor", "wait");
        },
        _hideLoadingCursor: function() {
            $("html").css("cursor", "default");
        }
    };
    albumListScreen.setNavigateToAlbumCallback(navigator.showAlbumInfoScreen);
    albumInfoScreen.setNavigateBackCallback(navigator.showAlbumListScreen);
    return navigator;
});
