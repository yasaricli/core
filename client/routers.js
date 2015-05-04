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

Router.route('/gameover', {
  name: 'GameOver'
});

Router.route('/scores', {
  name: 'Scores'
});

Router.route('/profile/:_id', {
  name: 'Profile'
});
