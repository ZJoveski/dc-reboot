import { Meteor } from 'meteor/meteor';

import { LobbyStatus } from '../../imports/api/collections/external_collections';
import { Comments } from '../../imports/api/collections/external_collections';
import { SubmissionCode } from '../../imports/api/collections/external_collections';

Meteor.publish('lobbyStatus', function() { 
    return LobbyStatus.find({}); 
});

Meteor.publish('comments', function() { 
    var adminId = Meteor.users.findOne({username: "admin"})._id;
    if(this.userId === adminId) {
        return Comments.find({});
    }
    
    return Comments.find({
        userId: this.userId
    }); 
});

Meteor.publish('userData', function() {
    return Meteor.users.find(this.userId);
});

Meteor.publish('submissionCode', function() {
    var adminId = Meteor.users.findOne({username: "admin"})._id;
    if(this.userId === adminId) {
        return SubmissionCode.find({});
    }
    
    return SubmissionCode.find(this.userId);
});