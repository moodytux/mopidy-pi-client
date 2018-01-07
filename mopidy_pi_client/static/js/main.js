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
    } else if (screenName == 'album-and-category-list') {
        prettyLog("About to send the user to the album list screen");
        getAlbumTrackData()
            .then(parseAlbumData)
            .done(renderAlbumAndCategoryList);

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

    // Reinitialise the info screen.
    $('#album-info .track-list').empty();
    $("#album-info .album-image .play-album-control .icon").show();
    $("#album-info .album-image .play-album-control .circle").removeClass("disappear");

    if (tracks && (tracks.length > 0)) {
        $.each(tracks, function(index, track) {
            $("<a/>")
                .addClass("list-group-item")
                .addClass("track")
                .addClass("track-" + track.track_no)
                .click(function() {
                    playTracks(tracks.slice(index));
                })
                .append("<div class='indicator' />")
                .append("<div class='title'>" + track.track_no + ". " + track.name + "</div>")
                .appendTo($('#album-info .track-list'));
        });

        // Set the album info.
        var album = tracks[0].album;
        if ((typeof album.images !== "undefined") && (album.images.length > 0)) {
            $("#album-info .album-image")
                .css("background-image", "url(" + tracks[0].album.images[0] + ")");
        }
        $("#album-info .album-image .play-album-control").unbind("click").click(function() {
            $("#album-info .album-image .play-album-control .icon").fadeOut();
            playTracks(tracks);
            $("#album-info .album-image .play-album-control .circle").addClass("disappear");
        });

        renderControls(ControlsState.NOT_STARTED, null, tracks);

        // Show our album-info screen, hide other screens.
        $(".screen").hide();
        $("#album-info").show();

        // Change our controls based on the playback state.
        mopidy.off("event:trackPlaybackStarted");
        mopidy.on("event:trackPlaybackStarted", function(tlTrack) {
            renderControls(ControlsState.PLAYING, tlTrack, tracks);
        });
        mopidy.off("event:trackPlaybackResumed");
        mopidy.on("event:trackPlaybackResumed", function(tlTrack) {
            renderControls(ControlsState.PLAYING, tlTrack, tracks);
        });
        mopidy.off("event:trackPlaybackPaused");
        mopidy.on("event:trackPlaybackPaused", function(tlTrack) {
            renderControls(ControlsState.PAUSED, tlTrack, tracks);
        });
        mopidy.off("event:trackPlaybackEnded");
        mopidy.on("event:trackPlaybackEnded", function(tlTrack) {
            renderControls(ControlsState.PLAY_FINISHED, tlTrack, tracks);
        });
    }
}

var renderAlbumAndCategoryList = function(albums) {
    prettyLog("About to render the following albums along with their categories", albums);

    // Show our album list screen, hide other screens.
    $(".screen").hide();
    $("#album-and-category-list").show();

    // Fill our coverflow if we haven't done so already.
    if (typeof initialisedCoverflow === "undefined") {
        renderCoverList(albums);
        //renderCategoryList(albums);

        initialisedCoverflow = true;
    }
}

var renderCoverList = function(albums) {
    // Reinitialise the list screen.
    $('#album-and-category-list div.coverflow').replaceWith($("<div/>").addClass("coverflow"));

    // Sort the album data by artist and add to coverflow.
    albums.sort(sortAlbumDataByArtist);
    if (albums != null) {
        $.each(albums, function(index, album) {
            if (isAlbumDataValid(album)) {
                $("<div/>")
                    .css("background-image", "url(" + album.images[0] + ")")
                    .addClass("cover")
                    .attr("data-piclient-albumname", album.name)
                    .attr("data-piclient-albumartist", album.artists[0].name)
                    .click(function() {
                        if($(this).hasClass('ui-state-active')) {
                            showScreen("album-info", {albumUri: album.uri } );
                        }
                    })
                    .appendTo($("#album-and-category-list div.coverflow"));
            }
        });
    }

    // Render as coverflow. Do this after showing the list section to fix an issue with coverflow so
    // the display none has been removed.
    $(".coverflow").coverflow({
        select: function(event, ui) {
            console.log(ui);
        }
    });
}

var renderCategoryList = function(album) {
    // Reinitialise the list screen.
    $('#album-and-category-list div.categoryflow').replaceWith($("<div/>").addClass("categoryflow"));

    // Sort the album data by genre and add to category flow.
    albums.sort(sortAlbumDataByGenre);
    if (albums != null) {
        $.each(albums, function(index, album) {
            if (isAlbumDataValid(album)) {
                // If this is the first category, setup our list.
                if (typeof categorySeenList === "undefined") {
                    categorySeenList = [];
                }

                // If this is the first time we've seen this category, add it to our seen list and
                // all to the category flow.
                if (categorySeenList.indexOf(album.genre) == -1) {
                    categorySeenList.push(album.genre);

                    prettyLog("Adding genre", album.genre);
                    $("<div/>")
                        .addClass("category")
                        .text(album.genre)
                        .click(function() {
                            if($(this).hasClass('ui-state-active')) {
                                console.log("Just clicked " + album.genre);
                            }
                        })
                        .appendTo($("#album-and-category-list div.categoryflow"));
                }
            }
        });
    }

    // Render as coverflow. Do this after showing the list section to fix an issue with coverflow so
    // the display none has been removed.
    $(".categoryflow").coverflow({
        select: function(event, ui) {
            console.log(ui);
        }
    });
}

var renderControls = function(state, tlTrack, tracks) {
    prettyLog("About to render the controls with state " + state + " for track", tlTrack);

    if (typeof initialisedClickListeners === "undefined") {
        // Set up the controls click listeners.
        $("#album-info .controls .play").click(function() {
            if ($(this).hasClass("enabled")) {
                play();
            }
        });
        $("#album-info .controls .pause").click(function() {
            if ($(this).hasClass("enabled")) {
                pause();
            }
        });
        $("#album-info .controls .previous").click(function() {
            if ($(this).hasClass("enabled")) {
                playPrevious();
            }
        });
        $("#album-info .controls .next").click(function() {
            if ($(this).hasClass("enabled")) {
                playNext();
            }
        });
        $("#album-info .controls .back").click(function() {
            stop();
            showScreen("album-and-category-list");
        });

        // Flag that we are all setup with click listeners.
        initialisedClickListeners = true;
    }

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

    // Reset the state to disabled.
    $("#album-info .controls .play").removeClass("enabled");
    $("#album-info .controls .pause").removeClass("enabled");
    $("#album-info .controls .previous").removeClass("enabled");
    $("#album-info .controls .next").removeClass("enabled");
    $("#album-info .track-list .track").removeClass("playing").removeClass("paused");

    if (state == ControlsState.NOT_STARTED) {
        $("#album-info .controls .play").show();
        $("#album-info .controls .pause").hide();
    } else if (state == ControlsState.PLAY_FINISHED) {
        $("#album-info .controls .play").show();
        $("#album-info .controls .pause").hide();
    } else if (state == ControlsState.PLAYING) {
        $("#album-info .controls .play").hide();
        $("#album-info .controls .pause").addClass("enabled").show();
        var previous = $("#album-info .controls .previous").removeClass("enabled");
        if (isFirstTrack == false) {
            previous.addClass("enabled");
        }
        var next = $("#album-info .controls .next").removeClass("enabled");
        if (isLastTrack == false) {
            next.addClass("enabled");
        }

        if (trackNo != null) {
            $("#album-info .track-list .track-" + trackNo).addClass("playing");
        }
    } else if (state == ControlsState.PAUSED) {
        $("#album-info .controls .play").addClass("enabled").show();
        $("#album-info .controls .pause").hide();
        var previous = $("#album-info .controls .previous").removeClass("enabled");
        if (isFirstTrack == false) {
            previous.addClass("enabled");
        }
        var next = $("#album-info .controls .next").removeClass("enabled");
        if (isLastTrack == false) {
            next.addClass("enabled");
        }

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

var stop = function() {
    prettyLog("Stopping playback");
    mopidy.playback.stop();
    mopidy.tracklist.clear();
}

var isAlbumDataValid = function(album) {
    var isValid = true;

    if ((typeof(album.images) === "undefined") || (album.images.length < 1)) {
        prettyLog("Missing album image for album", album);
        isValid = false;
    }

    if ((typeof(album.artists) === "undefined")) {
        prettyLog("Missing artists for album", album);
        isValid = false;
    }

    return isValid;
}

var parseAlbumData = function(albumTrackData) {
    var albumData = [];
    if (albumTrackData) {
        $.each(albumTrackData, function(index, trackObjs) {
            if (trackObjs.length > 0) {
                var album = trackObjs[0].album;
//todo                album.genre = trackObjs[0].genre;
                albumData.push(album);
            }
        });
    }

    return albumData;
}

var sortAlbumDataByArtist = function(left, right) {
    prettyLog("Sorting album data by artist");

    var SortOrder = {
      LEFT_FIRST: -1,
      RIGHT_FIRST: 1,
      SAME: 0,
    };

    if (typeof(left.artists) === "undefined") {
        result = SortOrder.RIGHT_FIRST;
    } else if (typeof(right.artists) === "undefined") {
        result = SortOrder.LEFT_FIRST;
    } else {
        var leftName = left.artists[0].name.toLowerCase();
        var rightName = right.artists[0].name.toLowerCase();

        var result;
        if (leftName < rightName) {
            result = SortOrder.LEFT_FIRST;
        } else if (leftName > rightName) {
            result = SortOrder.RIGHT_FIRST;
        } else {
            result = SortOrder.SAME;
        }
    }

    return result;
}

var sortAlbumDataByGenre = function(left, right) {
    prettyLog("Sorting album data by genre");

    var SortOrder = {
      LEFT_FIRST: -1,
      RIGHT_FIRST: 1,
      SAME: 0,
    };

    if (typeof(left.genre) === "undefined") {
        result = SortOrder.RIGHT_FIRST;
    } else if (typeof(right.genre) === "undefined") {
        result = SortOrder.LEFT_FIRST;
    } else {
        var leftName = left.genre.toLowerCase();
        var rightName = right.genre.toLowerCase();

        var result;
        if (leftName < rightName) {
            result = SortOrder.LEFT_FIRST;
        } else if (leftName > rightName) {
            result = SortOrder.RIGHT_FIRST;
        } else {
            result = SortOrder.SAME;
        }
    }

    return result;
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
        showScreen("album-and-category-list");
    });
})
