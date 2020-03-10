import { Context } from '@actions/github/lib/context';
import { Octokit } from '@octokit/rest';
import { Logger } from '@technote-space/github-action-helper';
import { getRunId } from './utils/misc';
import { cancelWorkflowRun, getWorkflowId, getWorkflowRuns } from './utils/workflow';

export const execute = async(logger: Logger, octokit: Octokit, context: Context): Promise<void> => {
	const runId = getRunId();
	logger.info('run id: %d', runId);

	const workflowId = await getWorkflowId(octokit, context);
	logger.info('workflow id: %d', workflowId);

	const runs       = await getWorkflowRuns(workflowId, octokit, context);
	const currentRun = runs.find(run => run.id === runId);
	if (!currentRun) {
		logger.info('maybe canceled');
		return;
	}

	const runsWithCreatedAtTime = runs.filter(run => run.id !== runId).map(run => ({...run, createdAt: Date.parse(run.created_at)}));
	const createdAt             = Date.parse(currentRun.created_at);

	if (runsWithCreatedAtTime.find(run => run.createdAt > createdAt)) {
		logger.info('newer job exists');
		return;
	}

	logger.startProcess('Cancelling...');
	await Promise.all(runsWithCreatedAtTime.map(run => {
		logger.log('cancel: %d', run.id);
		cancelWorkflowRun(run.id, octokit, context);
	}));
	logger.info('processed: %d', runsWithCreatedAtTime.length);

	logger.endProcess();
};
