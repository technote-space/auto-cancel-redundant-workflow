import { Context } from '@actions/github/lib/context';
import { Octokit } from '@technote-space/github-action-helper/dist/types';
import { Logger } from '@technote-space/github-action-helper';
import { PaginateInterface } from '@octokit/plugin-paginate-rest';
import { RestEndpointMethods } from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/method-types';
import { ActionsListWorkflowRunsResponseData } from '@octokit/types';
import { getTargetBranch, isNotExcludeRun } from './misc';

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

export const getWorkflowRuns = async(workflowId: number, logger: Logger, octokit: Octokit, context: Context): Promise<ActionsListWorkflowRunsResponseData['workflow_runs']> => {
  const options: {
    owner: string;
    repo: string;
    'workflow_id': number;
    branch?: string
    event?: string;
    status?: string;
  } = {
    ...context.repo,
    'workflow_id': workflowId,
    status: 'in_progress',
    event: context.eventName,
  };

  const branch = await getTargetBranch(octokit, context);
  logger.log('target event: %s', logger.c(context.eventName, {color: 'green'}));
  if (branch) {
    logger.log('target branch: %s', logger.c(branch, {color: 'green'}));
    options.branch = branch;
  }

  return (await (octokit.paginate as PaginateInterface)(
    (octokit as RestEndpointMethods).actions.listWorkflowRuns,
    // eslint-disable-next-line no-warning-comments
    // TODO: remove ts-ignore after fixed types (https://github.com/octokit/types.ts/issues/122)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    options,
  )).map(run => run as ActionsListWorkflowRunsResponseData['workflow_runs'][number]).filter(isNotExcludeRun);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const cancelWorkflowRun = async(runId: number, octokit: Octokit, context: Context): Promise<any> => (octokit as RestEndpointMethods).actions.cancelWorkflowRun({
  ...context.repo,
  'run_id': runId,
});
