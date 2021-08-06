const db = require('../db/connection.js');
const { checkExtraProperties, checkMissingProperty } = require('../utils.js');

const dropCommentById = async (comment_id) => {
    const response = await db.query(`DELETE FROM comments 
                                    WHERE comment_id = $1 
                                    RETURNING *;`,[comment_id]); 

    if(response.rows.length === 0) {
        return Promise.reject({ status: 404, msg : `${comment_id} does not exist`})
    }
}

const updateCommentById = async (comment_id, reqBody) => {
    const { inc_votes } = reqBody;
    const otherKeys = Object.keys(reqBody);
  

    await checkExtraProperties(['inc_votes'], otherKeys);
    await checkMissingProperty(['inc_votes'], otherKeys)
   
    
    const qryResponse = await db.query(`UPDATE comments SET votes = 
                                        (CASE WHEN (votes + $1) >= 0
                                        THEN (votes + $1) ELSE 0 END)
                                        WHERE comment_id = $2
                                        RETURNING *;`, [inc_votes, comment_id]);
    if(qryResponse.rows.length === 0) {
        return Promise.reject({status: 404, msg : `${comment_id} not found`})
    }
    return qryResponse.rows[0];
}

module.exports = { dropCommentById, updateCommentById };