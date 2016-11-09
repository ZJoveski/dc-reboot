import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import { Utilities } from '../../../api/util.js';
import { ColorMagic } from '../../../api/colors_mapping.js';

import { ProgressInfo } from '../../../api/collections/game_collections.js';
import { ParticipantsInfo } from '../../../api/collections/game_collections.js';
import { SessionInfo } from '../../../api/collections/game_collections.js';
import { PayoutInfo } from '../../../api/collections/game_collections.js';
import { NeighborhoodsInfo } from '../../../api/collections/game_collections.js';
import { ParametersInfo } from '../../../api/collections/game_collections.js';
import { ReputationsCollection } from '../../../api/collections/game_collections.js';

import './../../../api/meteormethods/game_methods.js';

import { Canvas } from './canvas2.js'

import './progressBars.js';
import './buttons.js';
import './chatBox.js';
import './preSessionCountdown.js';
import './gameOutcomeStatus.js';

import './gameScreen.html';

import { MessagesCollection } from '../../../api/collections/game_collections.js';


var gameCanvas;
var gameCanvasInit;

Template.experiment.onCreated(function() {
    // Beep at the players to get their attention
    var audio = new Audio('/mp3/beep_alert.mp3');
    var playthroughs = 3;

    var playerNoise = setInterval(function() {
        if(playthroughs > 0) {
            //audio.play();
            playthroughs--;
        } else {
            clearInterval(playerNoise)
        }
    }, 1200);

    gameCanvas = Canvas();
    // gameCanvas("#canvas", {}, {});
    gameCanvasInit = false;
    console.log('onCreated');
});

// redraws the game nodes
Tracker.autorun(function() {
    var progress = ProgressInfo.findOne({});
    var sessionInProgress, postSessionInProgress, preSessionInProgress, experimentInProgress;
    if (progress) {
        sessionInProgress = progress.sessionInProgress;
        postSessionInProgress = progress.postSessionInProgress;
        preSessionInProgress = progress.preSessionInProgress;
        experimentInProgress = progress.experimentInProgress;
    }

    if (sessionInProgress || postSessionInProgress) {
        console.log("redrawing update");
        var neighborsInfo = NeighborhoodsInfo.findOne({userId: Meteor.userId()});
        var reputationsInfo = ReputationsCollection.findOne({userid: Meteor.userId()});
        console.log(reputationsInfo);
        console.log(ReputationsCollection);
        console.log(ReputationsCollection.find({}));
        if (neighborsInfo != null && reputationsInfo != null) {
            var namesOfNeighbors = neighborsInfo.namesOfNeighbors;
            var neighAdjMatrix = neighborsInfo.neighAdjMatrix;
            var neighborhoodColors = neighborsInfo.neighborhoodColors;
            var updateColor = neighborsInfo.updateColor;
            var updateReputation = reputationsInfo.updateReputation;
            var neighborhoodReputations = reputationsInfo.neighborhoodReputations;

            console.log("neighborhoodReputations");
            console.log(neighborhoodReputations);
            console.log("updateReputation");
            console.log(updateReputation);
            console.log("neighborhoodreputation");
            console.log(neighborhoodReputations);

            if (gameCanvasInit) { 
                console.log("redrawing canvas");

                if (updateColor || updateReputation) {
                    for (var name in neighborhoodColors) {
                        console.log("updating color");
                        if (neighborhoodColors.hasOwnProperty(name)) {
                            console.log('neighborHoodColor');
                            console.log(name);
                            console.log(neighborhoodColors[name]);
                            gameCanvas.updateNodeColor(name, neighborhoodColors[name]);
                        }
                    }

                    for (var name in neighborhoodReputations) {
                        console.log("updating reputation");
                        if (neighborhoodReputations.hasOwnProperty(name)) {
                            console.log('neighborHoodReputation');
                            console.log(name);
                            console.log(neighborhoodReputations[name]);
                            gameCanvas.updateNodeReputation(name, neighborhoodReputations[name]);
                        }
                    }
                } else {
                    setTimeout(function() {
                        // gameCanvas.clear();  
                        // gameCanvas.draw(namesOfNeighbors,neighAdjMatrix);
                        gameCanvas.updateData(namesOfNeighbors,neighAdjMatrix, neighborhoodReputations);
                    }, 200);
                }
            } else {
                // TODO: get rid of this if testing works
                setTimeout(function() {
                    console.log("intializing canvas");
                    console.log(neighAdjMatrix);

                    gameCanvas("#canvas", namesOfNeighbors, neighAdjMatrix, neighborhoodReputations);
                    gameCanvasInit = true;
                }, 200);
                // console.log("intializing canvas");
                // console.log(neighAdjMatrix);

                // gameCanvas("#canvas", namesOfNeighbors, neighAdjMatrix);
                // gameCanvasInit = true;
            }
        }
    } else if (preSessionInProgress) {
        // if (gameCanvas) {  
        //         gameCanvas.clear(); 
        // }
        
        // ... and set the value of lastRequestedColor to 'white'
        gameCanvasInit = false;
        Session.set('lastRequestedColor', "white");
    } else if (experimentInProgress) {
        // if(gameCanvas) {
        //     gameCanvas.clear();
        // }
    }
});

Template.experiment.helpers({
    userIsParticipant: function() {
        if(!Meteor.userId()) return false;
    
        // Check if in session or in post session
        var inSession = false;
        var inPostSession = false;
        var isParticipant = false;
        var progress = ProgressInfo.findOne({});
        var participantsInfo = ParticipantsInfo.findOne({});
        console.log('participantsInfo');
        console.log(participantsInfo);
        if(progress !== undefined) {
            inSession = progress.sessionInProgress;
            inPostSession = progress.postSessionInProgress;
        }

        if (participantsInfo != null) {
            isParticipant = participantsInfo.isParticipant;
        }

        console.log('in Session: ' + inSession);
        console.log('in postSesion: ' + inPostSession);
        console.log('isparticipant: ' + isParticipant);
        
        if((inSession || inPostSession) && isParticipant) {
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
            response = postSessionInProgress;
        }

        return response;
    },

    waitForNextExperimentStatus: function() {
        var status = '';
    
        // Check if in session or in post session
        var inSession = false;
        var inPostSession = false;
        var inPreSession = false;
        var progress = ProgressInfo.findOne({});
        if(progress !== undefined) {
            inSession = progress.sessionInProgress;
            inPostSession = progress.postSessionInProgress;
            inPreSession = progress.preSessionInProgress;
        }

        if (inSession || inPostSession || inPreSession) {
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
        } else {
            status = 'Please wait for the first game to begin.';
        }

        // if (!experimentInProgress) {
        //     status = 'Please wait for the first game to begin.';
        // } else {
        //     status = 'You will not participate in the current batch. Please wait for the next batch. ' + 
        //             'It will start soon and you will participate in it!';
        //     var sessionInProgress = ProgressInfo.findOne({}).sessionInProgress;
        //     if (sessionInProgress) {
        //         var sessionNumber = SessionInfo.findOne({id: 'global'}).sessionNumber;
        //         var batchSize = SessionInfo.findOne({id: 'global'}).batchSize;
        //         if (sessionNumber != null && batchSize != null) {
        //             status += ' The current batch is on game ' + sessionNumber + '/' + batchSize + '.';
        //         }
        //     }

        // }

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

