;
var lyrics = require("./lyrics");
// songs object constructor
var song = function () {
    this.name = "";
    this.year = "";
    this.trackNumber = "";
    this.album = "";
    this.link = "";
    this.artist = "";
    this.lyrics = new lyrics;
}

// prototype functions
// append methods
song.prototype.addSongName = function (songName) {
    this.name = songName;
}

song.prototype.addYear = function (year) {
    this.year = year;
}

song.prototype.addAlbum = function (albumName) {
    this.album = albumName;
}

song.prototype.addTrackNumber = function (trackNumber) {
    this.trackNumber = trackNumber;
}

song.prototype.addLink = function (URL) {
    this.link = URL;
}

song.prototype.addArtist = function (rapper) {
    this.artist = rapper;
}

song.prototype.addLyrics = function (lyrics) {
    this.lyrics = lyrics;
}

// console print/query methods
song.prototype.printName = function () {
    console.log(this.name);
}

song.prototype.printLyrics = function () {
    this.lyrics.printLyrics();
}

song.prototype.printFourLyricsFromASong = function () {
    this.lyrics.printFourRandomLines();
}


module.exports = song;
