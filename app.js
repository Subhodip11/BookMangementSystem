const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const path = require('path')
const model = require('./bookSchema.js');
const bookIssuedModel = require('./bookIssueSchema.js');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/bookManagement?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false', () => console.log('MongoDB connected'));



app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'))
app.use(express.static('public'))

app.use('/register_or_login', require('./Register'));
app.use('/register_or_login', require('./Login'))

let dataToIndexFile = {};
let bookIdTracker = 0;

app.get('/', (req, res) => {
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
    let userdata = {
        userName: req.params.userName,
        registrationNumber: req.params.registrationNumber
    }
    const findUserExistence = await bookIssuedModel.findOne({ nameOfIssuer: userdata.userName, regNoOfUser: userdata.registrationNumber });
    if (findUserExistence) {
        model.find().then(data => {
            res.render('issueBook1', { data: data, userdata: userdata, issuerInfo: JSON.parse(findUserExistence.bookObjInfo) })
        }).catch(err => console.log(err))
    } else {
        model.find().then(data => {
            res.render('issueBook1', { data: data, userdata: userdata, issuerInfo: null })
        }).catch(err => console.log(err))
    }

})
app.post('/removeIssuedBook/:userName/:registrationNumber', async(req, res) => {
    let userdata = {
        userName: req.params.userName.substring(1, ),
        registrationNumber: req.params.registrationNumber.substring(1, )
    };
    let { bookName, authorName, bookPrice } = req.body;
    let findBookExistence = await bookIssuedModel.find({ nameOfIssuer: userdata.userName, regNoOfUser: userdata.registrationNumber })

    let tempArr = []

    let flag = false;
    if (findBookExistence.length !== 0) {
        for (let i = 0; i < findBookExistence.length; i++) {
            if (findBookExistence[i].nameOfIssuer === userdata.userName && findBookExistence[i].regNoOfUser === userdata.registrationNumber) {
                tempArr.push(findBookExistence[i].bookObjInfo);
            }
        }
        tempArr = JSON.parse(tempArr)
        let resArr = []
        for (let i = 0; i < tempArr.length; i++) {
            if (!tempArr[i].bookname.includes(bookName) || !tempArr[i].bookauthor.includes(authorName) || !tempArr[i].bookprice.includes(bookPrice)) {
                resArr.push(tempArr[i]);
            }
        }
        bookIssuedModel.findOneAndUpdate({ nameOfIssuer: userdata.userName, regNoOfUser: userdata.registrationNumber }, { $set: { bookObjInfo: JSON.stringify(resArr) } }, function(err, data) {
            if (err) return res.json({ 'errorMessage': 'Some error occured' })
            return res.redirect('/issuebook/' + userdata.userName + "/" + userdata.registrationNumber);
        })
    }

})

app.post('/issueBook/:userName/:registrationNumber', async(req, res) => {
    // console.log(req.body)
    let userdata = {
        userName: req.params.userName.substring(1, ),
        registrationNumber: req.params.registrationNumber.substring(1, )
    }
    let { bookNameIssue, bookAuthorIssue, bookPriceIssue } = req.body;

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

        for (let i = 0; i < tempArr.length; i++) {
            if (tempArr[i].bookname.includes(bookNameIssue) || tempArr[i].bookauthor.includes(bookAuthorIssue) || tempArr[i].bookprice.includes(bookPriceIssue)) {
                flag = true;
            }
        }
    }

    let findUserExistence = await bookIssuedModel.findOne({ nameOfIssuer: userdata.userName, regNoOfUser: userdata.registrationNumber });
    if (findUserExistence && !flag) {
        // console.log(findUserExistence);

        let tempBookObj = JSON.parse(findUserExistence.bookObjInfo)
        tempBookObj.push({ bookname: bookNameIssue, bookauthor: bookAuthorIssue, bookprice: bookPriceIssue })
            // console.log(tempBookObj);
        bookIssuedModel.findOneAndUpdate({ nameOfIssuer: userdata.userName, regNoOfUser: userdata.registrationNumber }, { $set: { bookObjInfo: JSON.stringify(tempBookObj) } }, function(err, data) {
            if (err) res.json({ 'errorMessage': 'Some error occured' })
            return res.redirect('/issuebook/' + userdata.userName + "/" + userdata.registrationNumber);
        })

    } else if (flag) {
        res.json({ 'errorMessage': 'book already issued' })
    } else {
        // console.log(userdata.registrationNumber)
        let bookObj = [{ bookname: bookNameIssue, bookauthor: bookAuthorIssue, bookprice: bookPriceIssue }]

        if (!flag)
            bookIssuedModel.create({
                nameOfIssuer: userdata.userName,
                regNoOfUser: userdata.registrationNumber,
                bookObjInfo: JSON.stringify(bookObj)
            })
            .then(data => {
                res.redirect('/issueBook/' + userdata.userName + '/' + userdata.registrationNumber)
            }).catch(err => console.log(err))
        else
            res.json({ 'errorMessage': 'Book already issued' })
    }
})

app.post('/bookAdded', async(req, res) => {
    let { authorname, bookname, bookprice, issuedate } = req.body;
    let findUserExistence = await model.findOne({ authorName: authorname, bookName: bookname });

    if (!findUserExistence) {
        let idGenerator = Date.now(); //returns the milliseconds elapsed till now
        model.create({ bookId: idGenerator, authorName: authorname, bookName: bookname, bookPrice: bookprice, publishDate: issuedate }).then((data) => {
            dataToIndexFile = data
            res.redirect('/');
        }).catch(err => console.log(err))
    } else
        return res.json({ 'errorMessage': 'Book and user already Exist' })
})

app.post('/deleteBook/:id', (req, res) => {
    model.findOneAndRemove({ id: req.params.id }).then(mssg => {
        console.log("Successfully deleted")
        res.redirect('/')
    }).catch(err => console.log(err))
})

app.listen(3001, () => console.log('Port is active At 3001'))