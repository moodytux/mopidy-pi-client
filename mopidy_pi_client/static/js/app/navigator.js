define(["app/logger", "app/local-album-data", "app/album-category-decorator", "app/online-album-decorator", "app/album-list-screen", "app/album-info-screen"], function(logger, localAlbumData, albumCategoryDecorator, onlineAlbumDecorator, albumListScreen, albumInfoScreen) {
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
            localAlbumData.getAlbumList()
                .then(albumCategoryDecorator.decorateByArtist)
                .done(albumListScreen.render);
        },
        showAlbumInfoScreen: function(albumUri) {
            logger.log("About to send the user to the album info screen, with URI", albumUri);
            localAlbumData.getAlbumInfo(albumUri)
                .done(albumInfoScreen.render);
        }
    };
    albumListScreen.setNavigateToAlbumCallback(navigator.showAlbumInfoScreen);
    albumInfoScreen.setNavigateBackCallback(navigator.showAlbumListScreen);
    return navigator;
});
