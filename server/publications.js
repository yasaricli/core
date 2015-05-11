Meteor.publishComposite('scores', function(_id) {
  return {
    find: function() {
      return Scores.find();
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
