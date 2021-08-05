
const { selectUsers, selectUserByUserName } = require('../models/users-model.js')

const getUsers = (req, res, next) => {
    selectUsers().then((users) => {
        res.status(200).send({users});
    }).catch(err => {
        console.log(err);
        next(err);
    })
}

const getUserByUserName = (req, res, next) => {
    const { username } = req.params;
    selectUserByUserName(username).then((users) => {
        res.status(200).send({users});
    }).catch(err => {
        next(err);
    })
}

module.exports =  { getUsers, getUserByUserName };