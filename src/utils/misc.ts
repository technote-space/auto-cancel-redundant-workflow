import type {components} from '@octokit/openapi-types';
import type {Context} from '@actions/github/lib/context';
import {getInput} from '@actions/core';
import {ContextHelper, Utils} from '@technote-space/github-action-helper';
import {SHOW_PROPERTIES} from '../constant';

type ActionsListWorkflowRunsResponseData = components['schemas']['workflow-run'];
type ActionsGetWorkflowRunResponseData = components['schemas']['workflow-run'];

const getMergeMessagePrefix = (): RegExp => Utils.getPrefixRegExp(getInput('MERGE_MESSAGE_PREFIX'));
const isExcludeMerged       = (): boolean => Utils.getBoolValue(getInput('EXCLUDE_MERGED'));
const isExcludeTagPush      = (): boolean => Utils.getBoolValue(getInput('EXCLUDE_TAG_PUSH'));
const parseNumber           = <T>(value: string, defaultValue: T): number | T => {
  if (value && /^\d+$/.test(value)) {
    return Number(value);
  }

  return defaultValue;
};

export const isConsiderReRun  = (): boolean => Utils.getBoolValue(getInput('CONSIDER_RE_RUN'));
export const getIntervalMs    = (): number | undefined => parseNumber(getInput('INTERVAL_MS'), undefined);
export const isExcludeContext = (context: Context): boolean =>
  ContextHelper.isPush(context) && (
    (isExcludeTagPush() && Utils.isTagRef(context)) ||
    (isExcludeMerged() && getMergeMessagePrefix().test(context.payload.head_commit.message))
  );
export const isNotExcludeRun  = (run: ActionsListWorkflowRunsResponseData): boolean => !isExcludeMerged() || !getMergeMessagePrefix().test(run.head_commit?.message ?? '');
export const getTargetRunId   = (context: Context): number => parseNumber(getInput('TARGET_RUN_ID'), context.runId);
export const getTargetBranch  = async(context: Context): Promise<string | undefined> => {
  if (context.payload.pull_request) {
    return context.payload.pull_request.head.ref;
  }

  return Utils.getBranch(context) || undefined;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getFilteredRun   = (run: ActionsGetWorkflowRunResponseData): { [key: string]: any } => Object.assign({}, ...SHOW_PROPERTIES.map(key => ({[key]: run[key]})));
