Meteor.publishComposite('game', function() {
  return {
    find: function() {
      return Scores.find({ userId: this.userId }, { sort: { score: -1 }, limit: 1 });
    }
  }
});

Meteor.publishComposite('scores', function(limit) {
  return {
    find: function() {
      return Scores.find({ }, { sort: { score: -1 }, limit: limit });
    },
    children: [
      {
        find: function(score) {
          return Users.find({ _id: score.userId });
        }
      }
    ]
  }
});
