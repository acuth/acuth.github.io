
function YANGW() {
  this.nAttrType = 0;
  this.nItemType = 0;
  this.nItem = 0;
  this.attrTypes = {};
  this.itemTypes = {};
  this.items = [];
  this.itemMap = {};
}

YANGW.prototype.clear=function() {
  this.nAttrType = 0;
  this.nItemType = 0;
  this.nItem = 0;
  this.attrTypes = {};
  this.itemTypes = {};
  this.items = [];
  this.itemMap = {};
};

YANGW.prototype.getItemsHTML=function() {
  var h = '';
  h += '<h3>Items</h3>';
  for (var i=0;i<this.items.length;i++) {
     h += this.items[i].toHTML(true);
  }
  return h;
};

YANGW.prototype.getAttrTypeHTML=function(name) {
  var h = '';
  var atype = _yangw.getAttrType(name);
  h += atype.toHTML()
  h += '<h3>Item-types including "'+name+'"</h3>';
  var found = false;
  for (var p in this.itemTypes) {
    var itype = this.itemTypes[p];
    if (itype.includesAttrType(atype)) {
      h += itype.toHTML(name);
      found = true;
    }
  }
  if (!found) h += '<p><i>No item-types found</i></p>';
  
  
  h += '<h3>Items including "'+name+'"</h3>';
  found = false;
  for (var i=0;i<this.items.length;i++) {
    var item = this.items[i];
    if (item.includesAttrType(atype)) {
      h += item.toHTML(name);
      found = true;
    }
  }
  if (!found) h += '<p><i>No items found</i></p>';
  
  return h;
};


YANGW.prototype.getItemTypeHTML=function(name) {
  var h = '';
  var itype = _yangw.getItemType(name);
  h += itype.toHTML();
  
  h += '<h3>Attr-types included in "'+name+'"</h3>';
  var found = false;
  for (var i=0;i<itype.attrTypes.length;i++) {
    var atype = itype.attrTypes[i];
    h += atype.toHTML(name);
    found = true;
  }
  if (!found) h += '<p><i>No attr-types found</i></p>';
  
  h += '<h3>Items implementing "'+name+'"</h3>';
  found = false;
  for (var i=0;i<this.items.length;i++) {
    var item = this.items[i];
    if (item.includesItemType(itype)) {
      h += item.toHTML(name);
      found = true;
    }
  }
  if (!found) h += '<p><i>No items found</i></p>';
  return h;
};


YANGW.prototype.getItemHTML=function(item) {
  var h = '';
  h += item.toHTML();
  h += '<h3>Items referencing this</h3>';
  var found = false;
  for (var i=0;i<this.items.length;i++) {
    var t = this.items[i];
    if (t.referencesItem(item)) {
      h += t.toHTML();
      found = true;
    }
  }
  if (!found) h += '<p><i>No referenced items found</i></p>';
  return h;
};

YANGW.prototype.getItemHTMLById=function(id) {
  return this.getItemHTML(_yangw.getItemById(id));
};

YANGW.prototype.getItemHTMLByKey=function(key) {
  return this.getItemHTML(_yangw.getItemByKey(key));
};

YANGW.prototype.export=function() {
  var json = {};
  json.items = [];
  for (var p in this.attrTypes) {
    json.items[json.items.length] = this.attrTypes[p].export();
  }
  for (var p in this.itemTypes) {
    json.items[json.items.length] = this.itemTypes[p].export();
  }
  for (var i=0;i<this.items.length;i++) {
    json.items[json.items.length] = this.items[i].export();
  }
  return json;
};

YANGW.prototype.addAttrType=function(atype) {
  this.attrTypes[atype.name] = atype;
  log('added '+atype);
};

YANGW.prototype.addItemType=function(itype) {
  this.itemTypes[itype.name] = itype;
  log('added '+itype);
};

YANGW.prototype.addItem=function(item) {
  this.items[this.items.length] = item;
  var key = item.keyValue();
  if (key) this.itemMap[key] = item;
  log('added '+item);
};

YANGW.prototype.importAttrType=function(item) {
  if (item.type !== 'AttributeType') return;
  item = this.normaliseItem(item);
  console.log(this.debugNormalizedItem(item));
  var atypeName = this.getSingleAttr(item,'name');
  log('start to build attr-type "'+atypeName+'"');
  var atype = this.attrTypes[atypeName];
  if (typeof atype != 'undefined') {
       log('!!!! attribute type already exists '+atype);
       return;
  }
  var primTypeName = this.getSingleAttr(item,'primType');
  var primType = AttrType.validatePrimitiveType(primTypeName);
  if (primType === null) {
    log('!!!! cannot find prim-type '+primTypeName);
    return;
  }
  var subPrimType = this.getSingleAttr(item,'primSubType');
  var numberStr = this.getSingleAttr(item,'number');
  var number = YANGW.validateNumber(numberStr);
  if (number === null) {
    log('!!!! cannot find number '+numberStr);
    return;
  }
  var atype = new AttrType(this,this.nAttrType++,atypeName,primType,subPrimType,number);
  this.addAttrType(atype);
};

YANGW.prototype.importItemType=function(item) {
  if (item.type !== 'ItemType') return;
  item = this.normaliseItem(item);
  console.log(this.debugNormalizedItem(item));
  var itypeName = this.getSingleAttr(item,'name');
  log('start to build item-type "'+itypeName+'"');
  var itype = this.itemTypes[itypeName];
  if (typeof itype != 'undefined') {
    log('!!!! item type already exists');
    return;
  }
  var atypeNames = item.props.attributeTypes;
  var atypes = [];
  var key = this.getSingleAttr(item,'key');
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
  var itype = new ItemType(this,this.nItemType++,itypeName,atypes,key);
  this.addItemType(itype);
};

YANGW.prototype.importItem=function(item) {
  if (item.type === 'ItemType' || item.type === 'AttributeType') return;
  item = this.normaliseItem(item);
  console.log(this.debugNormalizedItem(item));
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
  var newItem = new Item(this,this.nItem++,itype,item.props);
  this.addItem(newItem);
};

YANGW.prototype.import=function(json) {
  this.clear();
  for (var i=0;i<json.items.length;i++) {
      this.importAttrType(json.items[i]);
  }
  for (var i=0;i<json.items.length;i++) {
      this.importItemType(json.items[i]);
  }
  for (var i=0;i<json.items.length;i++) {
      this.importItem(json.items[i]);
  }
};

YANGW.prototype.getAttrTypesHTML=function() {
  var h = '';
  h += '<h3>Attr-Types</h3>';
  for (var p in this.attrTypes) {
     if (this.attrTypes.hasOwnProperty(p)) {
        h += this.attrTypes[p].toHTML(true);
      }
  }
  return h;
};


YANGW.prototype.getItemTypesHTML=function() {
  var h = '';
  h += '<h3>Item-Types</h3>';
  for (var p in this.itemTypes) {
     if (this.itemTypes.hasOwnProperty(p)) {
        h += this.itemTypes[p].toHTML(true);
     }
  }
  return h;
};
  
YANGW.validateNumber=function(s) {
  if (s === 'optional' || 
      s === 'required' ||
      s === 'list') return s;
  log('do not understand number "'+s+'"');
  return null;
};

YANGW.prototype.validateAttrs=function(item) {
  var itype = this.itemTypes[item.type];
  if (!itype) {
    log('!!!! Unable to find item-type "'+item.type+'" as specified by type attribute');
    return false;
  }
  for (var p in item.props) {
    var arr = item.props[p];
    var atype = this.attrTypes[p];
    if (!atype) {
      log('!!!! Unable to find attr-type "'+p+'" for value "'+v+'"');
      return false;
    } 
    for (var i=0;i<arr.length;i++) {
      if (!atype.validatePrimitiveValue(arr[i])) {
        return false;
      }
    }
  }
  return true;
};

YANGW.prototype.collectAttrs=function(item) {
  var attrs = [];
  for (var p in item.props) {
    var atype = this.attrTypes[p];
    attrs[attrs.length] = {'name':p,'valueArray':item.props[p]};
  }
  return attrs;
};

YANGW.prototype.debugAttrs=function(item) {
  for (var p in item.props) {
    var atype = this.attrTypes[p];
    log(' - '+p+': '+JSON.stringify(item.props[p])+' '+atype.getPrimitiveTypeStr());
  }
};  

YANGW.prototype.getSingleAttr=function(item,name) {
    var arr = item.props[name];
    return (arr && arr.length > 0) ? arr[0] : null; 
};
  
YANGW.prototype.normaliseItem=function(item) {
  var r = {};
  r.type = item.type;
  r.props = {};
  for (var p in item) {
    if (p != 'type' && item.hasOwnProperty(p)) {
      var v = item[p];
      if (v instanceof Array) 
        r.props[p] = v;
      else {
        var a = [];
        a[0] = v;
        r.props[p] = a;
      }
    }
  }
  return r;
};


YANGW.prototype.debugNormalizedItem=function(item) {
  var s = '{NormalizedItem type='+item.type;
  for (var p in item.props) {
    s += ' '+p+':'+item.props[p].length;
  }
  s += '}';
  return s;
};
  
YANGW.prototype.getAttrType=function(name) {
  return this.attrTypes[name];
};

YANGW.prototype.getItemType=function(name) {
  return this.itemTypes[name];
};

YANGW.prototype.getItemByKey=function(key) {
  return this.itemMap[key];
};

YANGW.prototype.getItemById=function(id) {
  for (var i=0;i<this.items.length;i++) {
    var item = this.items[i];
    if (item.id == id) return item;
  }
  return null;
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