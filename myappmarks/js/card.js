function log(msg) {
	console.log(msg);
}

function logUrl(s,url) {
	console.log(s+' '+url);
}

function getContent() {
	if (!_content) console.log('_content not set');
	return _content;
}

function displayCard() {
  	var n = app.get('appmark-to-be-edited-index');
  	if (n === null) n = 0;
  	var json = app.get('appmark-to-be-edited-json');
		var a = new mamAppMark(JSON.parse(json));
	  var div = $(document.createElement('div'));
	  div.addClass('appmark').addClass('card').attr('id','appmark-'+n).addClass('enable-touch').attr('touch-class','appmark');
	  var card = new AppmarkCard(n,a,div,false);
	  card.drawContents();
	  card.div.appendTo(getContent());
}

function onAction(action) {
  if (action == 'cancel') {
    app.endPage();
  }
  else if (action == 'ok') {
    
  }
}

function init() {
  app = new Awac('app');
  app.setOnAction(onAction);
  app.addActionBarItem({'label':'OK','action':'ok'});
  app.addActionBarItem({'label':'Cancel','action':'cancel'});
	_content = $('#page');
	_mam = new mamClient('http://www.myappmarks.com/',app,true);
  _mam.initFromAppState();
  displayCard();
	app.startPage();
}

$(document).ready(function() { init(); });
