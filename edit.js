var _app;
var _mam = null
var _content = null;

var app = null;

function displayAppmark() {
  var json = JSON.parse(app.get('appmark-to-be-edited-json'));
  var a = new mamAppmark(json);
  var div = $(document.createElement('div'));
	div.addClass('appmark').addClass('card').attr('id','appmark-0').addClass('enable-touch').attr('touch-class','appmark');
	var card = new AppmarkCard(0,a,div,false);
	card.drawContents();
	card.div.appendTo(_content);
  app.pageLoaded();
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