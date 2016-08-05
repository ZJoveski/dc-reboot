import { Template } from 'meteor/templating';

import { LobbyStatus } from '../../api/collections/external_collections.js';

import './lobby.html';

Template.lobby.helpers({
    'notReady': function() {
        var obj = LobbyStatus.findOne({userId: Meteor.userId()});
        return obj && !obj.ready;
    },
    'numPlayers': function() {
        return 25;
    },
    'numWaiting': function() {
        var count = LobbyStatus.findOne({userId: 'global'}).usersReady;
        return count;
    },
    'plural': function() {
        var count = LobbyStatus.findOne({userId: 'global'}).usersReady;
        return (count !== 1);
    }
});
