;
var util = require('util');

// constructor
var artist = function (name) {
    this.name = name;
    this.songs = [];
    this.albums = [];
    this.link = "";
}

// prototype functions
// append methods
artist.prototype.addLink = function (URL) {
    this.link = URL;
}

artist.prototype.updateName = function (nameFromURL) {
    this.name = nameFromURL;
}

artist.prototype.addSong = function (song) {
    this.songs.push(song);
}

artist.prototype.addAlbum = function (albumName) {
    this.albums.push(albumName);
}

// console print/query methods
artist.prototype.printArtistName = function () {
    console.log(this.name);
}

artist.prototype.printSongs = function () {
    this.songs.forEach(function(element) {
        element.printName();
    });
}

artist.prototype.printAlbums = function () {
    this.albums.forEach(function(element) {
        console.log(element);
    });
}

artist.prototype.printLink = function () {
    console.log(this.link);
}

artist.prototype.printLyrics = function () {
    this.songs.forEach(function (element) {
        element.printLyrics();
    });
}

artist.prototype.printListOfSongs = function () {
    this.songs.forEach(function (element) {
        element.printName();
    });
}

artist.prototype.printFourLyricsFromARandomSong = function () {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
    var max = this.songs.length - 1;
    var min = 0;
    var x = Math.floor(Math.random() * (max - min + 1) + min);
    this.songs[x].printFourLyricsFromASong();
}

artist.prototype.printAllInfo = function () {
    console.log(util.inspect(this, { showHidden: false, depth: 5 }));
}

module.exports = artist;