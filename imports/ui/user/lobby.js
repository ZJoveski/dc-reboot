Template.lobby.helpers({
    'notReady': function() {
       var obj = LobbyStatus.findOne({userId: Meteor.userId()});

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
