var express = require('express'),
  passport = require('passport'),
  bodyParser = require('body-parser'),
  LdapStrategy = require('passport-ldapauth');
flash = require('connect-flash');
var md5 = require('md5');
var network = require('./network/network.js');
var OPTS = {
  server: {
    url: 'ldap://localhost:389',
    bindDN: 'CN=admin,DC=consensys,DC=com',
    bindCredentials: 'consensys',
    searchBase: 'OU=voters,DC=consensys,DC=com',
    searchFilter: '(uid={{username}})'
  },
  usernameField: "usern",
  passwordField: "password"
};
var app = express();
app.use(express.static(__dirname + '/'));
app.use(flash());
app.set('view engine', 'ejs');
require("../Voting/models/user.js");
passport.use(new LdapStrategy(OPTS));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
var error = "";

app.get('/', (req, res) => {
  res.render("index", { error: error });
  error = "";
});

app.get('/unauth', (req, res) => {
  error = "Invalid ID/Password";
  res.redirect("/");
});

app.post('/login', passport.authenticate('ldapauth', { session: false, failureRedirect: "/unauth" }), function (req, res) {
  user = req.user;
  uid = req.user.uid;
  givenName = req.user.givenName;
  res.redirect("welcome");
});

app.get('/logout', (req, res) => {
  user = null;
  uid = "";
  givenName = "";
  res.redirect("/");
});

app.get('/welcome', function (req, res) {
  if (this.user != null) {
    var uname = this.uid.split("@");
    var cardId = uname[0] + '@consensys';
    var voterId = md5(uname[0]);
    network.registerVoter(cardId, voterId, this.uid).then((response) => {
      res.render("welcome", { name: givenName });
    });
  }
  else res.redirect("/");

});

app.post('/api/vote', function (req, res) {
  if (this.user != null) {
    var uname = this.uid.split("@");
    var cardId = uname[0] + '@consensys';
    var voterId = md5(uname[0]);
    let candidateId = req.body.textField;
    network.vote(cardId, candidateId, voterId).then((response) => {
      if (response) {
        let users = [];
        network.getTransactionsInfo(cardId).then((tx) => {
          let transactions = tx;
          tx.forEach(function (t) {
            let arr = [];
            arr = t.eventsEmitted;
            let candidateID = '';
            arr.forEach(function (a) {
              let st = JSON.stringify(a);
              var objectValue = JSON.parse(st);
              candidateID = objectValue['candidateID'];
            })
            res.render("vote", { name: givenName, users: users, tx: transactions, candidateID: candidateID });
          })
        });
      } else {
        res.redirect("/api/getCandidates");
      }
    });
  }
  else res.redirect("/welcome");

});

app.get('/api/getCandidates', function (req, res) {
  if (this.user != null) {
    var uname = this.uid.split("@");
    var cardId = uname[0] + '@consensys';
    var voterId = md5(uname[0]);
    var myMembers = [];
    network.voterData(cardId, voterId)
      .then((voter) => {
        if (voter.voted == false) {
          network.memberData(cardId).then((members) => {
            members.forEach(function (member) {
              myMembers.push(member);
            })
          })
            .then(function () {
              let arr = [];
              let candidateID = '';
              res.render("vote", { name: givenName, users: myMembers, tx: arr, candidateID: candidateID });
            });
        } else {
          let users = [];
          network.getTransactionsInfo(cardId).then((tx) => {
            let transactions = tx;
            if (tx.length > 0) {
              tx.forEach(function (t) {
                let arr = [];
                arr = t.eventsEmitted;
                let candidateID = '';
                arr.forEach(function (a) {
                  let st = JSON.stringify(a);
                  var objectValue = JSON.parse(st);
                  candidateID = objectValue['candidateID'];
                })
                res.render("vote", { name: givenName, users: users, tx: transactions, candidateID: candidateID });
              })
            }
          });
        }
      });
  }
  else res.redirect("/");

});

app.listen(9090);