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
