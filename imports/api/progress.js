import { Time } from './time.js';
import { Logger } from './logging.js';
import { ProgressInfo } from './collections/game_collections.js';

export var Progress = {
    ProgressInfo: ProgressInfo,

    experimentInProgress: false,
    sessionInProgress: false,       // alias for sessionRunning
    preSessionInProgress: false,
    postSessionInProgress: false,

    clearProgress: function() {
        ProgressInfo.remove({});
    },

    intializeProgress: function() {
        this.clearProgress();
        ProgressInfo.insert({
            experimentInProgress: this.experimentInProgress,
            sessionInProgress: this.sessionInProgress,
            preSessionInProgress: this.preSessionInProgress,
            postSessionInProgress: this.postSessionInProgress
        });
    },

    setProgress: function(type, progress) {
        if (type == 'experiment') {
            this.experimentInProgress = progress;
            ProgressInfo.update({}, { $set: {
                experimentInProgress: progress
            }});
            if (progress) {
                /* Log entry. */ Logger.recordExperimentStart();
            } else {
                /* Log entry. */ Logger.recordExperimentCompletion();
            }
        } else if (type == 'session') {
            this.sessionInProgress = progress;
            ProgressInfo.update({}, { $set: {
                sessionInProgress: progress
            }});
            if (progress) {
                /* L */ Time.updateTimeInfo('session start');
            } else {
                /* L */ Time.updateTimeInfo('session end');
            }
        } else if (type == 'preSession') {
            this.preSessionInProgress = progress;
            ProgressInfo.update({}, { $set: {
                preSessionInProgress: progress
            }});
        } else if (type == 'postSession') {
            this.postSessionInProgress = progress;
            ProgressInfo.update({}, { $set: {
                postSessionInProgress: progress
            }});
        }
    }
}