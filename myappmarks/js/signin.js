var app = null;
var _content = null;

function log(msg) {
	console.log(msg);
}

function logUrl(s,url) {
	console.log(s+' '+url);
}

function getContent() {
	if (!_content) console.log('_content not set');
	return _content;
}

function displayFormMessage(msg) {
	_formMessageDiv.html(msg);
}

// triggered by from submit so do not want form to cause a reload
function doSignIn(event) {
	console.log('doSignIn()');
	event.preventDefault();
	var token = app.load('mam_token');
	var username = _usernameInput.val();
	var password = _passwordInput.val();
	_mam.signin(username,password,token,function(obj) {
	  console.log('doSignIn() cb');
		if (!_mam.signedin)
			displayFormMessage(_mam.msg);
		else
			app.endPage(1);
	});
}

// triggered by from submit so do not want form to cause a reload
function doRegister(event) {
	console.log('doRegister()');
	event.preventDefault();
	var token = app.load('mam_token');
	var username = _usernameInput.val();
	var password = _passwordInput.val();
	var password2 = _passwordInput2.val();
	_mam.register(username,password,password2,token,function(obj) {
		if (!_mam.signedin)
			displayFormMessage(_mam.msg);
		else
			app.endPage(1);
	});
}

function displaySignIn() {
  app.setTitle('myappmarks - sign in');
  console.log('displaySignIn()');
	var content = getContent();
	content.empty();

	var card = $(document.createElement('div')).addClass('card');
	var bigdiv2 = $(document.createElement('div')).addClass('login-register-form');
	var form = $(document.createElement('form'));

	_usernameInput = $(document.createElement('input')).attr('type','text').attr('placeholder','username').attr('autocapitalize','off').appendTo(form);
	_passwordInput = $(document.createElement('input')).attr('type','password').attr('placeholder','password').appendTo(form);
	$(document.createElement('div')).addClass('fake-btn').html('Sign In').click(function(event) { doSignIn(event); }).appendTo(form);
	$(document.createElement('input')).attr('type','submit').addClass('hidden-submit').appendTo(form);
	form.submit(function(event) { doSignIn(event); });

	form.appendTo(bigdiv2);
	bigdiv2.appendTo(card);

	var blurbHtml = 'If you do not already have an account then you can <a id="goto-register">Sign&nbsp;Up</a> for an account right now';
	$(document.createElement('div')).addClass('form-blurb').html(blurbHtml).appendTo(card);
	_formMessageDiv = $(document.createElement('div')).addClass('form-message').appendTo(card);
	form.submit(function(event) { doSignIn(event); });
	card.appendTo(content);

	//setTimeout(nameInputFocus,100 );
	$('#goto-register').click(function(event) { displayRegister(); });
}

function displayRegister() {
  app.setTitle('myappmarks - sign up');
	console.log('displayRegister()');
	var content = getContent();
	content.empty();

	var card = $(document.createElement('div')).addClass('card');
	var bigdiv2 = $(document.createElement('div')).addClass('login-register-form');
	var form = $(document.createElement('form'));

	_usernameInput = $(document.createElement('input')).attr('type','text').attr('placeholder','username').attr('autocapitalize','off').appendTo(form);
	_passwordInput = $(document.createElement('input')).attr('type','password').attr('placeholder','password').appendTo(form);
	_passwordInput2 = $(document.createElement('input')).attr('type','password').attr('placeholder','confirm password').appendTo(form);
	$(document.createElement('div')).addClass('fake-btn').html('Sign Up').click(function(event) { doRegister(event); }).appendTo(form);
	$(document.createElement('input')).attr('type','submit').addClass('hidden-submit').appendTo(form);
	form.submit(function(event) { doRegister(event); });

	form.appendTo(bigdiv2);
	bigdiv2.appendTo(card);

	var blurbHtml = 'If you already have an account then you can <a id="goto-signin">Sign&nbsp;In</a> right now';
	$(document.createElement('div')).addClass('form-blurb').html(blurbHtml).appendTo(card);
	_formMessageDiv = $(document.createElement('div')).addClass('form-message').appendTo(card);

	card.appendTo(content);

	//setTimeout(nameInputFocus,100 );
	$('#goto-signin').click(function(event) { displaySignIn(); });
}

function doAlert(msg) {
  alert(msg);
}

function init() {
  app = new Awac('app');
	_content = $('#page');
	_mam = new mamClient('http://www.myappmarks.com/',app,true);
  _mam.initFromAppState();
	displaySignIn();
	//app.loading();
	app.startPage();
}

$(document).ready(function() { init(); });
