function mamAppMarkType(args) {
	this.type = args.type;
	this.appstore_name = args.appstore_name;
	this.appstore_name_lc = args.appstore_name.toLowerCase();
	this.appstore_id = args.appstore_id;
	this.icon_encoding = args.icon_encoding;
	this.icon_mimetype = args.icon_mimetype;
	this.icon_url = args.icon_url;
	var that = mamAppMarkType.setOfTypes[this.type];
	if (!that) mamAppMarkType.setOfTypes[this.type] = this;
}

mamAppMarkType.isInstalledApp=function(type) {
	return (type == 'safari' || type == 'youtube' || type == 'maps' || type == 'appstore' || type == 'itunes');
}

mamAppMarkType.prototype.debugStr=function() {
	return '{AppMarkType type:'+this.type+'}';
}

mamAppMarkType.setOfTypes = new Object();

mamAppMarkType.get=function(type) {
	return mamAppMarkType.setOfTypes[type];
}

function mamAppMark(args) {
	this.key = args.key;
	this.title = args.title;
	this.type = args.type;
	this.params = args.params;
	this.comment = args.comment;
	this.create_date = new Date(args.create_date*1000);
	this.modify_date = new Date(args.modify_date*1000);
	this.version = args.modify_date;
	this.tombstone = args.tombstone;
	this.invoke_str = args.invoke_str;
	this.invoke_url = args.invoke_url;
	this.icon_url = args.icon_url;
	this.author_name = mamAppMark.getString(args.author_name);
	this.read_only = mamAppMark.getBoolean(args.read_only);
	this.shared = mamAppMark.getBoolean(args.shared);
	this.starred = mamAppMark.getBoolean(args.starred);
	//log('title='+args.title+'  invoke_url='+args.invoke_url);
}

mamAppMark.getBoolean=function(p) {
	if (!p) return false;
	if (typeof p == 'number') {
		return p == 1;
	}
	if (typeof p == 'boolean') {
		return p;
	}
	return false;
}

mamAppMark.getString=function(p) {
	//log('getString('+p+')');
	if (typeof p == 'undefined') return null;
	if (typeof p == 'string') return p;
	return null;
}

mamAppMark.prototype.getComment=function() {
	if (typeof this.comment == 'undefined') return null;
	if (!this.comment) return null;
	return this.comment;
}

mamAppMark.prototype.debugStr=function() {
	return '{AppMark type:'+this.type+' key:'+this.key+'}';
}

mamAppMark.prototype.getIconURL=function(browserType) {
	return 'images/'+this.type+'-icon.png';
}

mamAppMark.prototype.getBrowserSpecificIconURL=function(browserType) {
	return 'images/'+browserType+'/'+this.type+'.png';
}

mamAppMark.prototype.matches=function(terms) {
	if (terms.indexOf('@') == 0) {
		if (!this.author_name) return false;
		if (terms.length == 1) return true;
		return this.author_name.indexOf(terms.substring(1)) != -1;
	}
	else {
		return this.title.toLowerCase().indexOf(terms) != -1;
	}
}

function mamClient(baseURL,app,debug) {
	this.signedin = false;
	this.baseURL = baseURL;
	this.debug = debug;
	this.app = app;
	this.incremental = false;
	this.notSignedInCallback = null;
}

mamClient.convertToHTML=function(s) {
	var html = '';
	if (s != null) {
		var got_ws = false;
		for (var i=0;i<s.length;i++) {
			var c = s.charAt(i);
			if (c == ' ') {
				if (!got_ws) {
					html += ' ';
					got_ws = true;
				}
				else html += '&nbsp;';
			}
			else {
				got_ws = false;
				if (c == '&') html += '&amp;';
				else if (c == '<') html += '&lt;';
				else if (c == '>') html += '&gt;';
				else if (c == '\n') {
					html += '<br/>';
					got_ws = true;
				}
				else html += c;
			}
		}
	}
	return html;
}

mamClient.convertFromHTML=function(e) {
	var s = '';
	for (var i=0;i<e.childNodes.length;i++) {
		var c = e.childNodes[i];
		if (c.nodeType == 3) {
			s += c.nodeValue;
		}
		else if (c.nodeType == 1) {
			var t = c.nodeName.toLowerCase();
			//if (t == 'b' || t == 'i') {
			//	s += '<'+t+'>'+mamClient.convertFromHTML(c)+'</'+t+'>';
			//}
			//else
			if (t == 'p' || t == 'div') {
				s += '\n'+mamClient.convertFromHTML(c);
			}
			else if (t == 'br') {
				s += '\n';
			} else {
				s += ' '+mamClient.convertFromHTML(c);
			}
		}
	}
	return s;
}

mamClient.convertForTextArea=function(s) {
	var html = '';
	if (s != null) {
		for (var i=0;i<s.length;i++) {
			var c = s.charAt(i);
			if (c == '<') html += '&lt;';
			else if (c == '>') html += '&gt;';
			else if (c == '&') html += '&amp;';
			else html += c;
		}
	}
	return html;
}

mamClient.prototype.isTestUser=function() {
	return true;//this.name != null && (this.name == 'acuth' || this.name.indexOf('test') == 0);
}

mamClient.prototype.enableIncremental=function() {
	this.incremental = true;
}

mamClient.prototype.setNotSignedInCallback=function(callback) {
	this.notSignedInCallback = callback;
}

mamClient.prototype.doAjax=function(op, params, callback) {
	var t1 = new Date();
	var url = this.baseURL+'ajax?op=' + op + params;
	downloadURL3(url, function(obj) {
		var t2 = new Date();
		log('/ajax?op=' + op + ' +callback [' + (t2 - t1) + 'ms]');
		try {
			if (!obj.ok) {
				var l = '/ajax?op=' + op + ' ok=false';
				if (obj.msg) {
					doAlert( obj.msg );
					l += ' msg=' + obj.msg;
				}
				log(l);
			} else {
				callback(obj);
			}

		} catch (ex) {
			log('/ajax?op=' + op + ' - ex=' + ex);
			doAlert('Unexpected error - '+ex);
		}
		var t3 = new Date();
		log('/ajax?op=' + op + ' -callback [' + (t3 - t2) + 'ms]');
	});
}

mamClient.prototype.ping=function() {
	this.doAjax(this.baseURL,'ping','',function(obj) {
		if (obj.no_connection) log('no connection');
		else if (obj.failed_request) log('failed request - '+obj.msg);
		else log(obj.msg); } );
};

mamClient.generateToken=function() {
	var stuff = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	token = '';
	for (var i=0;i<20;i++) {
		var r = Math.floor(Math.random()*stuff.length);
		token += stuff.substring(r,r+1);
	}
	return token;
}

mamClient.prototype.register=function(name,password,password2,token,callback) {
	if (name.length == 0) name = null;
	if (password.length == 0) password = null;
	if (password2.length == 0) password2 = null;
	if (name == null || password == null || password2 == null) {
		this.returnMessage('One or more fields are missing',callback);
		return;
	}
	if (password != password2) {
		this.returnMessage('Passwords do not match',callback);
		return;
	}
	var cookieToken = token == null;
	if (cookieToken) token = mamClient.generateToken();
	var client = this;
	this.doAjax('register','&name='+encodeURIComponent(name)+'&pwd='+encodeURIComponent(password)+'&tkn='+encodeURIComponent(token),
		function(obj) {
		    if (obj.no_connection) {
		    	client.returnMessage('Unable to register - no connection',callback);
				return;
		    }
		    if (obj.failed_request) {
		    	client.returnMessage('Unable to register - failed request',callback);
				return;
		    }
			if (!obj.registered) {
				client.returnMessage(obj.msg,callback);
				return;
			}
			client.signedin = true;
			client.token = token;
			client.name = name;
			if (cookieToken) {
				client.setToken('mam_token',token);
				client.setToken('mam_name',name);
			}
			if (callback) callback(client);
		} );
};

mamClient.prototype.returnMessage=function(msg,callback) {
	this.msg = msg;
	log(msg);
	if (callback) callback(this);
}

mamClient.prototype.signin=function(name,password,token,callback) {
	if (name.length == 0) name = null;
	if (password.length == 0) password = null;
	if (name == null || password == null) {
		this.returnMessage('One or more fields are missing',callback);
		return;
	}
	var cookieToken = token == null;
	if (cookieToken) token = mamClient.generateToken();
	var client = this;
	this.doAjax('signin','&name='+encodeURIComponent(name)+'&pwd='+encodeURIComponent(password)+'&tkn='+encodeURIComponent(token),
		function(obj) {
			if (obj.no_connection) {
				client.returnMessage('Unable to signin - no connection',callback);
				return;
			}
			if (obj.failed_request) {
				client.returnMessage('Unable to signin - failed request',callback);
				return;
			}
			if (!obj.signedin) {
				client.returnMessage(obj.msg,callback);
				return;
			}
			client.signedin = true;
			client.token = token;
			client.name = name;
			if (cookieToken) {
				client.setToken('mam_token',token);
				client.setToken('mam_name',name);
			}
			if (callback) callback(client);
		} );
};

mamClient.prototype.signout=function(token,callback) {
	//var cookieToken = token == null;
	//if (cookieToken) {
	//	token = this.getToken('mam_token');
	//	if (!token) return false;
	//}
	var client = this;
	this.doAjax('signout','&tkn='+encodeURIComponent(token),
		function(obj) {
			if (obj.msg) log(obj.msg);
			client.signedin = false;
			client.token = null;
			client.name = null;
			//if (cookieToken) {
			//	client.removeToken('mam_token');
			//	client.removeToken('mam_name');
			//	client.removeToken('mam_timestamp');
			//}
			if (callback) callback(client);
		} );
};

mamClient.prototype.optimistic_signin=function() {
	var token = this.app.get('mam_token');
	if (token) {
	  this.signedin = true;
		this.token = token;
		this.name = this.app.get('mam_name');
	}
};

mamClient.prototype.testsignedin=function(token,callback) {
	//alert('test signed in');
	if (!token) {
		token = this.getToken('mam_token');
		if (!token) {
			this.signedin = false;
			if (callback) callback(this);
			return;
		}
	}
	var client = this;
	this.doAjax('testsignedin','&tkn='+encodeURIComponent(token),
		function(obj) {
			log('testsignedin callback');
			if (obj.no_connection) {
				client.returnMessage('no connection',callback);
				return;
			}
			if (obj.failed_request) {
				client.returnMessage('failed request',callback);
				return;
			}
			if (obj.msg) log(obj.msg);
			if (obj.signedin) {
				log('signedin = true');
				client.signedin = true;
				client.token = token;
				client.name = obj.name;
			}
			//log('about to invoke '+callback);
			if (callback) callback(client);
		} );
};

mamClient.prototype.doSignOut=function() {
	this.signedin = false;
	this.token = null;
	this.name = null;
	this.removeToken('mam_token');
	this.removeToken('mam_name');
	this.removeToken('mam_timestamp');
};

mamClient.prototype.signInFail=function(key,callback) {
	if (this.signedin) return false;
	var token = this.getToken('mam_token');
	if (token) return false;
	// the user is not signed in
	if (this.notSignedInCallback)
		this.notSignedInCallback();
	else
		doAlert('You are not signed in');
	return true;
};

mamClient.prototype.testSignedInOnServer=function(obj) {
	if (obj.signedin) return true;
	this.doSignOut();
	this.signInFail();
	return false;
};

mamClient.prototype.getappmark=function(key,callback) {
	if (this.signInFail()) return;
	var client = this;
	this.doAjax('getappmark','&tkn='+encodeURIComponent(this.token)+'&key='+key,
		function(obj) {
			if (!client.testSignedInOnServer(obj)) return;
			var appmark = new mamAppMark( obj.appmark );
			if (callback) callback(appmark);
		} );
};

mamClient.prototype.addappmark=function(app,params,title,comment,callback) {
	if (this.signInFail()) {
		doAlert('sign in fail');
		return;
	}
	var client = this;
	this.doAjax('addappmark','&tkn='+encodeURIComponent(this.token)+'&app='+app+'&params='+encodeURIComponent(params)
			+'&title='+encodeURIComponent(title)+'&comment='+encodeURIComponent(comment),
		function(obj) {
			if (obj.no_connection) { doAlert('no connection'); return; }
			if (obj.failed_request) { doAlert('failed request - '+obj.msg); return; }
			if (!client.testSignedInOnServer(obj)) { doAlert('test sign in failed'); return; }
			//alert('create new appmark');
			var appmark = new mamAppMark( obj.appmark );
			if (callback) callback(appmark);
		} );
};

mamClient.prototype.updateappmark=function(key,title,comment,callback) {
	if (this.signInFail()) return;
	var client = this;
	var p = '&key='+key;
	p += '&title='+encodeURIComponent(title);
	if (comment) p += '&comment='+encodeURIComponent(comment);
	//alert(p);
	//return;
	this.doAjax('updateappmark','&tkn='+encodeURIComponent(this.token)+p,function(obj) {
		if (obj.no_connection) { doAlert('no connection'); return; }
		if (obj.failed_request) { doAlert('failed request - '+obj.msg); return; }
		if (!client.testSignedInOnServer(obj)) return;
		var appmark = new mamAppMark( obj.appmark );
		if (callback) callback(appmark);
	} );
};

mamClient.prototype.updateappmark2=function(key,title,comment,starred,callback) {
	if (this.signInFail()) return;
	var client = this;
	var p = '&key='+key;
	p += '&title='+encodeURIComponent(title);
	if (comment) p += '&comment='+encodeURIComponent(comment)
	p += '&starred='+ ((starred) ? 't' : 'f');
	//alert(p);
	//return;
	this.doAjax('updateappmark','&tkn='+encodeURIComponent(this.token)+p,function(obj) {
		if (obj.no_connection) { doAlert('no connection'); return; }
		if (obj.failed_request) {doAlert('failed request - '+obj.msg); return; }
		if (!client.testSignedInOnServer(obj)) return;
		var appmark = new mamAppMark( obj.appmark );
		if (callback) callback(appmark);
	} );
};


mamClient.prototype.deleteappmark=function(key,callback) {
	if (this.signInFail()) return;
	var client = this;
	this.doAjax('deleteappmark','&tkn='+encodeURIComponent(this.token)+'&key='+key,function(obj) {
		if (obj.no_connection) { doAlert('no connection'); return; }
		if (obj.failed_request) { doAlert('failed request - '+obj.msg); return; }
		if (!client.testSignedInOnServer(obj)) return;
		var appmark = new mamAppMark( obj.appmark );
		if (callback) callback(appmark);
	} );
};


mamClient.prototype.createSharedAppMark=function(key,version,shorten,callback) {
	//if (this.signInFail()) return;
	var client = this;
	var params = '&shorten='+(shorten?'t':'f')+'&key='+key+'&ver='+version;
	if (this.token) params += '&tkn='+encodeURIComponent(this.token)
	this.doAjax('create_shared_appmark',params,function(obj) {
		if (obj.no_connection) { doAlert('no connection'); return; }
		if (obj.failed_request) { doAlert('failed request - '+obj.msg); return; }
		//if (!client.testSignedInOnServer(obj)) return;
		if (callback) callback(obj.url);
	} );
};



mamClient.prototype.getappmarks=function(arg_map,callback) {
	if (this.signInFail()) return;
	var client = this;
	var timestamp = '';
	if (this.incremental) {
		var t = this.getToken('mam_timestamp');
		if (t) {
			timestamp = '&timestamp='+t;
		}
	}
	this.doAjax('getappmarks','&tkn='+encodeURIComponent(this.token)+timestamp,
		function(obj) {
			if (obj.no_connection) { doAlert('no connection'); return; }
			if (obj.failed_request) { doAlert('failed request - '+obj.msg); return; }
			if (!client.testSignedInOnServer(obj)) return;
			client.tmp_timestamp = obj.timestamp;
			var appmarks = [];
			for (var i=0;i<obj.appmarks.length;i++) {
				appmarks[i] = new mamAppMark(obj.appmarks[i]);
			}
			if (callback) callback(appmarks);
		} );
};

mamClient.prototype.getappmarks2=function(arg_map,callback) {
	if (this.signInFail()) return;
	var client = this;
	var params = '';
	if (this.incremental) {
		var t = this.getToken('mam_timestamp');
		if (t) {
			params = '&timestamp='+t;
		}
	}
	if (arg_map && arg_map['device']) {
		params += '&device='+arg_map['device'];
	}
	params += '&noimage=t';
	//alert(params);
	this.doAjax('getappmarks','&tkn='+encodeURIComponent(this.token)+params,
		function(obj) {
			if (obj.no_connection || obj.failed_request) {
				callback(null,null,false);
				return;
			}
			if (!client.testSignedInOnServer(obj)) return;
			client.tmp_timestamp = obj.timestamp;
			var appmark_types = [];
			for (var i=0;i<obj.appmark_types.length;i++) {
				appmark_types[i] = new mamAppMarkType(obj.appmark_types[i]);
			}
			var appmarks = [];
			for (var i=0;i<obj.appmarks.length;i++) {
				appmarks[i] = new mamAppMark(obj.appmarks[i]);
			}
			if (callback) callback(appmark_types,appmarks,true);
		} );
};

mamClient.prototype.getSharedAppMark=function(arg_map,original_key,version,callback) {
	var params = '&key='+original_key+'&ver='+version
	if (arg_map && arg_map['device']) {
		params += '&device='+arg_map['device'];
	}
	params += '&noimage=t';
	if (this.signedin) {
		params += '&tkn='+encodeURIComponent(this.token);
	}
	this.doAjax('get_shared_appmark',params,
		function(obj) {
			if (obj.no_connection) { doAlert('no connection'); return; }
			if (obj.failed_request) { doAlert('failed request - '+obj.msg); return; }
			log('getSharedAppMark() cb');
			var appmark_type = new mamAppMarkType( obj.appmark_type );
			var appmark = new mamAppMark( obj.appmark );
			if (callback) callback(appmark_type,appmark);
		} );
};


mamClient.prototype.getappmarks22=function(arg_map,timestamp,before,app_type,starred,shared,q,callback) {
	if (this.signInFail()) return;
	var client = this;
	var params = '';
	if (timestamp) {
		params ='&timestamp='+timestamp;
	}
	if (before) {
		params += '&before=t';
	}
	if (app_type) {
		params += '&app='+app_type;
	}
	if (starred) {
		params += '&starred=t';
	}
	if (shared) {
		params += '&shared=t';
	}
	if (q) {
		params += '&q='+encodeURIComponent(q);
	}
	if (arg_map && arg_map['device']) {
		params += '&device='+arg_map['device'];
	}
	params += '&noimage=t';
	//alert(params);
	this.doAjax('getappmarks','&tkn='+encodeURIComponent(this.token)+params,
		function(obj) {
			if (obj.no_connection) { doAlert('no connection'); return; }
			if (obj.failed_request) { doAlert('failed request - '+obj.msg); return; }
			if (!client.testSignedInOnServer(obj)) return;
			client.tmp_timestamp = obj.timestamp;
			var appmark_types = [];
			for (var i=0;i<obj.appmark_types.length;i++) {
				appmark_types[i] = new mamAppMarkType(obj.appmark_types[i]);
			}
			var appmarks = [];
			for (var i=0;i<obj.appmarks.length;i++) {
				appmarks[i] = new mamAppMark(obj.appmarks[i]);
			}
			if (callback) callback(appmark_types,appmarks,obj.has_more);
		} );
};

mamClient.prototype.getappmarks21=function(arg_map,timestamp,before,app_type,starred,shared,callback) {
	this.getappmarks22(arg_map,timestamp,before,app_type,starred,shared,null,callback);
};

mamClient.prototype.getappmarks3=function(arg_map,callback) {
	if (this.signInFail()) return;
	var client = this;
	var timestamp = '';
	if (this.incremental) {
		var t = this.getToken('mam_timestamp');
		if (t) {
			timestamp = '&timestamp='+t;
		}
	}
	this.doAjax('getappmarks','&tkn='+encodeURIComponent(this.token)+timestamp,
		function(obj) {
			if (obj.no_connection) { doAlert('no connection'); return; }
			if (obj.failed_request) { doAlert('failed request - '+obj.msg); return; }
			if (!client.testSignedInOnServer(obj)) return;
			client.tmp_timestamp = obj.timestamp;
			var appmark_types = [];
			for (var i=0;i<obj.appmark_types.length;i++) {
				appmark_types[i] = new mamAppMarkType(obj.appmark_types[i]);
			}
			var appmarks = [];
			for (var i=0;i<obj.appmarks.length;i++) {
				appmarks[i] = new mamAppMark(obj.appmarks[i]);
			}
			if (callback) callback(appmark_types,appmarks);
		} );
};

mamClient.prototype.getappmarktypes=function(device,callback) {
	if (this.signInFail()) return;
	var client = this;
	this.doAjax('getappmarktypes','&tkn='+encodeURIComponent(this.token)+'&device='+device+'&noimage=t',
		function(obj) {
			if (obj.no_connection) { doAlert('no connection'); return; }
			if (obj.failed_request) { doAlert('failed request - '+obj.msg); return; }
			if (!client.testSignedInOnServer(obj)) return;
			var appmark_types = [];
			for (var i=0;i<obj.appmark_types.length;i++) {
				appmark_types[i] = new mamAppMarkType(obj.appmark_types[i]);
			}
			if (callback) callback(appmark_types);
		} );
};


mamClient.prototype.recordTimestamp=function() {
	this.setToken('mam_timestamp',this.tmp_timestamp);
	//alert('set timestamp to '+this.getToken('mam_timestamp'));
}

mamClient.prototype.setToken=function(name,value,days) {
	this.app.set(name,value);
};

mamClient.prototype.getToken=function(name) {
	return this.app.get(name);
};


mamClient.prototype.removeToken=function(name) {
  this.app.set(name,null);
};

mamClient.prototype.getPage=function(device,pageName,callback) {
	this.doAjax('getpage','&device='+encodeURIComponent(device)+'&page='+encodeURIComponent(pageName),
		function(obj) {
			if (callback) callback(obj.html);
		} );
};

mamClient.prototype.upgrade=function(callback) {
	this.doAjax('upgrade','',
		function(obj) {
			if (callback) callback();
		} );
};

mamClient.prototype.setFBAccessToken=function(fbToken,callback) {
	var params = '&fbtkn='+encodeURIComponent(fbToken);
	this.doAjax('setfbtoken','&tkn='+encodeURIComponent(this.token)+params,
		function(obj) {
			if (callback) callback();
		} );
};

mamClient.prototype.getFBAccessToken=function(callback) {
	this.doAjax('getfbtoken','&tkn='+encodeURIComponent(this.token),
		function(obj) {
			if (callback) callback(obj.fbtkn);
		} );
};

mamClient.prototype.getFBDetails=function(fbToken,callback) {
	var params = (fbToken) ? '&fbtkn='+encodeURIComponent(fbToken) : '&tkn='+encodeURIComponent(this.token);
	this.doAjax('getfbdetails', params,
		function(obj) {
			if (callback) callback(obj.fbresult);
		} );
};

mamClient.prototype.doFBShare=function(key,version,msg,fbToken,callback) {
	var params = '&key='+key+'&ver='+version;
	if (msg) params += '&msg='+encodeURIComponent(msg);
	params += (fbToken) ? '&fbtkn='+encodeURIComponent(fbToken) : '&tkn='+encodeURIComponent(this.token);
	this.doAjax('dofbshare', params,
		function(obj) {
			if (callback) callback(obj.fbresult);
		} );
};
