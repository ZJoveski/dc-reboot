import { Meteor } from 'meteor/meteor';

import { LobbyStatus } from '../../imports/api/collections/external_collections';
import { Comments } from '../../imports/api/collections/external_collections';
import { SubmissionCode } from '../../imports/api/collections/external_collections';

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

Meteor.publishComposite('submissionCode', {
    find: function() {
        var adminId = Meteor.users.findOne({username: "admin"})._id;
        if(this.userId === adminId) {
            return SubmissionCode.find({});
        }
        
        return SubmissionCode.find(this.userId);
    }
});