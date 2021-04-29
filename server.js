const express = require('express');
const hbs = require('express-handlebars');
const path = require('path');
const bodyParser = require("body-parser");
const db = require("./models");
const dbConfig = require("./config/db.config");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 3000;

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

app.get('/set_session', (req, res) => {
    //set a object to session
    req.session.User = {
        username: 'test',
        role: 'user'
    }

    return res.status(200).json({status: 'success'})
})

app.get('/get_session', (req, res) => {
    //check session
    if(req.session.User){
        return res.status(200).json({status: 'success', session: req.session.User})
    }
    return res.status(200).json({status: 'error', session: 'No session'})
})

app.get('/destroy_session', (req, res) => {
    //destroy session
    req.session.destroy(function(err) {
        return res.status(200).json({status: 'success', session: 'cannot access session here'})
    })
})


// Connect to db
db.mongoose
    .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log("Successfully connect to MongoDB...");
    })
    .catch(err => {
        console.error("Connection error", err);
        process.exit();
    });

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