import { Participants } from './participants.js';
import { Neighborhoods } from './neighborhoods.js';

export var Reputations = {

    reputationChoices: {},
    reputations: {},


    resetReputations: function() {
        for (var i = 0; i < Participants.participants.length; i++) {
            var userId = Participants.participants[i];
            var name = Participants.id_name[userId];
            reputationChoices[name] = [];
            reputations[name] = 0;

            for (var j = 0; j < participants.participants.length; j++) {
                if (i != j) {
                    var otherId = Participants.participants[j];
                    var otherName = Participants.id_name[otherId];
                    reputationChoices[userId][otherName] = 0;
                }
            }
        }
    },

    updateReputation: function(userId, targetName, rank) {
        var userName = Participants.id_name[userId];
        var previousRank = reputationChoices[userName][targetName];
        reputationChoices[userName][targetName] = rank;
        var diff = rank - previousRank;
        reputations[targetName] += diff;

        Neighborhoods.updateNeighborhoodReputations(reputations);
    },
}