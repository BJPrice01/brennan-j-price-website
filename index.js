const express = require("express");
const handlebars = require('express-handlebars');
const app = express();

app.use(express.static(__dirname + '/public'))
app.set("views", __dirname + "/views")
app.set('view engine', 'handlebars');
app.engine('handlebars', handlebars.engine({
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials',
    defaultView: 'home'
}));

const PORT = process.env.PORT || 3000;

app.get('/', function(request, response) {
	response.render('home', {layout: 'index'})
});

app.get('/links', function(request, response) {
	response.render('links', {layout: 'index'})
});

app.get('/projects', function(request, response) {
	response.render('projects', {layout: 'index'})
});

app.get('/contact', function(request, response) {
	response.render('contact', {layout: 'index'})
});

app.get('/test', function(request, response) {
	response.render('test', {layout: 'index'})
});
app.listen(PORT, function() {
	console.log("Server is running at http://localhost:3000/")
});
