Template.game.events({
  'click #StartGame': function() {
    Core.StartGame();
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