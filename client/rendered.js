Template.background.onRendered(function() {
  var elem = this.$('#background').get(0);

  // init
  renderBackground(elem);

  $(window).resize(function() {
    renderBackground(elem);
  });
});

Template.game.onRendered(function() {
  Core.init();
});
