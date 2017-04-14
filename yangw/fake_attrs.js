function AttrType(name) {
  this.name = name;
  AttrType.types[name] = this;
}

AttrType.prototype.toString=function() {
  return '{AttrType name='+this.name+'}';
};

AttrType.init = false;
AttrType.types = [];

AttrType.getChipHTML=function(onclick,text,imgUrl,icon,color) {
    var html = '<button type="button" class="mdl-chip mdl-chip--contact" onclick="'+onclick+'">';
    if (imgUrl)
      html += '<img class="mdl-chip__contact" src="'+imgUrl+'"></img>';
    if (icon)
      html += '<span class="mdl-chip__contact mdl-color--gray mdl-color-text--dark-orange" style="margin-right:0px;"><i style="color:'+color+';font-size:18px;line-height:32px;" class="material-icons">'+icon+'</i></span>';
    html += '<span class="mdl-chip__text">'+text+'</span>';
    html += '</button>';
    return html;
};

AttrType.initialise=function() {
  console.log('\n\n\nAttrType initialised');

  var at = new AttrType('done');
  at.getHTML = function(attrtext,inline) {
    var icon = attrtext.toLowerCase() == 'done:true' ? 'check_box' : 'check_box_outline_blank';
    var onclick = 'onAction(\'toggle-attr:done\');';
    return AttrType.getChipHTML(onclick,'Done',null,icon,'teal');
  };

  at = new AttrType('ref');
  at.getHTML = function(attrtext,inline) {
    if (inline.item_id) {
      return '<a class="internal-link" href="javascript:showNextPage(\''+inline.item_id+'\');">'+inline.name_attr+'</a>';
    }
    var onclick = 'onAction(\'new-page:'+attrtext.substring(4)+'\');';
    return AttrType.getChipHTML(onclick,attrtext.substring(4),null,'subject','red');
  };

  at = new AttrType('parent');
  at.getHTML = function(attrtext,inline) {
    if (!inline) return '';
    if (inline.item_id) {
      return AttrType.getChipHTML('showNextPage(\''+inline.item_id+'\');',inline.name_attr,null,'arrow_drop_up','teal');
    }
    else {
      var name = attrtext.substring(7);
      return AttrType.getChipHTML(null,name,null,'arrow_drop_up','red');
    }
  }

  at = new AttrType('http');
  at.getHTML = function(attrtext,inline) {
    return '<a target="_blank" class="external-link" href="'+attrtext+'">'+attrtext+'</a>';
  }

  at = new AttrType('https');
  at.getHTML = function(attrtext,inline) {
    return '<a target="_blank" class="external-link" href="'+attrtext+'">'+attrtext+'</a>';
  }

  at = new AttrType('tag');
  at.getHTML = function(attrtext,inline) {
    if (!inline) return '';
    if (inline.item_id) {
      return AttrType.getChipHTML('showNextPage(\''+inline.item_id+'\');',inline.name_attr,null,'label_outline','teal');
    }
    else {
      var name = attrtext.substring(4);
      var onclick = 'onAction(\'new-tag:'+name+'\');';
      return AttrType.getChipHTML(onclick,name,null,'label_outline','red');
    }
  };

  at = new AttrType('user');
  at.getHTML = function(attrtext,inline) {
    if (!inline) return '';
    if (inline.item_id) {
      return AttrType.getChipHTML('showNextPage(\''+inline.item_id+'\');',inline.name_attr,inline.image_url,null,null);
    }
    else {
      var onclick = 'needToCreate();';
      return AttrType.getChipHTML(onclick,attrtext.substring(5),null,'person','red');
    }
  };

  AttrType.init = true;
}

AttrType.get=function(name) {
  if (!AttrType.init) AttrType.initialise();
  console.log('!!!!!!!!! get AttrType '+name);
  var at = AttrType.types[name];
  return at;
};

function Attrs(text) {
    this.text = text;
}

Attrs.prototype.contains=function(name) {
  if (!this.text) return false;
  var target = '[['+name+':';
  return this.text.indexOf(target) != -1;
}

Attrs.prototype.getValue=function(name) {
  if (this.text) {
    var target = '[['+name+':';
    var i = this.text.indexOf(target);
    if (i != -1) {
      var j = this.text.indexOf(']]',i);
      if (j != -1) {
        return this.text.substring(i+target.length,j);
      }
    }
  }
  return null;
}

Attrs.prototype.remove=function(name) {
  if (!this.text) return;
  var target = '[['+name+':';
  var i = this.text.indexOf(target);
  if (i != -1) {
    var j = this.text.indexOf(']]',i);
    if (j != -1) {
      this.text = this.text.substring(0,i)+this.text.substring(j+2);
    }
  }
};

Attrs.prototype.update=function(name,oldval,newval) {
  if (!this.text) return;
  var target = '[['+name+':'+oldval+']]';
  var i = this.text.indexOf(target);
  if (i != -1) {
    this.text = this.text.substring(0,i)+'[['+name+':'+newval+']]'+this.text.substring(i+target.length);
  }
};

Attrs.prototype.add=function(name,value) {
  if (!value) return;
  if (!this.text) this.text = '';
  this.text += '[['+name+':'+value+']]';
};

Attrs.prototype.getText=function() {
  return this.text;
}
