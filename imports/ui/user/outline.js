import { Template } from 'meteor/templating';

Template.outline.events({
    'click .goToDescription': function() {
        var userId = Meteor.userId();
        Meteor.users.update({_id: userId}, {$set: {'location': '/description1'}});
       
        Router.go('/description1');
    }
});
