var _awac_;


function MockContainer(awac) {
  this.debug = true;
  this.values = new Object();
  this.varName = null;
  this.awac = awac;
}

MockContainer.prototype.setVarName = function(varName) {
  this.varName = varName;
}

MockContainer.prototype.toString = function() {
  return "{MockContainer var:"+this.varName+"}";
}

MockContainer.prototype.setTitle = function(title) {
  if (this.debug) console.log(this.varName+'.setTitle('+title+')');
  document.title = title;
}

MockContainer.prototype.startPage = function() {
  if (this.debug) console.log(this.varName+'.startPage()');
}

MockContainer.prototype.endPage = function() {
  if (this.debug) console.log(this.varName+'.endPage()');
  window.close();
}

MockContainer.prototype.unlockNavDrawer = function() {
  if (this.debug) console.log(this.varName+'.unlockNavDrawer()');
}

MockContainer.prototype.set = function(name,value) {
  if (this.debug) console.log(this.varName+'.set('+name+','+value+')');
  this.values[name] = value;
}

MockContainer.prototype.get = function(name) {
  var value = this.values[name];
  if (this.debug) console.log(this.varName+'.get('+name+')='+value);
  return value;
}

MockContainer.prototype.store = function(name,value) {
  if (this.debug) console.log(this.varName+'.store('+name+','+value+')');
  localStorage.setItem(name,value);
}

MockContainer.prototype.load = function(name) {
  var value = localStorage.getItem(name);
  if (this.debug) console.log(this.varName+'.load('+name+')='+value);
  return value;
}

MockContainer.prototype.openPage = function(tag,url) {
  if (this.debug) console.log(this.varName+'.openPage('+tag+','+url+')');
  window.open(url,tag);
}

MockContainer.prototype.startPage = function() {
  if (this.debug) console.log(this.varName+'.startPage()');
}

MockContainer.prototype.endPage = function() {
  if (this.debug) console.log(this.varName+'.endPage()');
  //window.close();
}

MockContainer.prototype.showDialog = function(msg,ok,cancel) {
  if (this.debug) console.log(this.varName+'.showDialog('+msg+','+ok+','+cancel+')');
  var yes = confirm(msg);
  this.awac.fireDialogResult(yes);
}

MockContainer.prototype.gotOnRefreshCB = function() {
  if (this.debug) console.log(this.varName+'.gotOnRefreshCB()');
}

MockContainer.prototype.gotOnBackPressedCB = function() {
  if (this.debug) console.log(this.varName+'.gotOnBackPressedCB()');
}

MockContainer.prototype.finishRefresh = function() {
  if (this.debug) console.log(this.varName+'.finishRefresh()');
}

MockContainer.prototype.getStackDepth = function() {
  if (this.debug) console.log(this.varName+'.getStackDepth()=0');
  return 0;
}


function Awac(varName) {
  this.varName = varName;
  console.log(this.varName+' = new Awac('+_awac_+')');
  this.container = _awac_ ? _awac_ : new MockContainer(this);
  this.container.setVarName(varName);
  console.log(' - this.container='+this.container);
  this.ondialog = null;
  this.onrefresh = null;
  this.onresult = null;
  this.started = false;
  this.debug = true;
}

Awac.prototype.toString = function() {
  return "{Awac var:"+this.varName+" loaded:"+this.loaded+" onresult:"+this.onresult+"}";
}

Awac.prototype.setTitle = function(title) {
  this.container.setTitle(title);
}

Awac.prototype.getStackDepth = function() {
  return this.container.getStackDepth();
}

Awac.prototype.unlockNavDrawer = function() {
  this.container.unlockNavDrawer();
}

Awac.prototype.set = function(name,value) {
  this.container.set(name,value);
}

Awac.prototype.get = function(name) {
  return this.container.get(name);
}

Awac.prototype.store = function(name,value) {
  this.container.store(name,value);
}

Awac.prototype.load = function(name) {
  return this.container.load(name);
}

/* Call this to make the web page visible */
Awac.prototype.startPage = function() {
  if (!this.started) {
    this.started = true;
    this.container.startPage();
  }
}

/* End displaying the page and pop it off the stack */
Awac.prototype.endPage = function() {
  this.container.endPage();
}

/* Pop a new page onto the stack */
Awac.prototype.openPage = function(tag,url) {
  this.container.openPage(tag,url);
}

Awac.prototype.dialog = function(msg,ok,cancel,cb) {
  this.ondialog = cb;
  this.container.showDialog(msg,ok,cancel);
}

// set callbacks

Awac.prototype.setOnRefresh = function(cb) {
  this.container.gotOnRefreshCB();
  this.onrefresh = cb;
}

Awac.prototype.setOnResult = function(cb) {
  this.container.gotOnResultCB();
  this.onresult = cb;
}

Awac.prototype.setOnBackPressed = function(cb) {
  this.container.gotOnBackPressedCB();
  this.onbackpressed = cb;
}

Awac.prototype.doRefresh = function() {
  if (this.debug) console.log('Awac.doRefresh()');
  if (this.onrefresh) this.onrefresh();
}

// fire callbacks

Awac.prototype.fireDialogResult = function(ok) {
  if (this.debug) console.log('Awac.fireDialogResult('+ok+')');
  if (this.ondialog) this.ondialog(ok);
  this.ondialog = null;
}

Awac.prototype.doResult = function(ok) {
  if (this.debug) console.log('Awac.doResult('+ok+')');
  if (this.onresult) this.onresult(ok);
}

Awac.prototype.doBackPressed = function() {
  if (this.debug) console.log('Awac.doBackPressed()');
  if (this.onbackpressed) this.onbackpressed();
}

Awac.prototype.finishRefresh = function() {
  if (this.debug) console.log('Awac.finishRefresh()');
  if (this.container) this.container.finishRefresh();
}

