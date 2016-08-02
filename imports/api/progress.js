import { Time } from './time.js';
import { Logger } from './logging.js';

export default var Progress = {
    experimentInProgress: false,
    sessionInProgress: false,       // alias for sessionRunning
    preSessionInProgress: false,
    postSessionInProgress: false,

    setProgress: function(type, progress) {
        if (type == 'experiment') {
            this.experimentInProgress = progress;
            if (progress) {
                /* Log entry. */ Logger.recordExperimentStart();
            } else {
                /* Log entry. */ Logger.recordExperimentCompletion();
            }
        } else if (type == 'session') {
            this.sessionInProgress = progress;
            if (progress) {
                /* L */ Time.updateTimeInfo('session start');
            } else {
                /* L */ Time.updateTimeInfo('session end');
            }
        } else if (type == 'preSession') {
            this.preSessionInProgress = progress;
        } else if (type == 'postSession') {
            this.postSessionInProgress = progress;
        }
    }
}