import { Template } from 'meteor/templating';

import { LobbyStatus } from '../../api/collections/external_collections.js';

import './lobby.html';

Template.lobby.helpers({
    'notReady': function() {
       var obj = LobbyStatus.findOne({userId: Meteor.userId()});

       console.log(obj.ready);

       return obj && !obj.ready;
    },
    'numPlayers': function() {
       return 25;
    },
    'numWaiting': function() {
       return LobbyStatus.find({userId: 'global'}).usersReady;
    },
    'plural': function() {
       var count = LobbyStatus.find({userId: 'global'}).usersReady;
       return (count !== 1);
    }
});
