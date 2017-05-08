Awac.prototype.getDims = function() {
  var result = JSON.parse(this.container.getDims());
  console.log(' - fixup getDims() result');
  var w = $(window).width();
  //result.height = result.height*w/result.width;
  //result.width = w;
  return result;
};

Awac.prototype.setOnTransitionEnd = function(cb) {
  console.log('setOnTransitionEnd()');
  this.transitionEndCallback = cb;
};

Awac.prototype.fireTransitionEnd = function() {
  console.log('fireTransitionEnd()');
  if (this.transitionEndCallback) {
    this.transitionEndCallback();
  }
};

/* Call this to make the web page visible which uses Material Design Lite */
Awac.prototype.startMdlPage = function(containerId,mdlCssUrl) {
  if (!mdlCssUrl) mdlCssUrl = this.container.getMdlCssUrl();
  console.log('Awac.startMdlPage()\n - mdlCssUrl='+mdlCssUrl);
  this.startPage();
  var awac = this;
  setTimeout(function() { awac.setMdlCss(containerId,mdlCssUrl); },50);
};


Awac.prototype.setMdlCss = function(containerId,mdlCssUrl) {
  console.log('Awac.setMdlCss()\n - url='+mdlCssUrl);
  var dims = this.getDims();
  console.log(' - dims='+dims.width+'x'+dims.height);
  if (dims.width === 0 || dims.height === 0) {
    console.log(' - dims not set - retry in 50ms');
    var awac = this;
    setTimeout(function() { awac.setMdlCss(containerId,mdlCssUrl); },50);
    return;
  }

  var e = document.getElementById(containerId);
  e.style.width = dims.width+'px';
  e.style.height = dims.height+'px';

  var urls = mdlCssUrl.split(',');
  for (var i=0;i<urls.length;i++) {
    var link = document.createElement( 'link' );
    link.href = urls[i];
    link.type = 'text/css';
    link.rel = 'stylesheet';
    document.getElementsByTagName( 'head' )[0].appendChild( link );
  }
  // tell MDL component handler to upgrade the page
  componentHandler.upgradeDom();
};
