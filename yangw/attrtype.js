function AttrType(yangw,id,name,primType,subPrimType,number) {
  this.yangw = yangw;
  this.id = id;
  this.name = name;
  this.primType = primType;
  this.subPrimType = subPrimType;
  this.number = number;
}

AttrType.prototype.toString=function() {
  var s = '{AttrType id:'+this.id+' name:"'+this.name+'" prim-type:'+this.primType;
  if (this.subPrimType) s += ' sub-prim-type:'+this.subPrimType;
  s += ' number:'+this.number+'}';
  return s;
};

AttrType.prototype.export=function() {
  var json = {};
  json.type = 'AttributeType';
  json.name = this.name;
  json.primType = this.primType;
  if (this.subPrimType) json.primSubType = this.subPrimType;
  json.number = this.number;
  return json;
};

AttrType.prototype.toHTMLRow=function() {
  var h = '<tr>';
  h += '<td>'+this.id+'</td>';
  h += '<td>'+this.name+'</td>';
  h += '<td>'+this.primType+'</td>';
  h += '<td>'+this.number+'</td>';
  h += '</tr>';
  return h;
};

AttrType.prototype.toHTML=function(hideMeta) {
  
  
  var h = '<div class="mdl-cell mdl-cell--4-col mdl-card mdl-shadow--4dp attr-type-card">';
  
  
  h += '<div class="mdl-card__title">'+
    '<h2 class="mdl-card__title-text">attr-type: '+this.name+'</h2>'+
  '</div>';
  
   h += '<div class="mdl-card__supporting-text">'
  
  h += '<b>attr-type</b>: ';
  if (hideMeta) h += '<a href="javascript:showAttrType(\''+this.name+'\');">'+this.name+'</a>'; else h += this.name;
  h += '<br/>';
  h += 'prim-type: '+this.primType+'<br/>';
  if (this.subPrimType) {
    if (this.subPrimType == hideMeta)
      h += 'sub-prim-type: <b style="color:green;">'+this.subPrimType+'</b><br/>';
    else
      h += 'sub-prim-type: <a href="javascript:showItemType(\''+this.subPrimType+'\');">'+this.subPrimType+'</a><br/>';
  }
  h += 'number: '+this.number+'<br/>';
  if (!hideMeta) {
    h += '<div class="metadata">';
    h += 'This is an attr-type definition<br/>';
    h += 'attr-type-id: '+this.id;
    h += '</div>';
  }
  h += '</div>';
  h += '</div>';
  return h;
};

AttrType.validatePrimitiveType=function(s) {
  if (s === 'string' || 
      s === 'item-key' ||
      s === 'lat-long-pair' || 
      s === 'item-ref') return s;
  log('do not understand primitive-type "'+s+'"');
  return null;
};

AttrType.prototype.getPrimitiveTypeStr=function() {
  var s = this.number +' '+this.primType;
  if (this.subPrimType) s += ' ['+this.subPrimType+']';
  return s;
};

AttrType.prototype.validatePrimitiveValue=function(v) {
  if (this.primType == 'string') {
    if (typeof v !== 'string') {
      log('!!!! value '+JSON.stringify(v)+' is not a string');
      return false;
    }
    return true;
  }
  
  else if (this.primType == 'item-key') {
    if (typeof v !== 'string') {
      log('!!!! value '+JSON.stringify(v)+' is not a string');
      return false;
    }
    var key = this.subPrimType+':"'+v+'"';
    //log('looking for item with key '+key);
    var item = this.yangw.itemMap[key];
    //log('found '+item);
    if (item) {
      log('!!!! Already have item with key '+key);
      return false;
    }
    return true;
  }
  else if (this.primType == 'lat-long-pair') {
    try {
      return (typeof v.lat === 'number') && (typeof v.lng === 'number');
    } catch (e) {
      log('!!!! value '+JSON.stringify(v)+' is not a lat-long-pair');
      return false;
    }
  }
  else if (this.primType == 'item-ref') {
    var key = this.subPrimType+':"'+v+'"';
    //log('looking for item with key '+key);
    var item = this.yangw.itemMap[key];
    //log('found '+item);
    if (!item) {
      log('!!!! Unable to find item with key '+key);
      return false;
    }
    return true;
  }
  else {
    log('!!!! Unable to validate primitive-value '+v+' as a '+this.primType);
    return false;
  }
};