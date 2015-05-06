Template.game.events({
  'click .fa-pause': function() {
    Core.pause();
  },
  'click .fa-play': function() {
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
