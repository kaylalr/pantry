const {
    Pool
} = require('pg')
const connectionString = process.env.DATABASE_URL || "postgres://kwyatgkxstrdfg:c6f7f83e42450a3bc336092853545e287cde8e1d97e1184e3bcfefb963e5372c@ec2-54-225-95-183.compute-1.amazonaws.com:5432/dcieu6j73u775s?ssl=true"
const pool = new Pool({
    connectionString: connectionString
});

function getAllFoods(callback) {
    var getAllFoods = "select f.food_id, f.food_name, f.foodgroup_id, f.quantity_num, f.expiration, f.quantity_type_id, qt.quantity_type_name FROM foods f JOIN quantity_types qt ON qt.quantity_type_id = f.quantity_type_id ORDER BY f.expiration;"
    pool.query(getAllFoods, function (err, result) {
        if (err) {
            console.log("Error in getAllFoods query: ")
            console.log(err)
        }
        // result.rows.forEach(row => {
        //     let year = row.expiration.getFullYear();
        //     let month = row.expiration.getMonth() + 1;
        //     let day = row.expiration.getDate();
        //     let myDate = new Date(year, (month-1), day);
        //     let myMonth = myDate.toLocaleString('en-us', { month: 'long' });
        //     let date = myMonth + " " + day + ", " + year;
        //     row.expiration = date;
        // })
        callback(result.rows);
    })
}

function getFoodById(id, callback) {
    var getFoodById = "SELECT * FROM foods WHERE food_id = $1";
    pool.query(getFoodById, [id], function (err, result) {
        if (err) {
            console.log("Error in getFoodById query: ")
            console.log(err);
        }
        let year = result.rows[0].expiration.getFullYear();
        let month = result.rows[0].expiration.getMonth() + 1;
        if (month.toString().length == 1) {
            month = "0" + month;
        }
        let day = result.rows[0].expiration.getDate();
        if (day.toString().length == 1) {
            day = "0" + day;
        }
        let date = year + "-" + month + "-" + day;
        result.rows[0].expiration = date;
        callback(result.rows);
    })
}

function getFoodByName(name, callback) {
    var getFoodByName = "Select * from foods where food_name = $1";
    pool.query(getFoodByName, [name], function (err, result) {
        if (err) {
            console.log("Error in getFoodById query: ")
            console.log(err);
        }
        callback(result.rows[0]);
    })
}

function updateQuantity(id, quantity) {
    var updateQuantity = "UPDATE foods SET quantity_num = $1 WHERE food_id = $2";
    pool.query(updateQuantity, [quantity, id], function (err, result) {
        if (err) {
            console.log("Error in updateQuantity query: ")
            console.log(err)
        }
        // console.log(result);
    })
}

function getQuantityTypes(callback) {
    var getQuantityTypes = "SELECT * FROM quantity_types";
    pool.query(getQuantityTypes, function (err, result) {
        if (err) {
            console.log("Error in getQuantityTypes query: ")
            console.log(err)
        }
        callback(result.rows);
    })
}

function getFoodGroups(callback) {
    var getQuantityTypes = "SELECT * FROM food_groups";
    pool.query(getQuantityTypes, function (err, result) {
        if (err) {
            console.log("Error in getFoodGroups query: ")
            console.log(err)
        }
        callback(result.rows);
    })
}

function deleteFood(id, callback) {
    var deleteFood = "DELETE FROM foods WHERE food_id = $1";
    pool.query(deleteFood, [id], function (err, result) {
        if (err) {
            console.log("Error in deleteFood query: ")
            console.log(err)
        }
        callback();
    })
}

function verifyUser(variables, callback) {
    var checkUser = "SELECT * from users WHERE user_name = $1";
    pool.query(checkUser, [variables.username], function (err, result) {
        if (err) {
            console.log("Error in checkUser query: ")
            console.log(err)
        }
        callback(result.rows);
    })
}

function getAllRecipes(callback) {
    var getAllRecipes = "select * from recipes order by recipe_name";
    pool.query(getAllRecipes, function (err, result) {
        if (err) {
            console.log("Error in checkUser query: ")
            console.log(err)
        }
        callback(result.rows);
    })
}

function getRecipeById(id, callback) {
    var getRecipe = "select * from recipes where recipe_id = $1";
    pool.query(getRecipe, [id], function (err, result) {
        if (err) {
            console.log("Error in checkUser query: ")
            console.log(err)
        }
        callback(result.rows[0]);
    })
}

function insertRecipe(params, callback) {
    var recipeInsert = "INSERT INTO recipes values(default, $1, $2, $3) returning recipe_id";
    pool.query(recipeInsert, params, function (err, result) {
        if (err) {
            console.log("Error in recipe insert query: ")
            console.log(err);
        }
        callback(result);
    })
}

function updateRecipe(params, callback) {
    var updateInsert = "UPDATE recipes set recipe_name=$2, author=$3, user_id=$4 where recipe_id=$1";
    pool.query(updateInsert, params, function (err, result) {
        if (err) {
            console.log("Error in recipe insert query: ")
            console.log(err);
        }
        callback(result);
    })
}

function getAllIngredients(callback) {
    var getAllIngredients = "SELECT * from ingredients";
    pool.query(getAllIngredients, function (err, result) {
        if (err) {
            console.log("Error in getAllIngredients query: ")
            console.log(err)
        }
        callback(result.rows);
    })
}

function getIngredientsByRecipeId(id, callback) {
    var getIngredients = "SELECT i.ingredient_id, i.ingredient_name, i.quantity_num, q.quantity_type_name, q.quantity_type_id from ingredients i join quantity_types q on q.quantity_type_id = i.quantity_type where i.recipe_id = $1";
    pool.query(getIngredients, [id], function (err, result) {
        if (err) {
            console.log("Error in checkUser query: ")
            console.log(err)
        }
        callback(result.rows);
    })
}

function insertIngredient(params, callback) {
    var insertIngredient = "INSERT INTO ingredients values (default, $1, $2, $3, $4)";
    pool.query(insertIngredient, params, function (err, result) {
        if (err) {
            console.log("Error in insertIngredient query: ")
            console.log(err)
        }
        callback(result.rows);
    })
}

function updateIngredient(params, callback) {
    var updateIngredient = "UPDATE ingredients set ingredient_name=$2, quantity_num=$3, quantity_type=$4 where recipe_id=$1 and ingredient_id=$5";
    console.log("params from database: ");
    console.log(params);
    pool.query(updateIngredient, params, function (err, result) {
        if (err) {
            console.log("Error in updateIngredient query: ")
            console.log(err);
        }
        callback(result);
    })
}

function deleteIngredient(id, callback) {
    var deleteIngredient = "delete from ingredients where ingredient_id=$1";
    pool.query(deleteIngredient, [id], function (err, result) {
        if (err) {
            console.log("Error in deleteIngredient query: ")
            console.log(err);
        }
        callback(result);
    })
}

function getInstructionsByRecipeId(id, callback) {
    var getInstructions = "SELECT * from instructions where recipe_id = $1 order by direction_number";
    pool.query(getInstructions, [id], function (err, result) {
        if (err) {
            console.log("Error in getInstructions query: ")
            console.log(err)
        }
        callback(result.rows);
    })
}

function insertDirection(params, callback) {
    // console.log("inertDirections params:")
    // console.log(params);
    var insertDirections = "insert into instructions values (default, $1, $2, $3)";
    pool.query(insertDirections, params, function (err, result) {
        if (err) {
            console.log("Error in insertDirections query: ")
            console.log(err)
        }
        callback(result.rows);
    })
}

function updateInstruction(params, callback) {
    var updateInstructions = "UPDATE instructions set directions=$3, direction_number=$4 where recipe_id=$1 and instruction_id=$2";
    pool.query(updateInstructions, params, function (err, result) {
        if (err) {
            console.log("Error in recipe insert query: ")
            console.log(err);
        }
        callback(result);
    })
}

function deleteInstruction(id, callback) {
    var deleteInstruction = "delete from instructions where instruction_id=$1";
    pool.query(deleteInstruction, [id], function (err, result) {
        if (err) {
            console.log("Error in deleteInstruction query: ")
            console.log(err);
        }
        callback(result);
    })
}

module.exports = {
    getAllFoods: getAllFoods,
    getFoodById: getFoodById,
    getFoodByName: getFoodByName,
    getQuantityTypes: getQuantityTypes,
    getFoodGroups: getFoodGroups,
    deleteFood: deleteFood,
    verifyUser: verifyUser,
    updateQuantity: updateQuantity,
    getAllRecipes: getAllRecipes,
    insertRecipe: insertRecipe,
    updateRecipe: updateRecipe,
    getAllIngredients: getAllIngredients,
    getIngredientsByRecipeId: getIngredientsByRecipeId,
    insertIngredient: insertIngredient,
    updateIngredient: updateIngredient,
    deleteIngredient: deleteIngredient,
    getInstructionsByRecipeId: getInstructionsByRecipeId,
    insertDirection: insertDirection,
    updateInstruction: updateInstruction,
    deleteInstruction: deleteInstruction,
    getRecipeById: getRecipeById
}