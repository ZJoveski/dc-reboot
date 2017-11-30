import { Template } from 'meteor/templating';

import { SessionInfo } from '../../../api/collections/game_collections.js';
import { TimeInfo } from '../../../api/collections/game_collections.js';
import { Time } from '../../../api/time.js';
import { Utilities } from '../../../api/util.js';

import './progressBars.html';

Template.progressBars.helpers({
    progressPercentage: function() {
        var percentageValue = "";

        var countsArray = [];
        var colorCounts = SessionInfo.findOne({id: 'global'}).colorCounts;
        if (colorCounts) {
            for (var color in colorCounts) {
                if (colorCounts.hasOwnProperty(color)) {
                    countsArray.push(colorCounts[color]);
                }
            }     
        } else {
            countsArray.push(0);
        }
        

        var numNodes = SessionInfo.findOne({id: 'global'}).numberOfNodes;
        var numAdversaries = SessionInfo.findOne({id: 'global'}).numberOfAdversaries;

        if (colorCounts != null && numNodes != null && numAdversaries != null) {
            var percentage = Math.round(100 * Math.max.apply(null, countsArray) / (numNodes - numAdversaries)) + '%';
        }

        return percentage;
    },

    timeRemaining: function() {
        var timeValue = "";

        var timeInfo = TimeInfo.findOne({})
        var currentTime = timeInfo.currentTime;
        var currentSessionStart = timeInfo.currentSessionStartTime;

        if (currentTime != null && currentSessionStart != null) {
            var millisecondsRemaining = Time.sessionLength * Time.timeUpdateRate - (currentTime - currentSessionStart);
            timeValue = Utilities.millisecondsToTime(millisecondsRemaining);
        }

        return timeValue;
    },

    timeWidth: function() {
        var timeValue = 0;

        var timeInfo = TimeInfo.findOne({})
        var currentTime = timeInfo.currentTime;
        var currentSessionStartTime = timeInfo.currentSessionStartTime;

        if (currentTime != null && currentSessionStartTime != null) {
            timeValue = Math.min(100, 100 - (currentTime - currentSessionStartTime)/1000 * 100/Time.sessionLength);
        }

        return timeValue + '%';  
    },
});