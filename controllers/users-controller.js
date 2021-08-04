const { response } = require('express');

selectUsers = require('../models/users-model.js')

const getUsers = (req, res, next) => {
    selectUsers().then((users) => {
        res.status(200).send({users});
    })
}

module.exports =  { getUsers };