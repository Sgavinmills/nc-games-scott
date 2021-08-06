const { selectCategories, insertCategories } = require("../models/categories-model");

const getCategories = (req, res, next) => {
    selectCategories().then(categories => {
        res.status(200).send({categories});
    })
}

const postCategories = (req, res, next) => {
    insertCategories(req.body).then(categories => {
        res.status(201).send({categories});
    }).catch(err => {
        next(err);
    })
}

module.exports = { getCategories, postCategories };