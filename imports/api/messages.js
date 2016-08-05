import { Parameters } from './parameters.js';
import { Participants } from './participants.js';
import { ColorMagic } from './colors_mapping.js';
import { Messages } from './collections/game_collections.js';

export var Messages = {
    Messages: 

    calculatePotentialMessageCost: function(userId, messageLength) {    
        var messageCostInfo = {};
        var relativeMessageCost;
        var costIsAffordable = false;
        
        if(Parameters.costBasedCommunication) {
            relativeMessageCost = Parameters.communicationCostMultipliers[Parameters.communicationCostLevel] * messageLength;
            if(relativeMessageCost < (1 - Session.communicationUsageLevels[userId] + Parameters.communicationCostMultipliers[Parameters.communicationCostLevel])) {
                costIsAffordable = true;
            }
        }
        else {
            var bound = 0;
            if (Parameters.structuredCommunication) 
                var bound = Parameters.communicationLengthBound;
            else
                var bound = Math.min(Parameters.messageLengthBound, Parameters.communicationLengthBound);
                
            relativeMessageCost = (1/Parameters.communicationLengthBound) * messageLength;
            if(relativeMessageCost < (1 - Session.communicationUsageLevels[userId] + 1/bound)) {
                costIsAffordable = true;
            }   
        }
        
        messageCostInfo["relativeMessageCost"] = relativeMessageCost;
        messageCostInfo["costIsAffordable"] = costIsAffordable;
        
        return messageCostInfo;
    },

    // Insert another, special, copy of the message (using the actual color labels) for the admin user.
    sendMessageToAdmin: function(senderId, message, timestamp){
        var name = Participants.id_name[senderId];
        
        var adminName = "admin";
        var adminId;
            
        var admin = Meteor.users.findOne({username: "admin"});
        if(admin !== undefined) {
            adminId = admin._id;
        }
          
        Messages.insert({
            idOfSender: senderId,
            nameOfSender: name,
            idOfRecipient: adminId,
            nameOfRecipient: adminName,
            message: ColorMagic.clearTemporaryColorCodeSuffixes(message),
            timestamp: timestamp
        });  
    },

    sendMessageToParticipants: function(senderId, message, timestamp) {   
        if(Parameters.communicationScopes[senderId] == 'global') {
            sendMessageToAllParticipants(senderId, message, timestamp);
        }
        else {
            sendMessageToNeighborsOnly(senderId, message, timestamp);
        }
    },
};

var sendMessageToAllParticipants = function(senderId, message, timestamp) {
    var name = Participants.id_name[senderId];
      
    for(var i = 0, i < Participants.participants.length; i++) {
        var nameOfRecipient = Participants.id_name[Participants.participants[i]];
              
        Messages.insert({
            idOfSender: senderId,
            nameOfSender: name,
            idOfRecipient: participants[i],
            nameOfRecipient: nameOfRecipient,
            message: anonymizeMessageColorNames(nameOfRecipient, message),
            timestamp: timestamp
        });  
    }
},

var sendMessageToNeighborsOnly = function(senderId, message, timestamp) {
    var name = Participants.id_name[senderId];
    var namesOfNeighbors = id_namesOfNeighbors[senderId];
    
    for(var i=0, n=namesOfNeighbors.length; i<n; i++) {
        messages.insert({
            idOfSender: senderId,
            nameOfSender: name,
            idOfRecipient: name_id[namesOfNeighbors[i]],
            nameOfRecipient: namesOfNeighbors[i],
            message: anonymizeMessageColorNames(namesOfNeighbors[i], message),
            timestamp: timestamp
        });
    }
}


