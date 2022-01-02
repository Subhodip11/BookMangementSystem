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
        let temp2 = [];
        for (let i = 0; i < temp.length; i++) {
            let todaysDate = new Date(new Date().toLocaleDateString());
            let bookIssuedDate = new Date(new Date(temp[i].bookissuedate));
            todaysDate.setDate(todaysDate.getDate() + findUserExistence.daysIssued) //added the total number of days books had been issued
            let timediff = Math.abs(bookIssuedDate - todaysDate);
            let datediff = Math.ceil(timediff / (1000 * 60 * 60 * 24));

            temp2.push(temp[i]);

            if (datediff === 0) {
                // console.log('date diff - ', datediff, timediff)
                temp2[i].remainingdays = 'Today is submission date'
            } else if (datediff < 0) {
                temp2[i].remainingdays = Math.abs(datediff) + ' days lapsed ';
            } else {
                temp2[i].remainingdays = datediff + ' days remaining';
            }

        }
        // console.log(temp2)
        res.render('UserBooksIssuedInfo', { data: temp2, daysIssued: findUserExistence.daysIssued, todayDate: new Date().toLocaleDateString() });

    } else
        res.json({ "errorMessage": 'No user Found' })
})

module.exports = app