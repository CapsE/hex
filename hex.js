/**
 * Created by Lars on 17.10.2016.
 */

var JiraClient = require('jira-connector');
var fs = require('fs');
var path = require('path')

var $PATH = process.cwd();
var ENV = require('./hex-config');
var local_env = require($PATH + '/hex-config');

for(var key in local_env){
    ENV[key] = local_env[key];
}

var CMD = process.argv[2] || "";
var VALUE = process.argv[3] || "";


var Git = require('simple-git')();
var program = require('commander');

try{
    var jira = new JiraClient( {
        host: ENV["jira-url"],
        basic_auth: {
            username: ENV["jira-user"],
            password: ENV["jira-password"]
        }
    });
}catch(e){
    console.log("Jira Connection not possible");
}


program
    .version('0.0.1')
    .option('-f, --feature [name]', 'Create new feature');

program.parse(process.argv);

if(program.feature){
    feature(program.feature);
}

function feature(id) {
    //console.log("Creating feature", ENV.jira +  program.feature);
    console.log("Looking for ", ENV.project +  id);
    jira.issue.getIssue({
        issueKey: ENV.project +  id
    }, function(error, issue) {
        if(error){
            console.log("Error: ", error);
        }else{
            Git.checkout("-b" + ENV.project +  id);
            Git.branch("--edit-description" + issue.fields.summary);
            console.log("Created Branch for: ", ENV.project +  id + ":" + issue.fields.summary);
        }
    });
}

function checkout(id){
    var ex = /[0-9]+/.test(id);
    if(ex){
        Git.checkout(ENV.project +  id);
    }else{
        Git.checkout(id);
    }
}

function merge(id) {
    var ex = /[0-9]+/.test(id);
    if(ex){
        Git.merge(ENV.project +  id);
    }else{
        Git.merge(id);
    }
}

function config(pair){
    var p = pair.split(":");
    ENV[p[0]] = p[1];
    fs.writeFile(path.resolve(__dirname, "hex-config.json"), JSON.stringify(ENV, null, ' '));
}

switch(CMD) {
    case "f":
        feature(VALUE);
        break;
    case "go":
        checkout(VALUE);
        break;
    case "mg":
        merge(VALUE);
        break;
    case "config":
        config(VALUE);
}
