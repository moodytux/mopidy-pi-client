define(["app/logger", "app/album-data", "app/album-list-screen", "app/album-info-screen"], function(logger, albumData, albumListScreen, albumInfoScreen) {
    logger.log("In navigator.js")
    var navigator = {
        showOfflineScreen: function() {
            logger.log("About to show the offline screen");
            $(".screen").hide();
            $("#offline").show();
        },
        showLoadingScreen: function() {
            logger.log("About to show the loading screen");
            $(".screen").hide();
            $("#loading").show();
        },
        showAlbumListScreen: function() {
            logger.log("About to send the user to the album list screen");
            albumData.getAlbumList()
                .done(albumListScreen.render);
        },
        showAlbumInfoScreen: function(albumUri) {
            logger.log("About to send the user to the album info screen, with URI", albumUri);
            albumData.getAlbumInfo(albumUri)
                .done(albumInfoScreen.render);
        }
    };
    albumListScreen.setNavigateToAlbumCallback(navigator.showAlbumInfoScreen);
    albumInfoScreen.setNavigateBackCallback(navigator.showAlbumListScreen);
    return navigator;
});
