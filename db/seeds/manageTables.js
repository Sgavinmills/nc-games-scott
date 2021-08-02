const db = require('../../db/connection.js');
const { values } = require('../data/development-data/categories.js');


const dropTables = async () => {
    await db.query('DROP TABLE IF EXISTS comments');
    await db.query('DROP TABLE IF EXISTS reviews');
    await db.query('DROP TABLE IF EXISTS categories');
    await db.query('DROP TABLE IF EXISTS users');
}

const createTables = async () => {

    await db.query(`CREATE TABLE categories
    (slug VARCHAR(200) NOT NULL PRIMARY KEY,
    description TEXT);`)

    await db.query(`CREATE TABLE users
    (username VARCHAR(200) NOT NULL PRIMARY KEY,
    avatar_url TEXT,
    name VARCHAR(100));`)


    await db.query(`CREATE TABLE reviews
    (review_id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    review_body TEXT NOT NULL,
    designer TEXT,
    review_img_url TEXT DEFAULT 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg',
    votes INT DEFAULT 0,
    category VARCHAR(200) REFERENCES categories(slug),
    owner VARCHAR(200) REFERENCES users(username) ON DELETE CASCADE,
    created_at TIMESTAMP);`)

    await db.query(`CREATE TABLE comments
    (comment_id SERIAL PRIMARY KEY,
    author VARCHAR(200) REFERENCES users(username) ON DELETE CASCADE,
    review_id INT REFERENCES reviews(review_id),
    votes INT DEFAULT 0,
    created_at TIMESTAMP,
    body TEXT NOT NULL);`)

}

const insertCategories = async (categoryData) => {
    const formattedCategoryData = formatData(categoryData) //formatData returns array of property values

    const queryStr = format(`INSERT INTO categories
        ('slug' 'description')
        VALUES
        %L 
         RETURNING *;`, formattedCategoryData);


     const insertedCategoryData = await db.query(queryStr)
     return insertedCategoryData;

}

module.exports = { dropTables, createTables };