function getContent() {
	if (!_content) console.log('_content not set');
	return _content;
}

function displayCard() {
  	var n = app.get('appmark-to-be-edited-index');
		var appmark = app.get('appmark-to-be-edited-json');
	  var html = 'displaying appmark '+n;
	  getContent().html(html);
}

function init() {
  app = new Awac('app');
	_content = $('#page');
	_mam = new mamClient('http://www.myappmarks.com/',app,true);
  _mam.initFromAppState();
  displayCard();
	app.startPage();
}

$(document).ready(function() { init(); });
