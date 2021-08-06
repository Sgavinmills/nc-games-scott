const db = require('../db/connection.js');
const { checkMissingProperty, checkExtraProperties } = require('../utils.js');

const selectCategories = async () => {
    const queryResponse = await db.query('SELECT * FROM categories');
    return queryResponse.rows;
}

const insertCategories = async (body) => {
    const { slug, description } = body;

    const requiredProperties = ['slug', 'description'];
    const providedProperties = Object.keys(body);

    await checkMissingProperty(requiredProperties, providedProperties);
    await checkExtraProperties(requiredProperties, providedProperties);
    const queryResponse = await db.query(`INSERT into categories
                                        (slug, description)
                                        VALUES
                                        ($1, $2)
                                        RETURNING *;`, [slug, description])
    return queryResponse.rows[0];
}

module.exports = { selectCategories, insertCategories };