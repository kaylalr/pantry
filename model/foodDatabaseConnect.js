const {
    Pool
} = require('pg')
const connectionString = process.env.DATABASE_URL || "postgres://kwyatgkxstrdfg:c6f7f83e42450a3bc336092853545e287cde8e1d97e1184e3bcfefb963e5372c@ec2-54-225-95-183.compute-1.amazonaws.com:5432/dcieu6j73u775s?ssl=true"
const pool = new Pool({
    connectionString: connectionString
});

// function addFood

function getAllFoods(callback) {
    var getAllFoods = "select f.food_id, f.food_name, f.foodgroup_id, f.quantity_num, f.expiration, f.quantity_type_id, qt.quantity_type_name FROM foods f JOIN quantity_types qt ON qt.quantity_type_id = f.quantity_type_id ORDER BY f.expiration"
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

function getFoodsByUserId(id, callback) {
    var getFoodsByUserId = "Select * from foods where user_id = $1 ORDER BY expiration";
    pool.query(getFoodsByUserId, [id], function (err, result) {
        if (err) {
            console.log("Error in getFoodsByUserId query: ")
            console.log(err);
        }
        callback(result.rows);
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

module.exports = {
    updateQuantity: updateQuantity,
    getFoodsByUserId: getFoodsByUserId,
    getAllFoods: getAllFoods,
    getFoodById: getFoodById,
    getFoodByName: getFoodByName,
    getQuantityTypes: getQuantityTypes,
    getFoodGroups: getFoodGroups,
    deleteFood: deleteFood
}