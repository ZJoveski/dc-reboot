import { Participants } from './participants.js';

export default var ColorMagic = {
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

        // TODO
        /* Log entry. */ recordAnonymizationInfo();
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
    }
}

// Internally, the colors are treated as integers from 0 to theColors.length
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
    }

    permuteColors(range(theColors.length)).slice();
    
    ColorMagic.colorPermutations = permutations;
}

var generateReverseColorPermutationsForNodes = function() {
    var n = ColorMagic.colorPermutations.length;
    ColorMagic.reverseColorPermutations = new Array(n);
    
    for(var i = 0; i < n; i++) {
        var reversePermutation = {};
        for(var j = 0; j < n; j++) {
            reversePermutation[theColors[colorPermutations[i][j]]] = j;
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