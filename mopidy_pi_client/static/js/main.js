/*
 * Controller related methods to show screens.
 */

var showScreen = function(screenName, params) {
    if (screenName == 'album-list') {
        prettyLog("About to send the user to the album list screen");
        getAlbumTrackData()
            .then(parseAlbumData)
            .done(renderAlbumList);

    } else if (screenName == "album-info") {
        prettyLog("About to send the user to the album info screen, with URI", params.albumUri);
        getAlbumTrackData()
            .then(function(albumTrackData) {
                return albumTrackData[params.albumUri];
            })
            .done(renderAlbumInfo);
    }
}

/*
 * Render methods, to render HTML from data.
 */

var renderAlbumInfo = function(tracks) {
    prettyLog("About to render the following tracks", tracks);
    if (tracks && (tracks.length > 0)) {
        $.each(tracks, function(index, track) {
            $("<li/>")
                .text(track.track_no + ". " + track.name)
                .click(function() {
                    playTracks(tracks.slice(index));
                })
                .appendTo($('#album-info .track-list'));
        });

        // Set the album info.
        var album = tracks[0].album;
        if (album.images && (album.images.length > 0)) {
            $("#album-info .album-image").attr("src", tracks[0].album.images[0]);
        }
        $("#album-info .album-name").text(tracks[0].album.name);
        $("#album-info .play-album").click(function() {
            $("#album-info .previous").show();
            $("#album-info .next").show();
            $("#album-info .pause").show();
            playTracks(tracks);
        });
        $("#album-info .play").click(play);
        $("#album-info .pause").click(pause);
        $("#album-info .previous").click(playPrevious);
        $("#album-info .next").click(playNext);

        // Show our album-info screen, hide other screens.
        $(".screen").hide();
        $("#album-info").show();

        mopidy.on("event:trackPlaybackStarted", function(tlTrack) {
            $("#album-info .play").hide();
            $("#album-info .pause").show();

            // Find the track in the view and set it to playing.
        });
        mopidy.on("event:trackPlaybackResumed", function(tlTrack) {
            $("#album-info .play").hide();
            $("#album-info .pause").show();
        });
        mopidy.on("event:trackPlaybackPaused", function(tlTrack) {
            $("#album-info .play").show();
            $("#album-info .pause").hide();
        });
        mopidy.on("event:trackPlaybackEnded", function(tlTrack) {
            // Find the track in the view and set it to playing.
        });
    }
}

var renderAlbumList = function(albums) {
    prettyLog("About to render the following albums", albums);
    if (albums != null) {
        $.each(albums, function(index, album) {
            if (album.images.length > 0) {
                $("<img/>")
                    .addClass("cover")
                    .attr("src", album.images[0])
                    .click(function() {
                        showScreen("album-info", {albumUri: album.uri } );
                    })
                    .appendTo($("#album-list"));
            }
        });

        // Render as coverflow.
        $(function() {
            $(".coverflow").coverflow();
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

var playTracks = function(tracks) {
    prettyLog("About to add tracks to playlist and play first", tracks);
    mopidy.tracklist.clear()
        .then(function() {
            return mopidy.tracklist.add(tracks);
        })
        .done(function(tlTracks) {
            if (tlTracks && (tlTracks.length > 0)) {
                mopidy.playback.play(tlTracks[0]);
            }
        });
}

var playPrevious = function() {
    prettyLog("Play previous track");
    mopidy.playback.previous();
}

var playNext = function() {
    prettyLog("Play next track");
    mopidy.playback.next();
}

var play = function() {
    mopidy.playback.play();
}

var pause = function() {
    prettyLog("Pausing current track");
    mopidy.playback.pause();
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
