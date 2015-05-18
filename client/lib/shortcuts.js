var root = this;

root.HELPERS = {
  isAuthenticated: function() {
    return Meteor.userId();
  },
  serverStatus: function() {
    return Meteor.status()
  },

  /*
   * If members of the Internet and the user
   * logged Everything you return a boolean value.
   * */
  itsOk: function() {
    return Meteor.userId() && Meteor.status().connected;
  }
};

root.isCordova = function(callback) {
  return Meteor.isCordova && callback();
};
