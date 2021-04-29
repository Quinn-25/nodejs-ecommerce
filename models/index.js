const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

// for user
db.user = require("./user.models");
db.role = require("./role.models");
db.ROLES = ["user", "admin"];

// for product
db.product = require("./product.models");
db.category = require("./category.models");

module.exports = db;



