var artist = require("./modules/artist"),
cheerio = require('cheerio')
request = require("request");

// https://github.com/MatthewMueller/cheerio
// https://github.com/mikeal/request

console.log(process.argv);
// Set 2pac as default if no name passed via cmd line
var rapper = new artist(process.argv[2] ||"2pac");
var baseURL = "http://rapgenius.com/artists/";
var URL = "";
var baseAlbumURL = "http://rapgenius.com";
request(baseURL+rapper.name, function (error, response, body) {
    if (!error && response.statusCode == 200) {
	updateArtist(body);
    }
});

var updateArtist = function (body) {
    var $ = cheerio.load(body);
    URL = $("[property='og:url']").attr('content');
    rapper.add_link(URL);
    rapper.print_link();
    var nameFromURL = $("[property='og:title']").attr('content');
    rapper.update_name(nameFromURL);
    rapper.print_name();
    updateSongs(body);
};

var updateSongs = function (body) {
    var $ = cheerio.load(body);
    // .album_list -> iterate over children -> take href from <a> tag link
    var baseURL = "http://rapgenius.com";
    var baseAlbumURL = baseURL + $(".album_list li a").attr("href");
    request(baseAlbumURL, function (error, response, body) {
	if (!error && response.statusCode == 200) {
	    var $ = cheerio.load(body);
	    var albumYear = "";
	    var albumTitle = $("h1.name a.artist");
	    console.log(albumTitle);
	} else {
	    console.log("Error in retrieveing album: " + error);
	}
    });

	    // use regex to get year
	    // use regex to get album name
	    // if there is no class has_track_order, there's only one song - ignore
	    // iterate through songs
};
