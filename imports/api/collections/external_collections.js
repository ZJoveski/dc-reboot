import { Mongo } from 'meteor/mongo';

export const PilotExperiment = new Mongo.Collection('pilotExperiment');

export const LobbyStatus = new Mongo.Collection('lobbyStatus');

export const Comments = new Mongo.Collection('comments');

export const SubmissionCode = new Mongo.Collection('submissionCode');