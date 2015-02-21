var _app;
var _isloading = false;
var _content = null;

function log(msg) {
	console.log(msg);
}

function logUrl(s,url) {
	console.log(s+' '+url);
}


function downloadURL3(url,cb) {
	log('downloadURL3('+url+')');
	var xhr = new XMLHttpRequest();
	xhr.open("GET",url,true);
	xhr.onreadystatechange = function() {
  		if (xhr.readyState == 4) {
    		// JSON.parse does not evaluate the attacker's scripts.
    		//console.log('got response '+xhr.responseText);
    		var resp = JSON.parse(xhr.responseText);
    		log('about to call cb');
    		cb(resp);
  		}
	}
	xhr.send();
}

function loading(msg) {
	if (msg) log('loading('+msg+')');
	var hdr = $('#header-right');
	var text = $('#loading-text');
	if (msg) {
		if (!_isloading) {
			text.css('display','block');
			hdr.html('');
			_isloading = true;
		}
		text.html(msg);
	}
	else {
		if (_isloading) {
			text.css('display','none').html('');
			_isloading = false;
		}
	}
}


function getContent() {
	if (!_content) console.log('_content not set');
	return _content;
}

function doAlert(msg) {
  alert(msg);
}

function MockApp() {
  console.log('new MockApp()');
}

MockApp.prototype.set = function(name,value) {
  console.log('mockapp.set('+name+','+value+')');
}

MockApp.prototype.get = function(name) {
  console.log('mockapp.get('+name+')');
  return null;
}

MockApp.prototype.pageLoaded = function() {
  console.log('mockapp.pageLoaded()');
}

MockApp.prototype.newPage = function(name) {
  console.log('mockapp.newPage('+name+')');
}

MockApp.prototype.finishPage = function() {
  console.log('mockapp.finishPage()');
}

function initApp() {
  if (_app) console.log('_app already initialised'); else _app = new MockApp();
}

function signout() {
  console.log('signout()');
  _mam.signout(function() {
    _app.finishPage();
  });
}

function addHTML() {
  var c = getContent();
  $(document.createElement('div')).html('This is where the appmarks go').appendTo(c);
  var div = $(document.createElement('div'));
  div.html('<a href="javascript:signout();">Sign Out</a>');
  div.appendTo(c);
}

function init() {
  initApp();
	_content = $('#page');
	_mam = new mamClient('http://www.myappmarks.com/',_app,true);
	_mam.initFromAppState();
	addHTML();
  _app.pageLoaded();
}

$(document).ready(function() {
	init();
});
