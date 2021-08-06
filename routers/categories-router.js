const { getCategories, postCategories } = require('../controllers/categories-controller');

const categoriesRouter = require('express').Router();

categoriesRouter.route('/')
  .get(getCategories)
  .post(postCategories);

module.exports = categoriesRouter;