/*
 * Title: Uptime Monitoring Application
 * Description: A RESTful API to monitor up or down time of user define links
 * Author: Mohammad Mahbubur Rahman
 * Date: 15/12/2020
 */

// Dependencies
const http = require('http');
const {handleReqRes} = require('./helpers/handleReqRes');
const environment = require('./helpers/environments');
//const data = require('./lib/data');
const {sendTwilioSms} = require('./helpers/notifications');

// app object - module sacffolding
const app = {};

// Testing file system.

// data.read('test', 'newFile', function(err, result){
//     console.log(err, result);
// });

// data.update('test', 'newFile', {name: "Anwar", lives: "Feni"}, function(err){
//     console.log(err);
// });

// data.delete('test', 'newFile', function(err){
//     console.log(err);
// });

// @TODO remove later
sendTwilioSms('01845248221', 'Hi, I am from Twilio API...', (err) => {
    console.log(`This is the error `, err);
});

// create server
app.createServer = () => {
    const server = http.createServer(app.handleReqRes);
    server.listen(environment.port, () => {
        console.log(`Listening to port: ${environment.port}`);
    })
};

// Handle Request Response
app.handleReqRes = handleReqRes;

// Start the server
app.createServer();