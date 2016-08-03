import { Meteor } from 'meteor/meteor';

export const Admin = {
    isAdmin: function() {
        var adminUser = Meteor.users.findOne({username: "admin"});
    
        if(adminUser) return true;
        else return false;
    }
};