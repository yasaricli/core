Template.background.onRendered(function() {
  var elem = this.$('#Background').get(0);

  // init
  renderBackground(elem);

  $(window).resize(function() {
    renderBackground(elem);
  });
});

Template.index.onRendered(function() {
  Core.pause();
});

Template.game.onRendered(function() {
  Core.init().start();
});

Template.game.onDestroyed(function() {
  if (Core.getPlaying()) {
    Core.finish();
  }
});
