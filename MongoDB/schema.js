;
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var artistSchema = new Schema ({
    name: String,
    songs: [songsSchema],
    albums: [String],
    link: String
});

var songsSchema = new Schema ({
    name: String,
    year: Number,
    trackNumber: Number,
    album: String,
    link: String,
    artist: String,
    lyrics: [lyricsSchema]
});

var lyricsSchema = new Schema ({
    songLyrics: [String]
})

var Artist = mongoose.model("Artist", artistSchema);
var Songs = mongoose.model("Songs", songsSchema);
var Lyrics = mongoose.model("Lyrics", artistSchema);

// Export model, allow us to create new instances of 'Artists'
exports.Artist = Artist;

