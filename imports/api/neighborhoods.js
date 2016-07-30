import { NeighborhoodsCollection } from './collections/game_collections.js';
import { Participants } from './participants.js';
import { Session } from './session.js';

export default const var Neighborhoods = {
    clearNeighborhoods: function() {
        NeighborhoodsCollection.remove({});
    },

    clearNeighborhood: function(id) {
        NeighborhoodsCollection.remove({userId: id});
    },

    assignNeighborhoodsToClients: function() {
        this.clearNeighborhoods();
        
        Participants.assignNodesToNames();

        for (var i = 0; i < Participants.participants.length; i++) {
            var userId = Participants.participants[i];
            initializeNeighborhood(userId);
        }

        initializeAdminNeighborhood();
        
        /* Log entry. */ recordParticipantsToNamesCorrespondence();
    },

    initializeNeighborhoodColors: function() {
        for(var i = 0; i < Participants.participants.length; i++) {
            var userId = Participants.participants[i];
            var name = Participants.id_name[userId];
            var namesOfNeighbors = getNamesOfNeighbors(userId);

            var neighborhoodColors = {};
            for (var j = 0; j < namesOfNeighbors.length; j++) {
                neighborhoodColors[namesOfNeighbors[j]] = Session.defaultNodeColor;
            }

            NeighborhoodsCollection.update({userId: userId}, {$set: {neighborhoodColors: neighborhoodColors}});          
        }
    } 
};

insertNeighborhood = function(id, namesOfNeighbors, neighAdjMatrix) {        
    NeighborhoodsCollection.insert({
        userId: id,
        namesOfNeighbors: namesOfNeighbors,
        neighAdjMatrix: neighAdjMatrix
    });
}

initializeNeighborhood = function(id) {
    // Extract the names corresponding to the current user and its neighbors.
    var namesOfNeighbors = getNamesOfNeighbors(id);
        
    // Exctract the corresponding neighborhood adjacency matrix.
    var neighAdjMatrix = getNeighborhoodAdjMatrix(namesOfNeighbors, id);
        
    // Create a document containing the relevant neighborhood data for the particular user.
    insertNeighborhood(id, namesOfNeighbors, neighAdjMatrix);
}

initializeAdminNeighborhood = function() {
    var namesOfNeighbors = [];
    for(var index in Participants.node_name) {
        if(index < Participants.participants.length)
            namesOfNeighbors.push(Participants.node_name[index]); 
    }

    var neighAdjMatrix = Session.adjMatrix.slice();
    
    // Create a document containing the entire network data, for the admin user.
    var id;
    var admin = Meteor.users.findOne({username: "admin"});
    if(admin !== undefined) {
        id = admin._id;
    }
    
    insertNeighborhood(id, namesOfNeighbors, neighAdjMatrix);
}

// Get the names of the neighbors of the user with the specified user ID (not necessarily
// the current user). The name in position 0 of neighNames is the name of the user with 
// identified by userId.
getNamesOfNeighbors = function(userId) {
    var neighNames = [];
    neighNames.push(Participants.id_name[userId]);
    var i = Participants.name_node[Participants.id_name[userId]];
      
    for(var j = 0; j < Session.adjMatrix.length; j++) {
        if(Session.adjMatrix[i][j]) {
            neighNames.push(node_name[j]);
        }
    }
  
    return neighNames;
}

// Get the neighborhood adjacency matrix corresponding to the user with the specified user ID.
getNeighborhoodAdjMatrix = function(neighNames, userId) {
    var numNodes = neighNames.length;
      
    var neighAdjMatrix = new Array(numNodes);
    for (var i = 0; i < numNodes; i++) {
        neighAdjMatrix[i] = new Array(numNodes);
    }
    
    var p = 0, q = 0;
    for (var i = 0; i < numNodes; i++) {        
        neighAdjMatrix[i][i] = false;
        for (var j = i+1; j < numNodes; j++) {
            p = Participants.name_node[neighNames[i]];
            q = Participants.name_node[neighNames[j]];
            // TODO: write adj matrix handler
            neighAdjMatrix[i][j] = Session.adjMatrix[p][q];
            neighAdjMatrix[j][i] = neighAdjMatrix[i][j];
        }
    }
      
    return neighAdjMatrix;
}