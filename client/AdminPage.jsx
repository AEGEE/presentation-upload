import { Meteor } from 'meteor/meteor';
import Helmet from 'react-helmet';

import { createContainer } from 'meteor/react-meteor-data';
import { Submission, SubmissionFiles } from '/lib/Submission.js';

import React, { Component } from 'react';
import { Link } from 'react-router';

import Paper from 'material-ui/Paper';
import { List, ListItem } from 'material-ui/List';
import Avatar from 'material-ui/Avatar';

import Submissions from '/lib/Submission.js';

// TODO: Disallow page when not logged in
class AdminPage extends Component {
	constructor(props, context) {
		super(props, context);
	}

	render() {
		if (!this.props.ready) return (<div>Loading...</div>);
		let submissions = [];
		this.props.submissions.forEach((submission) => {
			let icon;
			let file = SubmissionFiles.findOne(submission.file);
			if (file.isImage()) {
				icon = (<Avatar src={file.url()} />);
			}

			submissions.push(
				<Link key={submission._id} to={'/submission/' + submission._id}>
					<ListItem
						primaryText={submission.title}
						secondaryText={'v'+submission.version + ', ' + submission.local + ', ' + submission.updatedAt}
						rightAvatar={icon}
						style={{textDecoration: 'none'}}
					/>
				</Link>
			);
		});
		return (
			<div>
				<Helmet title="Admin" />
				<Paper style={{padding: '20px'}}>
					<h1>All Submissions</h1>
					<List>
						{submissions}
					</List>
				</Paper>
			</div>
		);
	}
}

export default createContainer((props) => {
	let submissionHandle = Meteor.subscribe('submissions');
	let submissionFilesHandle = Meteor.subscribe('files');

	let submissions = Submission.find().fetch();
	let files = SubmissionFiles.find().fetch();

	return {
		submissions: submissions,
		files: files,
		ready: submissionHandle.ready() && submissionFilesHandle.ready(),
	};
}, AdminPage);
