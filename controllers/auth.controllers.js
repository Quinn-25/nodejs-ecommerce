const db = require("../models");
const bcrypt = require("bcryptjs");
const User = db.user;
const Role = db.role;

module.exports = {
    loginAndSignupPage: (req, res) => {
        res.render('auth/auth', {
            layout: 'main'
        });
    },

    signupAuth: (req, res) => {
        console.log(`Username: ${req.body.username} Email: ${req.body.email} Password: ${req.body.password}`);
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 8)
        });
        user.save((err, user) => {
            if (err) {
                res.status(500).send({message: err});
                return;
            }
            if (req.body.roles) {
                Role.find({
                    name: {$in: req.body.roles}
                }, (err, roles) => {
                    if (err) {
                        res.status(500).send({message: err});
                        return;
                    }
                    user.roles = roles.map(role => role._id);
                    user.markModified(user.roles);
                    user.save(err => {
                        if (err) {
                            res.status(500).send({message: err});
                            return;
                        }

                        res.send({message: `User was registered successfully as ${req.body.roles}!`})
                    });
                });
            } else {
                Role.findOne({
                    name: "user"
                }, (err, role) => {
                    if (err) {
                        res.status(500).send({message: err});
                        return;
                    }
                    user.roles = [role._id];
                    user.markModified(user.roles);
                    user.save(err => {
                        if (err) {
                            res.status(500).send({message: err});
                            return;
                        }
                        req.session.User = {
                            username: user.username,
                            roles: user.roles
                        }

                        console.log(req.session.User);
                        console.log("Signup successfully!");
                        res.status(200).send(req.session.User);
                    });
                    console.log(`User: ${user}`);
                });
            }
        });
    },

    loginAuth: (req, res) => {
        console.log(`Username: ${req.body.username} Password: ${req.body.password}`);
        User.findOne({
            username: req.body.username
        })
            .exec((err, user) => {
                if (err) {
                    res.status(500).send({message: 500})
                }

                if (!user) {
                    return res.status(404).send({message: 404});
                }

                const isValidPassword = bcrypt.compareSync(
                    req.body.password,
                    user.password
                )

                if (!isValidPassword) {
                    return res.status(401).send({
                        accessToken: null,
                        message: 401
                    });
                }

                let authorities = [];
                Role.find({_id: {$in: user.roles}}, (err, roles) => {
                    if (err) {
                        res.status(500).send({message: "Role not found!"});
                        return;
                    }

                    for (let i = 0; i < user.roles.length; i++) {
                        authorities.push("ROLE_" + roles[i].name.toUpperCase());
                    }

                    req.session.User = {
                        username: user.username,
                        roles: authorities
                    }

                    console.log(req.session.User);
                    console.log("Login successfully!");
                    res.status(200).send(req.session.User);
                });
            });
    }
};