/**
 * Created by Lars on 17.10.2016.
 */

const readline = require('readline');
var fs = require('fs');
var Git = require('simple-git')();
var env = {};

function init(){

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    try {
        fs.accessSync(".git", fs.F_OK);
    } catch (e) {
        Git.init();
    }
    rl.write("DEV");
    rl.on('line', (input) => {
        console.log(`Received: ${input}`);
    });



    rl.on("close", function(){
        process.exit();
    });
}

module.exports = init;
