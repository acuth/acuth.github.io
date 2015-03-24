
var pageNames = ['lorem','refresh','questions','storage','actions','pages','sideways','custom'];


function openFooterBlurb() {
  $('#details-blurb').show(400);
  $('#details-more').hide();
  //setTimeout(function() { $('html, body').animate({scrollTop:$(document).height()}, 'slow'); },400);
}

function loadNavigation() {
  if (!_awac) return;
  var e = document.getElementById("navigation");
  if (!e) return;
  e = $(e);
  e.addClass('holder');
  var i = getPageIndex(_awac.getPageTag());
  if (i > 0)
    $(document.createElement('div')).addClass('left small btn lite').html('PREV').click(showPrevPage).appendTo(e);
  if (i < pageNames.length-1)  
    $(document.createElement('div')).addClass('right small btn lite').html('NEXT').click(showNextPage).appendTo(e);
   $(document.createElement('div')).css('clear','both').appendTo(e);
}

function loadFooter() {
  var href = window.location.href;
  var i = href.indexOf('?rnd=');
  if (i != -1) href = href.substring(0,i);
  i = href.indexOf('&rnd=');
  if (i != -1) href = href.substring(0,i);
  var html = '<div class="link">Loaded from <a target="_blank" href="'+href+'">'+href+'</a></div>'+
            '<div class="more"><a id="details-more" href="javascript:openFooterBlurb();">more...</a></div>'+
            '<div style="clear:both;"></div>';
  document.getElementById('details-footer').innerHTML = html;
  
  loadNavigation();
}

function pLog(msg) {
   var e = document.getElementById('log');
   var html = e.innerHTML;
   html = (new Date()).format('HH:MM:ss')+' '+msg + '<br/>' + html;
   e.innerHTML = html;
}

function getPageIndex(name) {
  for (var i=0;i<pageNames.length;i++) {
    if (name == pageNames[i]) {
      return i;
    }
  }
  return -1;
}

function showPage(action) {
  if (action.indexOf('show_') == -1) return false;
  action = action.substring(5);
  var depth = _awac.getStackDepth();
  var pageIndex = getPageIndex(_awac.getPageTag());
  var actionIndex = getPageIndex(action);
  if (depth === 0)
    _awac.openPage(action,action+'.html');
  else if (actionIndex != pageIndex) 
    _awac.replacePage(action,action+'.html',null,actionIndex < pageIndex?false:true);
  return true;
}


function showNextPage() {
  var pageIndex = getPageIndex(_awac.getPageTag());
  if (pageIndex == pageNames.length-1) return;
  var name = pageNames[pageIndex+1];
  _awac.replacePage(name,name+'.html',null,true);
}

function showPrevPage() {
  var pageIndex = getPageIndex(_awac.getPageTag());
  if (pageIndex === 0) return;
  var name = pageNames[pageIndex-1];
  _awac.replacePage(name,name+'.html',null,false);
}