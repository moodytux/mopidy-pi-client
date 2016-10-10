var showAlbumInfo = function(album, tracks) {
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

var showAlbums = function(albums) {
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

var populateAlbumData = function(albumsRefs) {
    albumData = [];
    if (albumRefs) {
        // Loop through the album refs, getting data on each.
        $.each(albumRefs, function(index, albumRef) {
            // Request info on this album. Unfortunately the API only gives us access to album info through tracks :(
            mopidy.library.lookup(null, albumRef.uri).then(function(tracksObj) {
                var tracks = tracksObj[albumRef.uri];
                if (tracks.length > 0) {
                    console.log(tracks[0]);
                }
            });
        });
    }
}

var showScreen = function showScreen(screenName, params) {
    if (screenName == "album-list") {
        // Fetch all the album data if we don't have it - the API provides no way of getting all album info in one go :(
        if (albumData.length == 0) {
            mopidy.library.browse("local:directory?type=album").done(populateAlbumData);
        }

    } else if (screenName == "album-info") {
        // Get the track list and show it as part of the album info.
        mopidy.library.lookup("None", [ params.album.uri ]).done(showAlbumInfo(params.album));
    }
}

// JQuery document ready.
$(function() {
    mopidy = new Mopidy();

    // Log all events.
    mopidy.on(console.log.bind(console));

    // Setup our listener for when we are online.
    mopidy.on("state:online", function() {
        // Show the online state.
        $("#offline").hide();
        $("#online").show();

        // Initialise our album data with no albums.
        albumData = [];

        // Initially show the album list screen.
        showScreen("album-list", {});
    });
})
