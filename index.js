const express = require('express');
const app = express();
// const url = require('url');
const PORT = process.env.PORT || 5000;
const session = require('express-session');
let stayLoggedin = false;

const {
    Pool
} = require('pg')

// const connectionString = process.env.DATABASE_URL || "postgres://kwyatgkxstrdfg:c6f7f83e42450a3bc336092853545e287cde8e1d97e1184e3bcfefb963e5372c@ec2-54-225-95-183.compute-1.amazonaws.com:5432/dcieu6j73u775s?ssl=true"
const connectionString = process.env.DATABASE_URL || "postgres://mbwomgmoqbepza:966aeb81a74e1d7966e4fde69c75a42941b5bbf39567cb25c73341f64e0a44d7@ec2-34-195-169-25.compute-1.amazonaws.com:5432/dl7jseb2e0n12"
const pool = new Pool({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

const db = require('./model/databaseConnect.js');
const fdb = require('./model/foodDatabaseConnect.js');
const rdb = require('./model/recipeDatabaseConnect.js');
const functions = require('./functions/functions.js');
// const foodFunctions = require('./functions/foodFunctions.js');
// const recipeFunctions = require('./functions/recipeFunctions.js');

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
    res.render('index');
});
app.get("/login", function (req, res) {
    res.render('login');
});
app.post("/login", loginPost);

app.get("/signup", function (req, res) {
    res.render('signup');
})

app.post("/signup", function (req, res) {

    let firstname = req.body.firstname;
    let lastname = req.body.lastname;
    let email = req.body.email;
    let username = req.body.username;
    let password = req.body.password;
    const params = [
        username,
        firstname,
        lastname,
        password,
        email
    ]

    // check if the username is already being used
    db.verifyUser(username, function(result) {
        // console.log(result.length);
        if(result.length == 1) {
            let message = "That username is already in use. Please choose a different one."
            const params = {
                message: message
            }
            res.render('signup', params)
        } else {
            db.insertUser(params, function(result) {
                let message = "Thank you for signing up! Please log in."
                const params = {
                    message: message
                }
                res.render("login", params);
            })
        }
    })
})

app.get("/food", verifyLogin, getFood);

app.post("/food/:id/:quantity", verifyLogin, foodQuantityPost)

app.get("/addFood", verifyLogin, addFoodGet)

app.post("/addFood", verifyLogin, addFoodPost);

app.get("/edit/:id", verifyLogin, editFoodGet);
// SHOULD THIS BE A PUT? HOW DO YOU DO THAT?
app.post("/edit/:id", verifyLogin, editFoodPost);

app.get("/recipes", verifyLogin, getRecipes);

app.get("/recipes/:id", verifyLogin, recipeByIdGet);

app.get("/addRecipe", verifyLogin, addRecipeGet);

app.post("/addRecipe", verifyLogin, addRecipePost);

app.get("/editRecipe/:id", verifyLogin, editRecipeGet);

app.post("/editRecipe/:id", verifyLogin, editRecipePost);

app.get("/findFood", verifyLogin, findFoodGet);

app.delete("/delete/:id", verifyLogin, foodDelete);

app.get("/logout", verifyLogin, function(req, res) {
    req.session.destroy();
    res.locals.user = undefined;
    res.locals.loggedin = false;
    res.redirect("/")
});

app.get("/account", verifyLogin, function (req, res) {
    res.render('account');
})

app.get("/account/edit", verifyLogin, function (req, res) {
    res.render('accountEdit');
})

app.listen(PORT, function () {
    console.log("Server is running...");
});

function verifyLogin(req, res, next) {
    if (req.session.user || stayLoggedin == true) {
        if (req.session.user == undefined) {
            req.session.user = { user_id: 1,
                user_name: 'kaylah',
                user_firstname: 'Kayla',
                user_lastname: 'Hellbusch',
                user_password: 'myPassword4$',
                user_email: 'klr3of8@gmail.com' }
        }
        // console.log(req.session.user)
        next();
    } else {
        // var result = {success: false, message: "Didn't work"}
        // res.status(401).json(result);
        res.redirect("/")
    }
}

function loginPost(req, res) {
    let username = req.body.username;
    let password = req.body.password;
    db.verifyUser(username, function (result) {
        if (result.length != 1) {
            let message = "Please check your username and password."
            let params = {
                message: message
            }
            res.render('login', params);
            return;
        }
        let checkPass = functions.checkPassword(result[0], password);
        if (!checkPass) {
            let message = "Please check your username and password."
            let params = {
                message: message
            }
            res.render('login', params);
        } else {
            req.session.user = result[0];
            res.redirect("/food");
        }
    })
}

function getFood(req, res) {
    // ??? is this the best way to do this?  look at the getAllFoods function
    fdb.getFoodsByUserId(req.session.user.user_id, function (result) {
        let message = ""
        if (result.length == 0) {
            message = "You have no food! <a href='/addFood'>Add Food</a> to your pantry!"
        }        
        let today = new Date();
        result.forEach(food => {
            food["expired"] = false;
            if (today > food.expiration) {
                food.expired = true;
            }
            food.expiration = functions.formatDate(food.expiration);
        })
        const params = {
            message: message,
            foods: result
        };
        res.render("food", params);
    })
}

function foodQuantityPost(req, res) {
    let id = req.params.id;
    let quantity = req.params.quantity;
    fdb.updateQuantity(id, quantity);
}

function addFoodGet(req, res) {
    fdb.getQuantityTypes(function (result1) {
        fdb.getFoodGroups(function (result2) {
            const params = {
                quantity_types: result1,
                food_groups: result2
            };
            res.render("addFood", params);
        })

    })
}

function addFoodPost(req, res) {
    let food_name = req.body.food_name;
    let food_type = req.body.food_type;
    let quantity_num = req.body.quantity_num;
    let quantity_type = req.body.quantity_type;
    let expiration = req.body.expiration;
    let description = req.body.description;
    let id = req.session.user.user_id;

    var insertSQL = "INSERT INTO foods values (default,$1,$7,$2,$3,$4,$5,$6)";
    pool.query(insertSQL, [food_name, food_type, quantity_num, quantity_type, expiration, description, id], function (err, result) {
        // If an error occurred...
        if (err) {
            console.log("Error in addFood query: ")
            console.log(err);
        }
        res.redirect("/food");
    })
}

function editFoodGet(req, res) {
    let id = req.params.id;
    fdb.getQuantityTypes(function (result1) {
        fdb.getFoodGroups(function (result2) {
            fdb.getFoodById(id, function (result3) {
                const params = {
                    food: result3[0],
                    quantity_types: result1,
                    food_groups: result2
                };
                res.render("editFood", params);
            })
        })
    })
}

function editFoodPost(req, res) {
    // WHAT IF SOMEONE CHANGED THE ID AND THEN SUBMITTED THE FORM?
    let id = req.params.id;
    let food_name = req.body.food_name;
    let food_type = req.body.food_type;
    let quantity_num = req.body.quantity_num;
    let quantity_type = req.body.quantity_type;
    let expiration = req.body.expiration;
    let description = req.body.description;

    var updateFoodSQL = "UPDATE foods SET food_name = $1, foodgroup_id = $2, quantity_num = $3, quantity_type_id = $4, expiration = $5, description = $6 WHERE food_id = $7";
    pool.query(updateFoodSQL, [food_name, food_type, quantity_num, quantity_type, expiration, description, id], function (err, result) {
        if (err) {
            console.log("Error in update food query: ")
            console.log(err);
        }
        res.redirect("/food");
    })
}

function foodDelete(req, res) {
    let id = req.params.id;
    fdb.deleteFood(id, function () {
        // WHY DOESN'T THIS WORK??
        console.log("getting to food delete")
        // res.redirect("/food");
    })
}

function getRecipes(req, res) {
    rdb.getAllRecipesByUserId(req.session.user.user_id, function (result) {
        let message = ""
        if(result.length == 0) {
            message = "You have no recipes! <a href='/addRecipe'>Add Recipes</a> to your collection!"
        }
        const params = {
            message: message,
            recipes: result
        }
        res.render("recipes", params);
    })
}

function recipeByIdGet(req, res) {
    id = req.params.id;
    rdb.getRecipeById(id, function (result1) {
        rdb.getIngredientsByRecipeId(id, function (result2) {
            rdb.getInstructionsByRecipeId(id, function (result3) {
                result2.forEach(num => {
                    num.quantity_num = functions.formatQuantity(num.quantity_num);
                })
                const params = {
                    recipe: result1,
                    ingredients: result2,
                    instructions: result3
                }
                res.render("viewRecipe", params);
            })
        })
    })
}

function addRecipeGet(req, res) {
    fdb.getQuantityTypes(function (result) {
        const params = {
            quantity_types: result
        }
        res.render("addRecipe", params);
    })
}

function addRecipePost(req, res) {
    let ingNum = req.body.ingCount;
    let dirNum = req.body.dirCount;
    let dirCount = req.body.instructionNumber;
    var curIng = 0;
    let curDir = 0;
    const recipeParams = [req.body.recipe_name, req.body.author, 1];
    console.log(recipeParams)
    rdb.insertRecipe(recipeParams, function (result) {
        console.log("id: " + result.rows[0].recipe_id);
        let recipe_id = result.rows[0].recipe_id;
        let insertedDirections = false;
        for (i = 0; i < ingNum; i++) {
            curIng++
            let ingNames = req.body.ingredient_name
            let q_nums = req.body.quantity_num
            let q_types = req.body.quantity_type
            let ingParams = [
                recipe_id,
                ingNames[i],
                q_nums[i],
                q_types[i]
            ];
            rdb.insertIngredient(ingParams, function () {
                if (insertedDirections == false) {
                    insertedDirections = true;
                    let directions = req.body.direction
                    for (j = 0; j < dirNum; j++) {
                        let dirParams = [
                            recipe_id,
                            directions[j],
                            dirCount[i]
                        ]
                        rdb.insertDirection(dirParams, function () {
                            // console.log("current: "+curIng+", "+curDir);
                            // if((i+1) == ingNum && (j+1) == dirNum) {
                            //     res.redirect("/recipes");
                            // }
                        })
                        // curDir++;
                    }
                }
            })
        }
        res.redirect("/recipes");
    })
}

function editRecipeGet(req, res) {
    id = req.params.id;
    rdb.getRecipeById(id, function (recipe) {
        rdb.getIngredientsByRecipeId(id, function (ing) {
            rdb.getInstructionsByRecipeId(id, function (ins) {
                fdb.getQuantityTypes(function (types) {
                    const params = {
                        recipe: recipe,
                        ingredients: ing,
                        directions: ins,
                        quantity_types: types
                    }
                    res.render("editRecipe", params);
                })
            })
        })
    })
}

function editRecipePost(req, res) {
    id = req.params.id;
    let ingNum = req.body.ing_id;
    let ingTotal = req.body.ingCount;
    let ingNames = req.body.ingredient_name
    let q_nums = req.body.quantity_num
    let q_types = req.body.quantity_type
    let ingDelete = req.body.ingDelete;
    let ingDeleteId = ingDelete.split(",");

    // need this for same reason as: if(typeof dirNum =='string') - see below
    if (typeof ingNum == 'string') {
        ingNum = [ingNum];
    }
    if (typeof ingNames == 'string') {
        ingNames = [ingNames, ""]
        console.log(typeof ingNames)

    }

    let dirNum = req.body.dir_id;
    /* If the user deletes all the original directions except one, 
     *  it was giving me a problem because dirNum would equal the id
     *  of that one direction (i.e. 33) and the length would be two.
     *  But if more than one was left, dirNum would be something like
     *  ["33", "34"] and the length would be two, which is what I wanted.
     *  So I added the following if statement to change dirNum so that
     *  the length would only be 1 if there was only one original direction left.
     */
    if (typeof dirNum == 'string') {
        dirNum = [dirNum];
    }
    let dirTotal = req.body.dirCount;
    let dirSteps = req.body.direction;
    let dirDelete = req.body.dirDelete;
    let dirDeleteId = dirDelete.split(",");
    let dirOrder = req.body.instructionNumber;

    const recipeParams = [id, req.body.recipe_name, req.body.author, 1];
    rdb.updateRecipe(recipeParams, function (result) {
        for (i = 0; i < ingNum.length; i++) {
            let ingParams = [
                id,
                ingNames[i],
                q_nums[i],
                q_types[i],
                ingNum[i]
            ];
            console.log("ingParams: ");
            console.log(ingParams);
            rdb.updateIngredient(ingParams, function () {})
        }
        for (i = ingNum.length; i < ingTotal; i++) {
            let params = [
                id,
                ingNames[i],
                q_nums[i],
                q_types[i]
            ];
            rdb.insertIngredient(params, function () {})
        }
        for (i = 0; i < ingDeleteId.length; i++) {
            rdb.deleteIngredient(ingDeleteId[i], function () {})
        }
        for (i = 0; i < dirNum.length; i++) {
            let params = [
                id,
                dirNum[i],
                dirSteps[i],
                dirOrder[i]
            ]
            rdb.updateInstruction(params, function () {})
        }
        for (i = dirNum.length; i < dirTotal; i++) {
            let params = [
                id,
                dirSteps[i],
                dirOrder[i]
            ]
            rdb.insertDirection(params, function () {})
        }
        for (i = 0; i < dirDeleteId.length; i++) {
            rdb.deleteInstruction(dirDeleteId[i], function () {})
        }
        res.redirect("/recipes/" + id);
    })
}

function findFoodGet(req, res) {
    let myRecipes = [];
    // get all the foods the user has
    fdb.getAllFoods(function (food) {
        // get all the recipes for the user
        rdb.getAllRecipes(function (recipes) {
            // get all the ingredients for all recipes
            rdb.getAllIngredients(function (ingredients) {
                // go through each recipe
                recipes.forEach(recipe => {
                    let ingForRecipe = [];
                    let recipeId = recipe.recipe_id;
                    let enoughFood = [];
                    // for each recipe, it will find all the ingredients with that recipe id
                    ingredients.find(function (value) {
                        if (value.recipe_id == recipeId) {
                            ingForRecipe.push(value);
                        }
                    })
                    // go through all the ingredients for the recipe
                    ingForRecipe.forEach(ing => {
                        // let similarFoods = functions.similarFood(ing.ingredient_name);
                        // find food with the same name
                        let myFood = food.find(f => f.food_name == ing.ingredient_name);
                        // if there was food with that name, check the amounts
                        if (myFood != undefined) {
                            foodNum = functions.getml(myFood.quantity_num, myFood.quantity_type_id);
                            ingNum = functions.getml(ing.quantity_num, ing.quantity_type);
                            // if the amount of food is greater than or equal to the amount in the recipe, add it to an array
                            if (+foodNum >= +ingNum) {
                                enoughFood.push(myFood);
                            }
                        }
                    })
                    // after going through each ingredient and checking the food, check to see if the amount of foods is equal to the amount of ingredients
                    if (enoughFood.length == ingForRecipe.length) {
                        myRecipes.push(recipe);
                    }
                })
                const params = {
                    recipes: myRecipes
                }
                res.render("findFood", params);
            })
        })
    })
}