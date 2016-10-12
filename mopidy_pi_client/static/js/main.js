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

        //todo
        getImageUris()
            .done();
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

        return getAlbumUris()
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
var getImageUris = function() {
    // If we need to, first fetch the album image URIs.
    if (typeof albumImageUris === 'undefined') {
        prettyLog("Fetching image URIs");
        albumImageUris = {};

        return getAlbumUris()
            .then(mopidy.library.getImages)
            .then(function(images) {
                $.each(images, function(index, image) {
                    prettyLog("", index);
                    prettyLog("", image);
                });
                prettyLog("", images);
            });
    } else {
        // Return a promise with the data.
        prettyLog("Already got image URIs");
        return Mopidy.when(albumImageUris);
    }
}

// Returns a promise with album URIs.
var getAlbumUris = function() {
    // If we need to, fetch the album refs.
    if (typeof albumUris === 'undefined') {
        albumUris = [];
        return mopidy.library.browse("local:directory?type=album")
            .then(function(albumRefs) {
                if (albumRefs) {
                    // Loop through the album refs, storing the uri for each.
                    $.each(albumRefs, function(index, albumRef) {
                        albumUris.push(albumRef.uri);
                    });
                }
                return albumUris;
            });
    } else {
        // Return a promise with the data.
        prettyLog("Already got album URIs");
        return Mopidy.when(albumUris);
    }
}

var lookupAlbumUris = function(albumUris) {
    prettyLog("About to lookup album URIs", albumUris);

    // Request info on all the albums. Unfortunately the API only gives us access to album info through tracks :(
    return mopidy.library.lookup(null, albumUris);
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
