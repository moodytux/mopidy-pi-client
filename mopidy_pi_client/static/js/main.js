var ControlsState = {
  NOT_STARTED: "NOT_STARTED",
  PLAY_FINISHED: "PLAY_FINISHED",
  PLAYING: "PLAYING",
  PAUSED: "PAUSED",
};

/*
 * Controller related methods to show screens.
 */

var showScreen = function(screenName, params) {
    if (screenName == 'loading') {
        prettyLog("About to show the loading screen");
        $(".screen").hide();
        $("#loading").show();
    } else if (screenName == 'album-list') {
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
    $('#album-info .track-list').empty();
    if (tracks && (tracks.length > 0)) {
        $.each(tracks, function(index, track) {
            $("<a/>")
                .addClass("list-group-item")
                .addClass("track")
                .addClass("track-" + track.track_no)
                .text(track.track_no + ". " + track.name)
                .click(function() {
                    playTracks(tracks.slice(index));
                })
                .appendTo($('#album-info .track-list'));
        });

        // Set the album info.
        var album = tracks[0].album;
        if ((typeof album.images !== "undefined") && (album.images.length > 0)) {
            $("#album-info .album-image")
                .attr("src", tracks[0].album.images[0]);
        }
        $("#album-info .album-name").text(tracks[0].album.name);
        $("#album-info .play-album").click(function() {
            playTracks(tracks);
        });

        // Set up the controls click listeners.
        $("#album-info .play").click(play);
        $("#album-info .pause").click(pause);
        $("#album-info .previous").click(playPrevious);
        $("#album-info .next").click(playNext);
        $("#album-info .back").click(function() {
            showScreen("album-list");
        });
        renderControls(ControlsState.NOT_STARTED, null, tracks);

        // Show our album-info screen, hide other screens.
        $(".screen").hide();
        $("#album-info").show();

        // Change our controls based on the playback state.
        mopidy.on("event:trackPlaybackStarted", function(tlTrack) {
            renderControls(ControlsState.PLAYING, tlTrack, tracks);
        });
        mopidy.on("event:trackPlaybackResumed", function(tlTrack) {
            renderControls(ControlsState.PLAYING, tlTrack, tracks);
        });
        mopidy.on("event:trackPlaybackPaused", function(tlTrack) {
            renderControls(ControlsState.PAUSED, tlTrack, tracks);
        });
        mopidy.on("event:trackPlaybackEnded", function(tlTrack) {
            renderControls(ControlsState.PLAY_FINISHED, tlTrack, tracks);
        });
    }
}

var renderAlbumList = function(albums) {
    prettyLog("About to render the following albums", albums);
    $('#album-list div.artwork').empty();
    if (albums != null) {
        $.each(albums, function(index, album) {
            if ((typeof album.images !== "undefined") && (album.images.length > 0)) {
                $("<img/>")
                    .addClass("cover")
                    .attr("src", album.images[0])
                    .click(function() {
                        showScreen("album-info", {albumUri: album.uri } );
                    })
                    .appendTo($("#album-list .artwork"));
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

var renderControls = function(state, tlTrack, tracks) {
    prettyLog("About to render the controls with state " + state + " for track", tlTrack);

    var trackNo = null;
    var isFirstTrack = false;
    var isLastTrack = false;
    if ((tlTrack != null) && (tlTrack.tl_track != null) && (tlTrack.tl_track.track != null)) {
        trackNo = tlTrack.tl_track.track.track_no;
        if (trackNo == 1) {
            isFirstTrack = true;
        } else if (trackNo == tracks.length) {
            isLastTrack = true;
        }
    }

    if (state == ControlsState.NOT_STARTED) {
        $("#album-info .play").show();
        $("#album-info .pause").hide();
        $("#album-info .previous").removeClass("enabled");
        $("#album-info .next").removeClass("enabled");

        $("#album-info .tracklist .track").removeClass("playing").removeClass("paused");
    } else if (state == ControlsState.PLAY_FINISHED) {
        $("#album-info .play").show();
        $("#album-info .pause").hide();
        $("#album-info .previous").removeClass("enabled");
        $("#album-info .next").removeClass("enabled");

        $("#album-info .tracklist .track").removeClass("playing").removeClass("paused");
    } else if (state == ControlsState.PLAYING) {
        $("#album-info .play").hide();
        $("#album-info .pause").show();
        var previous = $("#album-info .previous").removeClass("enabled");
        if (isFirstTrack == false) {
            previous.addClass("enabled");
        }
        var next = $("#album-info .next").removeClass("enabled");
        if (isLastTrack == false) {
            next.addClass("enabled");
        }

        $("#album-info .track-list .track").removeClass("playing").removeClass("paused");
        if (trackNo != null) {
            $("#album-info .track-list .track-" + trackNo).addClass("playing");
        }
    } else if (state == ControlsState.PAUSED) {
        $("#album-info .play").show();
        $("#album-info .pause").hide();
        var previous = $("#album-info .previous").removeClass("enabled");
        if (isFirstTrack == false) {
            previous.addClass("enabled");
        }
        var next = $("#album-info .next").removeClass("enabled");
        if (isLastTrack == false) {
            next.addClass("enabled");
        }

        $("#album-info .track-list .track").removeClass("playing").removeClass("paused");
        if (trackNo != null) {
            $("#album-info .track-list .track-" + trackNo).addClass("paused");
        }
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
    // Show the loading screen.
    showScreen("offline");

    mopidy = new Mopidy();

    // Log all events.
    mopidy.on(console.log.bind(console));

    // Setup our listener for when we are online.
    mopidy.on("state:online", function() {
        // Show the loading screen initially.
        showScreen("loading");

        // Show the album list which may take some time.
        showScreen("album-list");
    });
})
