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
  if (markdown) markdown = markdown.trim();
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

FItem.historyPush=function(awac,name){
  var history = awac.get('history');
  if (!history) {
	  history = {};
	  history.n = -1;
		history.names = [];
	}
	history.n += 1;
	history.names[history.n]=name;  
	awac.set('history',history);
	console.log('history='+JSON.stringify(history));
};

FItem.historyPop=function(awac){
  var history = awac.get('history');
	if (history) {
	  history.n -= 1;
		awac.set('history',history);
		console.log('history='+JSON.stringify(history));
		if (history.n >= 0) return history.names[history.n];
	}
	return null;
};

FItem.prototype.addLink=function(html,pageName,pageTitle) {
  var link = '[['+pageName+']]';
  var i = html.indexOf(link);
  if (i != -1) html = html.replace(link,'<a href="javascript:showNextPage(\''+pageName+'\');">'+pageTitle+'</a>');
  return html;
};
  
FItem.prototype.addLinks=function(html) {
  if (!html) return null;
  for (var i=0;i<this.json.links.length;i++) {
    var link = this.json.links[i];
    html = this.addLink(html,link.name,link.title);  
  }
  return html;
};

FItem.prototype.getHTML=function() {
   var converter = new showdown.Converter();
   var html = converter.makeHtml(this.markdown);
   html = this.addLinks(html);
   return html;
};
              
