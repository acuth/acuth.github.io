
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
	card.drawContents();
	return card;
}

function gotConstraints() {
	return _favConstraint || _sharedConstraint || _appTypeConstraint || _qConstraint;
}

function displayAppmarksPage(offset,timestamp) {
	var content = getContent();
	if (_cards.length === 0) {
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
			
			//var tmpDiv = $(document.createElement('div')).addClass('full-width-btn').html('signout');
			//tmpDiv.click(function(event) { onAction('do_signout'); });
			//tmpDiv.appendTo(content);
		}
	}

	_showingAppmarks = true;
	_showingSearch = false;
	_showingFilter = false;
}


function displayAppmarks(timestamp) {
  var arg_map = [];
  console.log('displayAppmarks(timestamp='+timestamp+')');
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
		app.startPage();
		app.endRefresh();
	});
}


function onRefresh() {
  console.log('calling onRefresh() in home.js');
  displayAppmarks();
}

function onPageClose(tag,ok,obj) {
  console.log('index.onPageClose('+tag+','+ok+','+obj+')');
  if (tag == 'account') {
    if (!ok || obj != 1) {
      app.endPage();
    }
    _mam = new mamClient('http://www.myappmarks.com/',app,true);
    _mam.initFromAppState();
    console.log('_mam.signedin='+_mam.signedin);
    displayAppmarks();
  }
  else if (tag == 'card') {
    if (ok && obj == 'signout') {
      getContent().empty();
      app.openPage('account','signin.html');
    }
  }
}

function doSignout() {
  _mam.signout(function() { 
      getContent().empty();
      app.store('mam_token',null);
      app.openPage('account','signin.html');
  });
}

function onAction(action) {
  if (action == 'do_signout') {
    app.dialog('Do you really want to signout?','Yes','No',function(yes) { if (yes) doSignout(); });
  }  
}

function onBackPressed() {
  app.dialog('Do you want to leave myappmarks?','Yes','No',function(yes) { if (yes) app.endPage(); });
}

function init() {
  console.log('init()');
  app = new Awac('app');
  console.log('set colors');
  app.setAppColors({'primary':'#CFDED9','text_primary':'#2E5649','primary_dark':'#222222'});
  app.setOnRefresh(onRefresh);
  app.setOnPageClose(onPageClose);
  app.setOnBackPressed(onBackPressed);
  app.addNavDrawerItem({'label':'signout','action':'do_signout'});
  app.setOnAction(onAction);
  app.unlockNavDrawer();
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
		app.startPage();
	  app.openPage('account','signin.html');
	}
  else {
  	_mam = new mamClient('http://www.myappmarks.com/',app,true);
	  _mam.testsignedin(_token,function() {
      log('testsignedin = '+_mam.signedin);
		  if (!_mam.signedin) {
		    app.startPage();
	      app.openPage('account','signin.html');
	      return;
		  }
			displayAppmarks();
	  });
  }
}

$(document).ready(function() { init(); });
