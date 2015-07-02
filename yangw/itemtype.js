function ItemType(yangw,id,name,attrTypes,key) {
  this.yangw = yangw;
  this.id = id;
  this.name = name;
  this.attrTypes = attrTypes;
  this.key = key;
}

ItemType.prototype.toString=function() {
  return '{ItemType id:'+this.id+' name:"'+this.name+'"}';
};

ItemType.prototype.toHTML=function() {
  var h = '<div class="itype">';
  h += 'id:'+this.id+'<br/>';
  h += 'name:"'+this.name+'"';
  h += '</div>';
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