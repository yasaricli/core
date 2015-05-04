HELPERS.Core = function() {
  return Core;
};

// TEMPLATE TAGS
_.each(HELPERS, function(fn, name) {
  Template.registerHelper(name, fn);
});

Template.loginWithFacebook.helpers({});
