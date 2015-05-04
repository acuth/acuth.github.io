function setImgElemSrc(imgElem,a) {
  imgElem.setAttribute('src','http://www.myappmarks.com/'+a.icon_url);
	//setImgElemSrcFromType(imgElem,a.type);
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
  //console.log('AppmarkCard.drawContents()');
	this.getTitleDiv().appendTo(this.div);
	//console.log(' - title');
	this.getCommentDiv().appendTo(this.div);
		//console.log(' - comment');
	this.getActionDiv().appendTo(this.div);
		//console.log(' - action');
	var blurb = this.getBlurbDiv(this.shared);
	if (blurb) blurb.appendTo(this.div);
		//console.log(' - blurb');
	this.getControls(this.shared).appendTo(this.div);
		//console.log(' - controls');
};

AppmarkCard.prototype.update=function(a) {
	a.invoke_str = this.a.invoke_str;
	a.invoke_url = this.a.invoke_url;
	this.a = a;
	this.div.html('');
	this.drawContents();
	this.addControlEventHandlers();
};

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
};

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
};

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
};

AppmarkCard.prototype.makeEditable=function(selector) {
	console.log('makeEditable('+this.n+')');
	this.startEdit(selector);
	setHeaderControls(this.n);
	_editingCard = this;
};

AppmarkCard.prototype.doDelete=function() {
	superLog('delete card '+this.a.title);
	var card = this;
	_mam.deleteappmark(this.a.key,function(appmark) {
		superLog('appmark deleted');
		card.div.detach();
	});
};

AppmarkCard.prototype.confirmDelete=function() {
	var msg = 'Do you really wish to delete \''+this.a.title+'\'?';
	var card = this;
	doConfirm(msg,function(ok) {
		superLog('delete card ok='+ok);
		if (ok) card.doDelete();
	});
};

AppmarkCard.prototype.star=function(starred) {
	var card = this;
	_mam.updateappmark2(this.a.key,this.getTitle(),this.getComment(),starred,function(updatedAppmark){
		console.log('[un-]starred');
		card.updateStar(updatedAppmark);
		var msg = starred ? 'Added to favorites...' : 'Removed from favorites...';
		getMessage().show(msg);
	});
};

AppmarkCard.prototype.clickOnControl=function(action) {
	console.log('clickOnControl('+this.n+','+action+')');
	if (action=='edit-title') {
		app.set('appmark-to-be-edited-index',this.n);
		app.set('appmark-to-be-edited-json',this.a.json);
		app.openPage('card','card.html');
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
	else if (action=='share') {
	}
	else {
		console.log('clickOnControl( '+this.n+', '+this.a.title+', '+action+' )');
	}
};

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
};

AppmarkCard.prototype.fillTitleDiv=function(div) {
	div.html(this.a.title);
	if (!this.a.read_only) this.getControl('edit-title','edit-64','Edit appmark title').appendTo(div);
};

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
	//if (_displayLink) link += '<br/><span style="font-size:80%;">'+this.a.invoke_url+'</span>';
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

	this.getControl('share','email-64','Share appmark',null,true).appendTo(div);
	this.getControl('edit','twitter-64','Edit appmark',null,true).appendTo(div);

	if (!shared) this.getControl('delete','delete-64','Delete appmark',null,true).appendTo(div);

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