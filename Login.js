const express = require('express')
const app = express.Router();
const userVerificationModel = require('./userRegistartionSchema')

app.get('/', (req, res) => {
    res.render('UserRegistration');
})

app.post('/loginSuccess', async(req, res) => {
    let { userNameLogin, registrationNumberLogin, passwordLogin } = req.body;
    const findUserExistence = await userVerificationModel.findOne({ userName: userNameLogin, registrationNumber: registrationNumberLogin, password: passwordLogin });
    if (findUserExistence)
        return res.redirect(`/issuebook/${userNameLogin}/${registrationNumberLogin}`)
    return res.json({ 'errorMessage': 'No User Found' })
})

module.exports = app;