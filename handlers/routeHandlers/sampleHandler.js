/*
 * Title: Sample Handler
 * Description: Sample Handler
 * Author: Mohammad Mahbubur Rahman
 * Date: 16/12/2020
 */

// Module scaffolding
const handler = {};

handler.sampleHandler = (requestProperties, callback) => {
    console.log(requestProperties);
    callback(200, {
        message: "This is a sample url.",
    });
};

module.exports = handler;