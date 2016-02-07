function Frame(tag,url,iparam,iframe) {
  this.id = Frame.count++;
  this.tag = tag;
  this.url = url;
  this.iparam = iparam;
  this.iframe = iframe;
  this.container = null;
}

Frame.count = 0;

Frame.prototype.newContainer=function(b2wac,awac) {
  this.b2wac = b2wac;
  this.container = new B2wacContainer(b2wac,awac,this.tag,this.url,this.iparam);
  return this.container;
};

Frame.prototype.getHash=function() {
  return 'frame-'+this.id;
};

Frame.prototype.showPage=function() {
  this.iframe.attr('src',this.url);
  // set title of page
};

Frame.prototype.toString=function() {
  var i = this.url.lastIndexOf('/');
  return '{Frame id='+this.id+' url='+this.url.substring(i)+'}';
};
  
function B2wac(rootUrl,pageDiv) {
  var i = rootUrl.indexOf('?');
  this.rootUrl = i == -1 ? rootUrl : rootUrl.substring(0,i);
  this.pageDiv = pageDiv;
  this.frameStack = [];
  this.nFrame = 0;
  this.values = {};
  this.removeConcealedFrame = false;
  this.concealFrame = null;
  this.revealFrame = null;
  this.revealType = -1;
}

B2wac.UP = 1;
B2wac.DOWN = 2;
B2wac.NEXT = 3;
B2wac.PREV = 4;
B2wac.TRANSITION_TIME = 350;

B2wac.prototype.onHashChange=function() {
  console.log('>>>>>>>>>>>>>>>>>>>>>>> B2wac.onHashChange()');
  var pageHash = window.location.hash;
  if (pageHash) pageHash = pageHash.substring(1);
  console.log(' - page-hash='+pageHash);
  var frameHash = this.frameStack[this.nFrame-1].getHash();
  console.log(' - frame-hash='+frameHash);
  if (pageHash != 'home' && pageHash != frameHash) {
    console.log(' - go back');
    this.back();
  }
};

B2wac.prototype.init=function(href) {
  var pageUrl = '../../test/index.html';
  //var pageUrl = '../../yangw/index2.html';
  console.log('href='+href);
  
  var b2wac = this;
  //window.onbeforeunload = function() { alert('onbeforeunload'); b2wac.back(); };
  document.addEventListener('backbutton',function() { alert('backbutton'); b2wac.back(); });
   
  window.onhashchange=function(){b2wac.onHashChange();};
  
  window.location.hash="first-home";
  window.location.hash="home";//again because google chrome don't insert first hash into history
  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> set window.location.hash=#home');
  
  
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


B2wac.prototype.resetTransition=function() {
  this.comcealFrame = null;
  this.revealFrame = null;
  this.removeConcealedFrame = false;
  this.revealType = -1;
};

B2wac.prototype.hideFrame=function(frame,remove) {
  frame.iframe.css('display','none');
  if (remove) {
    console.log('removing '+frame);
    frame.iframe.remove(); 
  }
};

B2wac.prototype.upDownTransition=function(dirn) {
    var concealFrame = this.concealFrame;
    var removeFrame = this.removeConcealedFrame;
    var transFrame = null;
    var revealClass = null;
    var transClass = null;
    if (dirn == B2wac.UP) {
      transFrame = this.revealFrame;
      revealClass = 'reveal-start-down';
      transClass = 'reveal-trans-up';
    }
    else if (dirn == B2wac.DOWN) {
      transFrame = this.concealFrame;
      revealClass = 'reveal-start-up';
      transClass = 'reveal-trans-down';
    }
    transFrame.iframe.addClass(revealClass);
    window.setTimeout(function() {
      console.log('start of transition');
      transFrame.iframe.addClass(transClass);
    },50);
    var b2wac = this;
    window.setTimeout(function() {
      console.log('end of transition');
      transFrame.iframe.removeClass(revealClass+' '+transClass);
      b2wac.hideFrame(concealFrame,removeFrame);
    },B2wac.TRANSITION_TIME+50);
};


B2wac.prototype.leftRightTransition=function(dirn) {
    var concealFrame = this.concealFrame;
    var removeFrame = this.removeConcealedFrame;
    var leftFrame = null;
    var rightFrame = null;
    var leftStartClass = null;
    var rightStartClass = null;
    var leftTransClass = null;
    var rightTransClass = null;
    if (dirn == B2wac.NEXT) {
      leftFrame = this.concealFrame;
      rightFrame = this.revealFrame;
      leftStartClass = 'reveal-start-none';
      rightStartClass = 'reveal-start-to-right';
      leftTransClass = 'reveal-trans-to-left';
      rightTransClass = 'reveal-trans-to-left';
    }
    else if (dirn == B2wac.PREV) {
      leftFrame = this.revealFrame;
      rightFrame = this.concealFrame;
      leftStartClass = 'reveal-start-to-left';
      rightStartClass = 'reveal-start-none';
      leftTransClass = 'reveal-trans-to-right';
      rightTransClass = 'reveal-trans-to-right';
    }
    leftFrame.iframe.addClass(leftStartClass);
    rightFrame.iframe.addClass(rightStartClass);
    window.setTimeout(function() {
      console.log('start of transition');
      leftFrame.iframe.addClass(leftTransClass);
      rightFrame.iframe.addClass(rightTransClass);
    },50);
    var b2wac = this;
    window.setTimeout(function() {
      console.log('end of transition');
      leftFrame.iframe.removeClass(leftStartClass+' '+leftTransClass);
      rightFrame.iframe.removeClass(rightStartClass+' '+rightTransClass);
      b2wac.hideFrame(concealFrame,removeFrame);
    },B2wac.TRANSITION_TIME+50);
};

B2wac.prototype.transitionFrames=function() {
  console.log('>>>>>>>>>>>>>>>>>>>>>>> B2wac.transitionFrames()');
  console.log(' - reveal-type='+this.revealType);
  console.log(' - remove-concealed-frame='+this.removeConcealedFrame);
  console.log(' - conceal '+this.concealFrame);
  console.log(' - reveal '+this.revealFrame);
  
  var dirn = this.revealType;
  //if (dirn == B2wac.NEXT) dirn = B2wac.UP;
  //if (dirn == B2wac.PREV) dirn = B2wac.DOWN;
  
  var removeFrame = this.removeConcealedFrame;
  var concealFrame = this.concealFrame;
  var revealFrame = this.revealFrame;
  
  var hash = revealFrame.getHash();
  window.location.hash=hash;
  revealFrame.container.updateHeader();
  

  if (!concealFrame) {
     console.log('simple reveal');
     revealFrame.iframe.css('display','block');  
     this.resetTransition();
     return;
  }
  
  console.log('complex reveal');
      
  var width = concealFrame.iframe.width()+'px';
  console.log(' - width='+width);
  
  concealFrame.iframe.css('width',width);
  revealFrame.iframe.css('width',width);
  
  concealFrame.iframe.css('display','block');
  revealFrame.iframe.css('display','block');
    
  if (dirn == B2wac.UP || dirn == B2wac.DOWN)
    this.upDownTransition(dirn);
  else 
    this.leftRightTransition(dirn);
  
  this.resetTransition();
};

B2wac.prototype.startPage=function() {
  this.revealFrame = this.frameStack[this.nFrame-1];
  this.transitionFrames();
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

B2wac.prototype.newFrame=function(currentUrl,tag,pageUrl,value) {
  pageUrl = this.resolvePageUrl(currentUrl,pageUrl);
  var iframe = $(document.createElement('iframe')).appendTo($('#'+this.pageDiv));
  var frame = new Frame(tag,pageUrl,value,iframe);
  iframe.attr('id','iframe-'+frame.id);
  this.frameStack[this.nFrame-1] = frame;
  frame.showPage();
};

B2wac.prototype.openPage=function(tag,pageUrl,value) {
  var currentUrl = this.rootUrl;
  if (this.nFrame > 0) {
    var frame = this.frameStack[this.nFrame-1];
    this.concealFrame = frame;
    this.revealType = B2wac.UP;
    this.removeConcealedPage = false;
    currentUrl = frame.url;
  }
  this.nFrame++;
  this.newFrame(currentUrl,tag,pageUrl,value);
};


B2wac.prototype.replacePage=function(tag,pageUrl,value,next) {
  var frame = this.frameStack[this.nFrame-1];
  this.concealFrame = frame;
  this.removeConcealedFrame = true;
  this.revealType = next ? B2wac.NEXT : B2wac.PREV; 
  this.newFrame(frame.url,tag,pageUrl,value);
};

B2wac.prototype.endPage=function(ok,value) {
  var frame = this.frameStack[this.nFrame-1];
  this.concealFrame = frame;
  this.frameStack[this.nFrame-1] = null;
  this.nFrame--;
  if (this.nFrame === 0) {
    window.close(); 
  }
  else {
    frame = this.frameStack[this.nFrame-1];
    frame.container.awac.firePageClose(null,ok,value);
    this.revealFrame = frame;
    this.removeConcealedFrame = true;
    this.revealType = B2wac.DOWN;
    this.transitionFrames();
  }
};

B2wac.prototype.debugFrameStack=function() {
  console.log('n-frame='+this.nFrame);
  for (var i=0;i<this.nFrame;i++) {
    console.log('frame['+i+']='+this.frameStack[i]);
  }
};

B2wac.prototype.onBackPressed=function() {
  alert('onBackPressed()');
  console.log('onBackPressed()');
};

B2wac.prototype.back=function() {
  console.log('back()');
  var frame = this.frameStack[this.nFrame-1];
  if (frame.container.onBackCB) {
    console.log("fire onBackCB");
    frame.container.awac.fireBackPressed();
  }
  else if (this.nFrame > 1) {
    console.log('default back() behaviour');
    this.endPage(false,null);
  }  
  else {
    console.log('last frame');
    alert('Cannot back from here');
  }
};


