const db = require('../db/connection.js');
const { checkExists } = require('../utils.js');


const selectReviews = async (sort_by = 'created_at', order, category, limit=10, p=1) => {
    const validSortBys = ['owner','title','review_id','category','comment_count','votes','created_at'];

    if(order !== 'asc' && order !== 'desc') {
        direction = 'desc';
    } else direction = order;

    
    let qryStr = `SELECT owner, title, reviews.review_id, category, review_img_url, reviews.created_at, reviews.votes, COUNT(comment_id) AS comment_count
    FROM reviews LEFT JOIN comments ON reviews.review_id = comments.review_id `;

    const queryValues =[];
    if(category) {
        await checkExists('categories','slug', category);
        queryValues.push(category);
        let dollarVal = queryValues.length;
        qryStr += `WHERE category = $${dollarVal} `;
        
    }
    if(!validSortBys.includes(sort_by)) {
        return Promise.reject({ status: 400, msg: 'Invalid sort query' })
    }

    qryStr += `GROUP BY reviews.review_id
               ORDER BY ${sort_by} ${direction} `;

    
    queryValues.push(limit);
    let dollarValL = queryValues.length;
    const offSet = (p-1) * limit;
    queryValues.push(offSet);
    let dollarValP = queryValues.length;
    qryStr += `LIMIT $${dollarValL} OFFSET $${dollarValP}`

    const qryResponse = await db.query(qryStr, queryValues);

    return qryResponse.rows;
}


const selectReviewById = async (review_id) => {

    const qryResponse = await db.query(`SELECT 
                                        reviews.review_id, title, review_body, designer, review_img_url,
                                        reviews.votes, category, owner, reviews.created_at, COUNT(comment_id) AS comment_count
                                         FROM REVIEWS 
                                        LEFT JOIN comments ON reviews.review_id = comments.review_id
                                        WHERE reviews.review_id = $1
                                        GROUP BY reviews.review_id`, [review_id]);

    if (qryResponse.rows.length === 0) {
        return Promise.reject({ status: 404, msg: `${review_id} not found` })
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
        return Promise.reject({ status: 404, msg: `${review_id} not found` })
    }
    return qryResponse.rows[0];
}

const selectCommentsByReviewId = async (review_id) => {
    
    const qryResponse = await db.query(`SELECT comment_id, votes, created_at, author, body
                                     FROM comments
                                     WHERE review_id = $1`, [review_id])
    if(qryResponse.rows.length === 0) {
        await checkExists('reviews','review_id', review_id)
    }
    return qryResponse.rows;
}

const insertCommentByReviewId = async (review_id, reqBody) => {
    const { username, body } = reqBody
    const bodyProps = Object.keys(reqBody);
    if(bodyProps.some(prop => (prop !== 'username' && prop !== 'body'))) {
        return Promise.reject({ status : 400, msg : `Too many properties provided` })
    }
    if(!bodyProps.includes('username')) {
        return Promise.reject({ status : 400, msg : `username property required` })
    }
    if(!bodyProps.includes('body')) {
        return Promise.reject({ status : 400, msg : `body property required` })
    }
    const qryResponse = await db.query(`INSERT INTO comments
                    (author, body, review_id)
                    VALUES
                    ($1,$2,$3)
                    RETURNING *;`,[username, body, review_id])
    
    return qryResponse.rows[0];
    
}

module.exports = { insertCommentByReviewId, selectReviewById, updateReviewsById, selectReviews, selectCommentsByReviewId };



