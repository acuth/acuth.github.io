function MockApp(varName,framework) {
  console.log('new MockApp('+varName+','+framework+')');
  this.framework = framework;
  if (this.framework) this.framework.setVarName(varName);
  this.refreshCB = null;
}

MockApp.prototype.set = function(name,value) {
  console.log('mockapp.set('+name+','+value+')');
  if (this.framework) this.framework.set(name,value);
}

MockApp.prototype.get = function(name) {
  var value = this.framework ? this.framework.get(name) : null;
  console.log('mockapp.get('+name+')='+value);
  return value;
}

MockApp.prototype.pageLoaded = function() {
  console.log('mockapp.pageLoaded()');
  if (this.framework) this.framework.pageLoaded();
}

MockApp.prototype.newPage = function(name) {
  console.log('mockapp.newPage('+name+')');
    if (this.framework) this.framework.newPage(name);
}

MockApp.prototype.finishPage = function() {
  console.log('mockapp.finishPage()');
  if (this.framework) this.framework.finishPage();
}

MockApp.prototype.onRefresh = function() {
  console.log('mockapp.onRefresh()');
  if (this.refreshCB)
    this.refreshCB();
  else
    this.finishRefresh();
}

MockApp.prototype.finishRefresh = function() {
  console.log('mockapp.finishRefresh()');
  if (this.framework) this.framework.finishRefresh();
}