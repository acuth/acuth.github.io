function AttrType(name,icon,action) {
  this.name = name;
  this.icon = icon;
  this.iconMap = null;
  this.action = action;

  this.single = false;
  this.isLink = false;
  this.useLinkName = false;
  this.linkItemType = null;
  this.useImage = false;
  this.inlineNoChip = false;
  this.inlineNoDecoration = false;

  this.addAttrTitle = 'add '+name+' value';
  this.editAttrTitle = 'edit '+name+' value';

  AttrType.types[name] = this;
}

AttrType.prototype.toString=function() {
  return '{AttrType name='+this.name+' is-link:'+this.isLink+' use-link-name:'+this.useLinkName+'}';
};

AttrType.prototype.getAdditionalHTML=function() {
  var action = this.isLink ? 'add-link' : 'add-value';
  return AttrType.getChipHTML2(action+':'+this.name,this.name,null,null,'teal',AttrType.ADD);
};

AttrType.prototype.getEditableHTML=function() {
  var action = this.isLink ? 'edit-link' : 'edit-value';
  return AttrType.getChipHTML2(action+':'+this.name,this.name,null,null,'teal',AttrType.EDIT);
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

AttrType.getChipHTML2=function(action,text,imgUrl,icon,color,op) {
    var isShow = true;
    if (op) isShow = false;

    var onclick = this.getChipOnClick(null,action);
    var delIcon = this.getChipDeletableIcon(op);
    //
    var style = '';
    if (op == AttrType.ADD || op == AttrType.EDIT) style = ' style="background-color:white;border:solid 1px gray;"';

    var contact = '';
    if (icon || imgUrl) contact = ' mdl-chip--contact';
    var html = isShow ?
      '<button type="button" class="mdl-chip'+contact+'" onclick="'+onclick+'">' :
      '<span class="mdl-chip'+contact+' mdl-chip--deletable"'+style+' onclick="'+onclick+'">';
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

AttrType.SELECT = 1;
AttrType.ADD = 2;
AttrType.EDIT = 3;
AttrType.REMOVE = 4;
AttrType.NONE = 5;

AttrType.getChipDeletableIcon=function(op) {
  if (op == AttrType.ADD) return 'add';
  if (op == AttrType.EDIT) return 'edit';
  if (op == AttrType.REMOVE) return 'close';
  return null;
}

AttrType.prototype.getCardHTML=function() {
  var text = this.isLink ? 'A link to ' : 'A value.';
  if (this.isLink) {
    text += this.linkItemType ? 'an item of type '+this.linkItemType+'.' : 'another item.';
    if (this.single) text += ' Only one attribute of this type per item.'
  }

  var html = '<div class="mdl-card mdl-cell mdl-cell--4-col mdl-shadow--2dp">';
  html += '<div class="mdl-card__title"><i style="color:teal;padding-right:12px;" class="material-icons">'+this.icon+'</i>'+this.name+'</div>';
  html += '<div class="mdl-card__supporting-text">'+text+'</div>';
  html += '</div>';
  return html;
}

AttrType.initialise=function() {
  var at = new AttrType('done','check_box','toggle');
  at.iconMap = {'true':'check_box','false':'check_box_outline_blank'};
  at.single = true;

  at = new AttrType('parent','arrow_upward');
  at.isLink = true;
  at.single = true;

  at = new AttrType('tag','label_outline');
  at.isLink = true;
  at.linkItemType = 'Tag';
  at.useLinkName = true;

  at = new AttrType('task','check_box');
  at.isLink = true;
  at.linkItemType = 'Task';

  at = new AttrType('user','person_outline');
  at.isLink = true;
  at.linkItemType = 'User';
  at.useLinkName = true;
  at.useImage = true;

  at = new AttrType('ref','link');
  at.isLink = true;
  at.inlineNoChip = true;
  at.inlineNoDecoration = true;

  at = new AttrType('theme','color_lens');
  at.isLink = true;
  at.linkItemType = 'Theme';
  at.useLinkName = true;
  at.single = true;

  at = new AttrType('http','launch','show');
  at.inlineNoChip = true;
  at.addAttrTitle = 'add an external link';
  at.editAttrTitle = 'add an external link';

  at = new AttrType('https','launch','show');
  at.inlineNoChip = true;
  at.addAttrTitle = 'add an external link';
  at.editAttrTitle = 'add an external link';

  at = new AttrType('summary','vertical_align_center','show');
  at.inlineNoChip = true;
  at.single = true;
  at.addAttrTitle = 'write a short summary';
  at.editAttrTitle = 'write a short summary';

  at = new AttrType('css_name','format_color_fill','show');
  at.inlineNoChip = true;
  at.single = true;
  at.addAttrTitle = 'write a CSS name';
  at.editAttrTitle = 'write a CSS name';

  at = new AttrType('component_order','filter_list','show');
  at.inlineNoChip = true;
  at.single = true;

  at = new AttrType('key_image','image','show');
  at.inlineNoChip = true;
  at.single = true;
  at.addAttrTitle = 'supply image URL';
  at.editAttrTitle = 'supply image URL';

  at = new AttrType('mdl_name','format_color_fill','show');
  at.inlineNoChip = true;

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
