var Fraction = require('fractional').Fraction

function checkPassword(user, password) {
    if (user.user_password == password) {
        return true;
    } else {
        return false;
    }
}

function formatQuantity(num) {
    var frac = new Fraction(num);
    return frac.toString();
}

function getml(num, type) {
    let ml;
    switch (type) {
        case 2:
            ml = num * 15;
            break;
        case 3:
            ml = num * 5;
            break;
        case 4:
            ml = num * 250;
            break;
        case 5:
            ml = num;
            break;
    }
    return ml;
}

function formatDate(myDate) {
    let year = myDate.getFullYear();
    let month = myDate.getMonth() + 1;
    let day = myDate.getDate();
    let myOldDate = new Date(year, (month - 1), day);
    let myMonth = myOldDate.toLocaleString('en-us', {
        month: 'long'
    });
    let date = myMonth + " " + day + ", " + year;
    return date;
}

let butters = ["butter", "margarine"]

function similarFood(food) {
    butters.find(function (value) {
        if (value == food) {
            return butters;
        }
    })
}

module.exports = {
    checkPassword: checkPassword,
    formatQuantity: formatQuantity,
    getml: getml,
    formatDate: formatDate,
    similarFood: similarFood
}