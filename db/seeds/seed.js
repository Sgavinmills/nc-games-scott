const db = require('../../db/connection.js');
const { dropTables, createTables, insertCategories } = require('./manageTables.js');

const seed = async ({ categoryData, commentData, reviewData, userData } ) => {
  
  await dropTables();
  console.log('4 tables dropped');
  await createTables();
  console.log('All 4 tables created');
  
  //insert categories data
  console.log(categoryData);
  insertCategories(categoryData);  
};



module.exports = seed;
