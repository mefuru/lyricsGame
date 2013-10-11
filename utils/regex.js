;

function obtainAlbumTitle(album) {
    album = album.replace(/^\s.\s*/, "");
    album = album.replace(/\s*.{6}\s*$/, "");
    return album;
};

function obtainSongTitle(song) {
	song = song.replace(/^\s.\s*/, "");
    song = song.replace(/\s*.{6}\s*$/, "");
    song = song.replace(/\\/, "");
    return song;
};

// export contructor function
module.exports.obtainAlbumTitle = obtainAlbumTitle;
module.exports.obtainSongTitle = obtainSongTitle;