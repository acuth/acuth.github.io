var _app;
var _isloading = false;
var _content = null;
var _displayLink = false;

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

function getDateStr(a) {
	var today = (new Date()).format('d mmm');
	var modifyDay = a.modify_date.format('d mmm');
	return (modifyDay != today) ? modifyDay : a.modify_date.format('HH:MM')
}

function AppmarkCard(n,a,div,shared) {
	this.n = n;
	this.a = a;
	this.div = div;
	this.shared = shared;
}

AppmarkCard.prototype.drawContents=function() {
  console.log('AppmarkCard.drawContents()');
	this.getTitleDiv().appendTo(this.div);
	console.log(' - title');
	this.getCommentDiv().appendTo(this.div);
		console.log(' - comment');
	this.getActionDiv().appendTo(this.div);
		console.log(' - action');
	var blurb = this.getBlurbDiv(this.shared);
	if (blurb) blurb.appendTo(this.div);
		console.log(' - blurb');
	this.getControls(this.shared).appendTo(this.div);
		console.log(' - coneols');
}

AppmarkCard.prototype.update=function(a) {
	a.invoke_str = this.a.invoke_str;
	a.invoke_url = this.a.invoke_url;
	this.a = a;
	this.div.html('');
	this.drawContents();
	this.addControlEventHandlers();
}

AppmarkCard.prototype.updateStar=function(a) {
	this.a = a;
	var cntrl = this.div.find('.appmark-controls > .appmark-star-control2');
	var card = this;
	cntrl.unbind('click');
	if (this.a.starred) {
		cntrl.removeClass('appmark-star-control').addClass('appmark-un-star-control');
		cntrl.click(function(event) { card.clickOnControl('un-star'); });
	}
	else {
		cntrl.removeClass('appmark-un-star-control').addClass('appmark-star-control');
		cntrl.click(function(event) { card.clickOnControl('star'); });
	}
}

AppmarkCard.prototype.startEdit=function(selector) {
	this.div.addClass('appmark-being-edited');
	var div = this.div.find(selector);
	div.find('.appmark-control').detach();
	div.attr('contenteditable','true');
	placeCaretAtEnd(div.get(0));
	if (_deviceInfo.doFocus) {
		var page = $('#page');
		var top = page.scrollTop()+div.offset().top-$('#header').height();
		page.animate({scrollTop:top},'slow');
	}
}

AppmarkCard.prototype.cancelEdit=function() {
	this.div.removeClass('appmark-being-edited');

	var div = this.div.find('.appmark-title');
	if (div.attr('contenteditable') == 'true') {
		div.attr('contenteditable','false');
		this.fillTitleDiv(div);
		this.addControlEventHandler('edit-title');
	}

	div = this.div.find('.appmark-comment');
	if (div.attr('contenteditable') == 'true') {
		div.attr('contenteditable','false');
		this.fillCommentDiv(div);
		this.addControlEventHandler('edit-comment');
	}
}

AppmarkCard.prototype.makeEditable=function(selector) {
	console.log('makeEditable('+this.n+')');
	this.startEdit(selector);
	setHeaderControls(this.n);
	_editingCard = this;
}

AppmarkCard.prototype.doDelete=function() {
	superLog('delete card '+this.a.title);
	var card = this;
	_mam.deleteappmark(this.a.key,function(appmark) {
		superLog('appmark deleted');
		card.div.detach();
	});
}

AppmarkCard.prototype.confirmDelete=function() {
	var msg = 'Do you really wish to delete \''+this.a.title+'\'?';
	var card = this;
	doConfirm(msg,function(ok) {
		superLog('delete card ok='+ok);
		if (ok) card.doDelete();
	});
}

AppmarkCard.prototype.star=function(starred) {
	var card = this;
	_mam.updateappmark2(this.a.key,this.getTitle(),this.getComment(),starred,function(updatedAppmark){
		console.log('[un-]starred');
		card.updateStar(updatedAppmark);
		var msg = starred ? 'Added to favorites...' : 'Removed from favorites...';
		getMessage().show(msg);
	});
}

AppmarkCard.prototype.clickOnControl=function(action) {
	console.log('clickOnControl('+this.n+','+action+')');
	if (_editingCard != null && _editingCard != this) {
		getMessage().show('Another appmark already being edited');
		return;
	}
	if (action=='edit-title') {
		this.makeEditable('.appmark-title');
	}
	else if (action=='edit-comment') {
		this.makeEditable('.appmark-comment');
	}
	else if (action=='delete') {
		this.confirmDelete();
	}
	else if (action=='star') {
		this.star(true);
	}
	else if (action=='un-star') {
		this.star(false);
	}
	else if (action=='tweet' || action =='gplus' || action=='facebook' || action == 'email') {
		//var cntrl = this.getControlFromAction(action);
		//cntrl.addClass('clicked');
		var url = 'http://www.myappmarks.com/redirect?action='+action+'&tkn='+_mam.token+'&key='+this.a.key+'&ver='+this.a.version+'&title='+encodeURIComponent(this.a.title);
		doOpenWindowUrl(url,640,480);
	}
	else {
		getMessage().show('clickOnControl( '+this.n+', '+this.a.title+', '+action+' )');
	}
}

AppmarkCard.prototype.getControl=function(action,imgName,title,imgClass,float) {
	//console.log('getControl('+this.n+','+action+')');
	var cntrl = $(document.createElement('div'));
	cntrl.addClass('appmark-control').addClass('appmark-'+action+'-control').addClass('appmark-control-'+(float?'float':'tr')).attr('action',action);
	//if (action != 'tweet' && action != 'gplus' && action != 'facebook' && action != 'email' && action != 'un-star' && action != 'star' && action != 'delete') {
	//	var img = $(document.createElement('img'));
	//	img.attr('src',getRoot()+'/images/'+imgName+'.png' );
	//	img.attr('title',title);
	//	if (imgClass) img.addClass(imgClass);
	//	img.appendTo(cntrl);
	//}
	//else {
	//	cntrl.addClass('new-appmark-control');
	//}
	return cntrl;
}

AppmarkCard.prototype.fillTitleDiv=function(div) {
	div.html(this.a.title);
	if (!this.a.read_only) this.getControl('edit-title','edit-64','Edit appmark title').appendTo(div);
}

AppmarkCard.prototype.fillCommentDiv=function(div) {
	var comment = this.a.getComment();
	var gotComment = true;
	if (!comment) {
		comment = '';
		gotComment = false;
	}
	comment = mamClient.convertToHTML(comment);
	div.html(comment);
	if (!this.a.read_only && gotComment) this.getControl('edit-comment','edit-64','Edit appmark comment').appendTo(div);
}

AppmarkCard.prototype.getTitleDiv=function() {
	var div = $(document.createElement('div'));
	div.addClass('appmark-title');
	this.fillTitleDiv(div);
	return div;
}

AppmarkCard.prototype.getCommentDiv=function() {
	var div = $(document.createElement('div'));
	div.addClass('appmark-comment');
	this.fillCommentDiv(div);
	return div;
}

AppmarkCard.prototype.getActionDiv=function() {
	var div = $(document.createElement('div'));
	div.addClass('appmark-action');
	var imgElem = document.createElement('img');
	var img = $(imgElem);
	img.addClass('clear-image');
	setImgElemSrc(imgElem,this.a);
	img.appendTo(div);
	var link = this.a.invoke_str;
	var url = this.a.invoke_url;
	if (_displayLink) link += '<br/><span style="font-size:80%;">'+this.a.invoke_url+'</span>';
	var span = $(document.createElement('span'));
	span.html(link);
	span.appendTo(div);
	div.click(function(event) { displayURL(url); });
	return div;
}

AppmarkCard.prototype.getControls=function(shared) {
	var verb = (this.a.modify_date.getTime() == this.a.create_date.getTime()) ? 'posted' : 'updated';
	if (this.a.read_only) {
		if (this.a.author_name)
			verb = '<b>@'+this.a.author_name+'</b> shared';
		else
			verb = 'shared';
	}
	var dateStr = verb+' '+getDateStr(this.a);

	var div = $(document.createElement('div')).addClass('appmark-controls');
	var date = $(document.createElement('div')).addClass('post-details').html(dateStr).appendTo(div);

	if (this.a.starred)
		this.getControl('un-star','star-color-64','Un-star appmark','starred',true).addClass('appmark-star-control2').appendTo(div);
	else
		this.getControl('star','star-gray-64','Star appmark',null,true).addClass('appmark-star-control2').appendTo(div);

	this.getControl('email','email-64','Email appmark',null,true).appendTo(div);
	this.getControl('tweet','twitter-64','Tweet appmark',null,true).appendTo(div);
	this.getControl('gplus','gplus-64','G+',null,true).appendTo(div);
	this.getControl('facebook','facebook-64','Facebook',null,true).appendTo(div);

	if (!shared) this.getControl('delete','delete-64','Delete appmark',null,true).appendTo(div);

	if (!this.a.read_only) {
		if (!this.a.getComment()) {
			this.getControl('edit-comment','edit-64','Edit appmark comment',null,true).appendTo(div);
		}
	}

	$(document.createElement('div')).css('clear','both').appendTo(div);
	return div;
}

AppmarkCard.prototype.getBlurbDiv=function(shared) {
	if (!shared) return null;
	var div = $(document.createElement('div')).addClass('appmark-blurb');
	var blurb = $(document.createElement('div')).addClass('blurb');
	$('<b>This is a shared appmark</b><br/>').appendTo(blurb);
	if (_signedIn) {
		$(document.createElement('span')).html('It has been added to your list of appmarks, click on ').appendTo(blurb);
		var a = $(document.createElement('a')).html('refresh').appendTo(blurb);
		a.click(function(event) { refresh(); });
		$(document.createElement('span')).html(' to see all of them').appendTo(blurb);
	}
	else {
		$(document.createElement('span')).html('You can just click on the link now to see where it leads or you can ').appendTo(blurb);
		var a = $(document.createElement('a')).html('Sign In').appendTo(blurb);
		a.click(function(event) { displaySignIn(); });
		$(document.createElement('span')).html(' (or ').appendTo(blurb);
		a = $(document.createElement('a')).html('Sign Up').appendTo(blurb);
		a.click(function(event) { displayRegister(); });
		$(document.createElement('span')).html(') to add it to a personalized list of appmarks.').appendTo(blurb);
	}
	blurb.appendTo(div);
	return div;
}

AppmarkCard.prototype.getTitle=function() {
	var div = this.div.find('.appmark-title');
	return (div.attr('contenteditable') == 'true') ? div.text() : this.a.title;
}

AppmarkCard.prototype.getComment=function() {
	var div = this.div.find('.appmark-comment');
	if (div.attr('contenteditable') != 'true') return this.a.comment;
	console.log('clean "'+div.get(0).innerHTML+'"');
    var s = mamClient.convertFromHTML(div.get(0));
	console.log('returned "'+s+'"');
	return s;
}


AppmarkCard.prototype.addControlEventHandlerImpl=function(cntrl,action) {
	var card = this;
	cntrl.click(function(event) { card.clickOnControl(action); });
}

AppmarkCard.prototype.getControlFromAction=function(action) {
	var cntrlArray = this.div.find('.appmark-control');
	for (var j =0;j<cntrlArray.length;j++) {
		var cntrl = $(cntrlArray[j]);
		if (action == cntrl.attr('action')) return cntrl;
	}
	return null;
}

AppmarkCard.prototype.addControlEventHandler=function(action) {
	var cntrlArray = this.div.find('.appmark-control');
	for (var j =0;j<cntrlArray.length;j++) {
		var cntrl = $(cntrlArray[j]);
		if (action == cntrl.attr('action'))
			this.addControlEventHandlerImpl(cntrl,action);
	}
}

AppmarkCard.prototype.addControlEventHandlers=function() {
	var cntrlArray = this.div.find('.appmark-control');
	for (var j =0;j<cntrlArray.length;j++) {
		var cntrl = $(cntrlArray[j]);
		var action = cntrl.attr('action');
		this.addControlEventHandlerImpl(cntrl,action);
	}
}

function getAppmarkCard(n,a,shared) {
	var div = $(document.createElement('div'));
	div.addClass('appmark').addClass('card').attr('id','appmark-'+n).addClass('enable-touch').attr('touch-class','appmark');
	var card = new AppmarkCard(n,a,div,shared);
	console.log('got card');
	card.drawContents();
	return card;
}



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

function gotConstraints() {
	return _favConstraint || _sharedConstraint || _appTypeConstraint || _qConstraint;
}

function displayAppmarksPage(offset,timestamp) {
	console.log('displayAppmarksPage(offset='+offset+',timestamp='+timestamp+')');
	console.log('_hasMore='+_hasMore);
	console.log('_cards.length='+_cards.length);
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
	_showingAppmarks = true;
	_showingSearch = false;
	_showingFilter = false;
	//displayHeader();
}


function displayAppmarks(timestamp,gotoTop) {
    var arg_map = [];
    console.log('displayAppmarks(timestamp='+timestamp+',gotoTop='+gotoTop+')');
    loading('loading appmarks...');
	arg_map['device'] = 'chrome';//_deviceInfo.device;
	_mam.getappmarks22(arg_map,timestamp,true,_appTypeConstraint,_favConstraint,_sharedConstraint,_qConstraint,function(appmark_types,appmarks,has_more) {
	  console.log('displayAppmarks cb');
		loading();
		if (!timestamp) _cards = [];
		var offset = _cards.length;
		for (var i=0;i<appmarks.length;i++) {
			var n = _cards.length;
			_cards[n] = getAppmarkCard(n,appmarks[i]);
		}
		 console.log('got cards');
		if (appmarks.length > 0) {
			_appmark_types = appmark_types;
		}
		_hasMore = has_more;
		displayAppmarksPage(offset,timestamp);
		notifyPageLoaded();
		if (gotoTop) getContent().scrollTop(0);
	});
}

function setImgElemSrc(imgElem,a) {
  imgElem.setAttribute('src','http://www.myappmarks.com/'+a.icon_url);
	//setImgElemSrcFromType(imgElem,a.type);
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

var _pageLoaded = false;

function notifyPageLoaded() {
  if (!_pageLoaded) {
    _app.pageLoaded();
    _pageLoaded = true;
  }
}

function init() {
  initApp();
	_content = $('#page');
	_mam = new mamClient('http://www.myappmarks.com/',_app,true);
	_mam.initFromAppState();
	if (!_mam.signedin) {
	  _mam.token = 'fAtlxbz6y6xhScczBM2TCHN066';
	  _mam.signedin = true;
	}
	displayAppmarks();
}

$(document).ready(function() {
	init();
});
