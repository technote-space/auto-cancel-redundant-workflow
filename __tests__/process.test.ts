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
import {Utils} from '@technote-space/github-action-helper';
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
      runId: 30433645,
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
    const mockStdout = spyOnStdout();
    nock('https://api.github.com')
      .get('/repos/hello/world/actions/runs/30433642')
      .reply(200, () => getApiFixture(fixturesDir, 'workflow-run.get.30433642'))
      .get('/repos/hello/world/actions/workflows/30433642/runs?status=in_progress&branch=release%2Fv1.2.3')
      .reply(200, () => getApiFixture(fixturesDir, 'workflow-run.list.empty'));

    await execute(new Logger(), getOctokit(), generateContext({owner: 'hello', repo: 'world', event: 'push'}, {
      runId: 30433642,
      payload: {
        'pull_request': {
          head: {
            ref: 'release/v1.2.3',
          },
        },
      },
    }));

    stdoutCalledWith(mockStdout, [
      '> run id: 30433642',
      '::group::run:',
      getLogStdout({
        'id': 30433642,
        'head_branch': 'master',
        'head_sha': 'acb5820ced9479c074f688cc328bf03f341a511d',
        'run_number': 562,
        'event': 'push',
        'status': 'queued',
        'created_at': '2020-01-22T19:33:08Z',
        'updated_at': '2020-02-22T19:33:08Z',
      }),
      '::endgroup::',
      '> workflow id: 30433642',
      'target event: \x1b[32;40mpush\x1b[0m',
      'target branch: \x1b[32;40mrelease/v1.2.3\x1b[0m',
      '::group::workflow runs:',
      getLogStdout([]),
      '::endgroup::',
      '',
      '::group::Cancelling...',
      '> total: 0',
      '::set-output name=ids::',
      '::endgroup::',
    ]);
  });

  it('should cancel jobs', async() => {
    // workflow-run.list
    // 30433642 run_number=562, updated_at=2020-02-22T19:33:08Z (re-run)          => expected to be canceled
    // 30433643 run_number=563, updated_at=2020-01-23T19:33:08Z (merge commit)    => expected to be canceled
    // 30433644 run_number=564, updated_at=2020-01-24T19:33:08Z (target run)      => expected to be canceled
    // 30433645 run_number=565, updated_at=2020-01-25T19:33:08Z                   => expected not to be canceled
    // 30433646~30433649                                        (different event) => expected not to be canceled

    const mockStdout = spyOnStdout();
    nock('https://api.github.com')
      .get('/repos/hello/world/actions/runs/30433644')
      .reply(200, () => getApiFixture(fixturesDir, 'workflow-run.get.30433644'))
      .get('/repos/hello/world/actions/workflows/30433644/runs?status=in_progress&branch=release%2Fv1.2.3')
      .reply(200, () => getApiFixture(fixturesDir, 'workflow-run.list'))
      .post('/repos/hello/world/actions/runs/30433642/cancel')
      .reply(202)
      .post('/repos/hello/world/actions/runs/30433643/cancel')
      .reply(202)
      .post('/repos/hello/world/actions/runs/30433644/cancel')
      .reply(202);

    await execute(new Logger(), getOctokit(), generateContext({owner: 'hello', repo: 'world', event: 'pull_request'}, {
      runId: 30433644,
      payload: {
        'pull_request': {
          head: {
            ref: 'release/v1.2.3',
          },
        },
      },
    }));

    stdoutCalledWith(mockStdout, [
      '> run id: 30433644',
      '::group::run:',
      getLogStdout({
        'id': 30433644,
        'head_branch': 'master',
        'head_sha': 'acb5820ced9479c074f688cc328bf03f341a511d',
        'run_number': 564,
        'event': 'push',
        'status': 'queued',
        'created_at': '2020-01-24T19:33:08Z',
        'updated_at': '2020-01-24T19:33:08Z',
      }),
      '::endgroup::',
      '> workflow id: 30433644',
      'target event: \x1b[32;40mpull_request\x1b[0m',
      'target branch: \x1b[32;40mrelease/v1.2.3\x1b[0m',
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
          'updated_at': '2020-02-22T19:33:08Z',
        },
        {
          'id': 30433643,
          'head_branch': 'master',
          'head_sha': 'acb5820ced9479c074f688cc328bf03f341a511d',
          'run_number': 563,
          'event': 'pull_request',
          'status': 'queued',
          'created_at': '2020-01-23T19:33:08Z',
          'updated_at': '2020-01-23T19:33:08Z',
        },
        {
          'id': 30433644,
          'head_branch': 'master',
          'head_sha': 'acb5820ced9479c074f688cc328bf03f341a511d',
          'run_number': 564,
          'event': 'pull_request',
          'status': 'queued',
          'created_at': '2020-01-24T19:33:08Z',
          'updated_at': '2020-01-24T19:33:08Z',
        },
        {
          'id': 30433645,
          'head_branch': 'master',
          'head_sha': 'acb5820ced9479c074f688cc328bf03f341a511d',
          'run_number': 565,
          'event': 'pull_request',
          'status': 'queued',
          'created_at': '2020-01-25T19:33:08Z',
          'updated_at': '2020-01-25T19:33:08Z',
        },
      ]),
      '::endgroup::',
      '',
      '::group::Cancelling...',
      'cancel: 30433642',
      'cancel: 30433643',
      'cancel: 30433644',
      '> total: 3',
      '::set-output name=ids::30433642,30433643,30433644',
      '::endgroup::',
    ]);
  });

  it('should cancel jobs (consider re-run, set interval)', async() => {
    // workflow-run.list
    // 30433642 run_number=562, updated_at=2020-02-22T19:33:08Z (re-run)          => expected not to be canceled
    // 30433643 run_number=563, updated_at=2020-01-23T19:33:08Z (merge commit)    => expected not to be canceled
    // 30433644 run_number=564, updated_at=2020-01-24T19:33:08Z (target run)      => expected to be canceled
    // 30433645 run_number=565, updated_at=2020-01-25T19:33:08Z                   => expected not to be canceled
    // 30433646~30433649                                        (different event) => expected not to be canceled

    process.env.INPUT_EXCLUDE_MERGED  = 'true';
    process.env.INPUT_CONSIDER_RE_RUN = 'true';
    process.env.INPUT_INTERVAL_MS     = '123';

    const sleepFn = jest.fn();
    jest.spyOn(Utils, 'sleep').mockImplementation(sleepFn);

    const mockStdout = spyOnStdout();
    nock('https://api.github.com')
      .get('/repos/hello/world/actions/runs/30433644')
      .reply(200, () => getApiFixture(fixturesDir, 'workflow-run.get.30433644'))
      .get('/repos/hello/world/actions/workflows/30433644/runs?status=in_progress&branch=release%2Fv1.2.3')
      .reply(200, () => getApiFixture(fixturesDir, 'workflow-run.list'))
      .post('/repos/hello/world/actions/runs/30433644/cancel')
      .reply(202);

    await execute(new Logger(), getOctokit(), generateContext({owner: 'hello', repo: 'world', event: 'pull_request'}, {
      runId: 30433644,
      payload: {
        'pull_request': {
          head: {
            ref: 'release/v1.2.3',
          },
        },
      },
    }));

    stdoutCalledWith(mockStdout, [
      '> run id: 30433644',
      '::group::run:',
      getLogStdout({
        'id': 30433644,
        'head_branch': 'master',
        'head_sha': 'acb5820ced9479c074f688cc328bf03f341a511d',
        'run_number': 564,
        'event': 'push',
        'status': 'queued',
        'created_at': '2020-01-24T19:33:08Z',
        'updated_at': '2020-01-24T19:33:08Z',
      }),
      '::endgroup::',
      '> workflow id: 30433644',
      'target event: \x1b[32;40mpull_request\x1b[0m',
      'target branch: \x1b[32;40mrelease/v1.2.3\x1b[0m',
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
          'updated_at': '2020-02-22T19:33:08Z',
        },
        {
          'id': 30433644,
          'head_branch': 'master',
          'head_sha': 'acb5820ced9479c074f688cc328bf03f341a511d',
          'run_number': 564,
          'event': 'pull_request',
          'status': 'queued',
          'created_at': '2020-01-24T19:33:08Z',
          'updated_at': '2020-01-24T19:33:08Z',
        },
        {
          'id': 30433645,
          'head_branch': 'master',
          'head_sha': 'acb5820ced9479c074f688cc328bf03f341a511d',
          'run_number': 565,
          'event': 'pull_request',
          'status': 'queued',
          'created_at': '2020-01-25T19:33:08Z',
          'updated_at': '2020-01-25T19:33:08Z',
        },
      ]),
      '::endgroup::',
      '',
      '::group::Cancelling...',
      'cancel: 30433644',
      '> total: 1',
      '::set-output name=ids::30433644',
      '::endgroup::',
    ]);

    expect(sleepFn).toBeCalledWith(123);
  });
});
