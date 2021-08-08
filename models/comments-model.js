const db = require('../db/connection.js');
const { checkExtraProperties, checkMissingProperty, noRequiredPropertys, checkForNulls, checkExists } = require('../utils.js');

const dropCommentById = async (comment_id) => {
    const response = await db.query(`DELETE FROM comments 
                                    WHERE comment_id = $1 
                                    RETURNING *;`,[comment_id]); 

    if(response.rows.length === 0) {
        return Promise.reject({ status: 404, msg : `${comment_id} does not exist`})
    }
}

const updateCommentById = async (comment_id, reqBody) => {
    const { inc_votes, body } = reqBody;
    const otherKeys = Object.keys(reqBody);
  
   
    
    await checkExtraProperties(['inc_votes', 'body'], otherKeys);
    await noRequiredPropertys(['inc_votes', 'body'], otherKeys)
    await checkForNulls ([inc_votes, body]);
   

    const qryValues = [comment_id];
    let qryStr = `UPDATE comments SET `;
    if(inc_votes) {
        qryValues.push(inc_votes);
        qryStr += `votes = 
        (CASE WHEN (votes + $${qryValues.length}) >= 0
        THEN (votes + $${qryValues.length}) ELSE 0 END) `;
    }

    if(body) {
        if(inc_votes) {
            qryStr += ', ';
        }
        qryValues.push(body);
        qryStr += `body = $${qryValues.length} `;
    }

    qryStr += `WHERE comment_id = $1 RETURNING *;`

    const qryResponse = await db.query(qryStr, qryValues);
   
                    
    
    if(qryResponse.rows.length === 0) {
        return Promise.reject({status: 404, msg : `${comment_id} not found`})
    }
    return qryResponse.rows[0];
}

const selectReviewsByUserComments = async (username)  =>{
    
    const qryResponse = await db.query(`SELECT reviews.review_id, reviews.title, reviews.category,reviews.created_at,reviews.votes, reviews.owner
                                        FROM reviews
                                        JOIN comments
                                        ON reviews.review_id = comments.review_id
                                        JOIN users
                                        ON comments.author = users.username
                                        WHERE comments.author = $1`, [username]);
   
    if (qryResponse.rows.length === 0) {
        await checkExists('users', 'username', username)
    }
    return qryResponse.rows;
}

module.exports = { dropCommentById, updateCommentById, selectReviewsByUserComments };