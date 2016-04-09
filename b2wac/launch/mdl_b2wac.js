function Frame(tag,url,iparam,iframe) {
  this.id = Frame.count++;
  this.tag = tag;
  this.url = url;
  this.iparam = iparam;
  this.iframe = iframe;
  this.container = null;
  this.navDrawerItems = [];
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
  
function B2wac(pageDiv,href,pageUrl) {
  console.log('B2wac()\n - pageDiv='+pageDiv+'\n - href='+href+'\n - pageUrl='+pageUrl);
  var i = href.indexOf('#');
  if (i != -1) href = href.substring(0,i);
  this.href = href;
  i = href.indexOf('?');
  this.rootUrl = i == -1 ? href : href.substring(0,i);
  this.pageDiv = pageDiv;
  this.frameStack = [];
  this.nFrame = 0;
  this.values = {};
  this.removeConcealedFrame = false;
  this.concealFrame = null;
  this.revealFrame = null;
  this.revealType = -1;
  this.modalListVisible = false;
  this.navDrawerVisible = false;
  this.navDrawerItems = [];

  if (this.href && !pageUrl) {
    i = this.href.indexOf('url=');
    if (i != -1) {
      var j = this.href.indexOf('&',i);
      var url = j == -1 ? this.href.substring(i+4) : this.href.substring(i+4,j);
      pageUrl = decodeURIComponent(url);
      console.log('use url param to set pageUrl\n - pageUrl='+pageUrl);
    }
  }
  if (!pageUrl) {
    pageUrl = '../../test/index.html';
    console.log('using default value for pageUrl\n - pageUrl='+pageUrl);
  }
  
  var b2wac = this;
  //window.onbeforeunload = function() { alert('onbeforeunload'); b2wac.back(); };
  document.addEventListener('backbutton',function() { alert('backbutton'); b2wac.back(); });
  
  this.prepareDialog();
  this.prepareModalList();
  this.prepareNavDrawer();
  
  window.onhashchange=function(){b2wac.onHashChange();};
  
  window.location.hash="first-home";
  window.location.hash="home";//again because google chrome don't insert first hash into history
  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> set window.location.hash=#home');
  this.openPage(null,pageUrl,null);
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

B2wac.prototype.addNavDrawerItem=function(item) {
  this.navDrawerItems[this.navDrawerItems.length] = item;
};

B2wac.prototype.prepareNavDrawer=function() {
  var dialog = document.createElement('dialog');
  dialog.setAttribute('id','app-nav-drawer');
  dialog.setAttribute('class','mdl-dialog');
  dialog.innerHTML = '<div id="app-nav-drawer-content" class="mdl-dialog__content">-content-</div>';
  document.body.appendChild(dialog);
  if (!dialog.showModal) {
    dialogPolyfill.registerDialog(dialog);
  }
}; 

B2wac.prototype.prepareModalList=function() {
  var dialog = document.createElement('dialog');
  dialog.setAttribute('id','app-modal-list');
  dialog.setAttribute('class','mdl-dialog');
  dialog.innerHTML = '<div id="app-modal-list-content" class="mdl-dialog__content">-content-</div>';
  document.body.appendChild(dialog);
  if (!dialog.showModal) {
    dialogPolyfill.registerDialog(dialog);
  }
}; 

B2wac.prototype.prepareDialog=function() {
  var dialog = document.createElement('dialog');
  dialog.setAttribute('id','app-dialog');
  dialog.setAttribute('class','mdl-dialog');
  dialog.innerHTML = 
        '<div id="app-dialog-content" class="mdl-dialog__content">-content-</div>'+
        '<div class="mdl-dialog__actions">'+
          '<button type="button" id="app-dialog-yes-btn" class="mdl-button mdl-button--primary">-yes-</button>'+
          '<button type="button" id="app-dialog-no-btn" class="mdl-button mdl-button--primary">-no-</button>'+
        '</div>';
  document.body.appendChild(dialog);
  if (!dialog.showModal) {
    dialogPolyfill.registerDialog(dialog);
  }
  
  
  var b2wac = this;
  //var dialog = document.getElementById('app-dialog');
  document.getElementById('app-dialog-yes-btn').addEventListener('click', function() {
    dialog.close();
    b2wac.dialogCallback(true);
  });
  document.getElementById('app-dialog-no-btn').addEventListener('click', function() {
    dialog.close();
    b2wac.dialogCallback(false);
  });
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
  
  var header = $('#header').css('width',width);
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
  pageUrl += '?r='+Math.random();
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

B2wac.prototype.getDepth=function() {
  return this.nFrame-1;
};

B2wac.prototype.endPage=function(tag,ok,value) {
  var frame = this.frameStack[this.nFrame-1];
  this.concealFrame = frame;
  this.frameStack[this.nFrame-1] = null;
  this.nFrame--;
  if (this.nFrame === 0) {
    window.close(); 
  }
  else {
    frame = this.frameStack[this.nFrame-1];
    frame.container.awac.firePageClose(tag,ok,value);
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

B2wac.prototype.back=function() {
  console.log('back()');
  var frame = this.frameStack[this.nFrame-1];
  if (frame.container.onBackCB) {
    console.log("fire onBackCB");
    frame.container.awac.fireBackPressed();
  }
  else if (this.modalListVisible) {
    console.log('closing modal list');
    this.listCallback(-1);
  }
  else if (this.navDrawerVisible) {
    console.log('closing nav drawer');
    this.navDrawerCallback(null);
  }
  else if (this.nFrame > 1) {
    console.log('default back() behaviour');
    this.endPage(false,null);
  }  
  else {
    console.log('last frame');
    this.alert('You cannot go back from here');
  }
};

B2wac.prototype.getHomeControl=function(item) {
  console.log('B2wac.getHomeControl('+item+')');
  var btn = document.createElement('button');
  btn.setAttribute('class','mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon');
  btn.innerHTML = '<i class="material-icons">'+item.icon+'</i>';
  var b2wac = this;
  btn.addEventListener('click', function() { b2wac.actionBarCallback(item.action); });
  return btn;
};

B2wac.prototype.getBackControl=function() {
  console.log('B2wac.getBackControl()');
  var btn = document.createElement('button');
  btn.setAttribute('class','mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon');
  btn.innerHTML = '<i class="material-icons">arrow_back</i>';
  var b2wac = this;
  btn.addEventListener('click', function() { b2wac.back(); });
  return btn;
};

B2wac.prototype.getNavDrawerControl=function() {
  console.log('B2wac.getNavDrawerControl()');
  var btn = document.createElement('button');
  btn.setAttribute('class','mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon');
  btn.innerHTML = '<i class="material-icons">menu</i>';
  var b2wac = this;
  btn.addEventListener('click', function() { b2wac.showNavDrawer(); });
  return btn;
};

B2wac.prototype.getActionBarControl=function(item) {
  console.log('B2wac.getActionBarControl('+item+')');
  if (item.icon) {
    var btn = document.createElement('button');
    btn.setAttribute('class','mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon');
    btn.innerHTML = '<i class="material-icons">'+item.icon+'</i>';
    var b2wac = this;
    btn.addEventListener('click', function() { b2wac.actionBarCallback(item.action); });
    return btn;
  } else {
    var a = document.createElement('a');
    a.setAttribute('class','mdl-navigation__link');
    a.innerHTML = '<b>'+item.label.toUpperCase()+'</b>';
    var b2wac = this;
    a.addEventListener('click', function() { b2wac.actionBarCallback(item.action); });
    return a;
  }
};

B2wac.prototype.updateHeader=function(title,showNavDrawer,homeItem,actionBarItems,optionsMenuItems) {
  console.log('B2wac.updateHeader()');
  document.getElementById('title').innerHTML = title;
  var div = document.getElementById('app-action-bar-links');
  div.innerHTML = '';
  if (actionBarItems) {
    for (var i=0;i<actionBarItems.length;i++)
      div.appendChild(this.getActionBarControl(JSON.parse(actionBarItems[i])));
  }
  //
  div = document.getElementById('app-home-icon');
  div.innerHTML = '';
  var homeControl;
  if (homeItem) homeControl = this.getHomeControl(JSON.parse(homeItem));
  else if (showNavDrawer) homeControl = this.getNavDrawerControl();
  else homeControl = this.getBackControl();
  div.appendChild(homeControl);
  //
  div = document.getElementById('app-options-menu');
  div.innerHTML = '';
  if (optionsMenuItems) {
    var btn = document.createElement('button');
    btn.setAttribute('class','mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon');
    btn.setAttribute('id','hdrbtn');
    btn.innerHTML = '<i class="material-icons">more_vert</i>';
    
    var menu = document.createElement('ul');
    menu.setAttribute('class','mdl-menu mdl-js-menu mdl-js-ripple-effect mdl-menu--bottom-right');
    menu.setAttribute('for','hdrbtn');
    menu.setAttribute('id','hdrmenu');
    
    for (var i=0;i<optionsMenuItems.length;i++) 
      menu.appendChild(getMenuControl(optionsMenuItems[i]));
    div.appendChild(btn);
    div.appendChild(menu);
  }
  componentHandler.upgradeDom();
};

B2wac.prototype.startRefresh=function() {
  var html = '<div class="app-progress mdl-progress mdl-js-progress mdl-progress__indeterminate"></div>';
  document.getElementById('app-progress-area').innerHTML = html;
  componentHandler.upgradeDom();
};

B2wac.prototype.endRefresh=function() {
  var html = '<div class="app-progress mdl-progress mdl-js-progress"></div>';
  document.getElementById('app-progress-area').innerHTML = html;
  componentHandler.upgradeDom();
};

B2wac.prototype.alert=function(msg) {
  var data = {message: msg};
  document.getElementById('app-toast').MaterialSnackbar.showSnackbar(data);
};

B2wac.prototype.showDialog = function(content,yes,no) {
  document.getElementById('app-dialog-content').innerHTML = content;
  document.getElementById('app-dialog-yes-btn').innerHTML = yes;
  document.getElementById('app-dialog-no-btn').innerHTML = no;
  document.getElementById('app-dialog').showModal();
};

B2wac.prototype.listCallback = function(i) {
  document.getElementById('app-modal-list').close();
  this.modalListVisible = false;
  if (i != -1) {
    var frame = this.frameStack[this.nFrame-1];
    frame.container.awac.fireListResult(i);
  }
};

B2wac.prototype.navDrawerCallback = function(action) {
  document.getElementById('app-nav-drawer').close();
  this.navDrawerVisible = false;
  if (action) {
    var frame = this.frameStack[this.nFrame-1];
    frame.container.awac.fireAction(action);
  }
};

B2wac.prototype.getListItemControl = function(items,i) {
  var btn = document.createElement('button');
  btn.setAttribute('class','mdl-button');
  btn.setAttribute('style','text-align:left;text-transform:none;');
  btn.innerHTML = items[i].label;
  var b2wac = this;
  btn.addEventListener('click',function() { b2wac.listCallback(i); });
  return btn;
};

B2wac.prototype.getNavDrawerItemControl = function(item) {
  var btn = document.createElement('button');
  btn.setAttribute('class','mdl-button');
  btn.setAttribute('style','text-align:left;text-transform:none;');
  //var li = document.createElement('li');
  btn.innerHTML = item.label;
  var b2wac = this;
  btn.addEventListener('click',function() { b2wac.navDrawerCallback(item.action); });
  return btn;
};

B2wac.prototype.getCloseButton = function(isList) {
    var div = document.createElement('div');
    div.setAttribute('class','app-modal-close mdl-dialog__actions');
    var btn = document.createElement('button');
    btn.setAttribute('class','mdl-button mdl-js-button mdl-button--icon');
    btn.innerHTML = '<i class="material-icons mdl-color-text--blue-grey-400">close</i>';
    var b2wac = this;
    btn.addEventListener('click',function() { if (isList) b2wac.listCallback(-1); else b2wac.navDrawerCallback(null); });
    div.appendChild(btn);
    return div;
};

B2wac.prototype.showNavDrawer = function() {
  var div = document.createElement('div');
  div.setAttribute('class','mdl-dialog__actions mdl-dialog__actions--full-width');
  //var ul = document.createElement('ul');
  for (var i=0;i<this.navDrawerItems.length;i++) 
    div.appendChild(this.getNavDrawerItemControl(JSON.parse(this.navDrawerItems[i])));
  var e = document.getElementById('app-nav-drawer-content');
  e.innerHTML = null;
  e.appendChild(this.getCloseButton(false));
  e.appendChild(div);
  document.getElementById('app-nav-drawer').showModal();
  this.navDrawerVisible = true;
};

B2wac.prototype.showList = function(items) {
  items = JSON.parse(items);
  var div = document.createElement('div');
  div.setAttribute('class','mdl-dialog__actions mdl-dialog__actions--full-width');
  for (var i=0;i<items.length;i++) 
    div.appendChild(this.getListItemControl(items,i));
  var e = document.getElementById('app-modal-list-content');
  e.innerHTML = null;
  e.appendChild(this.getCloseButton(true));
  e.appendChild(div);
  document.getElementById('app-modal-list').showModal();
  this.modalListVisible = true;
};

B2wac.prototype.dialogCallback = function(yes) {
  var frame = this.frameStack[this.nFrame-1];
  frame.container.awac.fireDialogResult(yes);
};

B2wac.prototype.actionBarCallback=function(action) {
  var frame = this.frameStack[this.nFrame-1];
  frame.container.awac.fireAction(action);
};


