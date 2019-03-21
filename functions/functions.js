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
    // let year = myDate.getFullYear();
    // let month = myDate.getMonth() + 1;
    // if (month.toString().length == 1) {
    //     month = "0" + month;
    // }
    // let day = myDate.getDate();
    // if (day.toString().length == 1) {
    //     day = "0" + day;
    // }
    // let date = year + "-" + month + "-" + day;
    // return date;
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

module.exports = {
    checkPassword: checkPassword,
    formatQuantity: formatQuantity,
    getml: getml,
    formatDate
}