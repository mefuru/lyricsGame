;
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// var lyricsSchema = new Schema ({
//     lyrics = [words: [String]]
// })

// var songsSchema = new Schema ({
//     name: String,
//     year: Number,
//     trackNumber: Number,
//     album: String,
//     link: String,
//     artist: String,
//     lyrics: lyricsSchema
// });

var artistSchema = new Schema ({
    name: String,
    songs: [{name: String, year: Number, trackNumber: Number, album: String, link: String, artist: String}],
    albums: [String],
    link: String
});

var Artist = mongoose.model("Artist", artistSchema);
// var Songs = mongoose.model("Artist", artistSchema);
// var Lyrics = mongoose.model("Artist", artistSchema);

// Export model, allow us to create new instances of 'Artists'
module.exports = Artist;

