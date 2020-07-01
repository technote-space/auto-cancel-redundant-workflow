/* eslint-disable no-magic-numbers */
import {resolve} from 'path';
import nock from 'nock';
import {
  testEnv,
  spyOnStdout,
  getOctokit,
  generateContext,
  stdoutCalledWith,
  disableNetConnect,
  getApiFixture,
} from '@technote-space/github-action-test-helper';
import {Logger} from '@technote-space/github-action-helper';
import {execute} from '../src/process';

const rootDir     = resolve(__dirname, '..');
const fixturesDir = resolve(__dirname, 'fixtures');

beforeEach(() => {
  Logger.resetForTesting();
});

describe('execute', () => {
  disableNetConnect(nock);
  testEnv(rootDir);

  it('should do nothing 1', async() => {
    process.env.INPUT_EXCLUDE_MERGED = 'true';

    const mockStdout = spyOnStdout();

    await execute(new Logger(), getOctokit(), generateContext({owner: 'hello', repo: 'world', event: 'push'}, {
      payload: {
        'head_commit': {
          message: 'Merge pull request #260 from test',
        },
      },
    }));

    stdoutCalledWith(mockStdout, [
      '> This is not target context.',
    ]);
  });

  it('should do nothing 2', async() => {
    process.env.GITHUB_RUN_ID = '123';

    const mockStdout = spyOnStdout();
    nock('https://api.github.com')
      .get('/repos/hello/world/actions/runs/123')
      .reply(200, () => getApiFixture(fixturesDir, 'workflow-run.get'))
      .get('/repos/hello/world/actions/workflows/30433642/runs?status=in_progress&branch=release%2Fv1.2.3&event=pull_request')
      .reply(200, () => getApiFixture(fixturesDir, 'workflow-run.list'));

    await execute(new Logger(), getOctokit(), generateContext({owner: 'hello', repo: 'world', event: 'pull_request'}, {
      payload: {
        'pull_request': {
          head: {
            ref: 'release/v1.2.3',
          },
        },
      },
    }));

    stdoutCalledWith(mockStdout, [
      '> run id: 123',
      '> workflow id: 30433642',
      'target event: \x1b[32;40;0mpull_request\x1b[0m',
      'target branch: \x1b[32;40;0mrelease/v1.2.3\x1b[0m',
      '',
      '> \x1b[33;40;0mcurrent run not found\x1b[0m',
    ]);
  });

  it('should do nothing 3', async() => {
    process.env.GITHUB_RUN_ID = '30433643';

    const mockStdout = spyOnStdout();
    nock('https://api.github.com')
      .get('/repos/hello/world/actions/runs/30433643')
      .reply(200, () => getApiFixture(fixturesDir, 'workflow-run.get'))
      .get('/repos/hello/world/actions/workflows/30433642/runs?status=in_progress&branch=release%2Fv1.2.3&event=pull_request')
      .reply(200, () => getApiFixture(fixturesDir, 'workflow-run.list'));

    await execute(new Logger(), getOctokit(), generateContext({owner: 'hello', repo: 'world', event: 'pull_request'}, {
      payload: {
        'pull_request': {
          head: {
            ref: 'release/v1.2.3',
          },
        },
      },
    }));

    stdoutCalledWith(mockStdout, [
      '> run id: 30433643',
      '> workflow id: 30433642',
      'target event: \x1b[32;40;0mpull_request\x1b[0m',
      'target branch: \x1b[32;40;0mrelease/v1.2.3\x1b[0m',
      '',
      '> \x1b[33;40;0mnewer job exists\x1b[0m',
    ]);
  });

  it('should cancel jobs', async() => {
    process.env.INPUT_EXCLUDE_MERGED = 'true';
    process.env.GITHUB_RUN_ID        = '30433645';

    const mockStdout = spyOnStdout();
    nock('https://api.github.com')
      .get('/repos/hello/world/actions/runs/30433645')
      .reply(200, () => getApiFixture(fixturesDir, 'workflow-run.get'))
      .get('/repos/hello/world/actions/workflows/30433642/runs?status=in_progress&branch=release%2Fv1.2.3&event=pull_request')
      .reply(200, () => getApiFixture(fixturesDir, 'workflow-run.list'))
      .post('/repos/hello/world/actions/runs/30433643/cancel')
      .reply(202)
      .post('/repos/hello/world/actions/runs/30433642/cancel')
      .reply(202);

    await execute(new Logger(), getOctokit(), generateContext({owner: 'hello', repo: 'world', event: 'pull_request'}, {
      payload: {
        'pull_request': {
          head: {
            ref: 'release/v1.2.3',
          },
        },
      },
    }));

    stdoutCalledWith(mockStdout, [
      '> run id: 30433645',
      '> workflow id: 30433642',
      'target event: \x1b[32;40;0mpull_request\x1b[0m',
      'target branch: \x1b[32;40;0mrelease/v1.2.3\x1b[0m',
      '',
      '::group::Cancelling...',
      'cancel: 30433642',
      'cancel: 30433643',
      '> total: 2',
      '::endgroup::',
    ]);
  });
});
