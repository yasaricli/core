Template.game.events({
  'click .pause': function() {
    Core.pause();
  },
  'click .resume': function() {
    Core.resume();
  }
});

Template.loginWithFacebook.events({
  'click .is-facebook:not(.user)': function(e) {
    e.preventDefault();

    // LOGIN FACEBOOK
    Meteor.loginWithFacebook({}, function(err) {
      console.log(err);
    });
  }
});
