import { Template } from 'meteor/templating';

import './gameScreen.html';

import { Utilities } from '../../../api/util.js';
import { ColorMagic } from '../../../api/colors_mapping.js';

import { ProgressInfo } from '../../../api/collections/game_collections.js';
import { ParticipantsInfo } from '../../../api/collections/game_collections.js';
import { SessionInfo } from '../../../api/collections/game_collections.js';
import { PayoutInfo } from '../../../api/collections/game_collections.js';
import { NeighborhoodsInfo } from '../../../api/collections/game_collections.js';
import { ParametersInfo } from '../../../api/collections/game_collections.js';

import './../../../api/meteormethods/game_methods.js';

import { Canvas } from './canvas.js'

import './progressBars.js';
import './buttons.js';
import './chatBox.js';
import './preSessionCountdown.js';
import './gameOutcomeStatus.js';

var gameCanvas;

Template.experiment.onCreated(function() {
    // Beep at the players to get their attention
    var audio = new Audio('/mp3/beep_alert.mp3');
    var playthroughs = 3;

    var playerNoise = setInterval(function() {
        if(playthroughs > 0) {
            audio.play();
            playthroughs--;
        } else {
            clearInterval(playerNoise)
        }
    }, 1200);

    gameCanvas = new Canvas();
});

// redraws the game nodes
Tracker.autorun(function() {
    var progress = ProgressInfo.findOne({});
    var sessionInProgress = progress.sessionInProgress;
    var postSessionInProgress = progress.postSessionInProgress;
    var preSessionInProgress = progress.preSessionInProgress;
    var experimentInProgress = progress.experimentInProgress;

    if (sessionInProgress || postSessionInProgress) {
        console.log("redrawing update");
        var neighborsInfo = NeighborhoodsInfo.findOne({userId: Meteor.userId()});
        if (neighborsInfo != null) {
            var namesOfNeighbors = neighborsInfo.namesOfNeighbors;
            var neighAdjMatrix = neighborsInfo.neighAdjMatrix;
            //Session.set("clientName", namesOfNeighbors[0]);

            if (gameCanvas) { 
                console.log("redrawing canvas");
                setTimeout(function() {
                    gameCanvas.clear();  
                    gameCanvas.draw(namesOfNeighbors,neighAdjMatrix); 
                }, 200);
            } 
        }
    } else if (preSessionInProgress) {
        if (gameCanvas) {  
                gameCanvas.clear(); 
        }
        
        // ... and set the value of lastRequestedColor to 'white'
        Session.set('lastRequestedColor', "white");
    } else if (experimentInProgress) {
        if(gameCanvas) {
            gameCanvas.clear();
        }
    }
});

// updates the colors of the game nodes
Tracker.autorun(function() {
    if (gameCanvas) {
        var neighborhoodColors = NeighborhoodsInfo.findOne({userId: Meteor.userId()}).neighborhoodColors;
        for (var name in neighborhoodColors) {
            if (neighborhoodColors.hasOwnProperty(name)) {
                gameCanvas.updateNodeColor(name, neighborhoodColors[name]);
            }
        } 
    }
    
});

Template.experiment.helpers({
    userIsParticipant: function() {
        if(!Meteor.userId()) return false;
    
        // Check if in session or in post session
        var inSession = false;
        var inPostSession = false;
        var progress = ProgressInfo.findOne({});
        if(progress !== undefined) {
            inSession = progress.sessionInProgress;
            inPostSession = progress.postSessionInProgress;
        }
        
        if((inSession || inPostSession) && (ParticipantsInfo.findOne({}).isParticipant)) {
            return true;
        } else {
            return false;
        }
    },

    preSessionInProgress: function() {
        var response = false;

        var preSessionInProgress = ProgressInfo.findOne({}).preSessionInProgress;
        if (preSessionInProgress != null) {
            response = preSessionInProgress;
        }
        
        return response;
    },

    postSessionInProgress: function() {
        var response = false;

        var postSessionInProgress = ProgressInfo.findOne({}).postSessionInProgress;
        if (postSessionInProgress != null) {
            reponse = postSessionInProgress;
        }

        return response;
    },

    waitForNextExperimentStatus: function() {
        var status = '';

        // See if experiment is in progress
        var experimentInProgress = false;
        var progress = ProgressInfo.findOne({});
        if(progress !== undefined) {
            experimentInProgress = progress.experimentInProgress;
        } 

        if (!experimentInProgress) {
            status = 'Please wait for the first game to begin.';
        } else {
            status = 'You will not participate in the current batch. Please wait for the next batch. ' + 
                    'It will start soon and you will participate in it!';
            var sessionInProgress = ProgressInfo.findOne({}).sessionInProgress;
            if (sessionInProgress) {
                var sessionNumber = SessionInfo.findOne({id: 'global'}).sessionNumber;
                var batchSize = SessionInfo.findOne({id: 'global'}).batchSize;
                if (sessionNumber != null && batchSize != null) {
                    status += ' The current batch is on game ' + sessionNumber + '/' + batchSize + '.';
                }
            }

        }

        return status;
    },

    totalPayout: function() {
        var payout = PayoutInfo.findOne({id: Meteor.userId()}).totalPayout;      
        return Utilities.precise_round(payout, 2);
    },

    sessionPayout: function() {
        var payout = 0;

        var sessionPayout = PayoutInfo.findOne({id: Meteor.userId()}).sessionPayout;
        if (sessionPayout != null) {
            payout = sessionPayout;
        }

        return Utilities.precise_round(payout, 2);
    },

    potentialPayouts: function() {
        var payouts = [];

        var potentialPayouts = PayoutInfo.findOne({id: Meteor.userId()}).potentialPayouts;
        for (var i = 0; i < ColorMagic.colors.length; i++) {
            var payout = Utilities.precise_round(potentialPayouts[ColorMagic.colors[i]], 2);
            var color = ColorMagic.colors[i].toUpperCase();
            payouts.push({
                payout: payout,
                color: color,
                left: (2.5 + i*19),
                background: ColorMagic.colors[i],
                border: ColorMagic.colors[i],
                top: 65.0
            })
        }

        var payout = Utilities.precise_round(potentialPayouts['none'], 2);
        payouts.push({
            payout: payout,
            color: 'NO',
            left: 12,
            background: '#FFF0F5',
            border: '#FFF0F5',
            top: 75.0
        })

        return payouts;
    },

    currentName: function() {
        var reponse = '';
        var namesOfNeighbors = NeighborhoodsInfo.findOne({userId: Meteor.userId()}).namesOfNeighbors;
        if (namesOfNeighbors.length > 0) {
            response = namesOfNeighbors[0];     // your own name
        }

        return response;
    },

    communicationType: function() {
        var response = '';
        var globalCommunication = ParametersInfo.findOne({userId: Meteor.userId()}).globalCommunication;
        if (globalCommunication) {
            response += ' GLOBAL';
        } else {
            response += ' LOCAL';
        }
                                           
        return response;
    },

    communicationCost: function() {
        var response = '';
        var costBasedCommunication = ParametersInfo.findOne({userId: Meteor.userId()}).costBasedCommunication;
        if (costBasedCommunication) {
            response += 'COST BASED';
        } else {
            response += 'FREE';
        }
                                   
        return response;
    },

    batchStatus: function() {
        var status = "";

        var batchNumber = SessionInfo.findOne({id: 'global'}).batchNumber;
        if (batchNumber != null) {
            status = "Batch " + batchNumber;
        }
                             
        return status;
    },

    sessionStatus: function() {
        var status = "";

        var sessionNumber = SessionInfo.findOne({id: 'global'}).sessionNumber;
        if (sessionNumber != null) {
            status = "Game " + sessionNumber;
        }
                             
        return status;
    },

    isAdversary: function() {
        var isAdversary = false;

        var adversaryInfo = ParticipantsInfo.findOne({userId: Meteor.userId()}).isAdversary;
        if (adversaryInfo != null) {
            isAdversary = adversaryInfo;
        }

        return isAdversary;
    },
});

