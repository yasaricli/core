var root = this;

root.HELPERS = {
  isAuthenticated: function() {
    return Meteor.userId();
  }
};

root.isCordova = function(callback) {
  return Meteor.isCordova && callback();
};

root.renderBackground = function(elem) {
  var ctx = elem.getContext('2d');
      width = root.innerWidth,
      height = root.innerHeight,
      gradient = ctx.createRadialGradient(width * 0.5, height * 0.5, 0, width * 0.5, height * 0.5, 500);

  // add Color
  gradient.addColorStop(0, 'rgba(0, 70, 70, 1)');
	gradient.addColorStop(1, 'rgba(0, 8, 14, 1)');

  // width height resize.
  elem.width = width;
	elem.height = height;

  // fill fects
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
};
