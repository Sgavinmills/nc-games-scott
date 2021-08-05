const { dropCommentById, updateCommentById } = require('../models/comments-model.js');

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
    const { inc_votes } = req.body
    updateCommentById(comment_id, req.body).then(comments => {
        res.status(200).send({comments});
    }).catch(err => {
        next(err);
    })
}

module.exports = { deleteCommentById, patchCommentById };