Scores = new Mongo.Collection('scores');

// SCHEMA
Scores.attachSchema(new SimpleSchema({
  createdAt: { type: Date, denyUpdate: true },
  score: { type: Number, min: 0, optional: true },

  // player user id.
  userId: {
    type: String,
    autoValue: function() {
      return this.userId;
    }
  }
}));

// HELPERS
Scores.helpers({
  user: function() {
    return Users.findOne(this.userId);
  }
});

// HOOKS
Scores.before.insert(function(userId, doc) {
  doc.createdAt = new Date();
});
