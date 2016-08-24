import { Template } from 'meteor/templating';

import { SessionInfo } from '../../../api/collections/game_collections.js';
import { TimeInfo } from '../../../api/collections/game_collections.js';

import './preSessionCountdown.html';

Template.preSessionCountdown.helpers({
    status: function() {
        var status = '';

        var sessionNumber = SessionInfo.findOne({id: 'global'}).sessionNumber;
        if (sessionNumber != null) {
            console.log('sessionnumber not null');
            var secondsRemaining = 0;
            var currentTime = TimeInfo.findOne({}).currentTime;
            var lastSessionEndTime = TimeInfo.findOne({}).lastSessionEndTime;
            var preSessionLength = TimeInfo.findOne({}).preSessionLength;
            var postSessionLength = TimeInfo.findOne({}).postSessionLength;

            console.log(currentTime);

            secondsRemaining = Math.ceil((1000 * preSessionLength + 1000 * postSessionLength - (currentTime - lastSessionEndTime)) / 1000);

            console.log(secondsRemaining);

            if (sessionNumber < 1) {
                secondsRemaining -= postSessionLength;
            } else {
                secondsRemaining = Math.min(preSessionLength, secondsRemaining);
            }

            status = secondsRemaining;
        }
        
        return status;
    },
});


