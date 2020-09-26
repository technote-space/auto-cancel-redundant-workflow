/* eslint-disable no-magic-numbers */
import {resolve} from 'path';
import nock from 'nock';
import {Logger} from '@technote-space/github-action-log-helper';
import {testEnv, getOctokit, disableNetConnect, generateContext, getApiFixture} from '@technote-space/github-action-test-helper';
import {getWorkflowId, getWorkflowRuns, cancelWorkflowRun} from '../../src/utils/workflow';

const rootDir     = resolve(__dirname, '../..');
const fixturesDir = resolve(__dirname, '..', 'fixtures');

describe('getWorkflowId', () => {
  disableNetConnect(nock);
  testEnv(rootDir);

  it('should get workflow id', async() => {
    process.env.GITHUB_RUN_ID = '123';
    const fn                  = jest.fn();

    nock('https://api.github.com')
      .get('/repos/hello/world/actions/runs/123')
      .reply(200, () => {
        fn();
        return getApiFixture(fixturesDir, 'workflow-run.get');
      });

    expect(await getWorkflowId(getOctokit(), generateContext({owner: 'hello', repo: 'world'}))).toBe(30433642);
    expect(fn).toBeCalledTimes(1);
  });

  it('should throw error', async() => {
    process.env.GITHUB_RUN_ID = '123';

    nock('https://api.github.com')
      .get('/repos/hello/world/actions/runs/123')
      .reply(200, () => getApiFixture(fixturesDir, 'workflow-run.get.error'));

    await expect(getWorkflowId(getOctokit(), generateContext({owner: 'hello', repo: 'world'}))).rejects.toThrow('Invalid workflow run');
  });
});

describe('getWorkflowRuns', () => {
  disableNetConnect(nock);
  testEnv(rootDir);

  it('should get workflow runs', async() => {
    process.env.INPUT_EXCLUDE_MERGED = 'true';

    const fn = jest.fn();
    nock('https://api.github.com')
      .get('/repos/hello/world/actions/workflows/123/runs?status=in_progress&event=push')
      .reply(200, () => {
        fn();
        return getApiFixture(fixturesDir, 'workflow-run.list');
      });
    Logger.resetForTesting();

    const workflowRuns = await getWorkflowRuns(123, new Logger(), getOctokit(), generateContext({owner: 'hello', repo: 'world', event: 'push', ref: 'refs/tags/v1.2.3'}));

    expect(workflowRuns).toHaveLength(3);
    expect(fn).toBeCalledTimes(1);
  });
});

describe('cancelWorkflowRun', () => {
  disableNetConnect(nock);
  testEnv(rootDir);

  it('should cancel workflow run', async() => {
    const fn = jest.fn();
    nock('https://api.github.com')
      .post('/repos/hello/world/actions/runs/123/cancel')
      .reply(202, () => {
        fn();
      });

    await cancelWorkflowRun(123, getOctokit(), generateContext({owner: 'hello', repo: 'world'}));

    expect(fn).toBeCalledTimes(1);
  });
});
