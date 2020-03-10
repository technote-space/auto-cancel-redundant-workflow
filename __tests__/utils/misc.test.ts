/* eslint-disable no-magic-numbers */
import { testEnv } from '@technote-space/github-action-test-helper';
import { getRunId } from '../../src/utils/misc';

describe('getRunId', () => {
	testEnv();

	it('get run id', () => {
		process.env.GITHUB_RUN_ID = '123';

		expect(getRunId()).toBe(123);
	});
});
