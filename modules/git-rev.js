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
    , branchList : function (){

        return new Promise(function(resolve, reject){
            exec('git branch', function (err, stdout, stderr) {
                if(err){
                    reject(err);
                }
                var array = stdout.split('\n');
                array.pop();
                var reg = /\S+/;
                for(var i = 0, y = array.length; i < y; i++ ){
                    if(array[i].indexOf("*") != -1){
                        var x = array[0];
                        var rege = /(\* +)(\S+)/;
                        var ex = rege.exec(array[i]);
                        if(ex && ex[2]){
                            array[0] = ex[2];
                            array[i] = x;
                        }

                    }else{
                        var ex = reg.exec(array[i]);
                        if(ex && ex[0]){
                            array[i] = ex[0];
                        }
                    }
                }
                resolve(array);
            });
        });

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