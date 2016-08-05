import { Meteor } from 'meteor/meteor';

import { Time } from '../time.js';
import { Parameters } from '../parameters.js';
import { startGames } from '../experiment_control.js';

import { ExperimentLog } from '../collections/game_collections.js';
import { PayoutInfo } from '../collections/game_collections.js';
import { LobbyStatus } from '../collections/external_collections.js';

Meteor.methods({
    clearExperimentLog: function() {
        var adminId = Meteor.users.findOne({username: "admin"})._id;
        if(Meteor.userId() === adminId) {
            ExperimentLog.remove({});
        }
    },

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

    // TODO: actually sort the output
    getExperimentLog: function() {
        var adminId = Meteor.users.findOne({username: "admin"})._id;
        if(Meteor.userId() === adminId) {
            var textToWrite = "";
       
            ExperimentLog.find({}).forEach( function(record) {
                textToWrite += "###\n";
                  
                textToWrite += record.timestamp + "\n";
                textToWrite += record.type + "\n";
                if(record.entry !== "") {
                    textToWrite += record.entry + "\n";  
                }
                  
                textToWrite += "###\n";
            });
          
            // Remove the last "\n" character, if any.
            if(textToWrite[textToWrite.length-1] == "\n") {
                textToWrite = textToWrite.slice(0, textToWrite.length-1);
            }
          
            return textToWrite;
        }
    },

    getPaymentCSV: function() {
        var csvPaymentInfoArr = [];
        PayoutInfo.find().forEach(function(record){
            var workerId = Meteor.users.findOne(record.id).username;
            var bonus = record.totalPayout;
            // var submitCode = submissionCode.findOne({worker: workerId}).submissionCode;
            // csvPaymentInfoArr.push([workerId, submitCode, bonus]);
            csvPaymentInfoArr.push([workerId, bonus]);
        })

        csvPaymentFile = 'WorkerId, submissionCode, bonus\n' + csvPaymentInfoArr.join("\n");
        return csvPaymentFile;
    },

    putAllUserHome: function() {
        Meteor.users.find({}).forEach( function(record)  {
            if(record.username != "admin") {
                Meteor.users.update({_id: record._id}, {$set: {location: "/"}});
                LobbyStatus.update({userId: record._id}, {$set: {
                    ready: false
                }});
            }
        });
    },
});

var startExperiment = function() {
    // First read the pre-generated network and parameters data
    Parameters.readTreatments();
    
    startPilotPractice();
}

var startPilotPractice = function() {
    var proper = false;
    startGames(proper, Parameters.practiceGames, Parameters.practiceBatches);
}