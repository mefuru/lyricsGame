var artist = require("./modules/artist"),
	song = require("./modules/songs"),
	utilsRegex = require("./utils/regex"),
	cheerio = require("cheerio"),
	request = require("request"),
	util = require("util"),
	async = require("async"),
	Artist = require("./MongoDB/schema").Artist,
	_ = require("underscore"),
	mongoose = require("mongoose");

// https://github.com/MatthewMueller/cheerio
// https://github.com/mikeal/request
// http://nodejs.org/api/util.html
// http://underscorejs.org/
// https://github.com/caolan/async
// http://mongoosejs.com/docs/guide.html

var geniusQuery = {
    albumURLs: function(artistName, callback) {
        var artistURL = "http://rapgenius.com/artists/";
        request(artistURL + artistName, function (error, response, body) {
            if (error || response.statusCode !== 200) {
                callback("Artist not found");
            } else {
	              var $ = cheerio.load(body);
                callback(null, $(".album_list li a").map(function() {
                    return this.attr("href");
                }));
            }
        });
    },

    albumData: function(baseAlbumURL, callback) {
		    request(baseAlbumURL, function (error, response, body) {
            if (error || response.statusCode !== 200) {
                callback(error);
            } else {
			          var $ = cheerio.load(body);
                var title = utilsRegex
                    .obtainAlbumTitle($("h1.name a.artist")["0"]["next"]["data"]);

			          // Extract album year from albumTitle if present
				        var year = title.match(/\(\d{4}\)/);
                callback(null, {
                    title: title,
                    year: year === null ? -1 : year[0].replace(/(\(|\))/g,""),
                    songURLs: $(".song_list .song_link").map(function() {
                        return this.attr("href");
                    })
                });
            }
        });
    },

    songData: function(songURL, callback) {
		    request(songURL, function (error, response, body) {
			      if (error !== null || response.statusCode !== 200)
                throw "Couldn't get song: " + songURL;

			      var $ = cheerio.load(body);
            var title = utilsRegex.obtainSongTitle($("h1.song_title a")["0"]["next"]["data"])
            console.log("Got song: ", title);
            var lyricsText = $(".lyrics_container .lyrics p").text();
            callback(null, {
			          title: title,
				        trackNumber: $(".album_title_and_track_number").text().trim().split(" ")[1],
				        lyrics: lyricsText.split("\n"),
                URL: songURL
            });
        });
    }
};

// Process artist page

var getAlbums = function (artistName, callback) {
    geniusQuery.albumURLs(artistName, function(error, albumURLs) {
        async.parallel(_.map(albumURLs, function(albumURL) {
	          return function (parallelCallback) {
                console.log("processing album", albumURL)
                geniusQuery.albumData(homeURL + albumURL, parallelCallback);
            };
        }), callback);
    });
};

var getSongsForAllAlbums = function(albums, callback) {
    async.parallel(_.map(albums, function(album) {
        return function(parallelCallback) {
            getAlbumSongs(album, album.songURLs, parallelCallback);
        };
    }), function (errors, songs) {
		    callback(errors, songs);
    });
};

var getAlbumSongs = function(album, songURLs, callback) {
    async.parallel(_.map(songURLs, function(x) {
        return function(parallelCallback) {
            geniusQuery.songData(homeURL + x, function(error, song) {
                song.album = album;
                parallelCallback(error, song);
            });
        };
    }), function (errors, songs) {
		    callback(errors, songs);
    });
};

var songDataToTrack = function(songData) {
    var track = new song(songData.album.title, songData.songURL, songData.album.year);
		track.addSongName(songData.title);
		track.addTrackNumber(songData.trackNumber);
		track.addLyrics(songData.lyrics);
    return track;
};

var saveArtist = function(rapper, callback) {
		new Artist(rapper).save(function (err) {
        if (err !== null) throw "Error saving " + rapper.name + " into DB: " + err;
        callback();
		});
};

// Connect to DB
mongoose.connect("mongodb://localhost/rapgenius");
var homeURL = "http://rapgenius.com";
var rapper = new artist(process.argv[2] || "Skinnyman");
getAlbums(rapper.name, function(error, albums) {
    _.map(albums, function(album) { rapper.addAlbum(album.title) });
    getSongsForAllAlbums(albums, function(error, songsData) {
        _.map(_.map(_.flatten(songsData), songDataToTrack), function(track) {
            rapper.addSong(track);
        });

        saveArtist(rapper, function() {
            process.exit(0);
        });
    });
});
