function openFooterBlurb() {
  $('#details-blurb').show(400);
  $('#details-more').hide();
  //setTimeout(function() { $('html, body').animate({scrollTop:$(document).height()}, 'slow'); },400);
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
}

function pLog(msg) {
   var e = document.getElementById('log');
   var html = e.innerHTML;
   html = (new Date()).format('HH:MM:ss')+' '+msg + '<br/>' + html;
   e.innerHTML = html;
}
