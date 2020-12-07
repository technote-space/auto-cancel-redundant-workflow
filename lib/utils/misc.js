"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFilteredRun = exports.getTargetBranch = exports.getRunId = exports.isNotExcludeRun = exports.isExcludeContext = void 0;
const core_1 = require("@actions/core");
const github_action_helper_1 = require("@technote-space/github-action-helper");
const constant_1 = require("../constant");
const getMergeMessagePrefix = () => github_action_helper_1.Utils.getPrefixRegExp(core_1.getInput('MERGE_MESSAGE_PREFIX'));
const isExcludeMerged = () => github_action_helper_1.Utils.getBoolValue(core_1.getInput('EXCLUDE_MERGED'));
const isExcludeTagPush = () => github_action_helper_1.Utils.getBoolValue(core_1.getInput('EXCLUDE_TAG_PUSH'));
const isExcludeContext = (context) => github_action_helper_1.ContextHelper.isPush(context) && ((isExcludeTagPush() && github_action_helper_1.Utils.isTagRef(context)) ||
    (isExcludeMerged() && getMergeMessagePrefix().test(context.payload.head_commit.message)));
exports.isExcludeContext = isExcludeContext;
const isNotExcludeRun = (run) => !isExcludeMerged() || !getMergeMessagePrefix().test(run.head_commit.message);
exports.isNotExcludeRun = isNotExcludeRun;
const getRunId = () => Number(process.env.GITHUB_RUN_ID);
exports.getRunId = getRunId;
const getTargetBranch = async (octokit, context) => {
    if (context.payload.pull_request) {
        return context.payload.pull_request.head.ref;
    }
    return github_action_helper_1.Utils.getBranch(context) || undefined;
};
exports.getTargetBranch = getTargetBranch;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getFilteredRun = (run) => Object.assign({}, ...constant_1.SHOW_PROPERTIES.map(key => ({ [key]: run[key] })));
exports.getFilteredRun = getFilteredRun;
