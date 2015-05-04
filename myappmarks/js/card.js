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
		var a = app.get('appmark-to-be-edited-json');
	  var div = $(document.createElement('div'));
	  div.addClass('appmark').addClass('card').attr('id','appmark-'+n).addClass('enable-touch').attr('touch-class','appmark');
	  var card = new AppmarkCard(n,a,div,false);
	  card.drawContents();
	  card.div.appendTo(getContent());
}

function doSignout() {
  _mam.signout(function() { 
      getContent().empty();
      app.store('mam_token',null);
      app.endPage('signout');
  });
}

function onAction(action) {
  if (action == 'do_signout') {
    app.dialog('Do you really want to signout?','Yes','No',function(yes) { if (yes) doSignout(); });
  }  
}

function init() {
  app = new Awac('app');
  app.setOnAction(onAction);
  app.unlockNavDrawer();
	_content = $('#page');
	_mam = new mamClient('http://www.myappmarks.com/',app,true);
  _mam.initFromAppState();
  displayCard();
	app.startPage();
}

$(document).ready(function() { init(); });
