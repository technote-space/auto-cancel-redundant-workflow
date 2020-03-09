import { Context } from '@actions/github/lib/context';
import { Octokit } from '@octokit/rest';
import { Logger, Command } from '@technote-space/github-action-helper';
import { getIssues } from './utils/issue';
import { getPayload } from './utils/misc';

export const execute = async(logger: Logger, octokit: Octokit, context: Context): Promise<void> => {
	logger.startProcess('Dump context');
	console.log(getPayload(context));

	logger.startProcess('Command test');
	const command = new Command(logger);
	await command.execAsync({
		command: 'ls -lat',
	});

	logger.startProcess('Color text');
	logger.info('green text: %s', logger.c('green', {color: 'red', attribute: 'bold'}));
	logger.warn('warning!');
	logger.error('error!!!');
	logger.debug('debug...');
	logger.log('log log log');

	logger.startProcess('Get issues');
	const issues = await getIssues(octokit, context);
	console.log(issues.map(issue => issue.title));

	logger.endProcess();
};
