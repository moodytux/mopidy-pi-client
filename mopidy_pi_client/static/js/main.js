var showAlbumInfo = function showAlbumInfo(album, tracks) {
    if (tracks) {
        for (var i = 0; i < tracks.length; i++) {
            $("<a/>")
                .text("Track no: " + tracks[i].track_no + ", track: " + tracks[i].name)
                .appendTo($("#track-list"));
        }

        // Set the album info.
        $("#album-info .album-name").text(album.name);

        // Show our album-info screen, hide other screens.
        $(".screen").hide();
        $("#album-info").show();
    }
}

var showAlbums = function showAlbums(albums) {
    if (albums) {
        for (var i = 0; i < albums.length; i++) {
            $("<a/>")
                .text("Album: " + albums[i].name + ", artist: " + albums[i].artists[0])
                .click(showScreen("album-info", { "album": albums[i] } ))
                .appendTo($("#album-list"));
        }

        // Show our album list screen, hide other screens.
        $(".screen").hide();
        $("#album-list").show();
    }
}

var showScreen = function showScreen(screenName, params) {
    if (screenName == "album-list") {
        // Get the list of albums and show them.
        mopidy.library.getDistinct("album", "None").done(showAlbums);
    } else if (screenName == "album-info") {
        // Get the track list and show it as part of the album info.
        mopidy.library.lookup("None", [ params.album.uri ]).done(showAlbumInfo(params.album));
    }
}

// JQuery document ready.
$(function() {
    var mopidy = new Mopidy();

    // Log all events.
    mopidy.on(console.log.bind(console));

    // Setup our listener for when we are online.
    mopidy.on("state:online", function() {
        // Show the online state.
        $("#offline").hide();
        $("#online").show();

        // Initially show the album list screen.
        showScreen("album-list", {});
    });
})
