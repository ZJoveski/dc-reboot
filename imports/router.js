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
            Router.go(Meteor.users.findOne(currentUser).location);
            this.next();
        } else {
            this.render("login");
        }
    },
});

