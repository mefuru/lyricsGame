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
                error = "Artist not found";
                callback(error);
            } else {
	              var $ = cheerio.load(body);
                callback(null, $(".album_list li a").map(function() {
                    return $(this).attr("href");
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
			          if (year===null) {
					          year = -1;
			          } else {
					          year = year[0].replace(/(\(|\))/g,"");
			          }

                callback(null, {
                    title: title,
                    year: year
                });
            }
        });
    }

    // artist: function(artistName, callback) {
    //         url: $("[property='og:url']").attr("content"),
    //         name: $("[property='og:title']").attr("content")
    // }
};

// Process artist page

var addAlbums = function (rapper, albumURLs) {
	  // For each album, create but don't execute an instance of the processAlbum function - save into an array
    var processAlbumsTasks = [];
    albumURLs.forEach(function(albumURL) {
		    var baseAlbumURL = (homeURL + albumURL);
		    var task = buildfn(baseAlbumURL);
		    processAlbumsTasks.push(task);
    });

    // Have an anonymous callback funtion that saves the data into rapgenius DB
    async.parallel(processAlbumsTasks, function (errors, results) {
   	    // https://github.com/caolan/async#parallel
		    console.log('all albums processed', errors, results);
		    // New Mongo document based on a Mongoose model
		    var rapperMongoDocument = new Artist(rapper);
		    rapperMongoDocument.save(function (err) {
            if (err !== null) throw 'Error when saving '+ rapper.name +' into the DB: ' + err;

				    console.log("Data for " + rapper.name + " successfully saved into DB");
				    rapper.printFourLyricsFromARandomSong();
				    process.exit(0);
		    });
    })
};

var buildfn = function(baseAlbumURL) {
	  // Closure invoked w/ async.parallel
	  var processAlbum = function (callback) {
		    console.log("processing album", baseAlbumURL);
		    request(baseAlbumURL, function (error, response, body) {
			      console.log("album processed", baseAlbumURL);
			      if (!error && response.statusCode == 200) {
			          var $ = cheerio.load(body);
                var albumTitle = utilsRegex
                                .obtainAlbumTitle($("h1.name a.artist")["0"]["next"]["data"]);

					      rapper.addAlbum(albumTitle);

			          // Extract album year from albumTitle if present
				        var year = albumTitle.match(/\(\d{4}\)/);
			          if (year===null) {
					          year = -1;
			          } else {
					          year = year[0].replace(/(\(|\))/g,"");
			          }
			          addSongs(year, albumTitle, $, function (err) {
					          callback(err);
			          });
			      } else {
			          console.log("Error in retrieveing album: " + error);
			          callback(error);
			      }
		    });
	  };
	  return processAlbum;
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

// Connect to DB
mongoose.connect("mongodb://localhost/rapgenius");
var homeURL = "http://rapgenius.com";
var rapper = new artist(process.argv[2] || "Skinnyman");
geniusQuery.albumURLs(rapper.name, function(error, albumURLs) {
    addAlbums(rapper, albumURLs);
});
