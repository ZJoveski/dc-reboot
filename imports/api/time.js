export default var Time = {
    experimentStartTime: -1,
    currentSessionStartTime: -1,
    lastSessionEndTime: -1,
    currentTime: -1,
    sessionLength: 60,
    preSessionLength: 5,
    postSessionLength: 5,
    timeUpdateRate: 1000,

    updateTimeInfo: function(context) {
        var time = new Date().getTime();
        if (context == 'start experiment') {
            this.experimentStartTime = time;
            this.lastSessionEndTime = time;
            this.currentTime = time;
        } else if (context == 'session end') {
            this.currentTime = time;
            this.lastSessionEndTime = time;

            // TODO
            /* Log entry. */ recordSessionCompletion(currentSession);
        } else if (context == 'session start') {
            this.currentTime = time;
            this.currentSessionStartTime = time;

            // TODO
            /* Log entry. */ recordSessionStart(currentSession);
        } else if (context == 'current time') {
            this.currentTime = time;
        }
    }
}