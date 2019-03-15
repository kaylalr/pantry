const express = require('express');
const app = express();
const url = require('url');
const PORT = process.env.PORT || 5000;
var session = require('client-sessions');
// const bodyParser = require('body-parser');

const {
    Pool
} = require('pg')

const connectionString = process.env.DATABASE_URL || "postgres://kwyatgkxstrdfg:c6f7f83e42450a3bc336092853545e287cde8e1d97e1184e3bcfefb963e5372c@ec2-54-225-95-183.compute-1.amazonaws.com:5432/dcieu6j73u775s?ssl=true"
const pool = new Pool({
    connectionString: connectionString
});

app.use(session({
    cookieName: 'session',
    secret: 'thisisarandomstringandihavenoideawhyineedit',
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
}));
//   app.use(bodyParser);

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

// var sql = "SELECT * FROM users";

// pool.query(sql, function (err, result) {
//     // If an error occurred...
//     if (err) {
//         console.log("Error in query: ")
//         console.log(err);
//     }

//     // Log this to the console for debugging purposes.
//     console.log("Back from DB with result:");
//     console.log(result.rows);
// });

app.get("/", function (req, res) {
    res.render('index');
});
app.get("/login", function (req, res) {
    res.render('login');
});
app.post("/login", function (req, res) {
    // console.log("res.body.username: "+req.body.username);
    //res.render('');
});

app.get("/food", function (req, res) {
    // ??? is this the best way to do this?  look at the getAllFoods function
    getAllFoods(function (result) {
        // console.log("food DB result: ")
        // console.log(result);
        const params = {
            foods: result
        };
        console.log(params);
        // for(i=0; i<result.length; i++) {
        // console.log("result " + i + ":");
        // console.log(result[i]);
        // }
        res.render("food", params);
    })
});


app.get("/addFood", function (req, res) {
    getQuantityTypes(function (result1) {
        getFoodGroups(function (result2) {
            const params = {
                quantity_types: result1,
                food_groups: result2
            };
            console.log(params);
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

    // console.log("food_name: "+food_name+", food_type: "+food_type+", quantity_num: "+quantity_num+", quantity_type: "+quantity_type+", expiration: "+expiration+", description: "+description);
    var insertSQL = "INSERT INTO foods values (default,$1,1,$2,$3,$4,$5,$6)";
    pool.query(insertSQL, [food_name, food_type, quantity_num, quantity_type, expiration, description], function (err, result) {
        // If an error occurred...
        if (err) {
            console.log("Error in query: ")
            console.log(err);
        }
    })
})

app.get("/bootstrap", function (req, res) {
    res.render("index-new");
})

function getAllFoods(callback) {
    // var getAllFoods = "SELECT * FROM foods";
    var getAllFoods = "select f.food_name, f.foodgroup_id, f.quantity_num, f.expiration, qt.quantity_type_name FROM foods f JOIN quantity_types qt ON qt.quantity_type_id = f.quantity_type_id;"
    pool.query(getAllFoods, function (err, result) {
        if (err) {
            console.log("Error in query: ")
            console.log(err)
        }
        callback(result.rows);
    })
}

function getQuantityTypes(callback) {
    var getQuantityTypes = "SELECT * FROM quantity_types";
    pool.query(getQuantityTypes, function (err, result) {
        if (err) {
            console.log("Error in query: ")
            console.log(err)
        }
        callback(result.rows);
    })
}

function getFoodGroups(callback) {
    var getQuantityTypes = "SELECT * FROM food_groups";
    pool.query(getQuantityTypes, function (err, result) {
        if (err) {
            console.log("Error in query: ")
            console.log(err)
        }
        callback(result.rows);
    })
}

// app.get("/getPerson", function (req, res) {
//     let inputs = url.parse(req.url, true);
//     let personId = inputs.query.id;

//     var getPersonById = "SELECT * FROM person WHERE id = $1";

//     pool.query(getPersonById, [personId], function (err, result) {
//         // If an error occurred...
//         if (err) {
//             console.log("Error in query: ")
//             console.log(err);
//         }

//         // Log this to the console for debugging purposes.
//         console.log("Back from DB with result:");
//         console.log(result.rows);

//         res.json(result.rows);
//     })
// });

app.listen(PORT, function () {
    console.log("Server is running...");
});