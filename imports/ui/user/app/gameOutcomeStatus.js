import { Template } from 'meteor/templating';

import { SessionInfo } from '../../../api/collections/game_collections.js';

import './gameOutcomeStatus.html';

Template.gameOutcomeStatus.helpers({
    status: function() {
        var status = "";

        var outcome = SessionInfo.findOne({id: 'global'}).outcome;
        console.log('outcome');
        console.log(outcome);
        if (outcome != null) {
            if (outcome) {
                var consensusColor = SessionInfo.findOne({id: Meteor.userId()}).outcomeColor;
                status = consensusColor.toUpperCase();
            } else {
                status = 'NO';
            }
        }
        
        return status;
    },

    consensus: function() {
        var outcome = false;

        var outcomeInfo = SessionInfo.findOne({id: 'global'}).outcome;
        if (outcomeInfo != null) {
            outcome = outcomeInfo;
        }

        return outcome;
    }
});