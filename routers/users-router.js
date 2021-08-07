const usersRouter = require('express').Router();
const { getUsers, getUsersByUserName, patchUsersByUserName, postUsers } = require('../controllers/users-controller.js')

usersRouter.route('/')
  .get(getUsers)
  .post(postUsers);
usersRouter.route('/:username')
  .get(getUsersByUserName)
  .patch(patchUsersByUserName);

module.exports = usersRouter;
