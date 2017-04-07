/********************************************************************************/
/*										*/
/*		database.js							*/
/*										*/
/*	Database query methods							*/
/*										*/
/********************************************************************************/


var adb = require("any-db");
var mysql = require('mysql'); 

var config = require("./config.js");



/********************************************************************************/
/*										*/
/*	Initializations 							*/
/*										*/
/********************************************************************************/

//var pool = adb.createPool(config.DB_CONNECT,{ min : 1, max : 4 });

 var connection = mysql.createConnection(config.db_config); 
   
   console.log(config.db_config); 

   connection.connect(function(err){
      if(err){
         console.log('69', err); 
      }else{
         console.log("CONNECTED"); 
      }
   });


/********************************************************************************/
/*										*/
/*	Query function								*/
/*										*/
/********************************************************************************/

function query(q,prms,next)
{
   console.log("db query is called"); 
   console.log(prms);
   if (prms instanceof Function) {
      next = prms;
      prms = undefined;
    }

   

   q = fixQuery(q);
   console.log("DATABASE:",q);

   //return pool.query(q,prms,callback(next)); 
   return connection.query(q, prms, callback(next)); 
   //return connection.query(q);
}



function callback(next)
{
   return function(err,data) {
      console.log(JOSN.stringify(data)); 
      if (err) console.log("DATABASE ERROR",err);
      else console.log("DATABASE RETURN",data.rows.length);
      if (next != null) next(err,data);
    }
}




/********************************************************************************/
/*										*/
/*	Handle mysql - postgresql differences on parameters			*/
/*										*/
/********************************************************************************/

function fixQuery(q)
{
   if (config.DB_CONNECT.substring(0,5) == "mysql") {
      q = q.replace(/\$\d+/g,"?");
    }

   return q;
}



/********************************************************************************/
/*										*/
/*	Exports 								*/
/*										*/
/********************************************************************************/

exports.query = query;




/* end of database.js */

