var _app;
var _mam = null
var _content = null;

var app = null;

function displayAppmark() {
  var json = app.get('appmark-to-be-edited-json');
  var a = JSON.parse(json);
  $(document.createElement('div')).html(a.title).appendTo(_content);
}

function init() {
  app = new MockApp('app',_app);
	_content = $('#page');
	_mam = new mamClient('http://www.myappmarks.com/',app,true);
	_mam.initFromAppState();
	if (!_mam.signedin) {
	  _mam.token = '1ulBoErEXedPxoTGawHnVimki9';
	  _mam.signedin = true;
	}
	displayAppmark();
}

$(document).ready(function() { init(); });