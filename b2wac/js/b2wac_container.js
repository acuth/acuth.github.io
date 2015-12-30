function B2wacContainer(awac) {
  console.log('new B2wacContiner('+awac+')')
  this.debug = true;
  this.values = {};
  this.varName = null;
  this.awac = awac;
}

B2wacContainer.prototype.setVarName = function(varName) {
  if (this.debug) console.log('var '+varName+' = new Awac()');
  this.varName = varName;
};

B2wacContainer.prototype.toString = function() {
  return "{B2wacContainer var:"+this.varName+"}";
};

B2wacContainer.prototype.setTitle = function(title) {
  if (this.debug) console.log(this.varName+'.setTitle('+title+')');
  if (title) {
    document.title = title;
    $('#page-title').html(title);
  }
};

B2wacContainer.prototype.addNavDrawerItem = function(json) {
  if (this.debug) console.log(this.varName+'.addNavDrawerItem('+json+')');
};

B2wacContainer.prototype.addOptionsMenuItem = function(json) {
  if (this.debug) console.log(this.varName+'.addOptionsMenuItem('+json+')');
};

B2wacContainer.prototype.addActionBarItem = function(json) {
  if (this.debug) console.log(this.varName+'.addActionBarItem('+json+')');
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
};

B2wacContainer.prototype.startPage = function() {
  if (this.debug) console.log(this.varName+'.startPage()');
};

B2wacContainer.prototype.endPage = function() {
  if (this.debug) console.log(this.varName+'.endPage()');
  window.close();
};

B2wacContainer.prototype.unlockNavDrawer = function() {
  if (this.debug) console.log(this.varName+'.unlockNavDrawer()');
};

B2wacContainer.prototype.set = function(name,value) {
  if (this.debug) console.log(this.varName+'.set('+name+','+value+')');
  this.values[name] = value;
};

B2wacContainer.prototype.get = function(name) {
  var value = this.values[name];
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
  window.open(url+'?initparam='+value,tag);
};

B2wacContainer.prototype.replacePage = function(tag,url,value,next) {
  if (this.debug) console.log(this.varName+'.replacePage('+tag+','+url+','+value+','+next+')');
  window.open(url+'?initparam='+value,tag);
};

B2wacContainer.prototype.newApp = function(url) {
  if (this.debug) console.log(this.varName+'.newApp('+url+')');
  window.location.href = url;
};

B2wacContainer.prototype.startPage = function() {
  if (this.debug) console.log(this.varName+'.startPage()');
  $('#page iframe').css('display','block');
};

B2wacContainer.prototype.endPage = function(value) {
  if (this.debug) console.log(this.varName+'.endPage('+value+')');
  //window.close();
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
};

B2wacContainer.prototype.gotOnActionCB = function() {
  if (this.debug) console.log(this.varName+'.gotOnActionCB()');
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
  var href = window.location.href;
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
  var value = this.getParam('initparam');
  if (this.debug) console.log(this.varName+'.getInitParam()='+value);
  return value;
};

B2wacContainer.prototype.getPageTag = function() {
  if (this.debug) console.log(this.varName+'.getPageTag()=default');
  return 'default';
};

