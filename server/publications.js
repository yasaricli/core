Meteor.publishComposite('scores', function(_id) {
  return {
    find: function() {
      var  uniqueScores = _.uniq(Scores.find({}, { sort: { score: -1 }, limit: 2 }).fetch(), function(score) {
        return score.userId;
      });
      return Scores.find({
        _id: {
          $in: _.map(uniqueScores, function(score) {
            return score._id;
          })
        }
      });
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
