function Item(yangw,id,itype,props) {
  this.yangw = yangw;
  this.id = id;
  this.itemType = itype;
  this.props = props;
  log('new Item() '+JSON.stringify(props));
}

Item.prototype.toString=function() {
  return '{Item id:'+this.id+' item-type:"'+this.itemType.name+'"}';
};

Item.prototype.getDumpValue=function(p,v) {
  //var atype = this.yangw.getAttrType(p);
  return v;
};
  
Item.prototype.export=function() {
  var json = {};
  json.type = this.itemType.name;
  for (var p in this.props) {
    var arr = this.props[p];
    if (arr.length == 1) {
      json[p] = this.getDumpValue(p,arr[0]);  
    }
    else {
      json[p] = [];
      for (var i=0;i<arr.length;i++) {
        json[p][i] = this.getDumpValue(p,arr[i]);
      }
    }
  }
  return json;
};

Item.prototype.includesItemType=function(itype) {
  return this.itemType == itype;
};

Item.prototype.includesAttrType=function(atype) {
  var arr = this.props[atype.name];
  return arr && arr.length > 0;
};

Item.prototype.referencesItem=function(that) {
  for (var p in this.props) {
    var atype = this.yangw.getAttrType(p);
    if (atype.primType === 'item-ref') {
      var arr = this.props[p];
      var thatKeyValue = that.keyValue();
      for (var i=0;i<arr.length;i++) {
        var thisKeyValue = atype.subPrimType+':'+JSON.stringify(arr[i]);
        console.log('comparng '+thisKeyValue+' vs '+thatKeyValue);
        if (thatKeyValue == thisKeyValue) return true;
      }
    }
  }
  return false;
};


Item.prototype.getAttrHTML=function(hideMeta,atype,v) {
  if (atype.primType == 'item-ref') {
    var href = 'javascript:showItemByKey(\''+atype.subPrimType+':'+encodeURIComponent(JSON.stringify(v))+'\');';
    return '<a href="javascript:showAttrType(\''+atype.name+'\');">'+atype.name+'</a>: <a href="'+href+'">'+JSON.stringify(v)+'</a>';
  }
  
  if (atype.name == hideMeta)
    return '<b style="color:green;">'+atype.name+'</b>: '+JSON.stringify(v);
    
  var href = 'javascript:showAttrType(\''+atype.name+'\');';
  return '<a href="'+href+'">'+atype.name+'</a>: '+JSON.stringify(v);
};

Item.prototype.toHTML=function(hideMeta) {
  var h = '<div class="item">';
 
  if (!hideMeta)   h += 'item-type: <a href="javascript:showItemType(\''+this.itemType.name+'\');">'+this.itemType.name+'</a><br/>';
  
  var itype = this.yangw.itemTypes[this.itemType.name];
  for (var i=0;i<itype.attrTypes.length;i++) {
    var atype = itype.attrTypes[i];
    var arr = this.props[atype.name];
    if (arr) {
      for (var j=0;j<arr.length;j++) {
        h += this.getAttrHTML(hideMeta,atype,arr[j])+'<br/>';
      }
    }
  }
  for (var p in this.props) {
    var atype = itype.getAttrType(p);
    if (!atype) {
      atype = this.yangw.getAttrType(p);
      var arr = this.props[p];
      for (var j=0;j<arr.length;j++) {
        h += this.getAttrHTML(hideMeta,atype,arr[j])+'<br/>';
      }
    }
  }
  if (hideMeta) {
    h += '<a href="javascript:showItemById('+this.id+');">more...</a><br/>';
  }
  h += '</div>';
  
  if (!hideMeta) {
    h += '<div class="metadata">';
    h += 'This is an item of type '+this.itemType.name+'<br/>';
    h += 'item-id: '+this.id+'<br/>';
    //h += 'item-type: <a href="javascript:showItemType(\''+this.itemType.name+'\');">'+this.itemType.name+'</a><br/>';
    var key = this.keyValue();
    if (key) h += 'item-key: '+key;
    h += '</div>';
  }
  
  return h;
};

Item.prototype.keyValue=function() {
  var key = this.itemType.key;
  if (!key) return null;
  var arr = this.props[key];
  var v = (arr && arr.length == 1) ? arr[0] : null; 
  return this.itemType.name+":"+JSON.stringify(v);
};