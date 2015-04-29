var root = this;

root.isCordova = function(callback) {
  return Meteor.isCordova && callback();
};
