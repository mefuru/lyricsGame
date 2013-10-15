var artist = require("./modules/artist"),
	song = require("./modules/songs"),
	lyrics = require("./modules/lyrics"),
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

// Connect to DB
mongoose.connect("mongodb://localhost/rapgenius");

var artistURL = "http://rapgenius.com/artists/";
var homeURL = "http://rapgenius.com";
var rapper = new artist(process.argv[2] || "Skinnyman");

// Search for artist
request(artistURL+rapper.name, function (error, response, body) {
    if (!error && response.statusCode == 200) {
		addAlbums(body);
    } else {
		console.log("Artist not found on Rap Genius");
    }
});

// Process artist page
var addAlbums = function (body) {
	// Update rapper class with URL and name
	var $ = cheerio.load(body);
    var URL = $("[property='og:url']").attr("content");
    var nameFromURL = $("[property='og:title']").attr("content");
    rapper.addLink(URL);
    rapper.updateName(nameFromURL);

	// For each album, create but don't execute an instance of the processAlbum function - save into an array
    var processAlbumsTasks = [];
    $(".album_list li a").each(function() {
		var baseAlbumURL = (homeURL + this.attr("href"));
		var task = async.apply(processAlbum, baseAlbumURL);
		processAlbumsTasks.push(task);
    });

    // Run all funtions saved into task array in parallel
    // Have an anonymous callback funtion that saves the data into rapgenius DB
    async.parallel(processAlbumsTasks, function (errors, results) {
		console.log('all albums processed', errors, results);
		// New Mongo document based on a Mongoose model
		var rapperMongoDocument = new Artist(rapper);
		rapperMongoDocument.save(function (err) {
			if(err===null) {
				console.log("Data for " + rapper.name + " successfully saved into DB");
				process.exit(1);
			} else {
				console.log('Following error occured when saving '+ rapper.name +' into the DB: ' + err);
				process.exit(2);
			}
		});
    })
};

// Process album page(s). Callbacks required for async.parallel to work
var processAlbum = function (baseAlbumURL, callback) {
	// https://github.com/caolan/async#parallel
	console.log("processing album", baseAlbumURL);
	request(baseAlbumURL, function (error, response, body) {
		console.log("album processed", baseAlbumURL);
		if (!error && response.statusCode == 200) {
		    var $ = cheerio.load(body);
		    var albumTitle = utilsRegex.obtainAlbumTitle($("h1.name a.artist")["0"]["next"]["data"]);
			if(_.indexOf(rapper.albums, albumTitle) == -1) {
				rapper.addAlbum(albumTitle);
		    }
		    // Extract album year from albumTitle if present
			var year = albumTitle.match(/\(\d{4}\)/);
		    if (year===null) {
				year = -1;
		    } else {
				year = year[0].replace(/(\(|\))/g,"");
		    }
		    // *** Call the callback once the addSongs function is complete ***
		    addSongs(year, albumTitle, $, function (err) {
				callback(err);
		    });
		} else {
		    console.log("Error in retrieveing album: " + error);
		    callback(error);
		}
	});
};

// process song(s)
var addSongs = function (year, albumTitle, $, callback) {
	var processSongsTasks = [];
    $(".song_list .song_link").each(function() {
		var songURL = (homeURL + this.attr("href"));
		var track = new song(albumTitle, songURL, year);
		var songlyrics = new lyrics();
		var task = async.apply(processSong, songURL, track, songlyrics);
		processSongsTasks.push(task);
    });
    async.parallel(processSongsTasks, function (errors, results) {
		console.log("All songs in " + albumTitle + " processed", errors, results);
		callback(errors, results);
    });
};

// Create process song function and then copy what was done above
var processSong = function (songURL, track, songlyrics, callback) {
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