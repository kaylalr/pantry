function checkPassword(user, password) {
    if (user.user_password == password) {
        return true;
    } else {
        return false;
    }
}

module.exports = {
    checkPassword: checkPassword
}