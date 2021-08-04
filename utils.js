const format = require('pg-format');
const db = require('./db/connection.js');

const checkExists = async (table, column, value) => {
    const queryStr = format('SELECT * FROM %I WHERE %I = $1;', table, column);
    const response = await db.query(queryStr, [value]);
    if(response.rows.length === 0) {
        return Promise.reject({ status: 404, msg: `${value} not found`})
    }
}

module.exports = { checkExists }