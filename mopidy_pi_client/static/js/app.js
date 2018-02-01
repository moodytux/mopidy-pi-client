// Default path already defined to be js dir
requirejs.config({
    paths: {
        "mopidy": "../../mopidy/mopidy",
        "jquery": "lib/jquery-2.2.4.min",
        "jquery-ui": "lib/jquery-ui-1.12.1.custom/jquery-ui.min",
        "jquery-mobile": "lib/jquery.mobile-1.4.5.min",
        "bootstrap": "lib/bootstrap.min",
        "coverflowjs": "lib/coverflowjs-3.0.2.min"
    },
    shim: {
        "jquery-ui": ["jquery"],
        "jquery-mobile": ["jquery", "jquery-ui"],
        "coverflowjs": ["jquery", "jquery-ui", "jquery-mobile"],
        "bootstrap": ["jquery"]
    }
});

requirejs(["app/logger", "app/navigator", "app/mopidy-container"], function(logger, navigator, mopidyContainer) {
    logger.log("In app.js")
    var mopidy = mopidyContainer.getInstance();

    navigator.showOfflineScreen();
    
    // Setup our listener for when we are online.
    mopidy.on("state:online", function() {
        // Show the loading screen initially.
        navigator.showLoadingScreen();

        // Show the album list which may take some time.
        navigator.showAlbumListScreen();
    });

    if (mopidyContainer.isOnline()) {
        // Show the loading screen initially.
        navigator.showLoadingScreen();

        // Show the album list which may take some time.
        navigator.showAlbumListScreen();
    }
});
