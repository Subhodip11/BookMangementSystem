const express = require('express');
const app = express.Router();
const bookIssuedModel = require('./bookIssueSchema.js');
const userRegModel = require('./userRegistartionSchema.js');
const moment = require('moment');


app.get('/:userName/:registrationNumber', async(req, res) => {
    let userdata = {
        userName: req.params.userName.substring(1, ),
        registrationNumber: req.params.registrationNumber.substring(1, )
    };

    const findUserExistence2 = await userRegModel.findOne({ userName: userdata.userName, registrationNumber: userdata.registrationNumber });
    if (!findUserExistence2)
        return res.json({ 'errorMessage': 'Illegal Access' })
    const findUserExistence = await bookIssuedModel.findOne({ nameOfIssuer: userdata.userName, regNoOfIssuer: userdata.registrationNumber });
    if (findUserExistence) {
        let temp = JSON.parse(findUserExistence.bookObjInfo);
        let temp2 = [];
        for (let i = 0; i < temp.length; i++) {
            // console.log(findUserExistence.daysIssued)
            let todaysDate = new Date();
            let formatTodaysDate = moment(todaysDate)
            let dateString = temp[i].bookissuedate.split('/');
            let formatDateString = new Date(dateString[2] + '/' + dateString[1] + '/' + dateString[0]);
            let bookIssuedDate = moment(formatDateString).add(findUserExistence.daysIssued, 'd');
            // console.log(formatTodaysDate.format(), bookIssuedDate.format(), '     ', formatDateString)
            let diffBetweenDates = bookIssuedDate.diff(formatTodaysDate, 'days');
            temp2.push(temp[i]);
            if (diffBetweenDates === 0)
                temp2[i].remainingdays = "Return Date"
            if (diffBetweenDates > 0)
                temp2[i].remainingdays = (diffBetweenDates + 1) + ' days remaining'
            else
                temp2[i].remainingdays = (diffBetweenDates + 1) + ' days lapsed'


        }
        // console.log(temp2)
        res.render('UserBooksIssuedInfo', { userInfo: findUserExistence2, data: temp2, daysIssued: findUserExistence.daysIssued, todayDate: new Date().toLocaleDateString() });

    } else
        res.json({ "errorMessage": 'No user Found' })
})

module.exports = app