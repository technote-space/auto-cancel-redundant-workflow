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
const github_action_helper_1 = require("@technote-space/github-action-helper");
exports.getRunId = () => Number(process.env.GITHUB_RUN_ID);
exports.getTargetBranch = (octokit, context) => __awaiter(void 0, void 0, void 0, function* () {
    if (context.payload.pull_request) {
        return context.payload.pull_request.head.ref;
    }
    const helper = new github_action_helper_1.ApiHelper(octokit, context);
    const defaultBranch = yield helper.getDefaultBranch();
    if (defaultBranch !== github_action_helper_1.Utils.getBranch(context)) {
        const pull = yield helper.findPullRequest(context.ref);
        if (pull) {
            return pull.head.ref;
        }
    }
    return defaultBranch;
});
