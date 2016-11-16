import { Participants } from './participants.js';
import { Neighborhoods } from './neighborhoods.js';
import { ReputationsCollection } from './collections/game_collections.js';
import { Logger } from './logging.js';

export var Reputations = {

    reputationChoices: {},
    reputations: {},


    resetReputations: function() {
        for (var i = 0; i < Participants.participants.length; i++) {
            var userId = Participants.participants[i];
            var name = Participants.id_name[userId];
            this.reputationChoices[name] = {};
            this.reputations[name] = .5;

            for (var j = 0; j < Participants.participants.length; j++) {
                if (i != j) {
                    var otherId = Participants.participants[j];
                    var otherName = Participants.id_name[otherId];
                    this.reputationChoices[name][otherName] = 0;
                }
            }
        }

        Neighborhoods.resetNeighborhoodReputations();
    },

    initializeReputations: function() {
        Neighborhoods.initializeNeighborhoodReputations(this.reputations);
        Logger.recordReputations(this.reputations);
    },

    updateReputation: function(userId, targetName, rank) {
        console.log("updateReputation called");
        var userName = Participants.id_name[userId];
        this.reputationChoices[userName][targetName] = rank;
        var total_rankers = 0;
        var total_rank = 0;
        for (var i = 0; i < Participants.participants.length; i++) {
            var userId = Participants.participants[i];
            var name = Participants.id_name[userId];
            if (targetName != name) {
                var temp_rank = this.reputationChoices[name][targetName];
                if (temp_rank != 0) {
                    total_rank += temp_rank;
                    total_rankers++;
                }
            }
        }
        var percentage = .5;
        if (total_rankers > 0) {
            percentage = total_rank / total_rankers;
        }
        var new_rep = .5 + percentage*.5;
        this.reputations[targetName] = new_rep;

        Neighborhoods.updateNeighborhoodReputations(this.reputations);
        Logger.recordReputationChange(userId, targetName, rank);
        console.log(this.reputationChoices);
    },
}
