function B2wacContainer(b2wac,awac,tag,url,iparam) {
  console.log('new B2wacContiner('+awac+')');
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
  var header = $('#page-header').html(null);
  if (this.homeItem) 
    this.addHome(header);
  else
    this.addBack(header);
  $(document.createElement('div')).attr('id','page-title').html(this.title).appendTo(header);
  for (var i=this.actionBarItems.length;i>0;i--) this.addAction(header,i-1);
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

B2wacContainer.prototype.setHomeItem = function(json) {
  if (this.debug) console.log(this.varName+'.setHomeItem('+json+')');
  this.homeItem = json;
};

B2wacContainer.prototype.startPage = function() {
  if (this.debug) console.log(this.varName+'.startPage()');
};

B2wacContainer.prototype.unlockNavDrawer = function() {
  if (this.debug) console.log(this.varName+'.unlockNavDrawer()');
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
  this.b2wac.revealPage();
};

B2wacContainer.prototype.endPage = function(value) {
  if (this.debug) console.log(this.varName+'.endPage('+value+')');
  this.b2wac.endPage(true,value);
};

B2wacContainer.prototype.showList = function(items) {
  if (this.debug) console.log(this.varName+'.showList('+items+')');
  var yes = confirm('MoclContainer.showList() NYI');
  this.awac.fireListResult(yes?1:0);
};

B2wacContainer.prototype.showDialog = function(msg,ok,cancel) {
  if (this.debug) console.log(this.varName+'.showDialog('+msg+','+ok+','+cancel+')');
  var yes = confirm(msg);
  this.awac.fireDialogResult(yes);
};

B2wacContainer.prototype.alert = function(msg) {
  if (this.debug) console.log(this.varName+'.alert('+msg+')');
  alert(msg);
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
};

B2wacContainer.prototype.endRefresh = function() {
  if (this.debug) console.log(this.varName+'.endRefresh()');
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
  return 0;
};

B2wacContainer.prototype.getDims = function() {
  if (this.debug) console.log(this.varName+'.getDims()=768x1024');
  return '{"width":768,"height":1024}';
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

