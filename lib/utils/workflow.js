"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelWorkflowRun = exports.getWorkflowRuns = exports.getWorkflowRunNumber = exports.getWorkflowRunCreatedAt = exports.getWorkflowId = exports.getWorkflowRun = void 0;
const github_action_helper_1 = require("@technote-space/github-action-helper");
const misc_1 = require("./misc");
const getWorkflowRun = async (octokit, context) => {
    return (await octokit.actions.getWorkflowRun({
        owner: context.repo.owner,
        repo: context.repo.repo,
        'run_id': Number(process.env.GITHUB_RUN_ID),
    })).data;
};
exports.getWorkflowRun = getWorkflowRun;
const getWorkflowId = (run) => {
    const matches = run.workflow_url.match(/\d+$/);
    if (!matches) {
        throw new Error('Invalid workflow run');
    }
    return Number(matches[0]);
};
exports.getWorkflowId = getWorkflowId;
const getWorkflowRunCreatedAt = (run) => github_action_helper_1.Utils.ensureNotNull(run.created_at);
exports.getWorkflowRunCreatedAt = getWorkflowRunCreatedAt;
const getWorkflowRunNumber = (run) => run.run_number;
exports.getWorkflowRunNumber = getWorkflowRunNumber;
const getWorkflowRuns = async (workflowId, logger, octokit, context) => {
    const options = {
        ...context.repo,
        'workflow_id': workflowId,
        status: 'in_progress',
    };
    const branch = await misc_1.getTargetBranch(octokit, context);
    logger.log('target event: %s', logger.c(context.eventName, { color: 'green' }));
    if (branch) {
        logger.log('target branch: %s', logger.c(branch, { color: 'green' }));
        options.branch = branch;
    }
    return (await octokit.paginate(octokit.actions.listWorkflowRuns, 
    // eslint-disable-next-line no-warning-comments
    // TODO: remove ts-ignore after fixed types (https://github.com/octokit/types.ts/issues/122)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    options)).map(run => run).filter(run => run.event === context.eventName).filter(misc_1.isNotExcludeRun);
};
exports.getWorkflowRuns = getWorkflowRuns;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cancelWorkflowRun = async (runId, octokit, context) => octokit.actions.cancelWorkflowRun({
    ...context.repo,
    'run_id': runId,
});
exports.cancelWorkflowRun = cancelWorkflowRun;
