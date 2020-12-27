/*
 * Title: Notification Library
 * Description: Important functions to notify user
 * Author: Mohammad Mahbubur Rahman
 * Date: 25/12/2020
 */

// Dependencies
const https = require('https');
const querystring = require('querystring');
const {twilio} = require('./environments');

// Module Scaffolding
const notifications = {};

// Send sms to user using twilio api
notifications.sendTwilioSms = (phone, msg, callback) => {
    // Input validation
    const userPhone = typeof(phone) === 'string' && phone.trim().length === 11 ? phone.trim() : false;
    const userMsg = typeof(msg) === 'string' && msg.trim().length > 0 && msg.trim().length <=1600 ? msg.trim() : false;

    if(userPhone && userMsg){
        // Configure the request payload
        const payload = {
            From: twilio.fromPhone,
            To: `+88${userPhone}`,
            Body: userMsg,
        };
        // Stringify the payload
        const payloadStringify = querystring.stringify(payload);

        // Configure the request details
        const requestDetails = {
            hostname: 'api.twilio.com',
            method: 'POST',
            path: `/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
            auth: `${twilio.accountSid}:${twilio.authToken}`,
            headers: {
                'Content-Type': 'applications/x-www-form-urlencoded',
            },
        };

        // Instantiate the request object
        const req = https.request(requestDetails, (res) => {
            // Get the status of the sent request
            const status = res.statusCode;

            // Callback successfully if the request went through.
            if(status === 200 || status === 201){
                callback(false);
            }
            else{
                callback(`Status code returned was ${status}`);
            }
        });

        // req.on() is on fire when occur
        req.on('error', (e) => {
            callback(e);
        });
        req.write(payloadStringify);
        req.end();
    }
    else{
        callback('Given parameter were missing or invalid');
    }
}

// Export the module
module.exports = notifications;