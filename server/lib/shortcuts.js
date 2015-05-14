var root = this;

/*
 * Make async call to grab the data from facebook
 * */
root.getFb = function(token, fields, prop) {
  var result = Meteor.http.get("https://graph.facebook.com/me", {
    params: {
      access_token: token, // accessToken
      fields: fields
    }
  });
  return result.data; // return the facebook data
};
