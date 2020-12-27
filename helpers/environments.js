/*
 * Title: Environments
 * Description: Handle all environments related things
 * Author: Mohammad Mahbubur Rahman
 * Date: 17/12/2020
*/

// Dependencies

// Module scaffolding
const environments = {};

environments.staging = {
    port: '3000',
    envName: 'staging',
    secretKey: 'fdsjfskfjsfd',  // value just for giving
    maxChecks: 5,
    twilio: {
        fromPhone: '+15015108009',
        accountSid: 'AC2c4f48f8c8b8a5fc78da44d90c299db9',
        authToken: '07e2a45995179116be7d14bff5a9d8db',
    }
};

environments.production = {
    port: '5000',
    envName: 'production',
    secretKey: 'gfjgksfjkk',  // value just for giving
    maxChecks: 5,
    twilio: {
        fromPhone: '+15015108009',
        accountSid: 'AC2c4f48f8c8b8a5fc78da44d90c299db9',
        authToken: '07e2a45995179116be7d14bff5a9d8db',
    }
};

// Determine which environment was passed
const currentEnvironment = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'staging';
console.log(currentEnvironment);
// Export corresponding environment object
const environmentToExport = typeof environments[currentEnvironment] === 'object' ? environments[currentEnvironment] : environments.staging;

// Export module
module.exports = environmentToExport;