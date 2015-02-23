var _app;
var app = null;
var _isloading = false;
var _content = null;
//var _displayLink = false;
var _appTypeConstraint = null;
var _favConstraint = null;
var _sharedConstraint = null;
var _qConstraint = null;
var _cards = [];
var _appmark_types = null;
var _has_more = false;
var _showingAppmarks = true;
var _showingSearch = false;
var _showingFilter = false;

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

function log(msg) {
	console.log(msg);
}

function logUrl(s,url) {
	console.log(s+' '+url);
}

function displayURL(url) {
	console.log('displayURL('+url+')');
	window.open(url);
}


function getAppmarkCard(n,a,shared) {
	var div = $(document.createElement('div'));
	div.addClass('appmark').addClass('card').attr('id','appmark-'+n).addClass('enable-touch').attr('touch-class','appmark');
	var card = new AppmarkCard(n,a,div,shared);
	//console.log('got card');
	card.drawContents();
	return card;
}

function gotConstraints() {
	return _favConstraint || _sharedConstraint || _appTypeConstraint || _qConstraint;
}

function displayAppmarksPage(offset,timestamp) {
	var content = getContent();
	if (_cards.length == 0) {
		var h = '<div class="card"><div class="blurb">';
		if (gotConstraints()) {
			h += 'Sorry, but you don\'t appear to have any '+getConstraintsStr()+'. You can see <i>all</i> your appmarks by clicking on <a id="show-all">Show all</a>';
		}
		else {
			h += 'Sorry, but you don\'t appear to have any appmarks at all!';
		}
		h += '</div></div>';
		content.html(h);
		if (gotConstraints()) {
			$('#show-all').click(function(event) { showAll(); });
		}
	}
	else {
		if (timestamp && _hasMoreRow) {
			_hasMoreRow.remove();
			_hasMoreRow = null;
		}
		if (!timestamp) {
			content.empty();
		}
		for (var i=offset;i<_cards.length;i++) {
			_cards[i].div.appendTo(content);
			_cards[i].addControlEventHandlers();
		}
		if (_hasMore) {
			var moreDiv = $(document.createElement('div')).addClass('full-width-btn').attr('id','has-more-div').html('more');
			moreDiv.click(function(event) {
				moreDiv.html('loading...');
				displayAppmarks(_cards[_cards.length-1].a.modify_date.getTime());
			});
			moreDiv.appendTo(content);
			_hasMoreRow = moreDiv;
		}
	}

	var soDiv = $(document.createElement('div')).addClass('full-width-btn').html('signout');
	soDiv.click(function(event) { _mam.signout(function() { app.newPage('signin'); }); });
	soDiv.appendTo(content);

	_showingAppmarks = true;
	_showingSearch = false;
	_showingFilter = false;
}


function displayAppmarks(timestamp) {
  var arg_map = [];
  console.log('displayAppmarks(timestamp='+timestamp+')');
  app.loading('loading appmarks...');
	arg_map['device'] = 'chrome';
	_mam.getappmarks22(arg_map,timestamp,true,_appTypeConstraint,_favConstraint,_sharedConstraint,_qConstraint,function(appmark_types,appmarks,has_more) {
		if (!timestamp) _cards = [];
		var offset = _cards.length;
		for (var i=0;i<appmarks.length;i++) {
			var n = _cards.length;
			_cards[n] = getAppmarkCard(n,appmarks[i]);
		}
		if (appmarks.length > 0) _appmark_types = appmark_types;
		_hasMore = has_more;
		displayAppmarksPage(offset,timestamp);
		app.pageLoaded();
		app.finishRefresh();
		app.loading();
	});
}


function onResume() {
  console.log('onResume()');
  //_mam = new mamClient('http://www.myappmarks.com/',app,true);
  //_mam.initFromAppState();
  //console.log('_mam.signedin='+_mam.signedin);
  //if (_mam.signedin) {
  //  displayAppmarks();
  //}
  //else {
  //app.finishPage();
  //}
}

function testcall() {
  console.log('testcall() was called');
  console.log('app='+app);
}

function onResult(ok) {
  //console.log('onResult('+ok+')');
  _mam = new mamClient('http://www.myappmarks.com/',app,true);
  _mam.initFromAppState();
  console.log('_mam.signedin='+_mam.signedin);
  if (_mam.signedin)
    displayAppmarks();
  else
    app.finishPage();
}

function init() {
  app = new MockApp('app',_app);
  app.onresume = onResume;
  app.onresult = onResult;
	_content = $('#page');
	_token = app.load('mam_token');
	if (!_token) {
		var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
		var t = '';
		for (var i=0;i<26;i++) {
			var rnum = Math.floor(Math.random() * chars.length);
			t += chars.substring(rnum,rnum+1);
		}
		app.store('mam_token',t);
		app.pageLoaded();
	  app.newPage('signin');
	}
  else {
  	_mam = new mamClient('http://www.myappmarks.com/',app,true);
    app.loading('signing in...');
	  _mam.testsignedin(_token,function() {
      log('testsignedin = '+_mam.signedin);
		  if (!_mam.signedin) {
		    app.loading();
		    app.pageLoaded();
	      app.newPage('signin');
	      return;
		  }
			displayAppmarks();
	  });
  }
}

$(document).ready(function() { init(); });
