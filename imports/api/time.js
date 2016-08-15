import { Logger } from './logging.js';
import { TimeInfo } from './collections/game_collections.js';
import { Session } from './session.js';

export var Time = {
    TimeInfo: TimeInfo,

    experimentStarted: false,
    experimentStartTime: -1,
    currentSessionStartTime: -1,
    lastSessionEndTime: -1,
    currentTime: -1,
    sessionLength: 60,
    preSessionLength: 5,
    postSessionLength: 5,
    timeUpdateRate: 1000,

    waitForTurnTime: 10,    // Specifies the number of milliseconds after which a suspended update-color request will reattempt processing.

    updateTimeInfo: function(context) {
        var time = new Date().getTime();
        if (context == 'start experiment') {
            this.experimentStarted = true;
            this.experimentStartTime = time;
            this.lastSessionEndTime = time;
            this.currentTime = time;

            TimeInfo.upsert({}, {$set: {
                experimentStarted: this.experimentStarted,
                experimentStartTime: this.experimentStartTime,
                lastSessionEndTime: this.lastSessionEndTime,
                currentTime: this.currentTime,
            }});
        } else if (context == 'session end') {
            this.currentTime = time;
            this.lastSessionEndTime = time;

            TimeInfo.upsert({}, {$set: {
                lastSessionEndTime: this.lastSessionEndTime,
                currentTime: this.currentTime
            }});
            /* Log entry. */ Logger.recordSessionCompletion(Session.sessionNumber);
        } else if (context == 'session start') {
            this.currentTime = time;
            this.currentSessionStartTime = time;

            TimeInfo.upsert({}, {$set: {
                currentSessionStartTime: this.currentSessionStartTime,
                currentTime: this.currentTime
            }});
            /* Log entry. */ Logger.recordSessionStart(Session.sessionNumber);
        } else if (context == 'current time') {
            TimeInfo.update({}, {$set: {
                currentTime: this.currentTime
            }});
            this.currentTime = time;
        }
    },
}