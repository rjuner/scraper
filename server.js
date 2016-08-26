var express = require('express'); 
var app = express(); 
var bodyParser = require('body-parser'); 

//+++++ Morgan is for debugging
var logger = require('morgan'); 

var mongoose = require('mongoose');

//	Tools for scraping 
var request = require('request'); 
var cheerio = require('cheerio'); 

//	Using morgan and body parser
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
	extended: false
})); 

//+++++ Make a public static directory
app.use(express.static('public')); 

//	Configuring the database with Mongoose
mongoose.connect('mongodb://localhost/myscrapeDB'); 
var db = mongoose.connection; 

//	Showing any errors from mongoose
db.on('error', function(err){
	console.log('Mongoose Eroor: ', err);
}); 

// Mongoose login success message
db.once('open', function(){
	console.log('Mongoose connection successful.');
}); 

//+++++ Models go here
// var Note = require('./models/Note.js');
// var Article = require('./models/Article.js'); 

//	================= ROUTES =================

//	Index Route
app.get('/', function(req, res){ 
	res.send(index.html);
}); 

//	GET request to scrape the site you want
app.get('/scrape', function(req, res){
	request('http://www.eurekalert.org/pubnews.php', function(error, response, html){
		var $ = cheerio.load(html); 

		$('article.post').each(function(i, element){

			// console.log($(this).find('h2.post_title').text());
			// console.log($(this).find('p.intro').text());

			//	save an empty result object
			
			var result = {};

			result.title = $(this).find('h2.post_title').text(); 
			result.paragraph = $(this).find('p.intro').text();

			// console.log("Article " + i + "\n" + result.title + "\n" +  result.paragraph);

			var entry = new Article(result); 

			entry.save(function(err, doc){
				if(err){
					console.log(err);
				}
				else{
					console.log(doc);
				}
			});

		});
	});
	res.send("Scrape Complete!");
});

//	GETs scraped articles from mongoDB
app.get('/articles/:id', function(req, res){
	Article.findOne({'_id': req.params.id})
	.populate('note')
	.exec(function(err, doc){
		if(err){
			console.log(err);
		}
		else{
			res.json(doc);
		}
	});
});






app.listen(3000, function(){
	console.log('App running on port 3000!'); 
}); 