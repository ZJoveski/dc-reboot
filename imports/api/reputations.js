import { Participants } from './participants.js';
import { Neighborhoods } from './neighborhoods.js';

export var Reputations = {

    reputationChoices: {},
    reputations: {},


    resetReputations: function() {
        for (var i = 0; i < Participants.participants.length; i++) {
            var userId = Participants.participants[i];
            var name = Participants.id_name[userId];
            this.reputationChoices[name] = {};
            this.reputations[name] = 0;

            for (var j = 0; j < Participants.participants.length; j++) {
                if (i != j) {
                    var otherId = Participants.participants[j];
                    var otherName = Participants.id_name[otherId];
                    this.reputationChoices[name][otherName] = 0;
                }
            }
        }

        Neighborhoods.initializeNeighborhoodReputations();
    },

    updateReputation: function(userId, targetName, rank) {
        console.log("updateReputation called");
        var userName = Participants.id_name[userId];
        var previousRank = this.reputationChoices[userName][targetName];
        this.reputationChoices[userName][targetName] = rank;
        var diff = rank - previousRank;
        this.reputations[targetName] += diff;

        Neighborhoods.updateNeighborhoodReputations(this.reputations);
    },
}