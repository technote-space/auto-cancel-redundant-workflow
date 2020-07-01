/* eslint-disable no-magic-numbers */
import {resolve} from 'path';
import {testEnv, getOctokit, generateContext} from '@technote-space/github-action-test-helper';
import {isExcludeContext, getRunId, getTargetBranch} from '../../src/utils/misc';

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

describe('getRunId', () => {
  testEnv(rootDir);

  it('get run id', () => {
    process.env.GITHUB_RUN_ID = '123';

    expect(getRunId()).toBe(123);
  });
});

describe('getTargetBranch', () => {
  testEnv(rootDir);

  it('should get pr head ref', async() => {
    expect(await getTargetBranch(getOctokit(), generateContext({owner: 'hello', repo: 'world'}, {
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
    expect(await getTargetBranch(getOctokit(), generateContext({owner: 'hello', repo: 'world', ref: 'refs/heads/master'}))).toBe('master');
  });

  it('should return undefined', async() => {
    expect(await getTargetBranch(getOctokit(), generateContext({owner: 'hello', repo: 'world', ref: 'refs/tags/v1.2.3'}))).toBeUndefined();
  });
});
