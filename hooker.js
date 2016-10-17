/**
 * Created by Lars on 17.10.2016.
 */

var ENV = require('./street');

var Init = require('./init');
var Git = require('simple-git')();
var program = require('commander');

program
    .version('0.0.1')
    .option('-f, --feature [name]', 'Create new feature')
    .arguments('do [env]')
    .action(function (cmd, env) {
        cmdValue = cmd;
        envValue = env;
        console.log("Executing", cmd);
    });

program.parse(process.argv);

if(program.feature){
    //console.log("Creating feature", ENV.jira +  program.feature);
    Git.checkout("-b" + ENV.jira +  program.feature);
}

Init();

