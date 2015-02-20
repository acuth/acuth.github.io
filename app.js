function doOnLoad() {
  console.log('doOnLoad()');
  document.getElementById('footer').innerHTML = 'Generated at '+(new Date());
  if (_app) _app.pageLoaded();
}