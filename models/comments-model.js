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
    const { voted_by, vote_type, body } = reqBody;
    const otherKeys = Object.keys(reqBody);
  
   
    
    await checkExtraProperties(['body', 'vote_type', 'voted_by'], otherKeys);
    await noRequiredPropertys(['vote_type', 'voted_by', 'body'], otherKeys)
    await checkForNulls ([voted_by, vote_type, body]);
   
    const qryValues = [comment_id];
    let qryStr = `UPDATE comments SET `;
    if(voted_by || vote_type) {
        await checkMissingProperty(['vote_type', 'voted_by'], otherKeys)
        const validTypes = ['up', 'down'];

        if(!validTypes.includes(vote_type)) {
            return Promise.reject({ status: 400, msg: `vote_type must be 'up' or 'down'` })

        }

        const checkResponse = await db.query(`SELECT vote_type FROM votes 
                                            WHERE comment_id = $1 AND voted_by = $2
                                            `, [comment_id, voted_by])

        if(checkResponse.rows.length === 0) {
            const qryResponse = await db.query(`INSERT INTO votes
                                                (comment_id, voted_by, vote_type)
                                                VALUES
                                                ($1,$2,$3)`, [comment_id, voted_by, vote_type])

            qryValues.push(vote_type === 'up' ? 1 : -1);
            qryStr += `votes = 
            (CASE WHEN (votes + $${qryValues.length}) >= 0
            THEN (votes + $${qryValues.length}) ELSE 0 END) `
        } else if(checkResponse.rows[0].vote_type === vote_type) {
            //delete the vote
            const response = await db.query(`DELETE FROM votes
                                            WHERE comment_id = $1`, [comment_id]);

            qryValues.push(vote_type === 'up' ? -1 : 1);
            qryStr += `votes = 
            (CASE WHEN (votes + $${qryValues.length}) >= 0
                THEN (votes + $${qryValues.length}) ELSE 0 END) `
                                    
        } else {
            //update vote type
            const response = await db.query(`UPDATE votes
                                             SET vote_type = $1
                                             WHERE comment_id = $2`, [vote_type, comment_id])

            qryValues.push(vote_type === 'up' ? 2 : -2);
            qryStr += `votes = 
            (CASE WHEN (votes + $${qryValues.length}) >= 0
            THEN (votes + $${qryValues.length}) ELSE 0 END) `
                                     
        } 



    }

    if(body) {
        if(voted_by) {
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