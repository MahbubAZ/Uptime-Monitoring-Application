/*
 * Title: Handle Request Response
 * Description: Handle Request Response
 * Author: Mohammad Mahbubur Rahman
 * Date: 16/12/2020
 */

 // Dependencies 
const url = require('url');
const {StringDecoder} = require('string_decoder');
const routes = require('../routes');
const {notFoundHandler} = require('../handlers/routeHandlers/notFoundHandler');
const {parseJSON} = require('../helpers/utilities');

 // Module scaffolding
 const handler = {};

handler.handleReqRes = (req, res) => {
    // Request handling
    // Get the url and parse it
    const parseUrl = url.parse(req.url, true);  // true - For consider query string
    const path = parseUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '')  // Eliminate slash from pathname
    const method = req.method.toLowerCase();    // What method we have used (e.g. GET,POST,DELETE etc)
    const queryStringObject = parseUrl.query;   // Store query string
    const headersObject = req.headers;      // Store default & user created headers

    const requestProperties = {
        parseUrl,
        path,
        trimmedPath,
        method,
        queryStringObject,
        headersObject,
    };

    const decoder = new StringDecoder('utf-8');
    let realData = '';

    req.on('data', (buffer) => {
        realData += decoder.write(buffer);
    });

    req.on('end', () => {
        realData += decoder.end();

        requestProperties.body = parseJSON(realData);
        
        const chosenHandler = routes[trimmedPath] ? routes[trimmedPath] : notFoundHandler;
        chosenHandler(requestProperties, (statusCode, payload) => {
            statusCode = typeof statusCode === 'number' ? statusCode : 500;
            payload = typeof payload === 'object' ? payload : {};
            const payloadString = JSON.stringify(payload);

            // Return the final response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
        });

        // Response handle
        //res.end('Hello, Programmers!!');
    });
};

 module.exports = handler;