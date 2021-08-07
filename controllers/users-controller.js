
const { updateUsersByUserName, selectUsers, selectUsersByUserName, insertUsers } = require('../models/users-model.js')

const getUsers = (req, res, next) => {
    selectUsers().then((users) => {
        res.status(200).send({users});
    }).catch(err => {
        console.log(err);
        next(err);
    })
}

const getUsersByUserName = (req, res, next) => {
    const { username } = req.params;
    selectUsersByUserName(username).then((users) => {
        res.status(200).send({users});
    }).catch(err => {
        next(err);
    })
}

const patchUsersByUserName = (req, res, next) => {
    const { username } = req.params;
    updateUsersByUserName(username, req.body).then((users) => {
        res.status(200).send({users});
    }).catch(err => {
        next(err);
    })
}

const postUsers = (req, res, next) => {
    insertUsers(req.body).then(users => {
        res.status(201).send({users});
    }).catch(err => {
        next(err);
    })
}
module.exports =  { getUsers, getUsersByUserName, patchUsersByUserName, postUsers };