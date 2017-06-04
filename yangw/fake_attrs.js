function AttrType(name,icon,action,isLink,useLinkName) {
  this.name = name;
  this.icon = icon;
  this.action = action;
  this.isLink = isLink;
  this.useLinkName = useLinkName;
  this.useImage = false;
  this.inlineNoChip = false;
  this.inlineNoDecoration = false;

  AttrType.types[name] = this;
}

AttrType.prototype.toString=function() {
  return '{AttrType name='+this.name+' is-link:'+this.isLink+' use-link-name:'+this.useLinkName+'}';
};

AttrType.prototype.getAdditionalHTML=function() {
  var action = this.isLink ? 'add-link' : 'add-value';
  return AttrType.getChipHTML2(action+':'+this.name,this.name,null,this.icon,'teal',AttrType.ADD);
};

AttrType.init = false;
AttrType.types = [];



AttrType.onChipAction=function(event,action) {
  event.stopPropagation();
  onAction(action);
};


AttrType.getChipOnClick=function(op,action) {
  var onclick = 'AttrType.onChipAction(event,';
  onclick += '\'';
  if (op) onclick += op+'-';
  onclick += action+'\'';
  onclick += ')';
  return onclick;
};

AttrType.SELECT = 1;
AttrType.ADD = 2;
AttrType.EDIT = 3;
AttrType.REMOVE = 4;
AttrType.NONE = 5;


AttrType.getChipOpPrefix=function(op) {
  if (op == AttrType.ADD) return 'add';
  if (op == AttrType.EDIT) return 'edit';
  if (op == AttrType.REMOVE) return 'remove';
  if (op == AttrType.NONE) return null;
  return 'show';
}

AttrType.getChipDeletableIcon=function(op) {
  if (op == AttrType.ADD) return 'add_circle_outline';
  if (op == AttrType.EDIT) return 'edit';
  if (op == AttrType.REMOVE) return 'cancel';
  return null;
}

// op is one of
AttrType.getChipHTML=function(op,action,text,imgUrl,icon,color) {
    var isShow = op == AttrType.SHOW;
    var prefix = AttrType.getChipOpPrefix(op);
    var onclick = this.getChipOnClick(prefix,action);
    var delIcon = this.getChipDeletableIcon(op);
    //
    var style = '';
    if (op == AttrType.ADD) style = ' style="background-color:white;border:solid 1px gray;"';

    var html = isShow ?
      '<button type="button" class="mdl-chip mdl-chip--contact" onclick="'+onclick+'">' :
      '<span class="mdl-chip mdl-chip--contact mdl-chip--deletable"'+style+' onclick="'+onclick+'">';
    if (imgUrl)
      html += '<img class="mdl-chip__contact" src="'+imgUrl+'"></img>';
    if (icon)
      html += '<span class="mdl-chip__contact mdl-color--gray mdl-color-text--dark-orange" style="margin-right:0px;"><i style="color:'+color+';font-size:18px;line-height:32px;" class="material-icons">'+icon+'</i></span>';
    html += '<span class="mdl-chip__text">'+text+'</span>';
    if (delIcon)
      html += '<a onclick="'+onclick+'" class="mdl-chip__action"><i class="material-icons">'+delIcon+'</i></a>';
    html += isShow ? '</button>' : '</span>';
    return html;
};

AttrType.getChipHTML2=function(action,text,imgUrl,icon,color,op) {
    var isShow = true;
    if (op) isShow = false;
    //var prefix = AttrType.getChipOpPrefix(op);
    var onclick = this.getChipOnClick(null,action);
    var delIcon = this.getChipDeletableIcon(op);
    //
    var style = '';
    if (op == AttrType.ADD) style = ' style="background-color:white;border:solid 1px gray;"';

    var html = isShow ?
      '<button type="button" class="mdl-chip mdl-chip--contact" onclick="'+onclick+'">' :
      '<span class="mdl-chip mdl-chip--contact mdl-chip--deletable"'+style+' onclick="'+onclick+'">';
    if (imgUrl)
      html += '<img class="mdl-chip__contact" src="'+imgUrl+'"></img>';
    if (icon)
      html += '<span class="mdl-chip__contact mdl-color--gray mdl-color-text--dark-orange" style="margin-right:0px;"><i style="color:'+color+';font-size:18px;line-height:32px;" class="material-icons">'+icon+'</i></span>';
    html += '<span class="mdl-chip__text">'+text+'</span>';
    if (delIcon)
      html += '<a onclick="'+onclick+'" class="mdl-chip__action"><i class="material-icons">'+delIcon+'</i></a>';
    html += isShow ? '</button>' : '</span>';
    return html;
};

AttrType.initialise=function() {
  var at = new AttrType('done','check_box','toggle',false);
  at.getHTML = function(attrtext,inline,op) {
    var icon = attrtext.toLowerCase() == 'done:true' ? 'check_box' : 'check_box_outline_blank';
    return AttrType.getChipHTML(null,'toggle-attr:done','Done',null,icon,'teal');
  };

  at = new AttrType('ref','link',null,true,false);
  at.inlineNoChip = true;
  at.inlineNoDecoration = true;
  at.getHTML = function(attrtext,inline,op) {
    if (inline.item_id) {
      return '<a class="internal-link" href="javascript:onAction(\'show-item:'+inline.item_id+'\');">'+inline.name_attr+'</a>';
    }
    var ref = attrtext.substring(4);
    return AttrType.getChipHTML(op,'new-page:'+ref,ref,null,'subject','red');
  };

  at = new AttrType('parent','arrow_upward',null,true,false);
  at.getHTML = function(attrtext,inline,op) {
    if (!inline) return '';
    if (inline.item_id) {
      return AttrType.getChipHTML(op,'attr:'+inline.item_id,inline.name_attr,null,'arrow_drop_up','teal');
    }
    else {
      var name = attrtext.substring(7);
      return AttrType.getChipHTML(null,null,name,null,'arrow_drop_up','red');
    }
  };

  at = new AttrType('http','launch','show');
  at.inlineNoChip = true;
  at.getHTML = function(attrtext,inline,op) {
    return '<a target="_blank" class="external-link" href="'+attrtext+'">'+attrtext+'</a>';
  };

  at = new AttrType('https','launch','show');
  at.inlineNoChip = true;
  at.getHTML = function(attrtext,inline,op) {
    return '<a target="_blank" class="external-link" href="'+attrtext+'">'+attrtext+'</a>';
  };

  at = new AttrType('tag','label_outline',null,true,true);
  at.getHTML = function(attrtext,inline,op) {
    if (!inline) return '';
    if (inline.item_id) {
      return AttrType.getChipHTML(op,'attr:'+inline.item_id,inline.name_attr,null,'label_outline','teal');
    }
    else {
      var name = attrtext.substring(4);
      return AttrType.getChipHTML(null,'new-tag:'+name,name,null,'label_outline','red');
    }
  };

  at = new AttrType('user','person_outline',null,true,true);
  at.useImage = true;
  at.getHTML = function(attrtext,inline,op) {
    if (!inline) return '';
    if (inline.item_id) {
      return AttrType.getChipHTML(op,'item:'+inline.item_id,inline.name_attr,inline.image_url,null,null);
    }
    else {
      return AttrType.getChipHTML(op,'item:'+attrText,attrtext.substring(5),null,'person','red');
    }
  };

  AttrType.init = true;
}

AttrType.get=function(name) {
  if (!AttrType.init) AttrType.initialise();
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
