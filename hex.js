/**
 * Created by Lars on 17.10.2016. PROD
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

var Git = require('simple-git')();
(function(){
    var git = require('./modules/git-rev');
    Git.getShort = git.short;
    Git.getLong = git.long;
    Git.getTag = git.tag;
    Git.getBranch = git.branch;
    Git.getBanchList = git.branchList;
    Git.command = git.command;
})();

var program = require('commander');

program
    .version('0.0.1')
    .option('-nj, --no-jira', 'Don\'t check for jira ticket');

program.parse(process.argv);

var CMD = program.args[0] || "";
var VALUE = program.args[1] || "";

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
    console.log("Jira Connection to " + ENV["jira-url"] + " not possible with user " + ENV["jira-user"]);
}

function feature(id) {
    checkout(ENV["prod"]);
    if(program.nojira){
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

function init(){
    var branch;
    Git.getBranch().then(function(b){
        branch = b;
        return Git.getBanchList();
    }).then(function(list){
        console.log("Setting up branches");
        if(list.indexOf(ENV.dev) == -1){
            Git.checkoutBranch(ENV.dev, "master");
            Git.push("--set-upstream origin " + ENV.dev);
        }
        if(list.indexOf(ENV.int) == -1){
            Git.checkoutBranch(ENV.int, "master");
            Git.push("--set-upstream origin " + ENV.int);
        }
        if(list.indexOf(ENV.prod) == -1){
            Git.checkoutBranch(ENV.prod, "master");
            Git.push("--set-upstream origin " + ENV.prod);
        }
        Git.checkout(branch);
        console.log("Setting up Git-Hooks");
        fs.readdir(path.resolve(__dirname, "hooks"), (err, files) => {
            files.forEach(file => {
                console.log(file);
                fs.createReadStream(__dirname + "/hooks/" + file)
                    .pipe(fs.createWriteStream("./.git/" + "hooks/" + file));
            });
        });
    });
}

function test(v){
    console.log("Testing...");
}

function testJira(){
    jira.issue.getIssue({
        issueKey: ENV.project +  id
    }, function(error, issue) {
        if(error){
            console.log("Error: ", error);
        }else{
            console.log("Found Jira: ", ENV.project +  id + ":" + issue.fields.summary);
        }
    });
}

function config(pair){
    var p = pair.split(":");
    ENV[p[0]] = p[1];
    fs.writeFile(path.resolve(__dirname, "hex-config.json"), JSON.stringify(ENV, null, ' '));
}

function publish(target){
    Git.getBranch().then(function(b){
        Git.checkout(target);
        Git.merge(b);
        console.log("Merged " + b + " into " + target);
        Git.checkout(b);
    });
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
        break;
    case "init":
        init();
        break;
    case "pub" || "publish":
        publish(VALUE);
        break;
    case "test":
        test(VALUE);
        break;
    default:
        console.log("Unknown Command");
}

//I was published :)