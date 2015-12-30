function Frame(url,iframe) {
  this.url = url;
  this.iframe = iframe;
  this.container = null;
}

Frame.prototype.newContainer=function(awac) {
  this.container = new B2wacContainer(awac);
  return this.container;
};

Frame.prototype.showPage=function() {
  this.iframe.attr('src',this.url);
};
  
function B2wac(pageDiv) {
  this.pageDiv = pageDiv;
  this.frame = null;
}


B2wac.prototype.init=function() {
  var pageUrl = '../../sample/highline.html';
  console.log('init('+pageUrl+')');

  var iframe = $(document.createElement('iframe')).appendTo($('#'+this.pageDiv));
  
  this.frame = new Frame(pageUrl,iframe);
  this.frame.showPage();
};

B2wac.prototype.getContainer=function(awac) {
  return this.frame.newContainer(awac);
};