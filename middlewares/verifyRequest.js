const db = require("../models");
const User = db.user;
const Role = db.role;
const Product = db.product;
const Category = db.category;

checkDuplicateUsernameOrEmail = (req, res, next) => {
    User.findOne({
        username: req.body.username
    }).exec((err, user) => {
        if (err) {
            res.status(500).send({message: err});
        }

        if (user) {
            return res.status(400).send("Username is not available!");
        }

        User.findOne({
            email: req.body.email
        }).exec((err, user) => {
            if (err) {
                res.status(500).send({message: err})
            }

            if (user) {
                res.status(400).send("Email is not available");
            }

            next();
        })
    })
}

checkExistCategory = (req, res, next) => {
    Category.findOne({name: req.body.category}, (err, category) => {
        if (err) {
            res.status(500).send({message: err});
            return;
        }

        if (!category) {
            res.status(404).send({message: "Category is not existed!"});
            return;
        }

        next();
    });
}
const verifyRequest = {
    checkDuplicateUsernameOrEmail,
    checkExistCategory
}

module.exports = verifyRequest;