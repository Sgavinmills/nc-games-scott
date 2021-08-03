const db = require('../db/connection.js');
const selectReviewById = async (review_id) => {

    const qryResponse = await db.query(`SELECT 
                                        reviews.review_id, title, review_body, designer, review_img_url,
                                        reviews.votes, category, owner, reviews.created_at, COUNT(comment_id) AS comment_count
                                         FROM REVIEWS 
                                        LEFT JOIN comments ON reviews.review_id = comments.review_id
                                        WHERE reviews.review_id = $1
                                        GROUP BY reviews.review_id`, [review_id]);

    if (qryResponse.rows.length === 0) {
        return Promise.reject({ status: 404, msg: 'Not found' })
    }

    return qryResponse.rows[0];
}

const updateReviewsById = async (review_id, inc_votes) => {
    if (!inc_votes) {
        return Promise.reject({ status: 400, msg: 'Missing data' })
    }
    const qryResponse = await db.query(`UPDATE reviews SET votes = 
                                           (CASE WHEN (votes + $1) >= 0
                                            THEN (votes + $1) ELSE 0 END)
                                        WHERE review_id = $2
                                        RETURNING *;`, [inc_votes, review_id])
    if (qryResponse.rows.length === 0) {
        return Promise.reject({ status: 404, msg: 'Not found' })
    }
    return qryResponse.rows[0];
}

module.exports = { selectReviewById, updateReviewsById };