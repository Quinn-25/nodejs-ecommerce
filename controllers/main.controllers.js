const db = require("../models");
const User = db.user;
const Product = db.product;
const Category = db.category;

module.exports = {
    getHomepage: (req, res) => {
        let sessionUser = req.session.User;
        let displayHeader, displayName, displayRole, manageProduct, accountDisplay;

        if (sessionUser) {
            displayName = sessionUser.username;
            displayRole = "";
            manageProduct = "";
            accountDisplay = "<li><a href=\"/user\">Account</a></li>";

            if (sessionUser.roles.includes('ROLE_ADMIN')) {
                displayRole = "ADMIN";
                manageProduct = "<li><a href=\"/manage-product\">MANAGE PRODUCT</a></li>"
            }
            displayHeader = `<p><a href="/user">Welcome ${displayRole} ${displayName}</a></p>`
        } else {
            displayHeader = "<p><a href=\"/login\">Login & Signup</a></p>";
        }

        res.render('index', {
            displayHeader: displayHeader,
            manageProduct: manageProduct,
            accountDisplay: accountDisplay
        });
    },

    getErrorPage: (req, res) => {
        res.render('auth/error');
    },

    getLogout: (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                return res.status(404).send({message: err})
            }
            res.redirect("/index");
        });
    },

    getAllUser: (req, res) => {
        let sessionUser = req.session.User;
        User.findOne({username: sessionUser.username}, (err, user) => {
            if (err) {
                res.status(500).send({message: err});
                return;
            }
            res.render('account/my-account', {
                name: user.username,
                email: user.email,
                password: user.password
            });
        })
    },

    getProducts: (req, res) => {
        Product.find({}).lean().exec((err, product) => {
            if (err) {
                res.status(500).send({message: err});
                return;
            }

            Category.find({}).lean().exec((err, categories) => {
                if (err) {
                    res.status(500).send({message: err});
                    return;
                }

                res.render('shop/shopPage', {
                    categories: categories,
                    products: product
                });
            })
        });
    },

    getCart: (req, res) => {
        let sessionUser = req.session.User;
        let cartList = "";
        let cartHeader = "<h1>Please login to add to Cart</h1>";
        let cartTotals = "<h1><div class=\"cart-buttons\">\n" +
            "                        <a href=\"/login\">Login</a>\n" +
            "                    </div></h1>"
        if (sessionUser) {
            User.findOne(
                {username: sessionUser.username})
                .exec((err, user) => {
                    if (err) {
                        res.status(500).send({message: err});
                        return;
                    }

                    Product.find({_id: {$in: user.cart}})
                        .lean()
                        .exec((err, products) => {
                            if (err) {
                                res.status(500).send({message: err});
                                return;
                            }

                            cartHeader = "<thead>\n" +
                                "                            <tr>\n" +
                                "                                <th class=\"pro-thumbnail\">Image</th>\n" +
                                "                                <th class=\"pro-title\">Product</th>\n" +
                                "                                <th class=\"pro-price\">Price</th>\n" +
                                "                                <th class=\"pro-quantity\">Quantity</th>\n" +
                                "                                <th class=\"pro-subtotal\">Total</th>\n" +
                                "                                <th class=\"pro-remove\">Remove</th>\n" +
                                "                            </tr>\n" +
                                "                            </thead>"
                            cartTotals = "<div class=\"col-lg-8 col-md-7 col-12 mb-40\">\n" +
                                "                    <div class=\"cart-buttons mb-30\">\n" +
                                "                        <a href=\"/products\">Continue Shopping</a>\n" +
                                "                    </div>\n" +
                                "                    <div class=\"cart-coupon\">\n" +
                                "                        <h4>Coupon</h4>\n" +
                                "                        <p>Enter your coupon code if you have one.</p>\n" +
                                "                        <div class=\"cuppon-form\">\n" +
                                "                            <input type=\"text\" placeholder=\"Coupon code\"/>\n" +
                                "                            <input type=\"submit\" value=\"Apply Coupon\"/>\n" +
                                "                        </div>\n" +
                                "                    </div>\n" +
                                "                </div>\n" +
                                "                <div class=\"col-lg-4 col-md-5 col-12 mb-40\">\n" +
                                "                    <div class=\"cart-total fix\">\n" +
                                "                        <h3>Cart Totals</h3>\n" +
                                "                        <table>\n" +
                                "                            <tbody>\n" +
                                "                            <tr class=\"cart-subtotal\">\n" +
                                "                                <th>Subtotal</th>\n" +
                                "                                <td><span class=\"amount\">$306.00</span></td>\n" +
                                "                            </tr>\n" +
                                "                            <tr class=\"order-total\">\n" +
                                "                                <th>Total</th>\n" +
                                "                                <td>\n" +
                                "                                    <strong><span class=\"amount\">$306.00</span></strong>\n" +
                                "                                </td>\n" +
                                "                            </tr>\n" +
                                "                            </tbody>\n" +
                                "                        </table>\n" +
                                "                        <div class=\"proceed-to-checkout section mt-30\">\n" +
                                "                            <a href=\"#\">Proceed to Checkout</a>\n" +
                                "                        </div>\n" +
                                "                    </div>\n" +
                                "                </div>"

                            if (products.length === 0) {
                                cartHeader = "<h1>The cart is empty!</h1>";
                                cartTotals = "<div class=\"cart-buttons mb-30\">\n" +
                                    "                        <a href=\"/products\">Continue Shopping</a>\n" +
                                    "                    </div>"
                            } else cartList = products;

                            res.render("shop/cart", {
                                cartHeader: cartHeader,
                                cartBody: cartList,
                                cartTotals: cartTotals
                            });
                        })
                });
        } else {
            res.render("shop/cart", {
                cartHeader: cartHeader,
                cartTotals: cartTotals
            });
        }
    },

    addToCart: (req, res) => {
        let sessionUser = req.session.User;
        if (sessionUser) {
            User.findOne({username: sessionUser.username})
                .exec((err, user) => {
                    if (err) {
                        res.status(500).send({message: err});
                        return;
                    }

                    let str = req.body.productId;
                    let requestProductId = str.split("_").pop();

                    user.cart.push(requestProductId);
                    user.markModified(user.cart);
                    user.save(err => {
                        if (err) {
                            res.status(500).send({message: err});
                        }
                        res.send({message: "Product is added to Cart!"})
                    })
                });
        } else {
            res.writeHead(301, {
                Location: "/cart"
            });
            res.end();
        }

    },

    deleteFromCart: (req, res) => {
        let sessionUser = req.session.User;
        if (sessionUser) {
            User.findOne({username: sessionUser.username})
                .exec((err, user) => {
                    if (err) {
                        res.status(500).send({message: err});
                        return;
                    }
                    let str = req.body.productId;
                    let requestProductId = str.split("_").pop();
                    user.cart = user.cart.filter(product => product.toString() !== requestProductId.toString());


                    user.markModified(user.cart);
                    user.update( {
                        $set: {
                            cart: user.cart
                        }
                    }).then(err => {
                        res.send({message: "Product is deleted from Cart!"})
                    });

                });
        }
    },

    getSingleProduct: (req, res) => {
        let productSession = req.session.Product;
        res.render("shop/singleProduct", {
            name: productSession.name,
            price: productSession.price,
            image: productSession.image,
            description: productSession.description
        });
    },

    viewProduct: (req, res) => {
        let str = req.body.productId;
        let requestProductId = str.split("_").pop();

        Product.findOne({_id: requestProductId}).lean().exec((err, product) => {
            if (err) {
                res.status(500).send({message: err});
                return;
            }
            // console.log(product);

            req.session.Product = {
                name: product.name,
                price: product.price,
                image: product.image,
                description: product.description
            }
            res.status(200).send(req.session.Product);
        });
    },

    manageProduct: (req, res) => {
        Product.find({}).lean().exec((err, product) => {
            if (err) {
                res.status(500).send({message: err});
                return;
            }

            res.render('product/manage-product', {
                products: product
            });

        });
    },

    addProduct: (req, res) => {
        console.log(`Product: ${req.body.name} Price: ${req.body.price} Category: ${req.body.category}`);
        if (!req.body.name || !req.body.price || !req.body.description || !req.body.image || !req.body.category) {
            res.status(500).send("Cannot add product!");
            return;
        }
        const product = new Product({
            name: req.body.name,
            price: req.body.price,
            image: req.body.image,
            description: req.body.description
        });
        product.save(err => {
            if (err) {
                res.status(500).send({message: err})
            }
            Category.findOne({
                name: req.body.category
            }, (err, category) => {
                if (err) {
                    res.status(500).send({message: err});
                    return;
                }
                product.category = category.name;
                product.save(err => {
                    if (err) {
                        res.status(500).send({message: err});
                        return
                    }
                    res.send({message: `Product added!`});
                });
            });
        });
    },

    addCategory: (req, res) => {
        console.log(`Category: ${req.body.name}`);
        const category = new Category({
            name: req.body.name
        });
        category.save(err => {
            if (err) {
                res.status(500).send({message: err});
            }
            res.send({message: "Category added!"})
        })
    }
};

