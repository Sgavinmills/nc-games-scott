const commentsRouter = require('express').Router();
const { deleteCommentById } = require('../controllers/comments-controller.js')

commentsRouter.delete('/:comment_id', deleteCommentById);

module.exports = commentsRouter;