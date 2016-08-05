import { Meteor } from 'meteor/meteor';

import { Progress } from '../progress.js';
import { Parameters } from '../parameters.js';
import { Participants } from '../participants.js';
import { Session } from '../session.js';
import { ColorMagic } from '../colors_mapping.js';
import { Neighborhoods } from '../neighborhoods.js';
import { Messages } from '../messages.js';
import { Logger } from '../logging.js';
import { Payouts } from '../payouts.js';

Meteor.methods({
    // Set (update) the color corresponding to the current user.
    updateColor: function(newColor) {
        Session.updateColor(Meteor.userId(), newColor);
    },

    sendStructuredMessage: function() {
        var id = this.userId;
        var message = "structured message";

        if(Progress.sessionInProgress) {
            var messageCostInfo = Messages.calculatePotentialMessageCost(this.userId, Parameters.structuredCommunicationCharactersNumberMultiplier);
          
            if(messageCostInfo.costIsAffordable) {
                var timestamp = new Date();

                Session.updateCommunicationUnitsRemaining(id, 1);

                var name = Participants.id_name[id];
                var neighborhoodColorCounts = getNeighborhoodColorCounts(id, name);

                var first, last;
                if (neighborhoodColorCounts[ColorMagic.colors[0]] >= neighborhoodColorCounts[ColorMagic.colors[1]]) {
                  first = 0;
                  last = 1;
                }
                else {
                  first = 1;
                  last = 0;
                }

                message = neighborhoodColorCounts[ColorMagic.colors[first]] + " " + (ColorMagic.colors[first]).toUpperCase();
                message += ", " + neighborhoodColorCounts[ColorMagic.colors[last]] + " " + (ColorMagic.colors[last]).toUpperCase();

                //"Translate" message colors to the "real" colors.
                message = ColorMagic.dummyDeanonymizeMessageColorNames(message);

                /* Log entry. */ Logger.recordMessageRequest(id, true, message);

                Messages.sendMessageToParticipants(id, message, timestamp);
                Messages.sendMessageToAdmin(id, message, timestamp);

                Session.communicationUsageLevels[id] += messageCostInfo.relativeMessageCost;

                console.log(message);
                /* Log entry. */ Logger.recordMessageSent(id, true, message);

                Payouts.updatePotentialPayoutsInfo(id);
            } else {
                /* Log entry. */ Logger.recordMessageRequest(id, true, message);
                /* Log entry. */ Logger.recordMessageFailed(id, true, message);
            }
        }
    },

    sendChatMessage: function(message) {
        var id = this.userId;
        /* Log entry. */ Logger.recordMessageRequest(id, false, message);

        if(Progress.sessionInProgress) { 
            var realMessageLength = Messages.calculateRealMessageLength(message);
            var messageCostInfo = Messages.calculatePotentialMessageCost(id, realMessageLength);

            if(messageCostInfo.costIsAffordable) {
                var timestamp = new Date();

                Session.updateCommunicationUnitsRemaining(id, realMessageLength);

                //"Translate" message colors to the "real" colors.
                message = ColorMagic.deanonymizeMessageColorNames(Participants.id_name[id], message);

                Messages.sendMessageToParticipants(id, message, timestamp);
                Messages.sendMessageToAdmin(id, message, timestamp);

                Session.communicationUsageLevels[id] += messageCostInfo.relativeMessageCost;

                /* Log entry. */ Logger.recordMessageSent(id, false, message);

                Payouts.updatePotentialPayoutsInfo(id);
            } else {
                /* Log entry. */ Logger.ecordMessageFailed(id, false, message);
            }
        }
    },
});

var getNeighborhoodColorCounts = function(userId, name) {
    var neighborhoodColorCounts = {};

    for (var i = 0; i < ColorMagic.colors.length; i++) {
        neighborhoodColorCounts[ColorMagic.colors[i]] = 0;
    }

    var neighborhoodColors = Neighborhoods.NeighborhoodsInfo.findOne({userId: userId}).neighborhoodColors;
    if(neighborhoodColors !== undefined) {
        for(var key in neighborhoodColors) {
            if(neighborhoodColors.hasOwnProperty(key)) {
                neighborhoodColorCounts[ColorMagic.deanonymizeColor(name, neighborhoodColors[key])]++;
            }
        }
    }
    
    return neighborhoodColorCounts;
}





