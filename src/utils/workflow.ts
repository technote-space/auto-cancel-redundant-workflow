import type {OctokitResponse} from '@octokit/types';
import type {PaginateInterface} from '@octokit/plugin-paginate-rest';
import type {Octokit} from '@technote-space/github-action-helper/dist/types';
import type {Context} from '@actions/github/lib/context';
import type {Logger} from '@technote-space/github-action-log-helper';
import type {components} from '@octokit/openapi-types';
import {Utils} from '@technote-space/github-action-helper';
import {getTargetBranch, isNotExcludeRun} from './misc';

type ActionsGetWorkflowRunResponseData = components['schemas']['workflow-run'];
type ActionsListWorkflowRunsResponseData = components['schemas']['workflow-run'];

export const getWorkflowRun = async(runId: number, octokit: Octokit, context: Context): Promise<ActionsGetWorkflowRunResponseData> => {
  return (await octokit.actions.getWorkflowRun({
    owner: context.repo.owner,
    repo: context.repo.repo,
    'run_id': runId,
  })).data;
};

export const getWorkflowId = (run: ActionsGetWorkflowRunResponseData): number | never => {
  const matches = run.workflow_url.match(/\d+$/);
  if (!matches) {
    throw new Error('Invalid workflow run');
  }

  return Number(matches[0]);
};

export const getWorkflowRunUpdatedAt = (run: ActionsGetWorkflowRunResponseData): number => Date.parse(Utils.ensureNotNull(run.updated_at));

export const getWorkflowRunNumber = (run: ActionsGetWorkflowRunResponseData): number => run.run_number;

export const getWorkflowRuns = async(workflowId: number, logger: Logger, octokit: Octokit, context: Context): Promise<Array<ActionsListWorkflowRunsResponseData>> => {
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
    // not work properly sometimes so filter by program
    // event: context.eventName,
  };

  const branch = await getTargetBranch(context);
  logger.log('target event: %s', logger.c(context.eventName, {color: 'green'}));
  if (branch) {
    logger.log('target branch: %s', logger.c(branch, {color: 'green'}));
    options.branch = branch;
  }

  return (await (octokit.paginate as PaginateInterface)(
    octokit.actions.listWorkflowRuns,
    // eslint-disable-next-line no-warning-comments
    // TODO: remove ts-ignore after fixed types (https://github.com/octokit/types.ts/issues/122)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    options,
  )).map(run => run as ActionsListWorkflowRunsResponseData).filter(run => run.event === context.eventName).filter(isNotExcludeRun);
};

export const cancelWorkflowRun = async(runId: number, octokit: Octokit, context: Context): Promise<OctokitResponse<{ [key: string]: unknown; }>> => octokit.actions.cancelWorkflowRun({
  ...context.repo,
  'run_id': runId,
});
