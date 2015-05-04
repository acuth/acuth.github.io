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
