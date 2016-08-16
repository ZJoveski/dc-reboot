import { Parameters } from './parameters.js';
import { Participants } from './participants.js';
import { ColorMagic } from './colors_mapping.js';
import { Utilities } from './util.js';
import { PayoutInfo } from './collections/game_collections.js';
import { Session } from './session.js';
import { Logger } from './logging.js';

export var Payouts = {
    PayoutInfo: PayoutInfo,

    sessionPayouts: {},     //id ==> payout
    potentialPayouts: {},   //id ==> payout
    basePayout: 0.2,
    adversaryBasePayout: 0.4,
    regularPayoutAssignment: 'balanced',
    adversaryPayoutAssignment: 'noConsensusOnly',

    resetTotalPayouts: function(participants) {
        PayoutInfo.remove({});
        for(var i = 0; i < participants.length; i++){
            PayoutInfo.insert({
                id: participants[i],
                totalPayout: 0
            }); 
        }
    },

    initializeSessionPayoutInfo: function(participants) {
        for (var i = 0; i < participants.length; i++) {
            var id = participants[i];
            this.sessionPayouts[id] = 0;
            PayoutInfo.upsert({id: participants[i]}, {$set: {
                sessionPayout: 0
            }});
        }
    },

    initializePotentialSessionPayouts: function(adversaryMode) {
        if (adversaryMode) {          
            //create an array of IDs of regular players
            var regulars = [];

            for (var i = 0; i < Participants.adversaries.length; i++) {
                if (!Participants.adversaries[i]) {
                    regulars.push(Participants.participants[i]);
                }
            }
            
            console.log("The regular players:");
            console.log(regulars);
            
            if (this.regularPayoutAssignment == 'balanced') {
                // Do assignment for the regular players
                assignDefaultModePayouts(regulars);
            }
            
            // Do assignment for the adversaries
            assignAdversaryPayouts();
            console.log("Assigning adversarial mode payouts!")
        } else {
            assignDefaultModePayouts(Participants.participants);
            console.log("Assigning default mode payouts!")
        }

        for (var i = 0; i < Participants.participants.length; i++) {
            var individualPayout = {};
            for (var j = 0; j < ColorMagic.colors.length; j++) {
                var anonymizedColor = ColorMagic.anonymizeColor(Participants.id_name[Participants.participants[i]], ColorMagic.colors[j]);
                individualPayout[anonymizedColor] = this.potentialPayouts[Participants.participants[i]][ColorMagic.colors[j]];
            }
            individualPayout['none'] = this.potentialPayouts[Participants.participants[i]]['none'];

            PayoutInfo.upsert({id: Participants.participants[i]}, {$set: {
                potentialPayouts: individualPayout
            }});
        }
                
        /* Log entry. */ Logger.recordPotentialSessionPayouts(this.potentialPayouts);
    },

    // Called if cost of communication is nonzero
    updatePotentialPayoutsInfo: function(userId) {
        if(Parameters.costBasedCommunication) {
            var minPotentialPayout = Math.min(this.potentialPayouts[userId][ColorMagic.colors[0]], 
                                              this.potentialPayouts[userId][ColorMagic.colors[1]]);
                                              
            // The cost of communication is relative to the participant's minimum potential payout.
            var sessionCommunicationCost = minPotentialPayout * Session.communicationUsageLevels[userId];
            
            var individualPayout = {};

            for(var i = 0; i < ColorMagic.colors.length; i++) {
                individualPayout[anonymizedColor] = this.potentialPayouts[userId][ColorMagic.colors[i]] - sessionCommunicationCost;
            }
            individualPayout['none'] = this.potentialPayouts[Participants.participants[i]]['none'] - sessionCommunicationCost;

            PayoutInfo.update({id: userId}, {$set: {
                potentialPayouts: individualPayout
            }});
        }
    },

    applyIncentiveSessionPayouts: function(outcome) {
        if(outcome) {
            for(var i = 0; i < Participants.participants.length; i++){
                var actualPayout = Math.max(0, this.potentialPayouts[Participants.participants[i]][Session.outcomeColor]);
                
                if(Parameters.costBasedCommunication) {
                    var minPotentialPayout = Math.min(this.potentialPayouts[Participants.participants[i]][ColorMagic.colors[0]], 
                                                      this.potentialPayouts[Participants.participants[i]][ColorMagic.colors[1]]);
                    
                    // The cost of communication is relative to the participant's minimum potential payout.
                    var sessionCommunicationCost = minPotentialPayout * Session.communicationUsageLevels[Participants.participants[i]];
                    
                    // Participants always receive nonzero payout.
                    actualPayout = Math.max(0, actualPayout - sessionCommunicationCost);
                }
                
                actualPayout = Utilities.precise_round_to_number(actualPayout, 2); 
                                    
                this.sessionPayouts[Particiapnts.participants[i]] = actualPayout;
                PayoutInfo.update({id: Participants.participants[i]}, {$inc: {
                    totalPayout: actualPayout
                }});
                PayoutInfo.update({id: Participants.participants[i]}, {$set: {
                    sessionPayout: actualPayout
                }});
            }
        }
        else {
            for(var i = 0; i < Participants.participants.length; i++){
                var actualPayout = 0;
                if (Session.adversaryMode()) {
                    var isAdversary = Participants.adversaries[i];
                   
                    if (isAdversary) {
                        actualPayout = Utilities.precise_round_to_number(this.adversaryBasePayout, 2)
                        this.sessionPayouts[Participants.participants[i]] = actualPayout;
                        PayoutInfo.update({id: Participants.participants[i]}, {$inc: {totalPayout: actualPayout}});
                    } else {
                        this.sessionPayouts[Participants.participants[i]] = actualPayout;
                    }
                } else {
                    this.sessionPayouts[Participants.participants[i]] = actualPayout;
                }

                PayoutInfo.update({id: Participants.participants[i]}, {$inc: {
                    totalPayout: actualPayout
                }});
                PayoutInfo.update({id: Participants.participants[i]}, {$set: {
                    sessionPayout: actualPayout
                }});
            }
        }
        
        /* Log entry. */ Logger.recordSessionPayouts(this.sessionPayouts);
    },
};

var assignDefaultModePayouts = function(players) {
    var payoutMultiplier = Parameters.getPayoutMultiplier();
    
    var numberOfParticipants = players.length;
    Payouts.potentialPayouts = {};

    var unassigned = players.slice();

    // Randomly choose the half of the participants who will have a "payoutMultiplier" incentive for theColor[0].
    for (var i = 0; i < players.length/2; i++) {
        var individualPayout = assignPayout(payoutMultiplier, false);
        
        var choice = Math.floor(Math.random() * unassigned.length);
        var id = unassigned[choice];
        
        Payouts.potentialPayouts[id] = individualPayout;
        unassigned.splice(choice, 1);
    }

    // Assign a "payoutMultiplier" incentive for theColor[1] to the remaining participants.
    for(var i = 0; i < unassigned.length; i++) {
        var individualPayout = assignPayout(2 - payoutMultiplier, false);
        
        var id = unassigned[i];
        Payouts.potentialPayouts[id] = individualPayout;
        //console.log("regular Payout: " + potentialSessionPayouts[id] + " id: " + id);
    }
}

var assignAdversaryPayouts = function() {
    var adversaries = [];
    for (var i = 0; i < Participants.adversaries.length; i++) {
        if (Participants.adversaries[i]) {
            adversaries.push(Participants.participants[i]);
        }
    }

    console.log("The adversaries:");
    console.log(adversaries);

    if (Payouts.adversaryPayoutAssignment == "noConsensusOnly") {
        assignNoConsensusAdversaryPayouts(adversaries);
    }
}

var assignNoConsensusAdversaryPayouts = function(adversaries) {
    console.log("adversary length: " + adversaries.length);
    for (var i = 0; i < adversaries.length; i++) {
        var id = adversaries[i];
        var individualPayout = assignPayout(0, true);
        Payouts.potentialPayouts[id] = individualPayout;
        console.log("adversary Payout: " + Payouts.potentialPayouts[id] + " id: " + id);
    }
}

var assignPayout = function(payoutMultiplier, isAdversary) {
    var individualPayout = {};

    if (isAdversary) {
        individualPayout[ColorMagic.colors[0]] = 0.00;
        individualPayout[ColorMagic.colors[1]] = 0.00;
        individualPayout["none"] = Payouts.adversaryBasePayout;
    } else {
        individualPayout[ColorMagic.colors[0]] = payoutMultiplier * Payouts.basePayout;
        individualPayout[ColorMagic.colors[1]] = (2 - payoutMultiplier) * Payouts.basePayout;
        individualPayout['none'] = 0.00;
    }

    return individualPayout;
}