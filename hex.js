/**
 * Created by Lars on 17.10.2016.
 */

var JiraClient = require('jira-connector');


var ENV = require('./hex-config');

var Git = require('simple-git')();
var program = require('commander');

var jira = new JiraClient( {
    host: ENV["jira-url"],
    basic_auth: {
        username: ENV["jira-user"],
        password: ENV["jira-password"]
    }
});

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
    console.log("Looking for ", ENV.project +  program.feature);
    jira.issue.getIssue({
        issueKey: ENV.project +  program.feature
    }, function(error, issue) {
        if(error){
            console.log("Error: ", error);
        }else{
            Git.checkout("-b" + ENV.project +  program.feature);
            Git.branch("--edit-description" + issue.fields.summary);
            console.log("Created Branch for: ", ENV.project +  program.feature + ":" + issue.fields.summary);
        }
    });
}

