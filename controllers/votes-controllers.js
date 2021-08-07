const { selectVotedReviewsByUser, selectVotedCommentsByUser } = require('../models/votes-model.js')

const getVotedReviewsByUser = (req, res,next) => {
    const { username } = req.params
    selectVotedReviewsByUser(username).then(reviews => {
        res.status(200).send({reviews});
    }).catch(err => {
        next(err);
    })
}

const getVotedCommentsByUser = (req, res,next) => {
    const { username } = req.params
    selectVotedCommentsByUser(username).then(comments => {
        res.status(200).send({comments});
    }).catch(err => {
        next(err);
    })
}

module.exports =  { getVotedReviewsByUser, getVotedCommentsByUser };
