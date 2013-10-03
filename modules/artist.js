;
// constructor
var artist = function (name) {
    this.name = name;
    this.songs = [];
    this.link = "";
    
};

// prototype functions
artist.prototype.print_name = function () {
    console.log(this.name);
};

artist.prototype.print_tracks = function () {
    for (track in this.tracks) {
	console.log(track);
    }
};

artist.prototype.print_link = function () {
    console.log(this.link);
};

artist.prototype.add_link = function (URL) {
    this.link = URL;
}

artist.prototype.update_name = function (nameFromURL) {
    this.name = nameFromURL;
}

// export contructor function
module.exports = artist;
