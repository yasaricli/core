Template.game.events({
  'click #LoginWithFacebook': function(e) {
    e.preventDefault();

    // LOGIN FACEBOOK
    Meteor.loginWithFacebook({}, function(err) {
      console.log(err);
    });
  }
});
