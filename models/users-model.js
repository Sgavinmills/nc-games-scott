const db = require('../db/connection.js');


const selectUsers = async () => {
    const qryResponse = await db.query('SELECT username FROM users');
    console.log(qryResponse);
    console.log('users qry response ^^^^^');
    return qryResponse.rows;
}

module.exports = selectUsers;