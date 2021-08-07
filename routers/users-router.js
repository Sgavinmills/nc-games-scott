const usersRouter = require('express').Router();
const { getUsers, getUsersByUserName, patchUsersByUserName } = require('../controllers/users-controller.js')

usersRouter.get('/', getUsers);
usersRouter.route('/:username')
  .get(getUsersByUserName)
  .patch(patchUsersByUserName);

module.exports = usersRouter;
