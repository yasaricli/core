Meteor.startup(function () {
  isCordova(function() {
    // Preload assets.
    MeteorSounds.preloadAllAssets();
  });
});
