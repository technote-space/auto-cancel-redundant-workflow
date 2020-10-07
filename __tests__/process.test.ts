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
  getLogStdout,
} from '@technote-space/github-action-test-helper';
import {Logger} from '@technote-space/github-action-log-helper';
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
      '::set-output name=ids::',
    ]);
  });

  it('should do nothing 2', async() => {
    process.env.GITHUB_RUN_ID = '30433643';

    const mockStdout = spyOnStdout();
    nock('https://api.github.com')
      .get('/repos/hello/world/actions/runs/30433643')
      .reply(200, () => getApiFixture(fixturesDir, 'workflow-run.get1'))
      .get('/repos/hello/world/actions/workflows/30433642/runs?status=in_progress&branch=release%2Fv1.2.3')
      .reply(200, () => getApiFixture(fixturesDir, 'workflow-run.list'));

    await execute(new Logger(), getOctokit(), generateContext({owner: 'hello', repo: 'world', event: 'push'}, {
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
      '::group::run:',
      getLogStdout({
        'id': 30433642,
        'head_branch': 'master',
        'head_sha': 'acb5820ced9479c074f688cc328bf03f341a511d',
        'run_number': 562,
        'event': 'push',
        'status': 'queued',
        'created_at': '2020-01-22T19:33:08Z',
      }),
      '::endgroup::',
      '> workflow id: 30433642',
      'target event: \x1b[32;40;0mpush\x1b[0m',
      'target branch: \x1b[32;40;0mrelease/v1.2.3\x1b[0m',
      '::group::workflow runs:',
      getLogStdout([
        {
          'id': 30433646,
          'head_branch': 'master',
          'head_sha': 'acb5820ced9479c074f688cc328bf03f341a511d',
          'run_number': 566,
          'event': 'push',
          'status': 'queued',
          'created_at': '2020-01-22T19:33:08Z',
        },
        {
          'id': 30433647,
          'head_branch': 'master',
          'head_sha': 'acb5820ced9479c074f688cc328bf03f341a511d',
          'run_number': 567,
          'event': 'push',
          'status': 'queued',
          'created_at': '2020-01-22T19:33:08Z',
        },
        {
          'id': 30433648,
          'head_branch': 'master',
          'head_sha': 'acb5820ced9479c074f688cc328bf03f341a511d',
          'run_number': 568,
          'event': 'push',
          'status': 'queued',
          'created_at': '2020-01-22T19:33:08Z',
        },
        {
          'id': 30433649,
          'head_branch': 'master',
          'head_sha': 'acb5820ced9479c074f688cc328bf03f341a511d',
          'run_number': 569,
          'event': 'push',
          'status': 'queued',
          'created_at': '2020-01-22T19:33:08Z',
        },
      ]),
      '::endgroup::',
      '',
      '> \x1b[33;40;0mnewer job exists\x1b[0m',
      '::set-output name=ids::',
    ]);
  });

  it('should do nothing 3', async() => {
    process.env.GITHUB_RUN_ID = '30433643';

    const mockStdout = spyOnStdout();
    nock('https://api.github.com')
      .get('/repos/hello/world/actions/runs/30433643')
      .reply(200, () => getApiFixture(fixturesDir, 'workflow-run.get1'))
      .get('/repos/hello/world/actions/workflows/30433642/runs?status=in_progress&branch=release%2Fv1.2.3')
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
      '::group::run:',
      getLogStdout({
        'id': 30433642,
        'head_branch': 'master',
        'head_sha': 'acb5820ced9479c074f688cc328bf03f341a511d',
        'run_number': 562,
        'event': 'push',
        'status': 'queued',
        'created_at': '2020-01-22T19:33:08Z',
      }),
      '::endgroup::',
      '> workflow id: 30433642',
      'target event: \x1b[32;40;0mpull_request\x1b[0m',
      'target branch: \x1b[32;40;0mrelease/v1.2.3\x1b[0m',
      '::group::workflow runs:',
      getLogStdout([
        {
          'id': 30433642,
          'head_branch': 'master',
          'head_sha': 'acb5820ced9479c074f688cc328bf03f341a511d',
          'run_number': 562,
          'event': 'pull_request',
          'status': 'queued',
          'created_at': '2020-01-22T19:33:08Z',
        },
        {
          'id': 30433643,
          'head_branch': 'master',
          'head_sha': 'acb5820ced9479c074f688cc328bf03f341a511d',
          'run_number': 563,
          'event': 'pull_request',
          'status': 'queued',
          'created_at': '2020-01-23T19:33:08Z',
        },
        {
          'id': 30433644,
          'head_branch': 'master',
          'head_sha': 'acb5820ced9479c074f688cc328bf03f341a511d',
          'run_number': 564,
          'event': 'pull_request',
          'status': 'queued',
          'created_at': '2020-01-24T19:33:08Z',
        },
        {
          'id': 30433645,
          'head_branch': 'master',
          'head_sha': 'acb5820ced9479c074f688cc328bf03f341a511d',
          'run_number': 565,
          'event': 'pull_request',
          'status': 'queued',
          'created_at': '2020-01-25T19:33:08Z',
        },
      ]),
      '::endgroup::',
      '',
      '> \x1b[33;40;0mnewer job exists\x1b[0m',
      '::set-output name=ids::',
    ]);
  });

  it('should cancel jobs', async() => {
    process.env.INPUT_EXCLUDE_MERGED = 'true';
    process.env.GITHUB_RUN_ID        = '30433645';

    const mockStdout = spyOnStdout();
    nock('https://api.github.com')
      .get('/repos/hello/world/actions/runs/30433645')
      .reply(200, () => getApiFixture(fixturesDir, 'workflow-run.get2'))
      .get('/repos/hello/world/actions/workflows/30433645/runs?status=in_progress&branch=release%2Fv1.2.3')
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
      '::group::run:',
      getLogStdout({
        'id': 30433645,
        'head_branch': 'master',
        'head_sha': 'acb5820ced9479c074f688cc328bf03f341a511d',
        'run_number': 562,
        'event': 'push',
        'status': 'queued',
        'created_at': '2020-01-24T19:33:08Z',
      }),
      '::endgroup::',
      '> workflow id: 30433645',
      'target event: \x1b[32;40;0mpull_request\x1b[0m',
      'target branch: \x1b[32;40;0mrelease/v1.2.3\x1b[0m',
      '::group::workflow runs:',
      getLogStdout([
        {
          'id': 30433642,
          'head_branch': 'master',
          'head_sha': 'acb5820ced9479c074f688cc328bf03f341a511d',
          'run_number': 562,
          'event': 'pull_request',
          'status': 'queued',
          'created_at': '2020-01-22T19:33:08Z',
        },
        {
          'id': 30433643,
          'head_branch': 'master',
          'head_sha': 'acb5820ced9479c074f688cc328bf03f341a511d',
          'run_number': 563,
          'event': 'pull_request',
          'status': 'queued',
          'created_at': '2020-01-23T19:33:08Z',
        },
        {
          'id': 30433645,
          'head_branch': 'master',
          'head_sha': 'acb5820ced9479c074f688cc328bf03f341a511d',
          'run_number': 565,
          'event': 'pull_request',
          'status': 'queued',
          'created_at': '2020-01-25T19:33:08Z',
        },
      ]),
      '::endgroup::',
      '',
      '::group::Cancelling...',
      'cancel: 30433642',
      'cancel: 30433643',
      '> total: 2',
      '::set-output name=ids::30433642,30433643',
      '::endgroup::',
    ]);
  });
});
