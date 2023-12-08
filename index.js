const dotenv = require('dotenv').config();
const express = require("express");
const handlebars = require('express-handlebars');
const app = express();
const mongoose = require('mongoose')
const nodemailer = require('nodemailer')
const bodyParser = require('body-parser')
const fs = require('fs')
const http = require('http');
const https = require('https');
var privateKey  = fs.readFileSync(process.env.KEY, 'utf8');
var certificate = fs.readFileSync(process.env.CERT, 'utf8');

var credentials = {key: privateKey, cert: certificate};

app.use(bodyParser({extended: false}));
app.use(express.static(__dirname + '/public'))
app.set("views", __dirname + "/views")
app.set('view engine', 'handlebars');
app.engine('handlebars', handlebars.engine({
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials',
    defaultView: 'home'
}));

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);


const PORT = process.env.PORT || 3000;
const dbURL = process.env.MONGO_STRING;

const FoodItem = mongoose.model("FoodItem", new mongoose.Schema(
    {
        foodId: {
            type:Number,
            required: true
        },
        dateMade: {
            type: String
        }
    }
));

const FoodType = mongoose.model("FoodType", new mongoose.Schema(
    {
        foodId: {
            type: Number,
            required: true
        },
        foodName: {
            type:String,
            required: true
        },
        description: {
            type: String
        },
        quantity: {
            type: Number,
            required: true
        }
    }
));

const Shelf = mongoose.model("Shelf", new mongoose.Schema(
    {
        shelfId: {
            type: Number,
            required: true
        },
        shelfContents: []
    }
));

const Countdown = mongoose.model("Countdown", new mongoose.Schema(
    {
        countId: {
            type: Number,
            required: true
        },
        countHours: {
            type:Number,
            required:true
        }
    }
));

console.log("Connecting to database...");
mongoose.connect(dbURL)
    .then(()=>{
        console.log("Connected to database");
    })
    .catch((err) => console.log(err));

const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    host: "smtp.gmail.com",
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD
    },
    secure: true
});

var hbs = handlebars.create({});
hbs.handlebars.registerHelper("makeTable", function(inventory) {
        var curInv = this.inventory;
        dom = ''
        dom += '<table style="width: 100%" class="inventory" id="inventory">'
        dom += `
        <tr id="header">
           <th>FoodName</th>
           <th>FoodDescription</th>
           <th>Date</th>
           <th>Buttons</th>
        </tr>`
        curInv.types.forEach(foodType => {
            console.log(foodType)
           dom += `<tr id="` + String(foodType.foodId) + `">`;
           dom += `<td rowspan="` + (Number(foodType.quantity) + 1) + `">` + String(foodType.foodName) + `</td>`;
           dom += `<td rowspan="` + (Number(foodType.quantity) + 1) + `">` + String(foodType.description) + `</td>`;
           dom += `</tr>`;
           curInv.items.forEach(foodItem => {
                if (foodType.foodId == foodItem.foodId){
                    dom += `<tr id="` + foodType.foodId + `">`;
                    dom += `<td id="date">` + foodItem.dateMade + `</td>`;
                    dom += `<td width="8%"><button class="tableButton" type="button">Remove</button>`;
                    dom += `</tr>`;
                }
           });
        });
        dom += '</table>';
        return dom;
     })

     hbs.handlebars.registerHelper("makeCountdown", function(count) {
        var curCount = this.count;
        dom = "<p style='margin-left:0'>"+String(curCount[0].countHours)+"</p>"
        return dom;
     })

app.get('/', function(request, response) {
	response.render('home', {layout: 'index'});
});

app.get('/projects', function(request, response) {
	response.render('projects', {layout: 'index'});
});

app.get('/contact', function(request, response) {
	response.render('contact', {layout: 'index'});
});

app.post('/contact', (req, res) => {
    const {name, phone, email, subject, text} = req.body;
    const finalText = "From: " + name + " - " + email + "\nPhone:" + phone + "\n" + text
    const mailData = {
        from: process.env.NODEMAILER_EMAIL,
        to: process.env.NODEMAILER_EMAIL_TO,
        subject: subject,
        text: finalText,
    }
    transporter.sendMail(mailData, function(err, info){
        if(err){
            console.log("Err: ")
            console.log(err)
        } else {
            res.redirect('/contact')
        }
    });
})

app.get('/inventory', async function(request, response){
    const types = await FoodType.find({}).lean();
    const items = await FoodItem.find({}).lean();
    const inventory = {types,items}
    response.render('inventory', {layout:'index', inventory});
});

app.get('/countdown', async function(request, response){
    const count = await Countdown.find({}).lean();
    response.render('countdown', {layout:'index', count});
});

app.post('/countdown',async function(request, response){
    try{
        Countdown.findOne().then((count => {
            count.countHours = count.countHours - request.body.countdownAmount;
            count.save()
                .catch((e) => {
                    console.log(e);
                }).then(
                    response.redirect('/countdown')
                );
        }))
    }catch(e){
        console.log(e)
    }
});

app.get('/test', function(request, response) {
    response.render('test', {layout:'index'});
})

app.post('/test', function(request, response) {
    try{
        // var testFoodType = new FoodType({
        //     foodId: 1,
        //     foodName:"Rice",
        //     description: "Small white grains",
        //     quantity:0
        // });
        // testFoodType.save()
        //     .catch((e) => {
        //         console.log(e);
        //     });
        // testFoodType = new FoodType({
        //     foodId: 2,
        //     foodName:"Beans",
        //     description: "The Magical Fruit",
        //     quantity:0
        // });
        // testFoodType.save()
        //     .catch((e) => {
        //         console.log(e);
        //     });
        // testFoodType = new FoodType({
        //     foodId: 3,
        //     foodName:"Potatoes",
        //     description: "Boil, Mash, or Stew",
        //     quantity:0
        // });
        // testFoodType.save()
        //     .catch((e) => {
        //         console.log(e);
        //     });


        // var testFoodItem = new FoodItem({
        //     foodId: 1,
        //     dateMade:"Today"
        //     });
        // testFoodItem.save()
        //     .catch((e) => {
        //         console.log(e);
        //     });
        // var testFoodItem = new FoodItem({
        //     foodId: 2,
        //     dateMade:"Yesterday"
        //     });
        // testFoodItem.save()
        //     .catch((e) => {
        //         console.log(e);
        //     });
        // var testFoodItem = new FoodItem({
        //     foodId: 3,
        //     dateMade:"Last Week"
        //     });
        // testFoodItem.save()
        //     .catch((e) => {
        //         console.log(e);
        //     });

        // var testFoodItem = new FoodItem({
        //     foodId: 1,
        //     dateMade:"Tuesday"
        //     });
        // testFoodItem.save()
        //     .catch((e) => {
        //         console.log(e);
        //     });
        // var testFoodItem = new FoodItem({
        //     foodId: 2,
        //     dateMade:"Last Month"
        //     });
        // testFoodItem.save()
        //     .catch((e) => {
        //         console.log(e);
        //     });
        // var testFoodItem = new FoodItem({
        //     foodId: 3,
        //     dateMade:"Next week"
        //     });
        // testFoodItem.save()
        //     .catch((e) => {
        //         console.log(e);
        //     });
       
        Countdown.findOne().then((count => {
            count.countHours = request.body.countdownAmount;
            count.save()
                .catch((e) => {
                    console.log(e);
                }).then(
                    response.redirect('/test')
                );
        }))
    }catch(e){
        console.log(e)
    }
})

app.get('/resume', function(request, response) {
    let resume = fs.readFileSync('public/brennanPriceResume.pdf')
	response.contentType("application/pdf");
    response.send(resume);
});

app.use(function(request, response) {
	response.status(404).render('404', {layout: 'index'});
});

app.listen(PORT, function() {
	console.log("Server is running at http://localhost:3000/");
});

httpsServer.listen(8443, function() {
    console.log("Https server on port 8443");
});

httpServer.listen(8080, function() {
    console.log("Http server on port 8080");
});

