const { dropReviewById, insertReviews, insertCommentByReviewId, selectReviewsByIdOrTitle, updateReviewsById, selectReviews, selectCommentsByReviewId } = require('../models/reviews-model.js')

const getReviews = (req, res, next) => {
    const { sort_by, order, category, limit, p, time } = req.query;
    selectReviews(sort_by, order, category, limit, p, time).then(({reviews, total_count}) => {
        
        res.status(200).send({reviews,total_count});
    }).catch(err => {
        next(err);
    })
}

const getReviewsByIdOrTitle = (req, res, next) => {
    const review_id_or_title  = req.params.review_id;
    selectReviewsByIdOrTitle(review_id_or_title).then((reviews) => {
        res.status(200).send({reviews});
    }).catch(err => {
        next(err);
    })
}

const patchReviewsById = (req, res, next) => {
    //const { review_id } = req.params;
    updateReviewsById(req.params, req.body).then(reviews => {
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

const postCommentsByReviewId = (req, res, next) => {
    const { review_id } = req.params;
    insertCommentByReviewId(review_id, req.body).then(comments => {
        res.status(201).send({comments});
    }).catch(err => {
        next(err);
    })
}

const postReviews = (req, res, next) => {
    insertReviews(req.body).then((reviews) => {
        res.status(201).send({reviews})
    }).catch(err => {
        next(err);
    })
}

const deleteReviewsById = (req, res, next) => {
    const { review_id } = req.params;
    dropReviewById(review_id).then(reviews => {
        res.status(204).send();
    }).catch(err => {
        next(err);
    })
}

module.exports = { deleteReviewsById, postReviews, postCommentsByReviewId, getReviewsByIdOrTitle, patchReviewsById, getReviews, getCommentsByReviewId };