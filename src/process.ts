import {Context} from '@actions/github/lib/context';
import {Octokit} from '@technote-space/github-action-helper/dist/types';
import {Logger} from '@technote-space/github-action-log-helper';
import {setOutput} from '@actions/core';
import {getRunId, isExcludeContext, getFilteredRun} from './utils/misc';
import {cancelWorkflowRun, getWorkflowId, getWorkflowRun, getWorkflowRunCreatedAt, getWorkflowRunNumber, getWorkflowRuns} from './utils/workflow';

export const execute = async(logger: Logger, octokit: Octokit, context: Context): Promise<void> => {
  if (isExcludeContext(context)) {
    logger.info('This is not target context.');
    setOutput('ids', '');
    return;
  }

  const runId = getRunId();
  logger.info('run id: %d', runId);

  const run = await getWorkflowRun(octokit, context);
  logger.startProcess('run:');
  console.log(getFilteredRun(run));
  logger.endProcess();

  const workflowId = await getWorkflowId(run);
  logger.info('workflow id: %d', workflowId);

  const runs = await getWorkflowRuns(workflowId, logger, octokit, context);
  logger.startProcess('workflow runs:');
  console.log(runs.map(run => getFilteredRun(run)));
  logger.endProcess();

  logger.log();
  const runsWithCreatedAtTime = runs.filter(run => run.id !== runId).map(run => ({...run, createdAt: Date.parse(run.created_at)}));
  const createdAt             = Date.parse(getWorkflowRunCreatedAt(run));
  const runNumber             = getWorkflowRunNumber(run);

  if (runsWithCreatedAtTime.find(run => run.createdAt > createdAt || (run.createdAt === createdAt && getWorkflowRunNumber(run) > runNumber))) {
    logger.info(logger.c('newer job exists', {color: 'yellow'}));
    setOutput('ids', '');
    return;
  }

  logger.startProcess('Cancelling...');
  await Promise.all(runsWithCreatedAtTime.map(run => {
    logger.log('cancel: %d', run.id);
    return cancelWorkflowRun(run.id, octokit, context);
  }));
  logger.info('total: %d', runsWithCreatedAtTime.length);
  setOutput('ids', runsWithCreatedAtTime.map(run => run.id).join(','));

  logger.endProcess();
};
