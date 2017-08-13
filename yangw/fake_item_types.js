function ItemType(name,mdIcon) {
  this.name = name;
  this.mdIcon = mdIcon;
  ItemType.types[name] = this;
}

ItemType.prototype.toString=function() {
  return '{ItemType name='+this.name+' md-icon='+this.mdIcon+'}';
};

ItemType.prototype.getMDIcon=function() {
	return this.mdIcon;
}

ItemType.prototype.getCardHTML=function() {
  var html = '<div class="mdl-card mdl-cell mdl-cell--4-col mdl-shadow--2dp">';
  html += '<div class="mdl-card__title">'+
'<i style="color:teal;padding-right:12px;" class="material-icons">'+this.mdIcon+'</i>  '+this.name+'</div>';
  html += '<div class="mdl-card__supporting-text">';
  html == 'xxxxxxx';
  html += '</div>';
  html += '</div>';
  return html;
}

ItemType.init = false;
ItemType.types = [];

ItemType.initialise=function() {
  var it = new ItemType('Page','subject');
  it = new ItemType('Task','check_box');
  it = new ItemType('Tag','label_outline');
  it = new ItemType('Comment','chat_bubble_outline');
  it = new ItemType('User','person');
  it = new ItemType('Theme','color_lens');
  ItemType.init = true;
};

ItemType.get=function(name) {
  if (!ItemType.init) ItemType.initialise();
  var it = ItemType.types[name];
  if (it == null) console.log('Unable to find ItemType '+name);
  return it;
};
