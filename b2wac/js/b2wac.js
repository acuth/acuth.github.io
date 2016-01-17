function Frame(url,iframe) {
  this.url = url;
  this.iframe = iframe;
  this.container = null;
}

Frame.prototype.newContainer=function(b2wac,awac) {
  this.b2wac = b2wac;
  this.container = new B2wacContainer(b2wac,awac,this.url);
  return this.container;
};

Frame.prototype.showPage=function() {
  this.iframe.attr('src',this.url);
};

Frame.prototype.conceal=function() {
  this.iframe.css('display','none');
};

Frame.prototype.reveal=function() {
  this.iframe.css('display','block');
};

Frame.prototype.toString=function() {
  return '{Frame url='+this.url+' container='+this.container+'}';
};
  
function B2wac(rootUrl,pageDiv) {
  var i = rootUrl.indexOf('?');
  this.rootUrl = i == -1 ? rootUrl : rootUrl.substring(0,i);
  this.pageDiv = pageDiv;
  this.frameStack = [];
  this.nFrame = 0;
  this.values = {};
}


B2wac.prototype.init=function(href) {
  //var pageUrl = '../../test/index.html';
  var pageUrl = '../../yangw/index2.html';
  console.log('href='+href);
  if (href) {
    var i = href.indexOf('url=');
    if (i != -1) {
      var j = href.indexOf('&',i);
      var url = j == -1 ? href.substring(i+4) : href.substring(i+4,j);
      url = decodeURIComponent(url);
      console.log('extract url='+url);
      pageUrl = url;
    }
  }
 
  console.log('init('+pageUrl+')');
  this.openPage(null,pageUrl,null);
};

B2wac.prototype.getContainer=function(awac) {
  return this.frameStack[this.nFrame-1].newContainer(this,awac);
}; 

B2wac.prototype.revealPage=function() {
  this.frameStack[this.nFrame-1].reveal();
};


B2wac.joinUrl=function(url0,url1) {
  console.log('joinUrl(url0='+url0+',url1='+url1+')');
  if (!url0) return url1;
  if (url1.indexOf('http') === 0) return url1;
  var i = url0.indexOf('://');
  var protocol = url0.substring(0,i+3);
  url0 = url0.substring(i+3);
  i = url0.indexOf('?');
  if (i != -1) url0 = url0.substring(0,i);
  if (url1.indexOf('/') === 0) {
    var url = protocol + url0.substring(0,url0.indexOf('/')) + url1;
    return url;
  }
  if (url1.indexOf('./') === 0) {
    var url = protocol + url0.substring(0,url0.lastIndexOf('/')) + url1.substring(1);
    return url;
  }
  i = url0.lastIndexOf('/');
  url0 = url0.substring(0,i);
  for(;;) {
    if (url1.indexOf('../') !== 0) break;
    url1 = url1.substring(3);
    i = url0.lastIndexOf('/');
    url0 = url0.substring(0,i);
  }
  var url = protocol + url0 + '/' + url1;
  return url;
};

B2wac.prototype.resolvePageUrl=function(currentUrl,pageUrl) {
  var url = B2wac.joinUrl(currentUrl,pageUrl);
  console.log('resolved-url='+url);
  return url;  
};

B2wac.prototype.openPage=function(tag,pageUrl,value) {
  var currentUrl = this.rootUrl;
  if (this.nFrame > 0) {
    var frame = this.frameStack[this.nFrame-1];
    frame.conceal();
    currentUrl = frame.url;
  }
  if (value) pageUrl += '?initparam='+value;
  pageUrl = this.resolvePageUrl(currentUrl,pageUrl);
  var iframe = $(document.createElement('iframe')).appendTo($('#'+this.pageDiv));
  this.nFrame++;
  this.frameStack[this.nFrame-1] = new Frame(pageUrl,iframe);
  this.frameStack[this.nFrame-1].showPage();
};


B2wac.prototype.replacePage=function(tag,pageUrl,value,next) {
  var frame = this.frameStack[this.nFrame-1];
  frame.conceal();
  var currentUrl = frame.url;
  if (value) pageUrl += '?initparam='+value;
  pageUrl = this.resolvePageUrl(currentUrl,pageUrl);
  var iframe = $(document.createElement('iframe')).appendTo($('#'+this.pageDiv));
  this.frameStack[this.nFrame-1] = new Frame(pageUrl,iframe);
  this.frameStack[this.nFrame-1].showPage();
};

B2wac.prototype.endPage=function() {
  this.frameStack[this.nFrame-1].conceal();
  this.frameStack[this.nFrame-1] = null;
  this.nFrame--;
  this.frameStack[this.nFrame-1].reveal();
};

B2wac.prototype.debugFrameStack=function() {
  console.log('n-frame='+this.nFrame);
  for (var i=0;i<this.nFrame;i++) {
    console.log('frame['+i+']='+this.frameStack[i]);
  }
};

B2wac.prototype.back=function() {
  console.log('back()');
  var frame = this.frameStack[this.nFrame-1];
  if (frame.container.onBackCB) {
    console.log("fire onBackCB");
    frame.container.awac.fireBackPressed();
  }
  else {
    console.log('default back() behaviour');
    this.endPage();
  }
};