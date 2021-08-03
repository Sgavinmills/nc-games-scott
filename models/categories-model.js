const db = require('../db/connection.js');

const selectCategories = async () => {
    
    const queryResponse = await db.query('SELECT * FROM categories');
    return queryResponse.rows;

}

module.exports = { selectCategories };