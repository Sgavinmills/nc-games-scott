const usersRouter = require('express').Router();
const { getUsers, getUserByUserName } = require('../controllers/users-controller.js')

usersRouter.get('/', getUsers);
usersRouter.get('/:username', getUserByUserName);

module.exports = usersRouter;
