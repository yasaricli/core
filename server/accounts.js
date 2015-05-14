/*
 * Let's take a picture and add user profiles when
 * users register.
 * */
Accounts.onCreateUser(function(options, user) {
  if (_.has(options, 'profile')) {
    options.profile.picture = getFb(user.services.facebook.accessToken, ['picture.type(large)']).picture.data.url
    user.profile = options.profile;
  }
  return user;
});
