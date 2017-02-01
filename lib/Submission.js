import { Class } from 'meteor/jagi:astronomy';

const Submissions = new Mongo.Collection('submissions');

export const Submission = Class.create({
	name: 'Submission',
	collection: Submissions,
	fields: {
		file: String,
		title: String,
		version: Number,
		local: String,
		// timeslot: String,
	},
});

if (Meteor.isServer) {
	Meteor.methods({
		submit(data) {
			console.log('Creating submission with data:', data);
			let submission = new Submission();
			submission.file = data.file;
			submission.title = data.title;
			submission.version = 1;
			submission.local = data.local;
			// submission.timeslot = data.timeslot;
			submission.save();
		},
	});
}

export const SubmissionFiles = new FS.Collection("submissions", {
	stores: [
		new FS.Store.FileSystem("submissions", {path: "../uploads"}),
	],
});
// TODO: Set allowed filetypes, max upload size?

SubmissionFiles.allow({
	insert() { return true; },
	update() { return true; },
	download() { return true; },
});

if (Meteor.isServer) {
	Meteor.publish('submission', (code) => {
		return Submission.find({_id: code});
	});

	Meteor.publish('submissions', () => {
		// if (!Meteor.user()) { this.ready(); return; }
		return Submission.find();
	});

	Meteor.publish('file', (code) => {
		return SubmissionFiles.find({_id: code});
	});

	Meteor.publish('files', () => {
		// if (!Meteor.user()) { this.ready(); return; }
		return SubmissionFiles.find();
	});
}