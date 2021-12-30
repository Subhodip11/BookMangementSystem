const express = require('express');
const app = express.Router();
const bookIssuedModel = require('./bookIssueSchema.js');

app.get('/:userName/:registrationNumber', async(req, res) => {
    let userdata = {
        userName: req.params.userName.substring(1, ),
        registrationNumber: req.params.registrationNumber.substring(1, )
    };
    const findUserExistence = await bookIssuedModel.findOne({ nameOfIssuer: userdata.userName, regNoOfIssuer: userdata.registrationNumber });
    if (findUserExistence) {
        let temp = JSON.parse(findUserExistence.bookObjInfo);
        console.log(findUserExistence)
        res.render('UserBooksIssuedInfo', { data: temp, daysIssued: findUserExistence.daysIssued });

    } else
        res.json({ "errorMessage": 'No user Found' })
})

module.exports = app