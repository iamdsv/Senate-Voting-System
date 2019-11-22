# Senate Voting System
Hyperledger based online secure voting solution with LDAP authentication and vote verification

***System Configuration:***

* Ubuntu 18.04
* 8GB RAM
* 1TB HDD

***Setup:***

1. LDAP Server Setup
* We have installed OpenLDAP along with phpLDAPadmin
* To setup LDAP server follow the below commands:

i. Installing and Configuring the LDAP Server

$ sudo apt-get update
$ sudo apt-get install slapd ldap-utils
(You can find the configuration steps from link given below)
$ sudo ufw allow ldap

ii. Installing and Configuring the phpLDAPadmin Web Interface
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
$ sudo apt-get install phpldapadmin
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
(You can find the configuration steps from link given below - DNS Domain Name: consensys.com, Organization Name: consensys)

iii. Credentials for phpLDAPadmin
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Login DN: cn=admin,dc=consensys,dc=com
Password: consensys
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

iv Enlisting of voters
* Create an ou = blockchain and create a POSIX Group = admin; This will provide GID for all voters.
* Now, create another ou = voters and add Generic Users as many as you want; The uid should be of the form: xyz@iitk.ac.in

Link for configuration steps: https://www.digitalocean.com/community/tutorials/how-to-install-and-configure-openldap-and-phpldapadmin-on-ubuntu-16-04

2. Hyperledger Composer Setup

i. To setup Hyperledger Composer we first need to install the pre-requisites (https://hyperledger.github.io/composer/latest/installing/installing-prereqs)

ii. For installing development environment follow the below commands:
*Note that you should not use su or sudo for the following npm commands*
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
$ npm install -g composer-cli@0.20
$ npm install -g composer-rest-server@0.20
$ npm install -g generator-hyperledger-composer@0.20
$ npm install -g yo

$ npm install -g composer-playground@0.20
$ mkdir ~/fabric-dev-servers && cd ~/fabric-dev-servers

$ curl -O https://raw.githubusercontent.com/hyperledger/composer-tools/master/packages/fabric-dev-servers/fabric-dev-servers.tar.gz
$ tar -xvf fabric-dev-servers.tar.gz

$ cd ~/fabric-dev-servers
$ export FABRIC_VERSION=hlfv12
$ ./downloadFabric.sh
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
iii. Commands for starting the Hyperledger Composer Playground
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
$ cd ~/fabric-dev-servers
$ export FABRIC_VERSION=hlfv12
$ ./startFabric.sh
$ ./createPeerAdminCard.sh
$ composer-playground
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
iv. Deploying the network

* Create a new business network Connection: hlfv1 (Name of Business Network: consensys, Name of the card: admin@consensys, Enrollment ID: admin, Enrollment Secret: adminpw)
* Now click on the 'connect' to access the card just created.
* You can find Model File, Script File, Access Control and Query File in the zip which you will find after extracting Consensys.zip. File names are model.cto, script.js, permissions.acl and queries.qry respectively.
* Now, deploy the changes.
* Create candidates as many as you wish:
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	{
	  "$class": "org.example.empty.candidate",
	  "candidateID": "himesh",
	  "email": "himes@iitk.ac.in",
	  "fname": "Himesh",
	  "lname": "Shah",
	  "gender": "M",
	  "department": "EE",
	  "prevWork": "I have worked as STU for 1 year. I also have an experience of ABC.",
	  "agenda": "I wish to do XYZ for IIT-K. I assure that PQR will be done on time"
	}
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
* Create candidateVotes asset as well for each candidate you create:
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	{
	  "$class": "org.example.empty.candidateVotes",
	  "candidateID": "himesh",
	  "voteCount": 3
	}
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
* Now, you are ready to setup the Voting Application.

3. Voting Application Setup

* Extract the zip file Consensys.zip
* If you have configured everything as mentioned above, you don't need to configure anything inside this application.
* node_modules are not included in the zip (Size was large), so in order to setup them use following command:
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
$ npm install
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
* You can run the application using following command:
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
$ npm start
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
* To login, use the enlisted voter's ID/Password.
* The server will start on port 9090.

***Information regarding files:***

// 'index.js'
- It contains all the get and post Express Routing
- Also, it passes data to .ejs files

// '/views/*'
- It contains 3 views: index.ejs, welcome.ejs and vote.ejs

// '/network/local_connection.json'
- It contains configuration of Hyperledger Composer Network

// '/network/network.js'
- It consists of all the functions required to fetch data or perform transactions on the network.

// 'model.cto'
- It consists of model file

// 'script.js'
- It consists of transaction logic

// 'permissions.acl'
- It consists of permission file

// 'queries.qry'
- It cosists of query to fetch transactions
