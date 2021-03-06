import { Class } from 'meteor/jagi:astronomy';

const Submissions = new Mongo.Collection('submissions');

function getFileName(submission) {
	return '['+submission.timeslot+']['+submission.local+'] ' + submission.title;
}

export const Submission = Class.create({
	name: 'Submission',
	collection: Submissions,
	fields: {
		file: String,
		title: String,
		version: Number,
		local: String,
		email: String,
		timeslot: {
			type: String,
			optional: true,
		},
		updatedAt: Date,
	},
	meteorMethods: {
		reupload(fileId) {
			console.log("Change: ", this.file, this.title, this.version, this.local, this.updatedAt);
			console.log('To: ', file, this.version + 1, new Date());

			let file = SubmissionFiles.findOne(fileId);
			if (!file) {
				console.error("Attempting to create submission with non-existing file:", fileId);
				return false;
			}
			file.name(getFileName(this));

			this.version = this.version + 1;
			this.file = fileId;
			this.updatedAt = new Date();
			this.save();
		}
	},
});

if (Meteor.isServer) {
	Meteor.methods({
		submit(data) {
			console.log('Creating submission with data:', data);

			let file = SubmissionFiles.findOne(data.file);
			if (!file) {
				throw new Meteor.Error("Attempting to create submission with non-existing file:" + data.file);
				return false;
			}

			let submission = new Submission();
			submission.file = data.file;
			submission.title = data.title;
			submission.email = data.email;
			submission.version = 1;
			submission.local = data.local;
			submission.updatedAt = new Date();
			submission.timeslot = data.timeslot;

			file.name(getFileName(submission));
			submission.save();
			return submission._id;
		},
	});
}

let uploadPath = "uploads";
if (Meteor.isServer) {
	let settings = JSON.parse(Assets.getText('settings.json'));
	uploadPath = settings.upload;
}

export const SubmissionFiles = new FS.Collection("submissions", {
	stores: [
		new FS.Store.FileSystem("submissions", {path: uploadPath}),
	],
	transformRead: function(fileObj, readStream, writeStream) {
		console.log('Transform Read:', fileObj);
		readStream.pipe(writeStream);
	},
});
// TODO: Set allowed filetypes, max upload size?

SubmissionFiles.allow({
	insert() {
		return true;
	},
	update() { return true; },
	download() { return true; },
});

if (Meteor.isServer) {
	Meteor.publish('submission', (code) => {
		return Submission.find({_id: code});
	});

	Meteor.publish('submissions', () => {
		// TODO: Enable user check once admin login is implemented
		// if (!Meteor.user()) { this.ready(); return; }
		return Submission.find();
	});

	Meteor.publish('file', (code) => {
		return SubmissionFiles.find(code);
	});

	Meteor.publish('files', () => {
		// TODO: Enable user check once admin login is implemented
		// if (!Meteor.user()) { this.ready(); return; }
		return SubmissionFiles.find();
	});
}
