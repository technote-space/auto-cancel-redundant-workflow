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
exports.execute = void 0;
const core_1 = require("@actions/core");
const misc_1 = require("./utils/misc");
const workflow_1 = require("./utils/workflow");
const execute = (logger, octokit, context) => __awaiter(void 0, void 0, void 0, function* () {
    if (misc_1.isExcludeContext(context)) {
        logger.info('This is not target context.');
        core_1.setOutput('ids', '');
        return;
    }
    const runId = misc_1.getRunId();
    logger.info('run id: %d', runId);
    const run = yield workflow_1.getWorkflowRun(octokit, context);
    logger.startProcess('run:');
    console.log(misc_1.getFilteredRun(run));
    logger.endProcess();
    const workflowId = yield workflow_1.getWorkflowId(run);
    logger.info('workflow id: %d', workflowId);
    const runs = yield workflow_1.getWorkflowRuns(workflowId, logger, octokit, context);
    logger.startProcess('workflow runs:');
    console.log(runs.map(run => misc_1.getFilteredRun(run)));
    logger.endProcess();
    logger.log();
    const runsWithCreatedAtTime = runs.filter(run => run.id !== runId).map(run => (Object.assign(Object.assign({}, run), { createdAt: Date.parse(workflow_1.getWorkflowRunCreatedAt(run)) })));
    const createdAt = Date.parse(workflow_1.getWorkflowRunCreatedAt(run));
    const runNumber = workflow_1.getWorkflowRunNumber(run);
    if (runsWithCreatedAtTime.find(run => run.createdAt > createdAt || (run.createdAt === createdAt && workflow_1.getWorkflowRunNumber(run) > runNumber))) {
        logger.info(logger.c('newer job exists', { color: 'yellow' }));
        core_1.setOutput('ids', '');
        return;
    }
    logger.startProcess('Cancelling...');
    yield Promise.all(runsWithCreatedAtTime.map(run => {
        logger.log('cancel: %d', run.id);
        return workflow_1.cancelWorkflowRun(run.id, octokit, context);
    }));
    logger.info('total: %d', runsWithCreatedAtTime.length);
    core_1.setOutput('ids', runsWithCreatedAtTime.map(run => run.id).join(','));
    logger.endProcess();
});
exports.execute = execute;
