/*
 * Title: User Handler
 * Description: Handler to handle user related routes
 * Author: Mohammad Mahbubur Rahman
 * Date: 20/12/2020
 */

// Dependencies
const data = require('../../lib/data');
const {hash} = require('../../helpers/utilities');
const {parseJSON} = require('../../helpers/utilities');
const tokenHandler = require('./tokenHandler');

// Module scaffolding
const handler = {};

handler.userHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if(acceptedMethods.indexOf(requestProperties.method) > -1){
        handler._users[requestProperties.method](requestProperties, callback);
    }
    else{
        callback(405);
    };
};

handler._users = {};

handler._users.post = (requestProperties, callback) => {
    const firstName = typeof(requestProperties.body.firstName) === 'string' && requestProperties.body.firstName.trim().length > 0 ? requestProperties.body.firstName : false;

    const lastName = typeof(requestProperties.body.lastName) === 'string' && requestProperties.body.lastName.trim().length > 0 ? requestProperties.body.lastName : false;

    const phone = typeof(requestProperties.body.phone) === 'string' && requestProperties.body.phone.trim().length === 11 ? requestProperties.body.phone : false;

    const password = typeof(requestProperties.body.password) === 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;

    const tosAgreement = typeof(requestProperties.body.tosAgreement) === 'boolean' && requestProperties.body.tosAgreement ? requestProperties.body.tosAgreement : false;

    if(firstName && lastName && phone && password && tosAgreement){
        // Make sure that the user doesn't already exists.
        data.read('users', phone, (err1) => {
            if(err1){
                let userObject = {
                    firstName,
                    lastName,
                    phone,
                    password: hash(password),
                    tosAgreement,
                };

                // Store the user to DB
                data.create('users', phone, userObject, (err2) => {
                    if(!err2){
                        callback(200, {
                            message: 'User was created successfully.'
                        });
                    }
                    else{
                        callback(500, {
                            error: 'Couldn\'t create user.'
                        });
                    }
                });
            }
            else{
                callback(500, {
                    error: 'There was a problem in server side.'
                });
            }
        });
    }
    else{
        callback(400, {
            error: 'You have a problem in your request.'
        });
    }
}

handler._users.get = (requestProperties, callback) => {
    // Check the phone number if valid
    const phone = typeof(requestProperties.queryStringObject.phone) === 'string' && requestProperties.queryStringObject.phone.trim().length === 11 ? requestProperties.queryStringObject.phone : false;

    if(phone){
        // Verify token
        let token = typeof(requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token : false;

        tokenHandler._token.verify(token, phone, (tokenId) => {
            console.log(tokenId);
            if(tokenId){
                // Lookup the user
                data.read('users', phone, (err, u) => {
                    /*
                        u is a string. I have to convert string into JSON object because of I have to delete password from that object. Object cannot directly copy to another location that's why use spread operator(...) and it is immutable copy.
                    */
                    const user = {...parseJSON(u)};
                    if(!err && user){
                        delete user.password;
                        callback(200, user);
                    }
                    else{
                        callback(404, {
                            'error': 'Requested user was not found'
                        });
                    }
                });
            }
            else{
                callback(403, {
                    error: 'Authentication failure!'
                })
            }
        });
    }
    else{
        callback(404, {
            'error': 'Requested user was not found'
        });
    }
}

handler._users.put = (requestProperties, callback) => {
    // Check the phone number if valid
    const phone = typeof(requestProperties.body.phone) === 'string' && requestProperties.body.phone.trim().length === 11 ? requestProperties.body.phone : false;

    const firstName = typeof(requestProperties.body.firstName) === 'string' && requestProperties.body.firstName.trim().length > 0 ? requestProperties.body.firstName : false;

    const lastName = typeof(requestProperties.body.lastName) === 'string' && requestProperties.body.lastName.trim().length > 0 ? requestProperties.body.lastName : false;

    const password = typeof(requestProperties.body.password) === 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;    

    if(phone){
        if(firstName || lastName || password){
            // Verify token
            let token = typeof(requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token : false;

            tokenHandler._token.verify(token, phone, (tokenId) => {
                console.log(tokenId);
                if(tokenId){
                    //Lookup the user
                    data.read('users', phone, (err1, uData) => {
                        // We have to work with JSON object not string object that is why below that statement
                        const userData = {...parseJSON(uData)}; 
                        if(!err1 && userData){
                            if(firstName){
                                userData.firstName = firstName;
                            }
                            if(lastName){
                                userData.lastName = lastName;
                            }
                            if(password){
                                userData.password = hash(password);
                            }

                            // Store to database
                            data.update('users', phone, userData, (err2) => {
                                if(!err2){
                                    callback(200, {
                                        message: 'Updated successfully.'
                                    });
                                }
                                else{
                                    callback(500, {
                                        error: 'There was a problem in server side.'
                                    });
                                }
                            });
                        }
                        else{
                            callback(400, {
                                error: 'You have a problem in your request.'
                            })
                        }
                    });
                }
                else{
                    callback(403, {
                        error: 'Authentication failure!'
                    })
                }
            });
        }
        else{
            callback(400, {
                error: 'You have a problem in your request.'
            });
        }
    }
    else{
        callback(400, {
            error: 'Invalid phone number. Please try again.'
        });
    }
}

handler._users.delete = (requestProperties, callback) => {
    // Check the phone if valid.
    const phone = typeof(requestProperties.queryStringObject.phone) === 'string' && requestProperties.queryStringObject.phone.trim().length === 11 ? requestProperties.queryStringObject.phone : false;

    if(phone){
        // Verify token
        let token = typeof(requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token : false;

        tokenHandler._token.verify(token, phone, (tokenId) => {
            if(tokenId){
                // Lookup the user
                data.read('users', phone, (err, userData) => {
                    if(!err && userData){
                        data.delete('users', phone, (err2) => {
                            if(!err2){
                                callback(200, {
                                    message: 'User data is successfully deleted.'
                                });
                            }
                            else{
                                callback(500, {
                                    error: 'There was a server side error.'
                                });
                            }
                        })
                    }
                    else{
                        callback(500, {
                            error: 'There was server side error!!'
                        });
                    }
                });
            }
            else{
                callback(403, {
                    error: 'Authentication failure!'
                })
            }
        });
    }
    else{
        callback(400, {
            error: 'There was a problem in your request.'
        });
    }
}



module.exports = handler;
