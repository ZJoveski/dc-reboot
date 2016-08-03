import { Meteor } from 'meteor/meteor';

import { PilotExperiment } from '../../imports/api/collections/external_collections';
import { LobbyStatus } from '../../imports/api/collections/external_collections';
import { Comments } from '../../imports/api/collections/external_collections';
import { SubmissionCode } from '../../imports/api/collections/external_collections';

Meteor.publishComposite('pilotExperiment', {
    find: function() { 
        return PilotExperiment.find({
            userId: this.userId
        }); 
    }
});

Meteor.publishComposite('lobbyStatus', {
    find: function() { 
        return LobbyStatus.find({}); 
    }
});

Meteor.publishComposite('comments', {
    find: function() { 
        var adminId = Meteor.users.findOne({username: "admin"})._id;
        if(this.userId === adminId) {
            return Comments.find({});
        }
        
        return Comments.find({
            userId: this.userId
        });
    }
});

Meteor.publishComposite('userData', {
    find: function() {
        return Meteor.users.find(this.userId);
    }
});

Meteor.publishComposite("allUsers", {
    find: function () {
        if(this.userId) {    
            var adminId = Meteor.users.findOne({username: "admin"})._id;
                              
            if(this.userId === adminId)
                return Meteor.users.find({});
            
            return Meteor.users.find({_id: this.userId});
        } else {
            this.ready();
        }
    }
});

Meteor.publishComposite('submissionCode', {
    find: function() {
        var adminId = Meteor.users.findOne({username: "admin"})._id;
        if(this.userId === adminId) {
            return SubmissionCode.find({});
        }
        
        return SubmissionCode.find(this.userId);
    }
});