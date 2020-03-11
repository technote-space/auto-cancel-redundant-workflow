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
const misc_1 = require("./utils/misc");
const workflow_1 = require("./utils/workflow");
exports.execute = (logger, octokit, context) => __awaiter(void 0, void 0, void 0, function* () {
    if (misc_1.isExcludeContext(context)) {
        logger.info('This is not target context.');
        return;
    }
    const runId = misc_1.getRunId();
    logger.info('run id: %d', runId);
    const workflowId = yield workflow_1.getWorkflowId(octokit, context);
    logger.info('workflow id: %d', workflowId);
    const runs = yield workflow_1.getWorkflowRuns(workflowId, logger, octokit, context);
    logger.log();
    const currentRun = runs.find(run => run.id === runId);
    if (!currentRun) {
        logger.info(logger.c('maybe canceled', { color: 'yellow' }));
        return;
    }
    const runsWithCreatedAtTime = runs.filter(run => run.id !== runId).map(run => (Object.assign(Object.assign({}, run), { createdAt: Date.parse(run.created_at) })));
    const createdAt = Date.parse(currentRun.created_at);
    if (runsWithCreatedAtTime.find(run => run.createdAt > createdAt)) {
        logger.info(logger.c('newer job exists', { color: 'yellow' }));
        return;
    }
    logger.startProcess('Cancelling...');
    yield Promise.all(runsWithCreatedAtTime.map(run => {
        logger.log('cancel: %d', run.id);
        workflow_1.cancelWorkflowRun(run.id, octokit, context);
    }));
    logger.info('total: %d', runsWithCreatedAtTime.length);
    logger.endProcess();
});
