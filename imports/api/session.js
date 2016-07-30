import { Parameters } from './parameters.js';
import { Participants } from './participants.js';
import { Neighborhoods } from './neighborhoods.js';

// includes Communcation Management
export default var Session = {
    sessionNumber: 0,   // current Session
    batchNumber: 0,
    batchSize: 1,   // current batch size,
    batchMode: 'default',
    currentBatchGame: 0,
    counts: [],
    colors: {},
    outcomeColor: 'white',
    defaultNodeColor: 'white',
    adjMatrix: [],
    outcome: false,
    numberOfNodes: 0, 
    numberOfAdversaries: 0,  
    adversaryAssignment: 'random',
    communicationUsageLevels: {},
    communicationUnitsRemaining: {},

    checkResetBatch: function(isProperGames) {
        if (this.currentBatchGame == this.batchSize) {
            this.currentBatchGame = 0;
        }

        if (this.currentBatchGame == 0) {
            // Get size and mode (treatment type) of current batch from batch configuration files (if they exist)
            var batchIndex = this.batchNumber;
            this.batchNumber++;
            Parameters.setBatchParameters(isProperGames, batchIndex);

            if (this.batchMode == 'adversarial') {
                Parameters.setAdversarialParameters(isProperGames, batchIndex);
            }
        }
    },

    // Assign default initial color to nodes.
    assignColorsToNodes: function() {
        colors = {};

        for (var i = 0; i < Participants.participants.length; i++) {
            this.colors[Participants.node_name[i]] = this.defaultNodeColor;
        }

        Neighborhoods.initializeNeighborhoodColors();

        // TODO
        /* Log entry. */ recordInitialAssignmentOfColors();
    },

    initializeCommunicationUsageLevels: function() {
        for(var i = 0; i < Participants.participants.length; i++) {
            this.communicationUsageLevels[Participants.participants[i]] = 0;
        }
    },

    //TODO
    initializeCommunicationLimits: function() {
        this.communicationUnitsRemaining = {};
        for(var i = 0; i < Participants.participants.length; i++) {
            var remaining = 0;
            
            if(costBasedCommunication) {
                if(structuredCommunication) {
                    remaining = Math.floor(1/(communicationCostMultipliers[communicationCostLevel] * structuredCommunicationCharactersNumberMultiplier));
                }
                else {
                    remaining = precise_round_to_number(1/communicationCostMultipliers[communicationCostLevel], 0); 
                }
            }
            else {
                if(structuredCommunication) {
                    remaining = Math.floor(communicationLengthBound/structuredCommunicationCharactersNumberMultiplier);
                }
                else {
                    remaining = communicationLengthBound;
                }
            }
            
            communicationLimits.insert({
                id: participants[i],
                unitsRemaining: remaining
            });
        }
    },

    isNewBatch: function() {
        return this.currentBatchGame == 0;
    },

    adversaryMode: function() {
        return this.batchMode == 'adversarial';
    }
}