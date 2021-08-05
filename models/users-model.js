const db = require('../db/connection.js');


const selectUsers = async () => {
    const qryResponse = await db.query('SELECT username FROM users');
    return qryResponse.rows;
}

const selectUserByUserName = async (username) => {
    const qryResponse = await db.query(`SELECT * FROM users
                                        WHERE username = $1`, [username]);
    if(qryResponse.rows.length === 0) {
        return Promise.reject({ status : 404, msg : `${username} not found`})
    }
    return qryResponse.rows[0];
}

module.exports = { selectUsers, selectUserByUserName };