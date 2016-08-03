import { Meteor } from 'meteor/meteor';

import { Comments } from '../collections/external_collections.js';
import { LobbyStatus } from '../collections/external_collections.js';

import { Time } from '../time.js';
import { Parameters } from '../parameters.js';

Meteor.methods({
    startExperiment: function() {
        if(Time.experimentStarted) return;
        
        var adminId = Meteor.users.findOne({username: "admin"})._id;
        if(Meteor.userId() === adminId) {
            // Update the location of users to '/experiment'
            Meteor.users.update(
                {"status.online": true, username: {$ne: "admin"}, location: '/lobby'}, 
                {$set: {'location': '/experiment'}}, 
                {multi: true}
            );
            
            // Update the lobby status of users 
            LobbyStatus.update(
                { ready: true },
                { $set: { ready: false } },
                { multi: true }
            );
            
            // Move them to the corresponding routes
            /* Taken care of by the 'Router.go(Meteor.users.findOne(currentUser).location);' blocks in the
               onBeforeAction() methods of each of the routes. */
            
            // Start the experiment, while giving some time to allow clients to reach the '/experiment' route 
            Meteor.setTimeout(function() {
                startExperiment();
            }, 2000);
        } else {
            Meteor.call('ERROR', "ERROR: (startExperiment) Not admin user");
        }
    },

    updateLocation: function(location) {
        var id = Meteor.userId();
        Meteor.users.update({_id: userId}, {$set: {'location': location}});
    }

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

    //methods to submit HIT?
});

var startExperiment = function() {
    // First read the pre-generated network and parameters data
    Parameters.readTreatments();
    
    Time.experimentStarted = true;
    
    startPilotPractice();
}

var startPilotPractice = function() {
    var proper = false;
    startGames(proper, pilotPracticeGames, practiceBatches);
}

