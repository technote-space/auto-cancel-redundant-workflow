"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelWorkflowRun = exports.getWorkflowRuns = exports.getWorkflowId = void 0;
const misc_1 = require("./misc");
exports.getWorkflowId = (octokit, context) => __awaiter(void 0, void 0, void 0, function* () {
    const run = yield octokit.actions.getWorkflowRun({
        owner: context.repo.owner,
        repo: context.repo.repo,
        'run_id': Number(process.env.GITHUB_RUN_ID),
    });
    const matches = run.data.workflow_url.match(/\d+$/);
    if (!matches) {
        throw new Error('Invalid workflow run');
    }
    return Number(matches[0]);
});
exports.getWorkflowRuns = (workflowId, logger, octokit, context) => __awaiter(void 0, void 0, void 0, function* () {
    const options = Object.assign(Object.assign({}, context.repo), { 'workflow_id': workflowId, status: 'in_progress', event: context.eventName });
    const branch = yield misc_1.getTargetBranch(octokit, context);
    logger.log('target event: %s', logger.c(context.eventName, { color: 'green' }));
    if (branch) {
        logger.log('target branch: %s', logger.c(branch, { color: 'green' }));
        options.branch = branch;
    }
    return (yield octokit.paginate(octokit.actions.listWorkflowRuns.endpoint.merge(options))).filter(misc_1.isNotExcludeRun);
});
exports.cancelWorkflowRun = (runId, octokit, context) => __awaiter(void 0, void 0, void 0, function* () {
    return octokit.actions.cancelWorkflowRun(Object.assign(Object.assign({}, context.repo), { 'run_id': runId }));
});
