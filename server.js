const express = require('express');
const hbs = require('express-handlebars');
const path = require('path');
const bodyParser = require("body-parser");
const db = require("./models");
const Role = db.role;
const dbConfig = require("./config/db.config");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 3000;
const uri = `mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`
const uriForCloud = 'mongodb+srv://quanganh:quanganh@cluster0.lakf5.mongodb.net/quinn_db'

app.engine( 'hbs', hbs( {
    extname: 'hbs',
    // defaultLayout: 'main',
    partialsDir: __dirname + '/views/partials/'
}));

app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, '/')));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// create session
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: 'somesecret',
    cookie: { maxAge: 60000 }
}));

// Connect to db
db.mongoose
    .connect(uriForCloud, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log("Successfully connect to MongoDB...");
        initial();
    })
    .catch(err => {
        console.error("Connection error", err);
        process.exit();
    });

// create initial user's roles
function initial() {
    Role.estimatedDocumentCount((err, count) => {
        if (!err && count === 0) {
            new Role({
                name: "user"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }

                console.log("added 'user' to roles collection");
            });

            new Role({
                name: "admin"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }

                console.log("added 'admin' to roles collection");
            });
        }
    });
}

// Routes
require("./routes/auth.routes")(app);

require('./routes/main.routes')(app);

app.get('/home', (req, res) => {
    res.render('index', {
        content: "Hello, this is homepage"
    });
})

console.log("server is running");
app.listen(PORT);