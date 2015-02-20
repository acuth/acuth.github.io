function doOnLoad() {
  console.log('doOnLoad()');
  document.getElementById('footer').innerHTML = 'Generated @ '+(new Date());
}