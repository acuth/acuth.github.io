function downloadURL3(url,cb) {
	log('downloadURL3('+url+')');
	var xhr = new XMLHttpRequest();
	xhr.open("GET",url,true);
	xhr.onreadystatechange = function() {
  		if (xhr.readyState == 4) {
    		// JSON.parse does not evaluate the attacker's scripts.
    		//console.log('got response '+xhr.responseText);
    		var resp = JSON.parse(xhr.responseText);
    		//log('about to call cb');
    		cb(resp);
  		}
	}
	xhr.send();
}

function MockApp(varName,framework) {
  this.varName = varName;
  console.log(this.varName+' = new MockApp('+framework+')');
  this.framework = framework;
  if (this.framework) this.framework.setVarName(varName);
  this.refreshCB = null;
  this.resumeCB = null;
  this.loaded = false;
  this.debug = true;
}

MockApp.prototype.set = function(name,value) {
  if (this.debug) console.log(this.varName+'.set('+name+','+value+')');
  if (this.framework) this.framework.set(name,value);
}

MockApp.prototype.get = function(name) {
  var value = this.framework ? this.framework.get(name) : null;
  if (this.debug) console.log(this.varName+'.get('+name+')='+value);
  return value;
}

MockApp.prototype.store = function(name,value) {
  if (this.debug) console.log(this.varName+'.store('+name+','+value+')');
  if (this.framework) this.framework.store(name,value);
}

MockApp.prototype.load = function(name) {
  var value = this.framework ? this.framework.load(name) : null;
  if (this.debug) console.log(this.varName+'.load('+name+')='+value);
  return value;
}

MockApp.prototype.pageLoaded = function() {
  if (this.debug) console.log(this.varName+'.pageLoaded()');
  if (!this.loaded) {
    this.loaded = true;
    if (this.framework) this.framework.pageLoaded();
  }
}

MockApp.prototype.newPage = function(name) {
  if (this.debug) console.log(this.varName+'.newPage('+name+')');
  if (this.framework) this.framework.newPage(name);
}

MockApp.prototype.finishPage = function() {
  if (this.debug) console.log(this.varName+'.finishPage()');
  if (this.framework) this.framework.finishPage();
}

MockApp.prototype.onRefresh = function() {
  if (this.debug) console.log(this.varName+'.onRefresh()');
  if (this.refreshCB)
    this.refreshCB();
  else
    this.finishRefresh();
}

MockApp.prototype.onResume = function() {
  if (this.debug) console.log(this.varName+'.onResume()');
  if (this.resumeCB) this.resumeCB();
}

MockApp.prototype.finishRefresh = function() {
  if (this.debug) console.log(this.varName+'.finishRefresh()');
  if (this.framework) this.framework.finishRefresh();
}

MockApp.prototype.loading = function(msg) {
  if (!msg) msg = ' ';
  if (this.debug) console.log(this.varName+'.loading('+msg+')');
  if (this.framework) this.framework.loading(msg);
}