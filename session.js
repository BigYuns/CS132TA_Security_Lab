/********************************************************************************/
/*										*/
/*		session.js							*/
/*										*/
/*	User management routines						*/
/*										*/
/********************************************************************************/



/********************************************************************************/
/*										*/
/*	Imports 								*/
/*										*/
/********************************************************************************/

var db = require("./database.js");



/********************************************************************************/
/*										*/
/*	Handle Checking for admin login 					*/
/*										*/
/********************************************************************************/

function isAdminUserMiddleware(req,res,next)
{
   if (req.session.userId) {
      var q = "SELECT * FROM User WHERE userId = " + req.session.userId;
      db.query(q,function (e1,d1) { isAdminUserMiddleware1(req,res,next,e1,d1) } );
    }
   else {
      console.log("redirecting to login");
      return res.redirect("/login");
    }
}


function isAdminUserMiddleware1(req,res,next,err,data)
{
   if (err == null && data.rows.length == 1 && data.rows[0].isAdmin) {
      next();
    }
   else {
      console.log("redirecting to login");
      return res.redirect("/login");
    }
}



/********************************************************************************/
/*										*/
/*	Handle checking for normal login					*/
/*										*/
/********************************************************************************/

function isLoggedInMiddleware(req,res,next)
{
   if (req.session.userId) next();
   else {
      console.log("redirecting to login");
      return res.redirect("/login");
    }
}



/********************************************************************************/
/*										*/
/*	Display login page							*/
/*										*/
/********************************************************************************/

function displayLoginPage(req,res)
{
   return res.render("login", { userName: "",
				password: "",
				loginError: "" });
}


/********************************************************************************/
/*										*/
/*	Handle login request							*/
/*										*/
/********************************************************************************/

function handleLoginRequest(req,res,next)
{
   var username = req.body.userName;
   var password = req.body.password;

   var q = "SELECT * FROM User U WHERE U.userName = '" + username + "'";
   db.query(q,function (e1,d1) { handleLoginRequest1(req,res,next,e1,d1); } );
}




function handleLoginRequest1(req,res,next,err,data)
{
   var username = req.body.userName;
   var password = req.body.password;

   var invalidUserNameErrorMessage = "Invalid username";
   var invalidPasswordErrorMessage = "Invalid password";

   if (err) next(err);
   else if (data.rows.length != 1) {
      return res.render("login", { userName : username,
				      password : "",
				      loginError : invalidUserNameErrorMessage } );
    }
   else {
      var userdata = data.rows[0];
      if (!comparePassword(password,userdata.password)) {
	 return res.render("login", { userName : username,
				      password : "",
				      loginError : invalidPasswordErrorMessage } );
       }

      req.session.userId = userdata.userId;
      if (userdata.isAdmin) return res.redirect("/benefits");
      else return res.redirect("/dashboard");
    }
}


function comparePassword(fromdb,fromuser)
{
   return fromdb == fromuser;
}




/********************************************************************************/
/*										*/
/*	Handle Display logout page						*/
/*										*/
/********************************************************************************/

function displayLogoutPage(req,res)
{
   req.session.destroy(function () { displayLogoutPage1(req,res) });
}



function displayLogoutPage1(req,res)
{
   res.redirect("/");
}



/********************************************************************************/
/*										*/
/*	Handle Display Signup Page						*/
/*										*/
/********************************************************************************/

function displaySignupPage(req,res)
{
   res.render("signup", { userName: "",
			  password: "",
			  passwordError: "",
			  email: "",
			  userNameError: "",
			  emailError: "",
			  verifyError: ""
	       });
}




/********************************************************************************/
/*										*/
/*	Handle Validate Signup							*/
/*										*/
/********************************************************************************/

function handleSignup(req,res,next)
{
   var email = req.body.email;
   var userName = req.body.userName;
   var firstName = req.body.firstName;
   var lastName = req.body.lastName;
   var password = req.body.password;
   var verify = req.body.verify;

   // set these up in case we have an error case
   var errors = {
      "userName": userName,
      "email": email
    };

   if (validateSignup(userName, firstName, lastName, password, verify, email, errors)) {
      var q = "SELECT * FROM User U WHERE U.userName = '" + userName + "'";
      db.query(q,function (e1,d1) { handleSignup1(req,res,next,errors,e1,d1); });
    }
    else {
       console.log("user did not validate");
       return res.render("signup", errors);
    }
}


function handleSignup1(req,res,next,errors,err,data)
{
   var email = req.body.email;
   var userName = req.body.userName;
   var firstName = req.body.firstName;
   var lastName = req.body.lastName;
   var password = req.body.password;
   var verify = req.body.verify;   
   
   if (err != null) return next(err);
   if (data.rows.length != 0) {
      errors.userNameError = "User name already in use. Please choose another";
      return res.render("signup", errors);
    }

   var q = "INSERT INTO User ( userName, firstName, lastName, password, email) " +
      "VALUES ( '" + userName + "','" + firstName + "','" + lastName + "','" +
      password + "','" + email + "')";
   db.query(q,function(e1,d1) { handleSignup2(req,res,next,e1,d1); } );
}



function handleSignup2(req,res,next,err,data)
{
   if (err != null) return next(err);
   
   var userName = req.body.userName;
   
   var q = "SELECT * FROM User U WHERE U.userName = '" + userName + "'";
   db.query(q,function (e1,d1) { handleSignup3(req,res,next,e1,d1); } );
}


function handleSignup3(req,res,next,err,data)
{
   if (err != null) return next(err);

   var user = data.rows[0];

   prepareUserData(user,next);

   req.session.regenerate(function () { handleSignup4(req,res,next,user); });
}


function handleSignup4(req,res,next,user)
{
   req.session.userId = user.userId;
   return res.render("dashboard",user);
}



function validateSignup(username,firstname,lastname,password,verify,email,errors)
{
   var USER_RE = /^.{1,20}$/;
   var FNAME_RE = /^.{1,100}$/;
   var LNAME_RE = /^.{1,100}$/;
   var EMAIL_RE = /^[\S]+@[\S]+\.[\S]+$/;
   var PASS_RE = /^.{1,20}$/;

   errors.userNameError = "";
   errors.firstNameError = "";
   errors.lastNameError = "";

   errors.passwordError = "";
   errors.verifyError = "";
   errors.emailError = "";

   if (!USER_RE.test(username)) {
      errors.userNameError = "Invalid user name.";
      return false;
    }
   if (!FNAME_RE.test(firstname)) {
      errors.firstNameError = "Invalid first name.";
      return false;
    }
   if (!LNAME_RE.test(lastname)) {
      errors.lastNameError = "Invalid last name.";
      return false;
    }
   if (!PASS_RE.test(password)) {
      errors.passwordError = "Password must be 8 to 18 characters" +
	 " including numbers, lowercase and uppercase letters.";
      return false;
    }
   if (password !== verify) {
      errors.verifyError = "Password must match";
      return false;
    }
   if (email !== "") {
      if (!EMAIL_RE.test(email)) {
	 errors.emailError = "Invalid email address";
	 return false;
       }
    }
   return true;
}



/********************************************************************************/
/*										*/
/*	Setup a new user							*/
/*										*/
/********************************************************************************/

function prepareUserData(user,next)
{
   var stocks = Math.floor((Math.random() * 40) + 1);
   var funds = Math.floor((Math.random() * 40) + 1);
   var bonds = 100 - (stocks + funds);

   var q = "INSERT INTO Allocations (userId,stocks,funds,bonds) VALUES ( " +
      user.userId + "," + stocks + "," + funds + "," + bonds + ")";
   db.query(q,function (e1,d1) { prepareUserData1(user,next,e1,d1); } );
}


function prepareUserData1(user,next,err,data)
{
   if (err != null) return next(err);

   var q = "INSERT INTO Profile (userid) VALUES ( " + user.userId + ")";
   db.query(q,function(e1,d1) { prepareUserData2(user,next,e1,d1); } );
}


function prepareUserData2(user,next,err,data)
{
   if (err != null) return next(err);

   var q = "INSERT INTO Contributions (userid) VALUES ( " + user.userId + ")";
   db.query(q,function(e1,d1) { prepareUserData3(user,next,e1,d1); } );
}


function prepareUserData3(user,next,err,data)
{
   if (err != null) return next(err);
}



/********************************************************************************/
/*										*/
/*	Handle Display welcome page						*/
/*										*/
/********************************************************************************/

function displayWelcomePage(req,res,next)
{
   var userId;

   if (!req.session.userId) {
      console.log("welcome: Unable to identify user...redirecting to login");

      return res.redirect("/login");
    }

   userId = req.session.userId;

   var q = "SELECT * FROM User WHERE userId = " + userId;
   db.query(q,function (e1,d1) { displayWelcomePage1(req,res,next,e1,d1); } );
}



function displayWelcomePage1(req,res,next,err,data)
{
   if (err != null) return next(err);

   var user = data.rows[0];
   return res.render("dashboard",user);
}



/********************************************************************************/
/*										*/
/*	Exports 								*/
/*										*/
/********************************************************************************/

exports.isAdminUserMiddlewarr = isAdminUserMiddleware;
exports.isLoggedInMiddleware = isLoggedInMiddleware;
exports.displayLoginPage = displayLoginPage;
exports.handleLoginRequest = handleLoginRequest;
exports.displayLogoutPage = displayLogoutPage;
exports.displaySignupPage = displaySignupPage;
exports.handleSignup = handleSignup;
exports.displayWelcomePage = displayWelcomePage;




/* end of session.js */
