function ItemType(yangw,id,name,attrTypes,key) {
  this.yangw = yangw;
  this.id = id;
  this.name = name;
  this.attrTypes = attrTypes;
  this.key = key;
}

ItemType.prototype.includesAttrType=function(atype) {
  for (var i=0;i<this.attrTypes.length;i++) {
    if (this.attrTypes[i] == atype) return true;
  }
  return false;
};

ItemType.prototype.toString=function() {
  return '{ItemType id:'+this.id+' name:"'+this.name+'"}';
};

ItemType.prototype.toHTML=function(hideMeta) {
  var h = '<div class="itype">';
  h += '<b>item-type</b>: ';
  if (hideMeta) h += '<a href="javascript:showItemType(\''+this.name+'\');">'+this.name+'</a>'; else h += this.name;
  h += '<br/>';
  if (hideMeta) {
  for (var i=0;i<this.attrTypes.length;i++) {
    var atype = this.attrTypes[i];
    if (atype.name == hideMeta)
      h += 'attr-type: <b style="color:green;">'+atype.name+'</b><br/>';
    else 
      h += 'attr-type: <a href="javascript:showAttrType(\''+atype.name+'\');">'+atype.name+'</a><br/>';
  }
  }
  h += '</div>';
  if (!hideMeta) {
    h += '<div class="metadata">';
     h += 'This is an item-type definition<br/>';
    h += 'item-type-id:'+this.id;
    h += '</div>';
  }
  return h;
};


ItemType.prototype.getAttrType=function(name) {
  for (var i=0;i<this.attrTypes.length;i++) {
    if (this.attrTypes[i].name === name) {
      return this.attrTypes[i];
    }
  }
  return null;
};