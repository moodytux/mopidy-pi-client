var showTrackList = function showTrackList(tracks) {
    if (tracks) {
        for (var i = 0; i < tracks.length; i++) {
            $("<a/>")
                .text("Track no: " + tracks[i].track_no + ", track: " + tracks[i].name)
                .appendTo($("#track-list"));
        }

        // Show our track list screen, hide other screens.
        $(".screen").hide();
        $("#track-list").show();
    }
}

var showAlbums = function showAlbums(albums) {
    if (albums) {
        for (var i = 0; i < albums.length; i++) {
            $("<a/>")
                .text("Album: " + albums[i].name + ", artist: " + albums[i].artists[0])
                .click(showScreen("track-list", { "uri": albums[i].uri) })
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
    } else if (screenName == "track-list") {
        // Get the track list and show it.
        mopidy.library.lookup("None", [ params.uri ]).done(showTrackList);
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
}
