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
(function(){
    var git = require('./modules/git-rev');
    Git.getShort = git.short;
    Git.getLong = git.long;
    Git.getTag = git.tag;
    Git.getBranch = git.branch;
    Git.getBanchList = git.branchList;
})();

var program = require('commander');

program
    .version('0.0.1')
    .option('-nj, --no-jira', 'Don\'t check for jira ticket');

program.parse(process.argv);

try{
    var jira = new JiraClient( {
        host: ENV["jira-url"],
        basic_auth: {
            username: ENV["jira-user"],
            password: ENV["jira-password"]
        }
    });
}catch(e){
    program.nojira = true;
    console.log("Jira Connection not possible");
}

function feature(id) {
    //console.log("Creating feature", ENV.jira +  program.feature);
    if(program.noJira){
        var ex = /[0-9]+/.test(id);
        if(ex){
            Git.checkout("-b" + ENV.project +  id);
        }else{
            Git.checkout("-b" + id);
        }
    }else{
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
    Git.getBranch().then(function(b){
        var ex = /[0-9]+/.test(id);
        if(ex){
            Git.mergeFromTo(ENV.project +  id, b);
        }else{
            Git.mergeFromTo(id, b);
        }
    });
}

function branch(){
    Git.getBanchList().then(function(list){
       console.log(list);
    });
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
    case "branch":
        branch();
        break;
    case "config":
        config(VALUE);
}
