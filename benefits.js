/********************************************************************************/
/*										*/
/*		benefits.js							*/
/*										*/
/*	Handle benefits pages							*/
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
/*	Handle displaying the benefits page					*/
/*										*/
/********************************************************************************/

function displayBenefits(req,res,next)
{
    displayBenefits0(req,res,next,false);
}
   


function displayBenefits0(req,res,next,succ)
{
   var q = "SELECT * FROM User U WHERE U.isAdmin = FALSE";

   db.query(q,function (e1,d1) { displayBenefits1(req,res,next,succ,e1,d1); } );
}



function displayBenefits1(req,res,next,succ,err,data)
{
   if (err) return next(err);

   for (var i = 0; i < data.rows.length; ++i) {
       var date = data.rows[i].benefitStartDate;
       var mon = date.getMonth() + 1;
       if (mon < 10) mon = "0"+mon;
       var string = date.getFullYear() + "-" + mon + "-" + date.getDate();
       console.log("CONVERT",date,string);
       data.rows[i].benefitStartDate = string;
    }
   
   var doc = { users : data.rows, user : { isAdmin : true } };

   if (succ) doc.updateSuccess = true;

   return res.render("benefits",doc);
}




/********************************************************************************/
/*										*/
/*	Handle update benefits							*/
/*										*/
/********************************************************************************/

function updateBenefits(req,res,next)
{
   var userid = req.body.userId;
   var date = req.body.benefitStartDate;

   var q = "UPDATE User SET benefitStartDate = '" + date + "' WHERE userId = " + userid;
   db.query(q,function(e1,d1) { updateBenefits1(req,res,next,e1,d1); } );
}




function updateBenefits1(req,res,next,err,data)
{
   if (err) return next(err);

   return displayBenefits0(req,res,next,true);
}



/********************************************************************************/
/*										*/
/*	Exports 								*/
/*										*/
/********************************************************************************/

exports.displayBenefits = displayBenefits;
exports.updateBenefits = updateBenefits;




/* end of benefits.js */
