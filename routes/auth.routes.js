const controller = require("../controllers/auth.controllers");
const { verifyRequest } = require("../middlewares");
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });

module.exports = (app) => {

    app.get("/login", controller.loginAndSignupPage);

    app.post("/login", urlencodedParser, controller.loginAuth);

    app.post("/signup",[verifyRequest.checkDuplicateUsernameOrEmail, urlencodedParser], controller.signupAuth);
}