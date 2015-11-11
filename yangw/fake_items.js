var _itemTitles = ['An Introduction to Items',
              'Everything you wanted to know about items but were afraid to ask',
              'Well Known Item Types'];
              
              
              
              
function ajax(url,cb) {
  var xhr = new XMLHttpRequest();
	xhr.open("GET",url,true);
	xhr.onreadystatechange = function() {
  		if (xhr.readyState == 4) {
    		cb(xhr.responseText);
  		}
	};
	xhr.send();
}

function FItem(name,json,markdown) {
  this.name = name;
  this.json = JSON.parse(json);
  this.markdown = markdown;
}

FItem.prototype.toString=function() {
  return '{FItem name='+this.name+' json='+JSON.stringify(this.json)+' markdown='+this.markdown+'}';
};

var _fItemMap = {};

FItem.get=function(name,cb) {
  var fitem = _fItemMap[name];
  if (fitem) 
    cb(fitem);
  else
    ajax(name+'.json',function(json) {
      ajax(name+'.md',function(markdown) {
        fitem = new FItem(name,json,markdown);
        _fItemMap[name] = fitem;
        cb(fitem);
      });
    });
};


FItem.prototype.addLink=function(html,pageName,pageTitle) {
  var link = '[['+pageName+']]';
  var i = html.indexOf(link);
  if (i != -1) html = html.replace(link,'<a href="javascript:showPage(\''+pageName+'\');">'+pageTitle+'</a>');
  return html;
};
  
FItem.prototype.addLinks=function(html) {
  if (!html) return null;
  html = this.addLink(html,'markdown','What is Markdown?');  
  html = this.addLink(html,'home','Welcome to Yangw');
  return html;
};

FItem.prototype.getHTML=function() {
   var converter = new showdown.Converter();
   var html = converter.makeHtml(this.markdown);
   html = this.addLinks(html);
   return html;
};
              
