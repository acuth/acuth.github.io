Awac.prototype.getDims = function() {
  var result = JSON.parse(this.container.getDims());
  console.log(' - fixup getDims() result');
  var w = $(window).width();
  //result.height = result.height*w/result.width;
  //result.width = w;
  return result;
};

Awac.prototype.setOnTransitionEnd = function(cb) {
  console.log('setOnTransitionEnd()');
  this.transitionEndCallback = cb;
};

Awac.prototype.fireTransitionEnd = function() {
  console.log('fireTransitionEnd()');
  if (this.transitionEndCallback) {
    this.transitionEndCallback();
  }
};
