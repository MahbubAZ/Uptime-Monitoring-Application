/*
 * Title: Token Handler
 * Description: Handler to handle token related routes
 * Author: Mohammad Mahbubur Rahman
 * Date: 22/12/2020
 */

// Dependencies
const data = require('../../lib/data');
const {hash, createRandomString} = require('../../helpers/utilities');
const {parseJSON} = require('../../helpers/utilities');

// Module scaffolding
const handler = {};

handler.tokenHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if(acceptedMethods.indexOf(requestProperties.method) > -1){
        handler._token[requestProperties.method](requestProperties, callback);
    }
    else{
        callback(405);
    }
};

handler._token = {};

handler._token.post = (requestProperties, callback) => {
    const phone = typeof(requestProperties.body.phone) === 'string' && requestProperties.body.phone.trim().length === 11 ? requestProperties.body.phone : false;

    const password = typeof(requestProperties.body.password) === 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;

    if(phone && password){
        data.read('users', phone, (err1, userData) => {
            let hashedPassword = hash(password);
            if(hashedPassword === parseJSON(userData).password){
                let tokenId = createRandomString(20);
                let expires = Date.now() + 60*60*1000;
                let tokenObject = {
                    phone,
                    'id': tokenId,
                    expires
                };

                data.create('tokens', tokenId, tokenObject, (err2) => {
                    if(!err2){
                        callback(200, tokenObject);
                    }
                    else{
                        callback(500, {
                            error: 'There was a problem in server side.'
                        })
                    }
                });
            }
            else{
                callback(400, {
                    error: 'Your password in not valid.'
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

handler._token.get = (requestProperties, callback) => {
    // Check the id if valid
    const id = typeof(requestProperties.queryStringObject.id) === 'string' && requestProperties.queryStringObject.id.trim().length === 20 ? requestProperties.queryStringObject.id : false;

    if(id){
        // Lookup the token
        data.read('tokens', id, (err, tokenData) => {
            /*
                u is a string. I have to convert string into JSON object because of I have to delete password from that object. Object cannot directly copy to another location that's why use spread operator(...) and it is immutable copy.
            */
            const token = {...parseJSON(tokenData)};
            if(!err && token){
                delete token.password;
                callback(200, token);
            }
            else{
                callback(404, {
                    'error': 'Requested token was not found'
                });
            }
        });
    }
    else{
        callback(404, {
            'error': 'Requested token was not found'
        });
    }
}

handler._token.put = (requestProperties, callback) => {
    // Check the id if valid
    const id = typeof(requestProperties.body.id) === 'string' && requestProperties.body.id.trim().length === 20 ? requestProperties.body.id : false;

    // Check the id if valid
    const extend = typeof(requestProperties.body.extend) === 'boolean' && requestProperties.body.extend === true ? true : false;

    if(id && extend){
        data.read('tokens', id, (err1, tokenData) => {
            let tokenObject = parseJSON(tokenData);
            if(tokenObject.expires > Date.now()){
                tokenObject.expires = Date.now() + 60*60*1000;

                // Store the updated token
                data.update('tokens', id, tokenObject, (err2) => {
                    if(!err2){
                        callback(200);
                    }
                    else{
                        callback(500, {
                            error: 'This is server side error'
                        });
                    }
                });
            }
            else{
                callback(400, {
                    error: 'Token already expired.'
                });
            }
        });
    }
    else{
        callback(400, {
            error: 'There was a problem in your request'
        })
    }
}

handler._token.delete = (requestProperties, callback) => {
    // Check the token if valid
    const id = typeof(requestProperties.queryStringObject.id) === 'string' && requestProperties.queryStringObject.id.trim().length === 20 ? requestProperties.queryStringObject.id : false;

    if(id){
        // Lookup the token
        data.read('tokens', id, (err1, tokenData) => {
            if(!err1 && tokenData){
                data.delete('tokens', id, (err2) => {
                    if(!err2){
                        callback(200, {
                            message: 'Token was successfully deleted.'
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
        callback(400, {
            error: 'There was a problem in your request.'
        });
    }
}

// This is general purpose function
handler._token.verify = (id, phone, callback) => {
    data.read('tokens', id, (err, tokenData) => {
        if(!err && tokenData){
            if(parseJSON(tokenData).phone === phone && parseJSON(tokenData).expires > Date.now()){
                callback(true);
            }
            else{
                callback(false);
            }
        }
        else{
            callback(false);
        }
    });
}



module.exports = handler;
