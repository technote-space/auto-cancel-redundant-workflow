import {Context} from '@actions/github/lib/context';
import {Octokit} from '@technote-space/github-action-helper/dist/types';
import {Logger} from '@technote-space/github-action-log-helper';
import {setOutput} from '@actions/core';
import {Utils} from '@technote-space/github-action-helper';
import {getTargetRunId, isExcludeContext, isConsiderReRun, getIntervalMs, getFilteredRun} from './utils/misc';
import {cancelWorkflowRun, getWorkflowId, getWorkflowRun, getWorkflowRunUpdatedAt, getWorkflowRunNumber, getWorkflowRuns} from './utils/workflow';

export const execute = async(logger: Logger, octokit: Octokit, context: Context): Promise<void> => {
  if (isExcludeContext(context)) {
    logger.info('This is not target context.');
    setOutput('ids', '');
    return;
  }

  const runId = getTargetRunId(context);
  logger.info('run id: %d', runId);

  const run = await getWorkflowRun(runId, octokit, context);
  logger.startProcess('run:');
  console.log(getFilteredRun(run));
  logger.endProcess();

  const workflowId = await getWorkflowId(run);
  logger.info('workflow id: %d', workflowId);

  const runs = await getWorkflowRuns(workflowId, logger, octokit, context);
  logger.startProcess('workflow runs:');
  console.log(runs.map(run => getFilteredRun(run)));
  logger.endProcess();

  // cancel all workflows except latest one (consider re-run)
  const runsWithUpdatedAt = runs.map(run => ({...run, updatedAt: getWorkflowRunUpdatedAt(run)}));
  const latestRunNumber   = Math.max(...runsWithUpdatedAt.map(run => getWorkflowRunNumber(run)));
  const latestUpdatedAt   = Math.max(...runsWithUpdatedAt.map(run => run.updatedAt));
  const targetRuns        = runsWithUpdatedAt.filter(
    run =>
      getWorkflowRunNumber(run) < latestRunNumber &&            // not latest run
      (!isConsiderReRun() || run.updatedAt < latestUpdatedAt),  // not re-run (only updated_at seems to be updated even when re-run)
  );

  logger.log();
  logger.startProcess('Cancelling...');
  const interval = getIntervalMs();
  await targetRuns.reduce(async(prev, run) => {
    await prev;
    logger.log('cancel: %d', run.id);
    await cancelWorkflowRun(run.id, octokit, context);
    if (interval) {
      await Utils.sleep(interval);
    }
  }, Promise.resolve());

  logger.info('total: %d', targetRuns.length);
  setOutput('ids', targetRuns.map(run => run.id).join(','));

  logger.endProcess();
};
