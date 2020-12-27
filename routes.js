/*
 * Title: Routes
 * Description: Application Routes
 * Author: Mohammad Mahbubur Rahman
 * Date: 16/12/2020
 */

 // Dependencies
 const {sampleHandler} = require('./handlers/routeHandlers/sampleHandler');
 const {userHandler} = require('./handlers/routeHandlers/userHandler');
 const {tokenHandler} = require('./handlers/routeHandlers/tokenHandler');
 const {checkHandler} = require('./handlers/routeHandlers/checkHandler');

 // In end of url, we will use /sample or /user or /token or /check corresponding to handler routes.
 const routes = {
     sample: sampleHandler,
     user: userHandler,
     token: tokenHandler,
     check: checkHandler,
 };

 module.exports = routes;
