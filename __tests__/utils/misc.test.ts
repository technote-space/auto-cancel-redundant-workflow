/* eslint-disable no-magic-numbers */
import { resolve } from 'path';
import { testEnv, getOctokit, generateContext } from '@technote-space/github-action-test-helper';
import { getRunId, getTargetBranch } from '../../src/utils/misc';

const rootDir = resolve(__dirname, '../..');

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
