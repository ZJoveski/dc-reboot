import { Template } from 'meteor/templating';

Template.login_Buttons.events({
    'submit #login-form': function(e, t) {

        e.preventDefault();

        var trimInput = function(val) {
            return val.replace(/^\s*|\s*$/g, "");
        }

        var username = trimInput(t.find('#login-username').value);
        var password = trimInput(t.find('#login-password').value);

        Meteor.loginWithPassword(username, password, function(err){
            if(err) {
                throw "Login Failed";
            }
        });
        return false;
    }
});
