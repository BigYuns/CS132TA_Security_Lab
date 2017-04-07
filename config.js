/********************************************************************************/
/*										*/
/*	Configuration parameters for security lab server			*/
/*										*/
/********************************************************************************/

var _ = require("underscore");
var path = require("path");

var finalEnv = process.env.NODE_ENV || "development";

var PORT = process.env.PORT || 7000;
var DB_CONNECT = 'mysql://USER:PASSWORD@HOST/goat';
var COOKIE_SECRET = "SessionCookieSecretKey";
var HOSTNAME = "localhost";




/********************************************************************************/
/*										*/
/*	Exports 								*/
/*										*/
/********************************************************************************/


exports.PORT = PORT;
exports.DB_CONNECT = DB_CONNECT;
exports.COOKIE_SECRET = COOKIE_SECRET;
exports.HOSTNAME = HOSTNAME;
exports.db_config = {
	database:process.env.CLEARDB_DATABASE,
	host: process.env.CLEARDB_DATABASE_HOST,
	password:process.env.CLEARDB_PASSWORD,
	user:process.env.CLEARDB_USER
}



/* end of config.js */
