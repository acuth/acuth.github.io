var _mam = null;
var _token = null;
var _content = null;
var _appTypeConstraint = null;
var _favConstraint = false;
var _sharedConstraint = false;
var _qConstraint = null;

var _displayLink = false;
var _displayLog = false;

var _deviceMenus = [];
var _closeMenu = null;

var _hasMoreDiv = null;
var _hasMore = false;

var _appmark_types = [];
var _cards = [];

var _deviceInfo = null;

var _isloading = false;
var _signedIn = false;
var _editingCard = null;
var _showingSearch = false;
var _showingFilter = false;
var _showingAppmarks = false;
var _all_appmark_types = null;

var _touchEnabled = true;
var _lastTouched = null;


function log(msg) {
	if (typeof console != 'undefined') console.log(msg);
}

function logUrl(s,url) {
	if (typeof console != 'undefined') console.log(s+' '+url);
}

function loading(msg) {
	if (msg) log('loading('+msg+')');
	var hdr = $('#header-right');
	var text = $('#loading-text');
	if (msg) {
		if (!_isloading) {
			text.css('display','block');
			hdr.html('');
			addHeaderControl('loading-48-hdr.gif',null,'loading-gif');
			_isloading = true;
		}
		text.html(msg);
	}
	else {
		if (_isloading) {
			text.css('display','none').html('');
			_isloading = false;
			displayHeader();
		}
	}
}

function displayMessage(msg) {
	loading();
	var e = document.getElementById('form-msg');
	e.style.visibility = 'visible';
	e.innerHTML = msg;
}

function cleanStr(s) {
	var s2 = '';
	for (var i=0;i<s.length;i++) {
		//if (s.charCodeAt(i) < 256) {
			s2 += s.charAt(i);
		//}
	}
	//log('cleanStr('+s+')='+s2);
	return s2;
}


function nameInputFocus() {
	document.querySelector('#name-input').focus();
}

function submitButtonFocus() {
	document.querySelector('#submit-btn').focus();
}

function openMenu() {
  console.log('openMenu()');
  $('#fader').css('display','block');
  setTimeout(function() {
    $(document.body).addClass('menu_open');
  },10);
}

function closeMenu() {
  console.log('closeMenu()');
  $(document.body).removeClass('menu_open');
  setTimeout(function() { $('#fader').css('display','none'); },300);
}

function toggleMenu() {
  console.log('toggleMenu()');
  if ($(document.body).hasClass('menu_open')) closeMenu(); else openMenu();
  return false;
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

function gotConstraints() {
	return _favConstraint || _sharedConstraint || _appTypeConstraint || _qConstraint;
}

function getConstraintsStr2() {
	if (_favConstraint && _sharedConstraint && _appTypeConstraint) {
		return 'shared, favourite appmarks of type \''+_appTypeConstraint+'\'';
	}
	if (_favConstraint && _appTypeConstraint) {
		return 'favourite appmarks of type \''+_appTypeConstraint+'\'';
	}
	if (_sharedConstraint && _appTypeConstraint) {
		return 'shared appmarks of type \''+_appTypeConstraint+'\'';
	}
	if (_favConstraint && _sharedConstraint) {
		return 'shared, favourite appmarks';
	}
	if (_favConstraint) {
		return 'favourite appmarks';
	}
	if (_sharedConstraint) {
		return 'shared appmarks';
	}
	if (_appTypeConstraint) {
		return 'appmarks of type \''+_appTypeConstraint+'\'';
	}
	return 'appmarks';
}

function getConstraintsStr() {
	var s = getConstraintsStr2();
	if (_qConstraint) s += ', matching "'+_qConstraint+'"';
	return s;
}

function myTouchListener(event,e) {
	//alert('touched');
	if (_lastTouched != null) {
		var touchClass = _lastTouched.attr('touch-class');
		_lastTouched.removeClass(touchClass+'-touched');
		_lastTouched = null;
	}
	_lastTouched = e;
	var touchClass = _lastTouched.attr('touch-class');
	_lastTouched.addClass(touchClass+'-touched');

}

function addTouchListener(e) {
	if (!_touchEnabled) return;
	if (_deviceInfo.device == 'ipad' || _deviceInfo.device == 'ipod') {
		e.bind('touchstart',function(event) { myTouchListener(event,e); });
	}
	else {
		e.bind('click',function(event) { myTouchListener(event,e); });
	}
}

function enableTouch() {
	if (_touchEnabled) {
		superLog('add bespoke touch listeners');
		var ea = document.getElementsByClassName('enable-touch');
		for (var i=0;i<ea.length;i++) addTouchListener($(ea[i]));
	}
}

function disableTouch() {
	if (_touchEnabled) {
		superLog('remove bespoke touch listeners');
		var ea = document.getElementsByClassName('enable-touch');
		for (var i=0;i<ea.length;i++) $(ea[i]).unbind('click');
	}
	_touchEnabled = false;
}

function pageChange() {
	console.log('pageChange()');
	enableTouch();
}

function getContent() {
	if (!_content) console.log('_content not set');
	return _content;
}

function addHeaderControl(imgName,label,imgClass) {
	var appmarkType = null;
	if (imgName.indexOf('appmarktype:')==0) {
		imgName = imgName.substring(12);
		for (var i=0;i<_all_appmark_types.length;i++) {
			if (_all_appmark_types[i].type == imgName) {
					appmarkType = _all_appmark_types[i];
					break;
			}
		}
		console.log('Got appmark type '+appmarkType.type);
	}
	var span = $(document.createElement('span')).addClass('label-img');
	if (label) $(document.createElement('span')).html(label+'&nbsp;').appendTo(span);
	var imgElem = document.createElement('img');
	var img = $(imgElem).addClass('hdr-img');
	if (appmarkType) {
		img.addClass('clear-image');
		setImgElemSrcFromType(imgElem,appmarkType.type);
	}
	else {
		img.attr('src',getRoot()+'/images/'+imgName);
	}
	img.appendTo(span);
	if (imgClass) img.addClass(imgClass);
	span.appendTo($('#header-right'));
	return span;
}

function placeCaretAtEnd(el) {
    el.focus();
    if (typeof window.getSelection != "undefined"
            && typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (typeof document.body.createTextRange != "undefined") {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(false);
        textRange.select();
    }
}

function doEdit(n) {
	console.log('doEdit('+n+')');
	var card = _cards[n];
	_mam.updateappmark(card.a.key,card.getTitle(),card.getComment(),function(updatedAppmark){
		console.log('updated');
		card.update(updatedAppmark);
		unsetHeaderControls();
		_editingCard = null;
	});
}

function cancelEdit(n) {
	console.log('cancelEdit('+n+')');
	unsetHeaderControls();
	_cards[n].cancelEdit();
	_editingCard = null;
}

function unsetHeaderControls() {
	if (_editingCard == null) return;
	displayHeader();
}

function setHeaderControls(n) {
	if (_editingCard != null) return;
	$('#header-right').html('');
	addHeaderControl('cancel-48.png','CANCEL').click(function(event) { cancelEdit(n); });
	addHeaderControl('done-48.png','DONE').click(function(event) { doEdit(n); });
}

function displayURL(url) {
	console.log('displayURL('+url+')');
	window.open(url);
}

function displayHelp() {
	displayURL('http://www.myappmarks.com/v2/html/help.html');
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
	this.getTitleDiv().appendTo(this.div);
	this.getCommentDiv().appendTo(this.div);
	this.getActionDiv().appendTo(this.div);
	var blurb = this.getBlurbDiv(this.shared);
	if (blurb) blurb.appendTo(this.div);
	this.getControls(this.shared).appendTo(this.div);

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
	card.drawContents();
	return card;
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
	displayHeader();
}

function displayAppmarks(timestamp,gotoTop) {
    var arg_map = [];
    console.log('displayAppmarks(timestamp='+timestamp+',gotoTop='+gotoTop+')');
    loading('loading appmarks...');
	arg_map['device'] = _deviceInfo.device;
	_mam.getappmarks22(arg_map,timestamp,true,_appTypeConstraint,_favConstraint,_sharedConstraint,_qConstraint,function(appmark_types,appmarks,has_more) {
		loading();
		if (!timestamp) _cards = [];
		var offset = _cards.length;
		for (var i=0;i<appmarks.length;i++) {
			var n = _cards.length;
			_cards[n] = getAppmarkCard(n,appmarks[i]);
		}
		if (appmarks.length > 0) {
			_appmark_types = appmark_types;
		}
		_hasMore = has_more;
		displayAppmarksPage(offset,timestamp);
		if (gotoTop) getContent().scrollTop(0);
		pageChange();
	});
}


function showAll() {
	_favConstraint = false;
	_sideMenu.updateEntry(FAVORITES,'Show favorites',false);
	_appTypeConstraint = null;
	_sideMenu.updateEntry(FILTER,'Filter',false);
	_qConstraint = null;
	_sideMenu.updateEntry(SEARCH,'Search',false);
	_sharedConstraint = false;
	refresh();
}

function showAllTypes() {
	_appTypeConstraint = null;
	_sideMenu.updateEntry(FILTER,'Filter',false);
	refresh();
}

function displayHeader() {
	var hdr = $('#header-right');
	hdr.html('');
	if (!_signedIn) {
		var div = $(document.createElement('div')).appendTo(hdr);
		$(document.createElement('img')).addClass('hdr-logo').attr('src',getRoot()+'/images/myappmarks-128.png').appendTo(div);
		div = $(document.createElement('div')).appendTo(hdr);
		$(document.createElement('span')).addClass('hdr-name').html('myappmarks').appendTo(div);
	}
	else if (_showingFilter || _showingSearch) {
		addHeaderControl('cancel-48.png','CANCEL').click(function(event) {
			displayAppmarksPage(0);
			pageChange();
		} );
	}
	else if (_showingAppmarks) {
		if (_appTypeConstraint) {
			addHeaderControl('appmarktype:'+_appTypeConstraint).click(function(event) { filter(); });
		}
		if (_favConstraint) {
			addHeaderControl('star-color-64-new.png').click(function(event) { toggleFavorites(); });
		}
		if (_qConstraint) {
			addHeaderControl('search-64.png').click(function(event) { search(); });
		}
		addHeaderControl('refresh.png').click(function(event) { refresh(); });
	}
	else {
		console.log('displayHeader() - not really sure what is going on!!!!!!');
	}
}

function displayContent() {
	log('displayContent()');
	_sideMenu.hideEntry(SIGN_IN);
	_sideMenu.hideEntry(SIGN_UP);
	_sideMenu.showEntry(SIGN_OUT);
	_sideMenu.showEntry(REFRESH);
	_sideMenu.showEntry(FILTER);
	_sideMenu.showEntry(FAVORITES);
	_sideMenu.showEntry(DISPLAY_LINK);
	_sideMenu.showEntry(SEARCH);
	_sideMenu.showEntry(SHOW_ALL);
	_signedIn = true;
	displayHeader();
	displayAppmarks();
}

function displaySharedAppmark(shareKey) {
	log('displaySharedAppmark('+shareKey+') signed-in:'+_mam.signedin);
	var i = shareKey.indexOf('_');
	var originalKey = shareKey.substring(0,i);
	var version = shareKey.substring(i+1);
	loading('getting shared appmark...');
	var args = [];
	args['device'] = _deviceInfo.device;
	_mam.getSharedAppMark(args,originalKey,version,function(appmarkType,appmark) {
		loading();
		_cards = [];
		_cards[0] = getAppmarkCard(0,appmark,true);
		_hasMore = false;
		displayAppmarksPage(0);
	});
}

function refresh() {
	superLog('refresh()');
	displayAppmarks(0,true);
}

function toggleFavorites() {
	_favConstraint = !_favConstraint;
	_sideMenu.updateEntry(FAVORITES,'Show favorites',_favConstraint);
	displayAppmarks(0,true);
}

var _qInput = null;
var _usernameInput = null;
var _passwordInput = null;
var _passwordInput2 = null;
var _formMessageDiv = null;


function displayFormMessage(msg) {
	_formMessageDiv.html(msg);
}

// triggered by from submit so do not want form to cause a reload
function doSignIn(event) {
	console.log('doSignIn()');
	event.preventDefault();
	var username = _usernameInput.val();
	var password = _passwordInput.val();
	_mam.signin(username,password,_token,function(obj) {
		if (!_mam.signedin)
			displayFormMessage(_mam.msg);
		else
			displayContent();
	});
}


// triggered by from submit so do not want form to cause a reload
function doRegister(event) {
	console.log('doRegister()');
	event.preventDefault();
	var username = _usernameInput.val();
	var password = _passwordInput.val();
	var password2 = _passwordInput2.val();
	_mam.register(username,password,password2,_token,function(obj) {
		if (!_mam.signedin)
			displayFormMessage(_mam.msg);
		else
			displayContent();
	});
}

function displaySignIn() {
	log('displaySignIn()');
	loading();
	var content = getContent();
	content.empty();

	var card = $(document.createElement('div')).addClass('card');
	var bigdiv2 = $(document.createElement('div')).addClass('login-register-form');
	var form = $(document.createElement('form'));

	_usernameInput = $(document.createElement('input')).attr('type','text').attr('placeholder','username').attr('autocapitalize','off').appendTo(form);
	_passwordInput = $(document.createElement('input')).attr('type','password').attr('placeholder','password').appendTo(form);
	$(document.createElement('div')).addClass('fake-btn').html('Sign In').click(function(event) { doSignIn(event); }).appendTo(form);
	$(document.createElement('input')).attr('type','submit').addClass('hidden-submit').appendTo(form);
	form.submit(function(event) { doSignIn(event); });

	form.appendTo(bigdiv2);
	bigdiv2.appendTo(card);

	var blurbHtml = 'If you do not already have an account then you can <a id="goto-register">Sign&nbsp;Up</a> for an account right now';
	$(document.createElement('div')).addClass('form-blurb').html(blurbHtml).appendTo(card);
	_formMessageDiv = $(document.createElement('div')).addClass('form-message').appendTo(card);
	form.submit(function(event) { doSignIn(event); });
	card.appendTo(content);

	//setTimeout(nameInputFocus,100 );
	$('#goto-register').click(function(event) { displayRegister(); });
}



function displayRegister() {
	log('displayRegister()');
	loading();
	var content = getContent();
	content.empty();

	var card = $(document.createElement('div')).addClass('card');
	var bigdiv2 = $(document.createElement('div')).addClass('login-register-form');
	var form = $(document.createElement('form'));

	_usernameInput = $(document.createElement('input')).attr('type','text').attr('placeholder','username').attr('autocapitalize','off').appendTo(form);
	_passwordInput = $(document.createElement('input')).attr('type','password').attr('placeholder','password').appendTo(form);
	_passwordInput2 = $(document.createElement('input')).attr('type','password').attr('placeholder','confirm password').appendTo(form);
	$(document.createElement('div')).addClass('fake-btn').html('Sign Up').click(function(event) { doRegister(event); }).appendTo(form);
	$(document.createElement('input')).attr('type','submit').addClass('hidden-submit').appendTo(form);
	form.submit(function(event) { doRegister(event); });

	form.appendTo(bigdiv2);
	bigdiv2.appendTo(card);

	var blurbHtml = 'If you already have an account then you can <a id="goto-signin">Sign&nbsp;In</a> right now';
	$(document.createElement('div')).addClass('form-blurb').html(blurbHtml).appendTo(card);
	_formMessageDiv = $(document.createElement('div')).addClass('form-message').appendTo(card);

	card.appendTo(content);

	//setTimeout(nameInputFocus,100 );
	$('#goto-signin').click(function(event) { displaySignIn(); });
}

function displayNotSignedIn() {
	_sideMenu.showEntry(SIGN_IN);
	_sideMenu.showEntry(SIGN_UP);
	_sideMenu.hideEntry(SIGN_OUT);
	_sideMenu.hideEntry(REFRESH);
	_sideMenu.hideEntry(FILTER);
	_sideMenu.hideEntry(FAVORITES);
	_sideMenu.hideEntry(DISPLAY_LINK);
	_sideMenu.hideEntry(SEARCH);
	_sideMenu.hideEntry(SHOW_ALL);
	_signedIn = false;
	displayHeader();
	displaySignIn();
}

function doSignOut() {
	log('doSignOut()');
	_mam.signout(_token, function(obj) {
		displayNotSignedIn();
	});
}

function confirmSignOut() {
	doConfirm('Are you sure you want to sign out?',function(ok) { if (ok) doSignOut(); });
}

function setDevice(i) {
	console.log('setDevice('+i+')');
	_deviceInfo = devicesInfo[i];
	_closeMenu.html('close ('+_deviceInfo.id+')');
	console.log('set _deviceInfo='+_deviceInfo.id);
}

function getSetDeviceMenu(entries,i) {
	return $(document.createElement('li')).html('device='+devicesInfo[i].id).click(function(event) { closeMenu(); setDevice(i); }).appendTo(entries);
}

function toggleDisplayLink() {
	console.log('toggleDisplayLink()');
	_displayLink = !_displayLink;
	_sideMenu.updateEntry(DISPLAY_LINK,'Show display link',_displayLink);
	console.log('_displayLink='+_displayLink);
	refresh();
}

function toggleDisplayLog() {
	console.log('toggleDisplayLog()');
	_displayLog = !_displayLog;
	_sideMenu.updateEntry(LOG,'Show log',_displayLog);
	console.log('_displayLog='+_displayLog);
	$('#superlog').css('display',_displayLog ? 'block' : 'none');
}

function superLog(msg) {
	var slog = $('#superlog');
	slog.html(msg+'<br/>'+slog.html());
	console.log(msg);
}

function Message() {
	this.lastDisplayTime = -1;
	this.div = $('#message');
	this.div.css('display','none');
	this.div.addClass('hide');
	this.div.removeClass('show');
}

Message.prototype.show=function(msg) {
	this.div.html(msg);
	this.div.css('display','block');
	var mess = this;
	setTimeout(function() {
		mess.div.removeClass('hide');
    	mess.div.addClass('show');
    	mess.delayHide(4000);
  	},10);
}

Message.prototype.delayHide=function(delay) {
	if (!delay) delay = 1000;
	var lastTime = (new Date()).getTime()+(delay-10);
	if (lastTime > this.lastDisplayTime) this.lastDisplayTime = lastTime;
	var mess = this;
	setTimeout(function() { mess.timedOutHide(); },delay);
}

Message.prototype.timedOutHide=function() {
	if (this.lastDisplayTime < 0) return;
	if (new Date().getTime() > this.lastDisplayTime) {
		this.lastDisplayTime = -1;
		this.div.removeClass('show');
    	this.div.addClass('hide');
    	var mess = this;
		setTimeout(function() { mess.finishHide(); },200);
	}
}

Message.prototype.finishHide=function(delay) {
	if (this.lastDisplayTime < 0) this.div.css('display','none');
}

var _msg = null;
function getMessage() {
	if (!_msg) _msg = new Message();
	return _msg;
}


function SideMenu(div) {
	this.div = div;
	this.entryIds = [];
	this.entries = [];
}

SideMenu.prototype.getEntry=function(id) {
	var index = -1;
	for (var i=0;i<this.entryIds.length;i++) {
		if (this.entryIds[i] == id) {
			index = i;
			break;
		}
	}
	if (index == -1) {
		console.log('Unable to find menu entry with id "'+id+'"');
		return null;
	}
	return this.entries[index];
}

SideMenu.prototype.newEntry=function(id,label,cb,showCheckbox,showMore) {
	var entry = $(document.createElement('div')).addClass('menu-entry');
	$(document.createElement('div')).addClass('menu-entry-label').html(label).appendTo(entry);
	if (showCheckbox) {
		var icon = $(document.createElement('div')).addClass('menu-entry-icon').appendTo(entry);
		var img = $(document.createElement('img'));
		img.attr('src',getRoot()+'/images/checkbox-off-white-128.png');
		img.appendTo(icon);
	}
	if (showMore) {
		var icon = $(document.createElement('div')).addClass('menu-entry-icon').appendTo(entry);
		var img = $(document.createElement('img'));
		img.attr('src',getRoot()+'/images/more-arrow.png');
		img.appendTo(icon);
	}
	$(document.createElement('div')).css('clear','both').appendTo(entry);
	entry.click(function(event) { closeMenu(); cb(event); } );
	entry.appendTo(this.div);
	//
	var index = this.entries.length;
	this.entries[index] = entry;
	this.entryIds[index] = id;
}

SideMenu.prototype.updateEntry=function(id,label,state) {
	var entry = this.getEntry(id);
	if (!entry) return;
	var div = entry.find('.menu-entry-label');
	div.html(label);
	div = entry.find('.menu-entry-icon');
	if (div) {
		var img = div.find('img');
		img.attr('src',getRoot()+'/images/checkbox-'+(state?'on':'off')+'-white-128.png');
	}
}

SideMenu.prototype.showEntry=function(id) {
	var entry = this.getEntry(id);
	if (entry) entry.css('display','block');
}

SideMenu.prototype.hideEntry=function(id) {
	var entry = this.getEntry(id);
	if (entry) entry.css('display','none');
}

var _sideMenu = null;
var LOG = 'log';
var REFRESH = 'refresh';
var FAVORITES = 'favorites';
var SIGN_IN = 'sign-in';
var SIGN_UP = 'sign-up';
var SIGN_OUT = 'sign-out';
var DISPLAY_LINK = 'display-link';
var SHOW_ALL = 'show-all';
var SEARCH = 'search';
var HELP = 'help';
var CLOSE = 'close';
var FILTER = 'filter';

function setImgElemSrc(imgElem,a) {
  imgElem.attr('src',a);
	//setImgElemSrcFromType(imgElem,a.type);
}

function setFilter(appmarkType) {
	if (_appTypeConstraint && _appTypeConstraint == appmarkType.type) {
		_appTypeConstraint = null;
	}
	else {
		_appTypeConstraint = appmarkType.type;
	}
	if (_appTypeConstraint) {
		_sideMenu.updateEntry(FILTER,'Filter \''+_appTypeConstraint+'\' type',true);
	}
	else {
		_sideMenu.updateEntry(FILTER,'Filter',false);
	}
	refresh();
}

function getAppmarkTypeRow(appmarkType) {
	var selected = _appTypeConstraint == appmarkType.type;
	var div = $(document.createElement('div')).addClass('appmark-type');
	if (selected) div.addClass('type-selected');
	var imgElem = document.createElement('img');
	var img = $(imgElem);
	img.addClass('clear-image');
	setImgElemSrcFromType(imgElem,appmarkType.type);
	img.appendTo(div);
	$(document.createElement('span')).html(appmarkType.appstore_name).appendTo(div);
	if (selected) {
		$(document.createElement('div')).html('[tick]').css('float','right').appendTo(div);
		$(document.createElement('div')).css('clear','both').appendTo(div);
	}
	div.click(function(event){ setFilter(appmarkType); });
	return div;
}

function displayFilterTypes() {
	_showingFilter = true;
	_showingSearch = false;
	_showingAppmarks = false;
	if (_appTypeConstraint) {
		var btn = $(document.createElement('div')).addClass('full-width-btn');
		btn.html('show all types');
		btn.click(function(event) { showAllTypes(); });
		btn.appendTo(getContent());
	}
	var card = $(document.createElement('div')).addClass('card');
	for (var i=0;i<_all_appmark_types.length;i++) {
		getAppmarkTypeRow(_all_appmark_types[i]).appendTo(card);
	}
	card.appendTo(getContent());
	displayHeader();
}

function filter() {
	log('filter()');
	getContent().empty();
	if (_all_appmark_types) {
		displayFilterTypes();
	}
	else {
		loading('loading appmark types');
		_mam.getappmarktypes(_deviceInfo.device,function(appmarkTypes) {
			loading();
			_all_appmark_types = appmarkTypes;
			displayFilterTypes();
		});
	}
}

function removeSearchFilter() {
	_qConstraint = null;
	_sideMenu.updateEntry(SEARCH,'Search',false);
	refresh();
}

function doSearch(event) {
	log('doSearch()');
	event.preventDefault();
	_qConstraint = _qInput.val();
	if (_qConstraint) {
		_sideMenu.updateEntry(SEARCH,'Search "'+_qConstraint+'"',true);
	}
	else {
		_sideMenu.updateEntry(SEARCH,'Search',false);
	}
	refresh();
}

function search() {
	log('search() _qConstraint='+_qConstraint);
	getContent().empty();
	_showingSearch = true;
	_showingFilter = false;
	_showingAppmarks = false;
	if (_qConstraint) {
		var btn = $(document.createElement('div')).addClass('full-width-btn');
		btn.html('remove search filter');
		btn.click(function(event) { removeSearchFilter(); });
		btn.appendTo(getContent());
	}
	var card = $(document.createElement('div')).addClass('card');
	var bigdiv2 = $(document.createElement('div')).addClass('login-register-form');
	var form = $(document.createElement('form'));

	_qInput = $(document.createElement('input')).attr('type','text').attr('placeholder','search').appendTo(form);
	if (_qConstraint) _qInput.val(_qConstraint);
	$(document.createElement('div')).addClass('fake-btn').html('Search').click(function(event) { doSearch(event); }).appendTo(form);
	$(document.createElement('input')).attr('type','submit').addClass('hidden-submit').appendTo(form);
	form.submit(function(event) { doSearch(event); });

	form.appendTo(bigdiv2);
	bigdiv2.appendTo(card);
	card.appendTo(getContent());
	displayHeader();
}


function initMenu() {
	_sideMenu = new SideMenu($('#menu'));
	_sideMenu.newEntry(LOG,'Show Log',function(event) { toggleDisplayLog(); },true);
	_sideMenu.newEntry(FAVORITES,'Show Favorites',function(event) { toggleFavorites(); },true);
	_sideMenu.newEntry(DISPLAY_LINK,'Show Display Link',function(event) { toggleDisplayLink(); },true);
	_sideMenu.newEntry(FILTER,'Filter',function(event) { filter(); },true);
	_sideMenu.newEntry(SEARCH,'Search',function(event) { search(); },true);
	_sideMenu.newEntry(SHOW_ALL,'Show All',function(event) { showAll(); });
	_sideMenu.newEntry(REFRESH,'Refresh',function(event) { refresh(); });
	_sideMenu.newEntry(SIGN_IN,'Sign In',function(event) { displaySignIn(); });
	_sideMenu.newEntry(SIGN_UP,'Sign Up',function(event) { displayRegister(); });
	_sideMenu.newEntry(SIGN_OUT,'Sign Out',function(event) { confirmSignOut(); });
	_sideMenu.newEntry(HELP,'Help',function(event) { displayHelp(); });
	_sideMenu.newEntry(CLOSE,'Close Menu',function(event) { });
}

var devicesInfo = [
	{'id':'chrome ipad','match':'ipad,crios','device':'ipad','images':'ios','css':'ios','browser':'chrome'},
	{'id':'safari ipad','match':'ipad','device':'ipad','images':'ios','css':'ios','browser':'safari'},
	{'id':'ipod','match':'ipod','device':'ipod','images':'ios','css':'ios','browser':'safari'},
	{'id':'iphone','match':'iphone','device':'iphone','images':'ios','css':'ios','browser':'safari'},
	{'id':'android','match':'android','device':'android','images':'android','css':'android','doFocus':true,'browser':'chrome'},
	{'id':'chrome desktop','match':'chrome','device':'desktop','images':'chrome','css':'chrome','disableTouchOnMouseMove':true,'browser':'chrome'},
	{'id':'safari desktop','match':'safari','device':'desktop','images':'safari','css':'safari','disableTouchOnMouseMove':true,'browser':'safari'}
];

function addCSS(name) {
	if (name) {
		superLog('addCSS('+name+')');
		var link = $(document.createElement('link'));
		link.attr('type','text/css');
		link.attr('rel','stylesheet');
		link.attr('href',getRoot()+'/css/'+name+'.css');
		link.appendTo($('head'));
	}
}

function testMatch(match,ua) {
	var terms = match.split(',');
	var found = false;
	for (var i=0;i<terms.length;i++) {
		if (ua.indexOf(terms[i]) == -1) {
			return false;
		}
	}
	return true;
}


function initDevice() {
	var ua = navigator.userAgent.toLowerCase();
	superLog('user-agent='+ua);

	var info = null;
	for (var i=0;i<devicesInfo.length;i++) {
		var dinfo = devicesInfo[i];
		console.log('testing match against '+dinfo.match);
		if (testMatch(dinfo.match,ua)) {
			info = dinfo;
			break;
		}
	}

	if (info == null) {
		console.log('did not find match, using default');
		info = devicesInfo[devicesInfo.length-1];
	}

	superLog('[id='+info.id+'][device='+info.device+'][browser='+info.browser+']');
	addCSS(info.css);
	_deviceInfo = info;
}


function mouseMove() {
	superLog('!!!!!!!! Mouse move detected');
	if (_deviceInfo.disableTouchOnMouseMove) {
		superLog(' - disable bespoke touch support + add :hover based CSS');
		disableTouch();
		addCSS('hover');
	}
	else {
		superLog(' - ignoring')
	}
	$('body').unbind('mousemove');
}

function init() {
	initDevice();
	_content = $('#page');
	$('#open-menu-img').click(function(event) { openMenu(); });
	initMenu();
	$('#fader').click(function(event) { closeMenu(); });
	$('body').mousemove(function(event) { mouseMove(); });

	var href = window.location.href;
	var i = href.indexOf('/share/');
	var shareKey = null;
	if (i != -1) {
		shareKey = href.substring(i+7);
		console.log('Need to display a shared appmark');
	}

	loadFromStorage('token', function(token) {
		log('token from local storage = '+token);
		if (!token) {
			var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
			token = '';
			for (var i=0;i<26;i++) {
				var rnum = Math.floor(Math.random() * chars.length);
				token += chars.substring(rnum,rnum+1);
			}
			log('saving token '+token+' to local storage');
			saveToStorage('token',token);
		}
		_token = token;
		loading('loading types...');
		_mam = new mamClient('http://www.myappmarks.com/',true);
		log('testsignedin');
		loading('signing in...');
		_mam.testsignedin(token,function() {
			log('testsignedin = '+_mam.signedin);
			if (shareKey)
				displaySharedAppmark(shareKey);
			else {
				if (_mam.signedin)
					displayContent();
				else
					displayNotSignedIn();
			}
		});
	});
}


$(document).ready(function() {
	init();
});