/*
 * Title: 
 * Description: 
 * Author: Mohammad Mahbubur Rahman
 * Date: 15/12/2020
 */

// Dependencies
const fs = require('fs');
const path = require('path');
const { StringDecoder } = require('string_decoder');
const { isRegExp } = require('util');

const lib = {};

// Base directory of the data folder
lib.basedir = path.join(__dirname, '/../.data/');

// Write data to file
lib.create = function(dir, file, data, callback){
    // Open file for writing
    fs.open(`${lib.basedir + dir}/${file}.json`, 'wx', function(err, fileDescriptor){ // `${lib.basedir + dir}/${file}.json`
        console.log(err);
        if(!err && fileDescriptor){
            // Convert data to string
            const stringData = JSON.stringify(data);

            // Write data to file and close it
            fs.writeFile(fileDescriptor, stringData, function(err2){
                if(!err2){
                    fs.close(fileDescriptor, function(err3){
                        if(!err3){
                            callback(false);
                        }
                        else{
                            callback('Error!! Closing the new file.');
                        }
                    })
                }
                else{
                    callback('Error!! Writing to new file.');
                }
            });
        }
        else{
            callback('There was an error, file may already exists!!');
        }
     });
}

// Read data from file
lib.read = function(dir, file, callback){
    fs.readFile(`${lib.basedir + dir}/${file}.json`, 'utf8', (err, data) => { // {lib.basedir + dir}
        callback(err, data);
    });
}

// Update existing file.
lib.update = (dir, file, data, callback) => {
    // File open for writing
    fs.open(`${lib.basedir + dir}/${file}.json`, 'r+', (err1, fileDescriptor) => { // `${lib.basedir + dir}/${file}.json`
        if(!err1 && fileDescriptor){
            // Convert data to string
            const stringData = JSON.stringify(data);

            // Turncate the file
            fs.ftruncate(fileDescriptor, (err2) => {
                if(!err2){
                    // Write to the file and close it
                    fs.writeFile(fileDescriptor, stringData, (err3) => {
                        if(!err3){
                            // Close the file
                            fs.close(fileDescriptor, (err4) => {
                                if(!err4){
                                    callback(false);
                                }
                                else{
                                    callback('Error closing file.');
                                }
                            })
                        }
                        else{
                            callback('Error writing to the file.');
                        }
                    });
                }
                else{
                    callback('Error!! Turncating file.');
                }
            });
        }
        else{
            console.log(`Error updating!! File may not exists.`);
        }
    });
}

// Delete existing file.
lib.delete = (dir, file, callback) => {
    // Unlink file
    fs.unlink(`${lib.basedir + dir}/${file}.json`, (err) => { // `${lib.basedir + dir}/${file}.json`
        if(!err){
            callback(false);
        }
        else{
            callback('Error!! Deleting file.');
        }
    });
}

module.exports = lib;
