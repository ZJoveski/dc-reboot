import {Admin} from '../../api/users.js'
import { Template } from 'meteor/templating';


Template.adminScreen.helpers({
    
    'isAdmin': function() {
       return Admin.isAdmin();
    },
    
    'numLoggedIn': function() {
        return Meteor.users.find({"status.online": true, username: {$ne: "admin"}}).count();
    },
    
    'numInLobby': function() {
        return Meteor.users.find({"status.online": true, username: {$ne: "admin"}, location: '/lobby'}).count();
    },
    
    'pluralLoggedIn': function() {
        return (Meteor.users.find({"status.online": true, username: {$ne: "admin"}}).count() !== 1);
    },
    
    'pluralInLobby': function() {
        return (Meteor.users.find({"status.online": true, username: {$ne: "admin"}, location: '/lobby'}).count() !== 1);
    }
});

// Template.adminScreen.events({
//     'click .startExperiment': function() {
//         // Update the location of users to '/experiment', move them to the corresponding routes, and start the experiment
//         Meteor.call('startExperiment');
//     },

//     'click .getPaymentCSV': function() {
//         Meteor.call('getPaymentCSV', function(err, data) {
//             if(err){
//                 console.log(err);
//             } else {
//                 var csvToWrite = data;

//                 //  create a new Blob (html5 magic) that conatins the data from your form feild
//                 var csvFileAsBlob = new Blob([csvToWrite], {type:'text/plain'});
//                 // Specify the name of the file to be saved
//                 var fileNameToSaveAs = "PaymentInfo.csv";
        
//                 // Optionally allow the user to choose a file name by providing 
//                 // an imput field in the HTML and using the collected data here
//                 // var fileNameToSaveAs = txtFileName.text;

//                 // create a link for our script to 'click'
//                 var downloadLink = document.createElement("a");
//                 //  supply the name of the file (from the var above).
//                 // you could create the name here but using a var
//                 // allows more flexability later.
//                 downloadLink.download = fileNameToSaveAs;
//                 // provide text for the link. This will be hidden so you
//                 // can actually use anything you want.
//                 downloadLink.innerHTML = "My Hidden Link";
        
//                 // allow our code to work in webkit & Gecko based browsers
//                 // without the need for a if / else block.
//                 window.URL = window.URL || window.webkitURL;
              
//                 // Create the link Object.
//                 downloadLink.href = window.URL.createObjectURL(csvFileAsBlob);
//                 // when link is clicked call a function to remove it from
//                 // the DOM in case user wants to save a second file.
//                 // downloadLink.onclick = destroyClickedElement;
//                 // make sure the link is hidden.
//                 downloadLink.style.display = "none";
//                 // add the link to the DOM
//                 document.body.appendChild(downloadLink);
        
//                 // click the new link
//                 downloadLink.click();
//             }
//         });
//     },

//     'click .putAllUserHome': function() {
//         Meteor.call('putAllUserHome');
//     },

//     'click #saveLogs': function() {
//         saveTextAsFile();
//     }
// });