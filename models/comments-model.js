const db = require('../db/connection.js');

const dropCommentById = async (comment_id) => {
    const response = await db.query(`DELETE FROM comments 
                    WHERE comment_id = $1 RETURNING *;`,[comment_id]); 

    if(response.rows.length === 0) {
        return Promise.reject({ status: 404, msg : `${comment_id} does not exist`})
    }
}

module.exports = { dropCommentById };