const db = require('../db/connection.js');
const { checkExists } = require('../utils.js')

const selectVotedReviewsByUser = async (username) => {
    
    const qryResponse = await db.query(`SELECT reviews.review_id, title, category, created_at, votes, owner
                                  FROM reviews JOIN votes
                                  ON reviews.review_id = votes.review_id
                                  JOIN users
                                  ON votes.voted_by = users.username
                                  WHERE users.username = $1
                                  `, [username]);
    
    if (qryResponse.rows.length === 0) {
        await checkExists('users', 'username', username)
    }
    return qryResponse.rows;
}

const selectVotedCommentsByUser = async (username) => {
    
    const qryResponse = await db.query(`SELECT comments.comment_id, comments.created_at, comments.votes, author, reviews.title AS review_title
                                  FROM comments JOIN votes
                                  ON comments.comment_id = votes.comment_id
                                  JOIN users
                                  ON votes.voted_by = users.username
                                  JOIN reviews
                                  ON comments.review_id = reviews.review_id
                                  WHERE users.username = $1
                                  `, [username]);
    if (qryResponse.rows.length === 0) {
        await checkExists('users', 'username', username)
    }
    return qryResponse.rows;
}

module.exports = { selectVotedReviewsByUser, selectVotedCommentsByUser };