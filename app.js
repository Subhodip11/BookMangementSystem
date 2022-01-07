const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const path = require('path')
const model = require('./bookSchema.js');
const bookIssuedModel = require('./bookIssueSchema.js');
const UserRegistrationModel = require('./userRegistartionSchema.js')
const mongoose = require('mongoose');

const imagesArray = ['sports.jpg', 'comedy.jpg', 'romance.jpg', 'science_fiction.jpg', 'entertainment.jpg', 'horror.jpg', 'mystry.jpg', 'autobiography.jpg', 'action.jpg', 'history.jpg']

mongoose.connect('mongodb://localhost:27017/bookManagement?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false', () => console.log('MongoDB connected'));

let userdata = {
    userName: '',
    registrationNumber: ''
}

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'))
app.use(express.static('public'))

app.use('/register_or_login', require('./Register'));
app.use('/register_or_login', require('./Login'))
app.use('/issuedBookInfo', require('./booksIssuedInfo'))

let dataToIndexFile = {};
let bookIdTracker = 0;

app.get('/publish', (req, res) => {
    model.find().then(data => {
        console.log(data)
        if (data.length === 0)
            bookIdTracker = 0
        else
            bookIdTracker = data[data.length - 1].bookId;
        res.render('index1.ejs', { data: data });
        console.log(data)
    }).catch(err => console.log(err))
})

app.get('/issueBook/:userName/:registrationNumber', async(req, res) => {
    userdata = {
            userName: req.params.userName.substring(1, ),
            registrationNumber: req.params.registrationNumber.substring(1, )
        }
        // console.log('inside get request', req.params.userName)
        //Check Wheather user exist or not
    const findUserExistence = await UserRegistrationModel.findOne({ userName: userdata.userName, registrationNumber: userdata.registrationNumber })
        //If user doesnot exixt then throw error
    if (!findUserExistence)
        return res.json({ 'errorMessage': 'Illegal Access' })
            //check wheather data for user exist in book model or not, if it doesnt exist then pass information of issuer as null
    const findBookExistence = await bookIssuedModel.findOne({ nameOfIssuer: userdata.userName, regNoOfUser: userdata.registrationNumber });
    if (findBookExistence) {
        model.find().then(data => {
            res.render('issueBook1', { data: data, userdata: userdata, issuerInfo: JSON.parse(findBookExistence.bookObjInfo) })
        }).catch(err => console.log(err))
    } else {
        model.find().then(data => {
            res.render('issueBook1', { data: data, userdata: userdata, issuerInfo: null })
        }).catch(err => console.log(err))
    }

})


app.post('/issueBook/:userName/:registrationNumber', async(req, res) => {


    let { bookNameIssue, bookAuthorIssue, bookGenreIssue, bookPriceIssue } = req.body;
    let issuerImg = '';
    for (let i = 0; i < imagesArray.length; i++)
        if (imagesArray[i] === bookGenreIssue.toLowerCase().trim() + '.jpg') {
            issuerImg = imagesArray[i];
            break;
        }

    let bookArrayList = await bookIssuedModel.find({ nameOfIssuer: userdata.userName, regNoOfUser: userdata.registrationNumber })

    let tempArr = []

    let flag = false;
    if (bookArrayList.length !== 0) {
        for (let i = 0; i < bookArrayList.length; i++) {
            if (bookArrayList[i].nameOfIssuer === userdata.userName && bookArrayList[i].regNoOfUser === userdata.registrationNumber) {
                tempArr.push(bookArrayList[i].bookObjInfo);
            }
        }
        tempArr = JSON.parse(tempArr)
            // console.log('tenp array ', tempArr)
        for (let i = 0; i < tempArr.length; i++) {
            if (tempArr[i].bookname.includes(bookNameIssue) || tempArr[i].bookauthor.includes(bookAuthorIssue)) {
                flag = true;
            }
        }
    }

    let findUserExistence = await bookIssuedModel.findOne({ nameOfIssuer: userdata.userName, regNoOfUser: userdata.registrationNumber });


    if (findUserExistence && !flag) {
        // console.log(findUserExistence);

        let tempBookObj = JSON.parse(findUserExistence.bookObjInfo)
        tempBookObj.push({ bookname: bookNameIssue, bookauthor: bookAuthorIssue, bookgenre: bookGenreIssue, bookprice: bookPriceIssue, imagePath: issuerImg, bookissuedate: new Date().toLocaleDateString() })
            // console.log(tempBookObj);
        bookIssuedModel.findOneAndUpdate({ nameOfIssuer: userdata.userName, regNoOfUser: userdata.registrationNumber }, { $set: { bookObjInfo: JSON.stringify(tempBookObj) } }, function(err, data) {
            if (err) res.json({ 'errorMessage': 'Some error occured' })
            return res.redirect('/issuebook/:' + userdata.userName + "/:" + userdata.registrationNumber);
        })

    } else if (flag) {
        res.json({ 'errorMessage': 'book already issued' })
    } else {
        // console.log(userdata.registrationNumber)

        let bookObj = [{ bookname: bookNameIssue, bookauthor: bookAuthorIssue, bookgenre: bookGenreIssue, bookprice: bookPriceIssue, imagePath: issuerImg, bookissuedate: new Date().toLocaleDateString() }]
        console.log('bookObj ', bookObj)
        if (!flag)
            bookIssuedModel.create({
                nameOfIssuer: userdata.userName,
                regNoOfUser: userdata.registrationNumber,
                bookObjInfo: JSON.stringify(bookObj),
            })
            .then(data => {
                console.log('inside issuebook post request', req.params.userName)
                res.redirect('/issueBook/:' + userdata.userName + '/:' + userdata.registrationNumber)
            }).catch(err => console.log(err))
        else
            res.json({ 'errorMessage': 'Book already issued' })
    }
})

app.post('/removeIssuedBook/:userName/:registrationNumber', async(req, res) => {

    let { bookName, authorName, bookGenre, bookPrice } = req.body;
    let findUserExistence = await bookIssuedModel.find({ nameOfIssuer: userdata.userName, regNoOfUser: userdata.registrationNumber })

    let tempArr = []
    console.log('findUserExistence', findUserExistence)
    let flag = false;
    if (findUserExistence.length !== 0) {
        for (let i = 0; i < findUserExistence.length; i++) {
            if (findUserExistence[i].nameOfIssuer === userdata.userName && findUserExistence[i].regNoOfUser === userdata.registrationNumber) {
                tempArr.push(findUserExistence[i].bookObjInfo);
            }
        }
        tempArr = JSON.parse(tempArr)
        let resArr = []
        for (let i = 0; i < tempArr.length; i++) {
            if (!tempArr[i].bookname.includes(bookName) || !tempArr[i].bookauthor.includes(authorName)) {
                resArr.push(tempArr[i]);
                console.log('bookName ' + bookName + ' bookAuthor ' + authorName);
            }
        }
        console.log('resArr ', resArr)
        bookIssuedModel.findOneAndUpdate({ nameOfIssuer: userdata.userName, regNoOfUser: userdata.registrationNumber }, { $set: { bookObjInfo: JSON.stringify(resArr) } }, function(err, data) {
            if (err) return res.json({ 'errorMessage': 'Some error occured' })
            return res.redirect('/issuebook/:' + userdata.userName + "/:" + userdata.registrationNumber);
        })
    }

})

app.post('/issuebookWithDays/:userName/:registrationNumber', async(req, res) => {
    let userdata = {
        userName: req.params.userName.substring(1, ),
        registrationNumber: req.params.registrationNumber.substring(1, )
    };
    let daysIssued = req.body.daysIssued;
    let updateDays = await bookIssuedModel.findOneAndUpdate({ nameOfIssuer: userdata.userName, regNoOfUser: userdata.registrationNumber }, { $set: { daysIssued: daysIssued } });
    if (updateDays)
        return res.redirect('/issuebook/:' + userdata.userName + '/:' + userdata.registrationNumber);
    else
        return res.json({ 'errorMessage': 'Some error occured' })

})

app.post('/publish/bookAdded', async(req, res) => {
    let { authorname, bookname, bookgenrelist, bookprice, issuedate } = req.body;
    if (!authorname || !bookname || !bookgenrelist || !bookprice || !issuedate)
        return res.json('Please enter the fields correctly')
    let findUserExistence = await model.findOne({ authorName: authorname, bookName: bookname });

    if (!findUserExistence) {
        let idGenerator = Date.now(); //returns the milliseconds elapsed till now
        model.create({ bookId: idGenerator, authorName: authorname, bookName: bookname, bookGenre: bookgenrelist, bookPrice: bookprice, publishDate: issuedate }).then((data) => {
            dataToIndexFile = data
            res.redirect('/');
        }).catch(err => console.log(err))
    } else
        return res.json({ 'errorMessage': 'Book and user already Exist' })
})

app.post('/publish/deleteBook/:id', (req, res) => {
    model.findOneAndRemove({ bookId: Number(req.params.id.substring(1, )) }).then(mssg => {
        console.log("Successfully deleted")
        res.redirect('/')
    }).catch(err => console.log(err))
})

app.listen(3002, () => console.log('Port is active At 3001'))