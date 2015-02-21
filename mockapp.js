function MockApp(varName,framework) {
  this.varName = varName;
  console.log(this.varName+' = new MockApp('+framework+')');
  this.framework = framework;
  if (this.framework) this.framework.setVarName(varName);
  this.refreshCB = null;
  this.resumeCB = null;
  this.loaded = false;
}

MockApp.prototype.set = function(name,value) {
  console.log(this.varName+'.set('+name+','+value+')');
  if (this.framework) this.framework.set(name,value);
}

MockApp.prototype.get = function(name) {
  var value = this.framework ? this.framework.get(name) : null;
  console.log(this.varName+'.get('+name+')='+value);
  return value;
}

MockApp.prototype.store = function(name,value) {
  console.log(this.varName+'.store('+name+','+value+')');
  if (this.framework) this.framework.store(name,value);
}

MockApp.prototype.load = function(name) {
  var value = this.framework ? this.framework.load(name) : null;
  console.log(this.varName+'.load('+name+')='+value);
  return value;
}

MockApp.prototype.pageLoaded = function() {
  console.log(this.varName+'.pageLoaded()');
  if (!this.loaded) {
    this.loaded = true;
    if (this.framework) this.framework.pageLoaded();
  }
}

MockApp.prototype.newPage = function(name) {
  console.log(this.varName+'.newPage('+name+')');
    if (this.framework) this.framework.newPage(name);
}

MockApp.prototype.finishPage = function() {
  console.log(this.varName+'.finishPage()');
  if (this.framework) this.framework.finishPage();
}

MockApp.prototype.onRefresh = function() {
  console.log(this.varName+'.onRefresh()');
  if (this.refreshCB)
    this.refreshCB();
  else
    this.finishRefresh();
}

MockApp.prototype.onResume = function() {
  console.log(this.varName+'.onResume()');
  if (this.resumeCB) this.resumeCB();
}

MockApp.prototype.finishRefresh = function() {
  console.log(this.varName+'.finishRefresh()');
  if (this.framework) this.framework.finishRefresh();
}