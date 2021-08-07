const commentsRouter = require('express').Router();
const { deleteCommentById, patchCommentById, getReviewsByUserComments } = require('../controllers/comments-controller.js')

commentsRouter.route('/:comment_id')
  .delete(deleteCommentById)
  .patch(patchCommentById);

  commentsRouter.route('/:username/reviews')
  .get(getReviewsByUserComments);
  


module.exports = commentsRouter;