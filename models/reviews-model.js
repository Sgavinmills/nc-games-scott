const db = require('../db/connection.js');
const { values, some, forEach } = require('../db/data/test-data/categories.js');
const { checkExists, checkMissingProperty, checkExtraProperties } = require('../utils.js');


const selectReviews = async (sort_by = 'created_at', order, category, limit = 10, p = 1) => {
    const validSortBys = ['owner', 'title', 'review_id', 'category', 'comment_count', 'votes', 'created_at'];

    if (order !== 'asc' && order !== 'desc') {
        direction = 'desc';
    } else direction = order;


    let qryStr = `SELECT owner, title, reviews.review_id, category, review_img_url, reviews.created_at, reviews.votes, COUNT(comment_id) AS comment_count
    FROM reviews LEFT JOIN comments ON reviews.review_id = comments.review_id `;

    const queryValues = [];
    if (category) {
        await checkExists('categories', 'slug', category);
        queryValues.push(category);
        let dollarVal = queryValues.length;
        qryStr += `WHERE category = $${dollarVal} `;

    }
    if (!validSortBys.includes(sort_by)) {
        return Promise.reject({ status: 400, msg: 'Invalid sort query' })
    }

    qryStr += `GROUP BY reviews.review_id
               ORDER BY ${sort_by} ${direction} `;


    queryValues.push(limit);
    let dollarValL = queryValues.length;
    const offSet = (p - 1) * limit;
    queryValues.push(offSet);
    let dollarValP = queryValues.length;
    const withoutLimitAndOffsetQryStr = qryStr;
    qryStr += `LIMIT $${dollarValL} OFFSET $${dollarValP}`

    const qryResponse = await db.query(qryStr, queryValues);


    //get number of results
    queryValues.pop();
    queryValues.pop();
    const qryResponseAll = await db.query(withoutLimitAndOffsetQryStr, queryValues);
    return { reviews: qryResponse.rows, total_count: qryResponseAll.rows.length }


}


const selectReviewById = async (review_id) => {


    const qryResponse = await db.query(`SELECT reviews.*, COUNT(comment_id) AS comment_count
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

const selectCommentsByReviewId = async (review_id, limit = 10, p = 1) => {
    const offSet = (p - 1) * limit;
    const qryResponse = await db.query(`SELECT comment_id, votes, created_at, author, body
                                     FROM comments
                                     WHERE review_id = $1
                                     LIMIT $2 OFFSET $3`, [review_id, limit, offSet])
    if (qryResponse.rows.length === 0) {
        await checkExists('reviews', 'review_id', review_id)
    }

    // const qryResponseAll = await db.query(`SELECT * FROM reviews`);
    // return { reviews : qryResponse.rows, total_count : qryResponseAll.rows.length }
    const qryResponseAll = await db.query(`SELECT comment_id, votes, created_at, author, body
    FROM comments
    WHERE review_id = $1`, [review_id]);
    return { comments: qryResponse.rows, total_count: qryResponseAll.rows.length }
    //return qryResponse.rows;
}

const insertCommentByReviewId = async (review_id, reqBody) => {
    const { username, body } = reqBody
    const bodyProps = Object.keys(reqBody);
  

    await checkExtraProperties(['username', 'body'], bodyProps);
    await checkMissingProperty(['username', 'body'], bodyProps);
  
    const qryResponse = await db.query(`INSERT INTO comments
                    (author, body, review_id)
                    VALUES
                    ($1,$2,$3)
                    RETURNING *;`, [username, body, review_id])

    return qryResponse.rows[0];

}

const insertReviews = async (body) => {
    const { title, review_body, designer, category, owner, review_img_url } = body;
    
    const queryValues = [title, review_body, designer, category, owner];
    const propsProvided = Object.keys(body);

    const requiredProps = ['title', 'review_body', 'designer', 'category', 'owner']

  
   
    await checkMissingProperty(requiredProps, propsProvided);  
    requiredProps.push('review_img_url');
    await checkExtraProperties(requiredProps, propsProvided)

  
    let qryStrDolValues;
    if (review_img_url) {
        qryStrCols = `(title, review_body, designer, category, owner, review_img_url)`
        qryStrDolValues = `($1,$2,$3,$4,$5, $6)`
        queryValues.push(review_img_url);
    } else {
        qryStrCols = `(title, review_body, designer, category, owner)`
        qryStrDolValues = `($1,$2,$3,$4,$5)`
    }
    qryStr = `INSERT INTO reviews
    ${qryStrCols} 
    VALUES 
    ${qryStrDolValues}
    RETURNING *;`;



    const qryResponse = await db.query(qryStr, queryValues);
    if (!review_img_url)
        delete qryResponse.rows[0].review_img_url;
    qryResponse.rows[0].comment_count = 0;
    return qryResponse.rows[0];
}

const dropReviewById = async (review_id) => {
    const response = await db.query(`DELETE FROM reviews 
                        WHERE review_id = $1 RETURNING *;`,[review_id]);

     if(response.rows.length === 0) {
        return Promise.reject({ status: 404, msg : `${review_id} does not exist`})
    }
}

module.exports = { dropReviewById, insertReviews, insertCommentByReviewId, selectReviewById, updateReviewsById, selectReviews, selectCommentsByReviewId };



