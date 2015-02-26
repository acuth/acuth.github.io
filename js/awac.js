var _app;

function Awac(varName) {
  this.varName = varName;
  console.log(this.varName+' = new Awac('+_app+')');
  this.container = _app;
  this.debug = true;
  if (this.container) {
    this.container.setVarName(varName);
    this.debug = false;
  }
  this.onrefresh = null;
  this.onresult = null;
  this.loaded = false;
}

Awac.prototype.toString = function() {
  return "{Awac var:"+this.varName+" loaded:"+this.loaded+" onresult:"+this.onresult+"}";
}

Awac.prototype.set = function(name,value) {
  if (this.debug) console.log(this.varName+'.set('+name+','+value+')');
  if (this.container) this.container.set(name,value);
}

Awac.prototype.get = function(name) {
  var value = this.container ? this.container.get(name) : null;
  if (this.debug) console.log(this.varName+'.get('+name+')='+value);
  return value;
}

Awac.prototype.store = function(name,value) {
  if (this.debug) console.log(this.varName+'.store('+name+','+value+')');
  if (this.container) this.container.store(name,value);
}

Awac.prototype.load = function(name) {
  var value = this.container ? this.container.load(name) : null;
  if (this.debug) console.log(this.varName+'.load('+name+')='+value);
  return value;
}

Awac.prototype.pageLoaded = function() {
  if (this.debug) console.log(this.varName+'.pageLoaded()');
  if (!this.loaded) {
    this.loaded = true;
    if (this.container) this.container.pageLoaded();
  }
}

Awac.prototype.newPage = function(name) {
  if (this.debug) console.log(this.varName+'.newPage('+name+')');
  if (this.container) this.container.newPage(name);
}

Awac.prototype.finishPage = function() {
  if (this.debug) console.log(this.varName+'.finishPage()');
  if (this.container) this.container.finishPage();
}

Awac.prototype.doRefresh = function() {
  if (this.debug) console.log(this.varName+'.doRefresh()');
  if (this.onrefresh)
    this.onrefresh();
  else
    this.finishRefresh();
}

Awac.prototype.doResult = function(ok) {
  if (this.debug) console.log(this.varName+'.doResult('+ok+')');
  if (this.onresult) this.onresult(ok);
}

Awac.prototype.finishRefresh = function() {
  if (this.debug) console.log(this.varName+'.finishRefresh()');
  if (this.container) this.container.finishRefresh();
}

Awac.prototype.loading = function(msg) {
  if (this.debug) console.log(this.varName+'.loading('+msg+')');
  if (!msg) msg = ' ';
  if (this.container) this.container.loading(msg);
}