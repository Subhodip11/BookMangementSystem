const { ObjectId } = require('bson');
const express = require('express');
const app = express.Router();
const userRegistrationModel = require('./userRegistartionSchema');

app.get('/:userId/:userIdFromBook', async(req, res) => {
    let { userId, userIdFromBook } = req.params;
    let getUser = await userRegistrationModel.find({ _id: userId })
        // console.log(getUser)
        // console.log(userId)
    if (getUser) {
        res.render('editUserInfo', { userId: userId, userIdFromBook: userIdFromBook, username: getUser[0].userName, registrationNumber: getUser[0].registrationNumber, password: getUser[0].password, mobileNumber: getUser[0].mobileNumber, email: getUser[0].email });
    } else
        return res.json({ 'errorMessage': 'User Data is incorrect' })
})

app.post('/:userId/:userIdFromBook', async(req, res) => {
    let { userId, userIdFromBook } = req.params;
    let findUserById = await userRegistrationModel.find();
    let { userName, registrationNumber, password, email, mobileNumber } = req.body;
    let flag = false;
    for (let i = 0; i < findUserById.length; i++) {
        let id = findUserById[i]._id;
        if (!(new ObjectId(userId).equals(id)))
            if (findUserById[i].userName === userName || findUserById[i].registrationNumber === registrationNumber || findUserById[i].email === email || findUserById[i].mobileNumber === mobileNumber) {
                // console.log(userName, registrationNumber, email, mobileNumber, password, id)
                // console.log(findUserById[i].userName, findUserById[i].registrationNumber, findUserById[i].email, findUserById[i].password, findUserById[i].mobileNumber, id)
                flag = true
            }
    }
    if (flag)
        return res.json({ 'error': 'redundant data, try something else' })

    let updateUser = await userRegistrationModel.findOneAndUpdate({ _id: userId }, { $set: { userName: userName, registrationNumber: registrationNumber, password: password, email: email, mobileNumber: mobileNumber } });
    if (updateUser)
        res.redirect(`/editUserInfo/${userId}/${userIdFromBook}`);
    else
        return res.json({ 'error': 'Some error occured' })
})
module.exports = app