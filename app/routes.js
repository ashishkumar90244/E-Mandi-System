// app/routes.js

var fs = require('fs');
var results;
var mysql = require('mysql2');
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
	service: 'gmail', // Replace with your service (e.g., 'outlook')
	auth: {
	  user: 'ashish.kumarcs0101@gmail.com',
	  pass: 'faxq ohie bysz snwk'
	}
  });

const {Vonage} = require('@vonage/server-sdk');
const vonage = new Vonage({
    apiKey: '2175db94',
    apiSecret: 'KfOLYAzxE8eWQHCT'
});


//const cookieParser = require('cookie-parser');
var bcrypt = require('bcrypt-nodejs');
var dbconfig = require('../config/database');
//const { UCS2_ESPERANTO_CI } = require('mysql2/lib/constants/charsets');
var connection = mysql.createConnection(dbconfig.connection);

let products = []

connection.query('USE ' + dbconfig.database);
module.exports = function(app, passport, url, path){

	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	
	
	app.get('/', function(req, res) {
		
		console.log(__dirname);
		req.session.admin=false;
		var isLoggedIn;
		if(req.isAuthenticated()){
			isLoggedIn = 1;
			

		}
		else{
			isLoggedIn = 0;
		}
		if(req.isAuthenticated() ){
			console.log("user is ",req.user);	
		}
		connection.query("SELECT * FROM Wholeseller INNER JOIN users ON users.id=Wholeseller.id ",function(err, result){
			var results={};
			if(err) throw err;
			//console.log(result);
			
				results=result;
			connection.query("SELECT * FROM Retailer INNER JOIN users ON users.id=Retailer.id",function(err,result){
				if(err) throw err;
				results = results.concat(result);
				//console.log(results);
				
				connection.query("SELECT * FROM Farmer INNER JOIN users on users.id=Farmer.id",function(err, result){
					if(err) throw err;
					results = results.concat(result);
					//console.log(results);
					//var rol = "";
					
					connection.query("SELECT title, COUNT(*) AS TotalSales FROM Orders WHERE createdAt >= DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 1 MONTH) GROUP BY title ORDER BY TotalSales DESC LIMIT 2;",function(err,result){
							
					
						var rec = []
						var trending = []
						
						if(req.user ){

							// if(req.user.role == "Farmer")
							// 	rol = "Farmer";
							// else if(req.user.role == "Wholeseller")
							// 	rol = "Wholeseller";
							// else if(req.user.role == "Retailer")
							// 	rol = "Retailer";
							// else
							// 	rol = "Civilian";

						
						//var rec= {}
						var pref = JSON.parse(req.cookies.preferences);
						//console.log(pref.Potato);
						var prefArr = Object.keys(pref);
						console.log("length is ",prefArr.length);
						if(prefArr.length!=0){
						for(var i=0;i<results.length;i++){

							var ob = results[i];
							
								if((ob.title == prefArr[prefArr.length-1] || ob.title == prefArr[prefArr.length-2]) && (ob.role !=req.user.role)){
									rec.push(ob);
								}

								if((ob.title == result[0].title || ob.title == result[1].title )&&(ob.role !=req.user.role)){
									trending.push(ob);
								}
						
							if(rec.length == 20)
								break;

						}
						}
						else{

							for(var i=0;i<results.length;i++){

								var ob = results[i];
								
									if(ob.state == req.user.state && (ob.role !=req.user.role)){
										rec.push(ob);
									}

									if((ob.title == result[0].title || ob.title == result[1].title )&&(ob.role !=req.user.role)){
										trending.push(ob);
									}
							
								if(rec.length == 20)
									break;
		
							}
							
							

						}
						}
						else{

							for(var i=0;i<results.length;i++){

								var ob = results[i];
								
									
	
									if((ob.title == result[0].title || ob.title == result[1].title )){
										trending.push(ob);
									}
							
								if(rec.length == 20)
									break;
	
							}

						}

						console.log("trending ",trending);
						res.render('index.ejs',{authenticated:isLoggedIn,results: results,req:req ,rec:rec,trending:trending}); // load the index.ejs file

					});
				});
				
			});
		});
		//admin
		// console.log(results);
		// results = foo();
		// console.log(dict.results);
		// console.log(listings);

	
		// console.log(isLoggedIn);
		
	});
	
	app.get('/updateListing/:title/:price/:stock',isLoggedIn,function(req,res){
		var title = req.params.title;
		var price = req.params.price;
		var stock = req.params.stock;
		res.render('updateListing.ejs',{title:title, price:price, stock:stock});

	});

	app.get('/deleteListing/:title/:price/:stock',isLoggedIn, function(req,res){
		var title = req.params.title;
		var price = req.params.price;
		var stock = req.params.stock;
		connection.query("DELETE FROM "+ req.user.role + " WHERE id='" + req.user.id + "' and title='"+ title+"' and price='"+ price + "' and stock='" + stock +"'",function(err,result){
			if(err)throw err;
			res.redirect("/");
		});
	});

	app.post("/search", function(req, res){
		var query = req.body.query;

		if(req.user){

			var userCookie = JSON.parse(req.cookies.preferences);
			//console.log(userCookie);
			
			var title = req.body.query;
			if(userCookie.hasOwnProperty(title)){
				delete userCookie[title];
			}
			userCookie[title] =title
			
			res.cookie('preferences', JSON.stringify(userCookie), {
				maxAge: 3600000*24*30, // Expires in 1 hour (in milliseconds)
				httpOnly: true // Cookie cannot be accessed by client-side JavaScript
			});
 
			connection.query("SELECT * FROM Wholeseller INNER JOIN users ON users.id=Wholeseller.id where title='"+ query +"'",function(err, result){
				var results={};
				if(err) throw err;
				//console.log(result);
				
					results=result;
				connection.query("SELECT * FROM Retailer INNER JOIN users ON users.id=Retailer.id where title='"+ query +"'",function(err,result){
					if(err) throw err;
					results = results.concat(result);
					//console.log(results);
					
					connection.query("SELECT * FROM Farmer INNER JOIN users on users.id=Farmer.id where title='"+ query +"'",function(err, result){
						if(err) throw err;
						results = results.concat(result);
						//console.log(results);
						var rol = "";
						var rec = []
						if(req.user ){
	
							if(req.user.role == "Farmer")
								rol = "Farmer";
							else if(req.user.role == "Wholeseller")
								rol = "Wholeseller";
							else if(req.user.role == "Retailer")
								rol = "Retailer";
							else
								rol = "Civilian";
	
						
						//var rec= {}
						var pref = JSON.parse(req.cookies.preferences);
						console.log(pref.Potato);
						var prefArr = Object.keys(pref);
						for(var i=0;i<results.length;i++){
	
							var ob = results[i];
							if(ob.state == req.user.state){
								if((ob.title == prefArr[prefArr.length-1] || ob.title == prefArr[prefArr.length-2]) && (ob.role !=req.user.role)){
									rec.push(ob);
								}
							}
							if(rec.length == 5)
								break;
	
						}}
						let trending = []
						//console.log(rec);
						res.render('index.ejs',{authenticated:isLoggedIn,results: results,req:req ,rec:rec,trending:trending}); // load the index.ejs file
	
					});
					
				});
			});

		}
		else{

			connection.query("SELECT * FROM Wholeseller INNER JOIN users ON users.id=Wholeseller.id where title='"+ query +"'",function(err, result){
				var results={};
				if(err) throw err;
				//console.log(result);
				
					results=result;
				connection.query("SELECT * FROM Retailer INNER JOIN users ON users.id=Retailer.id where title='"+ query +"'",function(err,result){
					if(err) throw err;
					results = results.concat(result);
					//console.log(results);
					
					connection.query("SELECT * FROM Farmer INNER JOIN users on users.id=Farmer.id where title='"+ query +"'",function(err, result){
						if(err) throw err;
						results = results.concat(result);
						//console.log(results);
						var rec = []
						var trending = [];
						//console.log(rec);
						res.render('index.ejs',{authenticated:0,results: results,req:req ,rec:rec,trending:trending}); // load the index.ejs file
	
					});
					
				});
			});

		}
	})
	app.get("/product/:id/:username/:title/:role/:price/:image/:stock",isLoggedIn,function(req,res){


		var userCookie = JSON.parse(req.cookies.preferences);
		console.log(userCookie);
		const {id,username,title,role,price,image,stock} = req.params;
		
		if(userCookie.hasOwnProperty(title)){
			delete userCookie[title];
		}
		userCookie[title] =title
		
		res.cookie('preferences', JSON.stringify(userCookie), {
            maxAge: 3600000*24*30, // Expires in 1 hour (in milliseconds)
            httpOnly: true // Cookie cannot be accessed by client-side JavaScript
        });
		
		console.log(req.cookies);
		products.push({id:id,username:username,title:title,role:role,stock:stock,image:image,price:price});
		res.render("product",{id:id,title:title,role:role,price:price,username:username,image:image,stock:stock});

	})

	app.post('/updateListing',isLoggedIn, function(req,res){
		var title = req.body.title;
		var price = req.body.price;
		var stock = req.body.stock;
		console.log(price);
		var query = "UPDATE "+ req.user.role + " set stock='" + stock +"' , price='" + price + "' where id='" + req.user.id +"' and title='" + title + "'";
		console.log(query);
		connection.query(query,function(err,result){
			if(err) throw err;
			console.log(result.length);
			res.redirect("/");
		});
	});

	app.get("/deleteItemCart/:id/:sellerID/:title/:quantity/:price/:image",isLoggedIn,function(req,res){
		id = req.params.id;
		sellerID = req.params.sellerID;
		title = req.params.title;
		quantity = req.params.quantity;
		price = req.params.price;
		image = req.params.image;
		connection.query("DELETE FROM Cart WHERE id='" + id +"' and sellerID='"+ sellerID +"' and title='"+ title +"'",function(err,result){
			if(err) throw err;
			connection.query("SELECT * from users WHERE id='"+ sellerID +"'",function(err,result){
				if(err) throw err;
				var role = result[0].role;
				connection.query("SELECT * FROM "+ result[0].role+ " WHERE id='" + sellerID + "' and title='"+ title +"'",function(err,result){
					if(err) throw err;
					if(result.length>0){
						connection.query("UPDATE "+ role + " SET stock=stock+" + quantity +" WHERE title='"+ title+"' and id='"+ sellerID+"'",function(err,result){
							if(err) throw err;
							res.redirect('/cart.html');
						});
					}	
					else{
						connection.query("INSERT INTO "+role+ " VALUES (?,?,?,?,?)",[sellerID, title,image,price,quantity ],function(err,result){
							if(err) throw err;
							res.redirect("/cart.html");
						});
					}
				});
			});
		});
	});

	app.get('/viewProducts',isLoggedIn, function(req,res){
		connection.query("SELECT * FROM Wholeseller INNER JOIN users ON users.id=Wholeseller.id ",function(err, result){
			var results={};
			if(err) throw err;
			results=result;
			connection.query("SELECT * FROM Retailer INNER JOIN users ON users.id=Retailer.id",function(err,result){
				if(err) throw err;
				results = results.concat(result);
				connection.query("SELECT * FROM Farmer INNER JOIN users ON users.id=Farmer.id", function(err, result){
					if(err) throw err;
					results = results.concat(result);
					console.log(results);
					res.render('viewAll.ejs',{results: results,req:req});
				});
				// console.log(results);
				
				// console.log(objs);
				
			});
			
			// setValue(result);
			// setTimeout(function(){
			// 	results =result;
			// 	alert(results);
			// }, Math.random()*2000);
			// results = result;
			// console.log(result);
		});
		
	});

	app.get('/viewProducts/:state',isLoggedIn, function(req,res){
		var state = req.params.state;
		if(state == 'All'){
			res.redirect('/viewProducts/');
		}
		console.log(state);
		connection.query("SELECT * FROM Wholeseller INNER JOIN users ON users.id=Wholeseller.id where state='"+ state+"'",function(err, result){
			var results={};
			if(err) throw err;
			results=result;
			connection.query("SELECT * FROM Retailer INNER JOIN users ON users.id=Retailer.id where state='"+ state+"'",function(err,result){
				if(err) throw err;
				results = results.concat(result);
				console.log(results);
				connection.query("SELECT * FROM Farmer INNER JOIN users ON users.id=Farmer.id where state='"+ state+"'", function(err, result){
					results= results.concat(result);
					res.render('viewAll.ejs',{results: results,req:req});
				});
				
				// console.log(objs);
			
			});
			
			// setValue(result);
			// setTimeout(function(){
			// 	results =result;
			// 	alert(results);
			// }, Math.random()*2000);
			// results = result;
			// console.log(result);
		});

	})



	app.post("/makeTransaction/:title/:username/:role/:price/:image",isLoggedIn, function(req,res){
		var title = req.params.title;
		var username = req.params.username;
		var role = req.params.role;
		var price = req.params.price;
		var image = req.params.image;
		var quantityToAdd = req.body.quantity;
		console.log(quantityToAdd);
		connection.query("SELECT id from users where username='" + username+ "'", function(err,result){
			if(err) throw err;
			var id = result[0].id;
			connection.query("SELECT * FROM Cart where title='"+ title + "' and sellerID='"+ result[0].id + "' and price='" + price + "' and id='"+ req.user.id + "'",function(err,result){
				if(err) throw err;
				if(result.length>0){
					connection.query("UPDATE Cart SET quantity=quantity+"+ quantityToAdd+" where title='"+ title + "' and sellerID='"+ id + "' and price='" + price + "' and id='"+ req.user.id + "'",
			 		function(err,result){
					if(err) throw err;
					connection.query("UPDATE "+ role+ " SET stock=stock-"+ quantityToAdd+" WHERE id='"+ id + "' and title='"+ title+ "'", function(err, result){
						if(err) throw err;
						connection.query("DELETE FROM "+ role +" where stock<=0",function(err,result){
							console.log(result);
							res.redirect("/");
						});
					});
			}); 
				}
				else{
					connection.query("INSERT INTO Cart (id, title,image, price, quantity, sellerID) values (?,?,?,?,?,?)",[req.user.id, title,image, price, quantityToAdd, id],
					function(err,result){
						if(err) throw err;
						connection.query("UPDATE "+ role+ " SET stock=stock-"+ quantityToAdd+" WHERE id='"+ id + "' and title='"+ title+ "'", function(err, result){
							if(err) throw err;
							connection.query("DELETE FROM "+ role +" where stock<=0",function(err,result){
								console.log(result);
								res.redirect("/");
							});
						});
					});
				}
			});
			  
		});
		// connection.query("UPDATE Wholeseller SET stock=stock-1 WHERE ")
	});


	app.get('/admin',isLoggedIn,async (req,res) => {

		if(req.session.admin){
					const users_data=await connection.promise().query("Select * from users");
					const wholesellers=await connection.promise().query("Select * from Wholeseller");
					const retailers=await connection.promise().query("Select * from Retailer");
					const farmers=await connection.promise().query("Select * from Farmer");
					
					res.render("admin.ejs",{
						users_data:users_data[0],
						wholesellers:wholesellers[0],
						retailers:retailers[0],
						farmers:farmers[0]
					});
		}

		else{
			res.redirect('/');
		}
		
	})

	app.post('/insertDatabase',isLoggedIn,(req,res) => {
		const table_name=req.body.table_name.trim(' ');
		const id=req.body.id.trim(' ');
		const title_name=req.body.title_name.trim(' ');
		const stock=req.body.stock.trim(' ');
		const price=req.body.price.trim(' ');

		if(table_name && id && title_name && stock && price){
			const sql="insert into "+table_name+" values(?,?,?,?)";
			connection.query(sql,[id,title_name,stock,price],(err,result) => {
				if(err) throw err;
				res.redirect('/admin');
	
			})
		}

		else{
			res.redirect('/admin');
	
		}

		
	})

	app.post('/updateDatabase',isLoggedIn,(req,res) => {
		const table_name=req.body.table_name.trim(' ');
		const column_name=req.body.column_name.trim(' ');
		const title_name=req.body.title_name.trim(' ');
		const id=req.body.id.trim(' ');
		const updated_value=req.body.updated_value.trim(' ');

		if(table_name==="users"){
			if(column_name && id && updated_value){
				 let sql="update users set "+column_name+" = '"+updated_value+"' where id = '"+id+"'";
				 connection.query(sql,(err,result) => {
					 if(err) throw err;
					 res.redirect('/admin');
				 })
			}
			else{
				res.redirect('/admin');
			}

		}

		else{
			if(table_name && column_name && title_name && id && updated_value){
				let sql="update "+table_name+" set "+column_name+" = "+updated_value+" where id = '"+id+"' and title='"+title_name+"'";
				connection.query(sql,(err,result) => {
					if(err) throw err;
					res.redirect('/admin');
				})
			}

			else{
				res.redirect('/admin');

			}
		}

	})

	app.post('/deleteDatabase',isLoggedIn,(req,res) => {
		const table_name=req.body.table_name.trim(' ');
		const id=req.body.id.trim(' ');
		const title_name=req.body.title_name.trim(' ');
		console.log(table_name,id,title_name);
		if(table_name=="users"){
			if(id){
				const sql="Delete from "+table_name+" where id='"+id+"'";
				connection.query("select role from users where id='"+id+"'",function(err,result){
					if(err)
						console.log(err);
					console.log("result is ", result);
					connection.query("delete from "+result[0].role+" where id='"+id+"'",function(err,result){
						connection.query("delete from orders where buyerID='"+id+"' OR sellerID='"+id+"'",function(err,result){

							connection.query(sql,(err,result) => {
								if(err) {
									console.log(err);
									throw err;
								};
								res.redirect('/admin');
							})

						})

						
					})
					

				})
				
			}

			else{
				res.redirect('/admin');

			}
		}

		else{
			if(table_name && id && title_name){
				const sql="Delete from "+table_name+" where id='"+id+"' and title='"+title_name+"'";
				connection.query(sql,(err,result) => {
					if(err) throw err;
					res.redirect('/admin');
				})
			}

			else{
				res.redirect('/admin');

			}
		}

	})


	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	app.set('view engine','ejs');
	app.get('/login', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});

	// process the login form
	app.post('/login',savePrefernces, passport.authenticate('local-login', {
		failureRedirect : '/login', // redirect back to the login page if there is an error
		failureFlash : true // allow flash messages
	}),
	(req, res) => {
					console.log("hello");

		if (req.body.remember) {
		  req.session.cookie.maxAge = 1000 * 60 * 3;
		} else {
		  req.session.cookie.expires = false;
					}
					
			if(req.user["username"]==="admin"){
					req.session.admin=true;
					res.redirect("/admin");
					
					//res.render("admin.ejs");		//console.log(users_data[0][0].id);
			}		
			else				
				res.redirect('/');
});

	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('/signup', function(req, res) {
			//console.log(users_data
		// render the page and pass in any flash data if it exists
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});
	// process the signup form
	app.post('/signup',savePrefernces,validation, passport.authenticate('local-signup', {

		
	
		successRedirect : '/', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// =====================================
	// PROFILE SECTION =========================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile.ejs', {
			user : req.user // get the user out of session and pass to template
		});
	});

	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.session.destroy((err) => {
			if (err) {
				console.error('Error destroying session:', err);
				return;
			}
			res.redirect('/');
		});
	// 	req.session.destroy();
	// 	//req.logout();
	// 	console.log(__dirname);
	// 	req.session.admin=false;
	// 	var isLoggedIn;
	// 	if(req.isAuthenticated()){
	// 		isLoggedIn = 0;
	// 	}
	// 	else{
	// 		isLoggedIn = 0;
	// 	}
	// 	connection.query("SELECT * FROM Wholeseller INNER JOIN users ON users.id=Wholeseller.id ",function(err, result){
	// 		var results={};
	// 		if(err) throw err;
	// 		console.log(result);
			
	// 			results=result;
	// 		connection.query("SELECT * FROM Retailer INNER JOIN users ON users.id=Retailer.id",function(err,result){
	// 			if(err) throw err;
	// 			results = results.concat(result);
	// 			console.log(results);
	// 			connection.query("SELECT * FROM Farmer INNER JOIN users on users.id=Farmer.id",function(err, result){
	// 				if(err) throw err;
	// 				results = results.concat(result);
	// 				console.log(results);
	// 				req.user = undefined;
	// 				res.render('index.ejs',{authenticated:isLoggedIn,results: results,req:req,cat:[] }); // load the index.ejs file
	// 			});
				
	// 		});
	// 	//res.redirect('/');
	// });

})



	//my routes

	app.get('/about.html', function(req,res){
		res.render('about.ejs');
	});
	

	app.get('/product-single.html', function(req,res){
		res.render('product-single.ejs');
	});

	app.get('/index.html',function(req,res){
		res.redirect('/');
	});

  app.get('/cart.html',isLoggedIn, function(req,res){
		// console.log('Hello');
		connection.query("SELECT * FROM Cart WHERE id='"+ req.user.id+"'",function(err, result){
			if(err)throw err;
			console.log(result);
			res.render('cart.ejs',{req:req,results:result});
		});
		
	});


	app.get('/wholeSellerListing',isLoggedIn,function(req,res){
        connection.query("SELECT name from Items where category='fruits'", function(err,result,fields){
			if(err) throw err;
            var fruits = [];
            Object.keys(result).forEach(function(key) {
                var row = result[key];
                //console.log(row.name);
                fruits.push(row.name);
            });
            connection.query("SELECT name from Items where category='vegetables'", function(err,result,fields){
                if(err) throw err;
                var vegetables = [];
                Object.keys(result).forEach(function(key) {
                    var row = result[key];
                    //console.log(row.name);
                    vegetables.push(row.name);
                });
                connection.query("SELECT name from Items where category='spices'", function(err,result,fields){
                    if(err) throw err;
                    var spices = [];
                    Object.keys(result).forEach(function(key) {
                        var row = result[key];
                        //console.log(row.name);
                        spices.push(row.name);
                    });
                    res.render('addListing.ejs',{'req':req , fruit: fruits , vegetable: vegetables, spice: spices});
                });
            });
        });
	});

	app.post('/wholeSellerListing', isLoggedIn, function(req,res){
		console.log(req.files);
		// console.log(req.body.img);
		// var img = fs.readFileSync(req.body.img);
		// connection.query("INSERT INTO "+ req.user.role+ " (id , title, price, stock ) VALUES (?,?,?,?) ", [req.user.id, req.body.title, req.body.price, req.body.stock],function(err, result){
		// 	if(err) throw err;
		// 	console.log("Entry Successsfully created");
		// });
		// res.send("Entry Successful");
		// // res.redirect('/');
		if (!req.files)
		  return res.status(400).send('No files were uploaded.');
 
		  var file = req.files.img;
		  var img_name=file.name;
 
	  	if(file.mimetype == "image/jpeg" ||file.mimetype == "image/png"||file.mimetype == "image/gif" ){
                                 
              file.mv('views/public/images/upload_images/'+file.name, function(err) {
                             
	              if (err)
 
	                return res.status(500).send(err);
                  connection.query("INSERT INTO "+ req.user.role+ " (id , title, price, stock, image) VALUES (?,?,?,?,?) ", [req.user.id, req.body.title, req.body.price, req.body.stock,img_name],function(err, result){
			             if(err) throw err;
                        res.redirect('/');
                      console.log("Entry Successsfully created");
		          });
	           });
          } else {
            message = "This format is not allowed , please upload file with '.png','.gif','.jpg'";
            res.render('index.ejs',{message: message});
          }	
		

	});

	app.get('/blog.html',isLoggedIn,function(req,res){
		res.sendFile('./modist/blog.html');
	})

	app.get('/orders',isLoggedIn, function(req, res){

		connection.query("SELECT * FROM Orders WHERE buyerID ='"+ req.user.id+"' order by createdAt DESC",function(err, result){

			if(err) return ;

			res.render('orders',{orders : result});

		})

	})

	app.get('/:total', function(req,res){
		res.render('checkout.ejs',{total:req.params.total});
	});
	
	app.post('/sendotp',async function(req,res){
		console.log("otp method");
		const {phone} = req.body;
		console.log(phone);
		const from = "ashish.kumarcs0101@gmail.com"; 
		//const text = "Otp"
		const otp = Math.floor(1000 + Math.random() * 9000);
		const mailOptions = {
			from: from, // Replace with your sender email
			to: phone,
			subject: 'Your OTP from e-Mandi',
			text: `Your OTP is ${otp}`
		  };
		
		  try {
			await transporter.sendMail(mailOptions);
			console.log('OTP sent successfully');
			res.status(200).json({ message: 'OTP sent to your email!',otp:otp });
		  } catch (error) {
			console.error(error);
			res.status(500).json({ message: 'Error sending OTP' });
		  }
	})

	app.post('/processOrder', function(req, res){
		const {street , city , phone , pin} = req.body;
		connection.query("SELECT * FROM Cart WHERE id='"+ req.user.id+"'",function(err, result){
			for(var i=0; i<result.length; i++){
				var insertQuery = "INSERT INTO Orders ( buyerID , sellerID , title , quantity ,image ,price ,street , phone , pinCode , city,status) values(?,?,?,?,?,?,?,?,?,?,?)";
				connection.query(insertQuery,[req.user.id,result[i].sellerID,result[i].title,result[i].quantity,result[i].image,result[i].price,street,phone,pin,city,'pending'],function(err, rows) {
					//newUserMysql.id = rows.insertId;
					if(err) {
						console.log("error ", err);
						return;
					}

					console.log(rows);

					//return done(null, rows);
				});
			}
			connection.query("delete from cart where id = '"+ req.user.id+"' ", function(err, rows){
				if(err) return ;
				console.log(rows);
			})
			res.redirect('/orders');
		});
	})

	

	app.get('*', function(req,res){
		var pathName = url.parse(req.url).pathname;
		console.log(pathName);
		res.sendFile(path.join(__dirname, '../views' + pathName));
	});

}

// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();
	// if they aren't redirect them to the home page
	res.redirect('/login');
};	

function savePrefernces(req	, response, next) {
	if(!req.cookies.preferences){
		var ob = {}
		
		response.cookie('preferences', JSON.stringify(ob), {
            maxAge: 3600000*24*30, // Expires in 1 hour (in milliseconds)
            httpOnly: true // Cookie cannot be accessed by client-side JavaScript
        });
        
    } 
	next();
}

function validation(req, res, next) {
	next();
}
