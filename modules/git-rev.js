/**
 * Created by Lars on 30.10.2016.
 */

var exec = require('child_process').exec;

function _command (cmd, cb) {
    if(cb){
        exec(cmd, function (err, stdout, stderr) {
            cb(stdout.split('\n').join(''));
        });
    }else{
        return new Promise(function(resolve, reject){
            exec(cmd, function (err, stdout, stderr) {
                if(err){
                    reject(err);
                }
                resolve(stdout.split('\n').join(''));
            });
        });
    }
}

module.exports = {
    short : function (cb) {
        return _command('git rev-parse --short HEAD', cb)
    }
    , long : function (cb) {
        return _command('git rev-parse HEAD', cb)
    }
    , branch : function (cb) {
        return _command('git rev-parse --abbrev-ref HEAD', cb)
    }
    , tag : function (cb) {
        return _command('git describe --always --tag --abbrev=0', cb)
    }
    , log : function (cb) {
        return _command('git log --no-color --pretty=format:\'[ "%H", "%s", "%cr", "%an" ],\' --abbrev-commit', function (str) {
            str = str.substr(0, str.length-1);
            cb(JSON.parse('[' + str + ']'));
        });
    }
};