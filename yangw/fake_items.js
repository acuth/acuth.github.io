var _itemTitles = ['An Introduction to Items',
              'Everything you wanted to know about items but were afraid to ask',
              'Well Known Item Types'];




function ajax(url,cb,checkJson) {
  console.log('AJAX make request url='+url);
  var xhr = new XMLHttpRequest();
	xhr.open("GET",url,true);
	xhr.onreadystatechange = function() {
  		if (xhr.readyState == 4) {
  		  if (checkJson) {
    		  var parsed = false;
    		  try {
  	  	    var json = JSON.parse(xhr.responseText);
  		      parsed = true;
  		      if (!json.ok)
  		        console.log('AJAX got msg "'+json.msg+'"');
  		      else {
  		        console.log('AJAX got a response');
  		    	  cb(json);
  		      }
  		    } catch (ex) {
  		  	  if (!parsed) {
  		  	    console.log('AJAX unable to parse JSON response');
  		  	    console.log(xhr.responseText);
  		  	  }
  		    }
  		  }
  		  else {
  	      cb(xhr.responseText);
  		  }
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

AttrLink.prototype.newDivStr=function(styles,classes) {
  var s = '<div';
  if (styles) s += ' style="'+styles+'"';
  if (classes) s += ' class="'+classes+'"';
  s += '>';
  return s;
};


AttrLink.prototype.render=function() {
  var s = '';
  // make sure it is inline
  s += '<div class="attr-link">';
  // use flex layout for a set of divs
  s += '<div class="attr-link-container">';

  var styles = this.background ? 'background:'+this.background : null;
  if (this.imageUrl)
    s += this.newDivStr(styles,'img-circle')+'<img class="img-circle" src="'+this.imageUrl+'" /></div>';

  if (this.left) s += this.newDivStr(styles)+'<a href="javascript:'+this.left.action+';">'+this.left.label+'</a></div>';
  if (this.left && this.right) s += this.newDivStr(styles,'divider')+'</div>';
  if (this.right) s += this.newDivStr(styles)+'<a href="javascript:'+this.right.action+';">'+this.right.label+'</a></div>';

  s += '</div>';
  s += '</div>';
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


function FItemRow(json) {
  this.json = json;
}

FItemRow.prototype.getMDIcon=function() {
  var iname = 'subject';
	if (this.json.item_type_name == 'User') iname = 'person';
	else if (this.json.item_type_name == 'Tag') iname = 'label';
	else if (this.json.item_type_name == 'Comment') iname = 'comment';
	return iname;
};

FItemRow.prototype.getElapsedTime=function(dt) {
  var ms = (new Date()).getTime()-dt.getTime();
  var s = Math.round(ms/1000);
  var m = Math.round(s/60);
  if (m < 60) return m+'m';
  var h = Math.round(m/60);
  if (h < 24) return h+'h';
  var d = Math.round(h/24);
  if (d < 7) return d+'d';
  var w = Math.round(d/7);
  return w+'w';
};

FItemRow.prototype.getDiv=function(i,fn) {
  if (!fn) fn = 'select';
  var iname = this.getMDIcon();
  var modify = new Date(this.json.modify*1000);
  var now = (new Date()).getTime();
  console.log('now='+now+' modify='+modify);
  var name = this.json.name_attr ? this.json.name_attr : this.json.item_id;

  var html = '<tr onclick="'+fn+'('+i+');">';
  html += '<td class="mdl-data-table__cell--non-numeric"><i class="material-icons mdl-color--white">'+iname+'</i></td>';
  html += '<td class="mdl-data-table__cell--non-numeric">'+name+'</td>';
  html += '<td class="mdl-data-table__cell--non-numeric">'+this.getElapsedTime(modify)+'</td>';
  html += '</tr>';
  return html;


  html = '<div class="mdl-list__item" style="padding-top:0px;">';
  html += '<span class="mdl-list__item-primary-content">';
  html += '<i class="material-icons mdl-list__item-avatar mdl-color--red">'+iname+'</i>';
  html += '<span>'+name+'</span>';
  html += '</span>';
    //<a class="mdl-list__item-secondary-action" href="#"><i class="material-icons">star</i></a>
  html += '</div>';
  if (true) return html;

  html = '<div class="item-row">';
  html += '<div class="padded-container" style="display:flex;">';
  html += '<div><i class="material-icons">'+iname+'</i></div>';
  html += '<div class="spacer"></div>';
  html += '<a class="name" href="javascript:'+fn+'('+i+');">'+(this.json.name_attr ? this.json.name_attr : this.json.item_id)+'</a>';
  html += '<div class="spacer"></div>';
  html += '<div class="elapsed">'+this.getElapsedTime(modify)+'</div>';
  html += '</div>';
  html += '</div>';
  return html;
};

function FItem(json,isParsed) {
  this.json = isParsed ? json : JSON.parse(json);
}

FItem.prototype.toString=function() {
  return '{FItem name='+this.json.item_id+' json='+JSON.stringify(this.json)+'}';
};

FItem.get=function(name,cb) {
  ajax('https://yangw-2.appspot.com/v4/?op=get_item&item_id='+name,function(json) {
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

FItem.getHistory=function(awac) {
  var history = awac.get('history');
	if (history) {
	  console.log(JSON.stringify(history));
	  var items = [];
	  for (var i=0;i<=history.n;i++) {
		  items[i] = history.names[i];
		}
	  return items;
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
	else if (this.json.item_type_name == 'Comment') iname = 'comment';
	return iname;
};

function needToCreate() {
  _awac.alert('Need to create');
}

FItem.getChipHTML=function(onclick,text,imgUrl,icon,color) {
    var html = '<button type="button" class="mdl-chip mdl-chip--contact" onclick="'+onclick+'">';
    if (imgUrl)
      html += '<img class="mdl-chip__contact" src="'+imgUrl+'"></img>';
    if (icon)
      html += '<span class="mdl-chip__contact mdl-color--gray mdl-color-text--dark-orange" style="margin-right:0px;"><i style="color:'+color+';font-size:18px;line-height:32px;" class="material-icons">'+icon+'</i></span>';
    html += '<span class="mdl-chip__text">'+text+'</span>';
    html += '</button>';
    return html;
};

FItem.prototype.getUserHTML=function(target,user) {
  if (!user) return '';

  if (user.item_id) {
    return FItem.getChipHTML('showNextPage(\''+user.item_id+'\');',user.name_attr,user.image_url,null,null);
  }
  else {
    var onclick = 'needToCreate();';
    return FItem.getChipHTML(onclick,target.substring(5),null,'person','red');
  }
};

FItem.prototype.getTagHTML=function(target,tag) {
  if (!tag) return '';

  if (tag.item_id) {
    return FItem.getChipHTML('showNextPage(\''+tag.item_id+'\');',tag.name_attr,null,'label_outline','teal');
  }
  else {
    var onclick = 'needToCreate();';
    return FItem.getChipHTML(onclick,target.substring(4),null,'label_outline','red');
  }
};

FItem.prototype.getRefHTML=function(target,inline) {
    if (inline.item_id) {
      return '<a class="internal-link" href="javascript:showNextPage(\''+inline.item_id+'\');">'+inline.name_attr+'</a>';
    }

    var onclick = 'onAction(\'new-page:'+target.substring(4)+'\');';
    return FItem.getChipHTML(onclick,target.substring(4),null,'subject','red');
}

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

    if (name == 'ref')
      html = html.replace('[['+target+']]',this.getRefHTML(target,inline));
    else if (name == 'parent')
      html = html.replace('[['+target+']]','<div class="parent-div"><i>parent:</i> <a class="internal-link" href="javascript:showNextPage(\''+inline.item_id+'\');">'+inline.name_attr+'</a></div>');
    else if (name == 'http' || name == 'https')
      html = html.replace('[['+target+']]','<a target="_blank" class="external-link" href="'+target+'">'+target+'</a>');
    else if (name == 'tag')
      html = html.replace('[['+target+']]',this.getTagHTML(target,inline));
    else if (name == 'user')
      html = html.replace('[['+target+']]',this.getUserHTML(target,inline));

    if (inline) {
      console.log(target+'='+JSON.stringify(inline));
    }
    i = j;
  }
  console.log('addLinks html='+html);
  html = html.replace('<p>','<div>').replace('</p>','</div>');
  return html;
};

FItem.prototype.getHTML=function() {
   var html = '';
   var md = this.json.markdown;
   if (md) {
     var renderer = new marked.Renderer();
     // do not convert links
     renderer.link = function(href, title, text) { return href; };
     html += marked(md,{ renderer: renderer });
   }
   //console.log('using marked\n\n'+html);
   //var converter = new showdown.Converter();
   //html = converter.makeHtml(this.json.markdown);
   //console.log('using showdown\n\n'+html);
   html = this.addLinks(html);
   return html;
};



FItem.prototype.getAttrsHTML=function() {
  var html = '<br/><div class="wiki-name-div"><i>id:</i> <span class="wiki-name-span">'+this.json.item_id+'</span></div>';
  var attrs = this.json.attrs_text;
  if (attrs) {
    var j = -1;
    for (;;) {
      var i = (j == -1) ? attrs.indexOf('[[') : attrs.indexOf('[[',j);
      if (i == -1) break;
      var j = attrs.indexOf(']]',i);
      if (j == -1) break;
      var attr = attrs.substring(i+2,j);

      var details = this.json.markdown_inline_values[attr];
      if (details) {
        console.log('found details for [['+attr+']]\n'+JSON.stringify(details));
      }

      var k = attr.indexOf(':');
      var name = attr.substring(0,k);
      var val = attr.substring(k+1);
      if (name != 'name') {
        if (name == 'parent') {
          html += ' <div class="wiki-name-div"><i>'+name+':</i> <a href="javascript:showNextPage(\''+val+'\');"<span class="wiki-name-span">'+val+'</span></a></div>';
        }
        else {
          html += ' <div class="wiki-name-div"><i>'+name+':</i> <span class="wiki-name-span">'+val+'</span></div>';
        }
      }
    }
  }
  return html;
};

FItem.addComment=function(name,markdown,cb) {
  ajax('https://yangw-2.appspot.com/v4/?op=add_comment&attrs=[[parent:'+name+']]&markdown='+encodeURIComponent(markdown),function(jsonStr) {
    cb(JSON.parse(jsonStr).item_id);
  });
};

FItem.addChild=function(parent_id,name_attr,markdown,cb) {
  ajax('https://yangw-2.appspot.com/v4/?op=add_page&attrs=[[parent:'+parent_id+']][[name:'+name_attr+']]&markdown='+encodeURIComponent(markdown),function(jsonStr) {
    cb(JSON.parse(jsonStr).item_id);
  });
};

FItem.addTag=function(name_attr,markdown,cb) {
  ajax('https://yangw-2.appspot.com/v4/?op=add_tag&attrs=[[name:'+name_attr+']]&markdown='+encodeURIComponent(markdown),function(json) {
    cb(json.item_id);
  },true);
};

FItem.addPage=function(item_id,name_attr,markdown,cb) {
  var url = 'https://yangw-2.appspot.com/v4/?op=new_item';
  url += '&item_type=Page';
  if (item_id) url += '&item_id='+item_id;
  url += '&attrs=[[name:'+name_attr+']]';
  url += '&markdown='+encodeURIComponent(markdown);
  ajax(url,function(json) {
    cb(json.item_id);
  },true);
};

FItem.getRecent=function(cb) {
  ajax('https://yangw-2.appspot.com/v4/?op=show_recent',function(jsonStr) {
    cb(JSON.parse(jsonStr));
  });
};

FItem.getLinkedItems=function(fromItemType,attrType,toItemId,cb) {
  var url = 'https://yangw-2.appspot.com/v4/?op=get_linked_items&item_id='+toItemId;
  if (fromItemType) url += '&from_item_type='+fromItemType;
  url += '&attr_type='+attrType;
  ajax(url,function(jsonStr) {
    cb(JSON.parse(jsonStr));
  });
};
