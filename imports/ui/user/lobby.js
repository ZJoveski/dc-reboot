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
       return LobbyStatus.find({'ready': true}).count();
    },
    'plural': function() {
       var count = LobbyStatus.find({'ready': true}).count();
       return (count !== 1);
    }
});
