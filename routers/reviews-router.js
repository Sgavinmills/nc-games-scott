const reviewsRouter = require('express').Router();
const { deleteReviewsById, postReviews, postCommentsByReviewId, getReviewsById, patchReviewsById, getReviews, getCommentsByReviewId } = require('../controllers/reviews-controller.js')


reviewsRouter.route('/')
  .get(getReviews)
  .post(postReviews);

reviewsRouter.route('/:review_id')
  .get(getReviewsById)
  .patch(patchReviewsById)
  .delete(deleteReviewsById);

reviewsRouter.route('/:review_id/comments')
  .get(getCommentsByReviewId)
  .post(postCommentsByReviewId);

module.exports = reviewsRouter;
