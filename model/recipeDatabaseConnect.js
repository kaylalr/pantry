const {
    Pool
} = require('pg')
const connectionString = process.env.DATABASE_URL || "postgres://mbwomgmoqbepza:966aeb81a74e1d7966e4fde69c75a42941b5bbf39567cb25c73341f64e0a44d7@ec2-34-195-169-25.compute-1.amazonaws.com:5432/dl7jseb2e0n12"
const pool = new Pool({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

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

function getAllRecipesByUserId(id, callback) {
    var getAllRecipesByUserId = "select * from recipes where user_id = $1 order by recipe_name";
    pool.query(getAllRecipesByUserId, [id], function (err, result) {
        if (err) {
            console.log("Error in getAllRecipesByUserId query: ")
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
    getAllRecipes: getAllRecipes,
    getAllRecipesByUserId: getAllRecipesByUserId,
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