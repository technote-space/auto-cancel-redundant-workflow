/* eslint-disable no-magic-numbers */
import { resolve } from 'path';
import nock from 'nock';
import { testEnv, getOctokit, disableNetConnect, generateContext, getApiFixture } from '@technote-space/github-action-test-helper';
import { getIssues } from '../../src/utils/issue';

const rootDir     = resolve(__dirname, '../..');
const fixturesDir = resolve(__dirname, '..', 'fixtures');

describe('getIssues', () => {
	disableNetConnect(nock);
	testEnv(rootDir);

	it('should get issues', async() => {
		nock('https://api.github.com')
			.get('/repos/hello/world/issues')
			.reply(200, () => getApiFixture(fixturesDir, 'issues.get'));

		const issues = await getIssues(getOctokit(), generateContext({owner: 'hello', repo: 'world'}));

		expect(issues).toHaveLength(2);
		expect(issues[0].id).toBe(1);
		expect(issues[1].id).toBe(3);
	});
});
