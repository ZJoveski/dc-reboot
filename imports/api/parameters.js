// import Assets?
import { Participants } from './participants.js';
import { Session } from './session.js';
import { Payouts } from './payouts.js';
import { Logger } from './logging.js';
import { ParametersInfo } from './collections/game_collections.js';

export var Parameters = {
    ParametersInfo: ParametersInfo,

    communication: false,
    globalCommunication: false,
    structuredCommunication: false,
    costBasedCommunication: false,
    communicationCostLevel: 'high',
    communicationLengthBound: 50,
    messageLengthBound: 10,
    incentivesConflictLevel: 'low',
    incentivesPayoutMultipliers:    {                      // Relevant only when balancedPreferences = true.
                                        none: 1.00,
                                        low: 1.05,
                                        medium: 1.25,
                                        high: 1.5
                                    },
    homophilicPreferences: false,
    minoritySize: 0,

    individualCommunicationParameters: {},
    structuredCommunicationCharactersNumberMultiplier: 3,       // A value of 3 indicates that a structured message costs as much as a 
                                                                // three-character unstructured message.
    communicationCostMultipliers:   {               // Relevant only when costBasedCommunication = true.
                                        low: 0.01,
                                        medium: 0.05,
                                        high: 0.1
                                    },
    communicationScopes: {},

    practiceGames: 0, // temp value,
    properGames: 0, // temp value
    practiceBatches: 0, //temp value
    properBatches: 0, //temp value

    testMode: false,        //whether or not to skip description

    readTreatments: function() {
        practiceAdjacencyMatrices = readAdjMatrix("treatments/test_size_3 (adversarial)/AMP_test.txt");
        practiceParameterValues = readNetConfig("treatments/test_size_3 (adversarial)/NCP_test.txt");
        practiceBatchConfigs = readBatchConfig("treatments/test_size_3 (adversarial)/BCP_test.txt");
        
        adjacencyMatrices = readAdjMatrix("treatments/test_size_3 (adversarial)/AM_test.txt");
        parameterValues = readNetConfig("treatments/test_size_3 (adversarial)/NC_test.txt");
        batchConfigs = readBatchConfig("treatments/test_size_3 (adversarial)/BC_test.txt");

        // // Full Experiment Data
        // practiceAdjacencyMatrices = readAdjMatrix("treatments/input_data/adjacency_matrix_practice.txt");
        // practiceParameterValues = readNetConfig("treatments/input_data/network_configuration_practice.txt");
        // practiceBatchConfigs = readBatchConfig("treatments/input_data/batch_configuration_practice.txt");
        
        // adjacencyMatrices = readAdjMatrix("treatments/input_data/adjacency_matrix.txt");
        // parameterValues = readNetConfig("treatments/input_data/network_configuration.txt");
        // batchConfigs = readBatchConfig("treatments/input_data/batch_configuration.txt");

        // Determine the number of practice and proper games from the size of the arrays loaded above
        this.practiceGames = Math.min(practiceAdjacencyMatrices.length, practiceParameterValues.length);
        this.properGames = Math.min(adjacencyMatrices.length, parameterValues.length);

        // Determine the number of batches
        if (practiceBatchConfigs.length > 0) {
            this.practiceBatches = practiceBatchConfigs.length;
        } else {
            this.practiceBatches = Math.floor(this.practiceGames / Session.batchSize);
        }

        if (batchConfigs.length > 0) {
            this.properBatches = batchConfigs.length;
        } else {
            this.properBatches = Math.ceil(this.properGames / Session.batchSize);
        }   

        // For testing purposes only
        console.log("Practice games:\t" + this.practiceGames);
        console.log("Proper games:\t" + this.properGames); 
    },

    getNextAdjMatrix: function(isProperGames, currentSession) {
        var matrix = [];
        var pars = [];
        var index = currentSession - 1;
        
        if(isProperGames) {
            if(index < this.properGames) {
                matrix = adjacencyMatrices[index];
                pars = parameterValues[index];
            }
        }
        else {
            if(index < this.practiceGames) {
                matrix = practiceAdjacencyMatrices[index];
                pars = practiceParameterValues[index];
            }
        }
        
        console.log("Game parameters:");
        console.log(pars);
        
        return matrix;
    },

    setSessionCommunicationParameters: function(isProperGames, currentSession) {
        var communicationDescription = "",          // 'none', 'local', 'global', 'minmajGL'
            communicationNature = "";               // 'structured', 'unstructured'
        var index = currentSession - 1;
        
        if(isProperGames) {
            if(index < this.properGames) {
                communicationDescription = parameterValues[index][2];
                communicationNature = parameterValues[index][3];
            }   
        }
        else {
            if(index < this.practiceGames) {
                communicationDescription = practiceParameterValues[index][2];
                communicationNature = practiceParameterValues[index][3];
            }
        }
        
        console.log("communicationDescription: " + communicationDescription);
        console.log("communicationNature: " + communicationNature);
        
        if(communicationDescription == "none") {
            this.communication = false;
        } else if((communicationDescription == "global") || (communicationDescription == "local") ||
                (communicationDescription == "minmajGL") || (communicationDescription == "minmajGN")) {
            this.communication = true;
            
            if(communicationDescription == "global") {
                this.globalCommunication = true;
            } else {
                this.globalCommunication = false;
            }
        }
            
        if(this.communication) {
            if(communicationNature == "unstructured")
                this.structuredCommunication = false;    
            else if (communicationNature == "structured")
                this.structuredCommunication = true;
        }
        
        /* Log entry. */ Logger.recordSessionCommunicationParameters(this.communication, this.globalCommunication, this.structuredCommunication);
    },

    setIndividualCommunicationParameters: function() {
        for (var i = 0; i < Participants.participants.length; i++) {
            var id = Participants.participants[i];
            this.individualCommunicationParameters[id] = {};
            this.individualCommunicationParameters[id].communication = this.communication;
            this.individualCommunicationParameters[id].globalCommunication = this.globalCommunication;
            this.individualCommunicationParameters[id].structuredCommunication = this.structuredCommunication;
            this.individualCommunicationParameters[id].costBasedCommunication = this.costBasedCommunication;
            this.individualCommunicationParameters[id].communicationCostLevel = this.communicationCostLevel;
            this.individualCommunicationParameters[id].communicationLengthBound = this.communicationLengthBound;
            this.individualCommunicationParameters[id].messageLengthBound = this.messageLengthBound;

            ParametersInfo.upsert({userId: id}, {$set: {
                communication: this.communication,
                globalCommunication: this.globalCommunication,
                structuredCommunication: this.structuredCommunication,
                costBasedCommunication: this.costBasedCommunication,
                messageLengthBound: this.messageLengthBound,
            }});
        }
        assignUniformCommunicationScopes();

        /* Log entry. */ Logger.recordIndividualCommunicationScopes(this.communicationScopes);
    },

    setSessionIncentivesConflictParameters: function(isProperGames, currentSession) {
        var index = currentSession - 1;

        // Get the level of conflicting incentives
        if(isProperGames) {
            if(index < properGames) 
                this.incentivesConflictLevel = parameterValues[index][1];
        } else {
            if(index < practiceGames) 
                this.incentivesConflictLevel = practiceParameterValues[index][1];
        }

        // Get the size of the minority
        if (isProperGames) {
            if (index < properGames)
                this.minoritySize = parseInt(parameterValues[index][4]);
        } else {
            if (index < practiceGames)
                this.minoritySize = parseInt(practiceParameterValues[index][4]);
        }

        // Not needed for this experiment, but included to avoid any dependency errors.
        //randomizeHomophilicPreferences();

        // TODO
        /* Log entry. */ Logger.recordSessionIncentivesConflictParameters(this.incentivesConflictLevel, this.homophilicPreferences);
    },

    setBatchParameters: function(isProperGames, batchIndex) {
        if (!isProperGames && practiceBatchConfigurations.length > batchIndex) {
            Session.batchSize = parseInt(practiceBatchConfigs[batchIndex][0]);
            Session.batchMode = practiceBatchConfigs[batchIndex][1];
        } else if (isProperGames && batchConfigs.length > batchIndex) {
            Session.batchSize = parseIng(batchConfigs[batchIndex][0]);
            Session.batchMode = batchConfigs[batchIndex][1];
        }

        Session.SessionInfo.upsert({id: 'global'}, {$set: {
            batchSize: Session.batchSize
        }});
    },

    setAdversarialParameters: function(isProperGames, batchIndex) {
        // Read the number of adversaries and the type of role assignment
        if (!isProperGames && practiceBatchConfigs.length > batchIndex) {
            Session.adversaryAssignment = practiceBatchConfigs[batchIndex][2];
            Session.numberOfAdversaries = parseInt(practiceBatchConfigs[batchIndex][3]);
            Payouts.regularPayoutAssignment = practiceBatchConfigs[batchIndex][4];
            Payouts.adversaryPayoutAssignment = practiceBatchConfigs[batchIndex][5];
        } else if (isProperGames && batchConfigs.length > batchIndex) {
            Session.adversaryAssignment = batchConfigs[batchIndex][2];
            Session.numberOfAdversaries = parseInt(batchConfigs[batchIndex][3]);
            Payouts.regularPayoutAssignment = batchConfigs[batchIndex][4];
            Payouts.adversaryPayoutAssignment = batchConfigs[batchIndex][5];
        }

        Session.SessionInfo.upsert({id: 'global'}, {$set: {
            numberOfAdversaries: Session.numberOfAdversaries
        }});
    },

    getPayoutMultiplier: function() {
        return this.incentivesPayoutMultipliers[this.incentivesConflictLevel];
    }

}

var adjacencyMatrices = [];
var parameterValues = [];
var batchConfigs = [];
var practiceAdjacencyMatrices = [];
var practiceParameterValues = [];
var practiceBatchConfigs = [];

var assignUniformCommunicationScopes = function() {
    var uniform_communication_scope = '';
    if (Parameters.communication) {
        if (Parameters.globalCommunication)
            uniform_communication_scope = 'global';
        else
            uniform_communication_scope = 'local';
    } else {
        uniform_communication_scope = 'none';
    }
    
    var n = Participants.participants.length;
    Parameters.communicationScopes = {};
    
    for (var i = 0; i < n; i++) {
        var id = Participants.participants[i];
        
        Parameters.communicationScopes[id] = uniform_communication_scope;
    }
}

var readAdjMatrix = function(fileName) {
    var text = Assets.getText(fileName);
    
    var mats = text.split('#\n');
    mats = mats.slice(0, mats.length-1);
    
    var adjMatArr = [];
    for (var j=0; j<mats.length; j++) {
        var mat = mats[j].split('\n');
        mat = mat.slice(0, mat.length-1);

        var matArr = [];
        for (var i=0; i<mat.length; i++) {
            var line = mat[i].split(' ');
            for ( var k=0; k<line.length; k++) {
                if ( line[k] === 'True' ) {
                    line[k] = true;
                } else {
                    line[k] = false;
                }
            }
            matArr.push(line);
        }
        adjMatArr.push(matArr);
    }
    return adjMatArr;
}

var readNetConfig = function(fileName) {
    var text = Assets.getText(fileName);
    
    var tmp = text.split('\n');
    tmp = tmp.slice(0, tmp.length-1);

    var netConfig = [];
    for ( var i=0; i<tmp.length; i++ ) {
        var config = tmp[i].split(' ');
        netConfig.push(config);
    }
    return netConfig;
}

var readBatchConfig = function(fileName) {
    var batchConfig = [];
    
    // First check if file exists. If it doesn't, work with default batch configuration values 
    // (For now that means batches of size 1, with no adversaries)
    try {
        var text = Assets.getText(fileName);
        var tmp = text.split('\n');
        tmp = tmp.slice(0, tmp.length-1);
        
        for ( var i=0; i<tmp.length; i++ ) {
          var config = tmp[i].split(' ');
          batchConfig.push(config);
        }
    } catch(err) {
        console.log("Warning: No batch configuration file found. Default batch parameter values will be used.")
    }
    
    return batchConfig;
}