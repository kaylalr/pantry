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

module.exports = {
    checkPassword: checkPassword,
    formatQuantity: formatQuantity,
    getml: getml
}