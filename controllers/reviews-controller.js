const { insertCommentByReviewId, selectReviewById, updateReviewsById, selectReviews, selectCommentsByReviewId } = require('../models/reviews-model.js')

const getReviews = (req, res, next) => {
    const { sort_by, order, category, limit, p } = req.query;
    selectReviews(sort_by, order, category, limit, p).then(({reviews, total_count}) => {
        
        res.status(200).send({reviews,total_count});
    }).catch(err => {
        next(err);
    })
}

const getReviewsById = (req, res, next) => {
    const { review_id } = req.params;
    selectReviewById(review_id).then((reviews) => {
        res.status(200).send({reviews});
    }).catch(err => {
        next(err);
    })
}

const patchReviewsById = (req, res, next) => {
    const { inc_votes } = req.body;
    const { review_id } = req.params;
    updateReviewsById(review_id, inc_votes).then(reviews => {
        res.status(200).send({reviews});
    }).catch(err => {
        next(err);
    })
}

const getCommentsByReviewId = (req, res, next) => {
    const { review_id } = req.params;
    const { limit, p } = req.query;
    selectCommentsByReviewId(review_id, limit, p).then(({ comments, total_count }) => {
        res.status(200).send({comments, total_count});
    }).catch(err => {
        next(err);
    })
}

const postCommentByReviewId = (req, res, next) => {
    const { review_id } = req.params;
    insertCommentByReviewId(review_id, req.body).then(comments => {
        res.status(201).send({comments});
    }).catch(err => {
        next(err);
    })
}

module.exports = { postCommentByReviewId, getReviewsById, patchReviewsById, getReviews, getCommentsByReviewId };