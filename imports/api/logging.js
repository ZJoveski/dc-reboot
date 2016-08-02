import { ExperimentLog } from './collections/game_collections.js';
import { PayoutInfo } from './collections/game_collections.js';
import { Participants } from './participants.js';
import { Utilities } from './util.js';
import { ColorMagic } from './colors_mapping.js';

export var Logger = {
    // EXPS1
    recordExperimentStart: function() {
        insertExperimentLogEntry("EXPS1", "A new experiment has started.");
        
        console.log("A new experiment has started.");
    },

    // EXPT2
    recordExperimentCompletion: function() {
        insertExperimentLogEntry("EXPT2", "The experiment has ended.");
        
        console.log("The experiment has ended.");
    },

    // PYEA1
    recordExperimentPayouts: function() {
        var experimentPayoutsRecord = "";
        
        PayoutInfo.find({}).forEach( function(user) {
            experimentPayoutsRecord += getFullPlayerIdentification(user.id, "userId") + "\t" + user.totalPayout + "\n";
        });
        
        // Remove the last "\n" character.
        experimentPayoutsRecord = experimentPayoutsRecord.slice(0, experimentPayoutsRecord.length - 1);
        
        insertExperimentLogEntry("PYEA1", experimentPayoutsRecord);
    },

    // PYSP2
    recordPotentialSessionPayouts: function(potentialPayouts) {
        var potSessionPayouts = "";
        
        for(var userId in potentialPayouts) {
            if(potentialPayouts.hasOwnProperty(userId)) {
                potSessionPayouts += getFullPlayerIdentification(userId, "userId");
                
                for(var color in potentialPayouts[userId]) {
                    if((potentialPayouts[userId]).hasOwnProperty(color)) {
                        potSessionPayouts += "\t" + Utilities.precise_round(potentialPayouts[userId][color], 2); 
                    }
                }
            }
            potSessionPayouts += "\n";
        }
        
        // Remove the last "\n" character.
        potSessionPayouts = potSessionPayouts.slice(0, potSessionPayouts.length - 1);
        
        insertExperimentLogEntry("PYSP2", potSessionPayouts);
    },

    // ADVR1
    recordAdversaries: function() {
        var adversariesInfo = "";

        for (var i = 0; i < Participants.adversaries.length; i++) {
            var userId = Participants.participants[i];
            adversariesInfo += getFullPlayerIdentification(userId, "userId");
            adversariesInfo += '\t' + Participants.adversaries[i];
            adversariesInfo += '\n';
        }

        // Remove the last "\n" character.
        adversariesInfo = adversariesInfo.slice(0, adversariesInfo.length-1);

        insertExperimentLogEntry("ADVR1", adversariesInfo);
    },

    // PYSA3
    recordSessionPayouts: function(sessionPayouts) {
        var sessionPayoutsRecord = "";

        for (var userId in sessionPayouts) {
            if (sessionPayouts.hasOwnProperty(userId)) {
                sessionPayoutsRecord += getFullPlayerIdentification(userId, "userId") + "\t" + sessionPayouts[userId] + "\n";
            }
        }
        
        // Remove the last "\n" character.
        sessionPayoutsRecord = sessionPayoutsRecord.slice(0, sessionPayoutsRecord.length - 1);
        
        insertExperimentLogEntry("PYSA3", sessionPayoutsRecord);
    },

    // ITES1
    recordExperimentInitializationStart: function() {
        insertExperimentLogEntry("ITES1", "");
    },

    // ITET2
    recordExperimentInitializationCompletion: function() {
        insertExperimentLogEntry("ITET2", "");
    },

    // ITZS1
    recordSessionInitializationStart: function(sessionNumber) {
        insertExperimentLogEntry("ITZS1", "" + sessionNumber)
    },

    // ITZT2
    recordSessionInitializationCompletion: function(sessionNumber) {
        insertExperimentLogEntry("ITZT2", "" + sessionNumber)
    },

    // SESS1
    recordSessionStart: function(sessionNumber) {
        console.log("================================================================================");
        console.log("Game " + sessionNumber + " has started.");
        
        insertExperimentLogEntry("SESS1", "" + sessionNumber);
    },

    // SEST2
    recordSessionCompletion: function(sessionNumber) {
        console.log("Game " + sessionNumber + " has ended.");
        console.log("================================================================================");
        
        insertExperimentLogEntry("SEST2", "" + sessionNumber);
    },

    // BATN1
    recordBatchStart: function(batchNumber) {
        console.log("================================================================================");
        console.log("Batch " + batchNumber + " has started");

        insertExperimentLogEntry("BATN1", "" + batchNumber);
    },

    // SESO3
    // Need to also keep record of the type of consensus being reached!!!
    recordSessionOutcome: function(outcome) {
        var outcomeRecord = "" + outcome;
        
        console.log("The game has ended with outcome: " + outcomeRecord);
        
        insertExperimentLogEntry("SESO3", outcomeRecord);
    },

    // PRMM1
    recordSessionCommunicationParameters: function(communication, globalCommunication, structuredCommunication) {
        var communicationParameters = "";
        
        communicationParameters += "communication\t" + communication + "\n";
        if(communication) {
            communicationParameters += "globalCommunication\t" + globalCommunication + "\n";
            communicationParameters += "structuredCommunication\t" + structuredCommunication + "\n";    
        }
        
        // Remove the last "\n" character.
        communicationParameters = communicationParameters.slice(0, communicationParameters.length - 1);
        
        // console.log("Communication parameters:");
        // console.log(communicationParameters);
        
        insertExperimentLogEntry("PRMM1", communicationParameters);
    },

    // INCS1    (Individual communication scopes)
    recordIndividualCommunicationScopes: function(communicationScopes) {
        var scopes = "";
        
        for(var i = 0; i < Participants.participants.length; i++) {
            var userId = Participants.participants[i];
            scopes += getFullPlayerIdentification(userId, "userId") + "\t" + communicationScopes[userId] + "\n";
        }
        
        // Remove the last "\n" character.
        scopes = scopes.slice(0, scopes.length - 1);
        
        insertExperimentLogEntry("INCS1", scopes);
    },

    // Legacy
    // // PRMC2
    // recordSessionCommunicationCostParameters: function() {
    //     // No need to record communication cost parameters if no communication is taking place in the current session.
    //     if(!communication) {
    //         return;
    //     }
        
    //     var communicationCostParameters = "";
        
    //     communicationCostParameters += "costBasedCommunication\t" + costBasedCommunication + "\n";
        
    //     if(costBasedCommunication) {
    //         communicationCostParameters += "communicationCostLevel\t" + communicationCostLevel + "\n";
    //     }
    //     else {
    //         communicationCostParameters += "communicationLengthBound\t" + communicationLengthBound + "\n";
    //     }   
        
    //     communicationCostParameters += "messageLengthBound\t" + messageLengthBound + "\n";
        
    //     // Remove the last "\n" character.
    //     communicationCostParameters = communicationCostParameters.slice(0, communicationCostParameters.length - 1);
        
    //     insertExperimentLogEntry("PRMC2", communicationCostParameters);
    // },

    // PRMI3
    recordSessionIncentivesConflictParameters: function(incentivesConflictLevel, homophilicPreferences) {
        var incentivesConflictParameters = "";
        
        incentivesConflictParameters += "incentivesConflictLevel\t" + incentivesConflictLevel + "\n"; 
        
        incentivesConflictParameters += "homophilicPreferences\t" + homophilicPreferences + "\n";

        // Remove the last "\n" character.
        incentivesConflictParameters = incentivesConflictParameters.slice(0, incentivesConflictParameters.length - 1);
        
        // console.log("Incentive conflict parameters:");
        // console.log(incentivesConflictParameters);
        
        insertExperimentLogEntry("PRMI3", incentivesConflictParameters);
    },

    // PARE1
    recordExperimentParticipants: function(parts) {
        insertExperimentLogEntry("PARE1", getListOfParticipants(parts));
    },

    // PARS2
    recordSessionParticipants: function(parts) {
        insertExperimentLogEntry("PARS2", getListOfParticipants(parts));
    },

    // NDNM1
    recordNodesToNamesCorrespondence: function() {
        var correspondence = "";
        
        for(var i = 0; i < Participants.participants.length; i++) {
            if(i < 10) correspondence += " ";
            correspondence += i + "\t" + Participants.node_name[i] + "\n";
        }
        
        // Remove the last "\n" character.
        correspondence = correspondence.slice(0, correspondence.length - 1);
        
        insertExperimentLogEntry("NDNM1", correspondence);
    },

    // ADJM1
    recordNetworkAdjacencyMatrix: function(adjMatrix) {
        var adjMatrixRecord = "";
        
        for(var i = 0; i < adjMatrix.length; i++) {
            for(var j = 0; j < adjMatrix[i].length; j++) {
                adjMatrixRecord += adjMatrix[i][j] + "\t";
            }
            adjMatrixRecord += "\n"
        }
        
        // Remove the last "\n" character.
        adjMatrixRecord = adjMatrixRecord.slice(0, adjMatrixRecord.length - 1);
        
        insertExperimentLogEntry("ADJM1", adjMatrixRecord);
    },

    // PRNM1
    recordParticipantsToNamesCorrespondence: function() {
        var correspondence = "";
        
        for (var userId in Participants.id_name) {
            if (id_name.hasOwnProperty(userId)) {
                correspondence += userId + "\t" + Participants.id_name[userId] + "\n";
            }
        }
        
        // Remove the last "\n" character.
        correspondence = correspondence.slice(0, correspondence.length - 1);
        
        insertExperimentLogEntry("PRNM1", correspondence);
    },

    // COLA1
    recordInitialAssignmentOfColors: function(colors) {
        var assignmentOfColors = "";

        for (var userName in colors) {
            if (colors.hasOwnProperty(userName)) {
                assignmentOfColors += getFullPlayerIdentification(userName, "nameId") + "\t" + colors[userName] + "\n";
            }
        }
        
        // Remove the last "\n" character.
        assignmentOfColors = assignmentOfColors.slice(0, assignmentOfColors.length - 1);
        
        insertExperimentLogEntry("COLA1", assignmentOfColors);
    },

    // COLC2
    recordSessionColorCounts: function(counts) {
        var record = "";

        for (var color in counts) {
            if (counts.hasOwnProperty(color)) {
                record += color + '\t' + counts[color] + '\n';
            }
        }
        
        if(record !== "") {
            // Remove the last "\n" character.
            record = record.slice(0, record.length - 1);
            
            insertExperimentLogEntry("COLC2", record);
            
            console.log("Color counts:");
            console.log(record);
        }
    },

    // CRQM3
    recordRequestMade: function(name, newColor, requestNo) {
        var actualNewColor = ColorMagic.deanonymizeColor(name, newColor);
        
        insertExperimentLogEntry("CRQM3", requestNo + "\t" + getFullPlayerIdentification(name, "nameId") + "\t" + actualNewColor);
    },

    // CRQP4
    recordRequestProcessed: function(actualNewColor, name, requestNo) {
        console.log("Color change:");
        console.log(requestNo + "\t" + getFullPlayerIdentification(name, "nameId") + "\t" + actualNewColor);
        
        insertExperimentLogEntry("CRQP4", requestNo + "\t" + getFullPlayerIdentification(name, "nameId") + "\t" + actualNewColor);
    },

    // CRQC5
    recordRequestCancelled: function(name, newColor, requestNo) {
        var actualNewColor = ColorMagic.deanonymizeColor(name, newColor);
        
        insertExperimentLogEntry("CRQC5", requestNo + "\t" + getFullPlayerIdentification(name, "nameId") + "\t" + actualNewColor);
    },

    // ANOI1
    recordAnonymizationInfo: function() {
        var anonymizationInfo = "";
        
        for(var node in ColorMagic.node_permutation) {
            if(node_permutation.hasOwnProperty(node)) {
                anonymizationInfo += getFullPlayerIdentification(node, "nodeId") + "\t";
                var permutation = ColorMagic.colorPermutations[node_permutation[node]];
                for(var i = 0; i < permutation.length; i++) {
                    anonymizationInfo += permutation[i] + '\t';
                }
                anonymizationInfo += '\n';
            }
        }
        
        // Remove the last "\n" character.
        anonymizationInfo = anonymizationInfo.slice(0, anonymizationInfo.length - 1);
        
        insertExperimentLogEntry("ANOI1", anonymizationInfo);
    },

    // MSGR1
    recordMessageRequest: function(userId, structured, message) {
        var messageRecord = prepareMessageRecord(userId, structured, message);
        
        console.log("Message attempt:");
        console.log(messageRecord);
        
        insertExperimentLogEntry("MSGR1", messageRecord);
    },

    // MSGS2
    recordMessageSent: function(userId, structured, message) {
        var messageRecord = prepareMessageRecord(userId, structured, message);
        insertExperimentLogEntry("MSGS2", messageRecord);
    },

    // MSGF3
    recordMessageFailed: function(userId, structured, message) {
        var messageRecord = prepareMessageRecord(userId, structured, message);
        insertExperimentLogEntry("MSGF3", messageRecord);
    },

    // USLI1
    recordUserLoggingIn: function(userId, connectionId, ipAddr, userAgent, loginTime) {
        // If an experiment is not in progress, no need to do this!!!
        var record = userId + "\t" + connectionId + "\t" + ipAddr + "\t" + userAgent + "\t" + loginTime;
        
        insertExperimentLogEntry("USLI1", record);
    },

    // USLO2
    recordUserLoggingOut: function(userId, connectionId, lastActivity, logoutTime) {
        // If an experiment is not in progress, no need to do this!!!
        var record = userId + "\t" + connectionId + "\t" + lastActivity + "\t" + logoutTime;
        
        insertExperimentLogEntry("USLO2", record);
    },
};



var insertExperimentLogEntry = function(typeOfEntry, entry) {
    var date = new Date();
    var timestamp = date.toLocaleTimeString();
    
    var milliseconds = date.getMilliseconds();
    var millisecondsTimestamp = ".";
    if(milliseconds < 10) { millisecondsTimestamp += "00"; }
    else if(milliseconds < 100) {millisecondsTimestamp += "0"; }
    millisecondsTimestamp += milliseconds;
    
    timestamp += millisecondsTimestamp;
    
    ExperimentLog.insert({
        timestamp: timestamp,
        type: typeOfEntry,
        entry: entry
    }); 
}

var getFullPlayerIdentification = function(id, type) {
    var userId = "", nameId = "", nodeId = "", identification = "";
    
    if(type == "userId") {
        userId = id;
        nameId = Participants.id_name[userId];
        nodeId = Participants.name_node[nameId];
    }
    else if(type == "nameId") {
        nameId = id;
        userId = Participants.name_id[nameId];
        nodeId = Participants.name_node[nameId];
    }
    else if (type == "nodeId") {
        nodeId = id;
        nameId = Participants.node_name[nodeId];
        userId = Participants.name_id[nameId];
    }
    
    identification += userId + "\t";
    identification += nameId + "\t";
    identification += nodeId;
    
    return identification;
}

var getListOfParticipants = function(parts) {
    var listOfParticipants = "";
    for(var i = 0; i < parts.length; i++) {
        // There are no email addresses present in the user accounts when dealing with MTurk workers.
        // Used only for testing the standalone application.
        // listOfParticipants += participants[i] + "\t" + Meteor.users.findOne({_id: participants[i]}).emails[0].address + "\n";
        
        listOfParticipants += parts[i] + "\n";
    }
    
    // Remove the last "\n" character.
    listOfParticipants = listOfParticipants.slice(0, listOfParticipants.length - 1);
    
    return listOfParticipants;
}

var prepareMessageRecord = function(userId, structured, message) {
    var messageRecord = getFullPlayerIdentification(userId, "userId") + "\t" + structured;
    
    if(!structured) {
        messageRecord += "\t" + message;
    }
    
    return messageRecord;
}
