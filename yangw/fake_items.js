var _itemTitles = ['An Introduction to Items',
              'Everything you wanted to know about items but were afraid to ask',
              'Well Known Item Types'];




function ajax(url,cb,checkJson,logJson) {
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
            console.log('AJAX got a valid JSON response');
  		      if (logJson) console.log(' - '+JSON.stringify(json));
            if (!json.ok) {
  		        console.log('AJAX got ok=false msg "'+json.msg+'"');
              try {
                _awac.alert(json.msg);
              } catch (e) {}
            }
  		      else {
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

/* supports a set of static methods that should work with both FItem and FItemRow objects */
function FItemUtil() {
}

FItemUtil.getItemName=function(item) {
  return item.json.name_attr;
};

FItemUtil.getItemTitleHTML=function(item) {
  if (item.itemType.name == 'Task') {
    if (item.json.attrs_text.indexOf('done:true') != -1)
      return '<span style="text-decoration:line-through;">'+item.json.name_attr+'<span>';
  }
  return item.json.name_attr ? item.json.name_attr : item.json.item_id;
};

FItemUtil.getItemMDIcon=function(item) {
  if (item.itemType.name == 'Task') {
    if (item.json.attrs_text.indexOf('done:true') == -1)
      return 'check_box_outline_blank';
  }
  return item.itemType.getMDIcon();
};

function FItemRow(json) {
  this.json = json;
  this.itemType = ItemType.get(this.json.item_type_name);
}

FItemRow.getElapsedTime=function(time) {
  var ms = (new Date()).getTime()-time;
  var s = Math.round(ms/1000);
  var m = Math.round(s/60);
  if (m < 60) {
    if (m == 0) return 'Just now';
    return m+'m';
  }
  var h = Math.round(m/60);
  if (h < 24) return h+'h';
  var d = Math.round(h/24);
  if (d < 7) return d+'d';
  var w = Math.round(d/7);
  return w+'w';
};

FItemRow.prototype.getMDIcon=function() {
  return FItemUtil.getItemMDIcon(this);
};

FItemRow.prototype.getTitleHTML=function() {
  return FItemUtil.getItemTitleHTML(this);
};

FItemRow.prototype.getDiv=function(i,rowFn,iconFn) {
  var iname = this.getMDIcon();
  var modify = new Date(this.json.modify*1000);
  var titleHtml = this.getTitleHTML();

  var img = '<i class="material-icons mdl-color--white">'+iname+'</i>';

  var ii = -1;
  if (this.json.attrs_text2) ii = this.json.attrs_text2.indexOf('[[image:');
  if (ii != -1) {
    var j = this.json.attrs_text2.indexOf(']]',ii);
    var imageUrl = this.json.attrs_text2.substring(ii+8,j);
    img = '<img style="width:24px;height:24px;" src="'+imageUrl+'" />';
  }
  var onclick = rowFn ? ' onclick="'+rowFn+'(event,'+i+');"' : '';
  var html = '<tr'+onclick+'>';
  onclick = iconFn ? ' onclick="'+iconFn+'(event,'+i+');" style="cursor:pointer;"' : '';
  html += '<td style="width:20%;" class="item-row mdl-data-table__cell--non-numeric"'+onclick+'>'+img+'</td>';
  html += '<td style="width:60%;" class="item-row item-row-label mdl-data-table__cell--non-numeric">'+titleHtml+'</td>';
  html += '<td style="width:20%;text-align:center;" class="item-row mdl-data-table__cell--non-numeric">'+FItemRow.getElapsedTime(modify.getTime())+'</td>';
  html += '</tr>';
  return html;
};

FItemRow.prototype.update_attr=function(name,value,cb) {
  var url = FItem.apiUrl + 'op=update_item_attr&item_id='+this.json.item_id+'&item_last_modified='+this.json.modify
                +'&name='+encodeURIComponent(name)+'&value='+encodeURIComponent(value);
  ajax(url,function(json) {
    cb(json);
  },true,true);
};

function FItem(json,isParsed) {
  this.json = isParsed ? json : JSON.parse(json);
  this.itemType = ItemType.get(this.json.item_type_name);
}

FItem.prototype.toString=function() {
  return '{FItem name='+this.json.item_id+' json='+JSON.stringify(this.json)+'}';
};

FItem.apiUrl = 'https://yangw-2.appspot.com/v4/?';

FItem.get=function(name,cb) {
  ajax(FItem.apiUrl+'op=get_item&item_id='+name,function(json) {
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

FItem.prototype.getUserHTML=function() {
  return AttrType.get('user').getHTML(null,this.json.author);
};

FItem.prototype.getTitleHTML=function() {
  return FItemUtil.getItemTitleHTML(this);
};

FItem.prototype.getAttrsText=function() {
  console.log('FItem.getAttrsText()');
  var result = this.json.attrs_text;
  console.log(' - old attrs_text:'+result);
  if (this.attrsArray) {
    result = this.getAttrsArrayText();
    console.log(' - attrsArray='+result);
  }
  return result;
};

FItem.prototype.getMDIcon=function() {
  return FItemUtil.getItemMDIcon(this);
};

FItem.prototype.fixupAttributes=function(html) {
  if (!html) return null;
  console.log('\n\n\nfixupAttributes()');
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
    var attr = new Attr(at,target,inline);

    console.log(' - get showable '+attr);
    var tmp = attr.getShowableHTML(true);
    if (tmp)
        html = html.replace('[['+target+']]',tmp);

    i = j;
  }
  //console.log('addLinks html='+html);
  //html = html.replace('<p>','<div>').replace('</p>','</div>');
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

function Attr(at,text,details) {
  this.index = Attr._index++;
  this.at = at;
  this.text = text;
  this.details = details;
  //console.log('new Attr() details='+JSON.stringify(details));
}

Attr._index = 0;

Attr.prototype.toString = function() {
  var s = '{Attr index:'+this.index+' attr-type:'+this.at.name+' text:'+this.text;
  if (this.details) s += ' details:'+JSON.stringify(this.details);
  s += '}';
  return s;
}

Attr.prototype.getAttr=function(name) {
  var text = this.details.attrs_text;
  if (text) {
    var i = text.indexOf('[['+name+':');
    if (i != -1) {
      var j = text.indexOf(']]',i);
      if (j != -1) {
        return text.substring(i+name.length+3,j);
      }
    }
  }
  return null;
};

Attr.prototype.getLinkNameAttr=function() {
  if (this.details) {
    return this.details.name_attr ? this.details.name_attr : this.getAttr('name');
  }
  return null;
};

Attr.prototype.getLinkImageUrl=function() {
  if (this.at.useImage && this.details) {
    return this.details.image_url ? this.details.image_url : this.getAttr('image');
  }
  return null;
};

Attr.prototype.getLinkItemId=function() {
  return this.details ? this.details.item_id : '';
};

Attr.prototype.getDeleteableHTML=function(index) {
  if (this.at.name == 'user') console.log('generate chip for '+this);
  if (this.at.icon) {
    if (this.at.isLink) {
      var name = this.getLinkNameAttr();
      if (name) {
        var img = this.getLinkImageUrl();
        var icon = img ? null : this.at.icon;
        var action = 'remove-attr:'+this.at.name+':'+index;
        return AttrType.getChipHTML2(action,name,img,icon,'teal',AttrType.REMOVE);
      }
    }
    else {
      var action = 'remove-attr:'+this.at.name+':'+index;
      var label = this.text;
      return AttrType.getChipHTML2(action,label,null,this.at.icon,'teal',AttrType.REMOVE);
    }
  }
  return '';
};

Attr.prototype.getInlineHTML=function(action,name) {
  console.log(' - getInlineHTML() at='+this.at.name+' action='+action+' name='+name);
  var label = name;
  if (!this.at.inlineNoDecoration) label = this.at.name+':'+name;
  var icon = '';
  if (this.at.icon && !this.at.inlineNoDecoration) icon = '<i style="font-size:14px;" class="material-icons">'+this.at.icon+'</i>';
  console.log(' - - icon = '+icon);
  return '<a class="yw-'+this.at.name+'-attr" title="'+action+'" href="javascript:onAction(\''+action+'\')">'+label+icon+'</a>';
}

Attr.prototype.getShowableHTML=function(inline) {
  if (this.at.icon) {
    if (this.at.isLink) {
      var name = this.getLinkNameAttr();
      if (name) {
        var img = this.getLinkImageUrl();
        var icon = img ? null : this.at.icon;
        var action = 'show-item:'+this.getLinkItemId();
        return (inline && this.at.inlineNoChip) ?
          this.getInlineHTML(action,name) :
          AttrType.getChipHTML2(action,name,img,icon,'teal');
      }
    }
    else {
      var label = this.text.substring(this.at.name.length+1);
      var action = this.at.action+'-'+this.text;
      return (inline && this.at.inlineNoChip) ?
        this.getInlineHTML(action,label) :
        AttrType.getChipHTML2(action,this.text,null,this.at.icon,'teal');
    }
  }
  else {
    return this.text;
  }
  return '';
};

FItem.prototype.getAttrsArrayText=function() {
  if (!this.attrsArray) return '';
  var result = '';
  for (var i=0;i<this.attrsArrayLen;i++) {
    var attr = this.attrsArray[i];
    result += '[['+attr.text+']]';
  }
  return result;
};

FItem.prototype.loadAttrsArray=function() {
  if (this.attrsArray) return;
  this.attrsArray = [];
  this.attrsArrayLen = 0;
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
      var name = attr.substring(0,attr.indexOf(':'));
      var at = AttrType.get(name);
      if (at) {
        this.attrsArray[this.attrsArrayLen] = new Attr(at,attr,details);
        this.attrsArrayLen++;
      }
    }
  }
}

FItem.prototype.addToAttrsArray=function(at,attr,details) {
  this.loadAttrsArray();
  var a = new Attr(at,attr,details);
  this.attrsArray[this.attrsArrayLen] = a;
  this.attrsArrayLen++;
  console.log('added '+a);
};

FItem.prototype.removeFromAttrsArray=function(index) {
  this.loadAttrsArray();
  index = parseInt(index);
  var found = -1;
  for (var i=0;i<this.attrsArrayLen;i++) {
    if (this.attrsArray[i].index == index) {
      found = i;
      break;
    }
  }
  if (found != -1) {
    for (var i=found+1;i<this.attrsArrayLen;i++) {
      this.attrsArray[i-1] = this.attrsArray[i];
    }
    this.attrsArrayLen--;
  }
};

FItem.prototype.traverseAttrs=function(listener) {
  console.log('traverseAttrs()');
  this.loadAttrsArray();
  for (var name in AttrType.types) {
    console.log(' - '+name);
    var at = AttrType.types[name];
    for (var i=0;i<this.attrsArrayLen;i++) {
      var a = this.attrsArray[i];
      if (a.at == at) {
        console.log(' - - '+a);
        listener.onAttr(a);
      }
    }
  }
};

function LogListener() {
  console.log('\n\nLogListener()');
}

LogListener.prototype.onAttr=function(at,attrtext,details) {
  console.log(' - '+at+' [['+attrtext+']] '+JSON.stringify(details));
};

function ShowAttrListener(op) {
  this.op = op;
  this.first = true;
  this.html = '';
  this.names = '';
  this.lastAttrType = null;
}

FItem.addComment=function(name,markdown,cb) {
  var url = FItem.apiUrl+'op=add_comment&attrs=[[parent:'+name+']]&markdown='+encodeURIComponent(markdown);
  ajax(url,function(json) {
    cb(json.item_id);
  },true,true);
};

FItem.addChildPage=function(parent_id,name_attr,markdown,cb) {
  var url = FItem.apiUrl+'op=add_page&attrs=[[parent:'+parent_id+']][[name:'+name_attr+']]&markdown='+encodeURIComponent(markdown);
  ajax(url,function(json) {
    cb(json.item_id);
  },true,true);
};

FItem.addChildTask=function(parent_id,name_attr,markdown,cb) {
  console.log('FItem.addChildTask()');
  var url = FItem.apiUrl+'op=new_item&item_type=Task&attrs=[[parent:'+parent_id+']][[name:'+encodeURIComponent(name_attr)+']][[done:false]]&row=true';
  if (markdown) url += '&markdown='+encodeURIComponent(markdown);
  ajax(url,function(json) {
    //console.log(' - '+JSON.stringify(json));
    cb(json.item);
  },true,true);
};

FItem.addTag=function(name_attr,markdown,cb) {
  var url = FItem.apiUrl+'op=add_tag&attrs=[[name:'+name_attr+']]&markdown='+encodeURIComponent(markdown);
  ajax(url,function(json) {
    cb(json.item_id);
  },true,true);
};

FItem.prototype.update=function(attrs_text,markdown,cb) {
  var url = FItem.apiUrl+'op=update_item&item_id='+this.json.item_id+'&item_last_modified='+this.json.modify
                +'&attrs='+encodeURIComponent(attrs_text)+'&markdown='+encodeURIComponent(markdown);
  ajax(url,function(json) {
    cb(json);
  },true,true);
};

FItem.prototype.update_attr=function(name,value,cb) {
  var url = FItem.apiUrl + 'op=update_item_attr&item_id='+this.json.item_id+'&item_last_modified='+this.json.modify
                +'&name='+encodeURIComponent(name)+'&value='+encodeURIComponent(value);
  ajax(url,function(json) {
    cb(json);
  },true,true);
};

FItem.addPage=function(item_id,name_attr,markdown,cb) {
  var url = FItem.apiUrl+'op=new_item';
  url += '&item_type=Page';
  if (item_id) url += '&item_id='+item_id;
  url += '&attrs=[[name:'+name_attr+']]';
  if (markdown) url += '&markdown='+encodeURIComponent(markdown);
  ajax(url,function(json) {
    cb(json.item_id);
  },true,true);
};

FItem.getRecent=function(cb,item_type_name) {
  var url = FItem.apiUrl+'op=show_recent';
  if (item_type_name) url += '&item_type='+item_type_name;
  ajax(url,function(jsonStr) {
    cb(JSON.parse(jsonStr));
  });
};

FItem.getLinkedItems=function(fromItemType,attrType,toItemId,cb,params) {
  console.log('FItem.getLinkedItems() params='+JSON.stringify(params));
  var url = 'https://yangw-2.appspot.com/v4/?op=get_linked_items&item_id='+toItemId;
  if (fromItemType) url += '&from_item_type='+fromItemType;
  url += '&attr_type='+attrType;
  ajax(url,function(json) {
    cb(JSON.parse(json),params);
  });
};
