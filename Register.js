const express = require('express');
const app = express.Router();
const userRegistrationModel = require('./userRegistartionSchema');

app.get('/', (req, res) => {
    res.render('UserRegistration');
})



app.post('/registeredSuccessfully', async(req, res) => {
    let { userName, password, confirmPassword, registrationNumber, mobileNumber, email } = req.body;
    let findUserExistence = await userRegistrationModel.findOne({ userName: userName, registrationNumber: registrationNumber, email: email })
    if (findUserExistence)
        return res.json({ 'errorMessage': 'User already exist' })
    if (password !== confirmPassword)
        res.json({ 'errorMessage': 'Please check your password field correctly' })
    else {
        userRegistrationModel.create({ userName: userName, password: password, registrationNumber: registrationNumber, email: email, mobileNumber: mobileNumber })
            .then(data => {
                res.redirect(`/issueBook/${userName}/${registrationNumber}`)
            }).catch(err => {
                res.json({ 'errorMessage': 'Entered fields are not correct' })
                console.log(err)
            })
    }
})

module.exports = app;