// import { TurkServer } from 'meteor/mizzao'; ?
import { Session } from './session.js';
import { Logger } from './logging.js';
import { ParticipantsInfo } from './collections/game_collections.js';
import { PilotExperiment } from './collections/external_collections.js';

export var Participants = {
    ParticipantsInfo: ParticipantsInfo,

    /* Objects and arrays used to establish and make use of the correspondence between actual nodes,
    names of nodes visible to the clients, and user IDs of clients. */

    // name_node[someName] gives the actual node (a number from 0 to numNodes-1) corresponding to 
    // someName.
    name_node: {},

    // node_name[i] gives the name corresponding to the actual node i.
    node_name: {},

    // id_name[someUserId] gives the name assigned to the client (user) with user ID someUserId.
    id_name: {},

    // name_id[someName] gives the user ID of the client that was assigned the name someName.
    name_id: {},

    participants: [],
    participantsQueue: [],
    missedGames: {},
    participationRate: {},
    participantsThreshold: 20,
    missedGamesThreshold: 1,

    adversaries: [],    // information by node #

    // List of available first names. Need to make sure there are at least as many names 
    // available as there are nodes in the full network.
    listOfNames: ["Ben", "Ava", "Dan", "Eve", "Gus", "Ivy", "Ian", "Joy", "Jay", "Kim", 
                    "Lee", "Liz", "Pat", "Mae", "Ray", "Uma", "Sam", "Sky", "Ted", "Sue", 
                    "Bob", "Joe", "Moe", "May", "Tim"],

    initializeFullListOfParticipants: function() {
        var queue = this.participantsQueue;
        var readyUsers = Meteor.users.find({"status.online": true, username: {$ne: "admin"}, location: '/experiment'});
        readyUsers.forEach(function(user) {
           queue.push(user._id);
        });

        /* Log entry. */ Logger.recordExperimentParticipants(this.participantsQueue);
    },

    initializeGameParticipants: function(newBatch) {
        if(this.participantsQueue.length <= this.participantsThreshold) {
            // This should not happen, but it would be good if we have some plan B when not enough people show up.
            this.participants = this.participantsQueue;
        }
        else if (newBatch) {
            // Kick out inactive participants (even those that are experiencing some issues)
            removeInactiveParticipants();
            
            this.participants = [];
            ParticipantsInfo.update({}, {$set: {
                isParticipant: false
            }});
            var participantsAdded = 0;
            while(participantsAdded < this.participantsThreshold) {
                var nextParticipant = this.participantsQueue.shift();
                this.participants.push(nextParticipant);
                this.participantsQueue.push(nextParticipant);
                ParticipantsInfo.upsert({userId: nextParticipant}, {$set: {
                    isParticipant: true
                }});
                participantsAdded++;
            }
        }
        
        initializeParticipationRate(0);

        Session.setNumberOfNodes(this.participants.length);

        /* Log entry. */ Logger.recordSessionParticipants(this.participants);
    },

    initializeMissedGames: function() {
        for(var i = 0; i < this.participants.length; i++) {
            this.missedGames[this.participants[i]] = 0;
        }
    },

    assignNodesToNames: function() {                
        // Keep track of names that have already been assigned to users.
        var numNodes = this.participants.length;
        var nodeTaken = new Array(numNodes);
        for (var i = 0; i < numNodes; i++) nodeTaken[i] = false;
        var nodesRemaining = numNodes;
        
        for(var i = 0; i < numNodes; i++) {
            var userId = this.participants[i];
            if(nodesRemaining > 0) {
                var n;
                do { n = Math.floor(Math.random() * numNodes); } while (nodeTaken[n]);
                this.name_node[this.id_name[userId]] = n;
                this.node_name[n] = this.id_name[userId];
                nodeTaken[n] = true; 
                nodesRemaining--;               
            }
        }

        /* Log entry. */ Logger.recordNodesToNamesCorrespondence();
    },

    assignIdsToNames: function() {
        var nameIndices = new Array(this.listOfNames.length);
        for (var i = 0; i < nameIndices.length; i++) {
            nameIndices[i] = i;
        }
        
        for(var i = 0; i < this.participants.length; i++) {
            var choice = Math.floor(Math.random()*nameIndices.length);
            var j = nameIndices[choice];

            this.name_id[this.listOfNames[j]] = this.participants[i];
            this.id_name[this.participants[i]] = this.listOfNames[j];

            nameIndices.splice(choice, 1);
        }
    },

    assignAdversaries: function() {
        if (Session.adversaryAssignment == "random") {
            this.adversaries = assignRandomAdversaries();
            for (var i = 0; i < this.adversaries.length; i++) {
                var userId = this.participants[i];
                var isAdversary = this.adversaries[i];
                ParticipantsInfo.upsert({userId: userId}, {$set: {
                    isAdversary: isAdversary
                }});
            }
        }
    },
};

var assignRandomAdversaries = function() {
    var adversaries = Array(Participants.participants.length);
    for (var i = 0; i < adversaries.length; i++) {
        adversaries[i] = false;
    }

    for (var i = 0; i < Session.numberOfAdversaries; i++) {
        var j;
        do { j = Math.floor(Math.random()*adversaries.length); } while (adversaries[j]);
        adversaries[j] = true;
    }

    return adversaries;
}

var initalizeParticipationRate = function(rate) {
    for(var i = 0; i < Participants.participants.length; i++) {
        Participants.participationRate[Participants.participants[i]] = rate;
    }
}

var removeInactiveParticipants = function() {
    for(var i = 0; i < Participants.participants.length; i++) {
        if(Participants.participationRate[Participants.participants[i]] == 0) {
            Participants.missedGames[Participants.participants[i]] += 1;
        
            // If a participant missed too many games (and assuming we have enough participants), remove them from the queue
            if (Participants.missedGames[Participants.participants[i]] > Participants.missedGamesThreshold && 
                Participants.participantsQueue.length > Participants.participantsThreshold) {
                PilotExperiment.update({userId: Participants.participants[i]}, {$set: {'missedTooManyGames': true}});
                
                var index = Participants.participantsQueue.indexOf(Participants.participants[i]);
                Participants.participantsQueue.splice(index, 1);
            
                removeParticipant(Participants.participants[i]);
            }
        }
    }
}

var removeParticipant = function(userId) {
    // Move to survey, but indicate that this happened under exceptional circumstances  
    Meteor.users.update(
        {_id: userId, location: '/experiment'}, 
        {$set: {'location': '/survey'}},
        {multi: true}
    );
}