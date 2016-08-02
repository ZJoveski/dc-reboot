import { Meteor } from 'meteor/meteor';

import { NeighborhoodsCollection } from '../../imports/api/collections/game_collections.js';
import { PayoutInfo } from '../../imports/api/collections/game_collections.js';
import { Messages } from '../../imports/api/collections/game_collections.js';

import { Participants } from '../../imports/api/participants.js';
import { Parameters } from '../../imports/api/parameters.js';

// This piece of code makes available only the neighborhood document from the neighborhoods 
// collection that corresponds to the current user (client) (made possible by using 
// userId: this.userId as our search criterion.)
Meteor.publish('neighborhoodsSubscription', function () {
    return NeighborhoodsCollection.find({
        userId: this.userId
    });
});

Meteor.publish("allUsers", function () {
    if(this.userId) {    
        var adminId = Meteor.users.findOne({username: "admin"})._id;
                          
        if(this.userId === adminId)
            return Meteor.users.find({});
        
        return Meteor.users.find({_id: this.userId});
    } else {
        this.ready();
    }
});

Meteor.publish('payoutInfoSubscription', function () {
    return PayoutInfo.find({ id: this.userId });
});

// Only the admin user will be subscribed to this publication.
Meteor.publish('adminPayoutInfoSubscription', function() {
    if(this.userId) {    
        var adminId = Meteor.users.findOne({username: "admin"})._id;
                          
        if(this.userId === adminId)
            return PayoutInfo.find({});
    }
    
    return [];
});

Meteor.publish('messagesSubscription', function(clientName) {
    var id = this.userId;
    if((Participants.id_name[id] !== undefined) && (clientName == Participants.id_name[id])) {
        if(Parameters.communication) {
                return Messages.find({idOfRecipient: id}, {fields: {nameOfSender: 1, message: 1}});
        }
    }
});

// Only the TurkServer admin user will be subscribed to this publication.
Meteor.publish('adminMessagesSubscription', function() {
    if(this.userId) {    
        var adminId = Meteor.users.findOne({username: "admin"})._id;
                          
        if(this.userId === adminId)
            return Messages.find({nameOfRecipient: "admin"}, {fields: {nameOfSender: 1, message: 1}});
    }
    
    return [];
});

