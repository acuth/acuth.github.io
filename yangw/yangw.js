function AttrType(yangw,name) {
  this.yangw = yangw;
  this.name = name;
}

AttrType.prototype.toString=function() {
  return '{AttrType name:"'+this.name+'"}';
};

function ItemType(yangw,name) {
  this.yangw = yangw;
  this.name = name;
}

ItemType.prototype.toString=function() {
  return '{ItemType name:"'+this.name+'"}';
};

function YANGW() {
  this.attrTypes = {};
  this.itemTypes = {};
}

YANGW.prototype.add=function(item) {
  if (item.type === 'AttributeType') {
     log('add attribute type "'+item.name+'"');
     var atype = this.attrTypes[item.name];
     if (typeof atype != 'undefined') {
       log('attribute type already exists '+atype);
       return;
     }
     atype = new AttrType(this,item.name);
     this.attrTypes[item.name] = atype;
  } else if (item.type === 'ItemType') {
     log('add item type "'+item.name+'"');
     var itype = this.itemTypes[item.name];
     if (typeof itype != 'undefined') {
       log('item type already exists');
       return;
     }
     itype = new ItemType(this,item.name);
     this.itemTypes[item.name] = itype;
  } else {
    var itype = this.itemTypes[item.type];
    if (typeof itype == 'undefined') {
      log('Unable to find item type "'+item.type+'"');
      return;
    }
    log('add item of type '+item.type);
    for (var p in item) {
      if (item.hasOwnProperty(p)) {
        log(' - '+p+': '+item[p]);
      }
    }
  }
};

YANGW.prototype.debug=function() {
  log('attribute types');
  for (var p in this.attrTypes) {
     if (this.attrTypes.hasOwnProperty(p)) {
        log(this.attrTypes[p]);
      }
  }
  log('item types');
  for (var p in this.itemTypes) {
     if (this.itemTypes.hasOwnProperty(p)) {
        log(this.itemTypes[p]);
      }
  }
};