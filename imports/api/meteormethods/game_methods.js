import { Meteor } from 'meteor/meteor';

import { Progress } from '../progress.js';
import { Parameters } from '../parameters.js';
import { Participants } from '../participants.js';
import { Session } from '../session.js';
import { ColorMagic } from '../colors_mapping.js';
import { Neighborhoods } from '../neighborhoods.js';
import { Messages } from '../messages.js';

Meteor.methods({
    'sendStructuredMessage': function() {
        var id = this.userId;
        var message = "";

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

                message += neighborhoodColorCounts[ColorMagic.colors[first]] + " " + (ColorMagic.colors[first]).toUpperCase();
                message += ", " + neighborhoodColorCounts[ColorMagic.colors[last]] + " " + (ColorMagic.colors[last]).toUpperCase();

                //"Translate" message colors to the "real" colors.
                message = ColorMagic.dummyDeanonymizeMessageColorNames(message);

                sendMessageToParticipants(id, message, timestamp);
                sendMessageToAdmin(id, message, timestamp);

                sessionCommunicationUsageLevels[id] += messageCostInfo.relativeMessageCost;

                /* Log entry. */ recordMessageRequest(id, true, message);
                console.log(message);
                /* Log entry. */ recordMessageSent(id, true, message);

                updatePotentialPayoutsInfo(id);
              }
              else {
                  /* Log entry. */ recordMessageRequest(id, true, message);
                  /* Log entry. */ recordMessageFailed(id, true, message);
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





