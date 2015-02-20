function doOnLoad() {
  console.log('doOnLoad()');
  document.getElementById('footer').innerHTML = 'Generated at '+(new Date());
  _app.pageLoaded();
}