/********************************************************************************/
/*										*/
/*		allocations.js							*/
/*										*/
/*	Handle allocations pages						*/
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
/*	Hnadle displaying allocations						*/
/*										*/
/********************************************************************************/

function displayAllocations(req,res,next)
{
   var userId = req.params.userId;
   
   var threshold = req.query.threshold;
 
   var q = "SELECT * FROM Allocations WHERE userId = " + userId;
   if (threshold) {
       var thint = threshold*1;
       if (thint >= 0 && thint <= 99) {
           q += " AND stocks > " + thint;
        }
    }
   
   db.query(q,function(e1,d1) { displayAllocations1(req,res,next,e1,d1); } );
}



function displayAllocations1(req,res,next,err,data)
{
   if (err) return next(err);

   var doc = data.rows[0];

   return res.render("allocations",doc);
}




/********************************************************************************/
/*										*/
/*	Exports 								*/
/*										*/
/********************************************************************************/

exports.displayAllocations = displayAllocations;




/* end of alloations.js */
