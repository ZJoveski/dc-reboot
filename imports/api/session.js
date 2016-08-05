import { Parameters } from './parameters.js';
import { Participants } from './participants.js';
import { Neighborhoods } from './neighborhoods.js';
import { ColorMagic } from './colors_mapping.js';
import { Messages } from './collections/game_collections.js';
import { Logger } from './logging.js';
import { SessionInfo } from './collections/game_collections.js';


// includes Communcation Management
export var Session = {
    SessionInfo: SessionInfo,

    sessionNumber: 0,   // current Session
    batchNumber: 0,
    batchSize: 1,   // current batch size,
    batchMode: 'default',
    currentBatchGame: 0,
    counts: {},             // current number of nodes that are a certain color
    colors: {},             // colors of each player node, key is name of participant, TODO: consider making this a collection
    outcomeColor: 'white',
    defaultNodeColor: 'white',
    adjMatrix: [],
    outcome: false,
    numberOfNodes: 0, 
    numberOfAdversaries: 0,  
    adversaryAssignment: 'random',
    communicationUsageLevels: {},
    communicationUnitsRemaining: {},

    requestToBeAssignedNext: 1,
    requestToBeProcessedNext: 1,
    freeToUpdateColors: false,

    checkResetBatch: function(isProperGames) {
        if (this.currentBatchGame == this.batchSize) {
            this.currentBatchGame = 0;
        }

        if (this.currentBatchGame == 0) {
            // Get size and mode (treatment type) of current batch from batch configuration files (if they exist)
            var batchIndex = this.batchNumber;
            this.incrementBatchNumber();
            Parameters.setBatchParameters(isProperGames, batchIndex);

            if (this.batchMode == 'adversarial') {
                Parameters.setAdversarialParameters(isProperGames, batchIndex);
            }

            /* Log entry. */ Logger.recordBatchStart(this.batchNumber);
        }
    },

    initializeSessionInfo: function() {
        this.sessionNumber = 0;
        this.batchNumber = 0;

        SessionInfo.upsert({id: 'global'}, { $set: {
            sessionNumber: 0,
            batchNumber: 0,
            outcome: this.outcome,
            outcomeColor: this.outcomeColor
        }});
    },

    incrementSessionNumber: function() {
        this.sessionNumber++;

        SessionInfo.update({id: 'global'}, {$set: {
            sessionNumber: this.sessionNumber
        }});
    },

    incrementBatchNumber: function() {
        this.batchNumber++;

        SessionInfo.update({id: 'global'}, {$set: {
            batchNumber: this.batchNumber
        }});
    }

    // Assign default initial color to nodes.
    assignColorsToNodes: function() {
        colors = {};

        for (var i = 0; i < Participants.participants.length; i++) {
            this.colors[Participants.node_name[i]] = this.defaultNodeColor;
        }

        Neighborhoods.initializeNeighborhoodColors();

        /* Log entry. */ Logger.recordInitialAssignmentOfColors(this.colors);
    },

    initializeCommunicationUsageLevels: function() {
        for(var i = 0; i < Participants.participants.length; i++) {
            this.communicationUsageLevels[Participants.participants[i]] = 0;
        }
    },

    initializeCommunicationLimits: function() {
        this.communicationUnitsRemaining = {};
        for(var i = 0; i < Participants.participants.length; i++) {
            var remaining = 0;
            
            if(Parameters.costBasedCommunication) {
                if(Parameters.structuredCommunication) {
                    remaining = Math.floor(1/(Parameters.communicationCostMultipliers[Parameters.communicationCostLevel] * Parameters.structuredCommunicationCharactersNumberMultiplier));
                }
                else {
                    remaining = precise_round_to_number(1/Parameters.communicationCostMultipliers[Parameters.communicationCostLevel], 0); 
                }
            }
            else {
                if(Parameters.structuredCommunication) {
                    remaining = Math.floor(Parameters.communicationLengthBound/Parameters.structuredCommunicationCharactersNumberMultiplier);
                }
                else {
                    remaining = Parameters.communicationLengthBound;
                }
            }

            this.communicationUnitsRemaining[Participants.participants[id]] = remaining;

            SessionInfo.upsert({id: Participants.participants[i]}, {$set: {
                communicationUnitsRemaining: remaining
            }});
        }
    },

    initializeColorCounts: function() {
        for (var i = 0; i < ColorMagic.colors; i++) {
            var color = ColorMagic.colors[i];
            var count = 0;

            for (var name in this.colors) {
                if (this.colors.hasOwnProperty(name)) {
                    var nodeColor = this.colors[name];
                    if (nodeColor == color) {
                        count++;
                    }
                }
            }

            this.counts[color] = count;
        }

        SessionInfo.upsert({id: 'global'}, {$set: {
            colorCounts: this.counts
        }});

        /* Log entry. */ Logger.recordSessionColorCounts(this.counts);
    },

    // Initialize the information related to enumerating and processing requests for color changes.
    initializeColorChangeInfo: function() {
        this.requestToBeAssignedNext = 1;
        this.requestToBeProcessedNext = 1;
        this.freeToUpdateColors = true;
    },

    setOutcome: function(outcome) {
        this.outcome = outcome;

        SessionInfo.upsert({id: 'global'}, {$set: {
            outcome: outcome
        }});

        /* Log entry. */ Logger.recordSessionOutcome(outcome);
    },

    setOutcomeColor: function(color) {
        this.outcomeColor = color;

        SessionInfo.upsert({id: 'global'}, {$set: {
            outcomeColor: color
        }});
    }

    setNumberOfNodes: function(numNodes) {
        this.numberOfNodes = numNodes;
        SessionInfo.upsert({id: 'global'}, {$set: {
            numberOfNodes: numNodes
        }});
    }

    clearMessages: function() {
        Messages.remove({});
    },

    isNewBatch: function() {
        return this.currentBatchGame == 0;
    },

    adversaryMode: function() {
        return this.batchMode == 'adversarial';
    },

    updateCommunicationUnitsRemaining: function(userId, updateAmount) {
        SessionInfo.update({id: userId}, {$inc: {communicationUnitsRemaining: (-updateAmount)}});
    },
}