;
// songs object constructor
var song = function (albumTitle, songURL, year) {
    this.name = "";
    this.year = year;
    this.trackNumber = "";
    this.album = albumTitle;
    this.link = songURL;
    this.artist = "";
    this.lyrics = [];
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
    console.log(this.lyrics);
}

song.prototype.printFourLyricsFromASong = function () {
    var max = this.lyrics.length - 4;
        var min = 0;
        var x = Math.floor(Math.random() * (max - min + 1) + min);
        console.log(this.lyrics[x]);
        console.log(this.lyrics[x+1]);
        console.log(this.lyrics[x+2]);
        console.log(this.lyrics[x+3]);
}


module.exports = song;