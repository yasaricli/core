Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading'
});

Router.route('/', {
  name: 'Index'
});

Router.route('/game', {
  name: 'Game',
  waitOn: function() {
    if (HELPERS.itsOk()) {
      return Meteor.subscribe('game');
    }
  }
});

Router.route('/finish', {
  name: 'Finish'
});

Router.route('/scores', {
  name: 'Scores',
  waitOn: function() {
    return Meteor.subscribe('scores', 10);
  }
});

Router.route('/profile/:_id', {
  name: 'Profile'
});

/*
 * User Accounts configures
 * */
AccountsTemplates.configureRoute('ensureSignedIn', {
  template: 'loginWithFacebook',
});

Router.plugin('ensureSignedIn', {
  only: ['Scores']
});
