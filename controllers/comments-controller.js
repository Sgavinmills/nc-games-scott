const { dropCommentById } = require('../models/comments-model.js');

const deleteCommentById = (req, res, next) => {
    const { comment_id } = req.params;
    dropCommentById(comment_id).then((response) => {
        res.status(204).send();
    }).catch(err => {
        next(err);
    })
}

module.exports = { deleteCommentById };