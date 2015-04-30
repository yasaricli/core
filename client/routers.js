Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading'
});

Router.route('/', {
  name: 'Game'
});

Router.route('/scores', {
  name: 'Scores'
});

Router.route('/profile/:_id', {
  name: 'Profile'
});
