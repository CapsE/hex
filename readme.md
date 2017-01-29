#Hex

Links Jira with git to make a good use of the git-flow principle.

###How to install
> npm install hex-client -g

This will install Hex globally and allow you to use the command "hex" in your console.

###How to setup
After the installation write
> hex config jira-url:<jira-url>

So for example
> hex config jira-url:test.atlassian.net

make sure to not include the http:// or https:// in your url

Set the "jira-user" and "jira-password" with.
> hex login <jira-user>:<jira-password>

This will encode your password and store it globally.

As an alternative to these steps you could also go and edit the file %APPDATA%/hex/hex-config.json

Once your Jira-connection is all set up go to the directory of your project that is already in git and write:
> hex init

This will create a local hex-config.json for project specific settings as well as some git-hooks.
Change the project value to the abbreviation of your Jira-project e.g. "TST-"

###Features
> hex f < number >

will look for the given number in your jira project if a ticket is found the PROD Branch will be checked out and from there a new feature branch will be created. The branch will have a name like "TST-101" and a description containing the summary of the jira-ticket.

Keep in mind that you can configure the names of you DEV, INT and PROD branches in your hex-config.json. You can even have all three values point to the same branch.

If correctly configured this command will also set the state of your Jira ticket to "in progress".

> hex pub < branch name >

will checkout the given branch and merge the feature branch into it. After that the branch will be pushed and the state of your Jira ticket will be updated.

If the "project-owner" value is assigned in the hex-config.json the ticket will also be assigned to that jira-user.

> hex go < number > || < branch name >

a shorter version of git checkout. If a number is given the command will checkout something like "TST-101" if a name is given it will checkout e.g. "DEV"

> hex mg < number > || < branch name >

same as "hex go" but for merging

> hex assign < jira-user >

assigns the ticket that belongs to this feature to the given person