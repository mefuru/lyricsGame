;
// lyrics object constructor
var lyrics = function () {
    this.songLyrics = [];
}

// prototype functions
lyrics.prototype.updateLyrics = function (lineLyrics) {
    this.songLyrics.push(lineLyrics);
}

lyrics.prototype.clearLyrics = function () {
	// Empty array
	// http://stackoverflow.com/questions/1232040/how-to-empty-an-array-in-javascript
	this.songlyrics.length = 0;
}

// console print/query methods
lyrics.prototype.printLyrics = function () {
    this.songLyrics.forEach(function (element) {
    	console.log(element);
    });
}

lyrics.prototype.printFourRandomLines = function () {
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
	var max = this.songLyrics.length - 4;
	var min = 0;
	var x = Math.floor(Math.random() * (max - min + 1) + min);
	console.log(this.songLyrics[x]);
	console.log(this.songLyrics[x+1]);
	console.log(this.songLyrics[x+2]);
	console.log(this.songLyrics[x+3]);
}


module.exports = lyrics;