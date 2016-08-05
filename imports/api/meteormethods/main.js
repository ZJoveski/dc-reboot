import { Meteor } from 'meteor/meteor';

import { Comments } from '../collections/external_collections.js';
import { LobbyStatus } from '../collections/external_collections.js';

Meteor.methods({
    updateLocation: function(location) {
        var id = Meteor.userId();
        Meteor.users.update({_id: id}, {$set: {'location': location}});
    },

    insertSubmissionCode: function(workerId, code) {
        SubmissionCode.insert({worker: workerId, submissionCode: code})
    },

    ERROR: function(msg) {
        throw msg;
    },

    submitComments: function(comments) {
        // Save nonempty comments
        if(comments !== "") {
            Comments.insert({
                userId: Meteor.userId(),
                comments: comments
            });
        }
        
        // Change the lobby status of the user to 'submitted': true
        LobbyStatus.update( 
            { userId: Meteor.userId() }, 
            { $set: { submitted: true } }
        );
    },

    setLobbyStatusReady: function(ready, userId) {
        if(userId) {
            LobbyStatus.update({userId: userId}, { $set: { ready: ready } });
        }
    },

    //methods to submit HIT?
});

