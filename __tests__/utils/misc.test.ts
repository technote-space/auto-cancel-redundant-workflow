/* eslint-disable no-magic-numbers */
import nock from 'nock';
import { resolve } from 'path';
import { disableNetConnect, testEnv, getOctokit, generateContext, getApiFixture } from '@technote-space/github-action-test-helper';
import { getRunId, getTargetBranch } from '../../src/utils/misc';

const rootDir     = resolve(__dirname, '../..');
const fixturesDir = resolve(__dirname, '..', 'fixtures');

describe('getRunId', () => {
	testEnv(rootDir);

	it('get run id', () => {
		process.env.GITHUB_RUN_ID = '123';

		expect(getRunId()).toBe(123);
	});
});

describe('getTargetBranch', () => {
	disableNetConnect(nock);
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

	it('should get related pr head ref', async() => {
		nock('https://api.github.com')
			.get('/repos/hello/world/pulls?head=hello%3Arelease%2Fv1.2.3')
			.reply(200, () => getApiFixture(fixturesDir, 'pulls.list'));

		expect(await getTargetBranch(getOctokit(), generateContext({owner: 'hello', repo: 'world', ref: 'refs/heads/release/v1.2.3'}, {
			payload: {
				repository: {
					'default_branch': 'master',
				},
			},
		}))).toBe('release/v1.2.3');
	});

	it('should get default branch 1', async() => {
		nock('https://api.github.com')
			.get('/repos/hello/world/pulls?head=hello%3Afeature%2Fchange')
			.reply(200, () => []);

		expect(await getTargetBranch(getOctokit(), generateContext({owner: 'hello', repo: 'world', ref: 'refs/heads/feature/change'}, {
			payload: {
				repository: {
					'default_branch': 'master',
				},
			},
		}))).toBe('master');
	});

	it('should get default branch 2', async() => {
		expect(await getTargetBranch(getOctokit(), generateContext({owner: 'hello', repo: 'world', ref: 'refs/heads/master'}, {
			payload: {
				repository: {
					'default_branch': 'master',
				},
			},
		}))).toBe('master');
	});
});
