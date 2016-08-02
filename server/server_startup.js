
import { Meteor } from 'meteor/meteor';
//import { Accounts } from 'meteor/accounts-base';
// remember meteor add mizzao:user-status

import { Participants } from '../imports/api/participants.js';
import { Time } from '../imports/api/time.js';
import { Parameters } from '../imports/api/parameters.js';
import { Logger } from '../imports/api/logging.js';

import { LobbyStatus } from '../imports/api/collections/external_collections.js';

import '../imports/router.js';
import '../imports/api/meteormethods/main.js';
import '../imports/api/meteormethods/navigation.js';

Meteor.startup(function () {
    UserStatus.events.on("connectionLogin", function(fields) {
        var returning = Participants.onTime.hasOwnProperty(fields.userId);
        
        if (!returning) {   // If this is the first time the user logs in
            Participants.onTime[fields.userId] = !Time.experimentStarted;
            Participants.missedTooManyGames[fields.userId] = false;
        }

        var lobbyStatus = LobbyStatus.findOne({userId: fields.userId});
        if(lobbyStatus) {
            LobbyStatus.update({userId: fields.userId}, {$set: {online: true}});
        } else {
            // Change code here if proper lobby screen in test mode is needed
            LobbyStatus.upsert({userId: fields.userId}, {userId: fields.userId, online: true, ready: false, submitted: false});   
        }
        
        return Logger.recordUserLoggingIn(fields.userId, fields.connectionId, fields.ipAddr, fields.userAgent, fields.loginTime);
    });
    
    UserStatus.events.on("connectionLogout", function(fields) {
        var lobbyStatus = LobbyStatus.findOne({userId: fields.userId});
        if(lobbyStatus) {
            LobbyStatus.update({userId: fields.userId}, {$set: {online: false}});
        } 
        
        return Logger.recordUserLoggingOut(fields.userId, fields.connectionId, fields.lastActivity, fields.logoutTime);
    });

    // ============Accounts Startup==============

    Meteor.users.allow({
        update: function(userId, doc, fields, modifier) {
            if(userId && doc._id === userId)
                return true;
        }
    });
 
    // For testing purposes
    //// Mini test
    /*
    var users = ["1", "2", "3"];
    var password = "p";
    */
    
    //// Medium-scale test
    
    // var users = ['1','2','3','4','5','6','7'];
    // var password = "p";
    
    
    //// Full-scale test
    
    var users = ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25', '26', '27', '28', '29', '30'];
    var password = "p";
    
    
    // Full experiment [07.07.2016]
    
    //var users = ["A100Y89FZO4J0B", "A1P6OXEJ86HQRM", "A22T69YW4WUANF", "A273EH17NSJRH0", "A1E5EGG6LH0LQ2", "AYDILOZLKOAS8", "ADP7UNGJZKRSK", "A3N1W4VYI7VXEV", "A15FXHC1CVNW31", "A1TH0PTGDSBWMO", "A3FOKP72T5I4FR", "A19WXS1CLVLEEX", "A1J8TVICSRC70W", "A3RHGIM99R25Q9", "A27W025UEXS1G0", "AKLV0WIZZ356X", "ABMX8XUNPR3LP", "A94DL4GI8ZBUO", "A3NM3GAVMJEI3J", "AC5UD8N187QD6", "A1MYLQQL8BBOYT", "A3N0QZ9ZKUCTCQ", "A7KLTVEIASF4J", "A2O7H7VXLFN6BP", "A3JI3B5GTVA95F", "A1945USNZHTROX"];
    
    //var password = "dc0707experiment";
    
    
    addUserAccounts(users, password);
});

var addUserAccounts = function(arrOfUsers, password) {
    function checkType(variable, type, message) {
        if(typeof(variable) !== type) {
            throw message;
        }
    };

    Accounts.onCreateUser(function(options, user) {
        if (Parameters.testMode) {
            user.location = "/lobby";
        } else {
            user.location = "/";
        }
        return user;
    });

    for(var idx in arrOfUsers) {
        var user = arrOfUsers[idx];
        // var assigId = arrOfAssignmentId[idx];
        if( Meteor.users.find({username: user}).count() === 0 ) {
            checkType(user, "string", "ERROR: (Adding User) User should be a string");
            // Meteor.users.insert({username: user, password: user, assignmentId: assigId});
            Accounts.createUser({
                username: user,
                password: password
            })
        } else {
            // Meteor.users.update({username: user}, {fields: {password: 1}});
            console.log("User " + user + " has already been added");
        }
    }

    var hasAdminUser = Meteor.users.find({username: "admin"}).count() === 1;
    if (!hasAdminUser) {
        Accounts.createUser({
            username: "admin",
            password: "admin",
        });
        // admin user will be directed to adminScreen
        Meteor.users.update({username: "admin"}, {$set: {'location': '/adminScreen'}});
    }
}