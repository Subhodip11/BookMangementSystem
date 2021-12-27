const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const path = require('path')
const model = require('./bookSchema.js');
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
let indexTracker = 0;

app.get('/', (req, res) => {
    model.find().then(data => {
        res.render('index1.ejs', { data: data });
        console.log(data)
    }).catch(err => console.log(err))
})

app.get('/issueBook/:userName/:registrationNumber', (req, res) => {
    let userdata = {
        userName: req.params.userName,
        registrationNumber: req.params.registrationNumber
    }
    userdata.userName = userdata.userName.substring(1, );
    userdata.registrationNumber = userdata.registrationNumber.substring(1, );
    model.find().then(data => {
        res.render('issueBook1', { data: data, userdata: userdata });
    }).catch(err => console.log(err))
})

app.post('/bookAdded', (req, res) => {
    let { authorname, bookname, bookprice, issuedate } = req.body;
    console.log('into post request')
    model.create({ index: indexTracker + 1, authorName: authorname, bookName: bookname, bookPrice: bookprice, publishDate: issuedate }).then((data) => {
        dataToIndexFile = data
        res.redirect('/');
    }).catch(err => console.log(err))

})

app.post('/deleteBook/:id', (req, res) => {
    model.findOneAndRemove({ id: req.params.id }).then(mssg => {
        console.log("Successfully deleted")
        res.redirect('/')
    }).catch(err => console.log(err))
})

app.listen(3001, () => console.log('Port is active At 3001'))