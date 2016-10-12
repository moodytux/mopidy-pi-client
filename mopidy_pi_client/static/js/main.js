/*
 * Controller related methods to show screens.
 */

var showScreen = function(screenName, params) {
    if (screenName == 'album-list') {
        prettyLog("About to send the user to the album list screen");
        var albumDataPromise = getAlbumTrackData()
            .then(parseAlbumData);

        albumDataPromise
            .done(renderAlbumList);
    } else if (screenName == "album-info") {
        prettyLog("About to send the user to the album info screen, with URI", params.albumUri);
        var trackDataPromise = getAlbumTrackData()
            .then(function(albumTrackData) {
                return albumTrackData[params.albumUri];
            });

        trackDataPromise
            .done(renderAlbumInfo);
    }
}

/*
 * Render methods, to render HTML from data.
 */

var renderAlbumInfo = function(tracks) {
    prettyLog("About to render the following tracks", tracks);
    if (tracks) {
        $.each(tracks, function(index, track) {
            $("<li/>")
                .text("Track no: " + track.track_no + ", track: " + track.name)
                .appendTo($('#album-info .track-list'));

            // Set the album info.
            $("#album-info .album-name").text(track.album.name);
        });


        // Show our album-info screen, hide other screens.
        $(".screen").hide();
        $("#album-info").show();
    }
}

var renderAlbumList = function(albums) {
    prettyLog("About to render the following albums", albums);
    if (albums != null) {
        $.each(albums, function(index, album) {
            $("<li/>")
                .text("Album: " + album.name)
                .click(function() {
                    showScreen("album-info", {albumUri: album.uri } );
                })
                .appendTo($("#album-list"));
        });

        // Show our album list screen, hide other screens.
        $(".screen").hide();
        $("#album-list").show();
    }
}

/*
 * Domain based data manipulation methods.
 */

// Returns a promise with albumTrackData.
var getAlbumTrackData = function() {
    // If we need to, first fetch the album track data.
    if (typeof albumTrackData === 'undefined') {
        prettyLog("Fetching album track data");
        albumTrackData = [];

        // The API provides no way of getting all album info in one go :(
        return mopidy.library.browse("local:directory?type=album")
            .then(lookupAlbumUris)
            .then(function(data) {
                albumTrackData = data;
                return albumTrackData;
            });
    } else {
        // Return a promise with the data.
        prettyLog("Already got data");
        return Mopidy.when(albumTrackData);
    }
}

//todo
var getImages = function(uri, callback) {
    mopidy.library.getImages([uri])
        .then(function(result) {
            return result["uri"];
        })
        .done(callback);
}

var lookupAlbumUris = function(albumRefs) {
    var albumRefUris = [];
    if (albumRefs) {
        // Loop through the album refs, storing the uri for each.
        $.each(albumRefs, function(index, albumRef) {
            albumRefUris.push(albumRef.uri);
        });
    }

    // Request info on all the albums. Unfortunately the API only gives us access to album info through tracks :(
    return mopidy.library.lookup(null, albumRefUris);
}

var parseAlbumData = function(albumTrackData) {
    var albumData = {};
    if (albumTrackData) {
        $.each(albumTrackData, function(index, trackObjs) {
            if (trackObjs.length > 0) {
                var album = trackObjs[0].album;
                albumData[album.name] = album;
            }
        });
    }
    return albumData;
}

var prettyLog = function(message, obj) {
    if (typeof obj !== 'undefined') {
        console.log("pi-client: " + message + " " + JSON.stringify(obj, null, 2));
    } else {
        console.log("pi-client: " + message);
    }
}

/*
 * JQuery document ready, where things start.
 */
$(function() {
    mopidy = new Mopidy();

    // Log all events.
    mopidy.on(console.log.bind(console));

    // Setup our listener for when we are online.
    mopidy.on("state:online", function() {
        // Show the album list as the default screen.
        showScreen("album-list");
    });
})
