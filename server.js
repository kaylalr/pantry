const express = require('express');
const app = express();
const url = require('url');
const PORT = process.env.PORT || 5000;
const session = require('express-session');
let stayLoggedin = true;
// const bodyParser = require('body-parser');

const {
    Pool
} = require('pg')

const connectionString = process.env.DATABASE_URL || "postgres://kwyatgkxstrdfg:c6f7f83e42450a3bc336092853545e287cde8e1d97e1184e3bcfefb963e5372c@ec2-54-225-95-183.compute-1.amazonaws.com:5432/dcieu6j73u775s?ssl=true"
const pool = new Pool({
    connectionString: connectionString
});

const db = require('./model/databaseConnect.js');
const f = require('./functions/functions.js');

app.use(session({
    // cookieName: 'session',
    key: 'user_sid',
    secret: 'thisisarandomstringandihavenoideawhyineedit',
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
    cookie: {
        expires: 600000
    }
}));
// This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
// This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
// app.use((req, res, next) => {
//     if (req.cookies.user_sid && !req.session.user) {
//         res.clearCookie('user_sid');        
//     }
//     next();
// })

// middleware function to check for logged-in users
// var sessionChecker = (req, res, next) => {
//     if (req.session.user && req.cookies.user_sid) {
//         res.redirect('/food');
//     } else {
//         next();
//     }    
// };
app.use(function (req, res, next) {

    res.locals.user = req.session.user;
    res.locals.loggedin = stayLoggedin;
    // res.locals.authenticated = ! req.user.anonymous;
    next();
});

app.use(express.static('bootstrap'));
app.use(express.static('public'));
/* these two allow you to get data from
 *  the body on a post     */
app.use(express.json());
app.use(express.urlencoded());

// tell express where your views are going to be
app.set("views", "views");
// telling express you are using ejs
app.set("view engine", "ejs");


app.get("/", function (req, res) {
    // console.log(req.session.user)

    res.render('index');
});
app.get("/login", function (req, res) {
    res.render('login');
});
app.post("/login", function (req, res) {
    let username = req.body.username;
    let password = req.body.password;
    let variables = {
        username: username,
        password: password
    }
    db.verifyUser(variables, function (result) {
        if (result.length != 1) {
            let message = "Please check your username and password."
            let params = {
                message: message
            }
            res.render('login', params);
        }
        let checkPass = f.checkPassword(result[0], password);
        if (!checkPass) {
            let message = "Please check your username and password."
            let params = {
                message: message
            }
            res.render('login', params);
        } else {
            req.session.user = result[0];
            // console.log("session username: " + req.session.user.user_name);
            res.redirect("/food");
        }
    })
});
app.get("/food", function (req, res) {
    if (req.session.user == 'undefined' || req.session.user == null && stayLoggedin == false) {
        res.redirect("/");
    }
    // ??? is this the best way to do this?  look at the getAllFoods function
    db.getAllFoods(function (result) {
        const params = {
            foods: result
        };
        res.render("food", params);
    })
});
app.post("/food/:id/:quantity", function (req, res) {
    let id = req.params.id;
    let quantity = req.params.quantity;
    db.updateQuantity(id, quantity);
})
app.get("/addFood", function (req, res) {
    if (req.session.user == 'undefined' || req.session.user == null && stayLoggedin == false) {
        res.redirect("/");
    }
    db.getQuantityTypes(function (result1) {
        db.getFoodGroups(function (result2) {
            const params = {
                quantity_types: result1,
                food_groups: result2
            };
            // console.log(params);
            res.render("addFood", params);
        })

    })
})
app.post("/addFood", function (req, res) {
    let food_name = req.body.food_name;
    let food_type = req.body.food_type;
    let quantity_num = req.body.quantity_num;
    let quantity_type = req.body.quantity_type;
    let expiration = req.body.expiration;
    let description = req.body.description;

    var insertSQL = "INSERT INTO foods values (default,$1,1,$2,$3,$4,$5,$6)";
    pool.query(insertSQL, [food_name, food_type, quantity_num, quantity_type, expiration, description], function (err, result) {
        // If an error occurred...
        if (err) {
            console.log("Error in addFood query: ")
            console.log(err);
        }
    })
});
app.get("/edit/:id", function (req, res) {
    if (req.session.user == 'undefined' || req.session.user == null && stayLoggedin == false) {
        res.redirect("/");
    }
    let id = req.params.id;
    db.getQuantityTypes(function (result1) {
        db.getFoodGroups(function (result2) {
            db.getFoodById(id, function (result3) {
                const params = {
                    food: result3[0],
                    quantity_types: result1,
                    food_groups: result2
                };
                // console.log(params);
                res.render("editFood", params);
            })
        })
    })
});
// SHOULD THIS BE A PUT? HOW DO YOU DO THAT?
app.post("/edit/:id", function (req, res) {
    // WHAT IF SOMEONE CHANGED THE ID AND THEN SUBMITTED THE FORM?
    let id = req.params.id;
    let food_name = req.body.food_name;
    let food_type = req.body.food_type;
    let quantity_num = req.body.quantity_num;
    let quantity_type = req.body.quantity_type;
    let expiration = req.body.expiration;
    let description = req.body.description;

    // console.log("post edit id: " + id);

    var updateFoodSQL = "UPDATE foods SET food_name = $1, foodgroup_id = $2, quantity_num = $3, quantity_type_id = $4, expiration = $5, description = $6 WHERE food_id = $7";
    pool.query(updateFoodSQL, [food_name, food_type, quantity_num, quantity_type, expiration, description, id], function (err, result) {
        if (err) {
            console.log("Error in update food query: ")
            console.log(err);
        }
        // how to re-route to /food - I think this works.
        res.redirect("/food");
    })
})
app.delete("/delete/:id", function (req, res) {
    let id = req.params.id;
    // console.log("delete " + id);
    db.deleteFood(id, function () {
        // WHY DOESN'T THIS WORK??
        // res.redirect("/food");
    })
})
app.listen(PORT, function () {
    console.log("Server is running...");
});