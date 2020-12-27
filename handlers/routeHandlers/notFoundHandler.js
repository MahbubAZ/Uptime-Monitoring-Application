/*
 * Title: Not Found Handler
 * Description: 404 Not Found Handler
 * Author: Mohammad Mahbubur Rahman
 * Date: 16/12/2020
 */

// Module scaffolding
const handler = {};

handler.notFoundHandler = (requestProperties, callback) => {
    callback(404, {
        message: "Your Request URL Was Not Found!!"
    });
};

module.exports = handler;