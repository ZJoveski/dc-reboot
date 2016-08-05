import { Template } from 'meteor/templating';

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

var capitalize = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}