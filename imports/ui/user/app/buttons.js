import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import { ColorMagic } from '../../../api/colors_mapping.js';

import './buttons.html';

Template.button1.helpers({
    backgroundColor: function() {
        return ColorMagic.colors[0];
    },

    colorText: function() {
        return capitalize(ColorMagic.colors[0]);
    }
});

Template.button2.helpers({
    backgroundColor: function() {
        return ColorMagic.colors[1];
    },

    colorText: function() {
        return capitalize(ColorMagic.colors[1]);
    }
});

Template.button1.events({
    'click button': function() {
        
        // Trying to reduce the lag by avoiding the piling up of repeated color change requests on the server ...
        var lastRequestedColor = Session.get('lastRequestedColor');
        if (lastRequestedColor !== ColorMagic.colors[0]) {
            // Update the 'colors' collection
            Meteor.call('updateColor', ColorMagic.colors[0]);
            
            // Record the last requested color
            Session.set('lastRequestedColor', ColorMagic.colors[0]);
        }
    }                              
});

Template.button2.events({
    'click button': function() {
        
        // Trying to reduce the lag by avoiding the piling up of repeated color change requests on the server ...
        var lastRequestedColor = Session.get('lastRequestedColor');
        if (lastRequestedColor !== ColorMagic.colors[1]) {
            // Update the 'colors' collection
            Meteor.call('updateColor', ColorMagic.colors[1]);
            
            // Record the last requested color
            Session.set('lastRequestedColor', ColorMagic.colors[1]);
        }
    }                              
});

var capitalize = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}