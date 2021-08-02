const db = require('../../db/connection.js');
const { createRefObj } = require('../utils/data-manipulation.js');
const { dropTables, createTables, insertCategories, insertUsers, insertReviews, insertComments} = require('./manageTables.js');

const seed = async ({ categoryData, commentData, reviewData, userData } ) => {
  
  await dropTables();
  console.log('4 tables dropped');
  await createTables();
  console.log('All 4 tables created');
  await insertCategories(categoryData);
  await insertUsers(userData);
  const reviewInsert = await insertReviews(reviewData);

  const refObj = createRefObj(reviewInsert, 'title', 'review_id');
  const newCommentData = [];
  
  commentData.forEach((comment) => {
    let copy = {...comment};
    copy.author = copy.created_by;
    delete copy.created_by;
    copy.review_id = refObj[copy.belongs_to];
    delete copy.belongs_to;
    newCommentData.push(copy);
    
  })
  const insertedComms = await insertComments(newCommentData);
  console.log(insertedComms);





  // console.log(commentData);
};


module.exports = seed;
