var http = require('http');
var xml2js = require('xml2js');
const PORT = 8090;
const HOST = '192.168.2.3';

// constructor
function SoundTouch(host) {
	if (! this instanceof(SoundTouch) ){
		return new SoundTouch(host);
	}
	this.host = host;
};

// get what's playing
SoundTouch.nowPlaying = function(cb){
	var options= {
		host: HOST,
		path: "/now_playing",
		port: PORT,
		method: "GET"
	};

  var str = '';
	callback = function(response) {
	  response.on('data', function (chunk) {
	    str += chunk;
	  });

	  response.on('end', function () {
	  	xml2js.parseString(str, function(err, res) {
	  		// return (`🎶Now playing: ${res.nowPlaying.track[0]} by ${ res.nowPlaying.artist[0]}`);
	  		cb(res.nowPlaying);
	  	});
	  	
	  });
	}

	var req = http.request(options, callback);
	req.end();
	return str;
};

// press a button 
SoundTouch.press = function (button, next) {
	const PRESS_PATH = "/key"
	var buttons = [
		"PLAY", "PAUSE", "STOP", "PREV_TRACK", "NEXT_TRACK",
		"THUMBS_UP", "THUMBS_DOWN", "BOOKMARK","POWER", "MUTE",
		"VOLUME_UP", "VOLUME_DOWN", "PRESET_1", "PRESET_2", "PRESET_3",
		"PRESET_4", "PRESET_5", "PRESET_6","AUX_INPUT", "SHUFFLE_OFF",
		"SHUFFLE_ON", "REPEAT_OFF", "REPEAT_ONE", "REPEAT_ALL",	"PLAY_PAUSE",
		"ADD_FAVORITE",	"REMOVE_FAVORITE"
	];
	// get the button pressed
	var pressed_btn = "";
	buttons.forEach(function(btn) {
		if(btn == button.toUpperCase()){
			pressed_btn = btn;
		}
	});

	if(pressed_btn == ""){
		next( new Error("Invalid button"));
		return;
	}

	// prepare the body
	var body = {
		press: 	 `<key state="press" sender="Gabbo">${pressed_btn}</key>`,
		release: `<key state="release" sender="Gabbo">${pressed_btn}</key>`
	};

	// press the button
	post(PRESS_PATH, body.press, function(err, res){
		if(err){
			next(err);
			return;
		}
	});

	// release the button
	post(PRESS_PATH, body.release, function(err, res){
		if(err){
			next(err);
			return;
		}
	});

	return true;
};

// send a post request
function post(path, body, next){
	var headers = {
		// TOOD: remove hardcoding of host
	host: HOST,
	path: path,
	port: PORT,
	method: "POST",
	headers: {
		'Content-Type': 'text/xml',
	}
};
	var req = http.request( headers, function( res ) {
		// console.log( res.statusCode );
		var buffer = "";
		res.on("date", function(data) {buffer = buffer + body});
		res.on ("end", function(data) {console.log(buffer);});
		res.statusCode == 200 ? next(null, 200) : next(new Error(`HTTP error $res.statusCode`));
	});
	
	req.on('error', function(e){
		console.log('problem with request: ' + e.message);
	});

	req.write(body);
	req.end();
}



module.exports = SoundTouch;