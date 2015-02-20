function doOnLoad() {
  console.log('doOnLoad() _app='+_app);
  document.getElementById('footer').innerHTML = 'Generated at '+(new Date());
  if (_app) _app.pageLoaded();
}