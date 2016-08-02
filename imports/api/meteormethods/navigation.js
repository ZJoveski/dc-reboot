import { Meteor } from 'meteor/meteor';

Meteor.methods({
    getUserLocation: function() {
        var currentUser = Meteor.userId();
        console.log(Meteor.users.findOne(currentUser).location);
        return Meteor.users.findOne(currentUser).location;
    }
});