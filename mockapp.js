function MockApp(framework) {
  console.log('new MockApp('+framework+')');
  this.framework = framework;
  this.onRefresh = null;
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