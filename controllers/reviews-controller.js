const { selectReviewById, updateReviewsById } = require('../models/reviews-model.js')

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

module.exports = { getReviewsById, patchReviewsById };