Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading'
});

Router.route('/', {
  name: 'Index'
});

Router.route('/game', {
  name: 'Game'
});

Router.route('/finish', {
  name: 'Finish'
});

Router.route('/scores', {
  name: 'Scores',
  waitOn: function() {
    return Meteor.subscribe('scores');
  }
});

Router.route('/profile/:_id', {
  name: 'Profile'
});
