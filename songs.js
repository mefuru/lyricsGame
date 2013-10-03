;
// constructor
var song = function () {
    this.name = "";
    this.year = "";
    this.trackNumber = "";
    this.album = "";
};

// prototype functions
song.prototype.addName = function (songName) {
    this.name = songName;
};

song.prototype.addYear = function (year) {
    this.year = year;
};

song.prototype.addAlbum = function (albumName) {
    this.album = albumName;
};

song.prototype.addTrackItem = function (trackNumber) {
    this.trackNumber = trackNumber;
};

// export constructor function
module.exports = song;
