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


function AttrLink() {
  this.background = null;
  this.imageUrl = null;
  this.attrType = null;
  this.left = null;
  this.right = null;
}

AttrLink.prototype.setBackground=function(background) {
  this.background = background;
  return this;
};

AttrLink.prototype.setAttrType=function(attrType) {
  this.attrType = attrType;
  return this;
};

AttrLink.prototype.setImageURL=function(imageUrl) {
  this.imageUrl = imageUrl;
  return this;
};

AttrLink.prototype.setLeft=function(label,action) {
  this.left = {};
  this.left.label = label;
  this.left.action = action;
  return this;
};

AttrLink.prototype.setRight=function(label,action) {
  this.right = {};
  this.right.label = label;
  this.right.action = action;
  return this;
};

AttrLink.prototype.render=function() {
  var s = '<span class="attr-link';
  if (this.attrType) s += ' '+this.attrType;
  s += '"';
  if (this.background) s += ' style="background:'+this.background+';"';
  s += '>';
  if (this.imageUrl) s+= '<img src="'+this.imageUrl+'" />';
  if (this.left) s += '<a class="left" href="javascript:'+this.left.action+';">'+this.left.label+'</a>';
  if (this.right) s += '<a class="right" href="javascript:'+this.right.action+';">'+this.right.label+'</a>';
  s += '</span>';
  return s;
};


function AttrType(name) {
  this.name = name;
  AttrType.types[name] = this;
}

AttrType.prototype.toString=function() {
  return '{AttrType name='+this.name+'}';
};

AttrType.types = [];

AttrType.get=function(name) {
  return AttrType.types[name];
};





function FItem(json,isParsed) {
  this.json = isParsed ? json : JSON.parse(json);
}

FItem.prototype.toString=function() {
  return '{FItem name='+this.json.wiki_name+' json='+JSON.stringify(this.json)+'}';
};

FItem.get=function(name,cb) {
  ajax('https://yangw-2.appspot.com/v4/?op=get_item&wiki_name='+name,function(json) {
    console.log('got '+json);
    fitem = new FItem(json);
    cb(fitem);
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

FItem.prototype.getMDIcon=function() {
  var iname = 'subject';
	if (this.json.item_type_name == 'User') iname = 'person';
	else if (this.json.item_type_name == 'Tag') iname = 'label';
	return iname;
};


FItem.prototype.getUserHTML=function(user,readOnly) {
  if (!user) return '';
  var link = (new AttrLink()).setAttrType('user-link').setImageURL(user.image_url).setLeft(user.name_attr,'showNextPage(\''+user.wiki_name+'\')');
  if (!readOnly) link.setRight('+','showOptions(\'user\')'); else link.setBackground('white');
  return link.render();
};
  
FItem.prototype.addLinks=function(html) {
  if (!html) return null;
  var i = 0;
  var j = 0;
  for (var k=0;k<20;k++) {
    i = this.json.markdown.indexOf('[[',j);
    if (i == -1) break;
    j = this.json.markdown.indexOf(']]',i); 
    if (j == -1) break;
    var target = this.json.markdown.substring(i+2,j);
    var name = target.substring(0,target.indexOf(':'));
    var inline = this.json.markdown_inline_values[target];
    if (name == 'wiki') {
      html = html.replace('[['+target+']]','<a class="internal-link" href="javascript:showNextPage(\''+inline.wiki_name+'\');">'+inline.name_attr+'</a>');
    }
    else if (name == 'http' || name == 'https') {
      html = html.replace('[['+target+']]','<a target="_blank" class="external-link" href="'+target+'">'+target+'</a>');
    }
    else if (name == 'tag') {
      var a = (new AttrLink()).setLeft(inline.name_attr,'showNextPage(\''+inline.wiki_name+'\')').setRight('+','showOptions(\'tag\')').render();
      html = html.replace('[['+target+']]',a);
    }
    else if (name == 'user') {
      html = html.replace('[['+target+']]',this.getUserHTML(inline,false));
    }
    if (inline) {
      console.log(target+'='+JSON.stringify(inline));
    }
    i = j;
  }
  return html;
};

FItem.prototype.getHTML=function() {
   var renderer = new marked.Renderer();
   // do not convert links
   renderer.link = function(href, title, text) { return href; };
   var html = marked(this.json.markdown,{ renderer: renderer });
   //console.log('using marked\n\n'+html);
   //var converter = new showdown.Converter();
   //html = converter.makeHtml(this.json.markdown);
   //console.log('using showdown\n\n'+html);
   html = this.addLinks(html);
   return html;
};
              
