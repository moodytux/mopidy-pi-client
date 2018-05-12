define(["app/logger", "app/local-album-data", "app/album-category-decorator", "app/album-list-screen", "app/album-info-screen", "app/online-album-decorator"], function(logger, localAlbumData, albumCategoryDecorator, albumListScreen, albumInfoScreen, onlineAlbumDecorator) {
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
                .then(onlineAlbumDecorator.insertOnlineAlbums)
                .then(albumCategoryDecorator.decorateByArtist)
                .done(albumListScreen.render);
        },
        showAlbumInfoScreen: function(album) {
            logger.log("About to send the user to the album info screen, with album", album);
            localAlbumData.getAlbumInfo(album)
                .done(albumInfoScreen.render);
        }
    };
    albumListScreen.setNavigateToAlbumCallback(navigator.showAlbumInfoScreen);
    albumInfoScreen.setNavigateBackCallback(navigator.showAlbumListScreen);
    return navigator;
});
