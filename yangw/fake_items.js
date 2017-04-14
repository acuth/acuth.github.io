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
  		      if (!json.ok) {
  		        console.log('AJAX got msg "'+json.msg+'"');
              try {
                _awac.alert(json.msg);
              } catch (e) {}
            }
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

FItemRow.getElapsedTime=function(time) {
  var ms = (new Date()).getTime()-time;
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
  html += '<td class="mdl-data-table__cell--non-numeric">'+FItemRow.getElapsedTime(modify.getTime())+'</td>';
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
  html += '<div class="elapsed">'+FItemRow.getElapsedTime(modify.getTime())+'</div>';
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

FItem.prototype.getUserHTML=function() {
  return AttrType.get('user').getHTML(null,this.json.author);
};

FItem.prototype.fixupAttributes=function(html) {
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

    var at = AttrType.get(name);
    if (at)
        html = html.replace('[['+target+']]',at.getHTML(target,inline));

    i = j;
  }
  console.log('addLinks html='+html);
  html = html.replace('<p>','<div>').replace('</p>','</div>');
  return html;
};

FItem.prototype.getMarkdownHTML=function() {
   var html = '';
   var md = this.json.markdown;
   if (md) {
     var renderer = new marked.Renderer();
     // do not convert links
     renderer.link = function(href, title, text) { return href; };
     html += marked(md,{ renderer: renderer });
   }
   html = this.fixupAttributes(html);
   return html;
};

FItem.prototype.getMetaHTML=function() {
  var modify = FItemRow.getElapsedTime(this.json.modify*1000);
  var html = '<div class="wiki-name-div"><i>id:</i> <span class="wiki-name-span">'+this.json.item_id+'</span></div> '+modify;
  return html;
};

FItem.prototype.getAttrsHTML=function() {
  var html = '';
  var attrs = this.json.attrs_text;
  var first = true;
  if (attrs) {
    var j = -1;
    for (;;) {
      var i = (j == -1) ? attrs.indexOf('[[') : attrs.indexOf('[[',j);
      if (i == -1) break;
      var j = attrs.indexOf(']]',i);
      if (j == -1) break;
      var attr = attrs.substring(i+2,j);
      var details = this.json.markdown_inline_values[attr];
      var k = attr.indexOf(':');
      var name = attr.substring(0,k);
      var at = AttrType.get(name);
      if (at) {
        if (first) {
          first = false;
          html += '<hr/><br/>';
        }
        html += at.getHTML(attr,details);
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

FItem.prototype.update=function(attrs_text,markdown,cb) {
  var itemId = this.json.item_id;
  ajax('https://yangw-2.appspot.com/v4/?op=update_item&item_id='+itemId+'&item_last_modified='+this.json.modify+'&attrs='+encodeURIComponent(attrs_text)+'&markdown='+encodeURIComponent(markdown),function() {
    cb(itemId);
  },true);
};

FItem.addPage=function(item_id,name_attr,markdown,cb) {
  var url = 'https://yangw-2.appspot.com/v4/?op=new_item';
  url += '&item_type=Page';
  if (item_id) url += '&item_id='+item_id;
  url += '&attrs=[[name:'+name_attr+']]';
  if (markdown) url += '&markdown='+encodeURIComponent(markdown);
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
