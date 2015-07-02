function Item(yangw,id,itype,attrs) {
  this.yangw = yangw;
  this.id = id;
  this.itemType = itype;
  this.attrs = attrs;
}

Item.prototype.toString=function() {
  return '{Item id:'+this.id+' item-type:"'+this.itemType.name+'"}';
};

Item.prototype.toHTML=function() {
  var h = '<div class="item">';
  h += 'id:'+this.id+'<br/>';
  h += 'item-type:'+this.itemType.name;
  h += '</div>';
  return h;
};

Item.prototype.keyValue=function() {
  var key = this.itemType.key;
  if (!key) return null;
  var value = null;
  for (var i=0;i<this.attrs.length;i++) {
    if (this.attrs[i].name == key) {
      value = this.attrs[i].value;
      break;
    }
  }
  return this.itemType.name+":"+JSON.stringify(value);
};