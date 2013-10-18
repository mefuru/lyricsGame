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

// process song(s)
var addSongs = function (year, albumTitle, $, callback) {
	  var processSongsTasks = [];
    $(".song_list .song_link").each(function() {
		    var songURL = (homeURL + this.attr("href"));
		    var track = new song(albumTitle, songURL, year);
		    var task = buildfn2(songURL, track);
		    processSongsTasks.push(task);
    });
    async.parallel(processSongsTasks, function (errors, results) {
		    console.log("All songs in " + albumTitle + " processed", errors, results);
		    callback(errors, results);
    });
};

var buildfn2 = function (songURL, track) {
	  // Closure invoked w/ async.parallel
	  var processSong = function (callback) {
		    console.log('processing song', songURL);
		    request(songURL, function (error, response, body) {
			      if (!error && response.statusCode == 200) {
			          var $ = cheerio.load(body);
			          var songTitle = utilsRegex.obtainSongTitle($("h1.song_title a")["0"]["next"]["data"]);
				        var trackNumber = $(".album_title_and_track_number").text().trim().split(" ")[1];
				        var lyricsText = $(".lyrics_container .lyrics p").text();
				        var songlyrics = lyricsText.split("\n");
				        track.addSongName(songTitle);
				        track.addTrackNumber(trackNumber);
				        track.addArtist(rapper.name);
				        track.addLyrics(songlyrics);
				        rapper.addSong(track);
				        callback(null);
			      } else {
				        console.log("Error retrieveing song details");
				        callback(error);
			      }
		    });
	  };
	  return processSong;
};

				// rapper.printFourLyricsFromARandomSong();

var getSongsForAllAlbums = function(albums, callback) {
    async.parallel(_.map(albums, function(album) {
        return function(parallelCallback) {
            getAlbumSongs(album.title, album.songURLs, parallelCallback);
        };
    }), function (errors, songs) {
		    callback(errors, songs);
    });
};

var getAlbumSongs = function(title, songURLs, callback) {
    async.parallel(_.map(songURLs, function(x) {
        return function(parallelCallback) {
            geniusQuery.songData(homeURL + x, function(error, song) {
                song.albumTitle = title;
                parallelCallback(error, song);
            });
        };
    }), function (errors, songs) {
		    callback(errors, songs);
    });
};

// Connect to DB
mongoose.connect("mongodb://localhost/rapgenius");
var homeURL = "http://rapgenius.com";
var rapper = new artist(process.argv[2] || "Skinnyman");
getAlbums(rapper.name, function(error, albums) {
    getSongsForAllAlbums(albums, function(error, songs) {
        console.log(songs)
    });
});
