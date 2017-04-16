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

ItemType.init = false;
ItemType.types = [];

ItemType.initialise=function() {
  var it = new ItemType('Page','subject');
  it = new ItemType('Task','check_box');
  it = new ItemType('Tag','label_outline');
  it = new ItemType('Comment','chat_bubble_outline');
  it = new ItemType('User','person');
  ItemType.init = true;
};

ItemType.get=function(name) {
  if (!ItemType.init) ItemType.initialise();
  var it = ItemType.types[name];
  if (it == null) console.log('Unable to find ItemType '+name);
  return it;
};
