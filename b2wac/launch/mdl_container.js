function B2wacContainer(b2wac,awac,tag,url,iparam) {
  console.log('new B2wacContainer('+awac+')');
  this.debug = true;
  this.varName = null;
  this.b2wac = b2wac;
  this.awac = awac;
  this.onBackCB = false;
  this.onActionCB = false;
  this.tag = tag;
  this.url = url;
  this.iparam = iparam;
  this.title = null;
  this.homeItem = null;
  this.actionBarItems = [];
  this.showNavDrawer = false;
  this.mdlCssUrl = null;
}

B2wacContainer.prototype.addAction = function(header,i) {
  var item = JSON.parse(this.actionBarItems[i]);
  var container = this;
  var div = $(document.createElement('div')).addClass('action-icon').css('float','right');
  if (item.icon) div.html('<i class="material-icons">'+item.icon+'</i>'); else div.html(item.label);
  div.click(function() { container.action(i); }).appendTo(header);
};


B2wacContainer.prototype.addBack = function(header) {
  var container = this;
  var div = $(document.createElement('div')).addClass('action-icon').css('float','left');
  div.html('<i class="material-icons">arrow_back</i>').click(function() { container.back(); }).appendTo(header);
};

B2wacContainer.prototype.addHome = function(header) {
  var item = JSON.parse(this.homeItem);
  var container = this;
  var div = $(document.createElement('div')).addClass('action-icon').css('float','left');
  if (item.icon) div.html('<i class="material-icons">'+item.icon+'</i>'); else div.html(utem.label);
  div.click(function() { container.home(); }).appendTo(header);
};

B2wacContainer.prototype.updateHeader = function() {
  console.log('\n\nB2wacContainer.updateHeader()');
  this.b2wac.updateHeader(this.title,this.showNavDrawer,this.homeItem,this.actionBarItems);
};

B2wacContainer.prototype.back = function() {
  this.b2wac.back();
};

B2wacContainer.prototype.home = function() {
  var item = JSON.parse(this.homeItem);
  this.awac.fireAction(item.action);
};

B2wacContainer.prototype.action = function(i) {
  var item = JSON.parse(this.actionBarItems[i]);
  this.awac.fireAction(item.action);
};

B2wacContainer.prototype.setVarName = function(varName) {
  if (this.debug) console.log('var '+varName+' = new Awac()');
  this.varName = varName;
};

B2wacContainer.prototype.toString = function() {
  return "{B2wacContainer var:"+this.varName+" onBackCB:"+this.onBackCB+"}";
};

B2wacContainer.prototype.setTitle = function(title) {
  if (this.debug) console.log(this.varName+'.setTitle('+title+')');
  this.title = title;
};

B2wacContainer.prototype.addNavDrawerItem = function(json) {
  if (this.debug) console.log(this.varName+'.addNavDrawerItem('+json+')');
  this.b2wac.addNavDrawerItem(json);
};

B2wacContainer.prototype.addOptionsMenuItem = function(json) {
  if (this.debug) console.log(this.varName+'.addOptionsMenuItem('+json+')');
};

B2wacContainer.prototype.addActionBarItem = function(json) {
  if (this.debug) console.log(this.varName+'.addActionBarItem('+json+')');
  this.actionBarItems[this.actionBarItems.length] = json;
};

B2wacContainer.prototype.setPageColors = function(json) {
  if (this.debug) console.log(this.varName+'.setPageColors('+json+')');
};

B2wacContainer.prototype.setAppColors = function(json) {
  if (this.debug) console.log(this.varName+'.setAppColors('+json+')');
};

B2wacContainer.prototype.getColors = function() {
  if (this.debug) console.log(this.varName+'.getColors() NYI');
  return null;
};

B2wacContainer.prototype.setMdlCssUrl = function(url) {
  this.mdlCssUrl = url;
};

// retrieve the Mdl CSS url, not this may be specified on the container or inherited from
// a parent container or from the app level itself
B2wacContainer.prototype.getMdlCssUrl = function() {
  var url = this.mdlCssUrl;
  if (!url) {
    var prevContainer = this.b2wac.getPrevContainer(this);
    url = (prevContainer == null) ? this.b2wac.getMdlCssUrl() : prevContainer.getMdlCssUrl();
  }
  return url;
};

// apply the specified Mdl CSS url to the page the container is holding
B2wacContainer.prototype.applyMdlCssUrl = function(headElem,url) {
  console.log('!!!!!!!!!!!!!!!!!!!!! B2wacContainer.applyMdlCssUrl()\n - url = '+url);
  var link = document.createElement('link');
  link.id = 'iframe-mdl-css';
  link.rel = 'stylesheet';
  link.href = url;
  headElem.appendChild(link);
};


B2wacContainer.prototype.setMdlPageCss = function(headElem,containerElem,dims,mdlCssUrl) {
  //console.log('\n\n\n!!!!!!!!!!!!!!!!!!!!! B2wacContainer.setMdlPageCss()');
  this.setMdlCssUrl(mdlCssUrl);

  containerElem.style.width = dims.width+'px';
  containerElem.style.height = dims.height+'px';

  var url = this.getMdlCssUrl();
  this.b2wac.applyMdlCssUrl(url);
  this.applyMdlCssUrl(headElem,url);
};

// NOte this can be used when a covered page is revealed
B2wacContainer.prototype.updateMdlPageCss = function() {
  //console.log('\n\n\n!!!!!!!!!!!!!!!!!!!!! B2wacContainer.updateMdlPageCss()');
  var url = this.getMdlCssUrl();
  this.b2wac.applyMdlCssUrl(url);
};


B2wacContainer.prototype.setHomeItem = function(json) {
  if (this.debug) console.log(this.varName+'.setHomeItem('+json+')');
  this.homeItem = json;
};

B2wacContainer.prototype.unlockNavDrawer = function() {
  if (this.debug) console.log(this.varName+'.unlockNavDrawer()');
  this.showNavDrawer = true;
};

B2wacContainer.prototype.set = function(name,value) {
  if (this.debug) console.log(this.varName+'.set('+name+','+value+')');
  this.b2wac.values[name] = value;
};

B2wacContainer.prototype.get = function(name) {
  var value = this.b2wac.values[name];
  if (this.debug) console.log(this.varName+'.get('+name+')='+value);
  return value;
};

B2wacContainer.prototype.getImplementation = function() {
  if (this.debug) console.log(this.varName+'.getImplementation()=mock');
  return 'b2wac';
};

B2wacContainer.prototype.store = function(name,value) {
  if (this.debug) console.log(this.varName+'.store('+name+','+value+')');
  localStorage.setItem(name,value);
};

B2wacContainer.prototype.load = function(name) {
  var value = localStorage.getItem(name);
  if (this.debug) console.log(this.varName+'.load('+name+')='+value);
  return value;
};

B2wacContainer.prototype.sendMessage = function(msgId,value) {
  if (this.debug) console.log(this.varName+'.sendMessage('+msgId+','+value+')');
};

B2wacContainer.prototype.openPage = function(tag,url,value) {
  if (this.debug) console.log(this.varName+'.openPage('+tag+','+url+','+value+')');
  this.b2wac.openPage(tag,url,value);
};

B2wacContainer.prototype.replacePage = function(tag,url,value,next) {
  if (this.debug) console.log(this.varName+'.replacePage('+tag+','+url+','+value+','+next+')');
  this.b2wac.replacePage(tag,url,value,next);
};

B2wacContainer.prototype.newApp = function(url) {
  if (this.debug) console.log(this.varName+'.newApp('+url+')');
  window.location.href = url;
};

B2wacContainer.prototype.startPage = function() {
  if (this.debug) console.log(this.varName+'.startPage()');
  this.b2wac.startPage();
};

B2wacContainer.prototype.endPage = function(value) {
  if (this.debug) console.log(this.varName+'.endPage('+value+')');
  this.b2wac.endPage(this.tag,true,value);
};

B2wacContainer.prototype.showList = function(items) {
  if (this.debug) console.log(this.varName+'.showList('+items+')');
  this.b2wac.showList(items);
};

B2wacContainer.prototype.showDialog = function(msg,ok,cancel) {
  if (this.debug) console.log(this.varName+'.showDialog('+msg+','+ok+','+cancel+')');
  this.b2wac.showDialog(msg,ok,cancel);
};

B2wacContainer.prototype.fireDialogResult = function(yes) {
  if (this.debug) console.log(this.varName+'.fireDialogResult('+yes+')');
  this.awac.fireDialogResult(yes);
};

B2wacContainer.prototype.fireSignInOut = function(user) {
  if (this.debug) console.log(this.varName+'.fireSignInOut('+user+')');
  this.awac.fireSignInOut(user);
};

B2wacContainer.prototype.alert = function(msg) {
  if (this.debug) console.log(this.varName+'.alert('+msg+')');
  this.b2wac.alert(msg);
};

B2wacContainer.prototype.gotOnRefreshCB = function() {
  if (this.debug) console.log(this.varName+'.gotOnRefreshCB()');
};

B2wacContainer.prototype.gotOnBackPressedCB = function() {
  if (this.debug) console.log(this.varName+'.gotOnBackPressedCB()');
  this.onBackCB = true;
};

B2wacContainer.prototype.gotOnActionCB = function() {
  if (this.debug) console.log(this.varName+'.gotOnActionCB()');
  this.onActionCB = true;
};

B2wacContainer.prototype.gotOnMessageCB = function() {
  if (this.debug) console.log(this.varName+'.gotOnMessageCB()');
};

B2wacContainer.prototype.gotOnPageCloseCB = function() {
  if (this.debug) console.log(this.varName+'.gotOnPageCloseCB()');
};

B2wacContainer.prototype.startRefresh = function() {
  if (this.debug) console.log(this.varName+'.startRefresh()');
  this.b2wac.startRefresh();
};

B2wacContainer.prototype.endRefresh = function() {
  if (this.debug) console.log(this.varName+'.endRefresh()');
  this.b2wac.endRefresh();
};

B2wacContainer.prototype.startBackground = function(url) {
  if (this.debug) console.log(this.varName+'.startBackground('+url+')');
};

B2wacContainer.prototype.stopBackground = function() {
  if (this.debug) console.log(this.varName+'.stopBackground()');
};

B2wacContainer.prototype.makeBackgroundRequest = function(msgId,value) {
  if (this.debug) console.log(this.varName+'.makeBackgroundRequest('+msgId+','+value+')');
};

B2wacContainer.prototype.callBackground = function() {
  if (this.debug) console.log(this.varName+'.callBackground()');
};

B2wacContainer.prototype.getStackDepth = function() {
  if (this.debug) console.log(this.varName+'.getStackDepth()=0');
  return this.b2wac.getDepth();
};

B2wacContainer.prototype.getDims = function() {
  var dims = this.b2wac.getDims();
  var result = JSON.stringify(dims);
  //if (this.debug) console.log(this.varName+'.getDims()='+result);
  return result;
};

B2wacContainer.prototype.getParam=function(name) {
  var href = this.url;
  console.log('getParam() '+name+' from '+this.url);
  var i = href.indexOf('?');
  if (i == -1) return null;
  href = '&'+href.substring(i+1);
  var p = '&'+name+'=';
  i = href.indexOf(p);
  if (i == -1) return null;
  href = href.substring(i+p.length);
  i = href.indexOf('&');
  if (i != -1) href = href.substring(0,i);
  return href;
};

B2wacContainer.prototype.getInitParam = function() {
  if (this.debug) console.log(this.varName+'.getInitParam()='+this.iparam);
  return this.iparam;
};

B2wacContainer.prototype.getPageTag = function() {
  if (this.debug) console.log(this.varName+'.getPageTag()='+this.tag);
  return this.tag;
};

B2wacContainer.prototype.getUser = function() {
  var u = this.b2wac.getUser();
  if (this.debug) console.log(this.varName+'.getUser()');
  return u;
};

B2wacContainer.prototype.signIn = function() {
  if (this.debug) console.log(this.varName+'.signIn()');
  return this.b2wac.signIn();
};

B2wacContainer.prototype.signOut = function() {
  if (this.debug) console.log(this.varName+'.signOut()');
  return this.b2wac.signOut();
};

B2wacContainer.prototype.makeFBDBRequest = function(msgId,once,key) {
  var fbdb = this.b2wac.getFBDatabase();
  if (this.debug) console.log(this.varName+'.makeFBDBRequest(msgId='+msgId+',once='+once+',key='+key+')');
  var container = this;
  if (once)
    fbdb.ref(key).once('value').then(function(snapshot) {
      container.awac.fireFBDBResponse(msgId,snapshot.val());
    });
  else
    fbdb.ref(key).on('value',function(snapshot) {
      container.awac.fireFBDBResponse(msgId,snapshot.val());
    });
};

B2wacContainer.prototype.setFBDB = function(key,val) {
  var fbdb = this.b2wac.getFBDatabase();
  if (this.debug) console.log(this.varName+'.setFBDB(key='+key+',val='+JSON.stringify(val)+')');
  fbdb.ref(key).set(val);
};
