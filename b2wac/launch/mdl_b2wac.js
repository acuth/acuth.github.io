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

Frame.prototype.debugIFrame=function() {
  var e = this.iframe.get(0);
  return '{IFrame width:'+this.iframe.width()+'}';
};

Frame.prototype.toString=function() {
  var i = this.url.lastIndexOf('/');
  var j = this.url.indexOf('?r=');
  return '{Frame id='+this.id+' url='+this.url.substring(i,j)+' iframe='+this.debugIFrame()+'}';
};

function B2wac(pageDiv,href,pageUrl,fbConfig,mdlCssUrl) {
  console.log('B2wac()\n - pageDiv='+pageDiv+'\n - href='+href+'\n - pageUrl='+pageUrl+'\n - mdlCssUrl='+mdlCssUrl);
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
  this.fbUser = null;

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

  this.setMdlCssUrl(mdlCssUrl);
  this.applyMdlCssUrl(mdlCssUrl);

  this.initFirebase(fbConfig);

  var b2wac = this;
  //window.onbeforeunload = function() { alert('onbeforeunload'); b2wac.back(); };
  document.addEventListener('backbutton',function() { alert('backbutton'); b2wac.back(); });

  this.prepareDialog();
  this.prepareModalList();
  this.prepareNavDrawer();

  window.onhashchange=function(){b2wac.onHashChange();};

  window.location.hash="first-home";
  window.location.hash="home";//again because google chrome don't insert first hash into history
  //console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> set window.location.hash=#home');
  this.openPage(null,pageUrl,null);
}

B2wac.prototype.setMdlCssUrl = function(mdlCssUrl) {
  //console.log('B2wac.setMdlCssUrl('+mdlCssUrl+')');
  this.mdlCssUrl = mdlCssUrl;
};

B2wac.prototype.getMdlCssUrl = function() {
  var url = this.mdlCssUrl;
  //console.log('B2wac.getMdlCssUrl() = '+url);
  return url;
};

B2wac.lastMdlName = null;

B2wac.prototype.applyMdlCssUrl = function(url) {
    var link = document.getElementById('mdl-css-link');
    if (link.href != url) {
      var i = url.lastIndexOf('/material.');
      var j = url.indexOf('.min.css');
      var name = url.substring(i+10,j);
      console.log('\n\n\n!!!!!!!!!!!!!!!!!!!!! B2wac.applyMdlCssUrl()\n - url = '+url);
      link.href = url;
      //
      // now put something in place for our CSS to work with
      var main = $('#main');
      if (B2wac.lastMdlName) main.removeClass(B2wac.lastMdlName);
      B2wac.lastMdlName = 'mdl-css-'+name;
      main.addClass(B2wac.lastMdlName);
    }
};

B2wac.UP = 1;
B2wac.DOWN = 2;
B2wac.NEXT = 3;
B2wac.PREV = 4;
B2wac.TRANSITION_TIME = 350;

B2wac.prototype.stringify = function(x) {
  if (!x) {
    return 'null';
  }
  var t = typeof(x);
  if (t === 'undefined') {
    return 'null';
  }
  if (t == 'string') {
    return 'string:'+encodeURIComponent(x);
  }
  if (t == 'number') {
    return 'number:'+x;
  }
  if (t == 'object' || t == 'array') {
    var json = JSON.stringify(x);
    return 'json:'+encodeURIComponent(json);
  }
  return 'null';
};

B2wac.prototype.onHashChange=function() {
  //console.log('>>>>>>>>>>>>>>>>>>>>>>> B2wac.onHashChange()');
  var pageHash = window.location.hash;
  if (pageHash) pageHash = pageHash.substring(1);
  //console.log(' - page-hash='+pageHash);
  var frameHash = this.frameStack[this.nFrame-1].getHash();
  //console.log(' - frame-hash='+frameHash);
  if (pageHash != 'home' && pageHash != frameHash) {
    console.log(' - go back');
    this.back();
  }
};

B2wac.prototype.addNavDrawerItem=function(itemStr) {
  //console.log('B2wac.addNavDrawerItem('+itemStr+')');
  var item = JSON.parse(itemStr);
  for (var i=0;i<this.navDrawerItems.length;i++) {
    var oldItem = this.navDrawerItems[i];
    if (oldItem.label == item.label) {
      //console.log('updating nav drawer item '+item.label);
      this.navDrawerItems[i] = item;
      return;
    }
  }
  //console.log('adding nav drawer item '+item.label);
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

B2wac.prototype.invokeTransitionEnd=function() {
  console.log('invokeTransitionEnd()');
  var frame = this.frameStack[this.nFrame-1];
  frame.container.awac.fireTransitionEnd();
};

B2wac.prototype.upDownTransition=function(dirn,frameWidth,frameHeight,mainWidth,mainHeight) {
    console.log('>>>>> upDownTranstion('+dirn+')');

    var rf = this.revealFrame;
    var cf = this.concealFrame;
    var rs = rf.iframe.get(0).style;
    var cs = cf.iframe.get(0).style;

    if (dirn == B2wac.UP) {
      console.log(' - up');
      rs.position = 'absolute';
      rs.top = mainHeight+'px';
      rf.iframe.css('width',frameWidth+'px');
      rf.iframe.css('height',frameHeight+'px');
      rs.display = 'block';
      window.setTimeout(function() {
        rf.iframe.addClass('trans-ease-out');
        rs.transform = 'translate3d(0,-'+mainHeight+'px,0)';
      },50);
      var b2wac = this;
      window.setTimeout(function() {
        cs.display = 'none';
        rf.iframe.removeClass('trans-ease-out');
        rs.transform = '';
        rs.top = '0px';
        b2wac.invokeTransitionEnd();
      },B2wac.TRANSITION_TIME+50);
    }
    else if (dirn == B2wac.DOWN) {
      console.log(' - down');
      window.setTimeout(function() {
        rs.display = 'block';
        cf.iframe.addClass('trans-ease-in');
        cs.transform = 'translate3d(0,'+mainHeight+'px,0)';
      },50);
      var b2wac = this;
      window.setTimeout(function() {
        cf.iframe.removeClass('trans-ease-in');
        cs.display = 'none';
        cs.transform = '';
        b2wac.hideFrame(cf,true);
        //b2wac.invokeTransitionEnd();
      },B2wac.TRANSITION_TIME+50);
    }
};

B2wac.prototype.leftRightCleanUp=function(rf,rs,cf,cs,delta) {
  rf.iframe.removeClass('trans-ease');
  rs.transform = '';
  rs.left = delta+'px';
  cs.display = 'none';
  cf.iframe.removeClass('trans-ease');
  cs.transform = '';
  this.hideFrame(cf,true);
  this.invokeTransitionEnd();
};

B2wac.prototype.leftRightTransition=function(dirn,frameWidth,frameHeight,mainWidth,mainHeight) {
    console.log('>>>>> leftRightTranstion('+dirn+')');
    var delta = (mainWidth - frameWidth)/2;
    console.log(' - delta='+delta);

    var rf = this.revealFrame;
    var cf = this.concealFrame;
    var rs = rf.iframe.get(0).style;
    var cs = cf.iframe.get(0).style;

    rs.position = 'absolute';
    rs.top = '0px';
    rf.iframe.css('width',frameWidth+'px');
    rf.iframe.css('height',frameHeight+'px');

    if (dirn == B2wac.NEXT) {
      console.log(' - next');
      rs.left = mainWidth+'px';
      rs.display = 'block';
      var translate = 'translate3d(-'+(mainWidth-delta)+'px,0,0)'
      window.setTimeout(function() {
        rf.iframe.addClass('trans-ease');
        cf.iframe.addClass('trans-ease');
        rs.transform = translate;
        cs.transform = translate;
      },50);
      var b2wac = this;
      window.setTimeout(function() {
        b2wac.leftRightCleanUp(rf,rs,cf,cs,delta);
      },B2wac.TRANSITION_TIME+50);
    }
    else if (dirn == B2wac.PREV) {
      console.log(' - prev');
      rs.left = '-'+frameWidth+'px';
      rs.display = 'block';
      var translate = 'translate3d('+(mainWidth-delta)+'px,0,0)'
      window.setTimeout(function() {
        rf.iframe.addClass('trans-ease');
        cf.iframe.addClass('trans-ease');
        rs.transform = translate;
        cs.transform = translate;
      },50);
      var b2wac = this;
      window.setTimeout(function() {
        b2wac.leftRightCleanUp(rf,rs,cf,cs,delta);
      },B2wac.TRANSITION_TIME+50);
    }
    console.log(' - finished');
};

B2wac.prototype.transitionFrames=function() {
  //console.log('>>>>>>>>>>>>>>>>>>>>>>> B2wac.transitionFrames()');
  //console.log(' - reveal-type='+this.revealType);
  //console.log(' - remove-concealed-frame='+this.removeConcealedFrame);
  //console.log(' - conceal '+this.concealFrame);
  //console.log(' - reveal '+this.revealFrame);

  var dirn = this.revealType;
  //if (dirn == B2wac.NEXT) dirn = B2wac.UP;
  //if (dirn == B2wac.PREV) dirn = B2wac.DOWN;

  var removeFrame = this.removeConcealedFrame;
  var concealFrame = this.concealFrame;
  var revealFrame = this.revealFrame;

  var hash = revealFrame.getHash();
  window.location.hash=hash;
  revealFrame.container.updateMdlPageCss();
  revealFrame.container.updateHeader();

  if (!concealFrame) {
     //console.log('simple reveal');
     revealFrame.iframe.css('display','block');
     this.resetTransition();
     return;
  }

  // we will make the frame being revealed the same size as the frame being concealed
  var frameWidth = concealFrame.iframe.width();
  var frameHeight = concealFrame.iframe.height();

  var main = document.getElementById('main');
  var mainWidth = main.offsetWidth;
  var mainHeight = main.offsetHeight;

  if (dirn == B2wac.UP || dirn == B2wac.DOWN) {
    this.upDownTransition(dirn,frameWidth,frameHeight,mainWidth,mainHeight);
    this.resetTransition();
  }
  else {
    this.leftRightTransition(dirn,frameWidth,frameHeight,mainWidth,mainHeight);
    this.resetTransition();
  }


};

B2wac.prototype.getPrevContainer=function(container) {
  //console.log('getPrevContainer() nFrame='+this.nFrame);
  for (var i = this.nFrame-1;i>=0;i--) {
    if (this.frameStack[i].container == container) {
      return (i == 0) ? null : this.frameStack[i-1].container;
    }
  }
  console.log('Unable to find frame !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  return null;
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
  if (pageUrl.indexOf('localhost') != -1) pageUrl += '?r='+Math.random();

  var page = $('#'+this.pageDiv);
  console.log('About to append an iframe for '+pageUrl+' to '+page.get(0));
  //console.log(' - width='+page.width());
  //console.log(' - offset-width='+page.get(0).offsetWidth);

  var iframe = $(document.createElement('iframe')).addClass('fun').appendTo(page);
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
  if (this.modalListVisible) {
    console.log('closing modal list');
    this.listCallback(-1);
  }
  else if (this.navDrawerVisible) {
    console.log('closing nav drawer');
    this.navDrawerCallback(null);
  }
  else if (frame.container.onBackCB) {
    console.log("fire onBackCB");
    frame.container.awac.fireBackPressed();
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
  var html = '<div class="loading__bar"></div>';
  //var html = '<div class="app-progress mdl-progress mdl-js-progress mdl-progress__indeterminate"></div>';
  document.getElementById('app-loading').innerHTML = html;
  //componentHandler.upgradeDom();
};

B2wac.prototype.endRefresh=function() {
  var html = '<div class="loading__bar2"></div>';
  document.getElementById('app-loading').innerHTML = html;
  //componentHandler.upgradeDom();
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

B2wac.prototype.getModalControl = function(isList,item,i) {
  var btn = document.createElement('button');
  btn.setAttribute('class','app-modal-button mdl-button mdl-js-button mdl-js-ripple-effect');
  btn.innerHTML = item.label;
  var b2wac = this;
  btn.addEventListener('click',function() { if (isList) b2wac.listCallback(i); else b2wac.navDrawerCallback(item.action); });
  return btn;
};

B2wac.prototype.getCloseButton = function(isList) {
    var div = document.createElement('div');
    div.setAttribute('class','app-modal-close mdl-dialog__actions');
    var btn = document.createElement('button');
    btn.setAttribute('class','mdl-button mdl-js-button mdl-button--icon');
    btn.setAttribute('id','app-modal-close-btn-'+(isList?'list':'drawer'));
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
    div.appendChild(this.getModalControl(false,this.navDrawerItems[i],i));
  var e = document.getElementById('app-nav-drawer-content');
  e.innerHTML = null;
  e.appendChild(this.getCloseButton(false));
  e.appendChild(div);
  document.getElementById('app-nav-drawer').showModal();
  this.navDrawerVisible = true;
  document.getElementById('app-modal-close-btn-drawer').blur();
};

B2wac.prototype.showList = function(items) {
  items = JSON.parse(items);
  var div = document.createElement('div');
  div.setAttribute('class','mdl-dialog__actions mdl-dialog__actions--full-width');
  for (var i=0;i<items.length;i++)
    div.appendChild(this.getModalControl(true,items[i],i));
  var e = document.getElementById('app-modal-list-content');
  e.innerHTML = null;
  e.appendChild(this.getCloseButton(true));
  e.appendChild(div);
  document.getElementById('app-modal-list').showModal();
  this.modalListVisible = true;
  document.getElementById('app-modal-close-btn-list').blur();
};

B2wac.prototype.dialogCallback = function(yes) {
  var frame = this.frameStack[this.nFrame-1];
  frame.container.awac.fireDialogResult(yes);
};

B2wac.prototype.actionBarCallback=function(action) {
  var frame = this.frameStack[this.nFrame-1];
  frame.container.awac.fireAction(action);
};

B2wac.prototype.getUser=function() {
  var u = null;
  if (this.fbUser) {
    u = {};
    u.displayName = this.fbUser.displayName;
    u.photoURL = this.fbUser.photoURL;
    u.uid = this.fbUser.uid;
    u.email = this.fbUser.email;
    u.providerId = this.fbUser.providerId;
  }
  return this.stringify(u);
};

B2wac.prototype.onFBAuthStateChanged=function(user) {
  console.log('onFBAuthStateChanged(user='+user+')');
  this.fbUser = user;

  if (user) {
    //console.log('\n\n\n ----------- load data for /users/'+user.uid+'\n\n\n');
    var b2wac = this;
    this.fbdatabase.ref('/users/'+user.uid).once('value').then(function(snapshot) { b2wac.recordUserSignIn(snapshot); });
  }

  var frame = this.frameStack[this.nFrame-1];
  frame.container.awac.fireSignInOut(this.getUser());
};

B2wac.prototype.signIn=function() {
  console.log('B2wac.signIn()');
  var provider = new firebase.auth.GoogleAuthProvider();
  this.fbauth.signInWithPopup(provider);
};

B2wac.prototype.signOut=function() {
  console.log('B2wac.signOut()');
  this.fbauth.signOut();
};

B2wac.prototype.getDims = function() {
   var e = document.getElementById(this.pageDiv);
   //console.log('page.offsetWidth='+e.offsetWidth);
   var dims = {};
   dims.width = e.offsetWidth;
   dims.height = e.offsetHeight;
   //console.log('B2wac.getDims()='+JSON.stringify(dims));
   return dims;
};

B2wac.prototype.recordUserSignIn=function(snapshot) {
    if (!this.fbUser) {
      console.log('There is no current user');
      return;
    }
    var now = new Date();
    var val = snapshot.val();
    if (!val) {
      val = {};
      val.n_signin = 0;
      val.first_signin_str = now.toString();
      val.first_signin = now.getTime();
    }
    val.last_signin_str = now.toString();
    val.last_signin = now.getTime();
    val.n_signin++;
    this.fbdatabase.ref('/users/' + this.fbUser.uid).set(val);
};

B2wac.prototype.initFirebase=function(fbConfig) {
  if (fbConfig) {
    firebase.initializeApp(fbConfig);
    this.fbauth = firebase.auth();
    this.fbdatabase = firebase.database();
    this.fbstorage = firebase.storage();
    this.fbauth.onAuthStateChanged(this.onFBAuthStateChanged.bind(this));
  }
};

B2wac.prototype.getFBDatabase=function() {
  return this.fbdatabase;
};
