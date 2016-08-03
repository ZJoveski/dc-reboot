import { Template } from 'meteor/templating';

import './outline.html';

Template.outline.events({
    'click .goToDescription': function() {
        Meteor.call('updateLocation', '/description1');
       
        Router.go('/description1');
    }
});
