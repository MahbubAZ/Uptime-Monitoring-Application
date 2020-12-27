/*
 * Title: Utilities
 * Description: Important utilities functions
 * Author: Mohammad Mahbubur Rahman
 * Date: 20/12/2020
 */

// Dependencies
const crypto = require('crypto');
const environments = require('./environments');

// Module scaffolding
const utilities = {};

// Parse JSON object to string
utilities.parseJSON = (jsonString) => {
    let output;
    try{
        output = JSON.parse(jsonString);
    }
    catch{
        output = {};
    }
    return output;
}

// Convert into Hash string
utilities.hash = (str) => {
    if(typeof(str) === 'string' && str.length > 0){
        const hash = crypto.createHmac("sha256", environments.secretKey)
        .update(str)
        .digest("hex");
        return hash;
    }
    return false;
}

// Create random string
utilities.createRandomString = (strLength) => {
    //let length = strLength;
    length = typeof(strLength) === 'number' && strLength > 0 ? strLength : false;
    if(length){
        const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let output = '';
        for(let i=1; i<=strLength; i+=1){
            let randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            output += randomCharacter;
        }
        return output;
    }
    return false;
}

// Export module
module.exports = utilities;