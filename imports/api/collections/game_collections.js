import { Mongo } from 'meteor/mongo';

/* Mongo collections. */

// Stores information about neighborhoods of nodes corresponding to registered users 
// (these are the "relevant" neighborhoods). The corresponding documents are of the format
// { userId: someUserId, namesOfNeighbors: arrayOfNamesOfNeighbors, neighAdjMatrix: 
// adjacencyMatrixOfCorrespondingNeighborhood, neighborhoodColors: colors of self and neighbors }
export const NeighborhoodsInfo = new Mongo.Collection('neighborhoods'); //corresponds to colorsInfo

export const ExperimentLog = new Mongo.Collection('experimentLog');

export const PayoutInfo = new Mongo.Collection('payoutInfo');

export const MessagesCollection = new Mongo.Collection('messages');

export const ParametersInfo = new Mongo.Collection('parameters');

export const ParticipantsInfo = new Mongo.Collection('participants');

export const ProgressInfo = new Mongo.Collection('progress');

export const SessionInfo = new Mongo.Collection('session');

export const TimeInfo = new Mongo.Collection('time');

//export const parameters = new Mongo.Collection('parameters');

//export const participantsCollection = new Mongo.Collection('participantsCollection');

//export const communicationParameters = new Mongo.Collection('communicationParameters');

//export const communicationLimits = new Mongo.Collection('communicationLimits');

//export const potentialPayoutsInfo = new Mongo.Collection('potentialPayoutsInfo');

//export const adversariesCollection = new Mongo.Collection('adversariesCollection');

//export const outcomeColorsCollection = new Mongo.Collection('outcomeColorsCollection');

// Stores current experiment number. Only used on the server. 
//TODO: replace this
//export const persistentInfo = new Mongo.Collection('persistentInfo');

//export const sessionInfo = new Mongo.Collection('sessionInfo');

//export const timeInfo = new Mongo.Collection('timeInfo');

//export const progressInfo = new Mongo.Collection('progressInfo');

// Stores information about current colors of network nodes. It consists of documents of 
// the format { name: someName, color: someColor }
//export const colors = new Mongo.Collection('colorsCollection');

//export const colorsInfo = new Mongo.Collection('colorsInfo');
