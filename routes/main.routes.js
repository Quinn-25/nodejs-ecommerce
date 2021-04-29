const controller = require("../controllers/main.controllers");

module.exports = (app) => {

// route for main page
    app.get(["/index", "/"], controller.getHomepage);
    app.get("/404", controller.getErrorPage);
    app.get("/user", controller.getAllUser);
    app.get("/logout", controller.getLogout);

// route for product page
    app.get("/products", controller.getProducts);
    app.get("/product", controller.getSingleProduct);
    app.post("/product", controller.viewProduct);

// route for cart
    app.get("/cart", controller.getCart);
    app.post("/add-to-cart", controller.addToCart);
    app.post("/delete-from-cart", controller.deleteFromCart);

// route for product (admin)
    app.get("/manage-product", controller.manageProduct);
    app.post("/product/add", controller.addProduct);
    // app.post("/product/delete", controller.deleteProduct);
    // app.post("/product/update", controller.updateProduct);

    app.post("/category/add", controller.addCategory);
    // app.post("/category/delete", controller.deleteCategory);
    // app.post("/category/update", controller.updateCategory);
};