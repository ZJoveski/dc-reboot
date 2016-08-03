import { Logger } from './logging.js';
import { TimeInfo } from './collections/game_collections.js';

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
            this.experimentStartTime = time;
            this.lastSessionEndTime = time;
            this.currentTime = time;
        } else if (context == 'session end') {
            this.currentTime = time;
            this.lastSessionEndTime = time;

            /* Log entry. */ Logger.recordSessionCompletion(currentSession);
        } else if (context == 'session start') {
            this.currentTime = time;
            this.currentSessionStartTime = time;

            /* Log entry. */ Logger.recordSessionStart(currentSession);
        } else if (context == 'current time') {
            this.currentTime = time;
        }
    },
}