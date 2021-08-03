const reviewsRouter = require('express').Router();
const { getReviewsById, patchReviewsById } = require('../controllers/reviews-controller.js')

reviewsRouter.route('/:review_id')
.get(getReviewsById)
.patch(patchReviewsById);

module.exports = reviewsRouter;
