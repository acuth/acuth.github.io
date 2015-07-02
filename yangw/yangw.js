
function YANGW() {
  this.nAttrType = 0;
  this.nItemType = 0;
  this.nItem = 0;
  this.attrTypes = {};
  this.itemTypes = {};
  this.items = [];
  this.itemMap = {};
}

YANGW.prototype.getItemsHTML=function() {
  var h = '';
  h += '<h3>Items</h3>';
  for (var i=0;i<this.items.length;i++) {
     h += this.items[i].toHTML();
  }
  return h;
};

YANGW.prototype.getSchemaHTML=function() {
  var h = '';
  h += '<h3>Schema</h3>';
  h += '<h4>Attribute Types</h4>';
  h += '<table>';
  h += '<tr><th>id</th><th>name</th><th>primitive-type</th><th>number</th></tr>';
  for (var p in this.attrTypes) {
     if (this.attrTypes.hasOwnProperty(p)) {
        h += this.attrTypes[p].toHTML();
      }
  }
  h += '</table>';
  h += '<h4>Item Types</h4>';
  for (var p in this.itemTypes) {
     if (this.itemTypes.hasOwnProperty(p)) {
        h += this.itemTypes[p].toHTML();
      }
  }
  return h;
};

  
YANGW.validateNumber=function(s) {
  if (s === 'optional' || 
      s === 'required') return s;
  log('do not understand number "'+s+'"');
  return null;
};




YANGW.prototype.validateAttrs=function(item) {
  // first need to check values for each attr is correct irrespective of item-type
  for (var p in item) {
    if (item.hasOwnProperty(p)) {
      var v = item[p];
      if (p == 'type') {
         var itype = this.itemTypes[v];
         if (!itype) {
           log('!!!! Unable to find item-type "'+v+'" as specified by type attribute');
           return false;
         }
      }
      else {
        var atype = this.attrTypes[p];
        if (!atype) {
          log('!!!! Unable to find attr-type "'+p+'" for value "'+v+'"');
          return false;
        } 
        if (!atype.validatePrimitiveValue(v)) {
          return false;
        }
      }
    }
  }
  return true;
};

YANGW.prototype.collectAttrs=function(item) {
  var attrs = [];
  for (var p in item) {
    if (p != 'type' && item.hasOwnProperty(p)) {
      var atype = this.attrTypes[p];
      attrs[attrs.length] = {'name':p,'value':item[p]};
    }
  }
  return attrs;
};

YANGW.prototype.debugAttrs=function(item) {
  for (var p in item) {
    if (p != 'type' && item.hasOwnProperty(p)) {
      var atype = this.attrTypes[p];
      log(' - '+p+': '+JSON.stringify(item[p])+' '+atype.getPrimitiveTypeStr());
    }
  }
};  
  
YANGW.prototype.add=function(item) {
  if (item.type === 'AttributeType') {
     log('start to build attr-type "'+item.name+'"');
     var atype = this.attrTypes[item.name];
     if (typeof atype != 'undefined') {
       log('!!!! attribute type already exists '+atype);
       return;
     }
     var primType = AttrType.validatePrimitiveType(item.primType);
     if (primType === null) return;
     var subPrimType = item.primSubType;
     var number = YANGW.validateNumber(item.number);
     if (number === null) return;
     atype = new AttrType(this,this.nAttrType++,item.name,primType,subPrimType,number);
     this.attrTypes[item.name] = atype;
     log('added '+atype);
  } else if (item.type === 'ItemType') {
     log('start to build item-type "'+item.name+'"');
     var itype = this.itemTypes[item.name];
     if (typeof itype != 'undefined') {
       log('!!!! item type already exists');
       return;
     }
     var atypeNames = item['attributeTypes'];
     var atypes = [];
     var key = item['key'];
     var keyOk = false;
     for (var i=0;i<atypeNames.length;i++) {
       var atypeName = atypeNames[i];
       var atype = this.attrTypes[atypeName];
       if (!atype) {
         log('!!!! Unable to find attr-type "'+atypeName+'"');
         return;
       }
       atypes[atypes.length] = atype;
       if (key && key == atypeName) keyOk = true;
     }
     if (key && !keyOk) {
       log('!!!! Unable to find key "'+key+'" in attributes');
       return;
     }
     itype = new ItemType(this,this.nItemType++,item.name,atypes,key);
     this.itemTypes[item.name] = itype;
     log('added '+itype);
  } else {
    log('start to build item of type "'+item.type+'"');
    this.debugAttrs(item);
    var itype = this.itemTypes[item.type];
    if (typeof itype == 'undefined') {
      log('!!!! Unable to find item type "'+item.type+'"');
      return;
    }
    if (!this.validateAttrs(item)) {
      log('!!!! Unable to validate attribute values for '+JSON.stringify(item));
      return;
    }
    var attrs = this.collectAttrs(item);
    var newItem = new Item(this,this.nItem++,itype,attrs);
    this.items[this.items.length] = newItem;
    var key = newItem.keyValue();
    log('added '+newItem+' key='+key);
    this.itemMap[key] = newItem;
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