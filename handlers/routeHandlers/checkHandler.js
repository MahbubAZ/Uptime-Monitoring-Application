/*
 * Title: Check Handler
 * Description: Handler to handle user defined check
 * Author: Mohammad Mahbubur Rahman
 * Date: 23/12/2020
 */

// Dependencies
const data = require('../../lib/data');
const {parseJSON, createRandomString} = require('../../helpers/utilities');
const tokenHandler = require('./tokenHandler');
const {maxChecks} = require('../../helpers/environments');
const { check } = require('prettier');

// Module scaffolding
const handler = {};

handler.checkHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if(acceptedMethods.indexOf(requestProperties.method) > -1){
        handler._check[requestProperties.method](requestProperties, callback);
    }
    else{
        callback(405);
    };
};

handler._check = {};

handler._check.post = (requestProperties, callback) => {
    // Validate inputs
    let protocol = typeof(requestProperties.body.protocol) === 'string' && ['http', 'https'].indexOf(requestProperties.body.protocol) > -1 ? requestProperties.body.protocol : false;

    let url = typeof(requestProperties.body.url) === 'string' && requestProperties.body.url.trim().length > 0 ? requestProperties.body.url : false;

    let method = typeof(requestProperties.body.method) === 'string' && ['POST', 'GET', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1 ? requestProperties.body.method : false;

    // successCodes must be an array which contains 200, 201, etc. And we know array type is object 
    let successCodes = typeof(requestProperties.body.successCodes) === 'object' && requestProperties.body.successCodes instanceof Array ? requestProperties.body.successCodes : false;

    let timeOutSeconds = typeof(requestProperties.body.timeOutSeconds) === 'number' && requestProperties.body.timeOutSeconds % 1 === 0 && requestProperties.body.timeOutSeconds >=1 && requestProperties.body.timeOutSeconds <=5 ? requestProperties.body.timeOutSeconds : false;

    if(protocol && url && method && successCodes && timeOutSeconds){
        let token = typeof(requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token : false;
        // Lookup the user phone by reading the token
        data.read('tokens', token, (err1, tokenData) => {
            if(!err1 && tokenData){
                let userPhone = parseJSON(tokenData).phone;
                // Lookup the user data
                data.read('users', userPhone, (err2, userData) => {
                    if(!err2 && userData){
                        tokenHandler._token.verify(token, userPhone, (tokenIsValid) => {
                            if(tokenIsValid){
                                let userObject = parseJSON(userData);
                                let userChecks = typeof(userObject.checks) === 'object' && userObject.checks instanceof Array ? userObject.checks : [];

                                if(userChecks.length < maxChecks){
                                    const checkId = createRandomString(20);
                                    const checkObject = {
                                        id: checkId,
                                        userPhone,
                                        protocol,
                                        url,
                                        method,
                                        successCodes,
                                        timeOutSeconds,
                                    };

                                    // Save the object
                                    data.create('checks', checkId, checkObject, (err3) => {
                                        if(!err3){
                                            // Add check id to the user's object
                                            userObject.checks = userChecks;
                                            userObject.checks.push(checkId);

                                            // Save the new user data
                                            data.update('users', userPhone, userObject, (err4) => {
                                                if(!err4){
                                                    // Return the data about the new check
                                                    callback(200, checkObject);
                                                }
                                                else{
                                                    callback(500, {
                                                        error: 'There was a problem in the server side!!'
                                                    });
                                                }
                                            });
                                        }
                                        else{
                                            callback(500, {
                                                error: 'There was a problem in the server side!!'
                                            });
                                        }
                                    });
                                }
                                else{
                                    callback(401, {
                                        error: 'User has already reached max checks limit!!'
                                    });
                                }
                            }
                            else{
                                callback(403, {
                                    error: 'Authentication problem!!'
                                });
                            }
                        });
                    }
                    else{
                        callback(403, {
                            error: 'User not found!!'
                        });
                    }
                });
            }
            else{
                callback(403, {
                    error: 'Authentication Problem!!'
                });
            }
        });
    }
    else{
        callback(400, {
            error: 'You have a problem in your request'
        });
    }
}

handler._check.get = (requestProperties, callback) => {
    const id = typeof(requestProperties.queryStringObject.id) === 'string' && requestProperties.queryStringObject.id.trim().length === 20 ? requestProperties.queryStringObject.id : false;

    if(id){
        // Lookup the check
        data.read('checks', id, (err1, checkData) => {
            if(!err1 && checkData){
                const token = typeof(requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token : false;

                tokenHandler._token.verify(token, parseJSON(checkData).userPhone, (tokenIsValid) => {
                    if(tokenIsValid){
                        callback(200, parseJSON(checkData));
                    }
                    else{
                        callback(403, {
                            error: 'Authentication failure!!'
                        });
                    }
                });
            }
            else{
                callback(500, {
                    error: 'You have a problem in your request'
                });
            }
        });
    }
    else{
        callback(400, {
            error: 'You have a problem in your request'
        });
    }
}

handler._check.put = (requestProperties, callback) => {
    const id = typeof(requestProperties.body.id) === 'string' && requestProperties.body.id.trim().length === 20 ? requestProperties.body.id : false;

    // Validate inputs
    let protocol = typeof(requestProperties.body.protocol) === 'string' && ['http', 'https'].indexOf(requestProperties.body.protocol) > -1 ? requestProperties.body.protocol : false;

    let url = typeof(requestProperties.body.url) === 'string' && requestProperties.body.url.trim().length > 0 ? requestProperties.body.url : false;
 
    let method = typeof(requestProperties.body.method) === 'string' && ['POST', 'GET', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1 ? requestProperties.body.method : false;
 
    // successCodes must be an array which contains 200, 201, etc. And we know array type is object 
    let successCodes = typeof(requestProperties.body.successCodes) === 'object' && requestProperties.body.successCodes instanceof Array ? requestProperties.body.successCodes : false;
 
    let timeOutSeconds = typeof(requestProperties.body.timeOutSeconds) === 'number' && requestProperties.body.timeOutSeconds % 1 === 0 && requestProperties.body.timeOutSeconds >=1 && requestProperties.body.timeOutSeconds <=5 ? requestProperties.body.timeOutSeconds : false;

    if(id){
        if(protocol || url || method || successCodes || timeOutSeconds){
            data.read('checks', id, (err1, checkData) => {
                if(!err1 && checkData){
                    const checkObject = parseJSON(checkData);
                    const token = typeof(requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token : false;

                    tokenHandler._token.verify(token, checkObject.userPhone, (tokenIsValid) => {
                        if(tokenIsValid){
                            if(protocol){
                                checkObject.protocol = protocol;
                            }
                            if(url){
                                checkObject.url = url;
                            }
                            if(method){
                                checkObject.method = method;
                            }
                            if(successCodes){
                                checkObject.successCodes = successCodes;
                            }
                            if(timeOutSeconds){
                                checkObject.timeOutSeconds = timeOutSeconds;
                            }
                            data.update('checks', id, checkObject, (err2) => {
                                if(!err2){
                                    callback(200);
                                }
                                else{
                                    callback(500, {
                                        error: 'There was a server side error!!'
                                    });
                                }
                            });
                        }
                        else{
                            callback(403, {
                                error: 'Authentication failure'
                            });
                        }
                    });
                }
                else{
                    callback(500, {
                        error: 'There was problem in the server side'
                    });
                }
            });
        }
        else{
            callback(400, {
                error: 'You must provide at least one field to update'
            });
        }
    }
    else{
        callback(400, {
            error: 'You have a problem in your request'
        });
    }
}

handler._check.delete = (requestProperties, callback) => {
    const id = typeof(requestProperties.queryStringObject.id) === 'string' && requestProperties.queryStringObject.id.trim().length === 20 ? requestProperties.queryStringObject.id : false;

    if(id){
        // Lookup the check
        data.read('checks', id, (err1, checkData) => {
            if(!err1 && checkData){
                const token = typeof(requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token : false;

                tokenHandler._token.verify(token, parseJSON(checkData).userPhone, (tokenIsValid) => {
                    if(tokenIsValid){
                        data.delete('checks', id, (err2) => {
                            if(!err2){
                                data.read('users', parseJSON(checkData).userPhone, (err3, userData) => {
                                    let userObject = parseJSON(userData);
                                    if(!err3 && userData){
                                        let userChecks = typeof(userObject.checks) === 'object' && userObject.checks instanceof Array ? userObject.checks : [];

                                        // Remove the deleted check id from user's list of checks
                                        let checkPosition = userChecks.indexOf(id);
                                        if(checkPosition > -1){
                                            userChecks.splice(checkPosition, 1);
                                            userObject.checks = userChecks;
                                            // Resave the user data
                                            data.update('users', userObject.phone, userObject, (err4) => {
                                                if(!err4){
                                                    callback(200);
                                                }
                                                else{
                                                    callback(500, {
                                                        error: 'There was a server side problem'
                                                    })
                                                }
                                            })
                                        }
                                        else{
                                            callback(500, {
                                                error: 'The check id that you are trying to remove is not found in user!!'
                                            })
                                        }
                                    }
                                    else{
                                        callback(500, {
                                            error: 'There was a server side problem'
                                        });
                                    }
                                });
                            }
                            else{
                                callback(500, {
                                    error: 'There was a server side problem'
                                });
                            }
                        });
                    }
                    else{
                        callback(403, {
                            error: 'Authentication failure!!'
                        });
                    }
                });
            }
            else{
                callback(500, {
                    error: 'You have a problem in your request'
                });
            }
        });
    }
    else{
        callback(400, {
            error: 'You have a problem in your request'
        });
    }
}



module.exports = handler;
