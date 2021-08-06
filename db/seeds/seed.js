const db = require('../../db/connection.js');
const { createRefObj, updateObjectPropertyFromRef, formatData } = require('../utils/data-manipulation.js');
const { dropTables, insertData, createTables } = require('../utils/manageTables.js');


const seed = async ( { categoryData, commentData, reviewData, userData } ) => {
  //console.log('-----Seeding started-----\n')
  
  //drop all tables
  const tblNamesToDrop = ['comments', 'reviews', 'categories', 'users'];
  await dropTables(tblNamesToDrop);
  //console.log(`Dropped tables: ${tblNamesToDrop}`)

  //Build table column headers
  const categoriesColumns = [
    'slug VARCHAR(200) NOT NULL PRIMARY KEY',
    'description VARCHAR(500) NOT NULL',
  ];
  const usersColumns = [
    'username VARCHAR(200) NOT NULL PRIMARY KEY',
    'avatar_url VARCHAR(300)',
    'name VARCHAR(200) NOT NULL'
  ];
  const reviewsColumns = [
    'review_id SERIAL PRIMARY KEY',
    'title VARCHAR(100) COLLATE "C" NOT NULL',
    'review_body VARCHAR(5000) NOT NULL',
    'designer VARCHAR(100)',
    `review_img_url VARCHAR(1000) DEFAULT 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg'`,
    `votes INT DEFAULT 0 CHECK (votes >= 0)`,
    `category VARCHAR(200) REFERENCES categories(slug)`,
    `owner VARCHAR(200) NOT NULL REFERENCES users(username) ON DELETE CASCADE`,
    `created_at TIMESTAMP DEFAULT NOW()`
  ];
  const commentsColumns = [
    `comment_id SERIAL PRIMARY KEY`,
    `author VARCHAR(200) NOT NULL REFERENCES users(username) ON DELETE CASCADE`,
    `review_id INT REFERENCES reviews(review_id) ON DELETE CASCADE`,
    `votes INT DEFAULT 0`,
    `created_at TIMESTAMP DEFAULT NOW()`,
    `body VARCHAR(2000) NOT NULL`
  ];

  //create tables
  const tablesCreated = await createTables([['categories',categoriesColumns], ['users',usersColumns], ['reviews',reviewsColumns], ['comments',commentsColumns]]);
  //console.log(`${tablesCreated} tables created`);


  //insert all data
  const formattedCategoryData = formatData(categoryData) 
  const catTableCreation = ['categories', ['slug','description'], formattedCategoryData];

  const formattedUserData = formatData(userData);
  const userTableCreation = ['users', ['username','name','avatar_url'], formattedUserData];

  const formattedReviewData = formatData(reviewData);
  const reviewTableCreation = ['reviews', ['title', 'designer', 'owner', 'review_img_url', 'review_body', 'category', 'created_at', 'votes'], formattedReviewData]

  const insertedData = await insertData([catTableCreation, userTableCreation, reviewTableCreation]);
  //console.log(`Inserted data into ${insertedData.length} tables`);

  const refObj = createRefObj(insertedData[2], 'title', 'review_id');
  const fixedCommentData = updateObjectPropertyFromRef(commentData, refObj, 'belongs_to', 'review_id');
  const formattedCommentData = formatData(fixedCommentData);
  const commentTableCreation = ['comments', ['body', 'author', 'votes', 'created_at', 'review_id'], formattedCommentData];

  const insertedCommentData = await insertData([commentTableCreation])
  //console.log(`Inserted data into ${insertedCommentData.length} tables`);

};


module.exports = seed;


