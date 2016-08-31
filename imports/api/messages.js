import { Parameters } from './parameters.js';
import { Participants } from './participants.js';
import { ColorMagic } from './colors_mapping.js';
import { MessagesCollection } from './collections/game_collections.js';
import { Neighborhoods } from './neighborhoods.js';
import { Session } from './session.js';

export var Messages = {
    clearMessages: function() {
        MessagesCollection.remove({});
    },
    
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

    // A method for calculating the character cost of a message, taking into account the fact that different color names,
    // have different numbers of characters.
    calculateRealMessageLength: function(message) {
        var tempMessage = message;
        var realMessageLength = message.length;
        var n = ColorMagic.colors.length;
        var matchedColorOccurences, numberOfColorOccurences;
        
        // Short color codes like "\r" and "\g" have priority.
        for(var i = 0; i < n; i++) {
            matchedColorOccurences = tempMessage.match(new RegExp("(\\\\|\\\/)" + ColorMagic.colors[i][0], "gi"));
            
            if(matchedColorOccurences) {
                numberOfColorOccurences = matchedColorOccurences.length;
                realMessageLength -= numberOfColorOccurences;
                
                tempMessage = tempMessage.replace(new RegExp("(\\\\|\\\/)" + ColorMagic.colors[i][0], "gi"), "");
            }
        }
        
        for(var i = 0; i < n; i++) {
            matchedColorOccurences = tempMessage.match(new RegExp("\\b" + ColorMagic.colors[i] + "\\b", "gi"));
            
            if(matchedColorOccurences) {
                numberOfColorOccurences = matchedColorOccurences.length; 
                realMessageLength += (structuredCommunicationCharactersNumberMultiplier - (ColorMagic.colors[i]).length) * numberOfColorOccurences;
            }
        }
        
        return Math.max(realMessageLength, 0);
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
          
        MessagesCollection.insert({
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
            console.log('sendMessageToParticipants');
            sendMessageToAllParticipants(senderId, message, timestamp);
        }
        else {
            sendMessageToNeighborsOnly(senderId, message, timestamp);
        }
    },
};

var sendMessageToAllParticipants = function(senderId, message, timestamp) {
    var name = Participants.id_name[senderId];
      
    for(var i = 0; i < Participants.participants.length; i++) {
        var nameOfRecipient = Participants.id_name[Participants.participants[i]];

        console.log('insert message');
              
        MessagesCollection.insert({
            idOfSender: senderId,
            nameOfSender: name,
            idOfRecipient: Participants.participants[i],
            nameOfRecipient: nameOfRecipient,
            message: ColorMagic.anonymizeMessageColorNames(nameOfRecipient, message),
            timestamp: timestamp
        });  
    }
}

var sendMessageToNeighborsOnly = function(senderId, message, timestamp) {
    var name = Participants.id_name[senderId];
    var namesOfNeighbors = Neighborhoods.NeighborhoodsInfo.findOne({userId: senderId}).namesOfNeighbors;
    
    for(var i = 0; i < namesOfNeighbors.length; i++) {
        MessagesCollection.insert({
            idOfSender: senderId,
            nameOfSender: name,
            idOfRecipient: name_id[namesOfNeighbors[i]],
            nameOfRecipient: namesOfNeighbors[i],
            message: ColorMagic.anonymizeMessageColorNames(namesOfNeighbors[i], message),
            timestamp: timestamp
        });
    }
}


