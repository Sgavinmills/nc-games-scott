const votesRouter = require('express').Router();
const { getVotedReviewsByUser, getVotedCommentsByUser } = require('../controllers/votes-controllers.js')


votesRouter.route('/:username/reviews')
  .get(getVotedReviewsByUser);

  votesRouter.route('/:username/comments')
  .get(getVotedCommentsByUser);
  

module.exports = votesRouter;