import {getInput} from '@actions/core';
import {Context} from '@actions/github/lib/context';
import {Octokit} from '@technote-space/github-action-helper/dist/types';
import {ContextHelper, Utils} from '@technote-space/github-action-helper';
import {components} from '@octokit/openapi-types';
import {SHOW_PROPERTIES} from '../constant';

type ActionsListWorkflowRunsResponseData = components['schemas']['workflow-run'];
type ActionsGetWorkflowRunResponseData = components['schemas']['workflow-run'];

const getMergeMessagePrefix   = (): RegExp => Utils.getPrefixRegExp(getInput('MERGE_MESSAGE_PREFIX'));
const isExcludeMerged         = (): boolean => Utils.getBoolValue(getInput('EXCLUDE_MERGED'));
const isExcludeTagPush        = (): boolean => Utils.getBoolValue(getInput('EXCLUDE_TAG_PUSH'));
export const isExcludeContext = (context: Context): boolean =>
  ContextHelper.isPush(context) && (
    (isExcludeTagPush() && Utils.isTagRef(context)) ||
    (isExcludeMerged() && getMergeMessagePrefix().test(context.payload.head_commit.message))
  );
export const isNotExcludeRun  = (run: ActionsListWorkflowRunsResponseData): boolean => !isExcludeMerged() || !getMergeMessagePrefix().test(run.head_commit.message);

export const getRunId = (): number => Number(process.env.GITHUB_RUN_ID);

export const getTargetBranch = async(octokit: Octokit, context: Context): Promise<string | undefined> => {
  if (context.payload.pull_request) {
    return context.payload.pull_request.head.ref;
  }

  return Utils.getBranch(context) || undefined;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getFilteredRun = (run: ActionsGetWorkflowRunResponseData): { [key: string]: any } => Object.assign({}, ...SHOW_PROPERTIES.map(key => ({[key]: run[key]})));
