function AttrType(name,icon,action) {
  this.name = name;
  this.icon = icon;
  this.iconMap = null;
  this.action = action;

  this.isLink = false;
  this.useLinkName = false;
  this.linkItemType = null;
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
  return AttrType.getChipHTML2(action+':'+this.name,this.name,null,null,'teal',AttrType.ADD);
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

AttrType.getChipDeletableIcon=function(op) {
  if (op == AttrType.ADD) return 'add';
  if (op == AttrType.EDIT) return 'edit';
  if (op == AttrType.REMOVE) return 'close';
  return null;
}

AttrType.getChipHTML2=function(action,text,imgUrl,icon,color,op) {
    var isShow = true;
    if (op) isShow = false;

    var onclick = this.getChipOnClick(null,action);
    var delIcon = this.getChipDeletableIcon(op);
    //
    var style = '';
    if (op == AttrType.ADD) style = ' style="background-color:white;border:solid 1px gray;"';

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

AttrType.initialise=function() {
  var at = new AttrType('done','check_box','toggle');
  at.iconMap = {'true':'check_box','false':'check_box_outline_blank'};

  at = new AttrType('ref','link');
  at.isLink = true;
  at.inlineNoChip = true;
  at.inlineNoDecoration = true;

  at = new AttrType('parent','arrow_upward');
  at.isLink = true;

  at = new AttrType('http','launch','show');
  at.inlineNoChip = true;

  at = new AttrType('https','launch','show');
  at.inlineNoChip = true;

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
