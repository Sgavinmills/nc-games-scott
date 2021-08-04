const db = require('../db/connection.js');


const selectUsers = async () => {
    const qryResponse = await db.query('SELECT username FROM users');
    return qryResponse.rows;
}

module.exports = selectUsers;