const { dropCommentById, updateCommentById,selectReviewsByUserComments } = require('../models/comments-model.js');

const deleteCommentById = (req, res, next) => {
    const { comment_id } = req.params;
    dropCommentById(comment_id).then((response) => {
        res.status(204).send();
    }).catch(err => {
        next(err);
    })
}

const patchCommentById = (req, res, next) => {
    const { comment_id } = req.params;
    updateCommentById(comment_id, req.body).then(comments => {
        res.status(200).send({comments});
    }).catch(err => {
        next(err);
    })
}

const getReviewsByUserComments = (req,res,next) => {
    const { username } = req.params;
    selectReviewsByUserComments(username).then(reviews => {
        res.status(200).send({reviews});
    }).catch(err => {
        next(err);
    })
}

module.exports = { deleteCommentById, patchCommentById, getReviewsByUserComments };