"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = void 0;
const core_1 = require("@actions/core");
const github_action_helper_1 = require("@technote-space/github-action-helper");
const misc_1 = require("./utils/misc");
const workflow_1 = require("./utils/workflow");
const execute = async (logger, octokit, context) => {
    if (misc_1.isExcludeContext(context)) {
        logger.info('This is not target context.');
        core_1.setOutput('ids', '');
        return;
    }
    const runId = misc_1.getTargetRunId(context);
    logger.info('run id: %d', runId);
    const run = await workflow_1.getWorkflowRun(runId, octokit, context);
    logger.startProcess('run:');
    console.log(misc_1.getFilteredRun(run));
    logger.endProcess();
    const workflowId = await workflow_1.getWorkflowId(run);
    logger.info('workflow id: %d', workflowId);
    const runs = await workflow_1.getWorkflowRuns(workflowId, logger, octokit, context);
    if (!runs.some(_run => _run.run_number === run.run_number)) {
        runs.push(run);
    }
    logger.startProcess('workflow runs:');
    console.log(runs.map(run => misc_1.getFilteredRun(run)));
    logger.endProcess();
    // cancel all workflows except latest one (consider re-run)
    const runsWithUpdatedAt = runs.map(run => ({ ...run, updatedAt: workflow_1.getWorkflowRunUpdatedAt(run) }));
    const latestRunNumber = Math.max(...runsWithUpdatedAt.map(run => workflow_1.getWorkflowRunNumber(run)));
    const latestUpdatedAt = Math.max(...runsWithUpdatedAt.map(run => run.updatedAt));
    const targetRuns = runsWithUpdatedAt.filter(run => workflow_1.getWorkflowRunNumber(run) < latestRunNumber && // not latest run
        (!misc_1.isConsiderReRun() || run.updatedAt < latestUpdatedAt));
    logger.log();
    logger.startProcess('Cancelling...');
    const interval = misc_1.getIntervalMs();
    await targetRuns.reduce(async (prev, run) => {
        await prev;
        logger.log('cancel: %d', run.id);
        try {
            await workflow_1.cancelWorkflowRun(run.id, octokit, context);
        }
        catch (error) {
            logger.error(error.message);
        }
        if (interval) {
            await github_action_helper_1.Utils.sleep(interval);
        }
    }, Promise.resolve());
    logger.info('total: %d', targetRuns.length);
    core_1.setOutput('ids', targetRuns.map(run => run.id).join(','));
    logger.endProcess();
};
exports.execute = execute;
