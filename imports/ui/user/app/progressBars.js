import { Template } from 'meteor/templating';

import { SessionInfo } from '../../../api/collections/game_collections.js';
import { TimeInfo } from '../../../api/collections/game_collections.js';
import { Time } from '../../../api/time.js';

import './progressBars.html';

Template.progressBars.helpers({
    progressPercentage: function() {
        var percentageValue = "";

        var countsArray = [];
        var colorCounts = SessionInfo.findOne({id: 'global'}).colorCounts;
        for (var color in colorCounts) {
            if colorCounts.hasOwnProperty(color) {
                countsArray.push(colorCounts[color]);
            }
        }

        var numNodes = SessionInfo.findOne({id: 'global'}).numberOfNodes;
        var numAdversaries = SessionInfo.findOne({id: 'global'}).numberOfAdversaries;

        if (colorCounts != null && numNodes != null && numAdversaires != null) {
            var percentage = Math.round(100 * Math.max.apply(null, countsArray) / (numNodes - numAdversaries)) + '%';
        }

        // if(gameProgressBar = $('#gameProgress')) {
        //     gameProgressBar.css('width', percentageValue);
        // }

        return percentage;
    },

    timeRemaining: function() {
        var timeValue = "";

        var timeInfo = TimeInfo.findOne({})
        var currentTime = timeInfo.currentTime;
        var currentSessionStart = timeInfo.currentSessionStart;

        if (currentTime != null && currentSessionStart != null) {
            var millisecondsRemaining = Time.sessionLength * Time.timeUpdateRate - (currentTime - currentSessionStart);
            timeValue = millisecondsToTime(millisecondsRemaining);
        }

        return timeValue;
    }
});