const reviewsRouter = require('express').Router();
const { postCommentByReviewId, getReviewsById, patchReviewsById, getReviews, getCommentsByReviewId } = require('../controllers/reviews-controller.js')


reviewsRouter.get('/', getReviews);

reviewsRouter.route('/:review_id')
  .get(getReviewsById)
  .patch(patchReviewsById);

reviewsRouter.route('/:review_id/comments')
  .get(getCommentsByReviewId)
  .post(postCommentByReviewId);

module.exports = reviewsRouter;
