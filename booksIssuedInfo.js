const express = require('express');
const app = express.Router();
const bookIssuedModel = require('./bookIssueSchema.js');
const userRegModel = require('./userRegistartionSchema.js');
const moment = require('moment');


app.get('/:userName/:registrationNumber', async(req, res) => {
    let { userName, registrationNumber } = req.params
    console.log(userName, registrationNumber)
    const findUserExistence2 = await userRegModel.findOne({ userName: userName, registrationNumber: registrationNumber });
    if (!findUserExistence2)
        return res.json({ 'errorMessage': 'Illegal Access' })
    const findUserExistence = await bookIssuedModel.findOne({ nameOfIssuer: userName, regNoOfIssuer: registrationNumber });
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
        console.log(findUserExistence2.id)
        res.render('UserBooksIssuedInfo', { userIdFromBook: findUserExistence.id, userId: findUserExistence2.id, userInfo: findUserExistence2, data: temp2, daysIssued: findUserExistence.daysIssued, todayDate: new Date().toLocaleDateString() });

    } else
        res.json({ "errorMessage": 'No user Found' })
})

app.post('/returnBook/:userName/:registrationNumber', async(req, res) => {
    let { userName, registrationNumber } = req.params;
    let { bookname, authorname } = req.body;
    console.log(bookname, authorname)
    let getUser = await bookIssuedModel.find({ nameOfIssuer: userName, regNoOfIssuer: registrationNumber })
    console.log(bookname, authorname)
        // console.log('userData', getUser)
    if (getUser.length !== 0) {
        let tempArr = JSON.parse(getUser[0].bookObjInfo),
            resArr = [];
        for (let i = 0; i < tempArr.length; i++) {
            console.log(tempArr[i])
            if (!tempArr[i].bookname.includes(bookname) || !tempArr[i].bookauthor.includes(authorname)) {
                resArr.push(tempArr[i]);
                console.log('bookName ' + bookname + ' bookAuthor ' + authorname);
            }
        }
        console.log(resArr)
        bookIssuedModel.findOneAndUpdate({ nameOfIssuer: userName, regNoOfUser: registrationNumber }, { $set: { bookObjInfo: JSON.stringify(resArr) } }, function(err, data) {
            if (err) return res.json({ 'errorMessage': 'Some error occured' })
            return res.redirect('/issuedBookInfo/' + userName + "/" + registrationNumber);
        })
    }
})

module.exports = app