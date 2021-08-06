const reviewsRouter = require('express').Router();
const { deleteReviewById, postReviews, postCommentByReviewId, getReviewsById, patchReviewsById, getReviews, getCommentsByReviewId } = require('../controllers/reviews-controller.js')


reviewsRouter.route('/')
  .get(getReviews)
  .post(postReviews);

reviewsRouter.route('/:review_id')
  .get(getReviewsById)
  .patch(patchReviewsById)
  .delete(deleteReviewById);

reviewsRouter.route('/:review_id/comments')
  .get(getCommentsByReviewId)
  .post(postCommentByReviewId);

module.exports = reviewsRouter;
