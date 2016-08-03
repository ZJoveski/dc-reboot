import { Meteor } from 'meteor/meteor';

Router.configure({
    loadingTemplate: 'loadingWheel'
});

Router.route('/', {
    name: 'home',
    template: 'outline',
    onBeforeAction: function() {
        var currentUser = Meteor.userId();
        if(currentUser) {
            console.log(currentUser);
            console.log(Meteor.users.findOne(currentUser).location);
            Router.go(Meteor.users.findOne(currentUser).location);
            this.next();
        } else {
            this.render("login");
        }

        // var currentUser = Meteor.userId();
        // if (currentUser) {
        //     var router = this;
        //     Meteor.call('getUserLocation', function(error, result) {
        //         console.log('result: ' + result);
        //         Router.go(result);
        //         router.next();
        //     })
        // } else {
        //     this.render("login");
        // }
    },
    waitOn: function() {
        var currentUser = Meteor.userId();
        if (currentUser) {
            return Meteor.subscribe('userData');
        }
    },
});

