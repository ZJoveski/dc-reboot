import { Participants } from './participants.js';
import { Logger } from './logging.js';

export var ColorMagic = {
    colors: ['red', 'green'],
    color_number: {},
    colorAnonymization: true,
    colorPermutations: [],
    reverseColorPermutations: [],
    node_permutation: {},

    initializeColorAnonymization: function() {
        generateColorPermutations();
        generateReverseColorPermutationsForNodes();
        if (this.colorAnonymization) {
            assignRandomColorPermutations();
        } else {
            // Equivalent to no anonymization of colors.
            assignIdentityColorPermutation();
        }

        for(var i = 0; i < this.colors.length; i++) { 
            this.color_number[this.colors[i]] = i; 
        }

        /* Log entry. */ Logger.recordAnonymizationInfo();
    },

    anonymizeColor: function(name, color) {
        var node = Participants.name_node[name];
        var permutationIndex = this.node_permutation[node];
        var permutation = this.colorPermutations[permutationIndex];
        var colorNumber = this.color_number[color];
        
        var anonymizedColor = this.colors[permutation[colorNumber]];
        
        return anonymizedColor;
    },

    deanonymizeColor: function(name, color) {
        var node = Participants.name_node[name];
        var reversePermutationIndex = this.node_permutation[node];
        var reversePermutation = this.reverseColorPermutations[reversePermutationIndex];
        
        var deanonymizedColor = this.colors[reversePermutation[color]];
        
        return deanonymizedColor;
    },

    dummyDeanonymizeMessageColorNames: function(message) {
        var processedMessage = message;
        
        // Intermediate transformation to avoid situations where all instances of one color name, say "red", get "deanonymized" to "green", 
        // but then, all these new instances of "green" get "anonymized" back to "red".
        for(var i = 0; i < this.colors.length; i++) {
            processedMessage = processedMessage.replace(new RegExp("\\b" + this.colors[i] + "\\b", "gi"), 
                                                       (this.colors[i]).toUpperCase() + "CERVANDYZ");
        }
        
        return processedMessage;
    },

    anonymizeMessageColorNames: function(name, message) {
        var processedMessage = message;
        
        for(var i = 0; i < this.colors.length; i++) {
            // Also removes the temporary color code suffixes.
            processedMessage = processedMessage.replace(new RegExp((this.colors[i]).toUpperCase() + "CERVANDYZ", "g"), 
                                                       (anonymizeColor(name, this.colors[i])).toUpperCase());
        }
        
        return processedMessage;
    },

    deanonymizeMessageColorNames: function(name, message) {
        var processedMessage = message;
        var n = this.colors.length;
        
        // First transform color codes like "\r" to intermediate (deanonymized) color codes like "GREENCERVANDYZ".
        for(var i = 0; i < n; i++) {
            processedMessage = processedMessage.replace(new RegExp("(\\\\|\\\/)" + this.colors[i][0], "gi"), 
                                                       (this.deanonymizeColor(name, this.colors[i])).toUpperCase() + "CERVANDYZ");
        }
        
        // Intermediate transformation to avoid situations where all instances of one color name, say "red", get "deanonymized" to "green", 
        // but then, all these new instances of "green" get "anonymized" back to "red".
        for(var i=0; i<n; i++) {
            processedMessage = processedMessage.replace(new RegExp("\\b" + this.colors[i] + "\\b", "gi"), 
                                                       (this.deanonymizeColor(name, this.colors[i])).toUpperCase() + "CERVANDYZ");
        }
        
        return processedMessage;
    },

    // Needed to restore messages visible to the admin user to their proper form.
    clearTemporaryColorCodeSuffixes: function(message) {
        return message.replace(new RegExp("CERVANDYZ", "g"), "");
    },
}

// Internally, the colors are treated as integers from 0 to ColorMagic.colors.length
var generateColorPermutations = function() {
    var permutations = [];

    // TODO: simplify later
    function permuteColors(inputArray, inMemory) {
        var currentCharacter, inMemory = inMemory || [];
        
        for(var i = 0; i < inputArray.length; i++) {
            currentCharacter = inputArray.splice(i,1);
            if(inputArray.length == 0) {
                permutations.push(inMemory.concat(currentCharacter));
            }
            permuteColors(inputArray.slice(), inMemory.concat(currentCharacter));
            inputArray.splice(i,0,currentCharacter[0]);
        }

        return permutations;
    }

    ColorMagic.colorPermutations = permuteColors(range(ColorMagic.colors.length)).slice();
}

var generateReverseColorPermutationsForNodes = function() {
    var n = ColorMagic.colorPermutations.length;
    ColorMagic.reverseColorPermutations = new Array(n);
    
    for(var i = 0; i < n; i++) {
        var reversePermutation = {};
        for(var j = 0; j < n; j++) {
            reversePermutation[ColorMagic.colors[ColorMagic.colorPermutations[i][j]]] = j;
        }
        ColorMagic.reverseColorPermutations[i] = reversePermutation;
    }
}

var assignRandomColorPermutations = function() {
    var n;
    for(var i = 0; i < Participants.participants.length; i++) {
        n = Math.floor(Math.random() * ColorMagic.colorPermutations.length); 
        ColorMagic.node_permutation[i] = n;
    }
}

var assignIdentityColorPermutation = function() {   
    for(var i = 0; i < Participants.participants.length; i++) {
        ColorMagic.node_permutation[i] = 0;
    }
}

// Generate an array of "count" consecutive integers starting with "start". 
var range = function(start, count) {
    if(arguments.length == 1) {
        count = start;
        start = 0;
    }

    var foo = [];
    for (var i = 0; i < count; i++) {
        foo.push(start + i);
    }
    return foo;
}