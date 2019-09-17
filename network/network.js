const AdminConnection = require('composer-admin').AdminConnection;
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const { BusinessNetworkDefinition, CertificateUtil, IdCard } = require('composer-common');

//declare namespace
const namespace = 'org.example.empty';

//admin connection to the blockchain, used to deploy the business network
let adminConnection;

//this is the business network connection the tests will use.
let businessNetworkConnection;

let businessNetworkName = 'consensys';
let factory;


async function importCardForIdentity(cardName, identity) {

  //use admin connection
  adminConnection = new AdminConnection();
  businessNetworkName = 'consensys';

  //declare metadata
  const metadata = {
    userName: identity.userID,
    version: 1,
    enrollmentSecret: identity.userSecret,
    businessNetwork: businessNetworkName
  };

  //get connectionProfile from json, create Idcard
  const connectionProfile = require('./local_connection.json');
  const card = new IdCard(metadata, connectionProfile);

  //import card
  await adminConnection.importCard(cardName, card);
}


//export module
module.exports = {

  registerVoter: async function (cardId, voterId, email) {

    try {
      //connect as admin
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect('admin@consensys');

      //get the factory for the business network.
      factory = businessNetworkConnection.getBusinessNetwork().getFactory();

      //create voter participant
      const voter = factory.newResource(namespace, 'voter', voterId);
      const voteCasted = factory.newResource(namespace, 'voteCasted', voterId);
      voter.email = email;
      voteCasted.voted = false;

      //add partner participant
      const participantRegistry = await businessNetworkConnection.getParticipantRegistry(namespace + '.voter');
      await participantRegistry.add(voter);
      const assetRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.voteCasted');
      await assetRegistry.add(voteCasted);

      //issue identity
      const identity = await businessNetworkConnection.issueIdentity(namespace + '.voter#' + voterId, cardId);

      //import card for identity
      await importCardForIdentity(cardId, identity);

      //disconnect
      await businessNetworkConnection.disconnect('admin@consensys');

      return true;
    }
    catch (err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error;
    }

  },

  vote: async function (cardId, candidateId, voterId) {

    try {

      //connect to network with cardId
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect(cardId);

      //get the factory for the business network.
      factory = businessNetworkConnection.getBusinessNetwork().getFactory();

      //create transaction
      const vote = factory.newTransaction(namespace, 'vote');
      vote.candidateVotesAsset = factory.newRelationship(namespace, 'candidateVotes', candidateId);
      vote.voteCastedAsset = factory.newRelationship(namespace, 'voteCasted', voterId);
      //console.log(usePoints);
      //submit transaction
      await businessNetworkConnection.submitTransaction(vote);

      //disconnect
      await businessNetworkConnection.disconnect(cardId);

      return true;
    }
    catch (err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error
    }

  },

  memberData: async function (cardId) {

    try {

      //connect to network with cardId
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect(cardId);

      //get member from the network
      let members = [];

      await businessNetworkConnection.getParticipantRegistry(namespace + '.candidate').then(function (participantRegistry) {
        return participantRegistry.getAll();
      }).then(function memberData(candidates) {
        // Process the array of driver objects.
        candidates.forEach(function (candidate) {
          members.push(candidate);
          //console.log(candidate.candidateID);
        });
      }).catch(function (error) {
        // Add optional error handling here.
        console.log(error);
      });
      //disconnect
      await businessNetworkConnection.disconnect(cardId);

      //return member object
      return members;
    }
    catch (err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error;
    }

  },

  voterData: async function (cardId, voterId) {

    try {

      //connect to network with cardId
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect(cardId);

      //get member from the network
      const voterRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.voteCasted');
      const voter = await voterRegistry.get(voterId);

      //disconnect
      await businessNetworkConnection.disconnect(cardId);

      //return partner object
      return voter;
    }
    catch (err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error
    }

  },
  
  getTransactionsInfo: async function (cardId) {

    try {
      //connect to network with cardId
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect(cardId);

      //query transactions on the network
      const txResults = await businessNetworkConnection.query('selectCommodities');

      //disconnect
      await businessNetworkConnection.disconnect(cardId);

      //return txResults object
      return txResults;
    }
    catch (err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error
    }

  }
}
