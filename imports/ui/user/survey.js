import { Template } from 'meteor/templating';

import { PilotExperiment } from '../../api/collections/external_collections.js';
import { LobbyStatus } from '../../api/collections/external_collections.js';
import { SubmissionCode } from '../../api/collections/external_collections.js';

Template.survey.helpers({
    onTime: function() {
        var pilotRecord = PilotExperiment.findOne({userId: Meteor.userId()});
        
        if(pilotRecord) {
            if(pilotRecord.onTime)
                return true;
        }
        
        return false;
    },
    
    tooManyMissedGames: function() {
        var pilotRecord = PilotExperiment.findOne({userId: Meteor.userId()});
        
        if(pilotRecord) {
            if(pilotRecord.missedTooManyGames)
                return true;
        }
        
        return false;
    },
    
    submitted: function() {
        var lobbyRecord = LobbyStatus.findOne( { userId: Meteor.userId() } );
        
        if(lobbyRecord) {
            if(lobbyRecord.submitted)
                return true;
        }
        
        return false;
    },
    
    getsubmissionCode: function() {
        function generateCode() {
            function code() {
                return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            }
            
            return code() + code() + code() + code() + code() + code();
        };

        function checkErr(err, message) {
            if (err) {
                throw message;
            }
        };

        function checkType(variable, type, message) {
            if(typeof(variable) !== type) {
                throw message;
            }
        };

        var workerId = Meteor.users.findOne(Meteor.userId()).username;
        checkType(workerId, "string", "ERROR: workerId should be a string");

        // check whether submission existed or not
        var codeExist = SubmissionCode.find({worker: workerId}).count() > 0;
        if(codeExist) {
            // var code = submissionCode.findOne({worker: workerId, assignment: assignmentId}).submissionCode;
            var code = SubmissionCode.findOne({worker: workerId}).submissionCode;
            checkType(code, "string", "ERROR: submission code should be a string");
            return code;
        } else {
            var code = generateCode();
            // Meteor.call('insertSubmissionCode', workerId, assignmentId, code);
            Meteor.call('insertSubmissionCode', workerId, code);
                
            return code;
        }
    }
});

Template.survey.events({
    "submit .survey": function(e, tmpl) {
        e.preventDefault();
        
        Meteor.call('submitComments', e.target.free.value);
    }
});
