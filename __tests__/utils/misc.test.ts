/* eslint-disable no-magic-numbers */
import type {components} from '@octokit/openapi-types';
import {resolve} from 'path';
import {testEnv, generateContext} from '@technote-space/github-action-test-helper';
import {isExcludeContext, isNotExcludeRun, isConsiderReRun, getIntervalMs, getTargetRunId, getTargetBranch} from '../../src/utils/misc';

type ActionsListWorkflowRunsResponseData = components['schemas']['workflow-run'];
const rootDir = resolve(__dirname, '../..');

describe('isExcludeContext', () => {
  testEnv(rootDir);

  it('should true 1', () => {
    expect(isExcludeContext(generateContext({event: 'push', ref: 'refs/tags/v1.2.3'}))).toBe(true);
  });

  it('should true 2', () => {
    process.env.INPUT_EXCLUDE_MERGED = 'true';
    expect(isExcludeContext(generateContext({event: 'push', ref: 'refs/heads/feature/change'}, {
      payload: {
        'head_commit': {
          message: 'Merge pull request #260 from test',
        },
      },
    }))).toBe(true);
  });

  it('should false 1', () => {
    process.env.INPUT_EXCLUDE_TAG_PUSH = 'false';
    expect(isExcludeContext(generateContext({event: 'push', ref: 'refs/tags/v1.2.3'}))).toBe(false);
  });

  it('should false 2', () => {
    expect(isExcludeContext(generateContext({event: 'push', ref: 'refs/heads/feature/change'}))).toBe(false);
  });

  it('should false 3', () => {
    expect(isExcludeContext(generateContext({event: 'push', ref: 'refs/heads/feature/change'}, {
      payload: {
        'head_commit': {
          message: 'Merge pull request #260 from test',
        },
      },
    }))).toBe(false);
  });
});

describe('isNotExcludeRun', () => {
  testEnv(rootDir);

  it('should return true 1', () => {
    process.env.INPUT_EXCLUDE_MERGED = 'false';
    expect(isNotExcludeRun({} as ActionsListWorkflowRunsResponseData)).toBe(true);
  });

  it('should return true 2', () => {
    process.env.INPUT_EXCLUDE_MERGED       = 'true';
    process.env.INPUT_MERGE_MESSAGE_PREFIX = 'test';
    expect(isNotExcludeRun({} as ActionsListWorkflowRunsResponseData)).toBe(true);
    expect(isNotExcludeRun({'head_commit': {message: ''}} as ActionsListWorkflowRunsResponseData)).toBe(true);
    expect(isNotExcludeRun({'head_commit': {message: 'aaa'}} as ActionsListWorkflowRunsResponseData)).toBe(true);
  });

  it('should return false', () => {
    process.env.INPUT_EXCLUDE_MERGED       = 'true';
    process.env.INPUT_MERGE_MESSAGE_PREFIX = 'test';
    expect(isNotExcludeRun({'head_commit': {message: 'test aaa'}} as ActionsListWorkflowRunsResponseData)).toBe(false);
  });
});

describe('isConsiderReRun', () => {
  testEnv(rootDir);

  it('should return false 1', () => {
    expect(isConsiderReRun()).toBe(false);
  });

  it('should return false 2', () => {
    process.env.INPUT_CONSIDER_RE_RUN = 'false';

    expect(isConsiderReRun()).toBe(false);
  });

  it('should return false 2', () => {
    process.env.INPUT_CONSIDER_RE_RUN = '0';

    expect(isConsiderReRun()).toBe(false);
  });

  it('should return true 1', () => {
    process.env.INPUT_CONSIDER_RE_RUN = 'true';

    expect(isConsiderReRun()).toBe(true);
  });

  it('should return true 2', () => {
    process.env.INPUT_CONSIDER_RE_RUN = '1';

    expect(isConsiderReRun()).toBe(true);
  });
});

describe('getIntervalMs', () => {
  testEnv(rootDir);

  it('should return undefined 1', () => {
    expect(getIntervalMs()).toBeUndefined();
  });

  it('should return undefined 2', () => {
    process.env.INPUT_INTERVAL_MS = 'abc';

    expect(getIntervalMs()).toBeUndefined();
  });

  it('should return number', () => {
    process.env.INPUT_INTERVAL_MS = '123';

    expect(getIntervalMs()).toBe(123);
  });
});

describe('getTargetRunId', () => {
  testEnv(rootDir);

  it('should get default target run id', () => {
    expect(getTargetRunId(generateContext({owner: 'hello', repo: 'world'}, {
      runId: 123,
    }))).toBe(123);
  });

  it('should get target run id', () => {
    process.env.INPUT_TARGET_RUN_ID = '456';
    expect(getTargetRunId(generateContext({owner: 'hello', repo: 'world'}, {
      runId: 123,
    }))).toBe(456);
  });
});

describe('getTargetBranch', () => {
  testEnv(rootDir);

  it('should get pr head ref', async() => {
    expect(await getTargetBranch(generateContext({owner: 'hello', repo: 'world'}, {
      payload: {
        'pull_request': {
          head: {
            ref: 'release/v1.2.3',
          },
        },
      },
    }))).toBe('release/v1.2.3');
  });

  it('should get branch', async() => {
    expect(await getTargetBranch(generateContext({owner: 'hello', repo: 'world', ref: 'refs/heads/master'}))).toBe('master');
  });

  it('should return undefined', async() => {
    expect(await getTargetBranch(generateContext({owner: 'hello', repo: 'world', ref: 'refs/tags/v1.2.3'}))).toBeUndefined();
  });
});
