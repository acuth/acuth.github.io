// Awac is the public face of the container to a page but is really just a wrapper


Awac.prototype.getDims = function() {
  var result = JSON.parse(this.container.getDims());
  //console.log(' - fixup getDims() result');
  //var w = $(window).width();
  //result.height = result.height*w/result.width;
  //result.width = w;
  return result;
};

Awac.prototype.setOnTransitionEnd = function(cb) {
  //console.log('_awac.setOnTransitionEnd()');
  this.transitionEndCallback = cb;
};

Awac.prototype.fireTransitionEnd = function() {
  //console.log('_awac.fireTransitionEnd()');
  if (this.transitionEndCallback) {
    this.transitionEndCallback();
  }
};

Awac.prototype.setMdlPageCss = function(containerId,mdlCssUrl) {
  //console.log('_awac.setMdlPageCss()');
  //if (mdlCssUrl) console.log(' - mdlCssUrl = '+mdlCssUrl); else console.log(' - mdlCssUrl not set');

  var dims = this.getDims();
  if (dims.width === 0 || dims.height === 0) {
    console.log(' - dims not set - retry in 50ms');
    var awac = this;
    setTimeout(function() { awac.setMdlPageCss(containerId,mdlCssUrl); },50);
    return;
  }

  var containerElem = document.getElementById(containerId);
  var headElem = document.getElementsByTagName('head')[0];
  this.container.setMdlPageCss(headElem,containerElem,dims,mdlCssUrl);
};

/* Call this to make the web page visible which uses Material Design Lite */
Awac.prototype.startMdlPage = function(containerId,mdlCssUrl) {
  //console.log('_awac.startMdlPage()');
  //if (mdlCssUrl) console.log(' - mdlCssUrl = '+mdlCssUrl); else console.log(' - mdlCssUrl not set');

  this.startPage();
  var awac = this;
  setTimeout(function() { awac.setMdlPageCss(containerId,mdlCssUrl); },50);
};
