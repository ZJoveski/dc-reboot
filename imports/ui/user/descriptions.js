import { Meteor } from 'meteor/meteor';

import './descriptions.html';

Template.description1.events({
    'click .nextPage': function() {
        Meteor.call('updateLocation', '/description2');
    
        Router.go('/description2');
    }
});

Template.description2.events({
    'click .nextPage': function() {
        Meteor.call('updateLocation', '/description3');
    
        Router.go('/description3');
    },

    'click .previousPage': function() {
        Meteor.call('updateLocation', '/description1');
    
        Router.go('/description1');
    }
});

Template.description3.events({
    'click .nextPage': function() {
        Meteor.call('updateLocation', '/description4');

        Router.go('/description4');
    },

    'click .previousPage': function() {
    Meteor.call('updateLocation', '/description2');
    
        Router.go('/description2');
    }
});

Template.description4.events({
    'click .nextPage': function() {
        Meteor.call('updateLocation', '/description5');
            
        Router.go('/description5');
    },

    'click .previousPage': function() {
        Meteor.call('updateLocation', '/description3');
    
        Router.go('/description3');
    }
});

Template.description5.events({
    'click .goToLobby': function() {
        Meteor.call('updateLocation', '/lobby');
        
        Meteor.call('setLobbyStatusReady', true);
    
        Router.go('/lobby');
    },

    'click .previousPage': function() {
        Meteor.call('updateLocation', '/description4');
    
        Router.go('/description4');
    }
});