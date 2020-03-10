import { Context } from '@actions/github/lib/context';
import { Octokit } from '@octokit/rest';
import { Logger } from '@technote-space/github-action-helper';
import { getTargetBranch } from './misc';

export const getWorkflowId = async(octokit: Octokit, context: Context): Promise<number> | never => {
	const run = await octokit.actions.getWorkflowRun({
		owner: context.repo.owner,
		repo: context.repo.repo,
		'run_id': Number(process.env.GITHUB_RUN_ID),
	});

	const matches = run.data.workflow_url.match(/\d+$/);
	if (!matches) {
		throw new Error('Invalid workflow run');
	}

	return Number(matches[0]);
};

export const getWorkflowRuns = async(workflowId: number, logger: Logger, octokit: Octokit, context: Context): Promise<Array<Octokit.ActionsListWorkflowRunsResponseWorkflowRunsItem>> => {
	const branch = await getTargetBranch(octokit, context);
	logger.log('target event: %s', logger.c(context.eventName, {color: 'green'}));
	logger.log('target branch: %s', logger.c(branch, {color: 'green'}));

	return (await octokit.paginate(
		octokit.actions.listWorkflowRuns.endpoint.merge({
			...context.repo,
			'workflow_id': workflowId,
			status: 'in_progress',
			branch,
			event: context.eventName,
		}),
	));
};

export const cancelWorkflowRun = async(runId: number, octokit: Octokit, context: Context): Promise<object> => octokit.actions.cancelWorkflowRun({
	...context.repo,
	'run_id': runId,
});
